import { http, HttpResponse } from 'msw';
import type {
  Message,
  Conversation,
  MessagesResponse,
  ConversationsResponse,
  SendMessageRequest,
  CreateConversationRequest,
  MessageSearchResponse,
  PaginationMeta,
} from '@/types';

// Mock Data
const mockUsers = [
  {
    id: 'user-1',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    avatar: '/avatars/user-1.jpg',
    userType: 'employer' as const,
  },
  {
    id: 'user-2',
    firstName: 'Zeynep',
    lastName: 'Kaya',
    avatar: '/avatars/user-2.jpg',
    userType: 'freelancer' as const,
  },
  {
    id: 'user-3',
    firstName: 'Mehmet',
    lastName: 'Özkan',
    avatar: '/avatars/user-3.jpg',
    userType: 'freelancer' as const,
  },
];

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    content:
      'Merhaba, web tasarım projenizle ilgileniyorum. Detayları görüşebilir miyiz?',
    type: 'text',
    createdAt: '2025-09-10T10:00:00Z',
    sentAt: '2025-09-10T10:00:00Z',
    timestamp: '2025-09-10T10:00:00Z',
    isRead: true,
    readAt: '2025-09-10T10:01:00Z',
    attachments: [],
  },
  {
    id: 'msg-2',
    conversationId: 'conv-1',
    senderId: 'user-2',
    receiverId: 'user-1',
    content: 'Tabii ki! Projenin kapsamını daha detaylı anlatabilir misiniz?',
    type: 'text',
    createdAt: '2025-09-10T10:05:00Z',
    sentAt: '2025-09-10T10:05:00Z',
    timestamp: '2025-09-10T10:05:00Z',
    isRead: true,
    readAt: '2025-09-10T10:06:00Z',
    attachments: [],
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    content:
      'E-ticaret sitesi için modern bir tasarım istiyorum. Referans dosyalarını ekledim.',
    type: 'text',
    createdAt: '2025-09-10T10:10:00Z',
    sentAt: '2025-09-10T10:10:00Z',
    timestamp: '2025-09-10T10:10:00Z',
    isRead: true,
    readAt: '2025-09-10T10:11:00Z',
    attachments: [
      {
        id: 'att-1',
        filename: 'referans-1.jpg',
        name: 'referans-1.jpg',
        type: 'image/jpeg',
        size: 245760,
        mimetype: 'image/jpeg',
        url: '/uploads/attachments/referans-1.jpg',
        uploadedAt: '2025-09-10T10:09:00Z',
        thumbnailUrl: '/uploads/attachments/thumbs/referans-1.jpg',
      },
      {
        id: 'att-2',
        filename: 'brief.pdf',
        name: 'brief.pdf',
        type: 'application/pdf',
        size: 512000,
        mimetype: 'application/pdf',
        url: '/uploads/attachments/brief.pdf',
        uploadedAt: '2025-09-10T10:09:30Z',
      },
    ],
  },
  {
    id: 'msg-4',
    conversationId: 'conv-2',
    senderId: 'user-3',
    receiverId: 'user-1',
    content:
      'Logo tasarımı teslim edildi. İnceleyip geri dönüş yapabilir misiniz?',
    type: 'text',
    createdAt: '2025-09-11T09:00:00Z',
    sentAt: '2025-09-11T09:00:00Z',
    timestamp: '2025-09-11T09:00:00Z',
    isRead: false,
    readAt: undefined,
    attachments: [
      {
        id: 'att-3',
        filename: 'logo-final.png',
        name: 'logo-final.png',
        type: 'image/png',
        size: 128000,
        mimetype: 'image/png',
        url: '/uploads/attachments/logo-final.png',
        uploadedAt: '2025-09-11T08:59:00Z',
        thumbnailUrl: '/uploads/attachments/thumbs/logo-final.png',
      },
    ],
  },
  {
    id: 'msg-5',
    conversationId: 'conv-1',
    senderId: 'user-2',
    receiverId: 'user-1',
    content:
      'Harika referanslar! 2 hafta içinde teslim edebilirim. Başlangıç ücreti 5000 TL olacak.',
    type: 'text',
    createdAt: '2025-09-10T11:00:00Z',
    sentAt: '2025-09-10T11:00:00Z',
    timestamp: '2025-09-10T11:00:00Z',
    isRead: false,
    readAt: undefined,
    attachments: [],
  },
];

