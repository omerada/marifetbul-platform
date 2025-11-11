/**
 * Employer Activities API Route
 * GET /api/v1/dashboard/employer/activities
 * @version 2.0.0
 * @updated November 11, 2025 - Modernized with backend-proxy
 */

import { NextRequest } from 'next/server';
import { proxyGet } from '@/lib/api/backend-proxy';

export async function GET(request: NextRequest) {
  return proxyGet(
    '/dashboard/employer/activities',
    request,
    'Employer Activities API'
  );
}
