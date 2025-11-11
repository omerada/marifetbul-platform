/**
 * Support Ticket API Route
 * Handles individual support ticket operations
 * @version 2.0.0
 * @updated November 11, 2025 - Modernized with backend-proxy
 */

export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { proxyGet, proxyPatch, proxyDelete } from '@/lib/api/backend-proxy';
import { apiLogger } from '@/lib/infrastructure/monitoring/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ticketId } = await params;

  apiLogger.debug('Fetching support ticket', { ticketId });

  const response = await proxyGet(
    `/support/tickets/${ticketId}`,
    request,
    'Support Ticket API'
  );

  apiLogger.info('Support ticket fetched', {
    ticketId,
    status: response.status,
  });

  return response;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ticketId } = await params;
  const body = await request.json();

  apiLogger.debug('Updating support ticket', { ticketId, body });

  const response = await proxyPatch(
    `/support/tickets/${ticketId}`,
    body,
    request,
    'Support Ticket API'
  );

  apiLogger.info('Support ticket updated', {
    ticketId,
    status: response.status,
  });

  return response;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: ticketId } = await params;

  apiLogger.debug('Deleting support ticket', { ticketId });

  const response = await proxyDelete(
    `/support/tickets/${ticketId}`,
    request,
    'Support Ticket API'
  );

  apiLogger.info('Support ticket deleted', {
    ticketId,
    status: response.status,
  });

  return response;
}
