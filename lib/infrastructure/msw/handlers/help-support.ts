import { http, HttpResponse } from 'msw';
import type {
  HelpCategory,
  HelpArticle,
  SupportTicket,
  CreateTicketRequest,
  CreateTicketResponse,
  SupportDepartment,
  ChatSession,
  StartChatResponse,
  SupportAnalytics,
  ArticleRatingResponse,
} from '../../../../types';

// Mock Help Categories
const mockCategories: HelpCategory[] = [
  {
    id: 'getting-started',
    name: 'Başlangıç',
    description: 'Platform kullanımına başlama rehberi',
    icon: 'rocket',
    articleCount: 8,
    order: 1,
  },
  {
    id: 'freelancer-guide',
    name: 'Freelancer Rehberi',
    description: 'Freelancerlar için detaylı kılavuzlar',
    icon: 'user',
    articleCount: 12,
    order: 2,
  },
  {
    id: 'employer-guide',
    name: 'İşveren Rehberi',
    description: 'İşverenler için platform kullanım kılavuzu',
    icon: 'briefcase',
    articleCount: 10,
    order: 3,
  },
  {
    id: 'payments',
    name: 'Ödemeler',
    description: 'Ödeme işlemleri ve güvenliği',
    icon: 'credit-card',
    articleCount: 6,
    order: 4,
  },
];

// Mock Help Articles
const mockArticles: HelpArticle[] = [
  {
    id: 'article-1',
    title: 'Profil Oluşturma Rehberi',
    slug: 'profil-olusturma-rehberi',
    categoryId: 'getting-started',
    excerpt: 'Etkili bir profil oluşturmak için adım adım rehber',
    content: `<h2>Profil Oluşturma Adımları</h2>
    <p>Bu rehberde, platform üzerinde etkili bir profil oluşturmak için izlemeniz gereken adımları bulacaksınız.</p>
    <ol>
      <li>Kişisel bilgilerinizi eksiksiz doldurun</li>
      <li>Profesyonel bir profil fotoğrafı yükleyin</li>
      <li>Becerilerinizi ve deneyimlerinizi detaylı olarak yazın</li>
      <li>Portfolio örneklerini ekleyin</li>
      <li>Referanslarınızı ekleyin</li>
    </ol>`,
    author: {
      id: 'support-team',
      name: 'Destek Ekibi',
      avatar: '/avatars/support.png',
    },
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-10T15:30:00Z',
    views: 1547,
    rating: 4.6,
    ratingCount: 89,
    tags: ['profil', 'başlangıç', 'freelancer'],
    featured: true,
    isPublished: true,
    estimatedReadTime: 5,
    language: 'tr',
  },
  {
    id: 'article-2',
    title: 'İş Başvurusu Nasıl Yapılır',
    slug: 'is-basvurusu-nasil-yapilir',
    categoryId: 'freelancer-guide',
    excerpt: 'Başarılı iş başvuruları için ipuçları ve stratejiler',
    content: `<h2>Başarılı İş Başvurusu İçin İpuçları</h2>
    <p>Bu makalede, iş başvurularınızın onaylanma şansını artıracak stratejileri öğreneceksiniz.</p>`,
    author: {
      id: 'support-team',
      name: 'Destek Ekibi',
      avatar: '/avatars/support.png',
    },
    createdAt: '2025-09-02T14:00:00Z',
    updatedAt: '2025-09-11T09:15:00Z',
    views: 892,
    rating: 4.3,
    ratingCount: 54,
    tags: ['başvuru', 'freelancer', 'iş'],
    featured: false,
    isPublished: true,
    estimatedReadTime: 7,
    language: 'tr',
  },
];

// Mock Support Tickets
const mockTickets: SupportTicket[] = [
  {
    id: 'ticket-1',
    ticketNumber: 'TKT-001234',
    userId: 'user-1',
    subject: 'Ödeme problemi',
    description: 'Kartımdan para çekildi ama sipariş oluşmadı',
    category: 'payment',
    priority: 'high',
    status: 'open',
    assignedAgent: 'agent-1',
    createdAt: '2025-09-12T10:30:00Z',
    updatedAt: '2025-09-12T11:15:00Z',
    estimatedResolutionTime: '2025-09-12T18:00:00Z',
    user: {
      id: 'user-1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      userType: 'freelancer',
    },
  },
];

// Mock Support Departments
const mockDepartments: SupportDepartment[] = [
  {
    id: 'technical',
    name: 'technical',
    isAvailable: true,
    queueLength: 2,
    estimatedWaitTime: 3,
  },
  {
    id: 'billing',
    name: 'billing',
    isAvailable: true,
    queueLength: 1,
    estimatedWaitTime: 2,
  },
  {
    id: 'sales',
    name: 'sales',
    isAvailable: false,
    queueLength: 0,
    estimatedWaitTime: 0,
    message: 'Satış departmanımız mesai saatleri dışında.',
  },
  {
    id: 'general',
    name: 'general',
    isAvailable: true,
    queueLength: 0,
    estimatedWaitTime: 1,
  },
];

