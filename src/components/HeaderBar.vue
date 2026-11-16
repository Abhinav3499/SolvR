<template>
  <header class="header">
    <div class="header-left">
      <div class="logo-title-group">
        <h1>SolvR</h1>
      </div>
      <p>Build consistency. Measure progress. Crack interviews.</p>
    </div>
    <div class="progress-container">
      <div class="progress-pill-wrapper">
        <div class="streak-indicator" title="Current Daily Streak">
          <Flame :size="15" class="flame-icon" :class="{ active: streakInfo.currentStreak > 0 }" />
          <span>{{ streakInfo.currentStreak }}</span>
        </div>
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: progressPercentage + '%' }"
          ></div>
        </div>
        <div class="progress-text">
          <span>{{ progress.solved }}</span> / {{ progress.total }} solved
        </div>
      </div>

      <button class="btn btn-icon theme-toggle" @click="toggleTheme" :title="store.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'">
        <Sun v-if="store.theme === 'dark'" :size="18" />
        <Moon v-else :size="18" />
      </button>

      <button class="btn btn-icon notif-btn" @click="notificationStore.toggleDrawer" title="Notifications & Reminders">
        <Bell :size="18" />
        <span v-if="unreadNotifs > 0" class="notif-badge">{{ unreadNotifs }}</span>
      </button>

      <button class="btn btn-secondary share-btn" @click="$emit('open-share')" title="Share practice sheet snapshot">
        <Share2 :size="16" />
        <span class="btn-text">Share Sheet</span>
      </button>

      <button class="btn btn-secondary friends-btn" @click="$emit('open-social')" title="Coding partners & leaderboard">
        <Users :size="16" />
        <span class="btn-text">Friends</span>
        <span v-if="friendsCount > 0" class="friends-pill">{{ friendsCount }}</span>
      </button>

      <button 
        class="btn auth-btn"
        :class="authStore.isLoggedIn ? 'btn-auth-active' : 'btn-secondary'"
        @click="$emit('open-auth')"
        :title="authStore.isLoggedIn ? 'Account & Cloud Sync settings' : 'Connect free Supabase DB or sign in'"
      >
        <div v-if="authStore.isLoggedIn" class="user-avatar-mini">
          <img v-if="userAvatar" :src="userAvatar" class="avatar-mini-img" alt="avatar" />
          <span v-else>{{ userInitial }}</span>
        </div>
        <Cloud v-else :size="16" />
        <span class="btn-text">{{ authStore.isLoggedIn ? userName : 'Cloud Sync' }}</span>
      </button>

      <button class="btn btn-secondary quick-add-btn" @click="$emit('open-quick-add')" title="Add problem from LeetCode, Codeforces, or Browser">
        <Code2 :size="16" />
        <span class="btn-text">Add from LeetCode/CF</span>
      </button>

      <button class="btn btn-primary" @click="$emit('add-topic')">
        <Plus :size="16" />
        <span class="btn-text">Add Topic</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue'
import { Plus, Sun, Moon, Flame, Users, Cloud, Code2, Bell, Share2 } from 'lucide-vue-next'
import { useQuestionStore } from '../stores/questionStore'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'
import type { Theme } from '../types'

defineEmits<{
  (e: 'add-topic'): void
  (e: 'open-auth'): void
  (e: 'open-social'): void
  (e: 'open-quick-add'): void
  (e: 'open-share'): void
}>()

const store = useQuestionStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const progress = computed(() => store.overallProgress)
const streakInfo = computed(() => store.streakInfo)
const friendsCount = computed(() => authStore.friends.length)
const unreadNotifs = computed(() => notificationStore.unreadCount)

const userName = computed(() => {
  if (authStore.profile?.display_name) return authStore.profile.display_name
  if (authStore.user?.user_metadata?.full_name) return authStore.user.user_metadata.full_name
  if (authStore.user?.email) return authStore.user.email.split('@')[0]
  return 'Profile'
})

const userInitial = computed(() => {
  return userName.value.charAt(0).toUpperCase()
})

const userAvatar = computed(() => {
  return authStore.profile?.avatar_url || authStore.user?.user_metadata?.avatar_url || ''
})

const progressPercentage = computed<number>(() => 
  progress.value.total > 0 
    ? Math.round((progress.value.solved / progress.value.total) * 100) 
    : 0
)

const toggleTheme = () => {
  store.toggleTheme()
}

const applyTheme = (theme: Theme) => {
  document.documentElement.setAttribute('data-theme', theme)
}

watch(() => store.theme, (newTheme) => {
  applyTheme(newTheme)
}, { immediate: true })

onMounted(() => {
  applyTheme(store.theme)
  authStore.initAuth()
})
</script>

<style scoped>
.theme-toggle {
  padding: 8px;
  border-radius: 8px;
  color: var(--accent-yellow);
}

.theme-toggle:hover {
  background: rgba(240, 192, 0, 0.15);
}

.notif-btn {
  position: relative;
  padding: 8px;
  border-radius: 8px;
  color: var(--text-secondary);
}

.notif-btn:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.08);
}

.notif-badge {
  position: absolute;
  top: 2px;
  right: 2px;
  background: #f43f5e;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  border-radius: 9999px;
  padding: 1px 5px;
  line-height: 1;
}

.share-btn {
  background: rgba(139, 92, 246, 0.12);
  border-color: rgba(139, 92, 246, 0.3);
  color: #c084fc;
}

.share-btn:hover {
  background: rgba(139, 92, 246, 0.22);
  border-color: #c084fc;
}

.friends-btn {
  position: relative;
}

.friends-pill {
  background: var(--accent-cyan);
  color: #000;
  font-size: 10px;
  font-weight: 700;
  border-radius: 10px;
  padding: 1px 6px;
  margin-left: 2px;
}

.auth-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-auth-active {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: var(--accent-emerald);
}

.btn-auth-active:hover {
  background: rgba(16, 185, 129, 0.25);
  border-color: var(--accent-emerald);
}

.user-avatar-mini {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, var(--accent-emerald), var(--accent-cyan));
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-mini-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.quick-add-btn {
  background: rgba(6, 182, 212, 0.12);
  border-color: rgba(6, 182, 212, 0.3);
  color: var(--accent-cyan);
}

.quick-add-btn:hover {
  background: rgba(6, 182, 212, 0.22);
  border-color: var(--accent-cyan);
}

@media (max-width: 768px) {
  .btn-text {
    display: none;
  }
}
</style>
