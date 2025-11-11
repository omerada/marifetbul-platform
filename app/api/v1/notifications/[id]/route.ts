import { NextRequest } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: notificationId } = await params;
  const body = await request.json();

  return createBackendProxy({
    method: 'PATCH',
    endpoint: `/notifications/${notificationId}`,
    request,
    body,
    logContext: 'Notification Update API',
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: notificationId } = await params;

  return createBackendProxy({
    method: 'DELETE',
    endpoint: `/notifications/${notificationId}`,
    request,
    logContext: 'Notification Delete API',
  });
}
