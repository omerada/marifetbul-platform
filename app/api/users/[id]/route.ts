import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Get User by ID
 * GET /api/users/:id
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const backendUrl = `${BACKEND_API_URL}/users/${id}`;

    console.log('[User API] Fetching user:', id);

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

    console.log('[User API] Backend response status:', response.status);

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
    console.error('[User API] Error:', error);

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
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const backendUrl = `${BACKEND_API_URL}/users/${id}`;

    console.log('[User API] Updating user:', id);

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

    console.log('[User API] Update response status:', response.status);

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
    console.error('[User API] Update error:', error);

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