const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: [
      {
        userId: 'user-1',
        id: 'user-1',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        avatar: '/avatars/user-1.jpg',
        userType: 'employer',
        lastSeenAt: '2025-09-10T11:05:00Z',
      },
      {
        userId: 'user-2',
        id: 'user-2',
        firstName: 'Zeynep',
        lastName: 'Kaya',
        avatar: '/avatars/user-2.jpg',
        userType: 'freelancer',
        lastSeenAt: '2025-09-10T11:02:00Z',
      },
    ],
    participantIds: ['user-1', 'user-2'],
    type: 'direct',
    lastMessage: mockMessages.find((m) => m.id === 'msg-5'),
    unreadCount: 1,
    createdAt: '2025-09-10T10:00:00Z',
    updatedAt: '2025-09-10T11:00:00Z',
    jobId: 'job-123',
  },
  {
    id: 'conv-2',
    participants: [
      {
        userId: 'user-1',
        id: 'user-1',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        avatar: '/avatars/user-1.jpg',
        userType: 'employer',
        lastSeenAt: '2025-09-11T08:30:00Z',
      },
      {
        userId: 'user-3',
        id: 'user-3',
        firstName: 'Mehmet',
        lastName: 'Özkan',
        avatar: '/avatars/user-3.jpg',
        userType: 'freelancer',
        lastSeenAt: '2025-09-11T09:01:00Z',
      },
    ],
    participantIds: ['user-1', 'user-3'],
    type: 'order',
    lastMessage: mockMessages.find((m) => m.id === 'msg-4'),
    unreadCount: 1,
    createdAt: '2025-09-11T08:00:00Z',
    updatedAt: '2025-09-11T09:00:00Z',
    orderId: 'order-456',
  },
];

// Helper functions
const generatePagination = (
  page: number,
  pageSize: number,
  total: number
): import('@/types/shared/api').PaginationMeta => ({
  page,
  limit: pageSize,
  total,
  totalPages: Math.ceil(total / pageSize),
  hasNext: page * pageSize < total,
  hasPrev: page > 1,
});

const getConversationMessages = (conversationId: string): Message[] => {
  return mockMessages.filter((msg) => msg.conversationId === conversationId);
};

const getUserById = (userId: string) => {
  return mockUsers.find((user) => user.id === userId);
};

const updateConversationLastMessage = (
  conversationId: string,
  message: Message
) => {
  const conversation = mockConversations.find((c) => c.id === conversationId);
  if (conversation) {
    conversation.lastMessage = message;
    conversation.updatedAt = message.createdAt;
    conversation.unreadCount += 1;
  }
};

