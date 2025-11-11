import { NextRequest } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: alertId } = await params;

  return createBackendProxy({
    method: 'DELETE',
    endpoint: `/admin/alerts/${alertId}/dismiss`,
    request,
    logContext: 'Dismiss Alert API',
  });
}
