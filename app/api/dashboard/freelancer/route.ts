import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/shared/utils/logger';
import { safeTransformSellerDashboard } from '@/lib/api/transformers/dashboard';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

export const dynamic = 'force-dynamic';

/**
 * GET /api/dashboard/freelancer
 * Proxies to backend: /api/v1/dashboard/seller/me
 * Returns freelancer/seller dashboard data
 */
export async function GET(request: NextRequest) {
  try {
    // Extract auth token from request
    const authHeader = request.headers.get('Authorization');
    const cookieHeader = request.headers.get('Cookie');

    if (!authHeader && !cookieHeader) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'Lütfen giriş yapınız',
        },
        { status: 401 }
      );
    }

    // Parse query parameters for period selection
    const url = new URL(request.url);
    const days = url.searchParams.get('days') || '30';
    const startTime = url.searchParams.get('startTime');
    const endTime = url.searchParams.get('endTime');

    // Build backend URL with query params
    let backendUrl = `${BACKEND_API_URL}/dashboard/seller/me`;
    const queryParams = new URLSearchParams();

    if (startTime && endTime) {
      queryParams.set('startTime', startTime);
      queryParams.set('endTime', endTime);
    } else {
      // Use days parameter if custom range not provided
      backendUrl = `${BACKEND_API_URL}/dashboard/seller/me/days/${days}`;
    }

    const queryString = queryParams.toString();
    const finalUrl = queryString ? `${backendUrl}?${queryString}` : backendUrl;

    logger.debug('[Dashboard API] Freelancer dashboard request', {
      url: finalUrl,
      days,
      hasAuth: !!authHeader,
    });

    // Forward request to backend
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
        ...(cookieHeader && { Cookie: cookieHeader }),
      },
      credentials: 'include',
    });

    const data = await response.json();

    // Log response status
    logger.debug('[Dashboard API] Backend response', {
      status: response.status,
      success: data.success,
    });

    // Handle non-200 responses
    if (!response.ok) {
      logger.error('[Dashboard API] Backend error', {
        status: response.status,
        error: data,
      });

      return NextResponse.json(
        {
          success: false,
          error: data.error || data.message || 'Dashboard verisi yüklenemedi',
          message: data.message || 'Sunucu hatası oluştu',
        },
        { status: response.status }
      );
    }

    // Transform backend DTO to frontend type
    const transformedData = safeTransformSellerDashboard(data.data || data);

    if (!transformedData) {
      logger.error('[Dashboard API] Failed to transform dashboard data');
      return NextResponse.json(
        {
          success: false,
          error: 'Data transformation failed',
          message: 'Dashboard verisi işlenirken hata oluştu',
        },
        { status: 500 }
      );
    }

    // Return successful response with transformed data
    return NextResponse.json(
      {
        success: true,
        data: transformedData,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    logger.error(
      '[Dashboard API] Freelancer dashboard error',
      error instanceof Error ? error : new Error(String(error))
    );

    return NextResponse.json(
      {
        success: false,
        error: 'Server error',
        message:
          'Dashboard yüklenirken bir hata oluştu. Lütfen tekrar deneyin.',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/dashboard/freelancer/refresh
 * Triggers backend cache refresh for freelancer dashboard
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    const cookieHeader = request.headers.get('Cookie');

    if (!authHeader && !cookieHeader) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    logger.debug('[Dashboard API] Freelancer dashboard refresh requested');

    const response = await fetch(
      `${BACKEND_API_URL}/dashboard/seller/me/refresh`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authHeader && { Authorization: authHeader }),
          ...(cookieHeader && { Cookie: cookieHeader }),
        },
        credentials: 'include',
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.error || 'Refresh failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    logger.error(
      '[Dashboard API] Refresh error',
      error instanceof Error ? error : new Error(String(error))
    );

    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}
