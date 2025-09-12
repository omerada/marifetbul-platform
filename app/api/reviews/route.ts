import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Review creation validation schema
const CreateReviewSchema = z.object({
  targetUserId: z.string().min(1, 'Target user ID is required'),
  projectId: z.string().optional(),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10, 'Comment must be at least 10 characters'),
  categories: z.object({
    communication: z.number().min(1).max(5).optional(),
    quality: z.number().min(1).max(5).optional(),
    timing: z.number().min(1).max(5).optional(),
    professionalism: z.number().min(1).max(5).optional(),
    value: z.number().min(1).max(5).optional(),
  }),
  isPublic: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
});

// Review query validation schema
const ReviewQuerySchema = z.object({
  userId: z.string().optional(),
  projectId: z.string().optional(),
  rating: z.number().min(1).max(5).optional(),
  category: z.string().optional(),
  isPublic: z.boolean().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
  sortBy: z
    .enum(['newest', 'oldest', 'rating-high', 'rating-low', 'helpful'])
    .default('newest'),
});

export async function GET(request: NextRequest) {
  try {
    // Mock authentication - In production, implement proper auth validation
    const mockSession = {
      user: {
        id: 'current-user-id',
        name: 'Current User',
        image: '/images/avatar.jpg',
      },
    };

    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // Convert string parameters to appropriate types
    const processedParams = {
      ...queryParams,
      rating: queryParams.rating ? Number(queryParams.rating) : undefined,
      isPublic: queryParams.isPublic
        ? queryParams.isPublic === 'true'
        : undefined,
      page: Number(queryParams.page) || 1,
      limit: Math.min(Number(queryParams.limit) || 10, 50),
    };

    const validatedQuery = ReviewQuerySchema.parse(processedParams);

    // Mock reviews response - In production, this would query the database
    const mockReviews = [
      {
        id: '1',
        reviewerId: mockSession.user.id,
        targetUserId: validatedQuery.userId || 'target-user',
        projectId: validatedQuery.projectId,
        rating: 5,
        comment: 'Excellent work! Very professional and delivered on time.',
        categories: {
          communication: 5,
          quality: 5,
          timing: 5,
          professionalism: 5,
          value: 4,
        },
        isPublic: true,
        tags: ['professional', 'quality'],
        verifiedPurchase: true,
        helpfulCount: 3,
        reply: null,
        reviewer: {
          id: mockSession.user.id,
          firstName: 'John',
          lastName: 'Doe',
          avatar: mockSession.user.image,
          userType: 'employer',
        },
        projectTitle: 'E-commerce Website Development',
        projectCategory: 'Web Development',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    const totalReviews = mockReviews.length;
    const totalPages = Math.ceil(totalReviews / validatedQuery.limit);

    return NextResponse.json({
      success: true,
      data: {
        reviews: mockReviews,
        pagination: {
          page: validatedQuery.page,
          limit: validatedQuery.limit,
          total: totalReviews,
          pages: totalPages,
          hasNext: validatedQuery.page < totalPages,
          hasPrev: validatedQuery.page > 1,
        },
        summary: {
          averageRating: 4.8,
          totalReviews,
          ratingDistribution: {
            5: 15,
            4: 8,
            3: 2,
            2: 1,
            1: 0,
          },
        },
      },
    });
  } catch (error) {
    console.error('Reviews API error:', error);

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
        name: 'Current User',
        image: '/images/avatar.jpg',
      },
    };

    const body = await request.json();
    const validatedData = CreateReviewSchema.parse(body);

    // Validate that user is not reviewing themselves
    if (validatedData.targetUserId === mockSession.user.id) {
      return NextResponse.json(
        { success: false, error: 'Cannot review yourself' },
        { status: 400 }
      );
    }

    // Mock review creation - In production, this would save to database
    const newReview = {
      id: Date.now().toString(),
      reviewerId: mockSession.user.id,
      ...validatedData,
      verifiedPurchase: true, // This would be determined by actual project history
      helpfulCount: 0,
      reply: null,
      reviewer: {
        id: mockSession.user.id,
        firstName: mockSession.user.name?.split(' ')[0] || 'User',
        lastName: mockSession.user.name?.split(' ')[1] || '',
        avatar: mockSession.user.image,
        userType: 'employer', // This would come from user profile
      },
      projectTitle: 'Sample Project', // This would be fetched from project data
      projectCategory: 'Web Development',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: newReview,
      message: 'Review created successfully',
    });
  } catch (error) {
    console.error('Create review error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid review data',
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
