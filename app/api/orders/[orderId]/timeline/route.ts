/**
 * Order Timeline API Route
 * Proxies requests to backend Spring Boot API
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const response = await fetch(
      `${BACKEND_URL}/api/v1/orders/${orderId}/timeline`,
      {
        headers: {
          Authorization: request.headers.get('Authorization') || '',
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Order timeline API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order timeline' },
      { status: 500 }
    );
  }
}
