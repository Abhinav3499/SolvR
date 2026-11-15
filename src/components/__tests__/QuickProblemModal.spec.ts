import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import QuickProblemModal from '../QuickProblemModal.vue'
import { useQuestionStore } from '../../stores/questionStore'

describe('QuickProblemModal.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  const mountModal = (props = {}) => {
    return mount(QuickProblemModal, {
      props,
      global: {
        stubs: {
          teleport: true
        }
      }
    })
  }

  it('renders default quick add tab with URL input', () => {
    const store = useQuestionStore()
    store.topics = [{ id: 't1', name: 'Arrays', order: 0 }]

    const wrapper = mountModal()
    expect(wrapper.text()).toContain('Add from LeetCode, Codeforces & Web')
    expect(wrapper.text()).toContain('Instant URL Importer')
    expect(wrapper.find('#problem-url').exists()).toBe(true)
  })

  it('auto parses pasted LeetCode URL', async () => {
    const store = useQuestionStore()
    store.topics = [{ id: 't1', name: 'Arrays', order: 0 }]

    const wrapper = mountModal()
    const input = wrapper.find('#problem-url')
    await input.setValue('https://leetcode.com/problems/container-with-most-water/')

    const titleInput = wrapper.find('#parsed-title').element as HTMLInputElement
    expect(titleInput.value).toBe('Container With Most Water')
    expect(wrapper.text()).toContain('LeetCode')
  })

  it('saves new question into questionStore', async () => {
    const store = useQuestionStore()
    store.topics = [{ id: 't1', name: 'Arrays', order: 0 }]

    const wrapper = mountModal({
      initialUrl: 'https://codeforces.com/contest/158/problem/A',
      initialTitle: 'CF 158A',
      initialPlatform: 'Codeforces'
    })

    const titleInput = wrapper.find('#parsed-title')
    await titleInput.setValue('CF 158A')

    const topicSelect = wrapper.find('#target-topic')
    await topicSelect.setValue('t1')

    const addBtn = wrapper.findAll('button').find(b => b.text().includes('Add to Sheet'))
    expect(addBtn).toBeDefined()
    expect(addBtn?.attributes('disabled')).toBeUndefined()
    await addBtn?.trigger('click')

    expect(wrapper.emitted('added')).toBeTruthy()
    expect(wrapper.emitted('close')).toBeTruthy()
    expect(store.questions.some(q => q.title.includes('CF 158A'))).toBe(true)
  })

  it('switches to 1-Click Bookmarklet tab and displays drag link', async () => {
    const wrapper = mountModal()
    const bookmarkletTab = wrapper.findAll('.tab-btn').find(b => b.text().includes('Bookmarklet'))
    expect(bookmarkletTab).toBeDefined()
    await bookmarkletTab?.trigger('click')

    expect(wrapper.text()).toContain('Add with 1 Click from Any Problem Page')
    expect(wrapper.find('.bookmarklet-drag-btn').exists()).toBe(true)
  })

  it('switches to Browser Extension tab and displays installation guide', async () => {
    const wrapper = mountModal()
    const extTab = wrapper.findAll('.tab-btn').find(b => b.text().includes('Browser Extension'))
    expect(extTab).toBeDefined()
    await extTab?.trigger('click')

    expect(wrapper.text()).toContain('Chrome, Edge & Brave Extension')
    expect(wrapper.text()).toContain('SolvR/extension')
  })

  it('emits close when Cancel button is clicked', async () => {
    const wrapper = mountModal()
    const cancelBtn = wrapper.findAll('button').find(b => b.text().includes('Cancel'))
    expect(cancelBtn).toBeDefined()
    await cancelBtn?.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
