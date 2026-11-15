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

  it('emits open-export-import with import when Import CSV button is clicked', async () => {
    const wrapper = mount(HeaderBar)
    const importBtn = wrapper.findAll('button').find(b => b.text().includes('Import CSV'))
    expect(importBtn).toBeDefined()
    await importBtn?.trigger('click')

    expect(wrapper.emitted('open-export-import')?.[0]).toEqual(['import'])
  })

  it('emits open-export-import with export when Export button is clicked', async () => {
    const wrapper = mount(HeaderBar)
    const exportBtn = wrapper.findAll('button').find(b => b.text().includes('Export'))
    expect(exportBtn).toBeDefined()
    await exportBtn?.trigger('click')

    expect(wrapper.emitted('open-export-import')?.[0]).toEqual(['export'])
  })
})
