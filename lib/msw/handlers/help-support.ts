import { http, HttpResponse } from 'msw';
import type {
  HelpCategory,
  HelpArticle,
  SupportTicket,
  ChatSession,
  SupportAnalytics,
  CreateTicketRequest,
  CreateTicketResponse,
  StartChatRequest,
  StartChatResponse,
  ArticleRatingRequest,
  ArticleRatingResponse,
  ChatAvailability,
} from '@/types';

// Local interface for chat messages in MSW context
interface HelpCenterChatMessage {
  id: string;
  chatId: string;
  from: 'user' | 'agent' | 'system' | 'bot';
  senderId: string;
  sender?: {
    id: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    avatar: string;
  };
  message: string;
  messageType:
    | 'text'
    | 'file'
    | 'image'
    | 'system'
    | 'automated'
    | 'quick_reply'
    | 'card';
  timestamp: string;
  readAt?: string;
  deliveredAt?: string;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
    thumbnailUrl?: string;
    uploadedAt: string;
  }>;
}

// Mock Data - Help Categories
const mockHelpCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    name: 'Başlangıç Rehberi',
    description: 'Yeni kullanıcılar için temel rehberler',
    icon: 'rocket',
    articleCount: 12,
    parentId: undefined,
    order: 1,
    isVisible: true,
    slug: 'baslangic-rehberi',
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-10T15:30:00Z',
    children: [
      {
        id: 'account-setup',
        name: 'Hesap Kurulumu',
        description: 'Hesabınızı nasıl oluşturup yapılandıracağınız',
        icon: 'user',
        articleCount: 5,
        parentId: 'getting-started',
        order: 1,
        isVisible: true,
        slug: 'hesap-kurulumu',
        createdAt: '2025-09-01T10:00:00Z',
        updatedAt: '2025-09-10T15:30:00Z',
      },
      {
        id: 'first-steps',
        name: 'İlk Adımlar',
        description: 'Platformdaki ilk adımlarınız',
        icon: 'footprints',
        articleCount: 7,
        parentId: 'getting-started',
        order: 2,
        isVisible: true,
        slug: 'ilk-adimlar',
        createdAt: '2025-09-01T10:00:00Z',
        updatedAt: '2025-09-10T15:30:00Z',
      },
    ],
  },
  {
    id: 'freelancer-guide',
    name: 'Freelancer Rehberi',
    description: 'Freelancerların bilmesi gereken her şey',
    icon: 'briefcase',
    articleCount: 25,
    parentId: undefined,
    order: 2,
    isVisible: true,
    slug: 'freelancer-rehberi',
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-10T15:30:00Z',
    children: [
      {
        id: 'profile-optimization',
        name: 'Profil Optimizasyonu',
        description: 'Profilinizi öne çıkarın',
        icon: 'star',
        articleCount: 8,
        parentId: 'freelancer-guide',
        order: 1,
        isVisible: true,
        slug: 'profil-optimizasyonu',
        createdAt: '2025-09-01T10:00:00Z',
        updatedAt: '2025-09-10T15:30:00Z',
      },
    ],
  },
  {
    id: 'employer-guide',
    name: 'İşveren Rehberi',
    description: 'İşverenler için kapsamlı kılavuz',
    icon: 'building',
    articleCount: 18,
    parentId: undefined,
    order: 3,
    isVisible: true,
    slug: 'isveren-rehberi',
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-10T15:30:00Z',
  },
  {
    id: 'payment-billing',
    name: 'Ödeme ve Faturalandırma',
    description: 'Ödeme süreçleri ve faturalandırma',
    icon: 'credit-card',
    articleCount: 15,
    parentId: undefined,
    order: 4,
    isVisible: true,
    slug: 'odeme-faturalandirma',
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-10T15:30:00Z',
  },
  {
    id: 'technical-support',
    name: 'Teknik Destek',
    description: 'Teknik sorunlar ve çözümleri',
    icon: 'wrench',
    articleCount: 22,
    parentId: undefined,
    order: 5,
    isVisible: true,
    slug: 'teknik-destek',
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-10T15:30:00Z',
  },
];

