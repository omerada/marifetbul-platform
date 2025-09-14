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
    responses: [],
    attachments: [],
  },
];

// POST /api/v1/support/tickets/[id]/close - Close a ticket
export async function POST(
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

    const ticket = mockTickets[ticketIndex];

    // Check if ticket is already closed
    if (ticket.status === 'closed') {
      return NextResponse.json(
        {
          success: false,
          error: 'Bu talep zaten kapatılmış',
        },
        { status: 400 }
      );
    }

    // Close the ticket
    const updatedTicket = {
      ...ticket,
      status: 'closed' as const,
      updatedAt: new Date().toISOString(),
    };

    mockTickets[ticketIndex] = updatedTicket;

    return NextResponse.json({
      success: true,
      data: updatedTicket,
      message: 'Destek talebi kapatıldı',
    });
  } catch (error) {
    console.error('Support ticket close error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Talep kapatılırken hata oluştu',
      },
      { status: 500 }
    );
  }
}
