import { NextRequest } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ticketId } = await params;
  const body = await request.json();

  return createBackendProxy({
    method: 'POST',
    endpoint: `/support/tickets/${ticketId}/close`,
    request,
    body,
    logContext: 'Close Ticket API',
  });
}
