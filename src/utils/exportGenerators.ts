import type { Topic, SubTopic, Question } from '../types'

/**
 * Generates a clean, readable Markdown document of the question tracker,
 * ideal for pasting into GitHub READMEs, Notion, or Obsidian.
 */
export function generateMarkdownExport(
  topics: Topic[],
  subTopics: SubTopic[],
  questions: Question[],
  stats = { solved: 0, total: 0 }
): string {
  const lines: string[] = []

  lines.push('# SolvR - DSA Problem Tracker')
  lines.push('')
  lines.push(`> **Progress**: ${stats.solved} / ${stats.total} solved (${stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0}%)`)
  lines.push(`> **Exported on**: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`)
  lines.push('')

  const sortedTopics = [...topics].sort((a, b) => a.order - b.order)

  for (const topic of sortedTopics) {
    const topicQuestions = questions.filter(q => q.topicId === topic.id)
    const topicSolved = topicQuestions.filter(q => q.isSolved).length
    lines.push(`## ${topic.name} (${topicSolved}/${topicQuestions.length})`)
    lines.push('')

    const subTopicsForTopic = subTopics
      .filter(st => st.topicId === topic.id)
      .sort((a, b) => a.order - b.order)

    // Render questions under subtopics
    for (const sub of subTopicsForTopic) {
      const subQuestions = topicQuestions
        .filter(q => q.subTopicId === sub.id)
        .sort((a, b) => a.order - b.order)

      if (subQuestions.length > 0) {
        lines.push(`### ${sub.name}`)
        lines.push('')
        lines.push('| Status | Problem | Difficulty | Solution | Tags | Notes |')
        lines.push('| :---: | :--- | :---: | :---: | :--- | :--- |')

        for (const q of subQuestions) {
          const status = q.isSolved ? '✅' : '⬜'
          const star = q.isStarred ? ' ⭐' : ''
          const titleLink = q.link ? `[${q.title}](${q.link})` : q.title
          const resource = q.resource ? `[Watch](${q.resource})` : '-'
          const tags = q.tags.length > 0 ? `\`${q.tags.join('`, `')}\`` : '-'
          const notes = q.notes ? q.notes.replace(/\n/g, ' ') : '-'

          lines.push(`| ${status} | ${titleLink}${star} | ${q.difficulty} | ${resource} | ${tags} | ${notes} |`)
        }
        lines.push('')
      }
    }

    // Render top-level questions (without subtopic)
    const topQuestions = topicQuestions
      .filter(q => !q.subTopicId)
      .sort((a, b) => a.order - b.order)

    if (topQuestions.length > 0) {
      if (subTopicsForTopic.length > 0) {
        lines.push('### General Questions')
        lines.push('')
      }
      lines.push('| Status | Problem | Difficulty | Solution | Tags | Notes |')
      lines.push('| :---: | :--- | :---: | :---: | :--- | :--- |')

      for (const q of topQuestions) {
        const status = q.isSolved ? '✅' : '⬜'
        const star = q.isStarred ? ' ⭐' : ''
        const titleLink = q.link ? `[${q.title}](${q.link})` : q.title
        const resource = q.resource ? `[Watch](${q.resource})` : '-'
        const tags = q.tags.length > 0 ? `\`${q.tags.join('`, `')}\`` : '-'
        const notes = q.notes ? q.notes.replace(/\n/g, ' ') : '-'

        lines.push(`| ${status} | ${titleLink}${star} | ${q.difficulty} | ${resource} | ${tags} | ${notes} |`)
      }
      lines.push('')
    }
  }

  return lines.join('\n')
}

/**
 * Generates an Anki-compatible TSV (Tab Separated Values) flashcard deck.
 * Front: Problem title + link + difficulty + tags
 * Back: Notes & approach / solution reference
 */
export function generateAnkiExport(questions: Question[]): string {
  const lines: string[] = [
    '#separator:tab',
    '#html:true',
    '#tags column:3'
  ]

  for (const q of questions) {
    const front = `<strong>${q.title}</strong><br><small>Difficulty: ${q.difficulty}</small>${q.link ? `<br><a href="${q.link}">LeetCode Link</a>` : ''}`
    const backNotes = q.notes
      ? q.notes.replace(/\n/g, '<br>')
      : '<em>No notes recorded yet. Focus on time and space complexity!</em>'
    const back = `${backNotes}${q.resource ? `<br><br><a href="${q.resource}">Solution Resource</a>` : ''}`
    const tags = ['SolvR', q.difficulty, ...q.tags].map(t => t.replace(/\s+/g, '_')).join(' ')

    // Replace any raw tabs to avoid TSV format breakage
    const cleanFront = front.replace(/\t/g, ' ')
    const cleanBack = back.replace(/\t/g, ' ')

    lines.push(`${cleanFront}\t${cleanBack}\t${tags}`)
  }

  return lines.join('\n')
}
