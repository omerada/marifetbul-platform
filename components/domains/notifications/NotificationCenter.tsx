'use client';

import React, { useState, useEffect } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { useNotification } from '@/hooks';
import { EnhancedNotification } from '@/types';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Filter,
  Eye,
  Archive,
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
  X,
  Calendar,
  User,
  ChevronRight,
} from 'lucide-react';

interface NotificationCenterProps {
  className?: string;
  onNotificationClick?: (notification: EnhancedNotification) => void;
  onSettingsClick?: () => void;
  maxHeight?: string;
}

export const NotificationCenter = React.memo<NotificationCenterProps>(
  ({
    className = '',
    onNotificationClick,
    onSettingsClick,
    maxHeight = 'h-96',
  }) => {
    const {
      notifications,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      unreadCount,
      isLoading,
      error,
      fetchNotifications,
    } = useNotification();

    // Mock archive function since it's not in the hook
    const archiveNotification = (notificationId: string) => {
      // For now, just delete the notification
      deleteNotification(notificationId);
    };

    const [activeTab, setActiveTab] = useState<
      'all' | 'unread' | 'payment' | 'order' | 'message'
    >('all');
    const [selectedNotifications, setSelectedNotifications] = useState<
      string[]
    >([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
      fetchNotifications();
    }, [fetchNotifications]);

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

    const filteredNotifications = notifications.filter(
      (notification: EnhancedNotification) => {
        switch (activeTab) {
          case 'unread':
            return !notification.isRead;
          case 'payment':
            return (
              notification.type.includes('payment') ||
              notification.type.includes('escrow') ||
              notification.type.includes('refund')
            );
          case 'order':
            return (
              notification.type.includes('order') ||
              notification.type.includes('service')
            );
          case 'message':
            return (
              notification.type.includes('message') ||
              notification.type.includes('proposal')
            );
          default:
            return true;
        }
      }
    );

    const handleNotificationClick = (notification: EnhancedNotification) => {
      if (!notification.isRead) {
        markAsRead([notification.id]);
      }
      onNotificationClick?.(notification);
    };

    const handleSelectNotification = (notificationId: string) => {
      setSelectedNotifications((prev) =>
        prev.includes(notificationId)
          ? prev.filter((id) => id !== notificationId)
          : [...prev, notificationId]
      );
    };

    const handleBulkMarkAsRead = () => {
      // Mark each selected notification as read individually
      markAsRead(selectedNotifications);
      setSelectedNotifications([]);
    };

    const handleBulkArchive = () => {
      selectedNotifications.forEach((id) => archiveNotification(id));
      setSelectedNotifications([]);
    };

    const handleBulkDelete = () => {
      selectedNotifications.forEach((id) => deleteNotification(id));
      setSelectedNotifications([]);
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

    // Toggle view for notification center
    if (className.includes('dropdown')) {
      return (
        <div className="relative">
          {/* Notification Bell */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <Badge
                variant="destructive"
                size="sm"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </Button>

          {/* Dropdown Panel */}
          {showNotifications && (
            <Card className="absolute top-full right-0 z-50 mt-2 max-h-96 w-80 overflow-hidden shadow-lg">
              <CardHeader className="border-b border-gray-200 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Bildirimler
                    {unreadCount > 0 && (
                      <Badge variant="destructive" size="sm">
                        {unreadCount}
                      </Badge>
                    )}
                  </CardTitle>
                  <Button
                    onClick={() => setShowNotifications(false)}
                    size="sm"
                    variant="outline"
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <BellOff className="mb-2 h-8 w-8 text-gray-400" />
                      <p className="text-gray-500">Bildirim bulunamadı</p>
                    </div>
                  ) : (
                    <div className="space-y-1 p-3">
                      {notifications
                        .slice(0, 5)
                        .map((notification: EnhancedNotification) => (
                          <div
                            key={notification.id}
                            className={`group flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all hover:bg-gray-50 ${
                              !notification.isRead
                                ? 'border-blue-200 bg-blue-50'
                                : 'border-gray-200'
                            }`}
                            onClick={() =>
                              handleNotificationClick(notification)
                            }
                          >
                            <div className="flex-shrink-0">
                              {getNotificationIcon(notification.type)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={getBadgeVariant(
                                        notification.type
                                      )}
                                      size="sm"
                                    >
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
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {formatTimeAgo(notification.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                {unreadCount > 0 && (
                  <div className="border-t border-gray-200 p-3">
                    <Button
                      onClick={markAllAsRead}
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                    >
                      <CheckCheck className="mr-1 h-3 w-3" />
                      Tümünü Okundu İşaretle
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      );
    }

    if (isLoading) {
      return (
        <Card className={className}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Bildirimler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                    <div className="flex-1">
                      <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                      <div className="mt-2 h-3 w-1/2 rounded bg-gray-200"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return (
        <Card className={className}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Bildirimler Yüklenemedi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{error}</p>
            <Button
              onClick={() => fetchNotifications()}
              className="mt-4"
              size="sm"
            >
              Tekrar Dene
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className={className}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Bildirimler
              {unreadCount > 0 && (
                <Badge variant="destructive" size="sm">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {selectedNotifications.length > 0 && (
                <>
                  <Button
                    onClick={handleBulkMarkAsRead}
                    size="sm"
                    variant="outline"
                    title="Seçilenleri okundu işaretle"
                  >
                    <Check className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={handleBulkArchive}
                    size="sm"
                    variant="outline"
                    title="Seçilenleri arşivle"
                  >
                    <Archive className="h-3 w-3" />
                  </Button>
                  <Button
                    onClick={handleBulkDelete}
                    size="sm"
                    variant="outline"
                    title="Seçilenleri sil"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
              {unreadCount > 0 && (
                <Button
                  onClick={markAllAsRead}
                  size="sm"
                  variant="outline"
                  title="Tümünü okundu işaretle"
                >
                  <CheckCheck className="h-3 w-3" />
                </Button>
              )}
              <Button
                onClick={onSettingsClick}
                size="sm"
                variant="outline"
                title="Bildirim ayarları"
              >
                <Settings className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="border-b border-gray-200 px-6 py-3">
            <div className="flex gap-1">
              <Button
                size="sm"
                variant={activeTab === 'all' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('all')}
                className="text-xs"
              >
                Tümü ({notifications.length})
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'unread' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('unread')}
                className="text-xs"
              >
                Okunmamış ({unreadCount})
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'payment' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('payment')}
                className="text-xs"
              >
                Ödeme
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'order' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('order')}
                className="text-xs"
              >
                Sipariş
              </Button>
              <Button
                size="sm"
                variant={activeTab === 'message' ? 'primary' : 'outline'}
                onClick={() => setActiveTab('message')}
                className="text-xs"
              >
                Mesaj
              </Button>
            </div>
          </div>

          <div className={`${maxHeight} overflow-y-auto`}>
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BellOff className="mb-2 h-8 w-8 text-gray-400" />
                <p className="text-gray-500">
                  {activeTab === 'unread'
                    ? 'Okunmamış bildirim yok'
                    : 'Bildirim bulunamadı'}
                </p>
              </div>
            ) : (
              <div className="space-y-1 px-6 pb-6">
                {filteredNotifications.map(
                  (notification: EnhancedNotification) => (
                    <div
                      key={notification.id}
                      className={`group flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all hover:bg-gray-50 ${
                        !notification.isRead
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-200'
                      } ${selectedNotifications.includes(notification.id) ? 'ring-2 ring-blue-300' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(
                            notification.id
                          )}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectNotification(notification.id);
                          }}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-shrink-0">
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={getBadgeVariant(notification.type)}
                                size="sm"
                              >
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
                            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  archiveNotification(notification.id);
                                }}
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0"
                                title="Arşivle"
                              >
                                <Archive className="h-3 w-3" />
                              </Button>
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                size="sm"
                                variant="outline"
                                className="h-6 w-6 p-0"
                                title="Sil"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);

NotificationCenter.displayName = 'NotificationCenter';
