/**
 * Order Timeline API Route
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
    endpoint: `/api/v1/orders/${orderId}/timeline`,
    request,
    useBaseUrl: true,
    logContext: 'Order Timeline API',
  });
}
