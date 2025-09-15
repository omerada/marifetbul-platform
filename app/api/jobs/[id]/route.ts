import { NextRequest, NextResponse } from 'next/server';
import { mockJobs } from '@/lib/infrastructure/msw/data';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Find job by ID
    const job = mockJobs.find((j) => j.id === id);

    if (!job) {
      return NextResponse.json(
        {
          error: 'İş ilanı bulunamadı',
          message: `ID: ${id} ile iş ilanı mevcut değil`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Jobs API error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası', message: 'İş ilanı getirilirken hata oluştu' },
      { status: 500 }
    );
  }
}
