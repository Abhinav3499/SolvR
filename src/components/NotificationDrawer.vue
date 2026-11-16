<script setup lang="ts">
import { computed } from 'vue';
import { useNotificationStore } from '../stores/notificationStore';
import {
  Bell,
  X,
  CheckCheck,
  Clock,
  Flame,
  Building,
  Info,
  ExternalLink,
  Trash2,
} from 'lucide-vue-next';

const notificationStore = useNotificationStore();

const unreadCount = computed(() => notificationStore.unreadCount);

function formatTimestamp(isoString: string): string {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (60 * 1000));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'spaced_repetition':
      return Clock;
    case 'streak_risk':
      return Flame;
    case 'company_update':
      return Building;
    default:
      return Info;
  }
}

function getTypeBadgeColor(type: string) {
  switch (type) {
    case 'spaced_repetition':
      return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'streak_risk':
      return 'text-rose-400 bg-rose-400/10 border-rose-400/20';
    case 'company_update':
      return 'text-sky-400 bg-sky-400/10 border-sky-400/20';
    default:
      return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
  }
}
</script>

<template>
  <div v-if="notificationStore.isDrawerOpen" class="fixed inset-0 z-50 flex justify-end">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      @click="notificationStore.closeDrawer"
    />

    <!-- Drawer Panel -->
    <aside
      class="relative z-10 w-full max-w-md h-full flex flex-col bg-slate-900/95 backdrop-blur-2xl border-l border-white/10 text-white shadow-2xl animate-in slide-in-from-right duration-200"
    >
      <!-- Header -->
      <div class="px-6 py-5 border-b border-white/10 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Bell class="w-5 h-5" />
          </div>
          <div>
            <h2 class="text-base font-semibold text-white tracking-wide">Notifications</h2>
            <p class="text-xs text-slate-400">
              {{ unreadCount }} unread reminder{{ unreadCount === 1 ? '' : 's' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-1.5">
          <button
            v-if="unreadCount > 0"
            title="Mark all as read"
            class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            @click="notificationStore.markAllAsRead()"
          >
            <CheckCheck class="w-4 h-4" />
          </button>
          <button
            title="Close"
            class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition"
            @click="notificationStore.closeDrawer"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-3">
        <div
          v-if="notificationStore.notifications.length === 0"
          class="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3"
        >
          <div class="p-4 rounded-full bg-white/5 border border-white/10">
            <CheckCheck class="w-8 h-8 text-emerald-400" />
          </div>
          <p class="text-sm font-medium text-slate-300">All caught up!</p>
          <p class="text-xs text-slate-500 max-w-xs">
            Spaced repetition reminders and tag alerts will appear here when ready.
          </p>
        </div>

        <div
          v-for="notif in notificationStore.notifications"
          :key="notif.id"
          class="group relative rounded-xl p-4 transition border"
          :class="[
            notif.isRead
              ? 'bg-white/[0.02] border-white/5 opacity-70 hover:opacity-100'
              : 'bg-white/[0.05] border-white/10 shadow-lg',
          ]"
        >
          <div class="flex items-start gap-3">
            <div
              class="p-2 rounded-lg border shrink-0 mt-0.5"
              :class="getTypeBadgeColor(notif.type)"
            >
              <component :is="getTypeIcon(notif.type)" class="w-4 h-4" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center justify-between gap-2">
                <h3 class="text-xs font-semibold text-white truncate">
                  {{ notif.title }}
                </h3>
                <span class="text-[10px] text-slate-400 shrink-0">
                  {{ formatTimestamp(notif.createdAt) }}
                </span>
              </div>

              <p class="text-xs text-slate-300 mt-1 leading-relaxed">
                {{ notif.body }}
              </p>

              <div class="mt-3 flex items-center justify-between">
                <a
                  v-if="notif.actionUrl"
                  :href="notif.actionUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  <span>Practice Problem</span>
                  <ExternalLink class="w-3.5 h-3.5" />
                </a>
                <span v-else />

                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    v-if="!notif.isRead"
                    title="Mark read"
                    class="p-1.5 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition"
                    @click="notificationStore.markAsRead(notif.id)"
                  >
                    <CheckCheck class="w-3.5 h-3.5" />
                  </button>
                  <button
                    title="Delete"
                    class="p-1.5 rounded-md hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                    @click="notificationStore.removeNotification(notif.id)"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  </div>
</template>
