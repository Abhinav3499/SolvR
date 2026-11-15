export type Difficulty = 'Easy' | 'Medium' | 'Hard'

export type FilterStatus = '' | 'solved' | 'unsolved' | 'starred' | 'revision'

export type FilterDifficulty = '' | Difficulty

export type Theme = 'dark' | 'light'

export interface Topic {
  id: string
  name: string
  order: number
}

export interface SubTopic {
  id: string
  topicId: string
  name: string
  order: number
}

export interface Question {
  id: string
  topicId: string
  subTopicId: string | null
  title: string
  link: string
  resource: string
  difficulty: Difficulty
  tags: string[]
  notes: string
  isSolved: boolean
  isRevision: boolean
  isStarred: boolean
  order: number
  lastPracticedAt?: string | null
  solvedAt?: string | null
}

export interface QuestionInput {
  title: string
  link?: string
  resource?: string
  difficulty?: Difficulty
  tags?: string[]
}

export interface QuestionUpdate {
  title?: string
  link?: string
  resource?: string
  difficulty?: Difficulty
  tags?: string[]
  notes?: string
  isSolved?: boolean
  isRevision?: boolean
  isStarred?: boolean
  order?: number
}

export interface Progress {
  solved: number
  total: number
}

export interface SeedData {
  topics: Topic[]
  subTopics: SubTopic[]
  questions: Question[]
}

export type ImportMode = 'replace' | 'merge'

export interface ExportPayload {
  version: number
  exportedAt: string
  topics: Topic[]
  subTopics: SubTopic[]
  questions: Question[]
  activityLog?: ActivityLog
}

export type ActivityLog = Record<string, string[]>

export interface StreakInfo {
  currentStreak: number
  longestStreak: number
  totalActiveDays: number
  todaySolvedCount: number
  lastSolvedDate: string | null
}

export interface HeatmapDay {
  date: string
  count: number
  level: 0 | 1 | 2 | 3 | 4
  dayOfWeek: number
  weekIndex: number
}