// Mock Data - Help Articles
const mockHelpArticles: HelpArticle[] = [
  {
    id: 'article-1',
    title: 'İlk Profilinizi Nasıl Oluşturacaksınız',
    slug: 'ilk-profilinizi-nasil-olusturacaksiniz',
    excerpt:
      'Etkileyici bir freelancer profili oluşturmak için adım adım rehber',
    content: `# İlk Profilinizi Nasıl Oluşturacaksınız

Platformumuzda başarılı olmak için etkileyici bir profil oluşturmak çok önemlidir. İşte nasıl başlayacağınız:

## 1. Profil Fotoğrafı
Yüzünüzü net bir şekilde gösteren profesyonel bir fotoğraf yükleyin...

## 2. Meslek Başlığı
Ne yaptığınızı açıkça belirten, özel bir başlık seçin...

## 3. Yetenek ve Deneyim
En güçlü yanlarınızı vurgulayın...`,
    categoryId: 'account-setup',
    category: {
      id: 'account-setup',
      name: 'Hesap Kurulumu',
      description: 'Hesap oluşturma ve kurulumu rehberleri',
      icon: 'UserPlus',
      articleCount: 12,
      order: 1,
      isVisible: true,
      slug: 'hesap-kurulumu',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T00:00:00Z',
    },
    author: {
      id: 'support-team',
      name: 'Destek Ekibi',
      avatar: '/avatars/support.png',
    },
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-10T15:30:00Z',
    publishedAt: '2025-09-01T10:00:00Z',
    views: 1547,
    rating: 4.6,
    ratingCount: 89,
    tags: ['profil', 'başlangıç', 'freelancer'],
    featured: true,
    status: 'published',
    estimatedReadTime: 5,
    language: 'tr',
    relatedArticles: ['article-2', 'article-3'],
    version: 1,
  },
  {
    id: 'article-2',
    title: 'İş Başvurusu Nasıl Yapılır',
    slug: 'is-basvurusu-nasil-yapilir',
    excerpt: 'Etkili iş başvuruları oluşturmak için ipuçları ve stratejiler',
    content: `# İş Başvurusu Nasıl Yapılır

Doğru işleri bulup başarılı başvurular yapmak için...`,
    categoryId: 'freelancer-guide',
    author: {
      id: 'support-team',
      name: 'Destek Ekibi',
      avatar: '/avatars/support.png',
    },
    createdAt: '2025-09-02T14:00:00Z',
    updatedAt: '2025-09-08T09:15:00Z',
    publishedAt: '2025-09-02T14:00:00Z',
    views: 983,
    rating: 4.3,
    ratingCount: 67,
    tags: ['başvuru', 'iş', 'teklif'],
    featured: false,
    status: 'published',
    estimatedReadTime: 7,
    language: 'tr',
    relatedArticles: ['article-1', 'article-4'],
    version: 2,
  },
  {
    id: 'article-3',
    title: 'Ödeme Sistemi Kullanım Kılavuzu',
    slug: 'odeme-sistemi-kullanim-kilavuzu',
    excerpt: 'Güvenli ödeme işlemleri ve cüzdan yönetimi hakkında bilgiler',
    content: `# Ödeme Sistemi Kullanım Kılavuzu

Platformumuzda güvenli ödeme işlemleri yapma...`,
    categoryId: 'payment-billing',
    author: {
      id: 'support-team',
      name: 'Destek Ekibi',
      avatar: '/avatars/support.png',
    },
    createdAt: '2025-09-03T11:30:00Z',
    updatedAt: '2025-09-09T16:45:00Z',
    publishedAt: '2025-09-03T11:30:00Z',
    views: 1205,
    rating: 4.8,
    ratingCount: 124,
    tags: ['ödeme', 'güvenlik', 'cüzdan'],
    featured: true,
    status: 'published',
    estimatedReadTime: 6,
    language: 'tr',
    relatedArticles: ['article-5'],
    version: 1,
  },
];

