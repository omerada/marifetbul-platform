import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Contact sayfası',
    content: 'İletişim sayfası içeriği buraya gelecek.',
  });
}
