import { describe, it, expect } from 'vitest';
import { generateShareLink, parseShareLink } from '../shareUrl';
import type { Question } from '@solvr/shared';

describe('shareUrl utility', () => {
  const sampleQuestions: Question[] = [
    {
      id: 'two-sum',
      title: 'Two Sum',
      difficulty: 'Easy',
      platform: 'LeetCode',
      tags: ['Arrays'],
    },
    {
      id: '3sum',
      title: '3Sum',
      difficulty: 'Medium',
      platform: 'LeetCode',
      tags: ['Two Pointers'],
    },
    {
      id: '158A',
      title: 'Next Round',
      difficulty: 'Easy',
      platform: 'Codeforces',
      tags: ['Implementation'],
    },
  ];

  it('generates a shareable URL containing the hash', async () => {
    const link = await generateShareLink(sampleQuestions, 'NeetCode Top 3', 'Abhinav');
    expect(link).toContain('#share=');
  });

  it('roundtrip parses the generated link back into structured sheet data', async () => {
    const link = await generateShareLink(sampleQuestions, 'NeetCode Top 3', 'Abhinav');
    const parsed = parseShareLink(link);

    expect(parsed).not.toBeNull();
    expect(parsed?.title).toBe('NeetCode Top 3');
    expect(parsed?.creatorName).toBe('Abhinav');
    expect(parsed?.questions).toHaveLength(3);
    expect(parsed?.questions[0]).toEqual({
      id: 'two-sum',
      title: 'two-sum',
      platform: 'LeetCode',
      topic: 'Arrays',
      difficulty: 'Easy',
    });
    expect(parsed?.questions[2]).toEqual({
      id: '158A',
      title: '158A',
      platform: 'Codeforces',
      topic: 'Implementation',
      difficulty: 'Easy',
    });
  });

  it('returns null on empty, invalid, or corrupted links', () => {
    expect(parseShareLink('')).toBeNull();
    expect(parseShareLink('https://solvr.dev/')).toBeNull();
    expect(parseShareLink('#share=invalid_payload_characters')).toBeNull();
  });
});
