import { http, HttpResponse } from 'msw';
import type {
  Order,
  OrderTimeline,
  OrdersResponse,
  OrderUpdate,
  OrderDispute,
} from '@/types';

// Mock order timeline data
const mockOrderTimelines: OrderTimeline[] = [
  {
    id: 'timeline-1',
    orderId: 'order-1',
    status: 'in_progress',
    eventType: 'order_created',
    title: 'Proje başlatıldı',
    description: 'Logo tasarım projesi resmi olarak başlatıldı.',
    timestamp: '2025-09-10T09:00:00Z',
    actor: {
      id: 'user-2',
      name: 'Ahmet Yılmaz',
      avatar: '/avatars/ahmet-yilmaz.jpg',
      role: 'freelancer',
    },
    metadata: {
      projectFile: 'brief.pdf',
      estimatedDuration: '7 days',
    },
  },
  {
    id: 'timeline-2',
    orderId: 'order-1',
    status: 'in_progress',
    eventType: 'delivery_submitted',
    title: 'İlk taslak gönderildi',
    description: 'Logo tasarımının ilk versiyonu gözden geçirme için hazır.',
    timestamp: '2025-09-11T14:30:00Z',
    actor: {
      id: 'user-2',
      name: 'Ahmet Yılmaz',
      avatar: '/avatars/ahmet-yilmaz.jpg',
      role: 'freelancer',
    },
    metadata: {
      files: [
        {
          id: 'file-1',
          name: 'logo-v1.ai',
          url: '/files/logo-v1.ai',
          type: 'application/illustrator',
        },
        {
          id: 'file-2',
          name: 'logo-v1.png',
          url: '/files/logo-v1.png',
          type: 'image/png',
        },
      ],
      revisionsRemaining: 2,
    },
  },
  {
    id: 'timeline-3',
    orderId: 'order-1',
    status: 'under_review',
    eventType: 'revision_requested',
    title: 'Revizyon talebi',
    description: 'Müşteri logo renklerinde değişiklik talep etti.',
    timestamp: '2025-09-11T16:45:00Z',
    actor: {
      id: 'user-1',
      name: 'Fatma Demir',
      avatar: '/avatars/fatma-demir.jpg',
      role: 'client',
    },
    metadata: {
      feedback: 'Mavi rengi daha koyu olabilir mi? Modern görünümü çok güzel.',
      priority: 'medium',
    },
  },
];

