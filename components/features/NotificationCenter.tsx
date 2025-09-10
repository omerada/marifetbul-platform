'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Bell,
  X,
  Check,
  AlertCircle,
  MessageSquare,
  DollarSign,
  Star,
  Calendar,
  User,
  ChevronRight,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export interface Notification {
  id: string;
  type: 'message' | 'proposal' | 'payment' | 'rating' | 'job_update' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
  actionLabel?: string;
  priority: 'low' | 'medium' | 'high';
  relatedUserId?: string;
  relatedUserName?: string;
  relatedUserAvatar?: string;
}

interface NotificationCenterProps {
  className?: string;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'Yeni Mesaj',
    message: 'Ahmet Yılmaz size yeni bir mesaj gönderdi.',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    priority: 'medium',
    relatedUserId: '1',
    relatedUserName: 'Ahmet Yılmaz',
    relatedUserAvatar: '/avatars/ahmet.jpg',
    actionUrl: '/messages/1',
    actionLabel: 'Mesajı Görüntüle',
  },
  {
    id: '2',
    type: 'proposal',
    title: 'Yeni Teklif',
    message: 'E-ticaret sitesi projeniz için yeni bir teklif aldınız.',
    read: false,
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    priority: 'high',
    relatedUserId: '2',
    relatedUserName: 'Zeynep Demir',
    relatedUserAvatar: '/avatars/zeynep.jpg',
    actionUrl: '/jobs/1/proposals',
    actionLabel: 'Teklifleri Görüntüle',
  },
  {
    id: '3',
    type: 'payment',
    title: 'Ödeme Alındı',
    message: '₺2,500 tutarında ödeme hesabınıza yatırıldı.',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    priority: 'medium',
    actionUrl: '/dashboard/payments',
    actionLabel: 'Ödemeleri Görüntüle',
  },
  {
    id: '4',
    type: 'rating',
    title: 'Yeni Değerlendirme',
    message: 'Müşteriniz size 5 yıldız verdi ve yorum bıraktı.',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    priority: 'low',
    relatedUserId: '3',
    relatedUserName: 'Mehmet Özkan',
    relatedUserAvatar: '/avatars/mehmet.jpg',
    actionUrl: '/profile/reviews',
    actionLabel: 'Değerlendirmeleri Görüntüle',
  },
  {
    id: '5',
    type: 'job_update',
    title: 'İş Güncellendi',
    message: 'Mobil uygulama geliştirme projenizde değişiklik yapıldı.',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    priority: 'medium',
    actionUrl: '/jobs/2',
    actionLabel: 'İşi Görüntüle',
  },
  {
    id: '6',
    type: 'system',
    title: 'Sistem Bildirimi',
    message: 'Profilinizi tamamlayarak daha fazla iş fırsatı yakalayın.',
    read: true,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    priority: 'low',
    actionUrl: '/profile/edit',
    actionLabel: 'Profili Tamamla',
  },
];

export function NotificationCenter({
  className = '',
}: NotificationCenterProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [showNotifications, setShowNotifications] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;
  const importantCount = notifications.filter(
    (n) => n.priority === 'high' && !n.read
  ).length;

  const filteredNotifications = notifications.filter((notification) => {
    switch (filter) {
      case 'unread':
        return !notification.read;
      case 'important':
        return notification.priority === 'high';
      default:
        return true;
    }
  });

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      case 'proposal':
        return <DollarSign className="h-4 w-4" />;
      case 'payment':
        return <DollarSign className="h-4 w-4" />;
      case 'rating':
        return <Star className="h-4 w-4" />;
      case 'job_update':
        return <Calendar className="h-4 w-4" />;
      case 'system':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getNotificationColor = (
    type: Notification['type'],
    priority: Notification['priority']
  ) => {
    if (priority === 'high') {
      return 'text-red-600 bg-red-100';
    }

    switch (type) {
      case 'message':
        return 'text-blue-600 bg-blue-100';
      case 'proposal':
        return 'text-green-600 bg-green-100';
      case 'payment':
        return 'text-green-600 bg-green-100';
      case 'rating':
        return 'text-yellow-600 bg-yellow-100';
      case 'job_update':
        return 'text-purple-600 bg-purple-100';
      case 'system':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {/* Notification Panel */}
      {showNotifications && (
        <Card className="absolute top-full right-0 z-50 mt-2 max-h-96 w-80 overflow-hidden shadow-lg">
          {/* Header */}
          <div className="border-b border-gray-200 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Bildirimler</h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowNotifications(false)}
                  className="p-1"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={filter === 'all' ? 'primary' : 'ghost'}
                onClick={() => setFilter('all')}
                className="text-xs"
              >
                Tümü ({notifications.length})
              </Button>
              <Button
                size="sm"
                variant={filter === 'unread' ? 'primary' : 'ghost'}
                onClick={() => setFilter('unread')}
                className="text-xs"
              >
                Okunmamış ({unreadCount})
              </Button>
              <Button
                size="sm"
                variant={filter === 'important' ? 'primary' : 'ghost'}
                onClick={() => setFilter('important')}
                className="text-xs"
              >
                Önemli ({importantCount})
              </Button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>Bildirim bulunamadı</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b border-gray-100 p-3 transition-colors hover:bg-gray-50 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div
                      className={`rounded-full p-1.5 ${getNotificationColor(notification.type, notification.priority)}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4
                          className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}
                        >
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                              className="p-1"
                              title="Okundu olarak işaretle"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification.id)}
                            className="p-1 text-red-600 hover:text-red-800"
                            title="Sil"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <p className="mb-1 text-xs text-gray-600">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(notification.timestamp, {
                            addSuffix: true,
                            locale: tr,
                          })}
                        </span>
                        {notification.actionUrl && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="p-1 text-xs text-blue-600 hover:text-blue-800"
                          >
                            {notification.actionLabel}
                            <ChevronRight className="ml-1 h-3 w-3" />
                          </Button>
                        )}
                      </div>

                      {/* Related User */}
                      {notification.relatedUserName && (
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-300">
                            <User className="h-3 w-3" />
                          </div>
                          <span className="text-xs text-gray-600">
                            {notification.relatedUserName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {unreadCount > 0 && (
            <div className="border-t border-gray-200 p-3">
              <Button
                size="sm"
                variant="outline"
                onClick={markAllAsRead}
                className="w-full text-xs"
              >
                <Check className="mr-1 h-3 w-3" />
                Tümünü Okundu İşaretle
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// Notification Hook for managing notifications globally
export function useNotifications() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  const addNotification = (
    notification: Omit<Notification, 'id' | 'timestamp'>
  ) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

  const getUnreadCount = () => {
    return notifications.filter((n) => !n.read).length;
  };

  return {
    notifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    unreadCount: getUnreadCount(),
  };
}
