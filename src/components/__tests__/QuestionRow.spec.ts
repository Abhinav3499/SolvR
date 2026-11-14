import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import QuestionRow from '../QuestionRow.vue'
import { useQuestionStore } from '../../stores/questionStore'
import type { Question } from '../../types'

describe('QuestionRow.vue', () => {
  let mockQuestion: Question

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    mockQuestion = {
      id: 'q-101',
      topicId: 't-1',
      subTopicId: null,
      title: 'Valid Palindrome',
      link: 'https://leetcode.com/problems/valid-palindrome/',
      resource: 'https://youtube.com/watch?v=123',
      difficulty: 'Easy',
      tags: ['Two Pointers', 'String'],
      notes: 'Remember to ignore non-alphanumeric chars',
      isSolved: false,
      isRevision: false,
      isStarred: false,
      order: 0
    }
  })

  it('renders question title, tags, and difficulty', () => {
    const wrapper = mount(QuestionRow, {
      props: { question: mockQuestion }
    })

    expect(wrapper.text()).toContain('Valid Palindrome')
    expect(wrapper.text()).toContain('Two Pointers')
    expect(wrapper.text()).toContain('Easy')
    const link = wrapper.find('a[href="https://leetcode.com/problems/valid-palindrome/"]')
    expect(link.exists()).toBe(true)
  })

  it('toggles solved when checkbox is clicked', async () => {
    const store = useQuestionStore()
    store.questions = [mockQuestion]

    const wrapper = mount(QuestionRow, {
      props: { question: mockQuestion }
    })

    const checkbox = wrapper.find('.checkbox')
    await checkbox.trigger('click')

    expect(store.questions[0].isSolved).toBe(true)
  })

  it('emits open-notes, edit, and delete events', async () => {
    const wrapper = mount(QuestionRow, {
      props: { question: mockQuestion }
    })

    const notesBtn = wrapper.find('.notes-btn')
    await notesBtn.trigger('click')
    expect(wrapper.emitted('open-notes')?.[0]).toEqual([mockQuestion])

    const editBtn = wrapper.find('.edit-btn')
    await editBtn.trigger('click')
    expect(wrapper.emitted('edit')?.[0]).toEqual([mockQuestion])

    const deleteBtn = wrapper.find('.btn-danger')
    await deleteBtn.trigger('click')
    expect(wrapper.emitted('delete')?.[0]).toEqual([mockQuestion])
  })
})
