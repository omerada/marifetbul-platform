import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/infrastructure/monitoring/logger';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * GET /api/v1/dashboard/freelancer/activities
 * Freelancer activity timeline endpoint - proxies to backend
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '20';

    const backendUrl = `${BACKEND_API_URL}/dashboard/freelancer/activities?page=${page}&size=${size}`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') && {
          Authorization: request.headers.get('Authorization')!,
        }),
      },
      credentials: 'include',
      // Forward cookies from request
      ...(request.headers.get('Cookie') && {
        headers: {
          ...request.headers,
          Cookie: request.headers.get('Cookie')!,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: 'Failed to fetch freelancer activities',
      }));

      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Failed to fetch activities',
          data: [],
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    logger.error('Freelancer activities API proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
        data: [],
      },
      { status: 500 }
    );
  }
}
