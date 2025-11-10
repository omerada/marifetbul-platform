// API Catch-all Route - Production Ready
// This route handles API requests that don't match specific routes
// All requests are proxied to the backend API

import logger from '@/lib/infrastructure/monitoring/logger';

export const dynamic = 'force-dynamic';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

async function proxyToBackend(request: Request, method: string) {
  try {
    const url = new URL(request.url);
    // FIX: Correctly extract backend path to avoid double /v1
    // Frontend: /api/v1/packages -> Backend: /api/v1/packages
    const backendPath = url.pathname.replace('/api/v1', '');
    const backendUrl = `${BACKEND_API_URL}${backendPath}${url.search}`;

    // Debug logging for development
    if (process.env.NODE_ENV === 'development') {
      logger.debug('[API Proxy]', { originalurlpathname, backendbackendUrl, method,  });
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward Authorization header if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // CRITICAL: Forward cookies from client to backend
    const cookieHeader = request.headers.get('Cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const options: RequestInit = {
      method,
      headers,
      credentials: 'include', // Important for cookies
    };

    // Add body for POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const body = await request.text();
      if (body) {
        options.body = body;
      }
    }

    const response = await fetch(backendUrl, options);
    const data = await response.text();

    // CRITICAL: Forward ALL headers from backend to client, especially Set-Cookie
    const responseHeaders = new Headers();

    // Copy all headers from backend response
    response.headers.forEach((value, key) => {
      // Forward all headers including Set-Cookie
      responseHeaders.append(key, value);
    });

    if (process.env.NODE_ENV === 'development') {
      const hasCookies = response.headers.has('set-cookie');
      logger.debug('[API Proxy] Response status:', response.status);
      logger.debug('[API Proxy] Has Set-Cookie header:', hasCookies);

      if (hasCookies) {
        // Log cookie details
        const cookies = response.headers.get('set-cookie');
        logger.debug('[API Proxy] Set-Cookie value:', cookies);
      } else {
        logger.debug(
          '[API Proxy] All headers:',
          Array.from(response.headers.entries())
        );
      }
    }

    return new Response(data, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    logger.error('[API Proxy] Error:', error instanceof Error ? error : new Error(String(error)));
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'BACKEND_UNAVAILABLE',
          message: 'Unable to connect to backend service',
        },
        timestamp: new Date().toISOString(),
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function GET(request: Request) {
  return proxyToBackend(request, 'GET');
}

export async function POST(request: Request) {
  return proxyToBackend(request, 'POST');
}

export async function PUT(request: Request) {
  return proxyToBackend(request, 'PUT');
}

export async function DELETE(request: Request) {
  return proxyToBackend(request, 'DELETE');
}

export async function PATCH(request: Request) {
  return proxyToBackend(request, 'PATCH');
}
