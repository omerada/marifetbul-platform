import { NextRequest, NextResponse } from 'next/server';
import {
  createTicketSchema,
  ticketSearchSchema,
} from '@/lib/core/validations/support';
import type { SupportTicket, PaginationMeta } from '@/types';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// Mock data for development
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

// GET /api/v1/support/tickets - List tickets with search/filter
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse search parameters
    const searchQuery = {
      status: searchParams.getAll('status'),
      category: searchParams.getAll('category'),
      priority: searchParams.getAll('priority'),
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      search: searchParams.get('search') || undefined,
      assignedAgent: searchParams.get('assignedAgent') || undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      sortBy: searchParams.get('sortBy') || 'created',
    };

    // Validate search parameters
    const validation = ticketSearchSchema.safeParse(searchQuery);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Geçersiz arama parametreleri',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const params = validation.data;

    // Filter tickets based on parameters
    let filteredTickets = [...mockTickets];

    // Status filter
    if (params.status && params.status.length > 0) {
      filteredTickets = filteredTickets.filter((ticket) =>
        params.status!.includes(ticket.status)
      );
    }

    // Category filter
    if (params.category && params.category.length > 0) {
      filteredTickets = filteredTickets.filter((ticket) =>
        params.category!.includes(ticket.category)
      );
    }

    // Priority filter
    if (params.priority && params.priority.length > 0) {
      filteredTickets = filteredTickets.filter((ticket) =>
        params.priority!.includes(ticket.priority)
      );
    }

    // Search in subject and description
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredTickets = filteredTickets.filter(
        (ticket) =>
          ticket.subject.toLowerCase().includes(searchTerm) ||
          ticket.description.toLowerCase().includes(searchTerm)
      );
    }

    // Date range filter
    if (params.dateFrom) {
      const fromDate = new Date(params.dateFrom);
      filteredTickets = filteredTickets.filter(
        (ticket) => new Date(ticket.createdAt) >= fromDate
      );
    }

    if (params.dateTo) {
      const toDate = new Date(params.dateTo);
      filteredTickets = filteredTickets.filter(
        (ticket) => new Date(ticket.createdAt) <= toDate
      );
    }

    // Sort tickets
    filteredTickets.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (params.sortBy) {
        case 'updated':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'created':
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
      }

      return bValue > aValue ? 1 : -1; // Default desc order
    });

    // Pagination
    const totalItems = filteredTickets.length;
    const totalPages = Math.ceil(totalItems / params.limit);
    const startIndex = (params.page - 1) * params.limit;
    const endIndex = startIndex + params.limit;
    const paginatedTickets = filteredTickets.slice(startIndex, endIndex);

    const pagination: PaginationMeta = {
      page: params.page,
      limit: params.limit,
      total: totalItems,
      totalPages,
      hasNext: params.page < totalPages,
      hasPrev: params.page > 1,
    };

    return NextResponse.json({
      success: true,
      data: paginatedTickets,
      pagination,
    });
  } catch (error) {
    console.error('Support tickets GET error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Sunucu hatası',
      },
      { status: 500 }
    );
  }
}

// POST /api/v1/support/tickets - Create new ticket
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate ticket data
    const validation = createTicketSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Geçersiz talep verisi',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const ticketData = validation.data;

    // Create new ticket
    const newTicket: SupportTicket = {
      id: Date.now().toString(),
      userId: 'current-user', // In real app, get from auth
      subject: ticketData.subject,
      description: ticketData.description,
      status: 'open',
      priority: ticketData.priority,
      category: ticketData.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      user: {
        id: 'current-user',
        firstName: 'Test',
        lastName: 'User',
        email: 'user@example.com',
      },
      responses: [],
      attachments: ticketData.attachments || [],
    };

    // In real app, save to database
    mockTickets.unshift(newTicket);

    return NextResponse.json({
      success: true,
      data: newTicket,
      message: 'Destek talebi başarıyla oluşturuldu',
    });
  } catch (error) {
    console.error('Support ticket creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Talep oluşturulurken hata oluştu',
      },
      { status: 500 }
    );
  }
}
