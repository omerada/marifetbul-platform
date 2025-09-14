import { NextRequest, NextResponse } from 'next/server';
import type { SupportTicket } from '@/types';

// Mock data - In real app, this would be from database
const mockTickets: SupportTicket[] = [
  {
    id: '1',
    userId: 'user1',
    subject: 'Giriş sorunu yaşıyorum',
    description:
      'Hesabıma giriş yapamıyorum, şifremi unuttum ve e-posta alamıyorum.',
    status: 'open',
    priority: 'medium',
    category: 'technical',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    user: {
      id: 'user1',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      email: 'ahmet@example.com',
    },
    responses: [],
    attachments: [],
  },
  {
    id: '2',
    userId: 'user2',
    subject: 'Ödeme hatası',
    description: 'Kredi kartımdan para çekildi ama işlemim tamamlanmadı.',
    status: 'in_progress',
    priority: 'high',
    category: 'billing',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
    user: {
      id: 'user2',
      firstName: 'Fatma',
      lastName: 'Kaya',
      email: 'fatma@example.com',
    },
    responses: [
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
    attachments: [],
  },
];

// GET /api/v1/support/tickets/[id] - Get single ticket
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

    const ticket = mockTickets.find((t) => t.id === ticketId);

    if (!ticket) {
      return NextResponse.json(
        {
          success: false,
          error: 'Destek talebi bulunamadı',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ticket,
    });
  } catch (error) {
    console.error('Support ticket GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Sunucu hatası',
      },
      { status: 500 }
    );
  }
}

// PUT /api/v1/support/tickets/[id] - Update ticket
export async function PUT(
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

    const ticketIndex = mockTickets.findIndex((t) => t.id === ticketId);

    if (ticketIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Destek talebi bulunamadı',
        },
        { status: 404 }
      );
    }

    // Update ticket
    const updatedTicket = {
      ...mockTickets[ticketIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    mockTickets[ticketIndex] = updatedTicket;

    return NextResponse.json({
      success: true,
      data: updatedTicket,
      message: 'Destek talebi güncellendi',
    });
  } catch (error) {
    console.error('Support ticket UPDATE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Güncelleme sırasında hata oluştu',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/support/tickets/[id] - Delete ticket (admin only)
export async function DELETE(
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

    const ticketIndex = mockTickets.findIndex((t) => t.id === ticketId);

    if (ticketIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          error: 'Destek talebi bulunamadı',
        },
        { status: 404 }
      );
    }

    // Remove ticket
    mockTickets.splice(ticketIndex, 1);

    return NextResponse.json({
      success: true,
      message: 'Destek talebi silindi',
    });
  } catch (error) {
    console.error('Support ticket DELETE error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Silme sırasında hata oluştu',
      },
      { status: 500 }
    );
  }
}
