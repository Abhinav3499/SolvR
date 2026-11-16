import {
  encodeProblemTokens,
  decodeProblemTokens,
  compressPayload,
  decompressPayload,
} from '@solvr/shared';
import type { Question } from '@solvr/shared';

export interface SharePayloadModel {
  v: number;
  t: string; // title
  c?: string; // creator
  d: number; // created date
  p: string; // encoded tokens
}

export interface DecodedSharedSheetResult {
  title: string;
  creatorName: string;
  createdAt: number;
  questions: Array<{
    title: string;
    platform: string;
    topic: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    id: string;
  }>;
}

/**
 * Generates a shareable URL for a collection of questions.
 * Encodes into a compact URL hash string using dictionary tokenization and lz-string.
 */
export async function generateShareLink(
  questions: Question[],
  title = 'My Practice Sheet',
  creatorName = 'Anonymous'
): Promise<string> {
  const tokenString = encodeProblemTokens(
    questions.map((q) => ({
      platform: q.platform || 'LeetCode',
      id: q.id,
      title: q.title,
      topic: q.tags?.[0] || 'General',
      difficulty: q.difficulty,
    }))
  );

  const payload: SharePayloadModel = {
    v: 1,
    t: title,
    c: creatorName,
    d: Date.now(),
    p: tokenString,
  };

  const rawJson = JSON.stringify(payload);
  const compressed = compressPayload(rawJson);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://solvr.dev';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';

  return `${origin}${pathname}#share=${compressed}`;
}

/**
 * Parses and decodes a share link from a URL hash string or full URL.
 */
export function parseShareLink(hashOrUrl: string): DecodedSharedSheetResult | null {
  if (!hashOrUrl) return null;

  let hash = hashOrUrl;
  if (hash.includes('#')) {
    hash = hash.split('#')[1] || '';
  }

  const prefix = hash.startsWith('share=') ? 'share=' : hash.startsWith('data=') ? 'data=' : null;
  if (!prefix) return null;

  const compressed = hash.substring(prefix.length);
  if (!compressed) return null;

  try {
    const rawJson = decompressPayload(compressed);
    if (!rawJson) return null;

    const payload: SharePayloadModel = JSON.parse(rawJson);
    const decodedTokens = decodeProblemTokens(payload.p || '');

    return {
      title: payload.t || 'Shared Practice Sheet',
      creatorName: payload.c || 'Anonymous',
      createdAt: payload.d || Date.now(),
      questions: decodedTokens.map((tok) => ({
        title: tok.id.replace(/_/g, ' '),
        platform: tok.platform,
        topic: tok.topic.replace(/_/g, ' '),
        difficulty: (tok.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium',
        id: tok.id,
      })),
    };
  } catch {
    return null;
  }
}
