import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Token Refresh Endpoint
 * Proxies refresh token requests to backend with proper cookie handling
 */
export async function POST(request: NextRequest) {
  try {
    const backendUrl = `${BACKEND_API_URL}/auth/refresh`;

    console.log('[Token Refresh] Proxying to:', backendUrl);

    // Forward all headers including cookies
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward cookies from client to backend (critical for refresh token)
    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
      console.log('[Token Refresh] Forwarding cookies');
    } else {
      console.warn('[Token Refresh] No cookies found in request');
    }

    // Forward Authorization header if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      credentials: 'include',
    });

    console.log('[Token Refresh] Backend response status:', response.status);

    // Get response body
    const data = await response.text();

    // Create response with proper headers
    const responseHeaders = new Headers();

    // CRITICAL: Forward Set-Cookie headers from backend
    response.headers.forEach((value, key) => {
      responseHeaders.append(key, value);
    });

    // Log Set-Cookie headers for debugging
    if (response.headers.has('set-cookie')) {
      console.log(
        '[Token Refresh] Set-Cookie header present:',
        response.headers.get('set-cookie')
      );
    } else {
      console.warn('[Token Refresh] No Set-Cookie header from backend');
    }

    return new Response(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[Token Refresh] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'REFRESH_FAILED',
          message: 'Token refresh failed',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
