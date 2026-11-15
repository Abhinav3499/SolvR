import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import SocialModal from '../SocialModal.vue'
import { useAuthStore } from '../../stores/authStore'

describe('SocialModal.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  const mountModal = () => {
    return mount(SocialModal, {
      global: {
        stubs: {
          teleport: true
        }
      }
    })
  }

  it('renders leaderboard coders with rank badges and streaks', () => {
    const wrapper = mountModal()
    expect(wrapper.text()).toContain('Global Leaderboard')
    expect(wrapper.text()).toContain('Alex Chen')
    expect(wrapper.text()).toContain('@alex_coder')
    expect(wrapper.text()).toContain('28d streak')
    expect(wrapper.text()).toContain('142 solved')
  })

  it('filters coders via search query', async () => {
    const wrapper = mountModal()
    const input = wrapper.find('.search-input')
    await input.setValue('Priya')

    expect(wrapper.text()).toContain('Priya Sharma')
    expect(wrapper.text()).not.toContain('Alex Chen')
  })

  it('switches to Following tab and displays followed peers', async () => {
    const authStore = useAuthStore()
    authStore.followingIds = ['demo-user-1'] // Alex Chen

    const wrapper = mountModal()
    const followingTab = wrapper.findAll('.tab-pill').find(t => t.text().includes('Following'))
    expect(followingTab).toBeDefined()
    await followingTab?.trigger('click')

    expect(wrapper.text()).toContain('Alex Chen')
    expect(wrapper.text()).not.toContain('Sarah Miller')
  })

  it('toggles follow state when follow button is clicked', async () => {
    const authStore = useAuthStore()
    authStore.followingIds = []

    const wrapper = mountModal()
    const followBtns = wrapper.findAll('.follow-btn')
    expect(followBtns.length).toBeGreaterThan(0)

    // Click follow for first coder (demo-user-1)
    await followBtns[0].trigger('click')
    expect(authStore.isFollowing('demo-user-1')).toBe(true)
  })

  it('emits close event when Close button is clicked', async () => {
    const wrapper = mountModal()
    const closeBtn = wrapper.findAll('button').find(b => b.text().includes('Close'))
    expect(closeBtn).toBeDefined()
    await closeBtn?.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
