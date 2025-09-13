import { http, HttpResponse } from 'msw';

// Types
interface ContentAppeal {
  id: string;
  appealNumber: string;
  userId: string;
  userInfo: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    userType: 'freelancer' | 'employer';
  };
  moderationItemId: string;
  originalContent: {
    id: string;
    type: 'job' | 'service' | 'review' | 'message' | 'profile';
    title: string;
    description: string;
    moderatedAt: string;
    moderationReason: string;
    moderatorId: string;
    moderatorName: string;
    action: 'removed' | 'hidden' | 'flagged' | 'suspended';
  };
  appealReason:
    | 'incorrect_decision'
    | 'content_misunderstood'
    | 'policy_misapplied'
    | 'technical_error'
    | 'other';
  appealDescription: string;
  supportingEvidence?: {
    id: string;
    type: 'document' | 'image' | 'link' | 'text';
    url?: string;
    content?: string;
    uploadedAt: string;
  }[];
  status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'escalated';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: {
    id: string;
    name: string;
    role: string;
  };
  reviewHistory: {
    id: string;
    reviewerId: string;
    reviewerName: string;
    action: 'assigned' | 'reviewed' | 'escalated' | 'resolved';
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
    timestamp: string;
  }[];
  resolution?: {
    decision: 'upheld' | 'overturned' | 'partially_upheld';
    reason: string;
    action:
      | 'restore_content'
      | 'maintain_action'
      | 'modify_action'
      | 'escalate_further';
    reviewerId: string;
    reviewerName: string;
    resolvedAt: string;
    compensationOffered?: boolean;
    compensationDetails?: string;
  };
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags: string[];
  internalNotes: {
    id: string;
    authorId: string;
    authorName: string;
    note: string;
    isConfidential: boolean;
    createdAt: string;
  }[];
}

interface AppealStats {
  totalAppeals: number;
  pendingAppeals: number;
  underReview: number;
  resolvedToday: number;
  averageResolutionTime: number; // hours
  appealsByStatus: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  appealsByReason: Array<{
    reason: string;
    count: number;
    successRate: number;
  }>;
  resolutionTrends: Array<{
    date: string;
    approved: number;
    rejected: number;
    escalated: number;
  }>;
  reviewerPerformance: Array<{
    reviewerId: string;
    reviewerName: string;
    reviewedAppeals: number;
    averageTime: number;
    successRate: number;
  }>;
}

