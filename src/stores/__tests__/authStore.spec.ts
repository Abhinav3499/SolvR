import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '../authStore'

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('initializes with default demo leaderboard and logged out state', () => {
    const store = useAuthStore()
    expect(store.isLoggedIn).toBe(false)
    expect(store.user).toBeNull()
    expect(store.leaderboard.length).toBeGreaterThan(0)
    expect(store.leaderboard[0].username).toBe('alex_coder')
  })

  it('tracks followed peers and toggles following state', async () => {
    const store = useAuthStore()
    const targetUserId = 'demo-user-4'

    expect(store.isFollowing(targetUserId)).toBe(false)

    await store.toggleFollow(targetUserId)
    expect(store.isFollowing(targetUserId)).toBe(true)
    expect(store.friends.some(f => f.id === targetUserId)).toBe(true)

    // Toggle off
    await store.toggleFollow(targetUserId)
    expect(store.isFollowing(targetUserId)).toBe(false)
    expect(store.friends.some(f => f.id === targetUserId)).toBe(false)
  })

  it('persists following list in localStorage', async () => {
    const store = useAuthStore()
    await store.toggleFollow('test-user-99')

    const stored = localStorage.getItem('solvr_following_users')
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed).toContain('test-user-99')
  })

  it('handles signOut safely', async () => {
    const store = useAuthStore()
    await store.signOut()
    expect(store.user).toBeNull()
    expect(store.profile).toBeNull()
    expect(store.isLoggedIn).toBe(false)
  })

  it('gracefully handles syncLocalToCloud when unauthenticated', async () => {
    const store = useAuthStore()
    const result = await store.syncLocalToCloud([], [], [])
    expect(result).toBe(false)
  })
})
