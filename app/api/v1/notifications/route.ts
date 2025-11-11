import { NextRequest, NextResponse } from 'next/server';
import { apiLogger } from '@/lib/infrastructure/monitoring/logger';
import { handleApiError } from '@/lib/api/error-handler';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();

    apiLogger.debug('Fetching notifications', { searchParams });

    const response = await fetch(
      `${BACKEND_API_URL}/notifications${searchParams ? `?${searchParams}` : ''}`,
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

    apiLogger.info('Notifications fetched successfully', {
      status: response.status,
      count: data?.content?.length || 0,
    });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return handleApiError(error, request, {
      operation: 'fetch_notifications',
      endpoint: '/api/v1/notifications',
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    apiLogger.debug('Creating notification', { body });

    const response = await fetch(`${BACKEND_API_URL}/notifications`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: request.headers.get('Authorization') || '',
      },
      credentials: 'include',
      body: JSON.stringify(body),
    });

    const data = await response.json();

    apiLogger.info('Notification created successfully', {
      status: response.status,
      notificationId: data?.id,
    });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return handleApiError(error, request, {
      operation: 'create_notification',
      endpoint: '/api/v1/notifications',
    });
  }
}
