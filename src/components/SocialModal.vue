<template>
  <BaseModal
    title="Coding Partners & Leaderboard"
    @close="$emit('close')"
  >
    <!-- Subtitle & Mode Toggle -->
    <div class="social-header-row">
      <div class="tab-pills">
        <button
          class="tab-pill"
          :class="{ active: activeTab === 'leaderboard' }"
          @click="activeTab = 'leaderboard'"
        >
          <Trophy :size="15" />
          Global Leaderboard ({{ authStore.leaderboard.length }})
        </button>
        <button
          class="tab-pill"
          :class="{ active: activeTab === 'following' }"
          @click="activeTab = 'following'"
        >
          <Users :size="15" />
          Following ({{ authStore.friends.length }})
        </button>
      </div>
    </div>

    <!-- Search Input -->
    <div class="search-box">
      <Search :size="16" class="search-icon" />
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search friends by handle or name..."
        class="search-input"
      />
      <button
        v-if="searchQuery"
        class="clear-btn"
        @click="searchQuery = ''"
      >
        <X :size="14" />
      </button>
    </div>

    <!-- List of Users -->
    <div class="users-list">
      <div
        v-for="(coder, idx) in displayUsers"
        :key="coder.id"
        class="coder-card glass-panel"
        :class="{ 'is-following': authStore.isFollowing(coder.id) }"
      >
        <!-- Rank Pill -->
        <div class="rank-badge" :class="getRankClass(idx)">
          <span v-if="idx === 0">🥇</span>
          <span v-else-if="idx === 1">🥈</span>
          <span v-else-if="idx === 2">🥉</span>
          <span v-else>#{{ idx + 1 }}</span>
        </div>

        <!-- Avatar -->
        <div class="coder-avatar">
          <img
            v-if="coder.avatar_url"
            :src="coder.avatar_url"
            :alt="coder.display_name"
            class="avatar-img"
          />
          <div v-else class="avatar-fallback">
            {{ coder.display_name.charAt(0) }}
          </div>
        </div>

        <!-- Name & Details -->
        <div class="coder-meta">
          <div class="name-row">
            <span class="coder-name">{{ coder.display_name }}</span>
            <span class="coder-handle">@{{ coder.username }}</span>
          </div>

          <div class="stats-row">
            <span class="stat-tag streak">
              <Flame :size="12" />
              {{ coder.current_streak }}d streak
            </span>
            <span class="stat-tag solved">
              <CheckCircle2 :size="12" />
              {{ coder.total_solved }} solved
            </span>
          </div>
        </div>

        <!-- Follow Button -->
        <button
          class="btn follow-btn"
          :class="authStore.isFollowing(coder.id) ? 'btn-following' : 'btn-follow'"
          @click="toggleFollow(coder.id)"
        >
          <UserCheck v-if="authStore.isFollowing(coder.id)" :size="14" />
          <UserPlus v-else :size="14" />
          {{ authStore.isFollowing(coder.id) ? 'Following' : 'Follow' }}
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="displayUsers.length === 0" class="empty-state">
        <Users :size="40" class="empty-icon" />
        <p v-if="activeTab === 'following'">
          You haven't followed any coding peers yet. Browse the global leaderboard to discover interview study partners!
        </p>
        <p v-else>
          No coders found matching "{{ searchQuery }}".
        </p>
      </div>
    </div>

    <template #footer>
      <div class="social-footer">
        <span class="sync-note">
          <Sparkles :size="14" />
          Streaks and questions solved update automatically
        </span>
        <button class="btn btn-secondary" @click="$emit('close')">Close</button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Trophy,
  Users,
  Search,
  X,
  Flame,
  CheckCircle2,
  UserPlus,
  UserCheck,
  Sparkles
} from 'lucide-vue-next'
import BaseModal from './BaseModal.vue'
import { useAuthStore } from '../stores/authStore'
import type { UserProfile } from '../services/supabase'

defineEmits<{
  (e: 'close'): void
}>()

const authStore = useAuthStore()

const activeTab = ref<'leaderboard' | 'following'>('leaderboard')
const searchQuery = ref('')

const displayUsers = computed<UserProfile[]>(() => {
  const baseList = activeTab.value === 'following'
    ? authStore.friends
    : authStore.leaderboard

  if (!searchQuery.value.trim()) {
    return baseList
  }

  const query = searchQuery.value.toLowerCase().trim()
  return baseList.filter(u =>
    u.display_name.toLowerCase().includes(query) ||
    u.username.toLowerCase().includes(query)
  )
})

const getRankClass = (idx: number) => {
  if (idx === 0) return 'rank-gold'
  if (idx === 1) return 'rank-silver'
  if (idx === 2) return 'rank-bronze'
  return 'rank-default'
}

const toggleFollow = (userId: string) => {
  authStore.toggleFollow(userId)
}
</script>

<style scoped>
.social-header-row {
  margin-bottom: 16px;
}

.tab-pills {
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.2);
  padding: 4px;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.tab-pill {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-pill:hover {
  color: var(--text-primary);
}

.tab-pill.active {
  background: var(--glass-bg);
  color: var(--accent-cyan);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.search-box {
  position: relative;
  margin-bottom: 16px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 36px 10px 36px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 13px;
  transition: all var(--transition-fast);
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-cyan);
  box-shadow: 0 0 10px rgba(6, 182, 212, 0.2);
}

.clear-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
}

.users-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 380px;
  overflow-y: auto;
  padding-right: 4px;
}

.glass-panel {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
}

.coder-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  transition: all var(--transition-fast);
}

.coder-card:hover {
  border-color: rgba(6, 182, 212, 0.3);
  transform: translateY(-1px);
}

.rank-badge {
  font-size: 14px;
  font-weight: 700;
  width: 28px;
  text-align: center;
  color: var(--text-muted);
}

.rank-gold, .rank-silver, .rank-bronze {
  font-size: 18px;
}

.coder-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  border: 1.5px solid var(--glass-border);
  flex-shrink: 0;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--accent-emerald), var(--accent-cyan));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
}

.coder-meta {
  flex: 1;
  min-width: 0;
}

.name-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.coder-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.coder-handle {
  font-size: 12px;
  color: var(--text-muted);
}

.stats-row {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.stat-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.stat-tag.streak {
  background: rgba(249, 115, 22, 0.12);
  color: var(--accent-orange);
}

.stat-tag.solved {
  background: rgba(16, 185, 129, 0.12);
  color: var(--accent-emerald);
}

.follow-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-follow {
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: var(--accent-cyan);
}

.btn-follow:hover {
  background: rgba(6, 182, 212, 0.25);
  border-color: var(--accent-cyan);
}

.btn-following {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid var(--glass-border);
  color: var(--text-muted);
}

.btn-following:hover {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.3);
  color: var(--accent-red);
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
  color: var(--text-muted);
  font-size: 13px;
}

.empty-icon {
  margin-bottom: 8px;
  opacity: 0.5;
}

.social-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.sync-note {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
