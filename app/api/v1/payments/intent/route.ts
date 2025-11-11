/**
 * ================================================
 * PAYMENT INTENT API ROUTE
 * ================================================
 * POST /api/v1/payments/intent
 * Creates a new payment intent for order payment
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @updated November 11, 2025 - Modernized with backend-proxy
 */

import { NextRequest, NextResponse } from 'next/server';
import { proxyPost } from '@/lib/api/backend-proxy';

export async function POST(request: NextRequest) {
  // Get authorization header
  const authHeader = request.headers.get('Authorization');
  const cookieHeader = request.headers.get('Cookie');

  if (!authHeader && !cookieHeader) {
    return NextResponse.json(
      { error: 'Unauthorized', message: 'Giriş yapmanız gerekiyor' },
      { status: 401 }
    );
  }

  // Parse request body
  const body = await request.json();
  const { orderId, returnUrl } = body;

  if (!orderId) {
    return NextResponse.json(
      { error: 'Validation Error', message: 'Order ID gereklidir' },
      { status: 400 }
    );
  }

  // Forward to backend with default returnUrl
  return proxyPost(
    '/payments/intent',
    request,
    {
      orderId,
      returnUrl: returnUrl || `${process.env.NEXTAUTH_URL}/checkout/callback`,
    },
    'Payment Intent API'
  );
}
