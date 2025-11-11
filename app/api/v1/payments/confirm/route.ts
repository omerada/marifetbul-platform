/**
 * ================================================
 * PAYMENT CONFIRM API ROUTE
 * ================================================
 * POST /api/v1/payments/confirm
 * Confirms payment after 3D Secure authentication
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @updated November 11, 2025 - Modernized with backend-proxy
 */

import { NextRequest, NextResponse } from 'next/server';
import { proxyPost } from '@/lib/api/backend-proxy';

export async function POST(request: NextRequest) {
  // Parse request body
  const body = await request.json();
  const { paymentIntentId, conversationId, paymentToken } = body;

  if (!paymentIntentId) {
    return NextResponse.json(
      { error: 'Validation Error', message: 'Payment Intent ID gereklidir' },
      { status: 400 }
    );
  }

  // Forward to backend
  return proxyPost(
    '/payments/confirm',
    request,
    {
      paymentIntentId,
      conversationId,
      paymentToken,
    },
    'Payment Confirm API'
  );
}
