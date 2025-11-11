/**
 * Orders API Route
 * Proxies requests to backend Spring Boot API
 */

import { NextRequest } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';

export async function GET(request: NextRequest) {
  return createBackendProxy({
    method: 'GET',
    endpoint: '/api/v1/orders',
    request,
    useBaseUrl: true,
    logContext: 'Orders API',
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  return createBackendProxy({
    method: 'POST',
    endpoint: '/api/v1/orders',
    request,
    body,
    useBaseUrl: true,
    logContext: 'Orders API',
  });
}
