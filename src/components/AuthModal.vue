<template>
  <BaseModal
    title="Cloud Sync & Authentication"
    @close="$emit('close')"
  >
    <!-- Logged In State -->
    <div v-if="authStore.isLoggedIn" class="auth-section">
      <div class="user-profile-card glass-panel">
        <div class="user-avatar-wrap">
          <img
            v-if="userAvatar"
            :src="userAvatar"
            :alt="userName"
            class="user-avatar-img"
          />
          <div v-else class="user-avatar-placeholder">
            {{ userName.charAt(0).toUpperCase() }}
          </div>
        </div>

        <div class="user-info">
          <div class="user-name-row">
            <h3 class="user-name">{{ userName }}</h3>
            <span class="user-badge"><ShieldCheck :size="14" /> Cloud Verified</span>
          </div>
          <p class="user-email">{{ authStore.user?.email || 'Authenticated User' }}</p>

          <div class="user-stats-strip">
            <div class="stat-bubble">
              <Flame :size="14" class="stat-icon flame" />
              <span><strong>{{ currentStreak }}</strong> day streak</span>
            </div>
            <div class="stat-bubble">
              <CheckCircle2 :size="14" class="stat-icon check" />
              <span><strong>{{ solvedCount }}</strong> solved</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Cloud Sync Controller -->
      <div class="sync-panel glass-panel">
        <div class="sync-panel-header">
          <div class="sync-panel-title">
            <Database :size="18" class="database-icon" />
            <div>
              <h4>PostgreSQL Cloud Sync</h4>
              <p class="sync-subtitle">Sync topics, questions, and notes to your free Supabase DB</p>
            </div>
          </div>
          <span 
            class="sync-status-badge"
            :class="authStore.syncStatus"
          >
            {{ syncStatusText }}
          </span>
        </div>

        <div v-if="authStore.syncError" class="sync-error-banner">
          <AlertCircle :size="16" />
          <span>{{ authStore.syncError }}</span>
        </div>

        <div class="sync-actions">
          <button
            class="btn btn-primary sync-now-btn"
            :disabled="isSyncing"
            @click="triggerCloudSync"
          >
            <RefreshCw :size="16" :class="{ 'spinning': isSyncing }" />
            {{ isSyncing ? 'Syncing to Cloud...' : 'Sync Data Now' }}
          </button>
          <span class="sync-hint">Last synced: {{ lastSyncTime || 'Ready to sync' }}</span>
        </div>
      </div>

      <!-- Account Actions -->
      <div class="account-actions">
        <button class="btn btn-secondary danger-action" @click="handleSignOut">
          <LogOut :size="16" />
          Sign Out
        </button>
      </div>
    </div>

    <!-- Logged Out State -->
    <div v-else class="auth-section">
      <!-- Supabase Configured: Show OAuth Buttons -->
      <div v-if="authStore.isConfigured" class="oauth-container">
        <div class="auth-intro">
          <div class="auth-hero-badge">
            <Sparkles :size="16" /> 1-Click Free Cloud Sync
          </div>
          <h3>Sign in to SolvR</h3>
          <p>Back up your questions across devices, compare streaks with peers, and never lose your notes.</p>
        </div>

        <div class="oauth-buttons">
          <button class="btn oauth-btn github-btn" @click="handleOAuth('github')">
            <svg class="oauth-icon" viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>

          <button class="btn oauth-btn google-btn" @click="handleOAuth('google')">
            <svg class="oauth-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            Continue with Google
          </button>
        </div>

        <p class="privacy-note">
          By continuing, you agree to store your question progress in your private Postgres cloud workspace.
        </p>
      </div>

      <!-- Supabase Not Yet Configured: Setup Helper -->
      <div v-else class="setup-guide">
        <div class="guide-header">
          <div class="guide-icon-wrap">
            <Database :size="24" />
          </div>
          <div>
            <h3>Free Database Integration Ready</h3>
            <p>Connect your free Supabase Postgres DB for multi-device sync & social features.</p>
          </div>
        </div>

        <div class="offline-callout">
          <span class="offline-pill">Offline First</span>
          <span>Your question tracker is currently working 100% offline via local storage. Everything you add is saved safely in this browser!</span>
        </div>

        <div class="setup-steps">
          <div class="step-card">
            <span class="step-num">1</span>
            <div class="step-content">
              <strong>Create Free Project</strong>
              <p>Sign up at <a href="https://supabase.com" target="_blank" rel="noopener" class="external-link">supabase.com <ExternalLink :size="12" /></a> (free forever, no credit card required).</p>
            </div>
          </div>

          <div class="step-card">
            <span class="step-num">2</span>
            <div class="step-content">
              <strong>Execute Schema SQL</strong>
              <p>Open Supabase SQL Editor and run the pre-built schema file located at <code>supabase/schema.sql</code>.</p>
            </div>
          </div>

          <div class="step-card">
            <span class="step-num">3</span>
            <div class="step-content">
              <strong>Set Environment Variables</strong>
              <p>Add <code>VITE_SUPABASE_URL</code> & <code>VITE_SUPABASE_ANON_KEY</code> to your Vercel Project Settings or local <code>.env.local</code>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button class="btn btn-secondary" @click="$emit('close')">Close</button>
    </template>
  </BaseModal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  Database,
  Flame,
  Sparkles,
  ExternalLink
} from 'lucide-vue-next'
import BaseModal from './BaseModal.vue'
import { useAuthStore } from '../stores/authStore'
import { useQuestionStore } from '../stores/questionStore'

