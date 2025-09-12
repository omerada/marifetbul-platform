import { NextRequest, NextResponse } from 'next/server';
import { mockPackages } from '@/lib/msw/handlers';

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
          error: 'Hizmet paketi bulunamadı',
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
          'Harika bir çalışma oldu. Tam istediğim gibi modern ve etkileyici bir logo tasarladı.',
        reviewer: {
          id: 'user-1',
          firstName: 'Mehmet',
          lastName: 'Öz',
          avatar: '/avatars/user-1.jpg',
        },
        reviewee: {
          id: pkg.freelancerId,
          firstName: pkg.freelancer.firstName,
          lastName: pkg.freelancer.lastName,
        },
        packageId: id,
        createdAt: '2024-11-15T14:30:00Z',
      },
      {
        id: 'review-2',
        rating: 5,
        comment:
          'Çok profesyonel yaklaşım, zamanında teslimat ve mükemmel kalite. Kesinlikle tavsiye ederim.',
        reviewer: {
          id: 'user-2',
          firstName: 'Fatma',
          lastName: 'Kara',
          avatar: '/avatars/user-2.jpg',
        },
        reviewee: {
          id: pkg.freelancerId,
          firstName: pkg.freelancer.firstName,
          lastName: pkg.freelancer.lastName,
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
        error: 'Sunucu hatası',
        message: 'Değerlendirmeler getirilirken hata oluştu',
      },
      { status: 500 }
    );
  }
}
