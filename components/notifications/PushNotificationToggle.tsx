'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isPushNotificationSupported,
  getNotificationPermission,
  isCurrentDeviceRegistered,
} from '@/lib/services/firebase-messaging.service';
import { toast } from 'sonner';
import { logger } from '@/lib/shared/utils/logger';

/**
 * Push Notification Toggle Button
 * Allows users to enable/disable push notifications
 */
export function PushNotificationToggle() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null
  );

  useEffect(() => {
    // Check if push notifications are supported
    const supported = isPushNotificationSupported();
    setIsSupported(supported);

    if (supported) {
      // Check current permission status
      const currentPermission = getNotificationPermission();
      setPermission(currentPermission);

      // Check if device is already registered
      checkRegistrationStatus();
    }
  }, []);

  async function checkRegistrationStatus() {
    try {
      const registered = await isCurrentDeviceRegistered();
      setIsRegistered(registered);
    } catch (error) {
      logger.error('Error checking registration status:', error);
    }
  }

  async function handleToggle() {
    if (isLoading) return;

    setIsLoading(true);
    try {
      if (isRegistered) {
        // Unsubscribe
        const success = await unsubscribeFromPushNotifications();
        if (success) {
          setIsRegistered(false);
          setPermission('default');
        }
      } else {
        // Subscribe
        const success = await subscribeToPushNotifications();
        if (success) {
          setIsRegistered(true);
          setPermission('granted');
        }
      }
    } catch (error) {
      logger.error('Error toggling push notifications:', error);
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
