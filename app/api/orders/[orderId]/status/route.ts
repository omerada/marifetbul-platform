/**
 * Order Status API Route
 * Proxies requests to backend Spring Boot API
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();

    const response = await fetch(
      `${BACKEND_URL}/api/v1/orders/${orderId}/status`,
      {
        method: 'PATCH',
        headers: {
          Authorization: request.headers.get('Authorization') || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Order status API error:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
