// API Catch-all Route - Production Ready
// This route handles API requests that don't match specific routes
// All requests are proxied to the backend API

export const dynamic = 'force-dynamic';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

async function proxyToBackend(request: Request, method: string) {
  try {
    const url = new URL(request.url);
    const backendPath = url.pathname.replace('/api', '');
    const backendUrl = `${BACKEND_API_URL}${backendPath}${url.search}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Forward Authorization header if present
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const options: RequestInit = {
      method,
      headers,
      credentials: 'include',
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

    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('API proxy error:', error);
    return new Response(
      JSON.stringify({
        error: 'Backend API unavailable',
        message: 'Unable to connect to backend service',
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
