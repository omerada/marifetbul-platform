/**
 * Freelancer Activities API Route
 * GET /api/v1/dashboard/freelancer/activities
 * @version 2.0.0
 * @updated November 11, 2025 - Modernized with backend-proxy
 */

import { NextRequest } from 'next/server';
import { proxyGet } from '@/lib/api/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(
    '/dashboard/freelancer/activities',
    request,
    'Freelancer Activities API'
  );
}