// MSW Handlers
export const helpSupportHandlers = [
  // Help Categories
  http.get('/api/v1/help/categories', () => {
    return HttpResponse.json({
      success: true,
      data: mockCategories,
    });
  }),

  // Help Articles
  http.get('/api/v1/help/articles', ({ request }) => {
    const url = new URL(request.url);
    const categoryId = url.searchParams.get('category');
    const query = url.searchParams.get('q');

    let filteredArticles = mockArticles;

    if (categoryId) {
      filteredArticles = filteredArticles.filter(
        (article) => article.categoryId === categoryId
      );
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      filteredArticles = filteredArticles.filter(
        (article) =>
          article.title.toLowerCase().includes(lowerQuery) ||
          (article.excerpt &&
            article.excerpt.toLowerCase().includes(lowerQuery))
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        articles: filteredArticles,
        pagination: {
          page: 1,
          pageSize: 20,
          total: filteredArticles.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    });
  }),

  http.get('/api/v1/help/articles/:id', ({ params }) => {
    const article = mockArticles.find((a) => a.id === params.id);

    if (!article) {
      return HttpResponse.json(
        { success: false, error: 'Makale bulunamadı' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: article,
    });
  }),

  // Article Rating
  http.post('/api/v1/help/articles/:id/rate', async ({ params, request }) => {
    const body = (await request.json()) as { rating: number };
    const article = mockArticles.find((a) => a.id === params.id);

    if (!article) {
      return HttpResponse.json(
        { success: false, error: 'Makale bulunamadı' },
        { status: 404 }
      );
    }

    const newRatingCount = (article.ratingCount || 0) + 1;
    const newAverageRating =
      ((article.rating || 0) * (article.ratingCount || 0) + body.rating) /
      newRatingCount;

    const response: ArticleRatingResponse = {
      success: true,
      data: {
        avgRating: Math.round(newAverageRating * 10) / 10,
        ratingCount: newRatingCount,
      },
    };

    return HttpResponse.json(response);
  }),

  // Support Tickets
  http.post('/api/v1/support/tickets', async ({ request }) => {
    const body = (await request.json()) as CreateTicketRequest;

    const validCategories = [
      'payment',
      'technical',
      'billing',
      'account',
      'general',
      'report_user',
      'feature_request',
      'bug_report',
    ] as const;
    type ValidCategory = (typeof validCategories)[number];

    const isValidCategory = (category: string): category is ValidCategory => {
      return validCategories.includes(category as ValidCategory);
    };

    const newTicket: SupportTicket = {
      id: `ticket-${Date.now()}`,
      ticketNumber: `TKT-${Math.random().toString().substr(2, 6)}`,
      userId: body.userId || 'current-user',
      subject: body.subject,
      description: body.description || 'Açıklama sağlanmadı',
      category: isValidCategory(body.category) ? body.category : 'general',
      priority: body.priority || 'medium',
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedResolutionTime: new Date(
        Date.now() + 24 * 60 * 60 * 1000
      ).toISOString(),
      user: {
        id: body.userId || 'current-user',
        firstName: 'User',
        lastName: 'Name',
        email: 'user@example.com',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
        userType: 'freelancer',
      },
    };

    const response: CreateTicketResponse = {
      success: true,
      data: newTicket,
    };

    return HttpResponse.json(response);
  }),

  http.get('/api/v1/support/tickets', ({ request }) => {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return HttpResponse.json(
        { success: false, error: 'User ID gereklidir' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: {
        tickets: mockTickets,
        pagination: {
          page: 1,
          pageSize: 10,
          total: mockTickets.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      },
    });
  }),

  // Live Chat
  http.get('/api/v1/support/departments', () => {
    return HttpResponse.json({
      success: true,
      data: mockDepartments,
    });
  }),

  http.post('/api/v1/support/chat/start', async ({ request }) => {
    const body = (await request.json()) as { department: string };

    const session: ChatSession = {
      id: `session-${Date.now()}`,
      userId: 'current-user',
      agentId: 'agent-1',
      department: body.department,
      status: 'active',
      startedAt: new Date().toISOString(),
      messages: [],
      participants: [
        {
          id: 'current-user',
          email: 'user@example.com',
          firstName: 'Kullanıcı',
          lastName: 'Test',
          userType: 'freelancer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          accountStatus: 'active',
          verificationStatus: 'verified',
        },
        {
          id: 'agent-1',
          email: 'agent@example.com',
          firstName: 'Destek',
          lastName: 'Temsilcisi',
          userType: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          accountStatus: 'active',
          verificationStatus: 'verified',
        },
      ],
      isActive: true,
    };

    const response: StartChatResponse = {
      success: true,
      data: session,
    };

    return HttpResponse.json(response);
  }),

  // Support Analytics
  http.get('/api/v1/support/analytics', () => {
    const analytics: SupportAnalytics = {
      totalTickets: 1247,
      openTickets: 89,
      resolvedTickets: 1158,
      averageResolutionTime: 4.2,
      avgResponseTime: 2.1,
      customerSatisfaction: 4.6,
      satisfactionScore: 4.6,
      ticketsByCategory: [
        { category: 'technical', count: 456, percentage: 36 },
        { category: 'billing', count: 312, percentage: 25 },
        { category: 'account', count: 234, percentage: 19 },
        { category: 'general', count: 245, percentage: 20 },
      ],
      resolutionTrend: [
        { date: '2025-09-01', resolved: 45, created: 52 },
        { date: '2025-09-02', resolved: 38, created: 41 },
        { date: '2025-09-03', resolved: 56, created: 49 },
      ],
      satisfactionTrend: [
        { date: '2025-09-01', score: 4.5 },
        { date: '2025-09-02', score: 4.6 },
        { date: '2025-09-03', score: 4.7 },
      ],
    };

    return HttpResponse.json({
      success: true,
      data: analytics,
    });
  }),
];
