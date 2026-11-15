import { describe, it, expect } from 'vitest'
import { generateMarkdownExport, generateAnkiExport } from '../exportGenerators'
import type { Topic, SubTopic, Question } from '../../types'

describe('Export Generators', () => {
  const mockTopics: Topic[] = [
    { id: 't1', name: 'Arrays & Hashing', order: 0 }
  ]

  const mockSubTopics: SubTopic[] = [
    { id: 'st1', topicId: 't1', name: 'Hash Map', order: 0 }
  ]

  const mockQuestions: Question[] = [
    {
      id: 'q1',
      topicId: 't1',
      subTopicId: 'st1',
      title: 'Two Sum',
      link: 'https://leetcode.com/problems/two-sum/',
      resource: 'https://youtube.com',
      difficulty: 'Easy',
      tags: ['Array', 'Hash Map'],
      notes: 'Use a hash map for O(n)',
      isSolved: true,
      isRevision: false,
      isStarred: true,
      order: 0
    }
  ]

  it('generates markdown with correct progress and table rows', () => {
    const md = generateMarkdownExport(mockTopics, mockSubTopics, mockQuestions, { solved: 1, total: 1 })

    expect(md).toContain('# SolvR - DSA Problem Tracker')
    expect(md).toContain('**Progress**: 1 / 1 solved')
    expect(md).toContain('## Arrays & Hashing (1/1)')
    expect(md).toContain('### Hash Map')
    expect(md).toContain('[Two Sum](https://leetcode.com/problems/two-sum/) ⭐')
    expect(md).toContain('Easy')
    expect(md).toContain('Use a hash map for O(n)')
  })

  it('generates anki deck TSV with front, back, and tags', () => {
    const anki = generateAnkiExport(mockQuestions)

    expect(anki).toContain('#separator:tab')
    expect(anki).toContain('#html:true')
    expect(anki).toContain('Two Sum')
    expect(anki).toContain('Difficulty: Easy')
    expect(anki).toContain('Use a hash map for O(n)')
    expect(anki).toContain('SolvR Easy Array Hash_Map')
  })
})
