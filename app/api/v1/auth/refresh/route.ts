/**
 * Token Refresh Endpoint
 * Proxies refresh token requests to backend with proper cookie handling
 * @version 2.0.0
 * @updated November 11, 2025 - Modernized with backend-proxy (preserveAllHeaders)
 */

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';
import logger from '@/lib/infrastructure/monitoring/logger';

export async function POST(request: NextRequest) {
  // Get request body to forward to backend
  let body;
  try {
    body = await request.text();
  } catch {
    body = '{}'; // If no body, send empty JSON
  }

  logger.debug('[Token Refresh] Proxying to backend');

  // Log cookie presence for debugging
  const cookieHeader = request.headers.get('Cookie');
  if (cookieHeader) {
    logger.debug('[Token Refresh] Forwarding cookies');
  } else {
    logger.warn('[Token Refresh] No cookies found in request');
  }

  return createBackendProxy({
    method: 'POST',
    endpoint: '/auth/refresh',
    request,
    body: body || '{}',
    logContext: 'Token Refresh API',
    enableDebugLogging: true,
    preserveAllHeaders: true, // CRITICAL: Preserve Set-Cookie headers
  });
}
