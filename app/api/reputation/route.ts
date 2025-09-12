import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Reputation query validation schema
const ReputationQuerySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  userType: z.enum(['freelancer', 'employer']),
  includeHistory: z.boolean().default(false),
  includeBadges: z.boolean().default(true),
  includeSecurityAlerts: z.boolean().default(true),
});

// Update reputation validation schema
const UpdateReputationSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  action: z.enum([
    'project_completed',
    'review_received',
    'milestone_achieved',
    'violation_reported',
  ]),
  metadata: z
    .object({
      projectId: z.string().optional(),
      rating: z.number().min(1).max(5).optional(),
      amount: z.number().optional(),
      category: z.string().optional(),
    })
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Mock authentication - In production, implement proper auth validation
    const mockSession = {
      user: {
        id: 'current-user-id',
        userType: 'freelancer',
      },
    };

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Process query parameters
    const processedParams = {
      ...queryParams,
      userId: queryParams.userId || mockSession.user.id,
      userType: queryParams.userType || mockSession.user.userType,
      includeHistory: queryParams.includeHistory === 'true',
      includeBadges: queryParams.includeBadges !== 'false',
      includeSecurityAlerts: queryParams.includeSecurityAlerts !== 'false',
    };

    const validatedQuery = ReputationQuerySchema.parse(processedParams);

    // Generate mock reputation data
    const reputationData = generateReputationData(validatedQuery);

    return NextResponse.json({
      success: true,
      data: reputationData,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Reputation API error:', error);

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
    const mockSession = {
      user: {
        id: 'current-user-id',
        role: 'admin', // Only admins or system can update reputation
      },
    };

    // Verify admin access
    if (mockSession.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateReputationSchema.parse(body);

    // Mock reputation update - In production, this would update the database
    const updatedReputation = processReputationUpdate(validatedData);

    return NextResponse.json({
      success: true,
      data: updatedReputation,
      message: 'Reputation updated successfully',
    });
  } catch (error) {
    console.error('Update reputation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid reputation update data',
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

function generateReputationData(query: z.infer<typeof ReputationQuerySchema>) {
  const baseReputation = {
    userId: query.userId,
    overallScore: 887,
    level: 'Elite',
    trustScore: 94.5,
    reliabilityScore: 91.2,
    communicationScore: 96.8,
    qualityScore: 88.4,
    lastUpdated: new Date().toISOString(),
  };

  const badges = query.includeBadges
    ? [
        {
          id: 'top-rated',
          name: 'Top Rated',
          description: 'Maintains 4.8+ rating with 50+ reviews',
          icon: '⭐',
          level: 'gold',
          earnedAt: '2024-01-15T10:30:00Z',
        },
        {
          id: 'reliable-delivery',
          name: 'Reliable Delivery',
          description: '95%+ on-time delivery rate',
          icon: '🚀',
          level: 'silver',
          earnedAt: '2024-02-20T14:45:00Z',
        },
        {
          id: 'excellent-communication',
          name: 'Excellent Communication',
          description: 'Responds within 2 hours on average',
          icon: '💬',
          level: 'gold',
          earnedAt: '2024-03-10T09:15:00Z',
        },
        {
          id: 'client-favorite',
          name: 'Client Favorite',
          description: '70%+ repeat client rate',
          icon: '❤️',
          level: 'platinum',
          earnedAt: '2024-04-05T16:20:00Z',
        },
      ]
    : [];

  const securityAlerts = query.includeSecurityAlerts
    ? [
        {
          id: 'identity-verified',
          type: 'success',
          title: 'Identity Verified',
          message: 'User has completed full identity verification',
          severity: 'info',
          createdAt: '2024-01-10T08:00:00Z',
        },
        {
          id: 'payment-verified',
          type: 'success',
          title: 'Payment Method Verified',
          message: 'Valid payment method on file',
          severity: 'info',
          createdAt: '2024-01-10T08:15:00Z',
        },
      ]
    : [];

  const history = query.includeHistory
    ? [
        {
          date: '2024-06-01',
          score: 887,
          change: +5,
          reason: 'Received excellent review (5.0 rating)',
        },
        {
          date: '2024-05-28',
          score: 882,
          change: +3,
          reason: 'Completed project on time',
        },
        {
          date: '2024-05-25',
          score: 879,
          change: +2,
          reason: 'Quick response to client messages',
        },
        {
          date: '2024-05-20',
          score: 877,
          change: -1,
          reason: 'Minor delay in milestone delivery',
        },
      ]
    : [];

  return {
    ...baseReputation,
    badges,
    securityAlerts,
    history,
    insights: {
      strengths: [
        'Excellent communication',
        'High quality work',
        'Reliable delivery',
      ],
      improvements: [
        'Could improve project estimation',
        'Consider faster turnaround',
      ],
      nextBadge: {
        name: 'Veteran Professional',
        progress: 78,
        requirement: 'Complete 100 projects with 4.8+ average rating',
      },
    },
    rankings: {
      globalRank: 156,
      categoryRank: 23,
      countryRank: 8,
      percentile: 95.2,
    },
    verification: {
      identity: true,
      email: true,
      phone: true,
      paymentMethod: true,
      portfolio: true,
      socialProfiles: false,
    },
  };
}

function processReputationUpdate(data: z.infer<typeof UpdateReputationSchema>) {
  // Mock reputation calculation - In production, this would use complex algorithms
  const scoreChanges: Record<string, number> = {
    project_completed: 3,
    review_received: data.metadata?.rating ? (data.metadata.rating - 3) * 2 : 0,
    milestone_achieved: 2,
    violation_reported: -10,
  };

  const change = scoreChanges[data.action] || 0;
  const newScore = Math.max(0, Math.min(1000, 887 + change)); // Clamp between 0-1000

  return {
    userId: data.userId,
    previousScore: 887,
    newScore,
    change,
    action: data.action,
    metadata: data.metadata,
    processedAt: new Date().toISOString(),
  };
}
