'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Notification } from '@/types';
import {
  Bell,
  Check,
  Archive,
  Trash2,
  Clock,
  AlertCircle,
  DollarSign,
  FileText,
  MessageCircle,
  Package,
  UserPlus,
  Heart,
  Star,
  Zap,
  Eye,
} from 'lucide-react';

interface NotificationItemProps {
  notification: Notification;
  onClick?: () => void;
  onMarkAsRead?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
  layout?: 'list' | 'card';
  className?: string;
}

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onClick,
  onMarkAsRead,
  onArchive,
  onDelete,
  showActions = true,
  layout = 'list',
  className = '',
}) => {
  const getNotificationIcon = (type: string) => {
    if (type.includes('payment'))
      return <DollarSign className="h-4 w-4 text-green-600" />;
    if (type.includes('escrow'))
      return <DollarSign className="h-4 w-4 text-green-600" />;
    if (type.includes('refund'))
      return <DollarSign className="h-4 w-4 text-orange-600" />;
    if (type.includes('invoice'))
      return <FileText className="h-4 w-4 text-blue-600" />;
    if (type.includes('proposal'))
      return <MessageCircle className="h-4 w-4 text-blue-600" />;
    if (type.includes('message'))
      return <MessageCircle className="h-4 w-4 text-blue-600" />;
    if (type.includes('order'))
      return <Package className="h-4 w-4 text-blue-600" />;
    if (type.includes('service'))
      return <Package className="h-4 w-4 text-green-600" />;
    if (type.includes('review'))
      return <Star className="h-4 w-4 text-yellow-600" />;
    if (type.includes('rating'))
      return <Star className="h-4 w-4 text-yellow-600" />;
    if (type.includes('follow'))
      return <UserPlus className="h-4 w-4 text-blue-600" />;
    if (type.includes('favorite'))
      return <Heart className="h-4 w-4 text-red-600" />;
    if (type.includes('promotion'))
      return <Zap className="h-4 w-4 text-purple-600" />;
    if (type.includes('system'))
      return <Bell className="h-4 w-4 text-gray-600" />;
    if (type.includes('security'))
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    if (type.includes('profile'))
      return <Eye className="h-4 w-4 text-blue-600" />;
    return <Bell className="h-4 w-4 text-gray-600" />;
  };

  const getNotificationBadge = (type: string) => {
    if (
      type.includes('payment') ||
      type.includes('escrow') ||
      type.includes('refund')
    ) {
      return 'Ödeme';
    }
    if (type.includes('order') || type.includes('service')) {
      return 'Sipariş';
    }
    if (type.includes('message') || type.includes('proposal')) {
      return 'Mesaj';
    }
    if (type.includes('review') || type.includes('rating')) {
      return 'Değerlendirme';
    }
    return 'Sistem';
  };

  const getBadgeVariant = (type: string) => {
    if (type.includes('payment') || type.includes('escrow')) {
      return 'success';
    }
    if (
      type.includes('failed') ||
      type.includes('rejected') ||
      type.includes('cancelled')
    ) {
      return 'destructive';
    }
    if (type.includes('order') || type.includes('proposal')) {
      return 'default';
    }
    return 'secondary';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor(
      (now.getTime() - time.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return 'Şimdi';
    if (diffInMinutes < 60) return `${diffInMinutes}dk önce`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}sa önce`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}g önce`;

    return time.toLocaleDateString('tr-TR');
  };

  if (layout === 'card') {
    return (
      <div
        className={`group cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md ${
          !notification.isRead
            ? 'border-blue-200 bg-blue-50'
            : 'border-gray-200 bg-white'
        } ${className}`}
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {getNotificationIcon(notification.type)}
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant={getBadgeVariant(notification.type)} size="sm">
                    {getNotificationBadge(notification.type)}
                  </Badge>
                  {!notification.isRead && (
                    <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                  )}
                </div>
                <h4
                  className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}
                >
                  {notification.title}
                </h4>
              </div>
              <span className="flex flex-shrink-0 items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {formatTimeAgo(notification.createdAt)}
              </span>
            </div>

            <p className="mb-3 text-sm text-gray-600">{notification.message}</p>

            {showActions && (
              <div className="flex items-center gap-2">
                {!notification.isRead && onMarkAsRead && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead();
                    }}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Okundu İşaretle
                  </Button>
                )}
                {onArchive && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive();
                    }}
                    size="sm"
                    variant="outline"
                    className="text-xs"
                  >
                    <Archive className="mr-1 h-3 w-3" />
                    Arşivle
                  </Button>
                )}
                {onDelete && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    size="sm"
                    variant="outline"
                    className="text-xs text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Sil
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // List layout (default)
  return (
    <div
      className={`group flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all hover:bg-gray-50 ${
        !notification.isRead ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
      } ${className}`}
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        {getNotificationIcon(notification.type)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant={getBadgeVariant(notification.type)} size="sm">
                {getNotificationBadge(notification.type)}
              </Badge>
              {!notification.isRead && (
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
              )}
            </div>
            <h4
              className={`text-sm ${!notification.isRead ? 'font-semibold' : 'font-medium'}`}
            >
              {notification.title}
            </h4>
            <p className="line-clamp-2 text-xs text-gray-600">
              {notification.message}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              {formatTimeAgo(notification.createdAt)}
            </span>
            {showActions && (
              <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                {!notification.isRead && onMarkAsRead && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead();
                    }}
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    title="Okundu işaretle"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                )}
                {onArchive && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onArchive();
                    }}
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    title="Arşivle"
                  >
                    <Archive className="h-3 w-3" />
                  </Button>
                )}
                {onDelete && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                    title="Sil"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
