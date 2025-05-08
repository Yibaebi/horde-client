import { FC } from 'react';
import { Notification } from '@/types/notifications';
import { NotificationItem } from './NotificationItem';
import { Loader2, BellOff } from 'lucide-react';

interface NotificationsListProps {
  notifications: Notification[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
}

export const NotificationsList: FC<NotificationsListProps> = ({
  notifications,
  isLoading,
  onMarkAsRead,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-gray-500">Loading notifications...</p>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="bg-gray-100 p-3 rounded-full mb-3">
          <BellOff className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-base font-medium text-gray-700 mb-1">No notifications yet</p>
        <p className="text-sm text-gray-500 max-w-xs">
          When you receive notifications, they'll appear here
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {notifications.map(notification => (
        <NotificationItem
          key={notification._id}
          notification={notification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  );
};
