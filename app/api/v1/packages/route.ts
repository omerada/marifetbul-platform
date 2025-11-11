import { NextRequest } from 'next/server';
import { proxyGet } from '@/lib/api/backend-proxy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return proxyGet('/packages', request, 'Packages API');
}
