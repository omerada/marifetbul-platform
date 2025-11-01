/**
 * Conversation Messages API Route
 * Handles messages within a specific conversation
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/shared/utils/logger';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * GET /api/v1/conversations/[id]/messages
 * Fetches messages for a specific conversation
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversationId = id;
    const { searchParams } = new URL(request.url);

    const page = searchParams.get('page') || '0';
    const pageSize = searchParams.get('pageSize') || '50';

    const backendParams = new URLSearchParams({
      page,
      size: pageSize,
      sort: 'sentAt,desc',
    });

    const backendUrl = `${BACKEND_API_URL}/messages/conversations/${conversationId}/messages?${backendParams.toString()}`;

    if (process.env.NODE_ENV === 'development') {
      logger.debug('[Conversation Messages API] GET request:', {
        conversationId,
        url: backendUrl,
      });
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error('[Conversation Messages API] Backend error:', {
        status: response.status,
        error: errorText,
      });

      // Return empty array if not found
      if (response.status === 404) {
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
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: 'Failed to fetch messages from backend',
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform backend response
    if (data.success && data.data) {
      const pageData = data.data;

      return NextResponse.json({
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
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    logger.error('[Conversation Messages API] Error:', error);

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
  }
}

/**
 * POST /api/v1/conversations/[id]/messages
 * Sends a new message in a conversation
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const conversationId = id;
    const body = await request.json();

    const backendUrl = `${BACKEND_API_URL}/messages/conversations/${conversationId}/messages`;

    if (process.env.NODE_ENV === 'development') {
      logger.debug('[Conversation Messages API] POST request:', {
        conversationId,
        url: backendUrl,
        body,
      });
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    logger.error('[Conversation Messages API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error while sending message',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
