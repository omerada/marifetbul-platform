/**
 * Dashboard Freelancer API Route
 * Proxies requests to backend Spring Boot API
 */

import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/infrastructure/monitoring/logger';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/v1/dashboard/freelancer`, {
      headers: {
        Authorization: request.headers.get('Authorization') || '',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    logger.error('Dashboard freelancer API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch freelancer dashboard data' },
      { status: 500 }
    );
  }
}