const mockOrders: Order[] = [
  {
    id: 'order-1',
    userId: 'user-1',
    user: {
      id: 'user-1',
      name: 'Fatma Demir',
      email: 'fatma@example.com',
      avatar: '/avatars/fatma-demir.jpg',
    } as any,
    packageId: 'pkg-1',
    jobId: undefined,
    amount: 5000,
    subtotal: 4500,
    tax: 500,
    discount: 0,
    total: 5000,
    currency: 'TRY',
    status: 'in_progress',
    paymentStatus: 'paid',
    notes: 'Logo tasarım projesi',
    createdAt: '2025-09-10T09:00:00Z',
    updatedAt: '2025-09-11T16:45:00Z',
    // Sprint 5 tracking fields
    clientId: 'user-1',
    freelancerId: 'user-2',
    title: 'Logo Tasarımı Projesi',
    description: 'Teknoloji şirketi için modern logo tasarımı',
    totalAmount: 5000,
    deadline: '2025-09-17T23:59:59Z',
    deliveryDate: undefined,
    timeline: mockOrderTimelines.filter((t) => t.orderId === 'order-1'),
    progress: {
      percentage: 65,
      currentStage: 'revision',
      stagesCompleted: 2,
      totalStages: 4,
      status: 'in_progress',
      estimatedCompletion: '2025-09-15T00:00:00Z',
    },
    milestones: [
      {
        id: 'milestone-1',
        title: 'İlk konsept',
        description: 'Logo konseptinin oluşturulması',
        status: 'completed',
        dueDate: '2025-09-11T00:00:00Z',
        completedAt: '2025-09-11T14:30:00Z',
        amount: 1250,
      },
      {
        id: 'milestone-2',
        title: 'Revizyon',
        description: 'Müşteri geri bildirimlerine göre düzenleme',
        status: 'in_progress',
        dueDate: '2025-09-13T00:00:00Z',
        amount: 1250,
      },
      {
        id: 'milestone-3',
        title: 'Final dosyalar',
        description: 'Tüm formatlarda final dosyaların hazırlanması',
        status: 'pending',
        dueDate: '2025-09-15T00:00:00Z',
        amount: 1250,
      },
      {
        id: 'milestone-4',
        title: 'Teslim',
        description: 'Projenin nihai teslimatı',
        status: 'pending',
        dueDate: '2025-09-17T00:00:00Z',
        amount: 1250,
      },
    ],
    communications: [
      {
        id: 'comm-1',
        from: 'user-2',
        to: 'user-1',
        message: 'İlk tasarım hazır, inceleyebilirsiniz.',
        timestamp: '2025-09-11T14:30:00Z',
        attachments: ['logo-v1.png'],
      },
      {
        id: 'comm-2',
        from: 'user-1',
        to: 'user-2',
        message:
          'Harika çalışma! Sadece renk tonlarında küçük değişiklik istiyorum.',
        timestamp: '2025-09-11T16:45:00Z',
        attachments: [],
      },
    ],
    metadata: {
      category: 'Grafik Tasarım',
      subcategory: 'Logo Tasarımı',
      urgency: 'medium',
      clientRating: undefined,
      freelancerRating: undefined,
    },
  },
  {
    id: 'order-2',
    userId: 'user-1',
    user: {
      id: 'user-1',
      name: 'Fatma Demir',
      email: 'fatma@example.com',
      avatar: '/avatars/fatma-demir.jpg',
    } as any,
    packageId: 'pkg-2',
    jobId: undefined,
    amount: 15000,
    subtotal: 13500,
    tax: 1500,
    discount: 0,
    total: 15000,
    currency: 'TRY',
    status: 'completed',
    paymentStatus: 'paid',
    notes: 'Web sitesi geliştirme projesi',
    createdAt: '2025-08-15T10:00:00Z',
    updatedAt: '2025-09-05T18:00:00Z',
    // Sprint 5 tracking fields
    clientId: 'user-1',
    freelancerId: 'user-3',
    title: 'Web Sitesi Geliştirme',
    description: 'Kurumsal web sitesi React ile geliştirilmesi',
    totalAmount: 15000,
    deadline: '2025-09-01T23:59:59Z',
    deliveryDate: '2025-09-05T18:00:00Z',
    timeline: [],
    progress: {
      percentage: 100,
      currentStage: 'completed',
      stagesCompleted: 4,
      totalStages: 4,
      status: 'completed',
      estimatedCompletion: '2025-09-01T00:00:00Z',
    },
    milestones: [
      {
        id: 'milestone-5',
        title: 'Tasarım onayı',
        status: 'completed',
        dueDate: '2025-08-20T00:00:00Z',
        completedAt: '2025-08-19T15:30:00Z',
        amount: 3750,
      },
      {
        id: 'milestone-6',
        title: 'Frontend geliştirme',
        status: 'completed',
        dueDate: '2025-08-28T00:00:00Z',
        completedAt: '2025-08-27T12:00:00Z',
        amount: 7500,
      },
      {
        id: 'milestone-7',
        title: 'Backend entegrasyonu',
        status: 'completed',
        dueDate: '2025-09-01T00:00:00Z',
        completedAt: '2025-08-31T16:45:00Z',
        amount: 3750,
      },
    ],
    communications: [],
    metadata: {
      category: 'Yazılım Geliştirme',
      subcategory: 'Web Geliştirme',
      urgency: 'high',
      clientRating: 5,
      freelancerRating: 5,
    },
  },
];

