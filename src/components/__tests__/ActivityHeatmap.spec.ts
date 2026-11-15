import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ActivityHeatmap from '../ActivityHeatmap.vue'
import { useQuestionStore } from '../../stores/questionStore'

describe('ActivityHeatmap.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('renders streak statistics properly', () => {
    const store = useQuestionStore()
    const today = new Date().toISOString().split('T')[0]
    store.activityLog = {
      [today]: ['q1', 'q2']
    }

    const wrapper = mount(ActivityHeatmap)

    expect(wrapper.text()).toContain('Daily Consistency & Heatmap')
    expect(wrapper.text()).toContain('1 Day Streak')
    expect(wrapper.text()).toContain('Streak')
    expect(wrapper.text()).toContain('Best')
    expect(wrapper.text()).toContain('Days')
  })

  it('toggles collapse and expand', async () => {
    const wrapper = mount(ActivityHeatmap)
    expect(wrapper.find('.heatmap-body').exists()).toBe(true)

    const header = wrapper.find('.heatmap-header')
    await header.trigger('click')
    expect(wrapper.find('.heatmap-body').exists()).toBe(false)

    await header.trigger('click')
    expect(wrapper.find('.heatmap-body').exists()).toBe(true)
  })

  it('renders due for review pill and emits filter-due', async () => {
    const store = useQuestionStore()
    const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString()
    store.questions = [{
      id: 'q1',
      topicId: 't1',
      subTopicId: null,
      title: 'Review Question',
      link: '',
      resource: '',
      difficulty: 'Easy',
      tags: [],
      notes: '',
      isSolved: true,
      isRevision: true,
      isStarred: false,
      lastPracticedAt: eightDaysAgo,
      order: 0
    }]

    const wrapper = mount(ActivityHeatmap)
    const duePill = wrapper.find('.due-pill')
    expect(duePill.exists()).toBe(true)
    expect(duePill.text()).toContain('1')
    expect(duePill.text()).toContain('Due Review')

    await duePill.trigger('click')
    expect(wrapper.emitted('filter-due')).toBeTruthy()
  })

  it('renders 26 week columns in the heatmap matrix', () => {
    const wrapper = mount(ActivityHeatmap)
    const weekCols = wrapper.findAll('.week-column')
    expect(weekCols).toHaveLength(26)
  })
})
