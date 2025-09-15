import { http, HttpResponse } from 'msw';
import {
  EnhancedNotification,
  NotificationCenter,
  NotificationPreferences,
  PushSubscriptionData,
} from '@/types';

// Mock notification data
const mockNotifications: EnhancedNotification[] = [
  {
    id: 'notif_1',
    userId: 'user_1',
    type: 'payment_received',
    title: 'Ödemeniz başarıyla alındı',
    message: 'Siparişiniz için 1.500 TL ödeme işlemi tamamlandı.',
    isRead: false,
    createdAt: '2024-09-12T10:30:00Z',
    category: 'payment',
    priority: 'high',
    channel: 'browser',
    actionUrl: '/orders/order_1',
    actionText: 'Siparişi Görüntüle',
    imageUrl: '/icons/payment-success.png',
    deliveryStatus: 'delivered',
    deliveryAttempts: [
      {
        id: 'attempt_1',
        notificationId: 'notif_1',
        channel: 'browser',
        status: 'delivered',
        attemptedAt: '2024-09-12T10:30:00Z',
        deliveredAt: '2024-09-12T10:30:00Z',
      },
    ],
    tags: ['payment', 'order'],
    metadata: {
      orderId: 'order_1',
      amount: 1500,
      currency: 'TRY',
    },
  },
  {
    id: 'notif_2',
    userId: 'user_1',
    type: 'proposal_received',
    title: 'Yeni teklif aldınız',
    message: 'Web tasarım projeniz için yeni bir teklif aldınız.',
    isRead: true,
    createdAt: '2024-09-11T14:20:00Z',
    readAt: '2024-09-11T15:00:00Z',
    category: 'order',
    priority: 'normal',
    channel: 'browser',
    actionUrl: '/jobs/job_1/proposals',
    actionText: 'Teklifleri Görüntüle',
    deliveryStatus: 'delivered',
    deliveryAttempts: [
      {
        id: 'attempt_2',
        notificationId: 'notif_2',
        channel: 'browser',
        status: 'delivered',
        attemptedAt: '2024-09-11T14:20:00Z',
        deliveredAt: '2024-09-11T14:20:00Z',
      },
    ],
    tags: ['proposal', 'job'],
  },
  {
    id: 'notif_3',
    userId: 'user_1',
    type: 'message_received',
    title: 'Yeni mesajınız var',
    message: 'Ahmet Yılmaz sizinle iletişime geçti.',
    isRead: false,
    createdAt: '2024-09-12T09:15:00Z',
    category: 'message',
    priority: 'normal',
    channel: 'browser',
    actionUrl: '/messages/conv_1',
    actionText: 'Mesajı Oku',
    deliveryStatus: 'delivered',
    deliveryAttempts: [
      {
        id: 'attempt_3',
        notificationId: 'notif_3',
        channel: 'browser',
        status: 'delivered',
        attemptedAt: '2024-09-12T09:15:00Z',
        deliveredAt: '2024-09-12T09:15:00Z',
      },
    ],
    tags: ['message', 'conversation'],
  },
  {
    id: 'notif_4',
    userId: 'user_1',
    type: 'job_completed',
    title: 'Siparişiniz tamamlandı',
    message: 'Web tasarım hizmetiniz başarıyla teslim edildi.',
    isRead: false,
    createdAt: '2024-09-10T16:45:00Z',
    category: 'order',
    priority: 'high',
    channel: 'browser',
    actionUrl: '/orders/order_2',
    actionText: 'Değerlendirin',
    deliveryStatus: 'delivered',
    deliveryAttempts: [
      {
        id: 'attempt_4',
        notificationId: 'notif_4',
        channel: 'browser',
        status: 'delivered',
        attemptedAt: '2024-09-10T16:45:00Z',
        deliveredAt: '2024-09-10T16:45:00Z',
      },
    ],
    tags: ['order', 'completion'],
  },
  {
    id: 'notif_5',
    userId: 'user_1',
    type: 'system_announcement',
    title: 'Sistem bakım bildirimi',
    message: 'Sistem bakımı 15 Eylül saat 02:00-04:00 arası yapılacaktır.',
    isRead: true,
    createdAt: '2024-09-09T12:00:00Z',
    readAt: '2024-09-09T12:30:00Z',
    category: 'system',
    priority: 'low',
    channel: 'browser',
    expiresAt: '2024-09-15T04:00:00Z',
    deliveryStatus: 'delivered',
    deliveryAttempts: [
      {
        id: 'attempt_5',
        notificationId: 'notif_5',
        channel: 'browser',
        status: 'delivered',
        attemptedAt: '2024-09-09T12:00:00Z',
        deliveredAt: '2024-09-09T12:00:00Z',
      },
    ],
    tags: ['system', 'maintenance'],
  },
];

