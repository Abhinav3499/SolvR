import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase, isSupabaseConfigured, type UserProfile } from '../services/supabase'
import type { User } from '@supabase/supabase-js'
import type { Topic, SubTopic, Question, ActivityLog } from '../types'

const LOCAL_FOLLOWING_KEY = 'solvr_following_users'

const DEMO_LEADERBOARD: UserProfile[] = [
  {
    id: 'demo-user-1',
    username: 'alex_coder',
    display_name: 'Alex Chen',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    current_streak: 28,
    longest_streak: 45,
    total_solved: 142,
    is_public: true
  },
  {
    id: 'demo-user-2',
    username: 'sarah_dev',
    display_name: 'Sarah Miller',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
    current_streak: 21,
    longest_streak: 30,
    total_solved: 119,
    is_public: true
  },
  {
    id: 'demo-user-3',
    username: 'dev_priya',
    display_name: 'Priya Sharma',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    current_streak: 15,
    longest_streak: 22,
    total_solved: 98,
    is_public: true
  },
  {
    id: 'demo-user-4',
    username: 'algo_master',
    display_name: 'Marcus Vance',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    current_streak: 9,
    longest_streak: 18,
    total_solved: 87,
    is_public: true
  },
  {
    id: 'demo-user-5',
    username: 'elena_code',
    display_name: 'Elena Rostova',
    avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
    current_streak: 12,
    longest_streak: 16,
    total_solved: 76,
    is_public: true
  }
]

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const profile = ref<UserProfile | null>(null)
  const isConfigured = ref(isSupabaseConfigured())
  const syncStatus = ref<'idle' | 'syncing' | 'synced' | 'error'>('idle')
  const syncError = ref('')
  
  // Stored set of following IDs (works both local and cloud)
  const loadFollowing = (): string[] => {
    try {
      const stored = localStorage.getItem(LOCAL_FOLLOWING_KEY)
      return stored ? JSON.parse(stored) : ['demo-user-1', 'demo-user-2']
    } catch {
      return ['demo-user-1', 'demo-user-2']
    }
  }

  const followingIds = ref<string[]>(loadFollowing())
  const leaderboard = ref<UserProfile[]>(DEMO_LEADERBOARD)

  const isLoggedIn = computed(() => Boolean(user.value))

  const friends = computed<UserProfile[]>(() => {
    return leaderboard.value.filter(u => followingIds.value.includes(u.id))
  })

  const isFollowing = (userId: string): boolean => {
    return followingIds.value.includes(userId)
  }

  const initAuth = async () => {
    if (!supabase) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user || null

      if (user.value) {
        await fetchProfile(user.value.id)
      }

      supabase.auth.onAuthStateChange(async (_event, session) => {
        user.value = session?.user || null
        if (user.value) {
          await fetchProfile(user.value.id)
        } else {
          profile.value = null
        }
      })
    } catch (err) {
      console.warn('Failed to initialize Supabase auth session:', err)
    }

    await fetchFriendsLeaderboard()
  }

  const fetchProfile = async (userId: string) => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        profile.value = data as UserProfile
      }
    } catch (err) {
      console.warn('Error fetching user profile:', err)
    }
  }

  const signInWithOAuth = async (provider: 'github' | 'google') => {
    if (!supabase) {
      throw new Error('Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    })

    if (error) throw error
  }

  const signOut = async () => {
    if (!supabase) {
      user.value = null
      profile.value = null
      return
    }
    await supabase.auth.signOut()
    user.value = null
    profile.value = null
    syncStatus.value = 'idle'
  }

  const syncLocalToCloud = async (
    topics: Topic[],
    subTopics: SubTopic[],
    questions: Question[],
    activityLog: ActivityLog = {}
  ): Promise<boolean> => {
    if (!supabase || !user.value) return false

    syncStatus.value = 'syncing'
    syncError.value = ''

    try {
      const userId = user.value.id

      // 1. Sync Topics
      if (topics.length > 0) {
        const topicsPayload = topics.map(t => ({
          id: t.id,
          user_id: userId,
          name: t.name,
          order_index: t.order
        }))
        const { error: tErr } = await supabase.from('topics').upsert(topicsPayload, { onConflict: 'id,user_id' })
        if (tErr) throw tErr
      }

      // 2. Sync SubTopics
      if (subTopics.length > 0) {
        const subTopicsPayload = subTopics.map(st => ({
          id: st.id,
          user_id: userId,
          topic_id: st.topicId,
          name: st.name,
          order_index: st.order
        }))
        const { error: stErr } = await supabase.from('subtopics').upsert(subTopicsPayload, { onConflict: 'id,user_id' })
        if (stErr) throw stErr
      }

      // 3. Sync Questions
      if (questions.length > 0) {
        const questionsPayload = questions.map(q => ({
          id: q.id,
          user_id: userId,
          topic_id: q.topicId,
          subtopic_id: q.subTopicId,
          title: q.title,
          difficulty: q.difficulty,
          link: q.link,
          resource: q.resource,
          tags: q.tags,
          notes: q.notes,
          is_solved: q.isSolved,
          is_starred: q.isStarred,
          is_revision: q.isRevision,
          last_practiced_at: q.lastPracticedAt,
          solved_at: q.solvedAt,
          order_index: q.order
        }))
        const { error: qErr } = await supabase.from('questions').upsert(questionsPayload, { onConflict: 'id,user_id' })
        if (qErr) throw qErr
      }

      // 4. Sync Activity Logs
      if (activityLog && Object.keys(activityLog).length > 0) {
        const logsPayload = Object.entries(activityLog).flatMap(([date, qIds]) =>
          qIds.map(qId => ({
            user_id: userId,
            question_id: qId,
            solved_date: date
          }))
        )
        if (logsPayload.length > 0) {
          const { error: aErr } = await supabase.from('activity_logs').upsert(logsPayload, { onConflict: 'user_id,question_id,solved_date' })
          if (aErr) console.warn('Could not upsert activity logs:', aErr)
        }
      }

      // 5. Update Profile stats
      const solvedCount = questions.filter(q => q.isSolved).length
      await supabase.from('profiles').update({
        total_solved: solvedCount,
        updated_at: new Date().toISOString()
      }).eq('id', userId)

      syncStatus.value = 'synced'
      return true
    } catch (err: unknown) {
      syncStatus.value = 'error'
      syncError.value = err instanceof Error ? err.message : 'Sync failed'
      return false
    }
  }

  const toggleFollow = async (targetUserId: string) => {
    if (followingIds.value.includes(targetUserId)) {
      followingIds.value = followingIds.value.filter(id => id !== targetUserId)
      if (supabase && user.value) {
        try {
          await supabase.from('follows').delete().match({
            follower_id: user.value.id,
            following_id: targetUserId
          })
        } catch (e) {
          console.warn('Could not remove cloud follow:', e)
        }
      }
    } else {
      followingIds.value.push(targetUserId)
      if (supabase && user.value) {
        try {
          await supabase.from('follows').insert({
            follower_id: user.value.id,
            following_id: targetUserId
          })
        } catch (e) {
          console.warn('Could not add cloud follow:', e)
        }
      }
    }

    try {
      localStorage.setItem(LOCAL_FOLLOWING_KEY, JSON.stringify(followingIds.value))
    } catch {
      // ignore local storage errors
    }
  }

  const fetchFriendsLeaderboard = async () => {
    if (!supabase) return

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_public', true)
        .order('total_solved', { ascending: false })
        .limit(20)

      if (!error && data && data.length > 0) {
        leaderboard.value = data as UserProfile[]
      }
    } catch (err) {
      console.warn('Error fetching leaderboard:', err)
    }
  }

  return {
    user,
    profile,
    isConfigured,
    syncStatus,
    syncError,
    followingIds,
    friends,
    leaderboard,
    isLoggedIn,
    isFollowing,
    initAuth,
    signInWithOAuth,
    signOut,
    syncLocalToCloud,
    toggleFollow,
    fetchFriendsLeaderboard
  }
})
