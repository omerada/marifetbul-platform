import { http, HttpResponse } from 'msw';
import type {
  ChatMessage,
  ChatConversation,
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

const mockMessages: ChatMessage[] = [
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
    createdAt: '2025-09-10T10:02:00Z',
    sentAt: '2025-09-10T10:02:00Z',
    isRead: true,
    readAt: '2025-09-10T10:02:30Z',
    attachments: [],
  },
  {
    id: 'msg-3',
    conversationId: 'conv-1',
    senderId: 'user-1',
    receiverId: 'user-2',
    content:
      'E-ticaret sitesi için modern bir tasarım istiyorum. Referans dosyalarını paylaşıyorum.',
    type: 'text',
    createdAt: '2025-09-10T10:05:00Z',
    sentAt: '2025-09-10T10:05:00Z',
    isRead: true,
    readAt: '2025-09-10T10:06:00Z',
    attachments: [
      {
        id: 'att-1',
        name: 'references.pdf',
        url: '/uploads/messages/references.pdf',
        type: 'application/pdf',
        size: 2048000,
        filename: 'references.pdf',
        mimetype: 'application/pdf',
        uploadedAt: '2025-09-10T10:05:00Z',
        thumbnailUrl: '/uploads/messages/references-thumb.jpg',
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
    createdAt: '2025-09-11T14:30:00Z',
    sentAt: '2025-09-11T14:30:00Z',
    isRead: false,
    readAt: undefined,
    attachments: [
      {
        id: 'att-2',
        name: 'logo-final.ai',
        url: '/uploads/messages/logo-final.ai',
        type: 'application/illustrator',
        size: 5120000,
        filename: 'logo-final.ai',
        mimetype: 'application/illustrator',
        uploadedAt: '2025-09-11T14:30:00Z',
        thumbnailUrl: '/uploads/messages/logo-preview.jpg',
      },
    ],
  },
  {
    id: 'msg-5',
    conversationId: 'conv-1',
    senderId: 'user-2',
    receiverId: 'user-1',
    content:
      'Harika referanslar! 2 hafta içinde teslim edebilirim. Başlangıç ücreti 5000 TL.',
    type: 'text',
    createdAt: '2025-09-10T10:10:00Z',
    sentAt: '2025-09-10T10:10:00Z',
    isRead: false,
    readAt: undefined,
    attachments: [],
  },
];

const mockConversations: ChatConversation[] = [
  {
    id: 'conv-1',
    type: 'order',
    participants: [
      {
        ...mockUsers[0],
        email: 'ahmet.yilmaz@example.com',
        accountStatus: 'active' as const,
        verificationStatus: 'verified' as const,
        createdAt: '2025-08-01T10:00:00Z',
        updatedAt: '2025-09-10T09:55:00Z',
        userId: 'user-1',
        joinedAt: '2025-09-10T09:55:00Z',
        lastReadAt: '2025-09-10T10:10:30Z',
        isTyping: false,
        isOnline: true,
      },
      {
        ...mockUsers[1],
        email: 'zeynep.kaya@example.com',
        accountStatus: 'active' as const,
        verificationStatus: 'verified' as const,
        createdAt: '2025-08-15T10:00:00Z',
        updatedAt: '2025-09-10T09:55:00Z',
        userId: 'user-2',
        joinedAt: '2025-09-10T09:55:00Z',
        lastReadAt: '2025-09-10T10:09:00Z',
        isTyping: false,
        isOnline: true,
      },
    ],
    lastMessage: mockMessages[4],
    lastActivity: '2025-09-10T10:10:00Z',
    unreadCount: 1,
    createdAt: '2025-09-10T09:55:00Z',
    updatedAt: '2025-09-10T10:10:00Z',
    isArchived: false,
    isPinned: true,
    orderId: 'order-123',
    metadata: {
      title: 'E-ticaret Web Tasarımı',
      priority: 'high',
      tags: ['web-design', 'e-commerce'],
    },
  },
  {
    id: 'conv-2',
    type: 'order',
    participants: [
      {
        ...mockUsers[0],
        email: 'ahmet.yilmaz@example.com',
        accountStatus: 'active' as const,
        verificationStatus: 'verified' as const,
        createdAt: '2025-08-01T10:00:00Z',
        updatedAt: '2025-09-11T14:00:00Z',
        userId: 'user-1',
        joinedAt: '2025-09-11T14:00:00Z',
        lastReadAt: '2025-09-11T14:20:00Z',
        isTyping: false,
        isOnline: true,
      },
      {
        ...mockUsers[2],
        email: 'mehmet.ozkan@example.com',
        accountStatus: 'active' as const,
        verificationStatus: 'verified' as const,
        createdAt: '2025-08-20T10:00:00Z',
        updatedAt: '2025-09-11T14:00:00Z',
        userId: 'user-3',
        joinedAt: '2025-09-11T14:00:00Z',
        lastReadAt: '2025-09-11T14:30:00Z',
        isTyping: false,
        isOnline: false,
      },
    ],
    lastMessage: mockMessages[3],
    lastActivity: '2025-09-11T14:30:00Z',
    unreadCount: 1,
    createdAt: '2025-09-11T14:00:00Z',
    updatedAt: '2025-09-11T14:30:00Z',
    isArchived: false,
    isPinned: false,
    orderId: 'order-124',
    metadata: {
      title: 'Logo Tasarımı',
      priority: 'normal',
      tags: ['logo', 'branding'],
    },
  },
];

// Helper functions
const getConversationMessages = (conversationId: string): ChatMessage[] => {
  return mockMessages.filter((msg) => msg.conversationId === conversationId);
};

const generatePagination = (
  page: number,
  pageSize: number,
  total: number
): PaginationMeta => ({
  page,
  limit: pageSize, // Required for PaginationMeta compatibility
  pageSize,
  total,
  totalPages: Math.ceil(total / pageSize),
  hasNext: page < Math.ceil(total / pageSize),
  hasPrev: page > 1,
});

// MSW Handlers
export const messagingHandlers = [
  // Get conversations
  http.get('/api/v1/conversations', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    const type = url.searchParams.get('type') as 'direct' | 'order' | null;
    const archived = url.searchParams.get('archived') === 'true';

    let filteredConversations = mockConversations.filter((conv) => {
      if (type && conv.type !== type) return false;
      if (conv.isArchived !== archived) return false;
      return true;
    });

    // Sort by last activity
    filteredConversations = filteredConversations.sort(
      (a, b) =>
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
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

      const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        conversationId: conversationId as string,
        senderId: messageData.content?.includes('sistem') ? 'system' : 'user-1', // Mock current user
        receiverId: 'user-2', // Mock receiver
        content: messageData.content,
        type: messageData.type || 'text', // Default to text if not provided
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString(),
        isRead: false,
        attachments:
          messageData.attachments?.map((att, index) => ({
            ...att,
            id: att.id || `att-${Date.now()}-${index}`, // Use existing id or generate new one
          })) || [],
      };

      // Add to mock data
      mockMessages.push(newMessage);

      // Update conversation last message and activity
      const conversation = mockConversations.find(
        (conv) => conv.id === conversationId
      );
      if (conversation) {
        conversation.lastMessage = newMessage;
        conversation.lastActivity = newMessage.sentAt;
      }

      return HttpResponse.json({
        success: true,
        data: newMessage,
      });
    }
  ),

  // Create a new conversation
  http.post('/api/v1/conversations', async ({ request }) => {
    const conversationData =
      (await request.json()) as CreateConversationRequest;

    const newConversation: ChatConversation = {
      id: `conv-${Date.now()}`,
      type: conversationData.type,
      participants: conversationData.participantIds.map((userId) => {
        const user = mockUsers.find((u) => u.id === userId) || mockUsers[0];
        return {
          ...user,
          email: `${user.firstName.toLowerCase()}.${user.lastName.toLowerCase()}@example.com`,
          accountStatus: 'active' as const,
          verificationStatus: 'verified' as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId,
          joinedAt: new Date().toISOString(),
          isTyping: false,
          isOnline: Math.random() > 0.5,
        };
      }),
      lastActivity: new Date().toISOString(),
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isArchived: false,
      isPinned: false,
      orderId: conversationData.orderId,
      title: conversationData.title,
    };

    // Create initial message if provided
    if (conversationData.initialMessage) {
      const initialMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        conversationId: newConversation.id,
        senderId: conversationData.participantIds[0],
        receiverId: conversationData.participantIds[1],
        content: conversationData.initialMessage,
        type: 'text',
        createdAt: new Date().toISOString(),
        sentAt: new Date().toISOString(),
        isRead: false,
        attachments: [],
      };

      mockMessages.push(initialMessage);
      newConversation.lastMessage = initialMessage;
    }

    // Add to mock data
    mockConversations.push(newConversation);

    return HttpResponse.json({
      success: true,
      data: newConversation,
    });
  }),

  // Mark messages as read
  http.post(
    '/api/v1/conversations/:conversationId/read',
    async ({ params, request }) => {
      const { conversationId } = params;
      const { messageId } = (await request.json()) as { messageId?: string };

      // Mark messages as read
      const conversationMessages = mockMessages.filter(
        (msg) => msg.conversationId === conversationId
      );

      if (messageId) {
        // Mark specific message as read
        const message = conversationMessages.find(
          (msg) => msg.id === messageId
        );
        if (message) {
          message.readAt = new Date().toISOString();
        }
      } else {
        // Mark all unread messages as read
        conversationMessages.forEach((msg) => {
          if (!msg.readAt) {
            msg.readAt = new Date().toISOString();
          }
        });
      }

      // Update conversation unread count
      const conversation = mockConversations.find(
        (conv) => conv.id === conversationId
      );
      if (conversation) {
        conversation.unreadCount = 0;
      }

      return HttpResponse.json({
        success: true,
      });
    }
  ),

  // Search messages
  http.get('/api/v1/messages/search', ({ request }) => {
    const url = new URL(request.url);
    const query = url.searchParams.get('query') || '';
    const conversationId = url.searchParams.get('conversationId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20');

    let searchResults = mockMessages.filter((message) => {
      if (conversationId && message.conversationId !== conversationId)
        return false;
      if (query && !message.content.toLowerCase().includes(query.toLowerCase()))
        return false;
      return true;
    });

    // Sort by relevance (newest first for demo)
    searchResults = searchResults.sort(
      (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );

    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedResults = searchResults.slice(startIndex, endIndex);

    const response: MessageSearchResponse = {
      results: paginatedResults.map((message) => ({
        message,
        conversation: mockConversations.find(
          (conv) => conv.id === message.conversationId
        )!,
        highlights: [query], // Simplified highlighting
      })),
      pagination: generatePagination(page, pageSize, searchResults.length),
    };

    return HttpResponse.json(response);
  }),

  // Archive/unarchive conversation
  http.post(
    '/api/v1/conversations/:conversationId/archive',
    async ({ params, request }) => {
      const { conversationId } = params;
      const { archived } = (await request.json()) as { archived: boolean };

      const conversation = mockConversations.find(
        (conv) => conv.id === conversationId
      );
      if (conversation) {
        conversation.isArchived = archived;
      }

      return HttpResponse.json({
        success: true,
        data: conversation,
      });
    }
  ),

  // Pin/unpin conversation
  http.post(
    '/api/v1/conversations/:conversationId/pin',
    async ({ params, request }) => {
      const { conversationId } = params;
      const { pinned } = (await request.json()) as { pinned: boolean };

      const conversation = mockConversations.find(
        (conv) => conv.id === conversationId
      );
      if (conversation) {
        conversation.isPinned = pinned;
      }

      return HttpResponse.json({
        success: true,
        data: conversation,
      });
    }
  ),

  // Delete message
  http.delete('/api/v1/messages/:messageId', ({ params }) => {
    const { messageId } = params;
    const messageIndex = mockMessages.findIndex((msg) => msg.id === messageId);

    if (messageIndex !== -1) {
      mockMessages.splice(messageIndex, 1);
    }

    return HttpResponse.json({
      success: true,
    });
  }),

  // Get typing indicator
  http.get('/api/v1/conversations/:conversationId/typing', ({ params }) => {
    const { conversationId } = params;

    // Mock typing status
    const isTyping = Math.random() > 0.8; // 20% chance someone is typing

    return HttpResponse.json({
      conversationId,
      isTyping,
      typingUsers: isTyping ? [mockUsers[1]] : [],
    });
  }),

  // Set typing indicator
  http.post(
    '/api/v1/conversations/:conversationId/typing',
    async ({ params, request }) => {
      const { conversationId } = params;
      const { isTyping } = (await request.json()) as { isTyping: boolean };

      // Update typing status in conversation
      const conversation = mockConversations.find(
        (conv) => conv.id === conversationId
      );
      if (conversation) {
        conversation.participants.forEach((participant) => {
          if (participant.userId === 'user-1') {
            participant.isTyping = isTyping;
          }
        });
      }

      return HttpResponse.json({
        success: true,
      });
    }
  ),
];
