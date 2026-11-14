import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useQuestionStore } from '../questionStore'

describe('useQuestionStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  describe('Topic CRUD', () => {
    it('adds a topic with incremental order', () => {
      const store = useQuestionStore()
      store.topics = []

      store.addTopic('Arrays')
      store.addTopic('Strings')

      expect(store.topics).toHaveLength(2)
      expect(store.topics[0].name).toBe('Arrays')
      expect(store.topics[0].order).toBe(0)
      expect(store.topics[1].name).toBe('Strings')
      expect(store.topics[1].order).toBe(1)
    })

    it('edits an existing topic', () => {
      const store = useQuestionStore()
      store.topics = []
      store.addTopic('Arrays')
      const topicId = store.topics[0].id

      store.editTopic(topicId, 'Dynamic Programming')
      expect(store.topics[0].name).toBe('Dynamic Programming')
    })

    it('deletes a topic along with associated subtopics and questions', () => {
      const store = useQuestionStore()
      store.topics = []
      store.subTopics = []
      store.questions = []

      store.addTopic('Arrays')
      const topicId = store.topics[0].id

      store.addSubTopic(topicId, 'Two Pointers')
      const subTopicId = store.subTopics[0].id

      store.addQuestion(topicId, subTopicId, { title: 'Two Sum' })
      store.addQuestion(topicId, null, { title: 'Top Level Question' })

      expect(store.topics).toHaveLength(1)
      expect(store.subTopics).toHaveLength(1)
      expect(store.questions).toHaveLength(2)

      store.deleteTopic(topicId)

      expect(store.topics).toHaveLength(0)
      expect(store.subTopics).toHaveLength(0)
      expect(store.questions).toHaveLength(0)
    })

    it('reorders topics based on an array of IDs', () => {
      const store = useQuestionStore()
      store.topics = []
      store.addTopic('Topic 1')
      store.addTopic('Topic 2')
      const [t1, t2] = store.topics

      store.reorderTopics([t2.id, t1.id])

      expect(store.sortedTopics[0].id).toBe(t2.id)
      expect(store.sortedTopics[1].id).toBe(t1.id)
    })
  })

  describe('SubTopic CRUD', () => {
    it('adds and edits subtopics', () => {
      const store = useQuestionStore()
      store.topics = []
      store.subTopics = []

      store.addTopic('Trees')
      const topicId = store.topics[0].id

      store.addSubTopic(topicId, 'Binary Trees')
      expect(store.subTopics).toHaveLength(1)
      expect(store.subTopics[0].name).toBe('Binary Trees')

      store.editSubTopic(store.subTopics[0].id, 'BST')
      expect(store.subTopics[0].name).toBe('BST')
    })

    it('deletes subtopics and its questions', () => {
      const store = useQuestionStore()
      store.topics = []
      store.subTopics = []
      store.questions = []

      store.addTopic('Graphs')
      const topicId = store.topics[0].id
      store.addSubTopic(topicId, 'BFS/DFS')
      const subTopicId = store.subTopics[0].id

      store.addQuestion(topicId, subTopicId, { title: 'Number of Islands' })
      expect(store.questions).toHaveLength(1)

      store.deleteSubTopic(subTopicId)
      expect(store.subTopics).toHaveLength(0)
      expect(store.questions).toHaveLength(0)
    })
  })

  describe('Question Operations', () => {
    it('adds questions with defaults', () => {
      const store = useQuestionStore()
      store.questions = []

      store.addQuestion('topic-1', null, {
        title: 'Trapping Rain Water',
        difficulty: 'Hard',
        tags: ['Arrays', 'Two Pointers']
      })

      expect(store.questions).toHaveLength(1)
      const q = store.questions[0]
      expect(q.title).toBe('Trapping Rain Water')
      expect(q.difficulty).toBe('Hard')
      expect(q.isSolved).toBe(false)
      expect(q.isRevision).toBe(false)
      expect(q.isStarred).toBe(false)
      expect(q.notes).toBe('')
      expect(q.order).toBe(0)
    })

    it('edits question properties', () => {
      const store = useQuestionStore()
      store.questions = []
      store.addQuestion('topic-1', null, { title: 'Old Title' })
      const qId = store.questions[0].id

      store.editQuestion(qId, {
        title: 'Updated Title',
        difficulty: 'Easy',
        link: 'https://leetcode.com'
      })

      expect(store.questions[0].title).toBe('Updated Title')
      expect(store.questions[0].difficulty).toBe('Easy')
      expect(store.questions[0].link).toBe('https://leetcode.com')
    })

    it('toggles question flags and updates notes', () => {
      const store = useQuestionStore()
      store.questions = []
      store.addQuestion('topic-1', null, { title: 'Q1' })
      const qId = store.questions[0].id

      store.toggleSolved(qId)
      expect(store.questions[0].isSolved).toBe(true)

      store.toggleStarred(qId)
      expect(store.questions[0].isStarred).toBe(true)

      store.toggleRevision(qId)
      expect(store.questions[0].isRevision).toBe(true)

      store.updateNotes(qId, 'Use two pointers from left and right.')
      expect(store.questions[0].notes).toBe('Use two pointers from left and right.')
    })
  })

  describe('Filtering and Search Getters', () => {
    beforeEach(() => {
      const store = useQuestionStore()
      store.questions = [
        {
          id: 'q1',
          topicId: 't1',
          subTopicId: null,
          title: 'Binary Search',
          link: '',
          resource: '',
          difficulty: 'Easy',
          tags: ['Search'],
          notes: '',
          isSolved: true,
          isRevision: false,
          isStarred: true,
          order: 0
        },
        {
          id: 'q2',
          topicId: 't1',
          subTopicId: null,
          title: 'Quick Sort',
          link: '',
          resource: '',
          difficulty: 'Medium',
          tags: ['Sorting'],
          notes: '',
          isSolved: false,
          isRevision: true,
          isStarred: false,
          order: 1
        }
      ]
    })

    it('filters by search query matching title or tag', () => {
      const store = useQuestionStore()
      store.setSearchQuery('binary')
      expect(store.filteredQuestions).toHaveLength(1)
      expect(store.filteredQuestions[0].id).toBe('q1')

      store.setSearchQuery('sorting')
      expect(store.filteredQuestions).toHaveLength(1)
      expect(store.filteredQuestions[0].id).toBe('q2')
    })

    it('filters by difficulty', () => {
      const store = useQuestionStore()
      store.setFilterDifficulty('Medium')
      expect(store.filteredQuestions).toHaveLength(1)
      expect(store.filteredQuestions[0].id).toBe('q2')
    })

    it('filters by status: solved, unsolved, starred, revision', () => {
      const store = useQuestionStore()

      store.setFilterStatus('solved')
      expect(store.filteredQuestions).toHaveLength(1)
      expect(store.filteredQuestions[0].id).toBe('q1')

      store.setFilterStatus('unsolved')
      expect(store.filteredQuestions).toHaveLength(1)
      expect(store.filteredQuestions[0].id).toBe('q2')

      store.setFilterStatus('starred')
      expect(store.filteredQuestions).toHaveLength(1)
      expect(store.filteredQuestions[0].id).toBe('q1')

      store.setFilterStatus('revision')
      expect(store.filteredQuestions).toHaveLength(1)
      expect(store.filteredQuestions[0].id).toBe('q2')
    })
  })

  describe('Progress and Theme', () => {
    it('calculates topic and overall progress correctly', () => {
      const store = useQuestionStore()
      store.questions = [
        { id: '1', topicId: 't1', subTopicId: null, title: 'Q1', link: '', resource: '', difficulty: 'Easy', tags: [], notes: '', isSolved: true, isRevision: false, isStarred: false, order: 0 },
        { id: '2', topicId: 't1', subTopicId: null, title: 'Q2', link: '', resource: '', difficulty: 'Easy', tags: [], notes: '', isSolved: false, isRevision: false, isStarred: false, order: 1 },
        { id: '3', topicId: 't2', subTopicId: null, title: 'Q3', link: '', resource: '', difficulty: 'Easy', tags: [], notes: '', isSolved: true, isRevision: false, isStarred: false, order: 0 }
      ]

      expect(store.getTopicProgress('t1')).toEqual({ solved: 1, total: 2 })
      expect(store.overallProgress).toEqual({ solved: 2, total: 3 })
    })

    it('toggles theme between dark and light', () => {
      const store = useQuestionStore()
      store.theme = 'dark'

      store.toggleTheme()
      expect(store.theme).toBe('light')

      store.toggleTheme()
      expect(store.theme).toBe('dark')
    })
  })
})
