/**
 * Order Status Update API Route
 * Handles order status changes
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * PATCH /api/orders/[orderId]/status
 * Update order status
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const { orderId } = params;
    const body = await request.json();
    const { status, note } = body;

    // Map frontend status to backend actions
    let backendEndpoint = '';
    let backendBody: Record<string, unknown> = {};

    switch (status) {
      case 'accepted':
        backendEndpoint = `/orders/${orderId}/accept`;
        break;
      case 'in_progress':
        backendEndpoint = `/orders/${orderId}/start`;
        break;
      case 'completed':
        backendEndpoint = `/orders/${orderId}/approve`;
        break;
      case 'cancelled':
        backendEndpoint = `/orders/${orderId}/cancel`;
        backendBody = { reason: 'USER_REQUESTED', note };
        break;
      case 'delivered':
        backendEndpoint = `/orders/${orderId}/deliver`;
        backendBody = { deliveryNote: note, attachments: [] };
        break;
      case 'revision_requested':
        backendEndpoint = `/orders/${orderId}/revise`;
        backendBody = { revisionNote: note };
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_STATUS',
              message: `Invalid status: ${status}`,
            },
            timestamp: new Date().toISOString(),
          },
          { status: 400 }
        );
    }

    const backendUrl = `${BACKEND_API_URL}${backendEndpoint}`;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Order Status API] PATCH request:', {
        url: backendUrl,
        status,
        body: backendBody,
      });
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
      body: JSON.stringify(backendBody),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Order Status API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update order status',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
