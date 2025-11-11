/**
 * Upload User Avatar
 * POST /api/users/avatar
 * @version 2.0.0
 * @updated November 11, 2025 - Modernized with backend-proxy (FormData support)
 */

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';
import logger from '@/lib/infrastructure/monitoring/logger';

export async function POST(request: NextRequest) {
  logger.debug('[Avatar Upload] Uploading avatar');

  // Get FormData from request
  const formData = await request.formData();

  return createBackendProxy({
    method: 'POST',
    endpoint: '/users/avatar',
    request,
    body: formData,
    logContext: 'Avatar Upload API',
    isFormData: true, // Enable FormData handling
    preserveAllHeaders: true, // Preserve all response headers
  });
}
