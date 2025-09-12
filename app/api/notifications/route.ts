import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Notification creation validation schema
const CreateNotificationSchema = z.object({
  type: z.enum(['review', 'analytics', 'reputation', 'security', 'system']),
  category: z.enum(['success', 'info', 'warning', 'error']),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  metadata: z.record(z.string(), z.unknown()).optional(),
  actionLabel: z.string().max(50).optional(),
  actionUrl: z.string().url().optional(),
  expiresAt: z.string().datetime().optional(),
});

// Notification update validation schema
// Unused schema but kept for future use
const _UpdateNotificationSchema = z.object({
  isRead: z.boolean().optional(),
  isPinned: z.boolean().optional(),
});

// Notification query validation schema
const NotificationQuerySchema = z.object({
  type: z
    .enum(['review', 'analytics', 'reputation', 'security', 'system'])
    .optional(),
  category: z.enum(['success', 'info', 'warning', 'error']).optional(),
  isRead: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
  sortBy: z.enum(['newest', 'oldest', 'unread-first']).default('newest'),
});

export async function GET(request: NextRequest) {
  try {
    // Mock authentication - In production, implement proper auth validation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mockSession = {
      user: {
        id: 'current-user-id',
        name: 'Current User',
      },
    };

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Convert string parameters to appropriate types
    const processedParams = {
      ...queryParams,
      isRead: queryParams.isRead ? queryParams.isRead === 'true' : undefined,
      isPinned: queryParams.isPinned
        ? queryParams.isPinned === 'true'
        : undefined,
      page: Number(queryParams.page) || 1,
      limit: Math.min(Number(queryParams.limit) || 20, 50),
    };

    const validatedQuery = NotificationQuerySchema.parse(processedParams);

    // Generate mock notifications
    const mockNotifications = generateMockNotifications(
      mockSession.user.id,
      validatedQuery
    );

    // Apply filters
    let filteredNotifications = mockNotifications;
    if (validatedQuery.type) {
      filteredNotifications = filteredNotifications.filter(
        (n) => n.type === validatedQuery.type
      );
    }
    if (validatedQuery.category) {
      filteredNotifications = filteredNotifications.filter(
        (n) => n.category === validatedQuery.category
      );
    }
    if (validatedQuery.isRead !== undefined) {
      filteredNotifications = filteredNotifications.filter(
        (n) => n.isRead === validatedQuery.isRead
      );
    }
    if (validatedQuery.isPinned !== undefined) {
      filteredNotifications = filteredNotifications.filter(
        (n) => n.isPinned === validatedQuery.isPinned
      );
    }

    // Apply sorting
    filteredNotifications.sort((a, b) => {
      switch (validatedQuery.sortBy) {
        case 'oldest':
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case 'unread-first':
          if (a.isRead !== b.isRead) return a.isRead ? 1 : -1;
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'newest':
        default:
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      }
    });

    // Apply pagination
    const startIndex = (validatedQuery.page - 1) * validatedQuery.limit;
    const endIndex = startIndex + validatedQuery.limit;
    const paginatedNotifications = filteredNotifications.slice(
      startIndex,
      endIndex
    );

    const totalNotifications = filteredNotifications.length;
    const totalPages = Math.ceil(totalNotifications / validatedQuery.limit);
    const unreadCount = mockNotifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          page: validatedQuery.page,
          limit: validatedQuery.limit,
          total: totalNotifications,
          pages: totalPages,
          hasNext: validatedQuery.page < totalPages,
          hasPrev: validatedQuery.page > 1,
        },
        summary: {
          total: mockNotifications.length,
          unread: unreadCount,
          pinned: mockNotifications.filter((n) => n.isPinned).length,
        },
      },
    });
  } catch (error) {
    console.error('Notifications API error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Mock authentication - In production, implement proper auth validation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mockSession = {
      user: {
        id: 'current-user-id',
        role: 'user',
      },
    };

    const body = await request.json();
    const validatedData = CreateNotificationSchema.parse(body);

    // Mock notification creation - In production, this would save to database
    const newNotification = {
      id: Date.now().toString(),
      ...validatedData,
      isRead: false,
      isPinned: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newNotification,
      message: 'Notification created successfully',
    });
  } catch (error) {
    console.error('Create notification error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid notification data',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateMockNotifications(
  _userId: string,
  _query: z.infer<typeof NotificationQuerySchema>
) {
  const now = new Date();
  const notifications = [
    {
      id: '1',
      type: 'review' as const,
      category: 'success' as const,
      title: 'New Review Received',
      message:
        'John Doe left you a 5-star review for the E-commerce Website project.',
      metadata: {
        reviewId: 'review-123',
        rating: 5,
        projectId: 'project-456',
      },
      actionLabel: 'View Review',
      actionUrl: '/reviews/review-123',
      isRead: false,
      isPinned: false,
      createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      updatedAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'analytics' as const,
      category: 'info' as const,
      title: 'Weekly Performance Report',
      message:
        'Your weekly analytics report is ready. You completed 3 projects this week.',
      metadata: {
        weeklyProjects: 3,
        weeklyEarnings: 5600,
        weeklyRating: 4.9,
      },
      actionLabel: 'View Report',
      actionUrl: '/analytics/weekly',
      isRead: true,
      isPinned: true,
      createdAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      updatedAt: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'reputation' as const,
      category: 'success' as const,
      title: 'New Badge Earned!',
      message:
        'Congratulations! You earned the "Client Favorite" badge for maintaining a 70% repeat client rate.',
      metadata: {
        badgeId: 'client-favorite',
        previousScore: 882,
        newScore: 887,
      },
      actionLabel: 'View Badge',
      actionUrl: '/profile/badges',
      isRead: false,
      isPinned: true,
      createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
      updatedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      type: 'security' as const,
      category: 'warning' as const,
      title: 'Login from New Device',
      message:
        'We detected a login from a new device in Istanbul, Turkey. If this was not you, please secure your account.',
      metadata: {
        ip: '85.34.123.45',
        location: 'Istanbul, Turkey',
        device: 'Chrome on Windows',
        timestamp: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
      },
      actionLabel: 'Review Activity',
      actionUrl: '/security/activity',
      isRead: false,
      isPinned: false,
      createdAt: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
      updatedAt: new Date(now.getTime() - 18 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      type: 'system' as const,
      category: 'info' as const,
      title: 'Platform Maintenance',
      message:
        'Scheduled maintenance will occur tonight from 2:00 AM to 4:00 AM UTC. Some features may be temporarily unavailable.',
      metadata: {
        maintenanceStart: '2024-06-15T02:00:00Z',
        maintenanceEnd: '2024-06-15T04:00:00Z',
        affectedServices: ['messaging', 'file-upload'],
      },
      actionLabel: 'Learn More',
      actionUrl: '/help/maintenance',
      isRead: true,
      isPinned: false,
      expiresAt: '2024-06-16T00:00:00Z',
      createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      updatedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '6',
      type: 'analytics' as const,
      category: 'warning' as const,
      title: 'Performance Alert',
      message:
        'Your response time has increased to 4 hours. Consider improving response times to maintain your rating.',
      metadata: {
        currentResponseTime: '4h 12m',
        previousResponseTime: '2h 15m',
        threshold: '3h',
      },
      actionLabel: 'View Analytics',
      actionUrl: '/analytics/performance',
      isRead: false,
      isPinned: false,
      createdAt: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(), // 1.5 days ago
      updatedAt: new Date(now.getTime() - 36 * 60 * 60 * 1000).toISOString(),
    },
  ];

  return notifications;
}
