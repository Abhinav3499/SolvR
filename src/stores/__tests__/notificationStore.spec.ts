import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useNotificationStore } from '../notificationStore';

describe('notificationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  it('computes unreadCount correctly', () => {
    const store = useNotificationStore();
    store.notifications = [
      {
        id: '1',
        type: 'spaced_repetition',
        title: 'Review 1',
        body: 'Body 1',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: '2',
        type: 'streak_risk',
        title: 'Review 2',
        body: 'Body 2',
        isRead: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: '3',
        type: 'company_update',
        title: 'Review 3',
        body: 'Body 3',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ];

    expect(store.unreadCount).toBe(2);
  });

  it('marks a single notification as read', async () => {
    const store = useNotificationStore();
    store.notifications = [
      {
        id: 'test-1',
        type: 'system',
        title: 'Welcome',
        body: 'Welcome to SolvR',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
    ];

    expect(store.unreadCount).toBe(1);
    await store.markAsRead('test-1');
    expect(store.notifications[0].isRead).toBe(true);
    expect(store.unreadCount).toBe(0);
  });

  it('marks all notifications as read', async () => {
    const store = useNotificationStore();
    store.notifications = [
      { id: '1', type: 'system', title: 'T1', body: 'B1', isRead: false, createdAt: '' },
      { id: '2', type: 'system', title: 'T2', body: 'B2', isRead: false, createdAt: '' },
    ];

    expect(store.unreadCount).toBe(2);
    await store.markAllAsRead();
    expect(store.unreadCount).toBe(0);
  });

  it('adds and removes notifications dynamically', () => {
    const store = useNotificationStore();
    const added = store.addNotification({
      type: 'spaced_repetition',
      title: 'Dynamic',
      body: 'Dynamic body',
      isRead: false,
    });

    expect(store.notifications[0].title).toBe('Dynamic');
    expect(store.unreadCount).toBeGreaterThan(0);

    store.removeNotification(added.id);
    expect(store.notifications.some((n) => n.id === added.id)).toBe(false);
  });

  it('toggles and closes drawer state', () => {
    const store = useNotificationStore();
    expect(store.isDrawerOpen).toBe(false);
    store.toggleDrawer();
    expect(store.isDrawerOpen).toBe(true);
    store.closeDrawer();
    expect(store.isDrawerOpen).toBe(false);
  });
});
