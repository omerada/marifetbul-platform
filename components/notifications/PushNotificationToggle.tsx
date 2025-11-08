'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isSupported as isPushNotificationSupported,
  getPermissionStatus,
  isSubscribed as checkIfSubscribed,
} from '@/lib/infrastructure/services/push-notification.service';

/**
 * Push Notification Toggle Button
 * Production-ready component for managing push notification subscriptions
 */
export function PushNotificationToggle() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null
  );

  useEffect(() => {
    initializePushNotifications();
  }, []);

  async function initializePushNotifications() {
    try {
      // Check if push notifications are supported
      const supported = await isPushNotificationSupported();
      setIsSupported(supported);

      if (supported) {
        // Check current permission status
        const currentPermission = await getPermissionStatus();
        setPermission(currentPermission);

        // Check if device is already registered
        const subscribed = await checkIfSubscribed();
        setIsRegistered(subscribed);
      }
    } catch (error) {
      logger.error('Failed to initialize push notifications', error as Error);
    }
  }

  async function handleToggle() {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isRegistered) {
        // Unsubscribe
        await unsubscribeFromPushNotifications();
        setIsRegistered(false);
        toast.success('Push bildirimleri kapatıldı');
      } else {
        // Subscribe
        await subscribeToPushNotifications();
        setIsRegistered(true);
        setPermission('granted');
        toast.success('Push bildirimleri aktif edildi');
      }
    } catch (error) {
      logger.error('Failed to toggle push notifications', error as Error);
      toast.error('Push bildirimler ayarlanırken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }

  if (!isSupported) {
    return (
      <div className="text-muted-foreground text-sm">
        Push bildirimleri bu tarayıcıda desteklenmiyor
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="border-destructive/50 bg-destructive/10 rounded-lg border p-4">
        <div className="flex items-start gap-3">
          <BellOff className="text-destructive h-5 w-5" />
          <div className="flex-1 space-y-1">
            <p className="text-destructive text-sm font-medium">
              Bildirimler engellenmiş
            </p>
            <p className="text-muted-foreground text-xs">
              Tarayıcı ayarlarınızdan bildirimlere izin vermeniz gerekiyor.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={`flex items-center gap-3 rounded-lg border p-4 transition-colors ${
        isRegistered
          ? 'border-primary/50 bg-primary/10 hover:bg-primary/20'
          : 'border-border bg-card hover:bg-accent'
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : isRegistered ? (
        <Bell className="text-primary h-5 w-5" />
      ) : (
        <BellOff className="h-5 w-5" />
      )}
      <div className="flex-1 text-left">
        <p className="text-sm font-medium">
          {isRegistered ? 'Push Bildirimleri Aktif' : 'Push Bildirimleri'}
        </p>
        <p className="text-muted-foreground text-xs">
          {isRegistered
            ? 'Anında bildirim alıyorsunuz'
            : 'Anında bildirim almak için aktif edin'}
        </p>
      </div>
      <div
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isRegistered ? 'bg-primary' : 'bg-input'} `}
      >
        <span
          className={`bg-background inline-block h-4 w-4 transform rounded-full shadow-sm transition-transform ${isRegistered ? 'translate-x-6' : 'translate-x-1'} `}
        />
      </div>
    </button>
  );
}