// Mock Data - Support Tickets
const mockSupportTickets: SupportTicket[] = [
  {
    id: 'ticket-123',
    ticketNumber: 'TKT-2025-001547',
    subject: 'Portföy resimlerini yükleyemiyorum',
    description:
      'Profil sayfamda portföy resimleri yüklemeye çalışıyorum ancak "dosya formatı desteklenmiyor" hatası alıyorum. JPEG ve PNG formatlarını denedim.',
    category: 'technical',
    subcategory: 'file-upload',
    priority: 'medium',
    status: 'in_progress',
    userId: 'user-456',
    user: {
      id: 'user-456',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      email: 'ahmet@example.com',
      avatar: '/avatars/user-456.png',
      userType: 'freelancer',
    },
    assignedAgentId: 'agent-sarah',
    assignedAgent: {
      id: 'agent-sarah',
      name: 'Sarah Johnson',
      email: 'sarah@support.com',
      avatar: '/avatars/agent-sarah.png',
      title: 'Teknik Destek Uzmanı',
      department: 'Technical',
      specialties: ['file-upload', 'profile-issues'],
      languages: ['tr', 'en'],
      isOnline: true,
      currentLoad: 5,
      maxLoad: 10,
      rating: 4.8,
      totalTicketsResolved: 1247,
      averageResponseTime: 15,
      isAvailable: true,
      workingHours: {
        timezone: 'Europe/Istanbul',
        schedule: [
          {
            day: 'monday',
            isWorkingDay: true,
            startTime: '09:00',
            endTime: '18:00',
          },
        ],
      },
      lastActiveAt: '2025-09-11T14:30:00Z',
    },
    attachments: [
      {
        id: 'attach-1',
        ticketId: 'ticket-123',
        name: 'screenshot-error.png',
        url: '/uploads/tickets/screenshot-error.png',
        type: 'image/png',
        size: 245760,
        uploadedBy: 'user-456',
        uploadedAt: '2025-09-11T10:05:00Z',
        isPublic: true,
        scanStatus: 'clean',
      },
    ],
    responses: [
      {
        id: 'response-1',
        ticketId: 'ticket-123',
        responseType: 'agent_reply',
        content:
          'Sorunu analiz ettim. Dosya boyutu sınırını aştığınız için bu hata oluşuyor. Lütfen dosya boyutunu 5MB altına düşürün.',
        authorId: 'agent-sarah',
        author: {
          id: 'agent-sarah',
          name: 'Sarah Johnson',
          avatar: '/avatars/agent-sarah.png',
          role: 'agent',
        },
        isPublic: true,
        attachments: [],
        createdAt: '2025-09-11T14:30:00Z',
      },
    ],
    tags: ['file-upload', 'portfolio'],
    metadata: {
      source: 'web',
      urgency: 'medium',
      customerType: 'premium',
    },
    slaDetails: {
      responseTime: {
        target: 240, // 4 hours
        remaining: 85,
        status: 'within_sla',
      },
      resolutionTime: {
        target: 1440, // 24 hours
        remaining: 560,
        status: 'within_sla',
      },
      escalationThresholds: [
        {
          level: 1,
          triggerTime: 480,
          triggered: false,
        },
      ],
    },
    createdAt: '2025-09-11T10:00:00Z',
    updatedAt: '2025-09-11T14:30:00Z',
    firstResponseAt: '2025-09-11T14:30:00Z',
    lastAgentResponseAt: '2025-09-11T14:30:00Z',
  },
];

// Mock Data - Chat Sessions
const mockChatSessions: ChatSession[] = [
  {
    id: 'chat-789',
    userId: 'user-456',
    user: {
      id: 'user-456',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      avatar: '/avatars/user-456.png',
      userType: 'freelancer',
    },
    agentId: 'agent-sarah',
    agent: {
      id: 'agent-sarah',
      name: 'Sarah Johnson',
      avatar: '/avatars/agent-sarah.png',
      title: 'Teknik Destek Uzmanı',
    },
    status: 'connected',
    topic: 'Dosya yükleme sorunu',
    department: 'technical',
    priority: 'normal',
    startedAt: '2025-09-11T10:15:00Z',
    connectedAt: '2025-09-11T10:15:30Z',
    lastActivityAt: '2025-09-11T10:35:00Z',
    actualWaitTime: 0.5,
    sessionDuration: 20,
    metadata: {
      source: 'website',
      pageUrl: '/profile/edit',
    },
  },
];

