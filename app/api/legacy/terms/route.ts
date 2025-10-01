import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Terms sayfası',
    content: 'Kullanım şartları içeriği buraya gelecek.',
  });
}
