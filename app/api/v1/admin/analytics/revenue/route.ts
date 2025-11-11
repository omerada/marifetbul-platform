/**
 * Revenue Analytics API Route
 * GET /api/v1/admin/analytics/revenue
 * @version 2.0.0
 * @updated November 11, 2025 - Modernized with backend-proxy
 */

import { NextRequest } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';

export async function GET(request: NextRequest) {
  return createBackendProxy({
    method: 'GET',
    endpoint: '/admin/analytics/revenue/overview',
    request,
    logContext: 'Revenue Analytics API',

    // Transform backend response to match frontend expectations
    transformResponse: (data: unknown) => {
      const responseData = data as {
        data?: {
          totalRevenue?: number;
          monthlyRevenue?: number;
          revenueGrowth?: number;
          averageOrderValue?: number;
          topCategories?: unknown[];
        };
      };

      return {
        success: true,
        data: {
          totalRevenue: responseData.data?.totalRevenue || 0,
          monthlyRevenue: responseData.data?.monthlyRevenue || 0,
          growth: responseData.data?.revenueGrowth || 0,
          averageOrderValue: responseData.data?.averageOrderValue || 0,
          topCategories: responseData.data?.topCategories || [],
        },
      };
    },
  });
}
