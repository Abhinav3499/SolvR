import type { DecodedProblemToken } from '../types/sharing.js';

const PLATFORM_TO_CODE: Record<string, string> = {
  LeetCode: 'LC',
  Codeforces: 'CF',
  HackerRank: 'HR',
  GeeksforGeeks: 'GFG',
  CodeChef: 'CC',
  Other: 'OTH',
};

const CODE_TO_PLATFORM: Record<string, string> = {
  LC: 'LeetCode',
  CF: 'Codeforces',
  HR: 'HackerRank',
  GFG: 'GeeksforGeeks',
  CC: 'CodeChef',
  OTH: 'Other',
};

const DIFFICULTY_TO_CODE: Record<string, string> = {
  Easy: '1',
  Medium: '2',
  Hard: '3',
};

const CODE_TO_DIFFICULTY: Record<string, string> = {
  '1': 'Easy',
  '2': 'Medium',
  '3': 'Hard',
};

export interface ProblemItemToEncode {
  platform?: string;
  id?: string;
  title?: string;
  topic?: string;
  difficulty?: string;
}

/**
 * Encodes problem items into a compact token string.
 * Format: PLATFORM:ID_OR_TITLE:TOPIC:DIFFICULTY
 * Multiple problems separated by comma ','
 */
export function encodeProblemTokens(items: ProblemItemToEncode[]): string {
  if (!items || items.length === 0) return '';

  return items
    .map((item) => {
      const platCode = PLATFORM_TO_CODE[item.platform || 'LeetCode'] || 'LC';
      const rawId = (item.id || item.title || 'unknown').replace(/[:;,]/g, '_');
      const topic = (item.topic || 'General').replace(/[:;,]/g, '_');
      const diffCode = DIFFICULTY_TO_CODE[item.difficulty || 'Medium'] || '2';
      return `${platCode}:${rawId}:${topic}:${diffCode}`;
    })
    .join(',');
}

/**
 * Decodes a token string back into structured problem objects.
 */
export function decodeProblemTokens(tokenString: string): DecodedProblemToken[] {
  if (!tokenString || !tokenString.trim()) return [];

  const tokens = tokenString.split(',');
  const results: DecodedProblemToken[] = [];

  for (const token of tokens) {
    const parts = token.trim().split(':');
    if (parts.length >= 4) {
      const plat = CODE_TO_PLATFORM[parts[0]] || 'Other';
      const id = parts[1];
      const topic = parts[2];
      const diff = CODE_TO_DIFFICULTY[parts[3]] || 'Medium';
      results.push({
        platform: plat,
        id,
        topic,
        difficulty: diff,
      });
    }
  }

  return results;
}
