/**
 * Conversion Analytics API Route
 * GET /api/v1/admin/analytics/conversions
 * @version 2.0.0
 */

import { NextRequest } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '30d';

  return createBackendProxy({
    method: 'GET',
    endpoint: `/admin/analytics/conversions?period=${period}`,
    request,
    includeSearchParams: false,
    logContext: 'Conversion Analytics API',

    transformResponse: (data: unknown) => {
      const responseData = data as {
        data?: {
          funnel?: Array<{
            stage: string;
            count: number;
            conversionRate: number;
          }>;
          overallConversion?: number;
          dropOffPoints?: Array<{
            stage: string;
            dropOffRate: number;
          }>;
        };
      };

      return {
        success: true,
        funnel: responseData.data?.funnel || [],
        overallConversion: responseData.data?.overallConversion || 0,
        dropOffPoints: responseData.data?.dropOffPoints || [],
      };
    },
  });
}
