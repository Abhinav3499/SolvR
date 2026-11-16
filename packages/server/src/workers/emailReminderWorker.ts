import { Resend } from 'resend';
import { supabaseAdmin } from '../services/supabase.js';
import { config } from '../config/env.js';

export interface ReminderJobResult {
  status: 'completed' | 'offline_noop' | 'failed';
  usersProcessed: number;
  emailsDispatched: number;
  notificationsCreated: number;
  message?: string;
}

export function generateReminderEmailHtml(
  userName: string,
  dueQuestions: Array<{ title: string; difficulty: string; link: string; lastPracticedAt?: string }>,
  unsubscribeUrl: string
): string {
  const questionRows = dueQuestions
    .slice(0, 5)
    .map(
      (q) => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
      <td style="padding: 10px 0; font-weight: 600; color: #f8fafc;">${q.title}</td>
      <td style="padding: 10px 0; color: #94a3b8;">${q.difficulty}</td>
      <td style="padding: 10px 0; text-align: right;">
        <a href="${q.link || 'https://leetcode.com'}" style="color: #38bdf8; text-decoration: none; font-weight: 600; font-size: 13px;">Solve ↗</a>
      </td>
    </tr>`
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0f172a; color: #ffffff; padding: 24px; margin: 0;">
      <div style="max-width: 540px; margin: 0 auto; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 24px;">
        <h2 style="margin-top: 0; color: #ffffff; font-size: 20px;">⏰ 7-Day Spaced Repetition Due</h2>
        <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">
          Hi ${userName}, you have <strong>${dueQuestions.length}</strong> problem(s) marked for revision that haven't been practiced in the last 7 days. Quick algorithmic recall preserves problem-solving intuition!
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 13px;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.15); color: #64748b; text-align: left;">
              <th style="padding-bottom: 8px;">Problem</th>
              <th style="padding-bottom: 8px;">Difficulty</th>
              <th style="padding-bottom: 8px; text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            ${questionRows}
          </tbody>
        </table>

        <div style="margin-top: 24px; text-align: center;">
          <a href="https://solvr.dev" style="background: linear-gradient(135deg, #10b981, #06b6d4); color: #ffffff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block;">
            Open SolvR Dashboard
          </a>
        </div>

        <p style="margin-top: 30px; font-size: 11px; color: #64748b; text-align: center;">
          You received this email because you opted in to SolvR spaced repetition reminders.
          <br>
          <a href="${unsubscribeUrl}" style="color: #64748b; text-decoration: underline;">Unsubscribe from email digests</a>
        </p>
      </div>
    </body>
  </html>
  `;
}

/**
 * Scans for users whose configured reminder hour matches targetHourUtc and dispatches reminder digests.
 */
export async function processSpacedRepetitionReminders(options?: {
  targetHourUtc?: number;
  dryRun?: boolean;
}): Promise<ReminderJobResult> {
  if (!supabaseAdmin) {
    return {
      status: 'offline_noop',
      usersProcessed: 0,
      emailsDispatched: 0,
      notificationsCreated: 0,
      message: 'Supabase admin unconfigured. Offline mode active.',
    };
  }

  const currentHour = options?.targetHourUtc ?? new Date().getUTCHours();
  let emailsDispatched = 0;
  let notificationsCreated = 0;

  try {
    // 1. Fetch eligible user notification settings
    const { data: settingsList, error: settingsError } = await supabaseAdmin
      .from('user_notification_settings')
      .select('user_id, email_reminders_enabled, preferred_reminder_hour_utc, unsubscribe_token')
      .eq('email_reminders_enabled', true)
      .eq('preferred_reminder_hour_utc', currentHour);

    if (settingsError || !settingsList || settingsList.length === 0) {
      return {
        status: 'completed',
        usersProcessed: 0,
        emailsDispatched: 0,
        notificationsCreated: 0,
        message: 'No eligible users scheduled for the current UTC hour.',
      };
    }

    const resend = config.resendApiKey ? new Resend(config.resendApiKey) : null;

    for (const setting of settingsList) {
      // 2. Query due questions for this user
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: questions } = await supabaseAdmin
        .from('questions')
        .select('id, title, difficulty, link, last_practiced_at')
        .eq('user_id', setting.user_id)
        .or(`is_revision.eq.true,is_starred.eq.true`)
        .or(`last_practiced_at.is.null,last_practiced_at.lte.${sevenDaysAgo}`);

      if (questions && questions.length > 0) {
        // Fetch user profile email
        const { data: profile } = await supabaseAdmin
          .from('profiles')
          .select('display_name, username')
          .eq('id', setting.user_id)
          .single();

        const displayName = profile?.display_name || profile?.username || 'Coder';

        // 3. Create in-app notification row
        await supabaseAdmin.from('notifications').insert({
          user_id: setting.user_id,
          type: 'spaced_repetition',
          title: `Revision Due: ${questions.length} problem(s)`,
          body: `Time to review ${questions[0].title}${questions.length > 1 ? ` and ${questions.length - 1} others` : ''}.`,
          action_url: questions[0].link || '',
          is_read: false,
        });
        notificationsCreated++;

        // 4. Dispatch email via Resend if API key is provided and not dry-run
        if (resend && !options?.dryRun) {
          const { data: userData } = await supabaseAdmin.auth.admin.getUserById(setting.user_id);
          const email = userData?.user?.email;

          if (email) {
            const unsubUrl = `https://solvr.dev/unsubscribe?token=${setting.unsubscribe_token}`;
            const htmlContent = generateReminderEmailHtml(displayName, questions, unsubUrl);

            await resend.emails.send({
              from: 'SolvR <reminders@solvr.dev>',
              to: email,
              subject: `⏰ ${questions.length} Problem(s) Due for Spaced Repetition Review`,
              html: htmlContent,
              headers: {
                'List-Unsubscribe': `<${unsubUrl}>`,
              },
            });
            emailsDispatched++;
          }
        }
      }
    }

    return {
      status: 'completed',
      usersProcessed: settingsList.length,
      emailsDispatched,
      notificationsCreated,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error occurred';
    return {
      status: 'failed',
      usersProcessed: 0,
      emailsDispatched,
      notificationsCreated,
      message,
    };
  }
}
