/**
 * Conversations API Route
 * Handles messaging conversations
 */

export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * GET /api/v1/conversations
 * Fetches user's conversations
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = searchParams.get('page') || '0';
    const pageSize = searchParams.get('pageSize') || '20';
    const status = searchParams.get('status');

    const backendParams = new URLSearchParams({
      page,
      size: pageSize,
      sort: 'lastMessageAt,desc',
    });

    if (status) {
      backendParams.append('status', status);
    }

    const backendUrl = `${BACKEND_API_URL}/messages/conversations?${backendParams.toString()}`;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Conversations API] GET request:', {
        url: backendUrl,
        params: Object.fromEntries(backendParams),
      });
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward Authorization header if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Forward authentication cookies
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
      console.error('[Conversations API] Backend error:', {
        status: response.status,
        error: errorText,
      });

      // Return empty array if endpoint not found, bad request, or unauthorized
      if (
        response.status === 400 ||
        response.status === 404 ||
        response.status === 401
      ) {
        if (process.env.NODE_ENV === 'development') {
          console.log(
            '[Conversations API] Backend not ready or auth issue, returning empty data. Status:',
            response.status
          );
        }
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
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'BACKEND_ERROR',
            message: 'Failed to fetch conversations from backend',
          },
          timestamp: new Date().toISOString(),
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform backend response to expected format
    if (data.success && data.data) {
      const pageData = data.data;

      return NextResponse.json({
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
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Conversations API] Error:', error);

    // Return empty array instead of error to prevent blocking the UI
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
  }
}

/**
 * POST /api/v1/conversations
 * Creates a new conversation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const backendUrl = `${BACKEND_API_URL}/messages/conversations`;

    if (process.env.NODE_ENV === 'development') {
      console.log('[Conversations API] POST request:', {
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
    console.error('[Conversations API] POST Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error while creating conversation',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
