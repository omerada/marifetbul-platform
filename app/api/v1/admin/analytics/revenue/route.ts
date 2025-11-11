import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/infrastructure/monitoring/logger';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * GET /api/v1/admin/analytics/revenue
 * Get revenue analytics data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Map period to days
    const daysMap: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
    };
    const days = daysMap[period] || 30;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Fetch revenue overview
    const backendUrl = `${BACKEND_API_URL}/admin/analytics/revenue/overview`;

    const response = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('Authorization') && {
          Authorization: request.headers.get('Authorization')!,
        }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          success: false,
          error: errorData.message || 'Failed to fetch revenue analytics',
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform backend response to match frontend expectations
    const transformedData = {
      success: true,
      data: {
        totalRevenue: data.data?.totalRevenue || 0,
        monthlyRevenue: data.data?.monthlyRevenue || 0,
        growth: data.data?.revenueGrowth || 0,
        averageOrderValue: data.data?.averageOrderValue || 0,
        topCategories: data.data?.topCategories || [],
      },
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    logger.error('Revenue analytics API proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
