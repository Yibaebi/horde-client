import { useState, useEffect, useCallback } from 'react';
import { NotificationType, Notification } from '@/types/notifications';
import { NotificationItem } from '@/components/notifications/NotificationItem';
import { Button } from '@/components/ui/button';
import { Loader2, Filter, Check } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { notificationsApi } from '@/app/api/notifications';
import { socketService } from '@/app/socket';
import { toast } from 'sonner';

interface FilterState {
  type: NotificationType | 'ALL';
  read: 'ALL' | 'READ' | 'UNREAD';
}

const ITEMS_PER_PAGE = 10;

export const Notifications = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<FilterState>({ type: 'ALL', read: 'ALL' });

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(notifications.length);

  useEffect(() => {
    // Subscribe to notification events
    socketService.on('notification', (newNotification: Notification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setTotal(prev => prev + 1);

      toast.info('New notification received');
    });

    // Cleanup on unmount
    return () => socketService.off('notification');
  }, []);

  const fetchNotifications = useCallback(
    async (pageNum: number = 1, replace: boolean = true) => {
      try {
        setIsLoading(true);

        const response = await notificationsApi.getNotifications({
          page: pageNum,
          limit: ITEMS_PER_PAGE,
          type: filter.type === 'ALL' ? undefined : filter.type,
          read: filter.read === 'ALL' ? undefined : filter.read === 'READ',
        });

        setNotifications(prev =>
          replace ? response.notifications : [...prev, ...response.notifications]
        );

        setHasMore(response.hasMore);
        setTotal(response.total);
      } catch {
        toast.error('Failed to load notifications');
      } finally {
        setIsLoading(false);
      }
    },
    [filter]
  );

  useEffect(() => {
    setPage(1);
    fetchNotifications(1);
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id);

      setNotifications(prev =>
        prev.map(notification =>
          notification._id === id ? { ...notification, read: true } : notification
        )
      );

      toast.success('Notification marked as read');
    } catch {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();

      setNotifications(prev => prev.map(notification => ({ ...notification, read: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all notifications as read');
    }
  };

  const loadMore = () => {
    const nextPage = page + 1;

    setPage(nextPage);
    fetchNotifications(nextPage, false);
  };

  const filteredNotifications = notifications;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>

          <p className="text-sm text-muted-foreground mt-1">
            {total} notification{total !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-48">
          <Select
            value={filter.type}
            onValueChange={(value: NotificationType | 'ALL') =>
              setFilter(prev => ({ ...prev, type: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>

              {Object.values(NotificationType).map(type => (
                <SelectItem key={type} value={type}>
                  {type.replace(/_/g, ' ').toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <Select
            value={filter.read}
            onValueChange={(value: 'ALL' | 'READ' | 'UNREAD') =>
              setFilter(prev => ({ ...prev, read: value }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="READ">Read</SelectItem>
              <SelectItem value="UNREAD">Unread</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {notifications.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleMarkAllAsRead}
                  className="ml-auto h-8 !bg-primary !w-8 !text-muted-foreground hover:text-foreground !hover:bg-muted/50 transition-colors"
                >
                  <Check className="h-4 w-4 text-white" />
                </Button>
              </TooltipTrigger>

              <TooltipContent>
                <p>Mark all as read</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {isLoading && page === 1 ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="text-center p-12 bg-muted/10 rounded-lg">
          <Filter className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No notifications found</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="divide-y divide-border rounded-lg border bg-card">
            {filteredNotifications.map(notification => (
              <NotificationItem
                key={notification._id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
              />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-6">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={isLoading}
                className="min-w-[200px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Load More'
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
