'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
import { logger } from '@/lib/shared/utils/logger';
  Download,
  Wifi,
  WifiOff,
  RefreshCw,
  Bell,
  Settings,
  Smartphone,
  CheckCircle,
  AlertCircle,
  X,
} from 'lucide-react';

interface PWAManagerProps {
  className?: string;
}

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function PWAManager({ className = '' }: PWAManagerProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [notificationsPermission, setNotificationsPermission] =
    useState<NotificationPermission>('default');
  const [cacheSize, setCacheSize] = useState('0 MB');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(navigator.onLine);

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    if (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as { standalone?: boolean }).standalone === true
    ) {
      setIsInstalled(true);
    }

    // Check notification permission
    if ('Notification' in window) {
      setNotificationsPermission(Notification.permission);
    }

    // Simulate cache size calculation
    if ('caches' in window) {
      calculateCacheSize();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const calculateCacheSize = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        let totalSize = 0;

        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const keys = await cache.keys();
          totalSize += keys.length * 1024; // Rough estimation
        }

        setCacheSize(`${(totalSize / (1024 * 1024)).toFixed(1)} MB`);
      }
    } catch (error) {
      logger.error('Cache size calculation failed:', error);
    }
  };

  const handleInstallApp = async () => {
    if (!installPrompt) return;

    try {
      await installPrompt.prompt();
      const choiceResult = await installPrompt.userChoice;

      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setShowInstallBanner(false);
      }

      setInstallPrompt(null);
    } catch (error) {
      logger.error('Installation failed:', error);
    }
  };

  const handleNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Bu tarayıcı bildirim özelliğini desteklemiyor.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationsPermission(permission);

      if (permission === 'granted') {
        new Notification('Marifet', {
          body: 'Bildirimler başarıyla etkinleştirildi!',
          icon: '/icon-192x192.png',
        });
      }
    } catch (error) {
      logger.error('Notification permission failed:', error);
    }
  };

  const handleClearCache = async () => {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
        setCacheSize('0 MB');
        alert('Önbellek temizlendi!');
      }
    } catch (error) {
      logger.error('Cache clearing failed:', error);
    }
  };

  const handleForceUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => {
          registration.update();
        });
      });
      setLastUpdate(new Date());
      alert('Uygulama güncelleme kontrolü yapıldı!');
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Install Banner */}
      {showInstallBanner && !isInstalled && (
        <Card className="border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="h-6 w-6 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-900">
                  Uygulamayı Yükle
                </h3>
                <p className="text-sm text-blue-700">
                  Marifet&apos;i ana ekranınıza ekleyin ve daha hızlı erişim
                  sağlayın.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={handleInstallApp}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="mr-1 h-4 w-4" />
                Yükle
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowInstallBanner(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Connection Status */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            <div>
              <h3 className="font-semibold">
                {isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
              </h3>
              <p className="text-sm text-gray-600">
                {isOnline
                  ? 'İnternet bağlantısı aktif'
                  : 'Çevrimdışı modda çalışıyorsunuz'}
              </p>
            </div>
          </div>
          {isOnline && (
            <div className="h-3 w-3 animate-pulse rounded-full bg-green-500" />
          )}
        </div>
      </Card>

      {/* PWA Features */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* App Installation */}
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-3">
            <Smartphone className="h-5 w-5" />
            <h3 className="font-semibold">Uygulama Durumu</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Yükleme Durumu</span>
              <div className="flex items-center gap-2">
                {isInstalled ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Yüklü</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-orange-600">Yüklü Değil</span>
                  </>
                )}
              </div>
            </div>

            {!isInstalled && installPrompt && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleInstallApp}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Uygulamayı Yükle
              </Button>
            )}
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-4">
          <div className="mb-3 flex items-center gap-3">
            <Bell className="h-5 w-5" />
            <h3 className="font-semibold">Bildirimler</h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Bildirim İzni</span>
              <div className="flex items-center gap-2">
                {notificationsPermission === 'granted' ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">Verildi</span>
                  </>
                ) : notificationsPermission === 'denied' ? (
                  <>
                    <X className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">Reddedildi</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-orange-600">Bekleniyor</span>
                  </>
                )}
              </div>
            </div>

            {notificationsPermission !== 'granted' && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleNotificationPermission}
                className="w-full"
              >
                <Bell className="mr-2 h-4 w-4" />
                Bildirimleri Etkinleştir
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Cache Management */}
      <Card className="p-4">
        <div className="mb-4 flex items-center gap-3">
          <Settings className="h-5 w-5" />
          <h3 className="font-semibold">Önbellek Yönetimi</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{cacheSize}</p>
            <p className="text-sm text-gray-600">Önbellek Boyutu</p>
          </div>

          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {lastUpdate.toLocaleDateString('tr-TR')}
            </p>
            <p className="text-sm text-gray-600">Son Güncelleme</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button size="sm" variant="outline" onClick={handleForceUpdate}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Güncellemeyi Kontrol Et
            </Button>

            <Button size="sm" variant="outline" onClick={handleClearCache}>
              <X className="mr-2 h-4 w-4" />
              Önbelleği Temizle
            </Button>
          </div>
        </div>
      </Card>

      {/* PWA Features Info */}
      <Card className="p-4">
        <h3 className="mb-3 font-semibold">PWA Özellikleri</h3>

        <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Çevrimdışı Çalışma</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Hızlı Yükleme</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Ana Ekrana Ekleme</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Push Bildirimleri</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Otomatik Güncelleme</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Native App Deneyimi</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// Hook for PWA functionality
export function usePWA() {
  const [isOnline, setIsOnline] = useState(true);
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Online/Offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);

    // Installation status
    const checkInstalled = () => {
      if (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as { standalone?: boolean }).standalone === true
      ) {
        setIsInstalled(true);
      }
    };

    // Install prompt availability
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setCanInstall(true);
    };

    checkInstalled();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  };

  return {
    isOnline,
    isInstalled,
    canInstall,
    requestNotificationPermission,
  };
}
