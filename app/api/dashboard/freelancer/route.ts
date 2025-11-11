/**
 * Dashboard Freelancer API Route
 * Proxies requests to backend Spring Boot API
 */

import { NextRequest } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';

export async function GET(request: NextRequest) {
  return createBackendProxy({
    method: 'GET',
    endpoint: '/api/v1/dashboard/freelancer',
    request,
    useBaseUrl: true,
    logContext: 'Dashboard Freelancer API',
  });
}
