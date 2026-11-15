import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import AuthModal from '../AuthModal.vue'
import { useAuthStore } from '../../stores/authStore'
import type { User } from '@supabase/supabase-js'

describe('AuthModal.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  const mountModal = () => {
    return mount(AuthModal, {
      global: {
        stubs: {
          teleport: true
        }
      }
    })
  }

  it('renders free database setup guide when Supabase is not configured', () => {
    const authStore = useAuthStore()
    authStore.isConfigured = false

    const wrapper = mountModal()
    expect(wrapper.text()).toContain('Free Database Integration Ready')
    expect(wrapper.text()).toContain('Offline First')
    expect(wrapper.text()).toContain('supabase/schema.sql')
  })

  it('renders OAuth buttons when Supabase is configured and user is logged out', () => {
    const authStore = useAuthStore()
    authStore.isConfigured = true

    const wrapper = mountModal()
    expect(wrapper.text()).toContain('Sign in to SolvR')
    expect(wrapper.text()).toContain('Continue with GitHub')
    expect(wrapper.text()).toContain('Continue with Google')
  })

  it('renders user profile and sync panel when user is logged in', () => {
    const authStore = useAuthStore()
    authStore.user = {
      id: 'usr-1',
      app_metadata: {},
      user_metadata: { full_name: 'Coding Pro' },
      aud: 'authenticated',
      created_at: new Date().toISOString()
    } as unknown as User

    const wrapper = mountModal()
    expect(wrapper.text()).toContain('Coding Pro')
    expect(wrapper.text()).toContain('Cloud Verified')
    expect(wrapper.text()).toContain('PostgreSQL Cloud Sync')
    expect(wrapper.text()).toContain('Sign Out')
  })

  it('emits close event when Close button is clicked', async () => {
    const wrapper = mountModal()
    const closeBtn = wrapper.findAll('button').find(b => b.text().includes('Close'))
    expect(closeBtn).toBeDefined()
    await closeBtn?.trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })
})
