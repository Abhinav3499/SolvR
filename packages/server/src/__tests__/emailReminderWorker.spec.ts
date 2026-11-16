import { describe, it, expect } from 'vitest';
import {
  generateReminderEmailHtml,
  processSpacedRepetitionReminders,
} from '../workers/emailReminderWorker.js';

describe('emailReminderWorker', () => {
  it('generates a well-formed HTML reminder email template', () => {
    const dueQuestions = [
      { title: 'Two Sum', difficulty: 'Easy', link: 'https://leetcode.com/problems/two-sum/' },
      { title: 'Course Schedule', difficulty: 'Medium', link: 'https://leetcode.com/problems/course-schedule/' },
    ];
    const unsubUrl = 'https://solvr.dev/unsubscribe?token=sample-token-123';

    const html = generateReminderEmailHtml('Abhinav', dueQuestions, unsubUrl);

    expect(html).toContain('Two Sum');
    expect(html).toContain('Course Schedule');
    expect(html).toContain('Hi Abhinav');
    expect(html).toContain(unsubUrl);
    expect(html).toContain('Spaced Repetition Due');
  });

  it('handles offline or unconfigured environment gracefully', async () => {
    const result = await processSpacedRepetitionReminders({ dryRun: true });
    expect(['completed', 'offline_noop']).toContain(result.status);
  });
});
