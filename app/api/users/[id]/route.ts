/**
 * User Management API
 * GET/PATCH /api/users/:id
 * @version 2.0.0
 * @updated November 11, 2025 - Modernized with backend-proxy
 */

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';
import logger from '@/lib/infrastructure/monitoring/logger';

/**
 * Get User by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  logger.debug('[User API] Fetching user', { userId: id });

  return createBackendProxy({
    method: 'GET',
    endpoint: `/users/${id}`,
    request,
    logContext: 'User API',
    preserveAllHeaders: true, // Preserve all response headers
  });
}

/**
 * Update User by ID
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  logger.debug('[User API] Updating user', { userId: id });

  // Get request body
  const body = await request.text();

  return createBackendProxy({
    method: 'PUT', // Backend uses PUT
    endpoint: `/users/${id}`,
    request,
    body,
    logContext: 'User API',
    preserveAllHeaders: true, // Preserve all response headers
  });
}
