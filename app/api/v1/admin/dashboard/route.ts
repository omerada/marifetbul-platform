import { NextRequest } from 'next/server';
import { proxyGet } from '@/lib/api/backend-proxy';

/**
 * GET /api/v1/admin/dashboard
 * Admin dashboard data endpoint - proxies to backend
 */
export async function GET(request: NextRequest) {
  return proxyGet('/admin/dashboard', request, 'Admin Dashboard API');
}