// Mock Data
const mockAppeals: ContentAppeal[] = [
  {
    id: 'appeal-1',
    appealNumber: 'APP-2024-001',
    userId: 'user-123',
    userInfo: {
      id: 'user-123',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      email: 'ahmet.yilmaz@example.com',
      avatar: 'https://picsum.photos/seed/user123/100/100',
      userType: 'freelancer',
    },
    moderationItemId: 'mod-item-1',
    originalContent: {
      id: 'job-456',
      type: 'job',
      title: 'Modern Web Sitesi Tasarımı',
      description:
        'React ve Node.js kullanarak modern ve responsive web sitesi tasarımı yapacağım.',
      moderatedAt: '2024-01-20T10:30:00Z',
      moderationReason: 'Spam içerik tespit edildi',
      moderatorId: 'mod-1',
      moderatorName: 'Moderator Admin',
      action: 'removed',
    },
    appealReason: 'incorrect_decision',
    appealDescription:
      'Bu içerik spam değildir. Gerçek bir hizmet teklifi olup, detaylı açıklama ve örneklerle desteklenmektedir. Lütfen kararı yeniden gözden geçirin.',
    supportingEvidence: [
      {
        id: 'evidence-1',
        type: 'link',
        url: 'https://portfolio.example.com',
        uploadedAt: '2024-01-20T11:00:00Z',
      },
      {
        id: 'evidence-2',
        type: 'text',
        content: 'Portföyümde benzer 15+ proje bulunmaktadır.',
        uploadedAt: '2024-01-20T11:05:00Z',
      },
    ],
    status: 'pending',
    priority: 'medium',
    assignedTo: {
      id: 'reviewer-1',
      name: 'İtiraz İnceleyicisi',
      role: 'Senior Moderator',
    },
    reviewHistory: [
      {
        id: 'review-1',
        reviewerId: 'reviewer-1',
        reviewerName: 'İtiraz İnceleyicisi',
        action: 'assigned',
        status: 'pending',
        notes: 'İtiraz incelemeye alındı',
        timestamp: '2024-01-20T12:00:00Z',
      },
    ],
    createdAt: '2024-01-20T11:30:00Z',
    updatedAt: '2024-01-20T12:00:00Z',
    dueDate: '2024-01-22T11:30:00Z',
    tags: ['spam-dispute', 'job-posting', 'first-appeal'],
    internalNotes: [
      {
        id: 'note-1',
        authorId: 'mod-1',
        authorName: 'Moderator Admin',
        note: 'Otomatik spam filtresi tarafından yakalandı, manuel inceleme gerekiyor',
        isConfidential: true,
        createdAt: '2024-01-20T10:30:00Z',
      },
    ],
  },
  {
    id: 'appeal-2',
    appealNumber: 'APP-2024-002',
    userId: 'user-456',
    userInfo: {
      id: 'user-456',
      firstName: 'Fatma',
      lastName: 'Kaya',
      email: 'fatma.kaya@example.com',
      avatar: 'https://picsum.photos/seed/user456/100/100',
      userType: 'employer',
    },
    moderationItemId: 'mod-item-2',
    originalContent: {
      id: 'review-789',
      type: 'review',
      title: 'Mükemmel hizmet',
      description:
        'Freelancer harika bir iş çıkardı, kesinlikle tavsiye ederim!',
      moderatedAt: '2024-01-19T14:20:00Z',
      moderationReason: 'Sahte değerlendirme şüphesi',
      moderatorId: 'mod-2',
      moderatorName: 'Review Moderator',
      action: 'hidden',
    },
    appealReason: 'content_misunderstood',
    appealDescription:
      'Bu değerlendirme gerçektir. Freelancer ile gerçekten çalıştım ve memnun kaldım. Sahte değerlendirme değildir.',
    status: 'under_review',
    priority: 'low',
    assignedTo: {
      id: 'reviewer-2',
      name: 'Değerlendirme İnceleyicisi',
      role: 'Review Specialist',
    },
    reviewHistory: [
      {
        id: 'review-2',
        reviewerId: 'reviewer-2',
        reviewerName: 'Değerlendirme İnceleyicisi',
        action: 'assigned',
        status: 'pending',
        timestamp: '2024-01-19T15:00:00Z',
      },
      {
        id: 'review-3',
        reviewerId: 'reviewer-2',
        reviewerName: 'Değerlendirme İnceleyicisi',
        action: 'reviewed',
        status: 'pending',
        notes: 'İnceleme devam ediyor, ek kanıt toplanıyor',
        timestamp: '2024-01-20T09:00:00Z',
      },
    ],
    createdAt: '2024-01-19T14:45:00Z',
    updatedAt: '2024-01-20T09:00:00Z',
    dueDate: '2024-01-21T14:45:00Z',
    tags: ['fake-review-dispute', 'employer-appeal'],
    internalNotes: [
      {
        id: 'note-2',
        authorId: 'mod-2',
        authorName: 'Review Moderator',
        note: 'ML modeli %78 güvenle sahte olarak işaretledi',
        isConfidential: true,
        createdAt: '2024-01-19T14:20:00Z',
      },
    ],
  },
  {
    id: 'appeal-3',
    appealNumber: 'APP-2024-003',
    userId: 'user-789',
    userInfo: {
      id: 'user-789',
      firstName: 'Mehmet',
      lastName: 'Özkan',
      email: 'mehmet.ozkan@example.com',
      userType: 'freelancer',
    },
    moderationItemId: 'mod-item-3',
    originalContent: {
      id: 'profile-321',
      type: 'profile',
      title: 'Profil Açıklaması',
      description: 'Deneyimli grafik tasarımcı, logo ve kurumsal kimlik uzmanı',
      moderatedAt: '2024-01-18T16:10:00Z',
      moderationReason: 'Uygunsuz içerik',
      moderatorId: 'mod-3',
      moderatorName: 'Profile Moderator',
      action: 'flagged',
    },
    appealReason: 'policy_misapplied',
    appealDescription:
      'Profil açıklamam tamamen mesleki ve uygun. Hangi politikayı ihlal ettiği belirtilmemiş.',
    status: 'approved',
    priority: 'high',
    resolution: {
      decision: 'overturned',
      reason: 'Moderasyon hatası, içerik uygun bulundu',
      action: 'restore_content',
      reviewerId: 'reviewer-3',
      reviewerName: 'Kıdemli İnceleyici',
      resolvedAt: '2024-01-19T10:30:00Z',
    },
    reviewHistory: [
      {
        id: 'review-4',
        reviewerId: 'reviewer-3',
        reviewerName: 'Kıdemli İnceleyici',
        action: 'resolved',
        status: 'approved',
        notes: 'İçerik gözden geçirildi, uygun bulundu',
        timestamp: '2024-01-19T10:30:00Z',
      },
    ],
    createdAt: '2024-01-18T17:00:00Z',
    updatedAt: '2024-01-19T10:30:00Z',
    tags: ['policy-misapplication', 'profile-content', 'resolved'],
    internalNotes: [],
  },
];

