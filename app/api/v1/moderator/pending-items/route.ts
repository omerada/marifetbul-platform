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
 * @version 1.0.0
 * @created November 3, 2025
 */

import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/infrastructure/monitoring/logger';

export const dynamic = 'force-dynamic';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * GET /api/v1/moderator/pending-items
 * Proxy to backend pending items endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') || '0';
    const size = searchParams.get('size') || '20';

    logger.debug('[Moderator Pending Items API] GET request', { page, size,  });

    // Build backend URL with query params
    const backendUrl = new URL(`${BACKEND_API_URL}/moderator/pending-items`);
    backendUrl.searchParams.set('page', page);
    backendUrl.searchParams.set('size', size);

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

    logger.debug('[Moderator Pending Items API] Backend response', { statusresponsestatus, successresponseok, itemCountdatadataitemslength0,  });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    logger.error(
      '[Moderator Pending Items API] Error',
      error instanceof Error ? error : new Error(String(error))
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'PENDING_ITEMS_ERROR',
          message: 'Error occurred while fetching pending items',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    );
  }
}
