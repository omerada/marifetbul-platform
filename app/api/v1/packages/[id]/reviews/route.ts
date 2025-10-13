import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();

    // Proxy to backend
    const response = await fetch(
      `${BACKEND_API_URL}/packages/${id}/reviews${searchParams ? `?${searchParams}` : ''}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: request.headers.get('Authorization') || '',
        },
        credentials: 'include',
      }
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Package reviews API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
        message: 'Error occurred while fetching reviews',
      },
      { status: 500 }
    );
  }
}
