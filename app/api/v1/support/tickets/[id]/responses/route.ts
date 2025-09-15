import { NextRequest, NextResponse } from 'next/server';
import { ticketResponseSchema } from '@/lib/core/validations/support';
import type { TicketResponse } from '@/types';

// Mock storage for responses
const mockResponses: Record<string, TicketResponse[]> = {
  '2': [
    {
      id: 'resp1',
      ticketId: '2',
      content:
        'Merhabalar, sorununuzla ilgili finans ekibimizle iletişime geçtik. En kısa sürede geri dönüş yapacağız.',
      isPublic: true,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date(Date.now() - 1800000).toISOString(),
      agent: {
        id: 'agent1',
        firstName: 'Destek',
        lastName: 'Ekibi',
        role: 'support',
      },
    },
  ],
};

// GET /api/v1/support/tickets/[id]/responses - Get ticket responses
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;

    if (!ticketId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ticket ID gereklidir',
        },
        { status: 400 }
      );
    }

    const responses = mockResponses[ticketId] || [];

    return NextResponse.json({
      success: true,
      data: responses,
    });
  } catch (error) {
    console.error('Support ticket responses GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Sunucu hatası',
      },
      { status: 500 }
    );
  }
}

// POST /api/v1/support/tickets/[id]/responses - Add response to ticket
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: ticketId } = await params;
    const body = await request.json();

    if (!ticketId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Ticket ID gereklidir',
        },
        { status: 400 }
      );
    }

    // Validate response data
    const validation = ticketResponseSchema.safeParse({
      ...body,
      ticketId,
    });

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Geçersiz yanıt verisi',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const responseData = validation.data;

    // Create new response
    const newResponse: TicketResponse = {
      id: Date.now().toString(),
      ticketId,
      content: responseData.content,
      isPublic: responseData.isPublic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments: responseData.attachments || [],
      // In real app, this would be the authenticated user
      agent: {
        id: 'current-user',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
      },
    };

    // Add response to ticket
    if (!mockResponses[ticketId]) {
      mockResponses[ticketId] = [];
    }

    mockResponses[ticketId].push(newResponse);

    return NextResponse.json({
      success: true,
      data: newResponse,
      message: 'Yanıt başarıyla eklendi',
    });
  } catch (error) {
    console.error('Support ticket response creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Yanıt eklenirken hata oluştu',
      },
      { status: 500 }
    );
  }
}
