import { http, HttpResponse } from 'msw';
import type { Order, OrderTimeline, ChatMessage } from '@/types';

// Mock order data
const mockOrders: Order[] = [
  {
    id: 'order-1',
    packageId: 'package-1',
    buyerId: 'user-1',
    sellerId: 'user-2',
    status: 'in_progress',
    totalAmount: 5000,
    createdAt: '2025-09-10T10:00:00Z',
    updatedAt: '2025-09-11T15:00:00Z',
    title: 'Logo Tasarımı',
    amount: 5000,
    currency: 'TRY',
    paymentStatus: 'paid',
    progress: {
      percentage: 50,
      stagesCompleted: 2,
      currentStage: 'revision',
      totalStages: 4,
    },
    timeline: [
      {
        id: 'milestone-1',
        orderId: 'order-1',
        type: 'milestone',
        title: 'İlk konsept',
        description: 'Logo konseptinin oluşturulması',
        actor: 'seller',
        timestamp: '2025-09-11T14:30:00Z',
        dueDate: '2025-09-11T00:00:00Z',
        completedAt: '2025-09-11T14:30:00Z',
        amount: 1250,
        status: 'completed',
      },
      {
        id: 'milestone-2',
        orderId: 'order-1',
        type: 'milestone',
        title: 'Revizyon',
        description: 'Müşteri geri bildirimlerine göre düzenleme',
        actor: 'seller',
        timestamp: '2025-09-13T00:00:00Z',
        dueDate: '2025-09-13T00:00:00Z',
        amount: 1250,
        status: 'in_progress',
      },
    ],
    communications: [
      {
        id: 'comm-1',
        conversationId: 'conv-1',
        senderId: 'user-2',
        content: 'İlk tasarım hazır, inceleyebilirsiniz.',
        type: 'text',
        createdAt: '2025-09-11T14:30:00Z',
        sentAt: '2025-09-11T14:30:00Z',
        isRead: true,
        attachments: [
          {
            id: 'att-1',
            name: 'logo-v1.png',
            type: 'image/png',
            filename: 'logo-v1.png',
            size: 2048,
            mimetype: 'image/png',
            url: '/attachments/logo-v1.png',
            uploadedAt: new Date().toISOString(),
          },
        ],
      },
      {
        id: 'comm-2',
        conversationId: 'conv-1',
        senderId: 'user-1',
        content:
          'Harika çalışma! Sadece renk tonlarında küçük değişiklik istiyorum.',
        type: 'text',
        createdAt: '2025-09-11T15:00:00Z',
        sentAt: '2025-09-11T15:00:00Z',
        isRead: true,
        attachments: [],
      },
    ],
  },
  {
    id: 'order-2',
    packageId: 'package-2',
    buyerId: 'user-3',
    sellerId: 'user-4',
    status: 'completed',
    totalAmount: 15000,
    createdAt: '2025-08-15T09:00:00Z',
    updatedAt: '2025-09-01T17:00:00Z',
    title: 'E-ticaret Web Sitesi',
    amount: 15000,
    currency: 'TRY',
    paymentStatus: 'completed',
    progress: {
      percentage: 100,
      stagesCompleted: 3,
      currentStage: 'completed',
      totalStages: 3,
    },
    timeline: [
      {
        id: 'milestone-5',
        orderId: 'order-2',
        type: 'milestone',
        title: 'Tasarım onayı',
        description: 'UI/UX tasarımının tamamlanması',
        actor: 'seller',
        timestamp: '2025-08-19T15:30:00Z',
        dueDate: '2025-08-20T00:00:00Z',
        completedAt: '2025-08-19T15:30:00Z',
        amount: 3750,
        status: 'completed',
      },
      {
        id: 'milestone-6',
        orderId: 'order-2',
        type: 'milestone',
        title: 'Frontend geliştirme',
        description: 'Frontend kodlamasının tamamlanması',
        actor: 'seller',
        timestamp: '2025-08-27T12:00:00Z',
        dueDate: '2025-08-28T00:00:00Z',
        completedAt: '2025-08-27T12:00:00Z',
        amount: 7500,
        status: 'completed',
      },
    ],
  },
];

export const orderHandlers = [
  // Get orders
  http.get('/api/orders', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');

    let filteredOrders = mockOrders;
    if (status) {
      filteredOrders = mockOrders.filter((order) => order.status === status);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: paginatedOrders,
      meta: {
        page,
        limit,
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / limit),
      },
    });
  }),

  // Get order by ID
  http.get('/api/orders/:orderId', ({ params }) => {
    const { orderId } = params;
    const order = mockOrders.find((o) => o.id === orderId);

    if (!order) {
      return HttpResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: order,
    });
  }),

  // Update order
  http.put('/api/orders/:orderId', async ({ params, request }) => {
    const { orderId } = params;
    const updates = await request.json();

    const orderIndex = mockOrders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    const order = mockOrders[orderIndex];
    Object.assign(order, updates);
    order.updatedAt = new Date().toISOString();

    return HttpResponse.json({
      success: true,
      data: order,
    });
  }),

  // Add communication to order
  http.post(
    '/api/orders/:orderId/communication',
    async ({ params, request }) => {
      const { orderId } = params;
      const body = (await request.json()) as Record<string, any>;

      const orderIndex = mockOrders.findIndex((o) => o.id === orderId);
      if (orderIndex === -1) {
        return HttpResponse.json(
          { success: false, error: 'Order not found' },
          { status: 404 }
        );
      }

      const order = mockOrders[orderIndex];
      if (!order.communications) {
        order.communications = [];
      }

      const newCommunication: ChatMessage = {
        id: `comm-${Date.now()}`,
        conversationId: `conv-${orderId}`,
        senderId: body?.senderId || 'unknown',
        content: body?.message || '',
        type: 'text',
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString(),
        isRead: false,
        attachments: body?.attachments || [],
      };

      order.communications.push(newCommunication);
      order.updatedAt = new Date().toISOString();

      return HttpResponse.json({
        success: true,
        data: newCommunication,
      });
    }
  ),

  // Get order timeline
  http.get('/api/orders/:orderId/timeline', ({ params }) => {
    const { orderId } = params;
    const order = mockOrders.find((o) => o.id === orderId);

    if (!order) {
      return HttpResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: order.timeline || [],
    });
  }),

  // Get order communications
  http.get('/api/orders/:orderId/communications', ({ params }) => {
    const { orderId } = params;
    const order = mockOrders.find((o) => o.id === orderId);

    if (!order) {
      return HttpResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: order.communications || [],
    });
  }),
];
