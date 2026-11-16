export type NotificationType =
  | 'spaced_repetition'
  | 'streak_risk'
  | 'company_update'
  | 'system';

export interface NotificationDTO {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  actionUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface UserNotificationSettings {
  userId: string;
  emailRemindersEnabled: boolean;
  preferredReminderHourUtc: number;
  frequency: 'daily' | 'weekly';
  unsubscribeToken?: string;
  updatedAt?: string;
}