// Mock Data - Chat Messages
const mockChatMessages: HelpCenterChatMessage[] = [
  {
    id: 'msg-1',
    chatId: 'chat-789',
    from: 'system',
    senderId: 'system',
    message: 'Destek ekibimizden Sarah ile bağlantınız kuruldu.',
    messageType: 'system',
    timestamp: '2025-09-11T10:15:00Z',
  },
  {
    id: 'msg-2',
    chatId: 'chat-789',
    from: 'agent',
    senderId: 'agent-sarah',
    sender: {
      id: 'agent-sarah',
      name: 'Sarah Johnson',
      avatar: '/avatars/agent-sarah.png',
    },
    message: 'Merhaba! Size nasıl yardımcı olabilirim?',
    messageType: 'text',
    timestamp: '2025-09-11T10:15:30Z',
  },
  {
    id: 'msg-3',
    chatId: 'chat-789',
    from: 'user',
    senderId: 'user-456',
    sender: {
      id: 'user-456',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      avatar: '/avatars/user-456.png',
    },
    message: 'Portföy resimlerimi yüklemeye çalışıyorum ama hata alıyorum.',
    messageType: 'text',
    timestamp: '2025-09-11T10:16:00Z',
  },
];

// Mock Data - Chat Availability
const mockChatAvailability: ChatAvailability = {
  isOnline: true,
  departments: [
    {
      name: 'technical',
      isAvailable: true,
      queueLength: 2,
      estimatedWaitTime: 3,
    },
    {
      name: 'billing',
      isAvailable: true,
      queueLength: 1,
      estimatedWaitTime: 2,
    },
    {
      name: 'sales',
      isAvailable: false,
      queueLength: 0,
      estimatedWaitTime: 0,
      message: 'Satış departmanımız mesai saatleri dışında.',
    },
    {
      name: 'general',
      isAvailable: true,
      queueLength: 0,
      estimatedWaitTime: 1,
    },
  ],
  businessHours: {
    timezone: 'Europe/Istanbul',
    currentTime: '2025-09-11T14:30:00Z',
    isBusinessHours: true,
    schedule: [
      {
        day: 'monday',
        isWorkingDay: true,
        startTime: '09:00',
        endTime: '18:00',
      },
    ],
  },
};

