/**
 * Order Detail API Route
 * Proxies requests to backend Spring Boot API
 */

import { NextRequest } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;

  return createBackendProxy({
    method: 'GET',
    endpoint: `/api/v1/orders/${orderId}`,
    request,
    useBaseUrl: true,
    logContext: 'Order Detail API',
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const body = await request.json();

  return createBackendProxy({
    method: 'PATCH',
    endpoint: `/api/v1/orders/${orderId}`,
    request,
    body,
    useBaseUrl: true,
    logContext: 'Order Update API',
  });
}
