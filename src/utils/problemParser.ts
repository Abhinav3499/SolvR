import type { Difficulty } from '../types'

export interface ParsedProblemInfo {
  title: string
  link: string
  platform: 'LeetCode' | 'Codeforces' | 'GeeksforGeeks' | 'HackerRank' | 'Other'
  difficulty: Difficulty
  tags: string[]
}

/**
 * Converts a slug like 'two-sum' or 'trapping-rain-water' into 'Two Sum' or 'Trapping Rain Water'
 */
export function slugToTitle(slug: string): string {
  if (!slug) return ''
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Automatically parses a competitive programming / DSA URL into structured problem details
 */
export function parseProblemUrl(rawUrl: string): ParsedProblemInfo {
  const url = rawUrl.trim()
  
  // 1. LeetCode: https://leetcode.com/problems/longest-substring-without-repeating-characters/
  const leetcodeMatch = url.match(/leetcode\.com\/problems\/([a-zA-Z0-9-]+)/i)
  if (leetcodeMatch) {
    const slug = leetcodeMatch[1]
    const title = slugToTitle(slug)
    return {
      title,
      link: `https://leetcode.com/problems/${slug}/`,
      platform: 'LeetCode',
      difficulty: 'Medium', // default estimate
      tags: ['LeetCode']
    }
  }

  // 2. Codeforces Contest: https://codeforces.com/contest/158/problem/A
  const cfContestMatch = url.match(/codeforces\.com\/contest\/([0-9]+)\/problem\/([a-zA-Z0-9]+)/i)
  if (cfContestMatch) {
    const contestId = cfContestMatch[1]
    const problemIndex = cfContestMatch[2].toUpperCase()
    return {
      title: `CF ${contestId}${problemIndex}`,
      link: `https://codeforces.com/contest/${contestId}/problem/${problemIndex}`,
      platform: 'Codeforces',
      difficulty: 'Medium',
      tags: ['Codeforces', `CF-${contestId}`]
    }
  }

  // 3. Codeforces Problemset: https://codeforces.com/problemset/problem/4/A
  const cfProblemsetMatch = url.match(/codeforces\.com\/problemset\/problem\/([0-9]+)\/([a-zA-Z0-9]+)/i)
  if (cfProblemsetMatch) {
    const contestId = cfProblemsetMatch[1]
    const problemIndex = cfProblemsetMatch[2].toUpperCase()
    return {
      title: `CF ${contestId}${problemIndex}`,
      link: `https://codeforces.com/problemset/problem/${contestId}/${problemIndex}`,
      platform: 'Codeforces',
      difficulty: 'Medium',
      tags: ['Codeforces', `CF-${contestId}`]
    }
  }

  // 4. GeeksforGeeks: https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1
  const gfgMatch = url.match(/geeksforgeeks\.org\/problems\/([a-zA-Z0-9-]+)/i)
  if (gfgMatch) {
    const rawSlug = gfgMatch[1].replace(/-[0-9]+$/, '') // strip numeric ids if any
    const title = slugToTitle(rawSlug)
    return {
      title: title || 'GeeksforGeeks Problem',
      link: url,
      platform: 'GeeksforGeeks',
      difficulty: 'Medium',
      tags: ['GeeksforGeeks']
    }
  }

  // 5. HackerRank: https://www.hackerrank.com/challenges/simple-array-sum/problem
  const hrMatch = url.match(/hackerrank\.com\/challenges\/([a-zA-Z0-9-]+)/i)
  if (hrMatch) {
    const slug = hrMatch[1]
    const title = slugToTitle(slug)
    return {
      title,
      link: `https://www.hackerrank.com/challenges/${slug}/problem`,
      platform: 'HackerRank',
      difficulty: 'Easy',
      tags: ['HackerRank']
    }
  }

  // Fallback for general URLs
  let fallbackTitle = 'New Practice Problem'
  try {
    const parsed = new URL(url)
    const pathnameParts = parsed.pathname.split('/').filter(Boolean)
    if (pathnameParts.length > 0) {
      fallbackTitle = slugToTitle(pathnameParts[pathnameParts.length - 1])
    }
  } catch {
    // raw string
  }

  return {
    title: fallbackTitle,
    link: url,
    platform: 'Other',
    difficulty: 'Medium',
    tags: []
  }
}
