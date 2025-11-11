/**
 * ================================================
 * PAYMENT CONFIRM API ROUTE
 * ================================================
 * POST /api/v1/payments/confirm
 * Confirms payment after 3D Secure authentication
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/infrastructure/monitoring/logger';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('Authorization');
    const cookieHeader = request.headers.get('Cookie');

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
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }

    const backendResponse = await fetch(`${BACKEND_API_URL}/payments/confirm`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        paymentIntentId,
        conversationId,
        paymentToken,
      }),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          error: data.error || 'Payment Confirmation Error',
          message: data.message || 'Ödeme doðrulanamadý',
          errorCode: data.errorCode,
          errorMessage: data.errorMessage,
        },
        { status: backendResponse.status }
      );
    }

    // Return confirmation response
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    logger.error('Payment confirmation error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Ödeme doðrulanýrken bir hata oluþtu',
      },
      { status: 500 }
    );
  }
}
