/**
 * Conversations API Route
 * Handles messaging conversations
 * @version 2.0.0
 * @updated November 11, 2025 - Modernized with backend-proxy
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';
import logger from '@/lib/infrastructure/monitoring/logger';

/**
 * GET /api/v1/conversations
 * Fetches user's conversations
 */
export async function GET(request: NextRequest) {
  return createBackendProxy({
    method: 'GET',
    endpoint: '/messages/conversations',
    request,
    logContext: 'Conversations API',
    enableDebugLogging: true,

    // Custom response transformer
    transformResponse: (data: unknown) => {
      // Transform backend response to expected format
      const responseData = data as {
        success?: boolean;
        data?: {
          content?: unknown[];
          number?: number;
          size?: number;
          totalElements?: number;
          totalPages?: number;
          last?: boolean;
          first?: boolean;
        };
      };

      if (responseData.success && responseData.data) {
        const pageData = responseData.data;
        return {
          success: true,
          conversations: pageData.content || [],
          pagination: {
            page: pageData.number || 0,
            pageSize: pageData.size || 20,
            limit: pageData.size || 20,
            total: pageData.totalElements || 0,
            totalPages: pageData.totalPages || 0,
            hasNext: !pageData.last,
            hasPrev: !pageData.first,
          },
          timestamp: new Date().toISOString(),
        };
      }

      return data;
    },

    // Custom error handler - return empty array instead of error
    customErrorHandler: (error: unknown) => {
      logger.error(
        '[Conversations API] Error:',
        error instanceof Error ? error : new Error(String(error))
      );

      // Return empty array to prevent blocking the UI
      return NextResponse.json({
        success: true,
        conversations: [],
        pagination: {
          page: 0,
          pageSize: 20,
          limit: 20,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        timestamp: new Date().toISOString(),
      });
    },
  });
}

/**
 * POST /api/v1/conversations
 * Creates a new conversation
 */
export async function POST(request: NextRequest) {
  const body = await request.json();

  return createBackendProxy({
    method: 'POST',
    endpoint: '/messages/conversations',
    request,
    body,
    logContext: 'Conversations API',
    enableDebugLogging: true,
  });
}
