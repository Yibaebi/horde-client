import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Calendar, Trash2, CheckCircle, ChevronRight, AlertCircle } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

import { Notification, NotificationType } from '@/types/notifications';

dayjs.extend(relativeTime);

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationIcon: FC<{ type: NotificationType }> = ({ type }) => {
  const iconBaseClasses = 'h-6 w-6 p-1.5 rounded-full';

  switch (type) {
    case NotificationType.WELCOME:
      return (
        <div className={`${iconBaseClasses} bg-indigo-100`}>
          <Bell className="h-3 w-3 text-indigo-600" />
        </div>
      );
    case NotificationType.BUDGET_CREATED:
      return (
        <div className={`${iconBaseClasses} bg-emerald-100`}>
          <Calendar className="h-3 w-3 text-emerald-600" />
        </div>
      );
    case NotificationType.BUDGET_THRESHOLD:
      return (
        <div className={`${iconBaseClasses} bg-amber-100`}>
          <AlertCircle className="h-3 w-3 text-amber-600" />
        </div>
      );
    case NotificationType.BUDGET_DELETED:
      return (
        <div className={`${iconBaseClasses} bg-rose-100`}>
          <Trash2 className="h-3 w-3 text-rose-600" />
        </div>
      );
    default:
      return (
        <div className={`${iconBaseClasses} bg-blue-100`}>
          <Bell className="h-3 w-3 text-blue-600" />
        </div>
      );
  }
};

const NotificationLink: FC<{ notification: Notification }> = ({ notification }) => {
  const { type, data } = notification;

  switch (type) {
    case NotificationType.BUDGET_CREATED:
    case NotificationType.BUDGET_THRESHOLD:
      if (data?.budgetId) {
        return (
          <Link
            to={`/dashboard/budgets/${data.budgetId}`}
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5 group"
          >
            View Budget
            <ChevronRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
          </Link>
        );
      }

      break;

    case NotificationType.WELCOME:
      return (
        <Link
          to="/dashboard/budgets/new"
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-0.5 group"
        >
          Create Budget
          <ChevronRight className="h-3.5 w-3.5 transform group-hover:translate-x-0.5 transition-transform" />
        </Link>
      );
  }

  return null;
};

export const NotificationItem: FC<NotificationItemProps> = ({ notification, onMarkAsRead }) => {
  const { _id, title, message, read, createdAt, type } = notification;
  const formattedTime = dayjs(createdAt).fromNow();

  return (
    <div
      className={`
        flex gap-4 p-4 border-l-4 hover:bg-gray-50 transition-all duration-200
        ${read ? 'border-l-transparent bg-white' : 'border-l-primary bg-primary/5'}
      `}
    >
      <div className="flex-shrink-0 mt-0.5">
        <NotificationIcon type={type} />
      </div>

      <div className="flex-grow space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h4 className={`font-medium text-sm ${!read ? 'text-gray-900' : 'text-gray-700'}`}>
            {title}
          </h4>

          <span className="text-xs text-muted-foreground whitespace-nowrap bg-gray-100 px-2 py-0.5 rounded-full">
            {formattedTime}
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>

        <div className="flex items-center justify-between pt-1.5">
          <NotificationLink notification={notification} />

          {!read && (
            <button
              onClick={() => onMarkAsRead(_id)}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 group transition-colors"
              aria-label="Mark as read"
            >
              <CheckCircle className="h-3.5 w-3.5 group-hover:text-primary transition-colors" />
              <span className="group-hover:text-primary transition-colors">Mark as read</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
