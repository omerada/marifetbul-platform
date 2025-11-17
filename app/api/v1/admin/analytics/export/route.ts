/**
 * Analytics Export API Route
 * POST /api/v1/admin/analytics/export
 * @version 2.0.0
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportType, period, format } = body as {
      reportType: string;
      period: string;
      format: 'csv' | 'pdf';
    };

    // For file downloads, we need to handle blob response directly
    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/analytics/export`;

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: request.headers.get('cookie') || '',
      },
      credentials: 'include',
      body: JSON.stringify({ reportType, period, format }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    // Stream the blob response
    const blob = await response.blob();
    const contentType = format === 'csv' ? 'text/csv' : 'application/pdf';
    const filename = `analytics-${reportType}-${period}.${format}`;

    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
