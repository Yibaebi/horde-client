import { api } from './axios';
import { Notification } from '@/types/notifications';
import { ApiResponse } from '@/types/api';

interface GetNotificationsParams {
  page?: number;
  limit?: number;
  type?: string;
  read?: boolean;
}

interface GetNotificationsResponse {
  notifications: Notification[];
  hasMore: boolean;
  total: number;
  unreadCount: number;
}

export const notificationsApi = {
  async getNotifications(params: GetNotificationsParams = {}): Promise<GetNotificationsResponse> {
    const response = await api.get<ApiResponse<GetNotificationsResponse>>('/user/notifications', {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        read: !!params.read,
        ...(params.type && { type: params.type }),
      },
    });

    return response.data.data;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/user/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch('/user/notifications/read-all');
  },

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/user/notifications/${id}`);
  },
};