const mockStats: AppealStats = {
  totalAppeals: 127,
  pendingAppeals: 23,
  underReview: 15,
  resolvedToday: 8,
  averageResolutionTime: 18.5,
  appealsByStatus: [
    { status: 'pending', count: 23, percentage: 18.1 },
    { status: 'under_review', count: 15, percentage: 11.8 },
    { status: 'approved', count: 45, percentage: 35.4 },
    { status: 'rejected', count: 32, percentage: 25.2 },
    { status: 'escalated', count: 12, percentage: 9.4 },
  ],
  appealsByReason: [
    { reason: 'incorrect_decision', count: 48, successRate: 67.5 },
    { reason: 'content_misunderstood', count: 31, successRate: 54.8 },
    { reason: 'policy_misapplied', count: 25, successRate: 72.0 },
    { reason: 'technical_error', count: 15, successRate: 86.7 },
    { reason: 'other', count: 8, successRate: 37.5 },
  ],
  resolutionTrends: [
    { date: '2024-01-15', approved: 5, rejected: 3, escalated: 1 },
    { date: '2024-01-16', approved: 7, rejected: 4, escalated: 2 },
    { date: '2024-01-17', approved: 6, rejected: 5, escalated: 1 },
    { date: '2024-01-18', approved: 8, rejected: 3, escalated: 0 },
    { date: '2024-01-19', approved: 9, rejected: 2, escalated: 1 },
    { date: '2024-01-20', approved: 4, rejected: 3, escalated: 1 },
  ],
  reviewerPerformance: [
    {
      reviewerId: 'reviewer-1',
      reviewerName: 'İtiraz İnceleyicisi',
      reviewedAppeals: 45,
      averageTime: 16.2,
      successRate: 89.3,
    },
    {
      reviewerId: 'reviewer-2',
      reviewerName: 'Değerlendirme İnceleyicisi',
      reviewedAppeals: 38,
      averageTime: 21.5,
      successRate: 82.1,
    },
    {
      reviewerId: 'reviewer-3',
      reviewerName: 'Kıdemli İnceleyici',
      reviewedAppeals: 52,
      averageTime: 14.8,
      successRate: 94.2,
    },
  ],
};

