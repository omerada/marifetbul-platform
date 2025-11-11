/**
 * Conversation Messages API Route
 * Handles messages within a specific conversation
 * @version 2.0.0
 * @updated November 11, 2025 - Modernized with backend-proxy
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';
import logger from '@/lib/infrastructure/monitoring/logger';

/**
 * GET /api/v1/conversations/[id]/messages
 * Fetches messages for a specific conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  return createBackendProxy({
    method: 'GET',
    endpoint: `/messages/conversations/${id}/messages`,
    request,
    logContext: 'Conversation Messages API',
    enableDebugLogging: true,

    // Custom response transformer
    transformResponse: (data: unknown) => {
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
          messages: pageData.content || [],
          pagination: {
            page: pageData.number || 0,
            pageSize: pageData.size || 50,
            limit: pageData.size || 50,
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

    // Custom error handler - return empty array on 404
    customErrorHandler: (error: unknown) => {
      logger.error(
        '[Conversation Messages API] Error:',
        error instanceof Error ? error : new Error(String(error))
      );

      return NextResponse.json({
        success: true,
        messages: [],
        pagination: {
          page: 0,
          pageSize: 50,
          limit: 50,
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
 * POST /api/v1/conversations/[id]/messages
 * Sends a new message in a conversation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  return createBackendProxy({
    method: 'POST',
    endpoint: `/messages/conversations/${id}/messages`,
    request,
    body,
    logContext: 'Conversation Messages API',
    enableDebugLogging: true,
  });
}
