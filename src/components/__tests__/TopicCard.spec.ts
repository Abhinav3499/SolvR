import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import TopicCard from '../TopicCard.vue'
import { useQuestionStore } from '../../stores/questionStore'
import type { Topic } from '../../types'

describe('TopicCard.vue', () => {
  let mockTopic: Topic

  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
    mockTopic = {
      id: 'topic-arrays',
      name: 'Arrays & Hashing',
      order: 0
    }
  })

  it('renders topic name and topic progress', () => {
    const store = useQuestionStore()
    store.topics = [mockTopic]
    store.questions = [
      { id: 'q1', topicId: 'topic-arrays', subTopicId: null, title: 'Two Sum', link: '', resource: '', difficulty: 'Easy', tags: [], notes: '', isSolved: true, isRevision: false, isStarred: false, order: 0 },
      { id: 'q2', topicId: 'topic-arrays', subTopicId: null, title: 'Three Sum', link: '', resource: '', difficulty: 'Medium', tags: [], notes: '', isSolved: false, isRevision: false, isStarred: false, order: 1 }
    ]

    const wrapper = mount(TopicCard, {
      props: { topic: mockTopic }
    })

    expect(wrapper.text()).toContain('Arrays & Hashing')
    expect(wrapper.text()).toContain('1 / 2')
  })

  it('emits edit, delete, add-subtopic, and add-question events', async () => {
    const wrapper = mount(TopicCard, {
      props: { topic: mockTopic }
    })

    const buttons = wrapper.findAll('.topic-actions button')
    expect(buttons.length).toBeGreaterThanOrEqual(4)

    // Add Subtopic
    await buttons[0].trigger('click')
    expect(wrapper.emitted('add-subtopic')?.[0]).toEqual([mockTopic])

    // Add Question
    await buttons[1].trigger('click')
    expect(wrapper.emitted('add-question')?.[0]).toEqual([mockTopic, null])

    // Edit Topic
    await buttons[2].trigger('click')
    expect(wrapper.emitted('edit')?.[0]).toEqual([mockTopic])

    // Delete Topic
    await buttons[3].trigger('click')
    expect(wrapper.emitted('delete')?.[0]).toEqual([mockTopic])
  })

  it('toggles expansion state when header is clicked', async () => {
    const wrapper = mount(TopicCard, {
      props: { topic: mockTopic }
    })

    const header = wrapper.find('.topic-header')
    expect(wrapper.find('.topic-content').exists()).toBe(true)

    await header.trigger('click')
    expect(wrapper.find('.topic-content').exists()).toBe(false)

    await header.trigger('click')
    expect(wrapper.find('.topic-content').exists()).toBe(true)
  })
})
