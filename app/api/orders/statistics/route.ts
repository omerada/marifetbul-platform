/**
 * Order Statistics API Route
 * Handles order statistics and analytics
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * GET /api/orders/statistics
 * Get order statistics for current user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'seller';

    // Determine endpoint based on role
    const backendEndpoint =
      role === 'seller'
        ? '/orders/statistics/seller/me'
        : '/orders/statistics/buyer/me';

    const backendUrl = `${BACKEND_API_URL}${backendEndpoint}`;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Order Statistics API] GET request:', backendUrl);
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Order Statistics API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch order statistics',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
