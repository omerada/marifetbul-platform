/**
 * ================================================
 * MODERATOR PENDING ITEMS API ROUTE
 * ================================================
 * GET /api/v1/moderator/pending-items
 *
 * Returns paginated list of pending moderation items:
 * - Comments (pending, flagged)
 * - Reviews (pending, flagged)
 * - Reports
 * - Support tickets
 *
 * Items are sorted by priority (HIGH > MEDIUM > LOW) and waiting time
 *
 * Query Parameters:
 * - page: Page number (0-based, default: 0)
 * - size: Page size (default: 20, max: 100)
 *
 * Security: MODERATOR or ADMIN role required
 * Backend: GET /api/v1/moderator/pending-items
 *
 * @version 2.0.0
 * @created November 3, 2025
 * @updated November 11, 2025 - Modernized with backend-proxy
 */

import { NextRequest } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';

export const dynamic = 'force-dynamic';

/**
 * GET /api/v1/moderator/pending-items
 * Proxy to backend pending items endpoint
 */
export async function GET(request: NextRequest) {
  return createBackendProxy({
    method: 'GET',
    endpoint: '/moderator/pending-items',
    request,
    logContext: 'Moderator Pending Items API',
    enableDebugLogging: true,
  });
}
