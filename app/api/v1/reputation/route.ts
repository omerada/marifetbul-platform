import { NextRequest } from 'next/server';
import { proxyGet, proxyPatch } from '@/lib/api/backend-proxy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return proxyGet('/reputation', request, 'Reputation API');
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  return proxyPatch('/reputation', request, body, 'Reputation API');
}
