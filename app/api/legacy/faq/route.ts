import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'FAQ sayfası',
    content: 'Sık sorulan sorular içeriği buraya gelecek.',
  });
}
