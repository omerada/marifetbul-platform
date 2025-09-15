import React, { useState, useEffect } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui/Card';
import { PushNotificationManager } from '@/lib/domains/notification/push-notifications';

interface PushNotificationToggleProps {
  userId?: string;
  onSubscriptionChange?: (subscribed: boolean) => void;
}

export function PushNotificationToggle({
  userId,
  onSubscriptionChange,
}: PushNotificationToggleProps) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [permissionState, setPermissionState] =
    useState<NotificationPermission>('default');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    checkPushSupport();
    checkSubscriptionStatus();
  }, []);

  const checkPushSupport = () => {
    const supported = PushNotificationManager.isSupported();
    setIsSupported(supported);

    if (supported) {
      setPermissionState(Notification.permission);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const subscribed = await PushNotificationManager.isSubscribed();
      setIsSubscribed(subscribed);
    } catch (error) {
      console.error('Abonelik durumu kontrol edilemedi:', error);
    }
  };

  const handleSubscribe = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const permission = await PushNotificationManager.requestPermission();

      if (permission !== 'granted') {
        setErrorMessage(
          'Bildirim izni verilmedi. Tarayıcı ayarlarından izin verebilirsiniz.'
        );
        setPermissionState(permission);
        return;
      }

      const subscription = await PushNotificationManager.subscribe();

      if (subscription) {
        // Send subscription to server
        const response = await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer mock-token-${userId}`,
          },
          body: JSON.stringify(subscription),
        });

        const data = await response.json();

        if (data.success) {
          setIsSubscribed(true);
          setPermissionState('granted');
          onSubscriptionChange?.(true);
        } else {
          throw new Error(data.message || 'Abonelik kaydedilemedi');
        }
      }
    } catch (error) {
      console.error('Push notification aboneliği başarısız:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Bildirim aboneliği sırasında bir hata oluştu'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const unsubscribed = await PushNotificationManager.unsubscribe();

      if (unsubscribed) {
        // Notify server about unsubscription
        const response = await fetch('/api/push/unsubscribe', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer mock-token-${userId}`,
          },
          body: JSON.stringify({
            subscriptionId: 'current-subscription-id',
          }),
        });

        const data = await response.json();

        if (data.success) {
          setIsSubscribed(false);
          onSubscriptionChange?.(false);
        } else {
          throw new Error(data.message || 'Abonelikten çıkılamadı');
        }
      }
    } catch (error) {
      console.error('Push notification abonelikten çıkma başarısız:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Abonelikten çıkma sırasında bir hata oluştu'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer mock-token-${userId}`,
        },
        body: JSON.stringify({
          title: 'Test Bildirimi',
          message:
            'Bu bir test bildirimidir. Push notification sistemi çalışıyor!',
          icon: '/icons/notification-icon.png',
          badge: '/icons/badge-icon.png',
          url: window.location.origin,
          actions: [
            {
              action: 'view',
              title: 'Görüntüle',
            },
            {
              action: 'dismiss',
              title: 'Kapat',
            },
          ],
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Test bildirimi gönderilemedi');
      }
    } catch (error) {
      console.error('Test bildirimi başarısız:', error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Test bildirimi gönderilirken bir hata oluştu'
      );
    }
  };

  const getStatusText = () => {
    if (!isSupported) {
      return 'Tarayıcınız push bildirimleri desteklemiyor';
    }

    switch (permissionState) {
      case 'granted':
        return isSubscribed
          ? 'Push bildirimler aktif'
          : 'Push bildirimler izin verildi';
      case 'denied':
        return 'Push bildirimler engellendi';
      default:
        return 'Push bildirimler için izin bekleniyor';
    }
  };

  const getStatusColor = () => {
    if (!isSupported || permissionState === 'denied') {
      return 'text-red-600';
    }
    if (permissionState === 'granted' && isSubscribed) {
      return 'text-green-600';
    }
    return 'text-orange-600';
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Push Bildirimler
            </h3>
            <p className={`text-sm ${getStatusColor()}`}>{getStatusText()}</p>
          </div>
          <div className="text-4xl">{isSubscribed ? '🔔' : '🔕'}</div>
        </div>

        {errorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        )}

        <div className="space-y-3">
          {!isSupported ? (
            <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
              <p className="text-sm text-gray-600">
                Tarayıcınız push bildirimleri desteklemiyor. Daha güncel bir
                tarayıcı kullanmayı deneyin.
              </p>
            </div>
          ) : permissionState === 'denied' ? (
            <div className="rounded-md border border-orange-200 bg-orange-50 p-3">
              <p className="text-sm text-orange-700">
                Push bildirimler engellenmiş. Tarayıcı ayarlarından izin
                verebilirsiniz:
              </p>
              <ol className="mt-2 list-inside list-decimal text-xs text-orange-600">
                <li>Adres çubuğundaki kilit simgesine tıklayın</li>
                <li>
                  Bildirimler seçeneğini &quot;İzin ver&quot; olarak değiştirin
                </li>
                <li>Sayfayı yenileyin</li>
              </ol>
            </div>
          ) : (
            <div className="flex flex-col space-y-2">
              {!isSubscribed ? (
                <Button
                  onClick={handleSubscribe}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading
                    ? 'Abone Olunuyor...'
                    : 'Push Bildirimlere Abone Ol'}
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    onClick={handleUnsubscribe}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {isLoading ? 'Abonelikten Çıkılıyor...' : 'Abonelikten Çık'}
                  </Button>
                  <Button
                    onClick={sendTestNotification}
                    variant="secondary"
                    className="w-full"
                  >
                    Test Bildirimi Gönder
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {isSupported && (
          <div className="border-t pt-3 text-xs text-gray-500">
            <p>
              Push bildirimler sayesinde yeni mesajlar, iş teklifleri ve
              ödemeler hakkında anında bilgilendirilirsiniz.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