// API Handlers
export const helpSupportHandlers = [
  // Help Center - Categories
  http.get('/api/v1/help/categories', () => {
    return HttpResponse.json({
      data: mockHelpCategories,
      success: true,
    });
  }),

  // Help Center - Articles
  http.get('/api/v1/help/articles', ({ request }) => {
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const search = url.searchParams.get('search');
    const featured = url.searchParams.get('featured');
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 20;

    let filteredArticles = [...mockHelpArticles];

    if (category) {
      filteredArticles = filteredArticles.filter(
        (article) => article.categoryId === category
      );
    }

    if (search) {
      const query = search.toLowerCase();
      filteredArticles = filteredArticles.filter(
        (article) =>
          article.title.toLowerCase().includes(query) ||
          article.content.toLowerCase().includes(query) ||
          article.excerpt.toLowerCase().includes(query)
      );
    }

    if (featured === 'true') {
      filteredArticles = filteredArticles.filter((article) => article.featured);
    }

    const total = filteredArticles.length;
    const start = (page - 1) * limit;
    const paginatedArticles = filteredArticles.slice(start, start + limit);

    return HttpResponse.json({
      data: paginatedArticles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: start + limit < total,
        hasPrev: page > 1,
      },
      success: true,
    });
  }),

  // Help Center - Article Detail
  http.get('/api/v1/help/articles/:id', ({ params }) => {
    const article = mockHelpArticles.find((a) => a.id === params.id);
    if (!article) {
      return HttpResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      data: article,
      success: true,
    });
  }),

  // Article Rating
  http.post('/api/v1/help/articles/:id/rating', async ({ request, params }) => {
    const body = (await request.json()) as ArticleRatingRequest;

    // Simulate saving rating
    const article = mockHelpArticles.find((a) => a.id === params.id);
    if (!article) {
      return HttpResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Update article rating (mock calculation)
    const newRatingCount = article.ratingCount + 1;
    const newAverageRating =
      (article.rating * article.ratingCount + body.rating) / newRatingCount;

    const response: ArticleRatingResponse = {
      success: true,
      data: {
        averageRating: Math.round(newAverageRating * 10) / 10,
        ratingCount: newRatingCount,
      },
    };

    return HttpResponse.json(response);
  }),

  // Support Tickets - Create
  http.post('/api/v1/support/tickets', async ({ request }) => {
    const body = (await request.json()) as CreateTicketRequest;

    const ticketNumber = `TKT-2025-${String(Date.now()).slice(-6)}`;
    const response: CreateTicketResponse = {
      success: true,
      data: {
        id: `ticket-${Date.now()}`,
        ticketNumber,
        subject: body.subject,
        status: 'open',
        priority: body.priority,
        createdAt: new Date().toISOString(),
        estimatedResolutionTime: new Date(
          Date.now() + 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    };

    return HttpResponse.json(response);
  }),

  // Support Tickets - List User Tickets
  http.get('/api/v1/support/tickets', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.getAll('status');
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 20;

    let filteredTickets = [...mockSupportTickets];

    if (status.length > 0) {
      filteredTickets = filteredTickets.filter((ticket) =>
        status.includes(ticket.status)
      );
    }

    const total = filteredTickets.length;
    const start = (page - 1) * limit;
    const paginatedTickets = filteredTickets.slice(start, start + limit);

    return HttpResponse.json({
      data: paginatedTickets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: start + limit < total,
        hasPrev: page > 1,
      },
      success: true,
    });
  }),

  // Support Tickets - Get Ticket Detail
  http.get('/api/v1/support/tickets/:id', ({ params }) => {
    const ticket = mockSupportTickets.find((t) => t.id === params.id);
    if (!ticket) {
      return HttpResponse.json(
        { success: false, error: 'Ticket not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      data: ticket,
      success: true,
    });
  }),

  // Support Tickets - Add Response
  http.post(
    '/api/v1/support/tickets/:id/responses',
    async ({ request, params }) => {
      const body = (await request.json()) as {
        content: string;
        attachments?: unknown[];
      };

      const response = {
        id: `response-${Date.now()}`,
        ticketId: params.id,
        responseType: 'user_reply' as const,
        content: body.content,
        authorId: 'user-456',
        author: {
          id: 'user-456',
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
          avatar: '/avatars/user-456.png',
          role: 'user' as const,
        },
        isPublic: true,
        attachments: body.attachments || [],
        createdAt: new Date().toISOString(),
      };

      return HttpResponse.json({
        data: response,
        success: true,
      });
    }
  ),

  // Chat - Start Chat
  http.post('/api/v1/chat/start', async ({ request }) => {
    (await request.json()) as StartChatRequest; // Parse but don't use for mock

    const response: StartChatResponse = {
      success: true,
      data: {
        chatId: `chat-${Date.now()}`,
        queuePosition: 2,
        estimatedWaitTime: 3,
        availableAgents: 5,
      },
    };

    return HttpResponse.json(response);
  }),

  // Chat - Get Messages
  http.get('/api/v1/chat/:id/messages', ({ params, request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    const limit = Number(url.searchParams.get('limit')) || 50;

    const chatMessages = mockChatMessages.filter(
      (msg) => msg.chatId === params.id
    );

    const total = chatMessages.length;
    const start = (page - 1) * limit;
    const paginatedMessages = chatMessages.slice(start, start + limit);

    return HttpResponse.json({
      data: paginatedMessages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: start + limit < total,
        hasPrev: page > 1,
      },
      success: true,
    });
  }),

  // Chat - Send Message
  http.post('/api/v1/chat/:id/messages', async ({ request, params }) => {
    const body = (await request.json()) as {
      message: string;
      messageType?: string;
      attachments?: unknown[];
    };

    const message: HelpCenterChatMessage = {
      id: `msg-${Date.now()}`,
      chatId: params.id as string,
      from: 'user',
      senderId: 'user-456',
      sender: {
        id: 'user-456',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        avatar: '/avatars/user-456.png',
      },
      message: body.message,
      messageType: (body.messageType as 'text' | 'file' | 'image') || 'text',
      timestamp: new Date().toISOString(),
      attachments:
        (body.attachments as HelpCenterChatMessage['attachments']) || [],
    };

    return HttpResponse.json({
      data: message,
      success: true,
    });
  }),

  // Chat - End Chat
  http.post('/api/v1/chat/:id/end', () => {
    return HttpResponse.json({
      success: true,
      message: 'Chat ended successfully',
    });
  }),

  // Chat - Submit Feedback
  http.post('/api/v1/chat/:id/feedback', async ({ request }) => {
    await request.json(); // Parse but don't use for mock

    return HttpResponse.json({
      success: true,
      message: 'Feedback submitted successfully',
    });
  }),

  // Chat - Get Availability
  http.get('/api/v1/chat/availability', () => {
    return HttpResponse.json({
      data: mockChatAvailability,
      success: true,
    });
  }),

  // Support Analytics (for admin)
  http.get('/api/v1/support/analytics', () => {
    const analytics: SupportAnalytics = {
      overview: {
        totalTickets: 1547,
        openTickets: 234,
        resolvedTickets: 1290,
        averageResolutionTime: 18.5,
        averageResponseTime: 12,
        customerSatisfaction: 4.6,
        firstCallResolution: 78,
      },
      ticketsByCategory: [
        {
          category: 'technical',
          count: 456,
          percentage: 29.5,
          averageResolutionTime: 22,
        },
        {
          category: 'billing',
          count: 312,
          percentage: 20.2,
          averageResolutionTime: 15,
        },
        {
          category: 'account',
          count: 289,
          percentage: 18.7,
          averageResolutionTime: 12,
        },
        {
          category: 'general',
          count: 490,
          percentage: 31.6,
          averageResolutionTime: 18,
        },
      ],
      ticketsByPriority: [
        { priority: 'low', count: 387, percentage: 25 },
        { priority: 'medium', count: 774, percentage: 50 },
        { priority: 'high', count: 310, percentage: 20 },
        { priority: 'urgent', count: 76, percentage: 5 },
      ],
      responseTimeMetrics: [
        { period: 'today', averageTime: 12, target: 15, performance: 80 },
        { period: 'week', averageTime: 14, target: 15, performance: 93 },
        { period: 'month', averageTime: 16, target: 15, performance: 87 },
      ],
      agentPerformance: [
        {
          agentId: 'agent-sarah',
          agentName: 'Sarah Johnson',
          ticketsHandled: 156,
          averageResolutionTime: 18,
          customerSatisfaction: 4.8,
          responseTime: 11,
        },
      ],
      chatMetrics: {
        totalSessions: 892,
        averageWaitTime: 2.5,
        averageSessionDuration: 15.3,
        abandonmentRate: 8.2,
        satisfactionRating: 4.7,
        transferRate: 3.1,
      },
      knowledgeBaseMetrics: {
        totalArticles: 156,
        totalViews: 45672,
        averageRating: 4.4,
        searchQueries: 8934,
        successfulSearches: 78,
        topArticles: [
          {
            articleId: 'article-1',
            title: 'İlk Profilinizi Nasıl Oluşturacaksınız',
            views: 1547,
            rating: 4.6,
          },
        ],
      },
      trends: [
        { period: 'Jan', tickets: 1200, resolutionTime: 20, satisfaction: 4.4 },
        { period: 'Feb', tickets: 1350, resolutionTime: 19, satisfaction: 4.5 },
        { period: 'Mar', tickets: 1547, resolutionTime: 18, satisfaction: 4.6 },
      ],
    };

    return HttpResponse.json({
      data: analytics,
      success: true,
    });
  }),
];
