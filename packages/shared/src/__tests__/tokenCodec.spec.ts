import { describe, it, expect } from 'vitest';
import { encodeProblemTokens, decodeProblemTokens } from '../codecs/tokenCodec.js';
import { compressPayload, decompressPayload } from '../codecs/compressor.js';

describe('Shared Codecs - tokenCodec & compressor', () => {
  it('encodes and decodes problem tokens accurately', () => {
    const questions = [
      { id: '1', title: 'Two Sum', platform: 'LeetCode', topic: 'Arrays', difficulty: 'Easy' },
      { id: '15', title: '3Sum', platform: 'LeetCode', topic: 'Two Pointers', difficulty: 'Medium' },
      { id: '158A', title: 'Next Round', platform: 'Codeforces', topic: 'Implementation', difficulty: 'Easy' },
      { id: '42', title: 'Trapping Rain Water', platform: 'LeetCode', topic: 'Dynamic Programming', difficulty: 'Hard' },
    ];

    const encoded = encodeProblemTokens(questions);
    expect(encoded).toBe('LC:1:Arrays:1,LC:15:Two Pointers:2,CF:158A:Implementation:1,LC:42:Dynamic Programming:3');

    const decoded = decodeProblemTokens(encoded);
    expect(decoded).toHaveLength(4);
    expect(decoded[0]).toEqual({
      platform: 'LeetCode',
      id: '1',
      topic: 'Arrays',
      difficulty: 'Easy',
    });
    expect(decoded[2]).toEqual({
      platform: 'Codeforces',
      id: '158A',
      topic: 'Implementation',
      difficulty: 'Easy',
    });
    expect(decoded[3]).toEqual({
      platform: 'LeetCode',
      id: '42',
      topic: 'Dynamic Programming',
      difficulty: 'Hard',
    });
  });

  it('handles empty and malformed input gracefully', () => {
    expect(encodeProblemTokens([])).toBe('');
    expect(decodeProblemTokens('')).toEqual([]);
    expect(decodeProblemTokens('garbage:token')).toEqual([]);
    expect(decodeProblemTokens('LC:1:DP:1,invalid,CF:2:Math:2')).toHaveLength(2);
  });

  it('compresses and decompresses with lz-string faithfully', () => {
    const rawTokens = 'LC:1:Arrays:1,LC:15:Two Pointers:2,CF:158A:Implementation:1,LC:42:Dynamic Programming:3';
    const compressed = compressPayload(rawTokens);

    expect(typeof compressed).toBe('string');
    expect(compressed.length).toBeGreaterThan(0);

    const decompressed = decompressPayload(compressed);
    expect(decompressed).toBe(rawTokens);
  });
});
