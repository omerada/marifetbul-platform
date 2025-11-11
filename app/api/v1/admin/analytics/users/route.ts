/**
 * User Analytics API Route
 * GET /api/v1/admin/analytics/users
 * @version 2.0.0
 * @updated November 11, 2025 - Modernized with backend-proxy
 */

import { NextRequest } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';

export async function GET(request: NextRequest) {
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

  // Build endpoint with date range params
  const endpoint = `/admin/analytics/users/activity/statistics?start=${startDate.toISOString()}&end=${endDate.toISOString()}`;

  return createBackendProxy({
    method: 'GET',
    endpoint,
    request,
    includeSearchParams: false, // We manually added params to endpoint
    logContext: 'User Analytics API',

    // Transform backend response to match frontend expectations
    transformResponse: (data: unknown) => {
      const responseData = data as {
        data?: {
          totalActiveUsers?: number;
          newUsersCount?: number;
          activeUsersCount?: number;
          churnRate?: number;
          growthRate?: number;
          usersByRole?: { FREELANCER?: number; EMPLOYER?: number };
          usersByStatus?: {
            ACTIVE?: number;
            SUSPENDED?: number;
            BANNED?: number;
            PENDING?: number;
          };
        };
      };

      return {
        success: true,
        data: {
          totalUsers: responseData.data?.totalActiveUsers || 0,
          newUsers: responseData.data?.newUsersCount || 0,
          activeUsers: responseData.data?.activeUsersCount || 0,
          churnRate: responseData.data?.churnRate || 0,
          growthRate: responseData.data?.growthRate || 0,
          usersByType: {
            freelancer: responseData.data?.usersByRole?.FREELANCER || 0,
            employer: responseData.data?.usersByRole?.EMPLOYER || 0,
          },
          usersByStatus: {
            active: responseData.data?.usersByStatus?.ACTIVE || 0,
            suspended: responseData.data?.usersByStatus?.SUSPENDED || 0,
            banned: responseData.data?.usersByStatus?.BANNED || 0,
            pending: responseData.data?.usersByStatus?.PENDING || 0,
          },
        },
      };
    },
  });
}
