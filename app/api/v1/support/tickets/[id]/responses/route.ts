import { NextRequest } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ticketId } = await params;

  return createBackendProxy({
    method: 'GET',
    endpoint: `/support/tickets/${ticketId}/responses`,
    request,
    logContext: 'Ticket Responses API',
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ticketId } = await params;
  const body = await request.json();

  return createBackendProxy({
    method: 'POST',
    endpoint: `/support/tickets/${ticketId}/responses`,
    request,
    body,
    logContext: 'Ticket Responses API',
  });
}
