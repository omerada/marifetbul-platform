import { NextRequest } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  return createBackendProxy({
    method: 'GET',
    endpoint: `/packages/${id}/reviews`,
    request,
    logContext: 'Package Reviews API',
  });
}
