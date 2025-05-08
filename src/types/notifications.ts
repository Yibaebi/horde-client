export enum NotificationType {
  WELCOME = 'welcome',
  BUDGET_CREATED = 'budget_created',
  BUDGET_THRESHOLD = 'budget_threshold',
  BUDGET_DELETED = 'budget_deleted',
}

export interface NotificationData {
  budgetId?: string;
  year?: number;
  month?: number;
  percentage?: number;
  isFirstNotification?: boolean;
}

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  read: boolean;
  data: NotificationData;
  type: NotificationType;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}
