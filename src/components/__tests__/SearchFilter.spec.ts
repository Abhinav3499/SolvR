import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import SearchFilter from '../SearchFilter.vue'
import { useQuestionStore } from '../../stores/questionStore'

describe('SearchFilter.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('updates difficulty filter in the store when changed', async () => {
    const store = useQuestionStore()
    const wrapper = mount(SearchFilter)

    const selects = wrapper.findAll('select')
    const difficultySelect = selects[0]

    await difficultySelect.setValue('Hard')
    expect(store.filterDifficulty).toBe('Hard')
  })

  it('updates status filter in the store when changed', async () => {
    const store = useQuestionStore()
    const wrapper = mount(SearchFilter)

    const selects = wrapper.findAll('select')
    const statusSelect = selects[1]

    await statusSelect.setValue('starred')
    expect(store.filterStatus).toBe('starred')

    await statusSelect.setValue('due')
    expect(store.filterStatus).toBe('due')
  })

  it('updates search query in the store when input changes', async () => {
    const store = useQuestionStore()
    const wrapper = mount(SearchFilter)

    const searchInput = wrapper.find('.search-input')
    await searchInput.setValue('two sum')

    expect(store.searchQuery).toBe('two sum')
  })
})
