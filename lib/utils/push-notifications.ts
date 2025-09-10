/**
 * Push Notification Utilities
 * Tarayıcı push notification yönetimi
 */

export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private swRegistration: ServiceWorkerRegistration | null = null;
  private publicVapidKey =
    'BM8YECrNvBEQqGNMwf0TBL7TdCNz7TgPj8Qhc3k1n2PxYvZlCK8rKJI9SQJ1HFt2Bc7YxOGMp1s3ZL9rF4K3qA8'; // Demo key

  private constructor() {}

  static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  // Service Worker kaydı
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker desteklenmiyor');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      this.swRegistration = registration;
      console.log('Service Worker kayıt başarılı:', registration.scope);
      return registration;
    } catch (error) {
      console.error('Service Worker kayıt hatası:', error);
      return null;
    }
  }

  // Bildirim izni kontrolü
  async checkPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('Tarayıcı bildirimleri desteklenmiyor');
      return 'denied';
    }

    return Notification.permission;
  }

  // Bildirim izni isteme
  async requestPermission(): Promise<NotificationPermission> {
    const permission = await this.checkPermission();

    if (permission === 'granted') {
      return 'granted';
    }

    if (permission === 'denied') {
      throw new Error('Bildirim izni reddedildi');
    }

    try {
      const result = await Notification.requestPermission();
      return result;
    } catch (error) {
      console.error('Bildirim izni isteme hatası:', error);
      return 'denied';
    }
  }

  // Push subscription oluşturma
  async createPushSubscription(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      await this.registerServiceWorker();
    }

    if (!this.swRegistration) {
      throw new Error('Service Worker kayıt başarısız');
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          this.publicVapidKey
        ) as BufferSource,
      });

      return subscription;
    } catch (error) {
      console.error('Push subscription hatası:', error);
      return null;
    }
  }

  // Subscription'ı sunucuya kaydetme
  async subscribeToPush(
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        return { success: false, error: 'Bildirim izni verilmedi' };
      }

      const subscription = await this.createPushSubscription();
      if (!subscription) {
        return { success: false, error: 'Push subscription oluşturulamadı' };
      }

      // Subscription'ı sunucuya gönder
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.message || 'Subscription kayıt hatası',
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Beklenmeyen hata',
      };
    }
  }

  // Subscription'ı kaldırma
  async unsubscribeFromPush(
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      if (!this.swRegistration) {
        return { success: true }; // Zaten subscription yok
      }

      const subscription =
        await this.swRegistration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
      }

      // Sunucudan da kaldır
      const response = await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.message || 'Unsubscribe hatası' };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Beklenmeyen hata',
      };
    }
  }

  // Subscription durumu kontrolü
  async getSubscriptionStatus(): Promise<{
    isSubscribed: boolean;
    subscription?: PushSubscription;
  }> {
    try {
      if (!this.swRegistration) {
        await this.registerServiceWorker();
      }

      if (!this.swRegistration) {
        return { isSubscribed: false };
      }

      const subscription =
        await this.swRegistration.pushManager.getSubscription();
      return {
        isSubscribed: !!subscription,
        subscription: subscription || undefined,
      };
    } catch (error) {
      console.error('Subscription durumu kontrol hatası:', error);
      return { isSubscribed: false };
    }
  }

  // Test bildirimi gönderme
  async sendTestNotification(
    title: string,
    message: string,
    options?: NotificationOptions
  ): Promise<void> {
    const permission = await this.checkPermission();
    if (permission !== 'granted') {
      throw new Error('Bildirim izni verilmedi');
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge-icon.png',
      tag: 'test-notification',
      requireInteraction: false,
      ...options,
    };

    new Notification(title, {
      body: message,
      ...defaultOptions,
    });
  }

  // Bildirim ayarlarını güncelleme
  async updateNotificationSettings(
    userId: string,
    settings: Partial<Record<string, unknown>>
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(
        `/api/users/${userId}/notification-settings`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(settings),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.message || 'Ayar güncelleme hatası',
        };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Beklenmeyen hata',
      };
    }
  }

  // Utility: Base64 to Uint8Array conversion
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Static utility methods
  static isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window &&
      'fetch' in window
    );
  }

  static async isSubscribed(): Promise<boolean> {
    if (!PushNotificationManager.isSupported()) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;

      const subscription = await registration.pushManager.getSubscription();
      return !!subscription;
    } catch (error) {
      console.error('Abonelik durumu kontrol edilemedi:', error);
      return false;
    }
  }

  static async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  static async subscribe(
    userId: string = 'default'
  ): Promise<PushSubscription | null> {
    const instance = PushNotificationManager.getInstance();
    const result = await instance.subscribeToPush(userId);

    if (result.success) {
      // Get the actual subscription
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        return await registration.pushManager.getSubscription();
      }
    }

    return null;
  }

  static async unsubscribe(userId: string = 'default'): Promise<boolean> {
    const instance = PushNotificationManager.getInstance();
    const result = await instance.unsubscribeFromPush(userId);
    return result.success;
  }

  // Bildirim API'sine erişim
  static getNotificationAPI() {
    return {
      // Bildirimleri listeleme
      async getNotifications(userId: string, page = 1, limit = 20) {
        const response = await fetch(
          `/api/notifications?userId=${userId}&page=${page}&limit=${limit}`
        );
        return response.json();
      },

      // Bildirimi okundu olarak işaretleme
      async markAsRead(notificationId: string) {
        const response = await fetch(
          `/api/notifications/${notificationId}/read`,
          {
            method: 'PATCH',
          }
        );
        return response.json();
      },

      // Tüm bildirimleri okundu olarak işaretleme
      async markAllAsRead(userId: string) {
        const response = await fetch(`/api/notifications/mark-all-read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId }),
        });
        return response.json();
      },

      // Bildirim silme
      async deleteNotification(notificationId: string) {
        const response = await fetch(`/api/notifications/${notificationId}`, {
          method: 'DELETE',
        });
        return response.json();
      },

      // Test bildirimi gönderme
      async sendTestPush(userId: string, data: Record<string, unknown>) {
        const response = await fetch('/api/push/test', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userId, ...data }),
        });
        return response.json();
      },
    };
  }
}

// Singleton instance export
export const pushNotificationManager = PushNotificationManager.getInstance();
export const notificationAPI = PushNotificationManager.getNotificationAPI();