export const messagingHandlers = [
  // Get conversations
  http.get('/api/v1/conversations', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');
    const search = url.searchParams.get('search');
    const type = url.searchParams.get('type');

    let filteredConversations = [...mockConversations];

    // Apply filters
    if (search) {
      filteredConversations = filteredConversations.filter(
        (conv) =>
          conv.participants.some((participant) =>
            `${participant.firstName} ${participant.lastName}`
              .toLowerCase()
              .includes(search.toLowerCase())
          ) ||
          conv.lastMessage?.content.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (type) {
      filteredConversations = filteredConversations.filter(
        (conv) => conv.type === type
      );
    }

    // Sort by last message time
    filteredConversations.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedConversations = filteredConversations.slice(
      startIndex,
      endIndex
    );

    const response: ConversationsResponse = {
      conversations: paginatedConversations,
      pagination: generatePagination(
        page,
        pageSize,
        filteredConversations.length
      ),
      totalUnread: mockConversations.reduce(
        (sum, conv) => sum + conv.unreadCount,
        0
      ),
    };

    return HttpResponse.json(response);
  }),

  // Get messages for a conversation
  http.get(
    '/api/v1/conversations/:conversationId/messages',
    ({ params, request }) => {
      const { conversationId } = params;
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const pageSize = parseInt(url.searchParams.get('pageSize') || '50');

      const conversationMessages = getConversationMessages(
        conversationId as string
      );

      // Sort by sentAt (newest first for pagination, but return oldest first)
      const sortedMessages = conversationMessages.sort(
        (a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime()
      );

      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedMessages = sortedMessages.slice(startIndex, endIndex);

      const response: MessagesResponse = {
        messages: paginatedMessages,
        pagination: generatePagination(page, pageSize, sortedMessages.length),
        hasMore: endIndex < sortedMessages.length,
      };

      return HttpResponse.json(response);
    }
  ),

  // Send a message
  http.post(
    '/api/v1/conversations/:conversationId/messages',
    async ({ params, request }) => {
      const { conversationId } = params;
      const messageData = (await request.json()) as SendMessageRequest;

      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: conversationId as string,
        senderId: 'current-user-id', // This would come from auth
        content: messageData.content,
        type: messageData.type || 'text',
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        isRead: false,
        attachments:
          messageData.attachments?.map((att, index) => ({
            id: `att-${Date.now()}-${index}`,
            filename: att.name || 'file',
            name: att.name || 'file',
            type: att.type || 'application/octet-stream',
            size: att.size || 0,
            mimetype: att.type || 'application/octet-stream',
            url: `/uploads/attachments/${att.name}`,
            uploadedAt: new Date().toISOString(),
          })) || [],
      };

      mockMessages.push(newMessage);
      updateConversationLastMessage(conversationId as string, newMessage);

      return HttpResponse.json({
        success: true,
        data: newMessage,
      });
    }
  ),

  // Create conversation
  http.post('/api/v1/conversations', async ({ request }) => {
    const conversationData =
      (await request.json()) as CreateConversationRequest;

    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      participants: conversationData.participantIds.map((userId) => {
        const user = getUserById(userId);
        return {
          userId,
          id: userId,
          firstName: user?.firstName || 'Unknown',
          lastName: user?.lastName || 'User',
          avatar: user?.avatar,
          userType: user?.userType || 'freelancer',
        };
      }),
      participantIds: conversationData.participantIds,
      type: conversationData.type || 'direct',
      title: conversationData.title,
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (conversationData.initialMessage) {
      const initialMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: newConversation.id,
        senderId: 'current-user-id',
        content: conversationData.initialMessage,
        type: 'text',
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString(),
        timestamp: new Date().toISOString(),
        isRead: false,
        attachments: [],
      };

      mockMessages.push(initialMessage);
      newConversation.lastMessage = initialMessage;
      newConversation.updatedAt = initialMessage.createdAt;
    }

    mockConversations.push(newConversation);

    return HttpResponse.json({
      success: true,
      data: newConversation,
    });
  }),

  // Mark messages as read
  http.post('/api/v1/conversations/:conversationId/read', ({ params }) => {
    const { conversationId } = params;

    // Mark all messages in this conversation as read
    mockMessages
      .filter((msg) => msg.conversationId === conversationId && !msg.isRead)
      .forEach((msg) => {
        msg.isRead = true;
        msg.readAt = new Date().toISOString();
      });

    // Reset unread count
    const conversation = mockConversations.find((c) => c.id === conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
    }

    return HttpResponse.json({
      success: true,
    });
  }),

  // Search messages
  http.get('/api/v1/messages/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';
    const conversationId = url.searchParams.get('conversationId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

    let searchResults = mockMessages.filter((message) =>
      message.content.toLowerCase().includes(query.toLowerCase())
    );

    if (conversationId) {
      searchResults = searchResults.filter(
        (message) => message.conversationId === conversationId
      );
    }

    // Sort by relevance (for now, just by date)
    searchResults.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResults = searchResults.slice(startIndex, endIndex);

    const response: MessageSearchResponse = {
      messages: paginatedResults,
      pagination: generatePagination(page, pageSize, searchResults.length),
      totalResults: searchResults.length,
      query,
    };

    return HttpResponse.json(response);
  }),

  // Get unread count
  http.get('/api/v1/conversations/unread-count', () => {
    const totalUnread = mockConversations.reduce(
      (sum, conv) => sum + conv.unreadCount,
      0
    );

    const byConversation = mockConversations.reduce(
      (acc, conv) => {
        acc[conv.id] = conv.unreadCount;
        return acc;
      },
      {} as Record<string, number>
    );

    return HttpResponse.json({
      total: totalUnread,
      byConversation,
    });
  }),

  // Real-time message updates (WebSocket simulation)
  http.get('/api/v1/conversations/:conversationId/events', ({ params }) => {
    const { conversationId } = params;

    // Simulate real-time events
    const conversation = mockConversations.find((c) => c.id === conversationId);

    if (conversation) {
      // Simulate typing indicators and online status
      conversation.participants.forEach((participant) => {
        // Add dynamic properties for real-time simulation
        (participant as any).isOnline = Math.random() > 0.5;
        (participant as any).isTyping = Math.random() > 0.8;
      });
    }

    return HttpResponse.json({
      events: [
        {
          type: 'participant_status',
          conversationId,
          data: conversation?.participants,
        },
      ],
    });
  }),
];
