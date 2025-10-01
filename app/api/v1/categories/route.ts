import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Kategoriler sayfası',
    content: 'Burası kategoriler sayfası olacak.',
  });
}
