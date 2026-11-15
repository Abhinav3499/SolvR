import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import ExportImportModal from '../ExportImportModal.vue'
import { useQuestionStore } from '../../stores/questionStore'

describe('ExportImportModal.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  const mountModal = () => {
    return mount(ExportImportModal, {
      global: {
        stubs: {
          teleport: true
        }
      }
    })
  }

  it('renders summary statistics in the Export tab', () => {
    const store = useQuestionStore()
    store.topics = [{ id: 't1', name: 'Arrays', order: 0 }]
    store.subTopics = [{ id: 'st1', topicId: 't1', name: 'Two Pointers', order: 0 }]
    store.questions = [{
      id: 'q1',
      topicId: 't1',
      subTopicId: 'st1',
      title: 'Two Sum',
      link: '',
      resource: '',
      difficulty: 'Easy',
      tags: [],
      notes: '',
      isSolved: false,
      isRevision: false,
      isStarred: false,
      order: 0
    }]

    const wrapper = mountModal()
    expect(wrapper.text()).toContain('Current Data Summary')
    expect(wrapper.text()).toContain('1')
    expect(wrapper.text()).toContain('Topics')
    expect(wrapper.text()).toContain('Questions')
  })

  it('switches between Export and Import tabs', async () => {
    const wrapper = mountModal()
    const tabs = wrapper.findAll('.tab-btn')
    expect(tabs).toHaveLength(2)

    // Initially in Export tab
    expect(wrapper.find('.export-actions').exists()).toBe(true)
    expect(wrapper.find('.file-dropzone').exists()).toBe(false)

    // Switch to Import tab
    await tabs[1].trigger('click')
    expect(wrapper.find('.export-actions').exists()).toBe(false)
    expect(wrapper.find('.file-dropzone').exists()).toBe(true)
  })

  it('emits close event when Close button is clicked', async () => {
    const wrapper = mountModal()
    const closeBtn = wrapper.findAll('button').find(b => b.text().includes('Close'))
    expect(closeBtn).toBeDefined()
    await closeBtn?.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('invokes store.getExportPayload when Download JSON is clicked', async () => {
    const store = useQuestionStore()
    const spy = vi.spyOn(store, 'getExportPayload')

    // Mock URL.createObjectURL and revokeObjectURL
    globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:dummy')
    globalThis.URL.revokeObjectURL = vi.fn()

    const wrapper = mountModal()
    const jsonBtn = wrapper.findAll('.action-option').find(b => b.text().includes('Download JSON'))
    expect(jsonBtn).toBeDefined()
    await jsonBtn?.trigger('click')

    expect(spy).toHaveBeenCalled()
  })
})
