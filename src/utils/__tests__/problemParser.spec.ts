import { describe, it, expect } from 'vitest'
import { parseProblemUrl, slugToTitle } from '../problemParser'

describe('problemParser utils', () => {
  it('converts slugs into capitalized titles', () => {
    expect(slugToTitle('two-sum')).toBe('Two Sum')
    expect(slugToTitle('longest-substring-without-repeating-characters')).toBe(
      'Longest Substring Without Repeating Characters'
    )
  })

  it('parses LeetCode problem URLs', () => {
    const res = parseProblemUrl('https://leetcode.com/problems/median-of-two-sorted-arrays/')
    expect(res.platform).toBe('LeetCode')
    expect(res.title).toBe('Median Of Two Sorted Arrays')
    expect(res.link).toBe('https://leetcode.com/problems/median-of-two-sorted-arrays/')
    expect(res.tags).toContain('LeetCode')
  })

  it('parses Codeforces contest problem URLs', () => {
    const res = parseProblemUrl('https://codeforces.com/contest/158/problem/A')
    expect(res.platform).toBe('Codeforces')
    expect(res.title).toBe('CF 158A')
    expect(res.tags).toContain('Codeforces')
    expect(res.tags).toContain('CF-158')
  })

  it('parses Codeforces problemset URLs', () => {
    const res = parseProblemUrl('https://codeforces.com/problemset/problem/4/A')
    expect(res.platform).toBe('Codeforces')
    expect(res.title).toBe('CF 4A')
  })

  it('parses GeeksforGeeks URLs', () => {
    const res = parseProblemUrl('https://www.geeksforgeeks.org/problems/kadanes-algorithm-1587115620/1')
    expect(res.platform).toBe('GeeksforGeeks')
    expect(res.title).toBe('Kadanes Algorithm')
  })

  it('parses HackerRank URLs', () => {
    const res = parseProblemUrl('https://www.hackerrank.com/challenges/simple-array-sum/problem')
    expect(res.platform).toBe('HackerRank')
    expect(res.title).toBe('Simple Array Sum')
  })
})
