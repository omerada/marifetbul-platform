import Link from 'next/link';
import type { Notification, NotificationType } from '@/types/core/notification';

interface NotificationItemProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
  showActions?: boolean;
}

export function NotificationItem({
  notification,
  onClick,
  showActions = true,
}: NotificationItemProps) {
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'job_application':
      case 'job_accepted':
      case 'job_completed':
        return '�';
      case 'payment_received':
        return '💰';
      case 'review_received':
        return '⭐';
      case 'message_received':
        return '💬';
      case 'system_update':
        return '⚙️';
      case 'promotion':
        return '🎁';
      case 'reminder':
        return '⏰';
      default:
        return '🔔';
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Az önce';
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} dakika önce`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} saat önce`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} gün önce`;
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div
      className={`cursor-pointer p-4 transition-colors hover:bg-gray-50 ${
        !notification.isRead ? 'bg-blue-50' : ''
      }`}
      onClick={() => onClick?.(notification)}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 text-2xl">
          {getNotificationIcon(notification.type)}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h4
              className={`text-sm font-semibold ${getPriorityColor(notification.priority)}`}
            >
              {notification.title}
            </h4>
            {!notification.isRead && (
              <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
            )}
          </div>
          <p className="mb-2 line-clamp-2 text-sm text-gray-600">
            {notification.message}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {formatTimestamp(notification.createdAt)}
            </span>
            {showActions && notification.actionUrl && (
              <Link
                href={notification.actionUrl}
                className="text-xs font-medium text-blue-600 hover:text-blue-700"
                onClick={(e) => e.stopPropagation()}
              >
                Görüntüle →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
