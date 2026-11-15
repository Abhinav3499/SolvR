import type { Difficulty } from '../types'

export interface ParsedCSVQuestion {
  topicName: string
  subTopicName: string | null
  title: string
  link: string
  resource: string
  difficulty: Difficulty
  tags: string[]
  notes: string
  isSolved: boolean
  isRevision: boolean
  isStarred: boolean
}

export function parseCSVRows(csvText: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let insideQuotes = false
  let i = 0

  while (i < csvText.length) {
    const char = csvText[i]

    if (insideQuotes) {
      if (char === '"') {
        if (i + 1 < csvText.length && csvText[i + 1] === '"') {
          currentField += '"'
          i += 2
          continue
        } else {
          insideQuotes = false
          i++
          continue
        }
      } else {
        currentField += char
        i++
        continue
      }
    }

    if (char === '"') {
      insideQuotes = true
      i++
    } else if (char === ',') {
      currentRow.push(currentField)
      currentField = ''
      i++
    } else if (char === '\r') {
      if (i + 1 < csvText.length && csvText[i + 1] === '\n') {
        i++
      }
      currentRow.push(currentField)
      rows.push(currentRow)
      currentRow = []
      currentField = ''
      i++
    } else if (char === '\n') {
      currentRow.push(currentField)
      rows.push(currentRow)
      currentRow = []
      currentField = ''
      i++
    } else {
      currentField += char
      i++
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField)
    rows.push(currentRow)
  }

  return rows.filter(r => r.some(cell => cell.trim().length > 0))
}

export function parseCSVToQuestions(csvText: string): {
  questions: ParsedCSVQuestion[]
  topicsCount: number
  error?: string
} {
  const rows = parseCSVRows(csvText)
  if (rows.length < 2) {
    return { questions: [], topicsCount: 0, error: 'CSV file must contain a header row and at least one data row.' }
  }

  const headerRow = rows[0].map(h => h.trim().toLowerCase())

  const findCol = (...names: string[]) => {
    return headerRow.findIndex(h => names.includes(h))
  }

  const topicIdx = findCol('topic', 'category', 'subject')
  const subTopicIdx = findCol('subtopic', 'sub-topic', 'sub topic', 'section')
  const titleIdx = findCol('title', 'question', 'problem', 'name', 'problem name', 'question title')
  const diffIdx = findCol('difficulty', 'diff', 'level')
  const linkIdx = findCol('link', 'url', 'problem link', 'problem url')
  const resourceIdx = findCol('resource', 'solution', 'video', 'article')
  const tagsIdx = findCol('tags', 'tag')
  const solvedIdx = findCol('solved', 'is solved', 'is_solved', 'status')
  const starredIdx = findCol('starred', 'star', 'favorite', 'favourite', 'is_starred')
  const revisionIdx = findCol('revision', 'revise', 'is_revision')
  const notesIdx = findCol('notes', 'note', 'comment', 'solution notes')

  if (titleIdx === -1) {
    return { questions: [], topicsCount: 0, error: 'Missing required "Title" or "Question" column in CSV header.' }
  }

  const parsedQuestions: ParsedCSVQuestion[] = []
  const uniqueTopics = new Set<string>()

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    const title = (row[titleIdx] || '').trim()
    if (!title) continue

    const topicName = (topicIdx >= 0 && row[topicIdx]?.trim()) ? row[topicIdx].trim() : 'General'
    const subTopicName = (subTopicIdx >= 0 && row[subTopicIdx]?.trim()) ? row[subTopicIdx].trim() : null

    uniqueTopics.add(topicName)

    let difficulty: Difficulty = 'Medium'
    if (diffIdx >= 0) {
      const rawDiff = (row[diffIdx] || '').trim().toLowerCase()
      if (rawDiff === 'easy') difficulty = 'Easy'
      else if (rawDiff === 'hard') difficulty = 'Hard'
    }

    const link = (linkIdx >= 0 && row[linkIdx]) ? row[linkIdx].trim() : ''
    const resource = (resourceIdx >= 0 && row[resourceIdx]) ? row[resourceIdx].trim() : ''
    const notes = (notesIdx >= 0 && row[notesIdx]) ? row[notesIdx].trim() : ''

    const tags: string[] = []
    if (tagsIdx >= 0 && row[tagsIdx]) {
      tags.push(...row[tagsIdx].split(/[,;]/).map(t => t.trim()).filter(Boolean))
    }

    const isTrue = (val: string | undefined) => {
      if (!val) return false
      const v = val.trim().toLowerCase()
      return v === 'yes' || v === 'true' || v === '1' || v === 'solved'
    }

    const isSolved = solvedIdx >= 0 ? isTrue(row[solvedIdx]) : false
    const isStarred = starredIdx >= 0 ? isTrue(row[starredIdx]) : false
    const isRevision = revisionIdx >= 0 ? isTrue(row[revisionIdx]) : false

    parsedQuestions.push({
      topicName,
      subTopicName,
      title,
      link,
      resource,
      difficulty,
      tags,
      notes,
      isSolved,
      isStarred,
      isRevision
    })
  }

  return {
    questions: parsedQuestions,
    topicsCount: uniqueTopics.size
  }
}
