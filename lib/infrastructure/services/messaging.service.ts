import { Message, Conversation } from '@/types';
import type { ApiResponse } from '@/types/shared/api';
import { apiClient } from '@/lib/infrastructure/api/client';

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

  private constructor() {}

  public static getInstance(): MessagingService {
    if (!MessagingService.instance) {
      MessagingService.instance = new MessagingService();
    }
    return MessagingService.instance;
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    const response = await apiClient.get<
      ApiResponse<{ conversations: Conversation[] }>
    >(`/messages/conversations/${userId}`);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch conversations');
    }

    return response.data.conversations || [];
  }

  async getMessages(
    conversationId: string,
    page: number = 1,
    limit: number = 50
  ): Promise<Message[]> {
    const response = await apiClient.get<ApiResponse<{ messages: Message[] }>>(
      `/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch messages');
    }

    return response.data.messages || [];
  }

  async sendMessage(request: SendMessageRequest): Promise<Message> {
    const response = await apiClient.post<ApiResponse<{ message: Message }>>(
      '/messages',
      request
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to send message');
    }

    return response.data.message;
  }

  async markAsRead(messageId: string): Promise<void> {
    const response = await apiClient.put<ApiResponse<void>>(
      `/messages/${messageId}/read`
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to mark message as read');
    }
  }

  async createConversation(
    request: CreateConversationRequest
  ): Promise<Conversation> {
    const response = await apiClient.post<
      ApiResponse<{ conversation: Conversation }>
    >('/messages/conversations', request);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create conversation');
    }

    return response.data.conversation;
  }

  async deleteMessage(messageId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/messages/${messageId}`
    );

    if (!response.success) {
      throw new Error(response.message || 'Failed to delete message');
    }
  }

  async searchMessages(query: string, userId: string): Promise<Message[]> {
    const response = await apiClient.get<ApiResponse<{ messages: Message[] }>>(
      `/messages/search?q=${encodeURIComponent(query)}&userId=${userId}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to search messages');
    }

    return response.data.messages || [];
  }
}
