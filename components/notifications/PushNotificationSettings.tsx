'use client';

import { useState, useEffect } from 'react';
import { Bell, Smartphone, Trash2, Send, Loader2 } from 'lucide-react';
import {
  getRegisteredDevices,
  unsubscribeFromPushNotifications,
  sendTestNotification,
} from '@/lib/services/firebase-messaging.service';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { logger } from '@/lib/shared/utils/logger';

interface DeviceToken {
  id: string;
  token: string;
  deviceType: string;
  deviceName?: string;
  isActive: boolean;
  createdAt: string;
  lastUsedAt?: string;
}

/**
 * Push Notification Settings Panel
 * Shows registered devices and management options
 */
export function PushNotificationSettings() {
  const [devices, setDevices] = useState<DeviceToken[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingDeviceId, setDeletingDeviceId] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  async function loadDevices() {
    setIsLoading(true);
    try {
      const deviceList = await getRegisteredDevices();
      setDevices(deviceList);
    } catch (error) {
      logger.error('Error loading devices:', error);
      toast.error('Cihazlar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteDevice(deviceId: string, _deviceToken: string) {
    if (!confirm('Bu cihazın kaydını kaldırmak istediğinizden emin misiniz?')) {
      return;
    }

    setDeletingDeviceId(deviceId);
    try {
      // Note: We need to pass the actual FCM token, not the device ID
      await unsubscribeFromPushNotifications();
      await loadDevices();
      toast.success('Cihaz kaydı kaldırıldı');
    } catch (error) {
      logger.error('Error deleting device:', error);
      toast.error('Cihaz silinirken hata oluştu');
    } finally {
      setDeletingDeviceId(null);
    }
  }

  async function handleSendTest() {
    setIsSendingTest(true);
    try {
      await sendTestNotification();
    } catch (error) {
      logger.error('Error sending test notification:', error);
    } finally {
      setIsSendingTest(false);
    }
  }

  function getDeviceIcon(deviceType: string) {
    switch (deviceType) {
      case 'ANDROID':
      case 'IOS':
        return <Smartphone className="h-5 w-5" />;
      case 'WEB':
      default:
        return <Bell className="h-5 w-5" />;
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (devices.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <Bell className="text-muted-foreground mx-auto h-12 w-12" />
        <h3 className="mt-4 text-lg font-medium">Kayıtlı cihaz yok</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Push bildirimleri almak için bir cihaz kaydedin
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Test Notification Button */}
      <div className="bg-card flex items-center justify-between rounded-lg border p-4">
        <div className="flex-1">
          <p className="text-sm font-medium">Test Bildirimi</p>
          <p className="text-muted-foreground text-xs">
            Push bildirim kurulumunu test edin
          </p>
        </div>
        <button
          onClick={handleSendTest}
          disabled={isSendingTest}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSendingTest ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          Test Gönder
        </button>
      </div>

      {/* Registered Devices */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium">
          Kayıtlı Cihazlar ({devices.length})
        </h3>
        <div className="space-y-2">
          {devices.map((device) => (
            <div
              key={device.id}
              className="bg-card flex items-start gap-3 rounded-lg border p-4"
            >
              <div className="mt-0.5">{getDeviceIcon(device.deviceType)}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">
                    {device.deviceName || 'Bilinmeyen Cihaz'}
                  </p>
                  {device.isActive && (
                    <span className="inline-flex items-center rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                      Aktif
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  {device.deviceType}
                </p>
                {device.lastUsedAt && (
                  <p className="text-muted-foreground text-xs">
                    Son kullanım:{' '}
                    {formatDistanceToNow(new Date(device.lastUsedAt), {
                      addSuffix: true,
                      locale: tr,
                    })}
                  </p>
                )}
                <p className="text-muted-foreground text-xs">
                  Kayıt:{' '}
                  {formatDistanceToNow(new Date(device.createdAt), {
                    addSuffix: true,
                    locale: tr,
                  })}
                </p>
              </div>
              <button
                onClick={() => handleDeleteDevice(device.id, device.token)}
                disabled={deletingDeviceId === device.id}
                className="text-destructive hover:bg-destructive/10 flex items-center gap-1 rounded-md px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingDeviceId === device.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Kaldır
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