export const ordersHandlers = [
  // Get orders list with filtering and pagination
  http.get('/api/orders', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');
    const clientId = url.searchParams.get('clientId');
    const freelancerId = url.searchParams.get('freelancerId');

    let filteredOrders = [...mockOrders];

    // Apply filters
    if (status) {
      filteredOrders = filteredOrders.filter(
        (order) => order.status === status
      );
    }
    if (clientId) {
      filteredOrders = filteredOrders.filter(
        (order) => order.clientId === clientId
      );
    }
    if (freelancerId) {
      filteredOrders = filteredOrders.filter(
        (order) => order.freelancerId === freelancerId
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    const response: OrdersResponse = {
      data: paginatedOrders,
      meta: {
        total: filteredOrders.length,
        page,
        pageSize: limit,
        totalPages: Math.ceil(filteredOrders.length / limit),
        hasNext: page < Math.ceil(filteredOrders.length / limit),
        hasPrev: page > 1,
      },
    };

    return HttpResponse.json(response);
  }),

  // Get specific order details
  http.get('/api/orders/:orderId', ({ params }) => {
    const { orderId } = params;
    const order = mockOrders.find((o) => o.id === orderId);

    if (!order) {
      return HttpResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return HttpResponse.json({ data: order });
  }),

  // Update order status
  http.patch('/api/orders/:orderId/status', async ({ request, params }) => {
    const { orderId } = params;
    const updateData = (await request.json()) as {
      status: string;
      note?: string;
    };

    const orderIndex = mockOrders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      return HttpResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Update order status
    const validStatuses = [
      'pending',
      'processing',
      'completed',
      'canceled',
      'refunded',
      'in_progress',
      'under_review',
      'disputed',
    ] as const;
    if (!validStatuses.includes(updateData.status as any)) {
      return HttpResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    mockOrders[orderIndex].status =
      updateData.status as (typeof mockOrders)[0]['status'];
    mockOrders[orderIndex].updatedAt = new Date().toISOString();

    // Add timeline entry
    const newTimelineEntry: OrderTimeline = {
      id: `timeline-${Date.now()}`,
      orderId: orderId as string,
      status: updateData.status as (typeof mockOrders)[0]['status'],
      eventType: 'status_change',
      title: `Sipariş durumu güncellendi: ${updateData.status}`,
      description: updateData.note || 'Durum güncellemesi',
      timestamp: new Date().toISOString(),
      actor: {
        id: 'user-1',
        name: 'Sistem',
        avatar: '',
        role: 'system',
      },
      metadata: {
        previousStatus: mockOrders[orderIndex].status,
        newStatus: updateData.status,
      },
    };

    if (mockOrders[orderIndex].timeline) {
      mockOrders[orderIndex].timeline!.push(newTimelineEntry);
    }

    return HttpResponse.json({
      data: mockOrders[orderIndex],
      message: 'Order status updated successfully',
    });
  }),

  // Add order update/communication
  http.post('/api/orders/:orderId/updates', async ({ request, params }) => {
    const { orderId } = params;
    const updateData = (await request.json()) as OrderUpdate;

    const orderIndex = mockOrders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) {
      return HttpResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Add communication
    const newCommunication = {
      id: `comm-${Date.now()}`,
      from: updateData.from,
      to: updateData.to,
      message: updateData.message,
      timestamp: new Date().toISOString(),
      attachments: updateData.attachments || [],
    };

    if (mockOrders[orderIndex].communications) {
      mockOrders[orderIndex].communications!.push(newCommunication);
    }

    // Add timeline entry
    const newTimelineEntry: OrderTimeline = {
      id: `timeline-${Date.now()}`,
      orderId: orderId as string,
      status: mockOrders[orderIndex].status,
      eventType: 'communication',
      title: 'Yeni güncelleme',
      description: updateData.message,
      timestamp: new Date().toISOString(),
      actor: {
        id: updateData.from,
        name: updateData.from === 'user-1' ? 'Fatma Demir' : 'Ahmet Yılmaz',
        avatar:
          updateData.from === 'user-1'
            ? '/avatars/fatma-demir.jpg'
            : '/avatars/ahmet-yilmaz.jpg',
        role: updateData.from === 'user-1' ? 'client' : 'freelancer',
      },
      metadata: {
        hasAttachments: (updateData.attachments?.length || 0) > 0,
      },
    };

    if (mockOrders[orderIndex].timeline) {
      mockOrders[orderIndex].timeline!.push(newTimelineEntry);
    }
    mockOrders[orderIndex].updatedAt = new Date().toISOString();

    return HttpResponse.json({
      data: newCommunication,
      message: 'Update added successfully',
    });
  }),

  // Update milestone status
  http.patch(
    '/api/orders/:orderId/milestones/:milestoneId',
    async ({ request, params }) => {
      const { orderId, milestoneId } = params;
      const updateData = (await request.json()) as {
        status: string;
        note?: string;
      };

      const orderIndex = mockOrders.findIndex((o) => o.id === orderId);
      if (orderIndex === -1) {
        return HttpResponse.json({ error: 'Order not found' }, { status: 404 });
      }

      if (!mockOrders[orderIndex].milestones) {
        return HttpResponse.json(
          { error: 'Milestones not found' },
          { status: 404 }
        );
      }

      const milestoneIndex = mockOrders[orderIndex].milestones!.findIndex(
        (m) => m.id === milestoneId
      );
      if (milestoneIndex === -1) {
        return HttpResponse.json(
          { error: 'Milestone not found' },
          { status: 404 }
        );
      }

      // Update milestone
      const validMilestoneStatuses = [
        'pending',
        'in_progress',
        'completed',
        'cancelled',
      ] as const;
      if (!validMilestoneStatuses.includes(updateData.status as any)) {
        return HttpResponse.json(
          { error: 'Invalid milestone status' },
          { status: 400 }
        );
      }

      mockOrders[orderIndex].milestones![milestoneIndex].status =
        updateData.status as
          | 'pending'
          | 'in_progress'
          | 'completed'
          | 'cancelled';
      if (updateData.status === 'completed') {
        mockOrders[orderIndex].milestones![milestoneIndex].completedAt =
          new Date().toISOString();
      }

      // Update progress
      const completedMilestones = mockOrders[orderIndex].milestones!.filter(
        (m) => m.status === 'completed'
      ).length;
      const totalMilestones = mockOrders[orderIndex].milestones!.length;
      if (mockOrders[orderIndex].progress) {
        mockOrders[orderIndex].progress!.percentage = Math.round(
          (completedMilestones / totalMilestones) * 100
        );
        mockOrders[orderIndex].progress!.stagesCompleted = completedMilestones;
      }

      // Add timeline entry
      const newTimelineEntry: OrderTimeline = {
        id: `timeline-${Date.now()}`,
        orderId: orderId as string,
        status: mockOrders[orderIndex].status,
        eventType: 'milestone_completed',
        title: `Kilometre taşı güncellendi: ${mockOrders[orderIndex].milestones![milestoneIndex].title}`,
        description: updateData.note || 'Kilometre taşı durumu güncellendi',
        timestamp: new Date().toISOString(),
        actor: {
          id: 'user-2',
          name: 'Ahmet Yılmaz',
          avatar: '/avatars/ahmet-yilmaz.jpg',
          role: 'freelancer',
        },
        metadata: {
          milestoneTitle:
            mockOrders[orderIndex].milestones![milestoneIndex].title,
          milestoneStatus: updateData.status,
        },
      };

      if (mockOrders[orderIndex].timeline) {
        mockOrders[orderIndex].timeline!.push(newTimelineEntry);
      }
      mockOrders[orderIndex].updatedAt = new Date().toISOString();

      return HttpResponse.json({
        data: mockOrders[orderIndex],
        message: 'Milestone updated successfully',
      });
    }
  ),

  // Get order timeline
  http.get('/api/orders/:orderId/timeline', ({ params }) => {
    const { orderId } = params;
    const order = mockOrders.find((o) => o.id === orderId);

    if (!order) {
      return HttpResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return HttpResponse.json({ data: order.timeline });
  }),

  // Create order dispute
  http.post('/api/orders/:orderId/dispute', async ({ request, params }) => {
    const { orderId } = params;
    const disputeData = (await request.json()) as Omit<
      OrderDispute,
      'id' | 'createdAt' | 'status'
    >;

    const order = mockOrders.find((o) => o.id === orderId);
    if (!order) {
      return HttpResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const newDispute: OrderDispute = {
      id: `dispute-${Date.now()}`,
      orderId: orderId as string,
      raisedBy: disputeData.raisedBy,
      reason: disputeData.reason,
      description: disputeData.description,
      status: 'open',
      createdAt: new Date().toISOString(),
      evidence: disputeData.evidence,
    };

    // Add timeline entry for dispute
    const newTimelineEntry: OrderTimeline = {
      id: `timeline-${Date.now()}`,
      orderId: orderId as string,
      status: 'disputed',
      eventType: 'dispute_created',
      title: 'İhtilaf açıldı',
      description: disputeData.description,
      timestamp: new Date().toISOString(),
      actor: {
        id: disputeData.raisedBy,
        name:
          disputeData.raisedBy === 'user-1' ? 'Fatma Demir' : 'Ahmet Yılmaz',
        avatar:
          disputeData.raisedBy === 'user-1'
            ? '/avatars/fatma-demir.jpg'
            : '/avatars/ahmet-yilmaz.jpg',
        role: disputeData.raisedBy === 'user-1' ? 'client' : 'freelancer',
      },
      metadata: {
        disputeReason: disputeData.reason,
        hasEvidence: (disputeData.evidence?.length || 0) > 0,
      },
    };

    // Update order status to disputed
    const orderIndex = mockOrders.findIndex((o) => o.id === orderId);
    mockOrders[orderIndex].status = 'disputed';
    if (mockOrders[orderIndex].timeline) {
      mockOrders[orderIndex].timeline!.push(newTimelineEntry);
    }
    mockOrders[orderIndex].updatedAt = new Date().toISOString();

    return HttpResponse.json({
      data: newDispute,
      message: 'Dispute created successfully',
    });
  }),

  // Get order statistics
  http.get('/api/orders/statistics', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const role = url.searchParams.get('role') as 'client' | 'freelancer';

    let userOrders = mockOrders;
    if (userId && role) {
      userOrders = mockOrders.filter((order) =>
        role === 'client'
          ? order.clientId === userId
          : order.freelancerId === userId
      );
    }

    const statistics = {
      total: userOrders.length,
      active: userOrders.filter((o) =>
        ['pending', 'in_progress'].includes(o.status)
      ).length,
      completed: userOrders.filter((o) => o.status === 'completed').length,
      disputed: userOrders.filter((o) => o.status === 'disputed').length,
      cancelled: userOrders.filter((o) => o.status === 'canceled').length,
      totalValue: userOrders.reduce(
        (sum, order) => sum + (order.totalAmount || order.total || 0),
        0
      ),
      avgCompletionTime: 7, // days
      successRate: Math.round(
        (userOrders.filter((o) => o.status === 'completed').length /
          userOrders.length) *
          100
      ),
    };

    return HttpResponse.json({ data: statistics });
  }),
];
