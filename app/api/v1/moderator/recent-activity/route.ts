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
 * @version 1.0.0
 * @created November 3, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/infrastructure/monitoring/logger';

export const dynamic = 'force-dynamic';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * GET /api/v1/moderator/recent-activity
 * Proxy to backend recent activity endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '20';

    logger.debug('[Moderator Recent Activity API] GET request', { limit,  });

    // Build backend URL with query params
    const backendUrl = new URL(`${BACKEND_API_URL}/moderator/recent-activity`);
    backendUrl.searchParams.set('limit', limit);

    // Forward to backend
    const response = await fetch(backendUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('Authorization') || '',
      },
      credentials: 'include',
    });

    const data = await response.json();

    logger.debug('[Moderator Recent Activity API] Backend response', { statusresponsestatus, successresponseok, activityCountdatadatalength0,  });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    logger.error(
      '[Moderator Recent Activity API] Error',
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RECENT_ACTIVITY_ERROR',
          message: 'Error occurred while fetching recent activity',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