// Mock notification preferences
const mockPreferences: NotificationPreferences = {
  userId: 'user_1',
  browser: {
    enabled: true,
    proposals: true,
    messages: true,
    payments: true,
    orders: true,
    system: true,
    marketing: false,
  },
  email: {
    enabled: true,
    proposals: true,
    messages: false,
    payments: true,
    orders: true,
    system: true,
    marketing: false,
    digest: 'daily',
    digestTime: '09:00',
  },
  sms: {
    enabled: false,
    urgent: true,
    payments: true,
    security: true,
  },
  push: {
    enabled: true,
    proposals: true,
    messages: true,
    payments: true,
    orders: true,
    system: false,
    sound: true,
    vibration: true,
  },
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00',
    timezone: 'Europe/Istanbul',
    daysOfWeek: [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ],
  },
  frequency: {
    immediate: ['payment_received', 'job_completed'],
    batched: ['proposal_received', 'system_announcement'],
    batchInterval: 60,
  },
  updatedAt: '2024-09-01T10:00:00Z',
};

// Mock push subscription
const mockPushSubscription: PushSubscriptionData = {
  id: 'sub_1',
  userId: 'user_1',
  endpoint: 'https://fcm.googleapis.com/fcm/send/example',
  keys: {
    p256dh: 'example_p256dh_key',
    auth: 'example_auth_key',
  },
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  deviceType: 'desktop',
  isActive: true,
  lastUsed: '2024-09-12T10:30:00Z',
  failureCount: 0,
  metadata: {
    browser: 'Chrome',
    os: 'Windows',
    device: 'Desktop',
  },
  createdAt: '2024-09-01T10:00:00Z',
  updatedAt: '2024-09-12T10:30:00Z',
};

