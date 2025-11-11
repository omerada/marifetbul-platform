import { NextRequest, NextResponse } from 'next/server';
import { apiLogger } from '@/lib/infrastructure/monitoring/logger';
import { handleApiError } from '@/lib/api/error-handler';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;

    apiLogger.debug('Fetching support ticket', { ticketId });

    const response = await fetch(
      `${BACKEND_API_URL}/support/tickets/${ticketId}`,
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

    apiLogger.info('Support ticket fetched', {
      ticketId,
      status: response.status,
    });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return handleApiError(error, request, {
      operation: 'fetch_ticket',
      endpoint: `/api/v1/support/tickets/${(await params).id}`,
    });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    const body = await request.json();

    apiLogger.debug('Updating support ticket', { ticketId, body });

    const response = await fetch(
      `${BACKEND_API_URL}/support/tickets/${ticketId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: request.headers.get('Authorization') || '',
        },
        credentials: 'include',
        body: JSON.stringify(body),
      }
    );
    const data = await response.json();

    apiLogger.info('Support ticket updated', {
      ticketId,
      status: response.status,
    });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return handleApiError(error, request, {
      operation: 'update_ticket',
      endpoint: `/api/v1/support/tickets/${(await params).id}`,
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;

    apiLogger.debug('Deleting support ticket', { ticketId });

    const response = await fetch(
      `${BACKEND_API_URL}/support/tickets/${ticketId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: request.headers.get('Authorization') || '',
        },
        credentials: 'include',
      }
    );
    const data = await response.json();

    apiLogger.info('Support ticket deleted', {
      ticketId,
      status: response.status,
    });

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return handleApiError(error, request, {
      operation: 'delete_ticket',
      endpoint: `/api/v1/support/tickets/${(await params).id}`,
    });
  }
}
