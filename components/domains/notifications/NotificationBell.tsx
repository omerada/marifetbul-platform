/**
 * ================================================
 * NOTIFICATION BELL COMPONENT
 * ================================================
 * Header notification bell with unread count badge
 * Shows dropdown with recent notifications
 *
 * Sprint Day 1 - Core Components
 * @version 1.0.0
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bell,
  BellRing,
  CheckCheck,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { useNotifications } from '@/hooks/business/useNotifications';
import { NotificationListItem } from './NotificationListItem';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { Notification } from '@/types/domains/notification';

export interface NotificationBellProps {
  className?: string;
  maxDropdownHeight?: string;
  showRecentCount?: number;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  className = '',
  maxDropdownHeight = 'max-h-[500px]',
  showRecentCount = 5,
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    logger.debug('NotificationBell', { isOpen: !isOpen });
  };

  const handleNotificationClick = async (notification: Notification) => {
    logger.debug('NotificationBell', { notification });

    // Mark as read if unread
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }

    // Close dropdown
    setIsOpen(false);

    // Navigate to action URL if provided
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleViewAll = () => {
    setIsOpen(false);
    router.push('/notifications');
  };

  const handleSettings = () => {
    setIsOpen(false);
    router.push('/settings/notifications');
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    logger.info('NotificationBell', { action: 'mark_all_as_read' });
  };

  // Get recent notifications (limit to showRecentCount)
  const recentNotifications = notifications.slice(0, showRecentCount);

  return (
    <div className={`relative ${className}`}>
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="relative rounded-lg p-2 transition-all hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
        aria-label="Bildirimler"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {unreadCount > 0 ? (
          <BellRing className="h-6 w-6 text-blue-600" />
        ) : (
          <Bell className="h-6 w-6 text-gray-600" />
        )}

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            size="sm"
            className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-xs font-bold"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}

        {/* Pulse animation for new notifications */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 animate-ping rounded-full bg-red-400 opacity-75"></span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="animate-in slide-in-from-top-2 fade-in-0 absolute top-full right-0 z-50 mt-2 w-96"
          role="menu"
          aria-orientation="vertical"
        >
          <div className="rounded-lg border border-gray-200 bg-white shadow-lg">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-gray-700" />
                <h3 className="font-semibold text-gray-900">Bildirimler</h3>
                {unreadCount > 0 && (
                  <Badge variant="destructive" size="sm">
                    {unreadCount}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    onClick={handleMarkAllAsRead}
                    size="sm"
                    variant="ghost"
                    className="h-8 px-2 text-xs"
                    title="Tümünü okundu işaretle"
                  >
                    <CheckCheck className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  onClick={handleSettings}
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-xs"
                  title="Bildirim ayarları"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Notification List */}
            <div className={`${maxDropdownHeight} overflow-y-auto`}>
              {isLoading ? (
                // Loading State
                <div className="space-y-2 p-4">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex animate-pulse items-start gap-3 rounded-lg border border-gray-200 p-3"
                    >
                      <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                        <div className="h-3 w-full rounded bg-gray-200"></div>
                        <div className="h-3 w-1/2 rounded bg-gray-200"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentNotifications.length === 0 ? (
                // Empty State
                <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
                  <div className="mb-4 rounded-full bg-gray-100 p-4">
                    <Bell className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    Bildirim yok
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Yeni bildirimleriniz burada görünecek
                  </p>
                </div>
              ) : (
                // Notification Items
                <div className="space-y-1 p-2">
                  {recentNotifications.map((notification) => (
                    <NotificationListItem
                      key={notification.id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                      onMarkAsRead={() => markAsRead(notification.id)}
                      showActions={false}
                      layout="list"
                      className="cursor-pointer hover:bg-gray-50"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {recentNotifications.length > 0 && (
              <div className="border-t border-gray-200 p-2">
                <Button
                  onClick={handleViewAll}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-center text-sm font-medium text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                >
                  Tümünü Görüntüle
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

NotificationBell.displayName = 'NotificationBell';

export default NotificationBell;
