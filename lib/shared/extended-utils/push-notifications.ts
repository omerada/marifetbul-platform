export interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
  tag?: string;
  timestamp?: number;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private registration: ServiceWorkerRegistration | null = null;
  private subscription: globalThis.PushSubscription | null = null;

  private constructor() {}

  public static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  public async initialize(): Promise<boolean> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push notifications are not supported');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered successfully');
      return true;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return false;
    }
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications are not supported');
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  public async subscribe(
    vapidPublicKey: string
  ): Promise<PushSubscription | null> {
    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          vapidPublicKey
        ) as BufferSource,
      });

      this.subscription = subscription;

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: this.arrayBufferToBase64(subscription.getKey('auth')!),
        },
      };
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  public async unsubscribe(): Promise<boolean> {
    if (!this.subscription) {
      return true;
    }

    try {
      const result = await this.subscription.unsubscribe();
      this.subscription = null;
      return result;
    } catch (error) {
      console.error('Push unsubscription failed:', error);
      return false;
    }
  }

  public async getSubscription(): Promise<globalThis.PushSubscription | null> {
    if (!this.registration) {
      return null;
    }

    return this.registration.pushManager.getSubscription();
  }

  public async showNotification(
    options: PushNotificationOptions
  ): Promise<void> {
    if (!this.registration) {
      throw new Error('Service Worker not registered');
    }

    await this.registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '/icon-192x192.png',
      badge: options.badge || '/badge-72x72.png',
      data: options.data,
      requireInteraction: options.requireInteraction,
      silent: options.silent,
      tag: options.tag,
    });
  }

  public isSupported(): boolean {
    return (
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window
    );
  }

  public async isSubscribed(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription =
        await this.registration.pushManager.getSubscription();
      this.subscription = subscription;
      return subscription !== null;
    } catch (error) {
      console.error('Failed to check subscription status:', error);
      return false;
    }
  }

  public getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}