// Utility functions
const generateAppealNumber = () => {
  const year = new Date().getFullYear();
  const number = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `APP-${year}-${number}`;
};

const generateId = () =>
  `appeal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const appealHandlers = [
  // Get all appeals
  http.get('/api/content-appeals', ({ request }) => {
    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const priority = url.searchParams.get('priority');
    const reason = url.searchParams.get('reason');
    const search = url.searchParams.get('search');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    let filteredAppeals = [...mockAppeals];

    // Apply filters
    if (status && status !== 'all') {
      filteredAppeals = filteredAppeals.filter(
        (appeal) => appeal.status === status
      );
    }

    if (priority && priority !== 'all') {
      filteredAppeals = filteredAppeals.filter(
        (appeal) => appeal.priority === priority
      );
    }

    if (reason && reason !== 'all') {
      filteredAppeals = filteredAppeals.filter(
        (appeal) => appeal.appealReason === reason
      );
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredAppeals = filteredAppeals.filter(
        (appeal) =>
          appeal.appealNumber.toLowerCase().includes(searchLower) ||
          appeal.userInfo.firstName.toLowerCase().includes(searchLower) ||
          appeal.userInfo.lastName.toLowerCase().includes(searchLower) ||
          appeal.userInfo.email.toLowerCase().includes(searchLower) ||
          appeal.originalContent.title.toLowerCase().includes(searchLower)
      );
    }

    // Sort by creation date (newest first)
    filteredAppeals.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAppeals = filteredAppeals.slice(startIndex, endIndex);

    return HttpResponse.json({
      appeals: paginatedAppeals,
      pagination: {
        current: page,
        total: Math.ceil(filteredAppeals.length / limit),
        count: filteredAppeals.length,
        limit,
      },
    });
  }),

  // Get appeal by ID
  http.get('/api/content-appeals/:id', ({ params }) => {
    const appeal = mockAppeals.find((a) => a.id === params.id);

    if (!appeal) {
      return HttpResponse.json({ error: 'İtiraz bulunamadı' }, { status: 404 });
    }

    return HttpResponse.json({ appeal });
  }),

  // Create new appeal
  http.post('/api/content-appeals', async ({ request }) => {
    const body = (await request.json()) as {
      userId: string;
      moderationItemId: string;
      originalContentId: string;
      appealReason: string;
      appealDescription: string;
      supportingEvidence?: Array<{
        id: string;
        type: 'document' | 'image' | 'link' | 'text';
        url?: string;
        content?: string;
        uploadedAt: string;
      }>;
    };

    const newAppeal: ContentAppeal = {
      id: generateId(),
      appealNumber: generateAppealNumber(),
      userId: body.userId,
      userInfo: {
        id: body.userId,
        firstName: 'Yeni',
        lastName: 'Kullanıcı',
        email: 'user@example.com',
        userType: 'freelancer',
      },
      moderationItemId: body.moderationItemId,
      originalContent: {
        id: body.originalContentId,
        type: 'job',
        title: 'İçerik Başlığı',
        description: 'İçerik açıklaması',
        moderatedAt: new Date().toISOString(),
        moderationReason: 'Moderasyon nedeni',
        moderatorId: 'mod-1',
        moderatorName: 'Moderator',
        action: 'removed',
      },
      appealReason: body.appealReason as
        | 'incorrect_decision'
        | 'content_misunderstood'
        | 'policy_misapplied'
        | 'technical_error'
        | 'other',
      appealDescription: body.appealDescription,
      supportingEvidence: body.supportingEvidence || [],
      status: 'pending',
      priority: 'medium',
      reviewHistory: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(), // 48 hours from now
      tags: ['new-appeal'],
      internalNotes: [],
    };

    mockAppeals.unshift(newAppeal);

    return HttpResponse.json(
      {
        message: 'İtiraz başarıyla oluşturuldu',
        appeal: newAppeal,
      },
      { status: 201 }
    );
  }),

  // Update appeal
  http.put('/api/content-appeals/:id', async ({ params, request }) => {
    const appealIndex = mockAppeals.findIndex((a) => a.id === params.id);

    if (appealIndex === -1) {
      return HttpResponse.json({ error: 'İtiraz bulunamadı' }, { status: 404 });
    }

    const updates = (await request.json()) as Partial<ContentAppeal>;
    const updatedAppeal = {
      ...mockAppeals[appealIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    mockAppeals[appealIndex] = updatedAppeal;

    return HttpResponse.json({
      message: 'İtiraz başarıyla güncellendi',
      appeal: updatedAppeal,
    });
  }),

  // Take action on appeal
  http.post('/api/content-appeals/:id/action', async ({ params, request }) => {
    const appealIndex = mockAppeals.findIndex((a) => a.id === params.id);

    if (appealIndex === -1) {
      return HttpResponse.json({ error: 'İtiraz bulunamadı' }, { status: 404 });
    }

    const { action, notes } = (await request.json()) as {
      action: 'approve' | 'reject' | 'escalate' | 'assign' | 'request_info';
      notes?: string;
      assignTo?: string;
    };

    const appeal = mockAppeals[appealIndex];
    const now = new Date().toISOString();

    // Add to review history
    const reviewEntry = {
      id: `review-${Date.now()}`,
      reviewerId: 'current-reviewer',
      reviewerName: 'Current Reviewer',
      action: (action === 'approve'
        ? 'resolved'
        : action === 'reject'
          ? 'resolved'
          : action === 'escalate'
            ? 'escalated'
            : 'reviewed') as 'assigned' | 'reviewed' | 'escalated' | 'resolved',
      status:
        action === 'approve'
          ? ('approved' as const)
          : action === 'reject'
            ? ('rejected' as const)
            : ('pending' as const),
      notes,
      timestamp: now,
    };

    appeal.reviewHistory.push(reviewEntry);

    // Update appeal status and resolution if applicable
    switch (action) {
      case 'approve':
        appeal.status = 'approved';
        appeal.resolution = {
          decision: 'overturned',
          reason: notes || 'İtiraz kabul edildi',
          action: 'restore_content',
          reviewerId: 'current-reviewer',
          reviewerName: 'Current Reviewer',
          resolvedAt: now,
        };
        break;
      case 'reject':
        appeal.status = 'rejected';
        appeal.resolution = {
          decision: 'upheld',
          reason: notes || 'İtiraz reddedildi',
          action: 'maintain_action',
          reviewerId: 'current-reviewer',
          reviewerName: 'Current Reviewer',
          resolvedAt: now,
        };
        break;
      case 'escalate':
        appeal.status = 'escalated';
        appeal.priority =
          appeal.priority === 'urgent'
            ? 'urgent'
            : appeal.priority === 'high'
              ? 'urgent'
              : 'high';
        break;
    }

    appeal.updatedAt = now;
    mockAppeals[appealIndex] = appeal;

    return HttpResponse.json({
      message: `İtiraz ${
        action === 'approve'
          ? 'onaylandı'
          : action === 'reject'
            ? 'reddedildi'
            : action === 'escalate'
              ? 'yükseltildi'
              : 'güncellendi'
      }`,
      appeal,
    });
  }),

  // Get appeal statistics
  http.get('/api/content-appeals/stats', () => {
    // In a real app, you would filter stats based on the period
    return HttpResponse.json({
      stats: mockStats,
    });
  }),

  // Add internal note to appeal
  http.post('/api/content-appeals/:id/notes', async ({ params, request }) => {
    const appealIndex = mockAppeals.findIndex((a) => a.id === params.id);

    if (appealIndex === -1) {
      return HttpResponse.json({ error: 'İtiraz bulunamadı' }, { status: 404 });
    }

    const { note, isConfidential = false } = (await request.json()) as {
      note: string;
      isConfidential?: boolean;
    };

    const internalNote = {
      id: `note-${Date.now()}`,
      authorId: 'current-user',
      authorName: 'Current User',
      note,
      isConfidential,
      createdAt: new Date().toISOString(),
    };

    mockAppeals[appealIndex].internalNotes.push(internalNote);
    mockAppeals[appealIndex].updatedAt = new Date().toISOString();

    return HttpResponse.json({
      message: 'Not başarıyla eklendi',
      note: internalNote,
    });
  }),

  // Get appeals by user
  http.get('/api/content-appeals/user/:userId', ({ params, request }) => {
    const userId = params.userId as string;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const userAppeals = mockAppeals.filter(
      (appeal) => appeal.userId === userId
    );

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedAppeals = userAppeals.slice(startIndex, endIndex);

    return HttpResponse.json({
      appeals: paginatedAppeals,
      pagination: {
        current: page,
        total: Math.ceil(userAppeals.length / limit),
        count: userAppeals.length,
        limit,
      },
    });
  }),

  // Bulk operations on appeals
  http.post('/api/content-appeals/bulk', async ({ request }) => {
    const { appealIds, action, notes } = (await request.json()) as {
      appealIds: string[];
      action: 'approve' | 'reject' | 'escalate' | 'assign';
      notes?: string;
      assignTo?: string;
    };

    const updatedAppeals = [];
    const now = new Date().toISOString();

    for (const appealId of appealIds) {
      const appealIndex = mockAppeals.findIndex((a) => a.id === appealId);
      if (appealIndex === -1) continue;

      const appeal = mockAppeals[appealIndex];

      // Add review entry
      const reviewEntry = {
        id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        reviewerId: 'current-reviewer',
        reviewerName: 'Current Reviewer',
        action: (action === 'approve'
          ? 'resolved'
          : action === 'reject'
            ? 'resolved'
            : action === 'escalate'
              ? 'escalated'
              : 'reviewed') as
          | 'assigned'
          | 'reviewed'
          | 'escalated'
          | 'resolved',
        status:
          action === 'approve'
            ? ('approved' as const)
            : action === 'reject'
              ? ('rejected' as const)
              : ('pending' as const),
        notes: notes || `Bulk ${action}`,
        timestamp: now,
      };

      appeal.reviewHistory.push(reviewEntry);

      // Update status
      switch (action) {
        case 'approve':
          appeal.status = 'approved';
          break;
        case 'reject':
          appeal.status = 'rejected';
          break;
        case 'escalate':
          appeal.status = 'escalated';
          appeal.priority = 'high';
          break;
      }

      appeal.updatedAt = now;
      mockAppeals[appealIndex] = appeal;
      updatedAppeals.push(appeal);
    }

    return HttpResponse.json({
      message: `${updatedAppeals.length} itiraz başarıyla güncellendi`,
      updatedAppeals,
    });
  }),

  // Export appeals
  http.get('/api/content-appeals/export', ({ request }) => {
    const url = new URL(request.url);
    const format = url.searchParams.get('format') || 'json'; // json, csv, xlsx
    const status = url.searchParams.get('status');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    let appealsToExport = [...mockAppeals];

    // Apply filters
    if (status && status !== 'all') {
      appealsToExport = appealsToExport.filter(
        (appeal) => appeal.status === status
      );
    }

    if (startDate) {
      appealsToExport = appealsToExport.filter(
        (appeal) => new Date(appeal.createdAt) >= new Date(startDate)
      );
    }

    if (endDate) {
      appealsToExport = appealsToExport.filter(
        (appeal) => new Date(appeal.createdAt) <= new Date(endDate)
      );
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      totalAppeals: appealsToExport.length,
      format,
      appeals: appealsToExport,
    };

    return HttpResponse.json({
      message: 'İtirazlar başarıyla dışa aktarıldı',
      data: exportData,
      downloadUrl: `/api/downloads/appeals-export-${Date.now()}.${format}`,
    });
  }),
];
