import { Queue, Worker } from 'bullmq';
import { redisConnection } from '../services/redis.js';
import { syncCompanyTags } from '../workers/companyTagsWorker.js';
import { processSpacedRepetitionReminders } from '../workers/emailReminderWorker.js';
import { config } from '../config/env.js';

export let companyTagsQueue: Queue | null = null;
export let emailRemindersQueue: Queue | null = null;
export let companyTagsWorker: Worker | null = null;
export let emailRemindersWorker: Worker | null = null;

export async function initializeQueuesAndWorkers(): Promise<void> {
  // Graceful degradation if Redis is unavailable in offline/local environments
  try {
    const queueOpts = { connection: redisConnection };

    companyTagsQueue = new Queue('company-tags-sync', queueOpts);
    emailRemindersQueue = new Queue('email-reminders', queueOpts);

    // 1. Setup repeatable daily cron for company tags (03:00 UTC)
    await companyTagsQueue.add(
      'daily-tag-sync',
      {},
      {
        repeat: { pattern: '0 3 * * *' },
        removeOnComplete: true,
      }
    );

    // 2. Setup repeatable hourly cron for revision reminders
    await emailRemindersQueue.add(
      'hourly-reminder-check',
      {},
      {
        repeat: { pattern: '0 * * * *' },
        removeOnComplete: true,
      }
    );

    // 3. Worker for company tag sync
    companyTagsWorker = new Worker(
      'company-tags-sync',
      async () => {
        return await syncCompanyTags();
      },
      queueOpts
    );

    // 4. Worker for email reminders
    emailRemindersWorker = new Worker(
      'email-reminders',
      async () => {
        return await processSpacedRepetitionReminders();
      },
      queueOpts
    );

    if (config.nodeEnv !== 'test') {
      console.log('[Queue] BullMQ queues and worker schedules initialized.');
    }
  } catch (err: any) {
    if (config.nodeEnv !== 'test') {
      console.warn('[Queue] Skipped BullMQ daemon activation (offline/local mode):', err.message);
    }
  }
}

export async function closeQueuesAndWorkers(): Promise<void> {
  await companyTagsWorker?.close();
  await emailRemindersWorker?.close();
  await companyTagsQueue?.close();
  await emailRemindersQueue?.close();
}
