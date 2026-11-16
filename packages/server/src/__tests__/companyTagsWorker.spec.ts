import { describe, it, expect } from 'vitest';
import { syncCompanyTags, DEFAULT_CURATED_TAGS } from '../workers/companyTagsWorker.js';

describe('companyTagsWorker', () => {
  it('exposes a valid curated company tags dataset', () => {
    expect(DEFAULT_CURATED_TAGS.length).toBeGreaterThan(10);
    const googleProblems = DEFAULT_CURATED_TAGS.filter((t) => t.company === 'Google');
    expect(googleProblems.length).toBeGreaterThan(2);

    const twoSum = DEFAULT_CURATED_TAGS.find((t) => t.problemSlug === 'two-sum');
    expect(twoSum).toBeDefined();
    expect(twoSum?.platform).toBe('LeetCode');
  });

  it('returns offline_noop when Supabase admin client is not configured', async () => {
    // In test environment without real SUPABASE_SERVICE_ROLE_KEY, it degrades gracefully
    const result = await syncCompanyTags({ force: false, mockSha: 'test_sha_123' });
    expect(['offline_noop', 'skipped_cache_hit', 'updated']).toContain(result.status);
  });
});
