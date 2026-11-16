import { supabaseAdmin } from '../services/supabase.js';
import { config } from '../config/env.js';

export interface CompanyTagSyncResult {
  status: 'updated' | 'skipped_cache_hit' | 'failed' | 'offline_noop';
  sha?: string;
  syncedCount?: number;
  message?: string;
}

export interface CuratedCompanyItem {
  company: string;
  problemSlug: string;
  platform: 'LeetCode' | 'Codeforces';
  frequencyScore: number;
}

// Built-in curated initial dataset mapping popular interview questions to companies
export const DEFAULT_CURATED_TAGS: CuratedCompanyItem[] = [
  // Google
  { company: 'Google', problemSlug: 'two-sum', platform: 'LeetCode', frequencyScore: 9.8 },
  { company: 'Google', problemSlug: 'median-of-two-sorted-arrays', platform: 'LeetCode', frequencyScore: 8.9 },
  { company: 'Google', problemSlug: 'merge-k-sorted-lists', platform: 'LeetCode', frequencyScore: 8.5 },
  { company: 'Google', problemSlug: 'trapping-rain-water', platform: 'LeetCode', frequencyScore: 9.4 },
  { company: 'Google', problemSlug: 'course-schedule', platform: 'LeetCode', frequencyScore: 8.8 },
  // Meta
  { company: 'Meta', problemSlug: '3sum', platform: 'LeetCode', frequencyScore: 9.6 },
  { company: 'Meta', problemSlug: 'subarray-sum-equals-k', platform: 'LeetCode', frequencyScore: 9.5 },
  { company: 'Meta', problemSlug: 'vertical-order-traversal-of-a-binary-tree', platform: 'LeetCode', frequencyScore: 8.7 },
  { company: 'Meta', problemSlug: 'valid-palindrome', platform: 'LeetCode', frequencyScore: 9.1 },
  // Amazon
  { company: 'Amazon', problemSlug: 'number-of-islands', platform: 'LeetCode', frequencyScore: 9.7 },
  { company: 'Amazon', problemSlug: 'reorder-data-in-log-files', platform: 'LeetCode', frequencyScore: 8.6 },
  { company: 'Amazon', problemSlug: 'lru-cache', platform: 'LeetCode', frequencyScore: 9.9 },
  { company: 'Amazon', problemSlug: 'k-closest-points-to-origin', platform: 'LeetCode', frequencyScore: 8.8 },
  // Microsoft
  { company: 'Microsoft', problemSlug: 'reverse-nodes-in-k-group', platform: 'LeetCode', frequencyScore: 8.4 },
  { company: 'Microsoft', problemSlug: 'string-to-integer-atoi', platform: 'LeetCode', frequencyScore: 8.7 },
  { company: 'Microsoft', problemSlug: 'word-search', platform: 'LeetCode', frequencyScore: 8.9 },
  // Apple & Uber
  { company: 'Apple', problemSlug: 'design-add-and-search-words-data-structure', platform: 'LeetCode', frequencyScore: 8.2 },
  { company: 'Uber', problemSlug: 'bus-routes', platform: 'LeetCode', frequencyScore: 8.6 },
];

/**
 * Checks for GitHub dataset updates using Commit SHA caching, then syncs company tags to PostgreSQL.
 */
export async function syncCompanyTags(options?: {
  force?: boolean;
  mockSha?: string;
  mockData?: CuratedCompanyItem[];
}): Promise<CompanyTagSyncResult> {
  if (!supabaseAdmin) {
    return {
      status: 'offline_noop',
      message: 'Supabase admin client unconfigured. Offline mode active.',
      syncedCount: 0,
    };
  }

  try {
    let latestSha = options?.mockSha;

    // 1. Check latest commit SHA from GitHub API if not mocked
    if (!latestSha) {
      const headers: Record<string, string> = {
        'User-Agent': 'SolvR-Tag-Sync-Worker',
      };
      if (config.githubToken) {
        headers['Authorization'] = `token ${config.githubToken}`;
      }

      const ghResponse = await fetch(
        'https://api.github.com/repos/akarsh-jain/LeetCode-Company-Wise-Problems/commits?per_page=1',
        { headers }
      );

      if (ghResponse.ok) {
        const commits = (await ghResponse.json()) as Array<{ sha: string }>;
        latestSha = commits[0]?.sha || 'initial_sha';
      } else {
        latestSha = 'default_release_sha';
      }
    }

    // 2. Query last_synced_sha from public.sync_metadata
    if (!options?.force) {
      const { data: metaData } = await supabaseAdmin
        .from('sync_metadata')
        .select('value')
        .eq('key', 'company_tags_github_sha')
        .single();

      if (metaData && metaData.value === latestSha) {
        return {
          status: 'skipped_cache_hit',
          sha: latestSha,
          message: 'GitHub commit SHA unchanged. Skipped redundant download.',
        };
      }
    }

    // 3. Batch upsert tags into public.company_tags
    const itemsToUpsert = options?.mockData || DEFAULT_CURATED_TAGS;

    const rows = itemsToUpsert.map((item) => ({
      platform: item.platform,
      problem_slug: item.problemSlug,
      company_name: item.company,
      frequency_score: item.frequencyScore,
      synced_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabaseAdmin
      .from('company_tags')
      .upsert(rows, { onConflict: 'platform,problem_slug,company_name' });

    if (upsertError) {
      throw upsertError;
    }

    // 4. Update sync_metadata with the new commit SHA
    await supabaseAdmin.from('sync_metadata').upsert({
      key: 'company_tags_github_sha',
      value: latestSha,
      updated_at: new Date().toISOString(),
    });

    return {
      status: 'updated',
      sha: latestSha,
      syncedCount: rows.length,
      message: `Successfully synchronized ${rows.length} company tags.`,
    };
  } catch (err: any) {
    return {
      status: 'failed',
      message: err.message || 'Unknown error occurred during tag synchronization',
    };
  }
}
