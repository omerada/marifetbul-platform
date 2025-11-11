import { NextRequest } from 'next/server';
import { proxyGet, proxyPost } from '@/lib/api/backend-proxy';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return proxyGet('/blog/posts', request, 'Blog API');
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return proxyPost('/blog/posts', request, body, 'Blog API');
}