defineEmits<{
  (e: 'close'): void
}>()

const authStore = useAuthStore()
const questionStore = useQuestionStore()

const isSyncing = ref(false)
const lastSyncTime = ref<string | null>(null)

const userName = computed(() => {
  if (authStore.profile?.display_name) return authStore.profile.display_name
  if (authStore.user?.user_metadata?.full_name) return authStore.user.user_metadata.full_name
  if (authStore.user?.email) return authStore.user.email.split('@')[0]
  return 'Coder'
})

const userAvatar = computed(() => {
  return authStore.profile?.avatar_url || authStore.user?.user_metadata?.avatar_url || ''
})

const currentStreak = computed(() => {
  return questionStore.streakInfo.currentStreak
})

const solvedCount = computed(() => {
  return questionStore.overallProgress.solved
})

const syncStatusText = computed(() => {
  switch (authStore.syncStatus) {
    case 'syncing': return 'Syncing...'
    case 'synced': return 'All changes saved'
    case 'error': return 'Sync error'
    default: return 'Ready'
  }
})

const handleOAuth = async (provider: 'github' | 'google') => {
  try {
    await authStore.signInWithOAuth(provider)
  } catch (err: unknown) {
    authStore.syncError = err instanceof Error ? err.message : 'Sign in failed'
  }
}

const handleSignOut = async () => {
  await authStore.signOut()
}

const triggerCloudSync = async () => {
  isSyncing.value = true
  try {
    const success = await authStore.syncLocalToCloud(
      questionStore.topics,
      questionStore.subTopics,
      questionStore.questions,
      questionStore.activityLog
    )
    if (success) {
      lastSyncTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  } finally {
    isSyncing.value = false
  }
}
</script>

<style scoped>
.auth-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.glass-panel {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(12px);
  padding: 18px;
}

.user-profile-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-avatar-wrap {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--accent-cyan);
  box-shadow: 0 0 15px rgba(6, 182, 212, 0.25);
  flex-shrink: 0;
}

.user-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--accent-emerald), var(--accent-cyan));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: 700;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-name {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: var(--text-primary);
}

.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--accent-emerald);
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.user-email {
  margin: 2px 0 10px;
  font-size: 13px;
  color: var(--text-muted);
}

.user-stats-strip {
  display: flex;
  gap: 12px;
}

.stat-bubble {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.05);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-icon.flame {
  color: var(--accent-orange);
}

.stat-icon.check {
  color: var(--accent-emerald);
}

.sync-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sync-panel-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sync-panel-title h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.sync-subtitle {
  margin: 2px 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

.database-icon {
  color: var(--accent-cyan);
}

.sync-status-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.sync-status-badge.idle,
.sync-status-badge.synced {
  background: rgba(16, 185, 129, 0.15);
  border: 1px solid rgba(16, 185, 129, 0.3);
  color: var(--accent-emerald);
}

.sync-status-badge.syncing {
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: var(--accent-cyan);
}

.sync-status-badge.error {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: var(--accent-red);
}

.sync-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.sync-now-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.sync-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.account-actions {
  display: flex;
  justify-content: flex-end;
}

.danger-action {
  color: var(--accent-red);
  border-color: rgba(239, 68, 68, 0.3);
}

.danger-action:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: var(--accent-red);
}

/* OAuth View */
.oauth-container {
  text-align: center;
  padding: 8px 0;
}

.auth-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: rgba(6, 182, 212, 0.12);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: var(--accent-cyan);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
}

.auth-intro h3 {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--text-primary);
}

.auth-intro p {
  font-size: 14px;
  color: var(--text-secondary);
  max-width: 440px;
  margin: 0 auto 24px;
  line-height: 1.5;
}

.oauth-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 320px;
  margin: 0 auto 20px;
}

.oauth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 20px;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 14px;
  transition: all var(--transition-fast);
}

.github-btn {
  background: #24292e;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.github-btn:hover {
  background: #2f363d;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.google-btn {
  background: #ffffff;
  color: #3c4043;
  border: 1px solid #dadce0;
}

.google-btn:hover {
  background: #f8f9fa;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.privacy-note {
  font-size: 12px;
  color: var(--text-muted);
  max-width: 380px;
  margin: 0 auto;
  line-height: 1.4;
}

/* Setup Guide */
.setup-guide {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.guide-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.guide-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.3);
  color: var(--accent-cyan);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.guide-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.guide-header p {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.offline-callout {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  border-radius: var(--radius-md);
  font-size: 12px;
  color: var(--accent-emerald);
}

.offline-pill {
  padding: 2px 6px;
  background: var(--accent-emerald);
  color: #000;
  font-weight: 700;
  border-radius: 4px;
  font-size: 10px;
  text-transform: uppercase;
}

.setup-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.step-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 14px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
}

.step-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(6, 182, 212, 0.2);
  color: var(--accent-cyan);
  font-weight: 700;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-content {
  font-size: 13px;
  color: var(--text-secondary);
}

.step-content strong {
  display: block;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.step-content p {
  margin: 0;
}

.step-content code {
  background: rgba(0, 0, 0, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--accent-cyan);
  font-size: 12px;
}

.external-link {
  color: var(--accent-cyan);
  text-decoration: underline;
  display: inline-flex;
  align-items: center;
  gap: 3px;
}
</style>
