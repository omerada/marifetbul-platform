/**
 * Order Timeline API Route
 * Handles order timeline/history
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * GET /api/orders/[orderId]/timeline
 * Get order timeline/event history
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const backendUrl = `${BACKEND_API_URL}/orders/${orderId}/timeline`;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Order Timeline API] GET request:', backendUrl);
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
    console.error('[Order Timeline API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch order timeline',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
