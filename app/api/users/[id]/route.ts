import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/infrastructure/monitoring/logger';

export const dynamic = 'force-dynamic';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Get User by ID
 * GET /api/users/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendUrl = `${BACKEND_API_URL}/users/${id}`;

    logger.debug('[User API] Fetching user:', id);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward Authorization header if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Forward cookies from client to backend
    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    logger.debug('[User API] Backend response status:', response.status);

    const data = await response.text();

    // Forward all headers from backend
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.append(key, value);
    });

    return new Response(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    logger.error('[User API] Error:', error instanceof Error ? error : new Error(String(error)));

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'USER_FETCH_FAILED',
          message: 'Failed to fetch user',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * Update User by ID
 * PUT /api/users/:id
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const backendUrl = `${BACKEND_API_URL}/users/${id}`;

    logger.debug('[User API] Updating user:', id);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward Authorization header if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // Forward cookies from client to backend
    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    // Get request body
    const body = await request.text();

    const response = await fetch(backendUrl, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body,
    });

    logger.debug('[User API] Update response status:', response.status);

    const data = await response.text();

    // Forward all headers from backend
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      responseHeaders.append(key, value);
    });

    return new Response(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    logger.error('[User API] Update error:', error instanceof Error ? error : new Error(String(error)));

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'USER_UPDATE_FAILED',
          message: 'Failed to update user',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
