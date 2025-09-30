import { NextRequest, NextResponse } from 'next/server';

// Simple mock package data for reviews
const mockPackages = [
  {
    id: '1',
    title: 'Web Development Service',
    freelancerId: 'freelancer-1',
    freelancer: {
      firstName: 'John',
      lastName: 'Smith',
    },
  },
  {
    id: '2',
    title: 'Logo Design Service',
    freelancerId: 'freelancer-2',
    freelancer: {
      firstName: 'Jane',
      lastName: 'Doe',
    },
  },
];

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '5');

    // Find package by ID
    console.log('Looking for package with ID:', id);
    console.log(
      'Available packages:',
      mockPackages.map((p) => ({ id: p.id, title: p.title }))
    );
    const pkg = mockPackages.find((p) => p.id === id);
    console.log('Found package:', pkg ? pkg.title : 'Not found');

    if (!pkg) {
      return NextResponse.json(
        {
          success: false,
          error: 'Package not found',
        },
        { status: 404 }
      );
    }

    // Mock reviews data - in real app this would come from database
    const mockReviews = [
      {
        id: 'review-1',
        rating: 5,
        comment:
          'Great work! Designed exactly the modern and impressive logo I wanted.',
        reviewer: {
          id: 'user-1',
          firstName: 'John',
          lastName: 'Smith',
          avatar: '/avatars/user-1.jpg',
        },
        reviewee: {
          id: pkg.freelancerId,
          firstName: pkg.freelancer?.firstName || 'Unknown',
          lastName: pkg.freelancer?.lastName || 'User',
        },
        packageId: id,
        createdAt: '2024-11-15T14:30:00Z',
      },
      {
        id: 'review-2',
        rating: 5,
        comment:
          'Very professional approach, on-time delivery and excellent quality. Definitely recommend.',
        reviewer: {
          id: 'user-2',
          firstName: 'Jane',
          lastName: 'Wilson',
          avatar: '/avatars/user-2.jpg',
        },
        reviewee: {
          id: pkg.freelancerId,
          firstName: pkg.freelancer?.firstName || 'Unknown',
          lastName: pkg.freelancer?.lastName || 'User',
        },
        packageId: id,
        createdAt: '2024-11-10T09:15:00Z',
      },
    ];

    const startIndex = (page - 1) * limit;
    const reviews = mockReviews.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total: mockReviews.length,
        totalPages: Math.ceil(mockReviews.length / limit),
      },
    });
  } catch (error) {
    console.error('Package reviews API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
        message: 'Error occurred while fetching reviews',
      },
      { status: 500 }
    );
  }
}
