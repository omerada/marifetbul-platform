/**
 * ================================================
 * MODERATOR RECENT ACTIVITY API ROUTE
 * ================================================
 * GET /api/v1/moderator/recent-activity
 *
 * Returns chronological list of recent moderation actions:
 * - Approvals
 * - Rejections
 * - Spam markings
 * - User warnings/bans
 * - Ticket resolutions
 *
 * Query Parameters:
 * - limit: Number of recent activities (default: 20, max: 100)
 *
 * Security: MODERATOR or ADMIN role required
 * Backend: GET /api/v1/moderator/recent-activity
 *
 * @version 2.0.0
 * @created November 3, 2025
 * @updated November 11, 2025 - Modernized with backend-proxy
 */

import { NextRequest } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/moderator/recent-activity
 * Proxy to backend recent activity endpoint
 */
export async function GET(request: NextRequest) {
  return createBackendProxy({
    method: 'GET',
    endpoint: '/moderator/recent-activity',
    request,
    logContext: 'Moderator Recent Activity API',
    enableDebugLogging: true,
  });
}
