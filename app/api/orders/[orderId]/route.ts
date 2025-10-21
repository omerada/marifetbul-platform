/**
 * Order Detail API Route
 * Handles individual order operations (GET, PATCH, DELETE)
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * GET /api/orders/[orderId]
 * Get order details by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const backendUrl = `${BACKEND_API_URL}/orders/${orderId}`;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Order Detail API] GET request:', backendUrl);
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
    console.error('[Order Detail API] GET Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch order details',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/orders/[orderId]
 * Update order (not commonly used, prefer specific actions)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const backendUrl = `${BACKEND_API_URL}/orders/${orderId}`;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Order Detail API] PATCH request:', backendUrl, body);
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const response = await fetch(backendUrl, {
      method: 'PATCH',
      headers,
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Order Detail API] PATCH Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update order',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/orders/[orderId]
 * Delete/Cancel order
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const backendUrl = `${BACKEND_API_URL}/orders/${orderId}/cancel`;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Order Detail API] DELETE request:', backendUrl);
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        reason: 'USER_REQUESTED',
        note: 'Cancelled by user',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Order Detail API] DELETE Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to cancel order',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
