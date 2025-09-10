import { http, HttpResponse } from 'msw';
import { Message, Conversation, User, ApiResponse } from '@/types';

// Helper function to create API response
function createApiResponse<T>(data: T, message = 'Başarılı'): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

// Mock users for messaging
const mockUsers: User[] = [
  {
    id: 'freelancer-1',
    email: 'freelancer@example.com',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    userType: 'freelancer',
    avatar: '/avatars/freelancer-1.jpg',
    location: 'İstanbul, Türkiye',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'employer-1',
    email: 'isveren@example.com',
    firstName: 'Fatma',
    lastName: 'Kaya',
    userType: 'employer',
    avatar: '/avatars/employer-1.jpg',
    location: 'Ankara, Türkiye',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'employer-2',
    email: 'zeynep@example.com',
    firstName: 'Zeynep',
    lastName: 'Demir',
    userType: 'employer',
    avatar: '/avatars/employer-2.jpg',
    location: 'İzmir, Türkiye',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'employer-3',
    email: 'mehmet@example.com',
    firstName: 'Mehmet',
    lastName: 'Özkan',
    userType: 'employer',
    avatar: '/avatars/employer-3.jpg',
    location: 'Ankara, Türkiye',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
];

// Mock Messages & Conversations Data
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: [mockUsers[0], mockUsers[1]], // freelancer-1, employer-1
    lastMessage: {
      id: 'msg-5',
      conversationId: 'conv-1',
      senderId: 'employer-1',
      sender: mockUsers[1],
      content:
        'Mükemmel! Hemen başlayabilirsiniz. Hangi bilgilere ihtiyacınız var?',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    },
    unreadCount: 2,
    jobId: '1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'conv-2',
    participants: [mockUsers[0], mockUsers[2]], // freelancer-1, employer-2
    lastMessage: {
      id: 'msg-8',
      conversationId: 'conv-2',
      senderId: 'freelancer-1',
      sender: mockUsers[0],
      content: 'Tasarım revizelerini tamamladım. İnceleyebilirsiniz.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    unreadCount: 0,
    packageId: '2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'conv-3',
    participants: [mockUsers[0], mockUsers[3]], // freelancer-1, employer-3
    lastMessage: {
      id: 'msg-12',
      conversationId: 'conv-3',
      senderId: 'employer-3',
      sender: mockUsers[3],
      content: 'Teşekkürler, proje harika oldu!',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    },
    unreadCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'employer-1',
      sender: mockUsers[1],
      content: 'Merhaba Ahmet! React projesi için teklifinizi inceledim.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'freelancer-1',
      sender: mockUsers[0],
      content: 'Merhaba Fatma Hanım! Teklifimi incelediğiniz için teşekkürler.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'freelancer-1',
      sender: mockUsers[0],
      content:
        'Projeyi 2 hafta içinde teslim edebilirim. Responsive tasarım ve performans optimizasyonu dahil.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
    },
    {
      id: 'msg-4',
      conversationId: 'conv-1',
      senderId: 'employer-1',
      sender: mockUsers[1],
      content: 'Süre uygun. SEO optimizasyonu da ekleyebilir misiniz?',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
      id: 'msg-5',
      conversationId: 'conv-1',
      senderId: 'employer-1',
      sender: mockUsers[1],
      content:
        'Mükemmel! Hemen başlayabilirsiniz. Hangi bilgilere ihtiyacınız var?',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ],
  'conv-2': [
    {
      id: 'msg-6',
      conversationId: 'conv-2',
      senderId: 'employer-2',
      sender: mockUsers[2],
      content: 'Logo tasarımlarını gördüm, çok beğendim!',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
      id: 'msg-7',
      conversationId: 'conv-2',
      senderId: 'freelancer-1',
      sender: mockUsers[0],
      content: 'Teşekkürler! Küçük bir revizyon istediğinizi belirtmiştiniz.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: 'msg-8',
      conversationId: 'conv-2',
      senderId: 'freelancer-1',
      sender: mockUsers[0],
      content: 'Tasarım revizelerini tamamladım. İnceleyebilirsiniz.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ],
  'conv-3': [
    {
      id: 'msg-9',
      conversationId: 'conv-3',
      senderId: 'employer-3',
      sender: mockUsers[3],
      content: 'Mobil uygulamanın son halini test ettim.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    },
    {
      id: 'msg-10',
      conversationId: 'conv-3',
      senderId: 'freelancer-1',
      sender: mockUsers[0],
      content: 'Nasıl buldunuz? Herhangi bir sorun var mı?',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    },
    {
      id: 'msg-11',
      conversationId: 'conv-3',
      senderId: 'employer-3',
      sender: mockUsers[3],
      content: 'Her şey mükemmel çalışıyor. Performans da harika.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    },
    {
      id: 'msg-12',
      conversationId: 'conv-3',
      senderId: 'employer-3',
      sender: mockUsers[3],
      content: 'Teşekkürler, proje harika oldu!',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
  ],
};

// Messaging API Handlers
export const messagingHandlers = [
  // Get all conversations for current user
  http.get('/api/conversations', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = token.replace('mock-token-', '');

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Filter conversations where user is a participant
    const userConversations = mockConversations
      .filter((conv) => conv.participants.some((p) => p.id === userId))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

    return HttpResponse.json(createApiResponse(userConversations));
  }),

  // Get specific conversation
  http.get('/api/conversations/:id', async ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = token.replace('mock-token-', '');
    const conversationId = params.id as string;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const conversation = mockConversations.find(
      (conv) =>
        conv.id === conversationId &&
        conv.participants.some((p) => p.id === userId)
    );

    if (!conversation) {
      return HttpResponse.json(
        { success: false, error: 'Konuşma bulunamadı' },
        { status: 404 }
      );
    }

    return HttpResponse.json(createApiResponse(conversation));
  }),

  // Get messages for a conversation
  http.get('/api/conversations/:id/messages', async ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = token.replace('mock-token-', '');
    const conversationId = params.id as string;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Check if user has access to this conversation
    const conversation = mockConversations.find(
      (conv) =>
        conv.id === conversationId &&
        conv.participants.some((p) => p.id === userId)
    );

    if (!conversation) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }

    const messages = mockMessages[conversationId] || [];

    // Sort messages by creation date
    const sortedMessages = messages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return HttpResponse.json(createApiResponse(sortedMessages));
  }),

  // Send a new message
  http.post('/api/conversations/:id/messages', async ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = token.replace('mock-token-', '');
    const conversationId = params.id as string;

    const { content } = (await request.json()) as {
      content: string;
    };

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if user has access to this conversation
    const conversation = mockConversations.find(
      (conv) =>
        conv.id === conversationId &&
        conv.participants.some((p) => p.id === userId)
    );

    if (!conversation) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }

    const sender = mockUsers.find((u) => u.id === userId);
    if (!sender) {
      return HttpResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Create new message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: userId,
      sender,
      content: content.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // Add message to mock data
    if (!mockMessages[conversationId]) {
      mockMessages[conversationId] = [];
    }
    mockMessages[conversationId].push(newMessage);

    // Update conversation's last message and timestamp
    const convIndex = mockConversations.findIndex(
      (c) => c.id === conversationId
    );
    if (convIndex !== -1) {
      mockConversations[convIndex].lastMessage = newMessage;
      mockConversations[convIndex].updatedAt = new Date().toISOString();

      // Update unread count for other participants
      const otherParticipant = conversation.participants.find(
        (p) => p.id !== userId
      );
      if (otherParticipant) {
        mockConversations[convIndex].unreadCount += 1;
      }
    }

    return HttpResponse.json(createApiResponse(newMessage));
  }),

  // Create new conversation
  http.post('/api/conversations', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = token.replace('mock-token-', '');

    const { participantId, jobId, packageId, initialMessage } =
      (await request.json()) as {
        participantId: string;
        jobId?: string;
        packageId?: string;
        initialMessage?: string;
      };

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const currentUser = mockUsers.find((u) => u.id === userId);
    const participant = mockUsers.find((u) => u.id === participantId);

    if (!currentUser || !participant) {
      return HttpResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Check if conversation already exists between these users
    const existingConversation = mockConversations.find(
      (conv) =>
        conv.participants.length === 2 &&
        conv.participants.some((p) => p.id === userId) &&
        conv.participants.some((p) => p.id === participantId) &&
        (!jobId || conv.jobId === jobId) &&
        (!packageId || conv.packageId === packageId)
    );

    if (existingConversation) {
      return HttpResponse.json(createApiResponse(existingConversation));
    }

    // Create new conversation
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      participants: [currentUser, participant],
      unreadCount: 0,
      jobId,
      packageId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If initial message provided, create it
    if (initialMessage?.trim()) {
      const firstMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: newConversation.id,
        senderId: userId,
        sender: currentUser,
        content: initialMessage.trim(),
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      mockMessages[newConversation.id] = [firstMessage];
      newConversation.lastMessage = firstMessage;
      newConversation.unreadCount = 1;
    }

    mockConversations.unshift(newConversation);

    return HttpResponse.json(createApiResponse(newConversation));
  }),

  // Mark messages as read
  http.patch(
    '/api/conversations/:id/mark-read',
    async ({ params, request }) => {
      const authHeader = request.headers.get('Authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { success: false, error: 'Yetkisiz erişim' },
          { status: 401 }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const userId = token.replace('mock-token-', '');
      const conversationId = params.id as string;

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Check if user has access to this conversation
      const convIndex = mockConversations.findIndex(
        (conv) =>
          conv.id === conversationId &&
          conv.participants.some((p) => p.id === userId)
      );

      if (convIndex === -1) {
        return HttpResponse.json(
          { success: false, error: 'Yetkisiz erişim' },
          { status: 403 }
        );
      }

      // Mark all messages as read for this user
      const messages = mockMessages[conversationId] || [];
      messages.forEach((message) => {
        if (message.senderId !== userId) {
          message.isRead = true;
        }
      });

      // Reset unread count for this user
      mockConversations[convIndex].unreadCount = 0;

      return HttpResponse.json(createApiResponse({ success: true }));
    }
  ),
];
