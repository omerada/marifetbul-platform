import { NextRequest, NextResponse } from 'next/server';
import { mockPackages } from '@/lib/msw/handlers';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Find package by ID
    const pkg = mockPackages.find((p) => p.id === id);

    if (!pkg) {
      return NextResponse.json(
        {
          success: false,
          error: 'Hizmet paketi bulunamadı',
          message: `ID: ${id} ile hizmet paketi mevcut değil`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: pkg,
    });
  } catch (error) {
    console.error('Packages API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Sunucu hatası',
        message: 'Hizmet paketi getirilirken hata oluştu',
      },
      { status: 500 }
    );
  }
}
