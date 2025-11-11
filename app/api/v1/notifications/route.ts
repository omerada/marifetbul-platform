import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/lib/api/backend-proxy';
import { apiLogger } from '@/lib/infrastructure/monitoring/logger';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  apiLogger.debug('Fetching notifications', {
    searchParams: searchParams.toString(),
  });

  const response = await proxyGet(
    '/notifications',
    request,
    'Notifications API'
  );

  // Log success
  const data = await response.clone().json();
  apiLogger.info('Notifications fetched successfully', {
    status: response.status,
    count: data?.content?.length || 0,
  });

  return response;
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  apiLogger.debug('Creating notification', { body });

  const response = await proxyPost(
    '/notifications',
    request,
    body,
    'Notifications API'
  );

  // Log success
  const data = await response.clone().json();
  apiLogger.info('Notification created successfully', {
    status: response.status,
    notificationId: data?.id,
  });

  return response;
}
