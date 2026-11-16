import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase, isSupabaseConfigured } from '../services/supabase';

export interface SolvrNotification {
  id: string;
  userId?: string;
  type: 'spaced_repetition' | 'streak_risk' | 'company_update' | 'system';
  title: string;
  body: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

const LOCAL_STORAGE_KEY = 'solvr_notifications';

interface NotificationRow {
  id: string;
  user_id: string;
  type: SolvrNotification['type'];
  title: string;
  body: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
}

export const useNotificationStore = defineStore('notification', () => {
  const notifications = ref<SolvrNotification[]>(loadLocalNotifications());
  const isDrawerOpen = ref(false);
  const isLoading = ref(false);

  const unreadCount = computed(() => notifications.value.filter((n) => !n.isRead).length);

  function loadLocalNotifications(): SolvrNotification[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parsing errors
    }
    // Default initial mock notification for demonstration
    return [
      {
        id: 'initial-spaced-rep',
        type: 'spaced_repetition',
        title: 'Review Due: Two Sum',
        body: 'You solved this problem 7 days ago. Practice now to strengthen recall!',
        actionUrl: 'https://leetcode.com/problems/two-sum/',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ];
  }

  function persistLocal() {
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notifications.value));
      } catch {
        // Ignore quota errors
      }
    }
  }

  async function fetchNotifications(userId?: string) {
    if (!isSupabaseConfigured() || !supabase || !userId) {
      return;
    }

    try {
      isLoading.value = true;
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        const rows = data as unknown as NotificationRow[];
        notifications.value = rows.map((row) => ({
          id: row.id,
          userId: row.user_id,
          type: row.type,
          title: row.title,
          body: row.body,
          actionUrl: row.action_url,
          isRead: row.is_read,
          createdAt: row.created_at,
        }));
        persistLocal();
      }
    } catch {
      // Fail silently and keep local notifications
    } finally {
      isLoading.value = false;
    }
  }

  async function markAsRead(id: string) {
    const item = notifications.value.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
      persistLocal();

      if (isSupabaseConfigured() && supabase && item.userId) {
        try {
          await supabase.from('notifications').update({ is_read: true }).eq('id', id);
        } catch {
          // Keep local state
        }
      }
    }
  }

  async function markAllAsRead(userId?: string) {
    notifications.value.forEach((n) => (n.isRead = true));
    persistLocal();

    if (isSupabaseConfigured() && supabase && userId) {
      try {
        await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
      } catch {
        // Keep local state
      }
    }
  }

  function addNotification(
    notif: Omit<SolvrNotification, 'id' | 'createdAt'>
  ): SolvrNotification {
    const newNotif: SolvrNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    notifications.value.unshift(newNotif);
    persistLocal();
    return newNotif;
  }

  function removeNotification(id: string) {
    notifications.value = notifications.value.filter((n) => n.id !== id);
    persistLocal();
  }

  function toggleDrawer() {
    isDrawerOpen.value = !isDrawerOpen.value;
  }

  function closeDrawer() {
    isDrawerOpen.value = false;
  }

  return {
    notifications,
    isDrawerOpen,
    isLoading,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    addNotification,
    removeNotification,
    toggleDrawer,
    closeDrawer,
  };
});
