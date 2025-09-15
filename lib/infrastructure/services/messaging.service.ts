import { Message, Conversation } from '@/types';

export interface SendMessageRequest {
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  attachments?: string[];
}

export interface CreateConversationRequest {
  participantIds: string[];
}

// Aliases for backward compatibility
export type SendMessageData = SendMessageRequest;
export type CreateConversationData = CreateConversationRequest;

export class MessagingService {
  private static instance: MessagingService;
  private baseUrl = '/api/messages';

  private constructor() {}

  public static getInstance(): MessagingService {
    if (!MessagingService.instance) {
      MessagingService.instance = new MessagingService();
    }
    return MessagingService.instance;
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const response = await fetch(`${this.baseUrl}/conversations/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch conversations');
    }

    const data = await response.json();
    return data.conversations || [];
  }

  async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<Message[]> {
    const response = await fetch(
      `${this.baseUrl}/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch messages');
    }

    const data = await response.json();
    return data.messages || [];
  }

  async sendMessage(request: SendMessageRequest): Promise<Message> {
    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const data = await response.json();
    return data.message;
  }

  async markAsRead(messageId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${messageId}/read`, {
      method: 'PUT',
    });

    if (!response.ok) {
      throw new Error('Failed to mark message as read');
    }
  }

  async createConversation(
    request: CreateConversationRequest
  ): Promise<Conversation> {
    const response = await fetch(`${this.baseUrl}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error('Failed to create conversation');
    }

    const data = await response.json();
    return data.conversation;
  }

  async deleteMessage(messageId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${messageId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete message');
    }
  }

  async searchMessages(query: string, userId: string): Promise<Message[]> {
    const response = await fetch(
      `${this.baseUrl}/search?q=${encodeURIComponent(query)}&userId=${userId}`
    );
    if (!response.ok) {
      throw new Error('Failed to search messages');
    }

    const data = await response.json();
    return data.messages || [];
  }
}
