import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * POST /api/auth/login
 * Proxy authentication request to backend API
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('🔐 Auth API: Proxying login request to backend');

    const response = await fetch(`${BACKEND_API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(
        '❌ Auth API: Login failed:',
        data.message || 'Unknown error'
      );
      return NextResponse.json(data, { status: response.status });
    }

    console.log('✅ Auth API: Login successful');
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Auth API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Backend bağlantı hatası. Lütfen daha sonra tekrar deneyin.',
      },
      { status: 500 }
    );
  }
}
