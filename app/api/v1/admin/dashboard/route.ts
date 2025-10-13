import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * GET /api/v1/admin/dashboard
 * Admin dashboard data endpoint - proxies to backend
 */
export async function GET(request: NextRequest) {
  try {
    // Proxy to backend
    const response = await fetch(`${BACKEND_API_URL}/admin/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('Authorization') || '',
      },
      credentials: 'include',
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin dashboard API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
        message: 'Error occurred while fetching admin dashboard data',
      },
      { status: 500 }
    );
  }
}
