import { NextRequest } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: alertId } = await params;

  return createBackendProxy({
    method: 'PATCH',
    endpoint: `/admin/alerts/${alertId}/read`,
    request,
    logContext: 'Mark Alert Read API',
  });
}
