import { describe, it, expect } from 'vitest'
import {
  formatDateKey,
  parseDateKey,
  calculateStreak,
  generateHeatmapDays,
  generateSeparateMonthHeatmaps
} from '../streak'

describe('Streak & Activity Heatmap utils', () => {
  it('formats and parses date keys correctly', () => {
    const d = new Date(2026, 10, 15) // Nov 15, 2026
    const key = formatDateKey(d)
    expect(key).toBe('2026-11-15')

    const parsed = parseDateKey(key)
    expect(parsed.getFullYear()).toBe(2026)
    expect(parsed.getMonth()).toBe(10)
    expect(parsed.getDate()).toBe(15)
  })

  it('returns zero streaks for empty activity log', () => {
    const streak = calculateStreak({}, new Date(2026, 10, 15))
    expect(streak.currentStreak).toBe(0)
    expect(streak.longestStreak).toBe(0)
    expect(streak.totalActiveDays).toBe(0)
    expect(streak.todaySolvedCount).toBe(0)
    expect(streak.lastSolvedDate).toBeNull()
  })

  it('calculates current streak when solved today', () => {
    const today = new Date(2026, 10, 15)
    const log = {
      '2026-11-14': ['q1'],
      '2026-11-15': ['q2', 'q3']
    }

    const streak = calculateStreak(log, today)
    expect(streak.currentStreak).toBe(2)
    expect(streak.longestStreak).toBe(2)
    expect(streak.totalActiveDays).toBe(2)
    expect(streak.todaySolvedCount).toBe(2)
    expect(streak.lastSolvedDate).toBe('2026-11-15')
  })

  it('keeps streak alive when yesterday was solved and today has not yet been solved', () => {
    const today = new Date(2026, 10, 15)
    const log = {
      '2026-11-13': ['q1'],
      '2026-11-14': ['q2']
    }

    const streak = calculateStreak(log, today)
    expect(streak.currentStreak).toBe(2)
    expect(streak.longestStreak).toBe(2)
    expect(streak.todaySolvedCount).toBe(0)
    expect(streak.lastSolvedDate).toBe('2026-11-14')
  })

  it('resets current streak to 0 if last solved was 2+ days ago', () => {
    const today = new Date(2026, 10, 15)
    const log = {
      '2026-11-10': ['q1'],
      '2026-11-11': ['q2'],
      '2026-11-12': ['q3']
    }

    const streak = calculateStreak(log, today)
    expect(streak.currentStreak).toBe(0)
    expect(streak.longestStreak).toBe(3)
    expect(streak.totalActiveDays).toBe(3)
    expect(streak.lastSolvedDate).toBe('2026-11-12')
  })

  it('finds longest streak across broken intervals', () => {
    const today = new Date(2026, 10, 15)
    const log = {
      '2026-11-01': ['q1'],
      '2026-11-02': ['q2'],
      '2026-11-03': ['q3'],
      '2026-11-04': ['q4'],
      '2026-11-14': ['q5'],
      '2026-11-15': ['q6']
    }

    const streak = calculateStreak(log, today)
    expect(streak.currentStreak).toBe(2)
    expect(streak.longestStreak).toBe(4)
    expect(streak.totalActiveDays).toBe(6)
  })

  it('generates heatmap grid with appropriate intensity levels and 1-year month labels', () => {
    const today = new Date(2026, 10, 15)
    const log = {
      '2026-11-15': ['q1', 'q2', 'q3', 'q4', 'q5'], // level 3
      '2026-11-14': ['q6'], // level 1
      '2026-11-13': ['q7', 'q8'] // level 2
    }

    const grid = generateHeatmapDays(log, 4, today)
    expect(grid.days).toHaveLength(28)
    expect(grid.totalSolvedPastYear).toBe(8)
    expect(grid.monthLabels.length).toBeGreaterThan(0)
  })

  it('generates separate month heatmaps for 12 months with distinct weeks', () => {
    const today = new Date(2026, 10, 15) // Nov 15, 2026
    const log = {
      '2026-11-15': ['q1', 'q2'],
      '2026-10-10': ['q3']
    }

    const res = generateSeparateMonthHeatmaps(log, today, 12)
    expect(res.months).toHaveLength(12)
    expect(res.totalSolvedPastYear).toBe(3)

    // Current month is November
    const novMonth = res.months[11]
    expect(novMonth.monthName).toBe('Nov')
    expect(novMonth.year).toBe(2026)
    expect(novMonth.totalSolved).toBe(2)
    expect(novMonth.weeks.length).toBeGreaterThanOrEqual(4)

    // Every week has exactly 7 row slots
    novMonth.weeks.forEach(week => {
      expect(week).toHaveLength(7)
    })

    // Previous month is October
    const octMonth = res.months[10]
    expect(octMonth.monthName).toBe('Oct')
    expect(octMonth.totalSolved).toBe(1)
  })
})
