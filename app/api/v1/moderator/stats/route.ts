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
 * @version 1.0.0
 * @created November 3, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/infrastructure/monitoring/logger';

export const dynamic = 'force-dynamic';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * GET /api/v1/moderator/stats
 * Proxy to backend moderator stats endpoint
 */
export async function GET(request: NextRequest) {
  try {
    logger.debug('[Moderator Stats API] GET request', { urlrequesturl,  });

    // Forward to backend
    const response = await fetch(`${BACKEND_API_URL}/moderator/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('Authorization') || '',
      },
      credentials: 'include',
    });

    const data = await response.json();

    logger.debug('[Moderator Stats API] Backend response', { statusresponsestatus, successresponseok,  });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    logger.error(
      '[Moderator Stats API] Error',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'MODERATOR_STATS_ERROR',
          message: 'Error occurred while fetching moderator statistics',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
