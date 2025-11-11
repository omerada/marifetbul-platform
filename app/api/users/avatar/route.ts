import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/infrastructure/monitoring/logger';

export const dynamic = 'force-dynamic';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * Upload User Avatar
 * POST /api/users/avatar
 */
export async function POST(request: NextRequest) {
  try {
    const backendUrl = `${BACKEND_API_URL}/users/avatar`;

    logger.debug('[Avatar Upload] Uploading avatar');

    const headers: HeadersInit = {};

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

    // Get FormData from request
    const formData = await request.formData();

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData, // FormData is automatically handled
    });

    logger.debug('[Avatar Upload] Backend response status:', response.status);

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
    logger.error('[Avatar Upload] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'AVATAR_UPLOAD_FAILED',
          message: 'Failed to upload avatar',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
