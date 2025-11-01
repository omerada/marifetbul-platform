/**
 * ================================================
 * PAYMENT INTENT API ROUTE
 * ================================================
 * POST /api/v1/payments/intent
 * Creates a new payment intent for order payment
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export async function POST(request: NextRequest) {
  try {
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

    const backendResponse = await fetch(`${BACKEND_API_URL}/payments/intent`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify({
        orderId,
        returnUrl: returnUrl || `${process.env.NEXTAUTH_URL}/checkout/callback`,
      }),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(
        {
          error: data.error || 'Payment Intent Error',
          message: data.message || 'Ödeme oluşturulamadı',
          errorCode: data.errorCode,
        },
        { status: backendResponse.status }
      );
    }

    // Return payment intent response
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Payment intent creation error:', error);
    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: 'Ödeme oluşturulurken bir hata oluştu',
      },
      { status: 500 }
    );
  }
}
