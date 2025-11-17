/**
 * Faceted Search API Route
 * POST /api/v1/search/faceted
 * @version 2.0.0
 */

import { NextRequest, NextResponse } from 'next/server';
import { createBackendProxy } from '@/lib/api/backend-proxy';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    return createBackendProxy({
      method: 'POST',
      endpoint: '/search/faceted',
      request,
      body,
      logContext: 'Faceted Search API',

      transformResponse: (data: unknown) => {
        const responseData = data as {
          data?: {
            services?: unknown[];
            facets?: Record<string, Array<{ value: string; count: number }>>;
            totalResults?: number;
            page?: number;
            pageSize?: number;
          };
        };

        return {
          success: true,
          services: responseData.data?.services || [],
          facets: responseData.data?.facets || {},
          pagination: {
            total: responseData.data?.totalResults || 0,
            page: responseData.data?.page || 1,
            pageSize: responseData.data?.pageSize || 20,
          },
        };
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
