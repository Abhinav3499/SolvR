import { describe, it, expect } from 'vitest'
import { parseCSVRows, parseCSVToQuestions } from '../csv'

describe('CSV parser utils', () => {
  it('parses standard CSV lines with quotes and escaped quotes', () => {
    const csv = 'Topic,Title,Notes\n"Arrays","Two Sum","Use ""hash map"" approach"\n"Strings","Palindrome",""'
    const rows = parseCSVRows(csv)

    expect(rows).toHaveLength(3)
    expect(rows[0]).toEqual(['Topic', 'Title', 'Notes'])
    expect(rows[1][2]).toBe('Use "hash map" approach')
  })

  it('converts CSV text into structured questions and topics', () => {
    const csv = 'Topic,SubTopic,Title,Difficulty,Link,Resource,Tags,Solved,Starred,Revision,Notes\n' +
      'Arrays,Two Pointers,Two Sum,Easy,https://leetcode.com/two-sum,,,Yes,No,No,"O(N) time"\n' +
      'Graphs,,Course Schedule,Medium,https://leetcode.com/course-schedule,,,No,Yes,Yes,"Topological sort"'

    const { questions, topicsCount, error } = parseCSVToQuestions(csv)
    expect(error).toBeUndefined()
    expect(topicsCount).toBe(2)
    expect(questions).toHaveLength(2)

    expect(questions[0].title).toBe('Two Sum')
    expect(questions[0].topicName).toBe('Arrays')
    expect(questions[0].subTopicName).toBe('Two Pointers')
    expect(questions[0].difficulty).toBe('Easy')
    expect(questions[0].isSolved).toBe(true)

    expect(questions[1].title).toBe('Course Schedule')
    expect(questions[1].topicName).toBe('Graphs')
    expect(questions[1].subTopicName).toBeNull()
    expect(questions[1].difficulty).toBe('Medium')
    expect(questions[1].isStarred).toBe(true)
    expect(questions[1].isRevision).toBe(true)
  })

  it('returns error when header does not contain Title column', () => {
    const csv = 'Topic,Difficulty\nArrays,Easy'
    const { error } = parseCSVToQuestions(csv)
    expect(error).toContain('Missing required "Title" or "Question" column')
  })
})
