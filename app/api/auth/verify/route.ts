import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * GET /api/auth/verify
 * Proxy token verification request to backend API
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    console.log('🔍 Auth Verify: Proxying verification request to backend');

    if (!authHeader) {
      return NextResponse.json(
        {
          success: false,
          message: 'Token gereklidir',
        },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_API_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.log('❌ Auth Verify: Verification failed');
      return NextResponse.json(data, { status: response.status });
    }

    console.log('✅ Auth Verify: Token valid');
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Auth Verify Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Backend bağlantı hatası',
      },
      { status: 500 }
    );
  }
}
