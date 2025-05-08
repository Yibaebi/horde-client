import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Notification } from '@/types/notifications';
import { notificationsApi } from '@/app/api/notifications';
import { socketService } from '@/app/socket';
import { toast } from 'sonner';

// Query keys
const NOTIFICATIONS_QUERY_KEY = ['notifications'];

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Fetch notifications with React Query
  const { data, isLoading } = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    staleTime: 1000 * 60 * 20, // 20 minutes
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const response = await notificationsApi.getNotifications({ limit: 5, read: true });
      setUnreadCount(response.total);

      return response.notifications;
    },
  });

  // Mark notification as read with React Query mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: (_, id) => {
      // Update the notifications in the cache
      queryClient.setQueryData<Notification[]>(
        NOTIFICATIONS_QUERY_KEY,
        oldData =>
          oldData?.map(notification =>
            notification._id === id ? { ...notification, read: true } : notification
          ) || []
      );

      setUnreadCount(prev => Math.max(0, prev - 1));
    },
    onError: () => toast.error('Failed to mark notification as read'),
  });

  // Mark all notifications as read with React Query mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.setQueryData<Notification[]>(
        NOTIFICATIONS_QUERY_KEY,
        oldData => oldData?.map(notification => ({ ...notification, read: true })) || []
      );

      setUnreadCount(0);
    },

    onError: () => toast.error('Failed to mark all notifications as read'),
  });

  // Handle mark as read
  const handleMarkAsRead = useCallback(
    (id: string) => markAsReadMutation.mutate(id),
    [markAsReadMutation]
  );

  // Handle mark all as read
  const handleMarkAllAsRead = useCallback(
    () => markAllAsReadMutation.mutate(),
    [markAllAsReadMutation]
  );

  // Socket connection for real-time notifications
  useEffect(() => {
    socketService.on('notification', (newNotification: Notification) => {
      queryClient.setQueryData<Notification[]>(NOTIFICATIONS_QUERY_KEY, (oldData = []) => [
        newNotification,
        ...oldData.slice(0, 4),
      ]);

      setUnreadCount(prev => prev + 1);

      toast.info('New notification received');
    });

    return () => socketService.off('notification');
  }, [queryClient]);

  return {
    notifications: data || [],
    unreadCount,
    isLoading,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
  };
};
