/**
 * ================================================
 * MODERATOR STATS API ROUTE
 * ================================================
 * GET /api/v1/moderator/stats
 *
 * Returns comprehensive moderation statistics:
 * - Pending items count (comments, reviews, reports)
 * - Actions taken today
 * - Average response time
 * - Moderator accuracy rate
 *
 * Security: MODERATOR or ADMIN role required
 * Backend: GET /api/v1/moderator/stats
 *
 * @version 2.0.0
 * @created November 3, 2025
 * @updated November 11, 2025 - Modernized with backend-proxy
 */

import { NextRequest } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/moderator/stats
 * Proxy to backend moderator stats endpoint
 */
export async function GET(request: NextRequest) {
  return createBackendProxy({
    method: 'GET',
    endpoint: '/moderator/stats',
    request,
    logContext: 'Moderator Stats API',
    enableDebugLogging: true,
  });
}
