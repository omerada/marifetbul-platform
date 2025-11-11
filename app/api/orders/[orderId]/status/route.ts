/**
 * Order Status API Route
 * Proxies requests to backend Spring Boot API
 */

import { NextRequest } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const { orderId } = await params;
  const body = await request.json();

  return createBackendProxy({
    method: 'PATCH',
    endpoint: `/api/v1/orders/${orderId}/status`,
    request,
    body,
    useBaseUrl: true,
    logContext: 'Order Status API',
  });
}
