import type { ActivityLog, StreakInfo, HeatmapDay } from '../types'

/**
 * Format a Date object as 'YYYY-MM-DD' in local time
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse 'YYYY-MM-DD' into a local Date object set to midnight
 */
export function parseDateKey(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day, 0, 0, 0, 0)
}

/**
 * Calculates current streak, longest streak, active days, and today's solved count
 */
export function calculateStreak(
  activityLog: ActivityLog = {},
  referenceDate: Date = new Date()
): StreakInfo {
  const todayKey = formatDateKey(referenceDate)
  
  const yesterday = new Date(referenceDate)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayKey = formatDateKey(yesterday)

  // Filter only dates that have at least one solved question
  const activeDates = Object.keys(activityLog).filter(
    dateKey => Array.isArray(activityLog[dateKey]) && activityLog[dateKey].length > 0
  )

  const activeSet = new Set(activeDates)
  const totalActiveDays = activeSet.size
  const todaySolvedCount = activityLog[todayKey]?.length || 0

  if (totalActiveDays === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      todaySolvedCount: 0,
      lastSolvedDate: null
    }
  }

  // Sort dates descending for last solved date
  const sortedDesc = [...activeDates].sort((a, b) => b.localeCompare(a))
  const lastSolvedDate = sortedDesc[0] || null

  // Calculate current streak
  let currentStreak = 0
  let checkDate = new Date(referenceDate)

  if (activeSet.has(todayKey)) {
    // Today is solved, count today and go backwards
    while (activeSet.has(formatDateKey(checkDate))) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    }
  } else if (activeSet.has(yesterdayKey)) {
    // Today not yet solved, but yesterday was — streak is still alive!
    checkDate = new Date(yesterday)
    while (activeSet.has(formatDateKey(checkDate))) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    }
  }

  // Calculate longest streak across all recorded history
  let longestStreak = 0
  if (activeDates.length > 0) {
    const sortedAsc = [...activeDates].sort((a, b) => a.localeCompare(b))
    let tempStreak = 1
    longestStreak = 1

    for (let i = 1; i < sortedAsc.length; i++) {
      const prev = parseDateKey(sortedAsc[i - 1])
      const curr = parseDateKey(sortedAsc[i])
      
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        tempStreak++
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak
        }
      } else if (diffDays > 1) {
        tempStreak = 1
      }
    }
  }

  // Current streak can be the longest
  longestStreak = Math.max(longestStreak, currentStreak)

  return {
    currentStreak,
    longestStreak,
    totalActiveDays,
    todaySolvedCount,
    lastSolvedDate
  }
}

export interface MonthLabel {
  label: string
  weekIndex: number
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/**
 * Generate 1-year (53 weeks) heatmap grid with month-wise labels like LeetCode
 */
export function generateHeatmapDays(
  activityLog: ActivityLog = {},
  weeks = 53,
  referenceDate: Date = new Date()
): {
  days: HeatmapDay[]
  totalWeeks: number
  startDate: string
  endDate: string
  monthLabels: MonthLabel[]
  totalSolvedPastYear: number
} {
  const endDate = new Date(referenceDate)
  endDate.setHours(0, 0, 0, 0)

  // Align to end of current week (Saturday = 6)
  const daysUntilEndOfWeek = 6 - endDate.getDay()
  const gridEnd = new Date(endDate)
  gridEnd.setDate(gridEnd.getDate() + daysUntilEndOfWeek)

  const totalDays = weeks * 7
  const gridStart = new Date(gridEnd)
  gridStart.setDate(gridStart.getDate() - totalDays + 1)

  const days: HeatmapDay[] = []
  const cursor = new Date(gridStart)
  let totalSolvedPastYear = 0

  for (let i = 0; i < totalDays; i++) {
    const dateKey = formatDateKey(cursor)
    const count = activityLog[dateKey]?.length || 0
    totalSolvedPastYear += count
    const dayOfWeek = cursor.getDay()
    const weekIndex = Math.floor(i / 7)

    let level: 0 | 1 | 2 | 3 | 4 = 0
    if (count === 1) level = 1
    else if (count >= 2 && count <= 3) level = 2
    else if (count >= 4 && count <= 6) level = 3
    else if (count >= 7) level = 4

    days.push({
      date: dateKey,
      count,
      level,
      dayOfWeek,
      weekIndex
    })

    cursor.setDate(cursor.getDate() + 1)
  }

  // Calculate Month Labels for the 53 week columns
  const monthLabels: MonthLabel[] = []
  let lastMonth = -1
  let lastPlacedWeek = -5

  for (let w = 0; w < weeks; w++) {
    // Check day in middle of week (Wednesday = day 3) or day 0
    const sampleDay = days.find(d => d.weekIndex === w && d.dayOfWeek === 3) || days.find(d => d.weekIndex === w)
    if (sampleDay) {
      const monthIndex = parseDateKey(sampleDay.date).getMonth()
      if (monthIndex !== lastMonth && (w - lastPlacedWeek >= 3 || lastMonth === -1)) {
        monthLabels.push({
          label: MONTH_NAMES[monthIndex],
          weekIndex: w
        })
        lastMonth = monthIndex
        lastPlacedWeek = w
      }
    }
  }

  return {
    days,
    totalWeeks: weeks,
    startDate: formatDateKey(gridStart),
    endDate: formatDateKey(gridEnd),
    monthLabels,
    totalSolvedPastYear
  }
}
