import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import HeaderBar from '../HeaderBar.vue'
import { useQuestionStore } from '../../stores/questionStore'

describe('HeaderBar.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('renders progress and calculates percentage correctly', () => {
    const store = useQuestionStore()
    store.questions = [
      { id: '1', topicId: 't1', subTopicId: null, title: 'Q1', link: '', resource: '', difficulty: 'Easy', tags: [], notes: '', isSolved: true, isRevision: false, isStarred: false, order: 0 },
      { id: '2', topicId: 't1', subTopicId: null, title: 'Q2', link: '', resource: '', difficulty: 'Easy', tags: [], notes: '', isSolved: false, isRevision: false, isStarred: false, order: 1 }
    ]

    const wrapper = mount(HeaderBar)

    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('2 solved')

    const fill = wrapper.find('.progress-fill')
    expect(fill.attributes('style')).toContain('width: 50%')
  })

  it('emits add-topic when Add Topic button is clicked', async () => {
    const wrapper = mount(HeaderBar)

    const addTopicBtn = wrapper.findAll('button').find(b => b.text().includes('Add Topic'))
    expect(addTopicBtn).toBeDefined()
    await addTopicBtn?.trigger('click')

    expect(wrapper.emitted('add-topic')).toBeTruthy()
  })

  it('toggles theme when theme button is clicked', async () => {
    const store = useQuestionStore()
    store.theme = 'dark'

    const wrapper = mount(HeaderBar)
    const themeBtn = wrapper.find('.theme-toggle')
    await themeBtn.trigger('click')

    expect(store.theme).toBe('light')
  })

  it('emits open-social when Friends button is clicked', async () => {
    const wrapper = mount(HeaderBar)
    const friendsBtn = wrapper.find('.friends-btn')
    expect(friendsBtn.exists()).toBe(true)
    await friendsBtn.trigger('click')

    expect(wrapper.emitted('open-social')).toBeTruthy()
  })

  it('emits open-auth when Cloud Sync button is clicked', async () => {
    const wrapper = mount(HeaderBar)
    const authBtn = wrapper.find('.auth-btn')
    expect(authBtn.exists()).toBe(true)
    await authBtn.trigger('click')

    expect(wrapper.emitted('open-auth')).toBeTruthy()
  })

  it('emits open-quick-add when Add from LeetCode/CF button is clicked', async () => {
    const wrapper = mount(HeaderBar)
    const quickAddBtn = wrapper.find('.quick-add-btn')
    expect(quickAddBtn.exists()).toBe(true)
    await quickAddBtn.trigger('click')

    expect(wrapper.emitted('open-quick-add')).toBeTruthy()
  })
})
