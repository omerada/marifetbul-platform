import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/infrastructure/monitoring/logger';

const BACKEND_API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

/**
 * GET /api/v1/admin/analytics/users
 * Get user analytics data
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

    const backendUrl = `${BACKEND_API_URL}/admin/analytics/users/activity/statistics?start=${startDate.toISOString()}&end=${endDate.toISOString()}`;

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
          error: errorData.message || 'Failed to fetch user analytics',
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform backend response to match frontend expectations
    const transformedData = {
      success: true,
      data: {
        totalUsers: data.data?.totalActiveUsers || 0,
        newUsers: data.data?.newUsersCount || 0,
        activeUsers: data.data?.activeUsersCount || 0,
        churnRate: data.data?.churnRate || 0,
        growthRate: data.data?.growthRate || 0,
        usersByType: {
          freelancer: data.data?.usersByRole?.FREELANCER || 0,
          employer: data.data?.usersByRole?.EMPLOYER || 0,
        },
        usersByStatus: {
          active: data.data?.usersByStatus?.ACTIVE || 0,
          suspended: data.data?.usersByStatus?.SUSPENDED || 0,
          banned: data.data?.usersByStatus?.BANNED || 0,
          pending: data.data?.usersByStatus?.PENDING || 0,
        },
      },
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    logger.error('User analytics API proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
