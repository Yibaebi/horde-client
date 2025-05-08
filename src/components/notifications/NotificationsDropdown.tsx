import { FC, useState, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, BellOff, Check } from 'lucide-react';

import { Notification } from '@/types/notifications';
import { NotificationsList } from '@/components/notifications/NotificationsList';
import { Button } from '@/components/ui/button';
import useClickOutside from '@/hooks/useClickOutside';

interface NotificationsDropdownProps {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationsDropdown: FC<NotificationsDropdownProps> = ({
  notifications,
  unreadCount,
  isLoading,
  onMarkAsRead,
  onMarkAllAsRead,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback(() => setIsOpen(false), []);
  useClickOutside(dropdownRef, handleClickOutside);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group p-2.5 rounded-xl flex items-center justify-center bg-white hover:bg-primary/10 transition-all duration-300 ease-in-out"
        aria-label="Notifications"
      >
        <Bell
          className={`h-5 w-5 ${isOpen ? 'text-primary' : 'text-gray-600 group-hover:text-primary'} transition-colors duration-300`}
        />

        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute right-0 z-50 mt-2 w-[420px] rounded-xl border border-gray-200 bg-white shadow-xl"
            >
              <div className="absolute -top-2 right-3 w-4 h-4 bg-white border-t border-l border-gray-200 transform rotate-45 z-10" />

              <div className="rounded-t-xl bg-gradient-to-r from-primary/10 to-transparent relative z-20">
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center space-x-2 z-20">
                    <Bell className="h-5 w-5 text-primary" />

                    <h3 className="font-semibold text-gray-800">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full font-medium">
                        {unreadCount} unread
                      </span>
                    )}
                  </div>

                  {notifications.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onMarkAllAsRead}
                      className="text-xs hover:bg-primary/10 hover:text-primary flex items-center gap-1"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Mark all read
                    </Button>
                  )}
                </div>
              </div>

              <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
                <NotificationsList
                  notifications={notifications}
                  isLoading={isLoading}
                  onMarkAsRead={onMarkAsRead}
                />
              </div>

              <div className="p-3 border-t bg-gray-50/50 rounded-b-xl">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="w-full text-xs text-gray-600 hover:text-white flex items-center justify-center gap-2"
                >
                  <BellOff className="h-3.5 w-3.5" />
                  Close notifications
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
