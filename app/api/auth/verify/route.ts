import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/verify
 * Token verification endpoint
 */
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    console.log('🔍 Auth Verify: Token verification attempt');

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token gereklidir',
        },
        { status: 401 }
      );
    }

    // Mock token verification - replace with real JWT verification
    const validTokens = [
      'admin-token-12345',
      'freelancer-token-12345',
      'employer-token-12345',
      'mock-admin-token',
    ];

    if (!validTokens.includes(token)) {
      console.log('❌ Auth Verify: Invalid token:', token);
      return NextResponse.json(
        {
          success: false,
          error: 'Geçersiz token',
        },
        { status: 401 }
      );
    }

    console.log('✅ Auth Verify: Token valid');

    return NextResponse.json(
      {
        success: true,
        message: 'Token geçerli',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Auth Verify Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
