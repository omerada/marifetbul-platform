import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Privacy Policy sayfası',
    content: 'Gizlilik politikası içeriği buraya gelecek.',
  });
}