export const notificationHandlers = [
  // Get notifications
  http.get('/api/v1/notifications', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const category = url.searchParams.getAll('category');
    const priority = url.searchParams.getAll('priority');
    const isRead = url.searchParams.get('isRead');
    const search = url.searchParams.get('search');

    let filteredNotifications = [...mockNotifications];

    // Apply filters
    if (category.length > 0) {
      filteredNotifications = filteredNotifications.filter(
        (n) => n.category && category.includes(n.category)
      );
    }
    if (priority.length > 0) {
      filteredNotifications = filteredNotifications.filter(
        (n) => n.priority && priority.includes(n.priority)
      );
    }
    if (isRead !== null) {
      const isReadBool = isRead === 'true';
      filteredNotifications = filteredNotifications.filter(
        (n) => n.isRead === isReadBool
      );
    }
    if (search) {
      const searchLower = search.toLowerCase();
      filteredNotifications = filteredNotifications.filter(
        (n) =>
          n.title.toLowerCase().includes(searchLower) ||
          n.message.toLowerCase().includes(searchLower)
      );
    }

    // Sort by creation date (newest first)
    filteredNotifications.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = filteredNotifications.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = filteredNotifications.slice(
      startIndex,
      endIndex
    );

    // Calculate summary
    const unreadCount = mockNotifications.filter((n) => !n.isRead).length;
    const byCategory = mockNotifications.reduce(
      (acc, n) => {
        if (n.category) {
          acc[n.category] = (acc[n.category] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );
    const byPriority = mockNotifications.reduce(
      (acc, n) => {
        if (n.priority) {
          acc[n.priority] = (acc[n.priority] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>
    );

    const notificationCenter: NotificationCenter = {
      notifications: paginatedNotifications,
      unreadCount,
      lastFetched: new Date().toISOString(),
      summary: {
        total: mockNotifications.length,
        unread: unreadCount,
        byCategory,
        byPriority,
      },
      pagination: {
        page,
        limit, // Required for PaginationMeta compatibility
        pageSize: limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };

    return HttpResponse.json({
      success: true,
      data: notificationCenter,
    });
  }),

  // Mark notifications as read
  http.post('/api/v1/notifications/mark-read', async ({ request }) => {
    const body = (await request.json()) as { notificationIds: string[] };

    if (!body.notificationIds || !Array.isArray(body.notificationIds)) {
      return HttpResponse.json(
        {
          success: false,
          error: "Geçerli bildirim ID'leri gerekli",
        },
        { status: 400 }
      );
    }

    // Update notifications in mock data
    const now = new Date().toISOString();
    body.notificationIds.forEach((id) => {
      const notification = mockNotifications.find((n) => n.id === id);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        notification.readAt = now;
      }
    });

    return HttpResponse.json({
      success: true,
      message: 'Bildirimler okundu olarak işaretlendi',
      data: {
        updatedCount: body.notificationIds.length,
      },
    });
  }),

  // Mark all notifications as read
  http.post('/api/v1/notifications/mark-all-read', () => {
    const now = new Date().toISOString();
    let updatedCount = 0;

    mockNotifications.forEach((notification) => {
      if (!notification.isRead) {
        notification.isRead = true;
        notification.readAt = now;
        updatedCount++;
      }
    });

    return HttpResponse.json({
      success: true,
      message: 'Tüm bildirimler okundu olarak işaretlendi',
      data: {
        updatedCount,
      },
    });
  }),

  // Mark notifications as unread
  http.post('/api/v1/notifications/mark-unread', async ({ request }) => {
    const body = (await request.json()) as { notificationIds: string[] };

    // Update notifications in mock data
    body.notificationIds.forEach((id) => {
      const notification = mockNotifications.find((n) => n.id === id);
      if (notification && notification.isRead) {
        notification.isRead = false;
        notification.readAt = undefined;
      }
    });

    return HttpResponse.json({
      success: true,
      message: 'Bildirimler okunmadı olarak işaretlendi',
      data: {
        updatedCount: body.notificationIds.length,
      },
    });
  }),

  // Delete notifications
  http.delete('/api/v1/notifications/delete', async ({ request }) => {
    const body = (await request.json()) as { notificationIds: string[] };

    // Remove notifications from mock data
    body.notificationIds.forEach((id) => {
      const index = mockNotifications.findIndex((n) => n.id === id);
      if (index !== -1) {
        mockNotifications.splice(index, 1);
      }
    });

    return HttpResponse.json({
      success: true,
      message: 'Bildirimler silindi',
      data: {
        deletedCount: body.notificationIds.length,
      },
    });
  }),

  // Archive notifications
  http.post('/api/v1/notifications/archive', async ({ request }) => {
    const body = (await request.json()) as { notificationIds: string[] };

    // In a real app, this would move notifications to an archived state
    // For now, we'll just remove them from the active list
    body.notificationIds.forEach((id) => {
      const index = mockNotifications.findIndex((n) => n.id === id);
      if (index !== -1) {
        mockNotifications.splice(index, 1);
      }
    });

    return HttpResponse.json({
      success: true,
      message: 'Bildirimler arşivlendi',
      data: {
        archivedCount: body.notificationIds.length,
      },
    });
  }),

  // Get notification preferences
  http.get('/api/v1/notifications/preferences', () => {
    return HttpResponse.json({
      success: true,
      data: mockPreferences,
    });
  }),

  // Update notification preferences
  http.put('/api/v1/notifications/preferences', async ({ request }) => {
    const body = (await request.json()) as Partial<NotificationPreferences>;

    // Update mock preferences
    Object.assign(mockPreferences, body, {
      updatedAt: new Date().toISOString(),
    });

    return HttpResponse.json({
      success: true,
      data: mockPreferences,
      message: 'Bildirim tercihleri güncellendi',
    });
  }),

  // Subscribe to push notifications
  http.post('/api/v1/notifications/push/subscribe', async ({ request }) => {
    const body = (await request.json()) as Omit<
      PushSubscriptionData,
      'id' | 'userId' | 'createdAt' | 'updatedAt'
    >;

    const newSubscription: PushSubscriptionData = {
      ...body,
      id: `sub_${Date.now()}`,
      userId: 'user_1', // Would come from authentication
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      data: newSubscription,
      message: 'Push notification aboneliği oluşturuldu',
    });
  }),

  // Unsubscribe from push notifications
  http.post('/api/v1/notifications/push/unsubscribe', () => {
    return HttpResponse.json({
      success: true,
      message: 'Push notification aboneliği iptal edildi',
    });
  }),

  // Test push notification
  http.post('/api/v1/notifications/push/test', () => {
    // In a real app, this would send an actual push notification
    return HttpResponse.json({
      success: true,
      message: 'Test bildirimi gönderildi',
      data: {
        sent: true,
        timestamp: new Date().toISOString(),
      },
    });
  }),

  // Create notification (for admin/system use)
  http.post('/api/v1/notifications', async ({ request }) => {
    const body = (await request.json()) as Omit<
      EnhancedNotification,
      'id' | 'createdAt' | 'deliveryStatus' | 'deliveryAttempts'
    >;

    const newNotification: EnhancedNotification = {
      ...body,
      id: `notif_${Date.now()}`,
      createdAt: new Date().toISOString(),
      deliveryStatus: 'sent',
      deliveryAttempts: [
        {
          id: `attempt_${Date.now()}`,
          notificationId: `notif_${Date.now()}`,
          channel: body.channel,
          status: 'sent',
          attemptedAt: new Date().toISOString(),
        },
      ],
    };

    mockNotifications.unshift(newNotification);

    return HttpResponse.json({
      success: true,
      data: newNotification,
      message: 'Bildirim oluşturuldu',
    });
  }),

  // Get push subscription
  http.get('/api/v1/notifications/push/subscription', () => {
    return HttpResponse.json({
      success: true,
      data: mockPushSubscription,
    });
  }),

  // Update push subscription
  http.put('/api/v1/notifications/push/subscription', async ({ request }) => {
    const body = (await request.json()) as Partial<PushSubscriptionData>;

    Object.assign(mockPushSubscription, body, {
      updatedAt: new Date().toISOString(),
    });

    return HttpResponse.json({
      success: true,
      data: mockPushSubscription,
      message: 'Push subscription güncellendi',
    });
  }),

  // Get notification by ID
  http.get('/api/v1/notifications/:notificationId', ({ params }) => {
    const { notificationId } = params;
    const notification = mockNotifications.find((n) => n.id === notificationId);

    if (!notification) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Bildirim bulunamadı',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: notification,
    });
  }),
];
