/**
 * Messaging Repository
 * Handles all messaging-related API calls with caching and error handling
 */

import { BaseRepository, PaginatedResult } from './BaseRepository';
import { ApiResponse } from '../api/UnifiedApiClient';
import type { ChatMessage, ChatConversation } from '../../types';
import type { PaginationOptions, PaginatedResult } from '../services/base';

export interface MessageFilters {
  senderId?: string;
  content?: string;
  type?: 'text' | 'file' | 'image';
  isRead?: boolean;
  fromDate?: string;
  toDate?: string;
}

export interface ConversationFilters {
  type?: 'direct' | 'group' | 'order' | 'job';
  isArchived?: boolean;
  hasUnread?: boolean;
  participantId?: string;
}

export interface SendMessageData {
  conversationId: string;
  content: string;
  type?: 'text' | 'file' | 'image';
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
}

export interface CreateConversationData {
  participantIds: string[];
  type?: 'direct' | 'group' | 'order' | 'job';
  title?: string;
  initialMessage?: string;
  orderId?: string;
  jobId?: string;
  metadata?: Record<string, unknown>;
}

export interface MessageSearchResult {
  message: ChatMessage;
  conversation: ChatConversation;
  highlights: string[];
}

export class MessagingRepository extends BaseRepository {
  constructor() {
    super('/api/v1');
  }

  /**
   * Fetch conversations with pagination and filtering
   */
  async fetchConversations(
    options: PaginationOptions = { page: 1, limit: 20 },
    filters: ConversationFilters = {}
  ): Promise<ApiResponse<PaginatedResult<ChatConversation>>> {
    const params = {
      page: (options.page || 1).toString(),
      limit: (options.limit || 20).toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined)
      ),
    };

    return this.get<PaginatedResult<ChatConversation>>(
      '/conversations',
      params,
      {
        cache: {
          enabled: true,
          ttl: 30000, // 30 seconds
        },
        retries: 2,
      }
    );
  }

  /**
   * Get conversation by ID
   */
  async getConversation(
    conversationId: string
  ): Promise<ApiResponse<ChatConversation>> {
    return this.get<ChatConversation>(
      `/conversations/${conversationId}`,
      undefined,
      {
        cache: {
          enabled: true,
          ttl: 60000, // 1 minute
        },
      }
    );
  }

  /**
   * Create a new conversation
   */
  async createConversation(
    data: CreateConversationData
  ): Promise<ApiResponse<ChatConversation>> {
    const response = await this.post<ChatConversation>('/conversations', data);

    // Clear conversations cache
    this.clearCache('/conversations');

    return response;
  }

  /**
   * Archive/unarchive conversation
   */
  async archiveConversation(
    conversationId: string,
    archive = true
  ): Promise<ApiResponse<ChatConversation>> {
    const response = await this.patch<ChatConversation>(
      `/conversations/${conversationId}`,
      { isArchived: archive }
    );

    // Clear related cache
    this.clearCache('/conversations');

    return response;
  }

  /**
   * Pin/unpin conversation
   */
  async pinConversation(
    conversationId: string,
    pin = true
  ): Promise<ApiResponse<ChatConversation>> {
    const response = await this.patch<ChatConversation>(
      `/conversations/${conversationId}`,
      { isPinned: pin }
    );

    // Clear related cache
    this.clearCache('/conversations');

    return response;
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId: string): Promise<ApiResponse<void>> {
    const response = await this.delete<void>(
      `/conversations/${conversationId}`
    );

    // Clear related cache
    this.clearCache('/conversations');

    return response;
  }

  /**
   * Fetch messages for a conversation
   */
  async fetchMessages(
    conversationId: string,
    options: PaginationOptions = { page: 1, limit: 50 },
    filters: MessageFilters = {}
  ): Promise<ApiResponse<PaginatedResult<ChatMessage>>> {
    const params = {
      page: (options.page || 1).toString(),
      limit: (options.limit || 50).toString(),
      ...Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== undefined)
      ),
    };

    return this.get<PaginatedResult<ChatMessage>>(
      `/conversations/${conversationId}/messages`,
      params,
      {
        cache: {
          enabled: true,
          ttl: 15000, // 15 seconds
        },
      }
    );
  }

  /**
   * Send a message
   */
  async sendMessage(data: SendMessageData): Promise<ApiResponse<ChatMessage>> {
    const response = await this.post<ChatMessage>(
      `/conversations/${data.conversationId}/messages`,
      data
    );

    // Clear related cache
    this.clearCache(`/conversations/${data.conversationId}/messages`);
    this.clearCache('/conversations');

    return response;
  }

  /**
   * Edit a message
   */
  async editMessage(
    messageId: string,
    content: string
  ): Promise<ApiResponse<ChatMessage>> {
    const response = await this.patch<ChatMessage>(`/messages/${messageId}`, {
      content,
    });

    // Clear related cache
    this.clearCache('/messages');

    return response;
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<ApiResponse<void>> {
    const response = await this.delete<void>(`/messages/${messageId}`);

    // Clear related cache
    this.clearCache('/messages');

    return response;
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(
    messageId: string
  ): Promise<ApiResponse<ChatMessage>> {
    const response = await this.patch<ChatMessage>(`/messages/${messageId}`, {
      isRead: true,
      readAt: new Date().toISOString(),
    });

    // Clear related cache
    this.clearCache('/conversations');

    return response;
  }

  /**
   * Mark all messages in conversation as read
   */
  async markConversationAsRead(
    conversationId: string
  ): Promise<ApiResponse<{ updated: number }>> {
    const response = await this.patch<{ updated: number }>(
      `/conversations/${conversationId}/mark-read`
    );

    // Clear related cache
    this.clearCache('/conversations');

    return response;
  }

  /**
   * Search messages across all conversations
   */
  async searchMessages(
    query: string,
    options: PaginationOptions = { page: 1, limit: 20 },
    conversationId?: string
  ): Promise<ApiResponse<PaginatedResult<MessageSearchResult>>> {
    const params = {
      q: query,
      page: (options.page || 1).toString(),
      limit: (options.limit || 20).toString(),
      ...(conversationId && { conversationId }),
    };

    return this.get<PaginatedResult<MessageSearchResult>>(
      '/messages/search',
      params,
      {
        cache: {
          enabled: true,
          ttl: 60000, // 1 minute
        },
      }
    );
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(): Promise<ApiResponse<{ count: number }>> {
    return this.get<{ count: number }>('/messages/unread-count', undefined, {
      cache: {
        enabled: true,
        ttl: 10000, // 10 seconds
      },
    });
  }

  /**
   * Set typing indicator
   */
  async setTyping(
    conversationId: string,
    isTyping: boolean
  ): Promise<ApiResponse<void>> {
    return this.post<void>(`/conversations/${conversationId}/typing`, {
      isTyping,
    });
  }

  /**
   * Get conversation participants
   */
  async getParticipants(conversationId: string): Promise<
    ApiResponse<{
      participants: Array<{ id: string; joinedAt: string; role?: string }>;
    }>
  > {
    return this.get<{
      participants: Array<{ id: string; joinedAt: string; role?: string }>;
    }>(`/conversations/${conversationId}/participants`, undefined, {
      cache: {
        enabled: true,
        ttl: 60000, // 1 minute
      },
    });
  }

  /**
   * Add participant to conversation
   */
  async addParticipant(
    conversationId: string,
    userId: string
  ): Promise<ApiResponse<ChatConversation>> {
    const response = await this.post<ChatConversation>(
      `/conversations/${conversationId}/participants`,
      { userId }
    );

    // Clear related cache
    this.clearCache('/conversations');

    return response;
  }

  /**
   * Remove participant from conversation
   */
  async removeParticipant(
    conversationId: string,
    userId: string
  ): Promise<ApiResponse<ChatConversation>> {
    const response = await this.delete<ChatConversation>(
      `/conversations/${conversationId}/participants/${userId}`
    );

    // Clear related cache
    this.clearCache('/conversations');

    return response;
  }

  /**
   * Upload message attachment
   */
  async uploadAttachment(
    file: File
  ): Promise<
    ApiResponse<{ url: string; name: string; size: number; type: string }>
  > {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<{
      url: string;
      name: string;
      size: number;
      type: string;
    }>('/messages/attachments', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  /**
   * Get message delivery status
   */
  async getDeliveryStatus(messageId: string): Promise<
    ApiResponse<{
      sent: boolean;
      delivered: boolean;
      read: boolean;
      timestamp: string;
    }>
  > {
    return this.get<{
      sent: boolean;
      delivered: boolean;
      read: boolean;
      timestamp: string;
    }>(`/messages/${messageId}/status`);
  }

  /**
   * Block/unblock user
   */
  async blockUser(
    userId: string,
    block = true
  ): Promise<ApiResponse<{ blocked: boolean }>> {
    return this.post<{ blocked: boolean }>('/messages/block', {
      userId,
      blocked: block,
    });
  }

  /**
   * Get blocked users
   */
  async getBlockedUsers(): Promise<
    ApiResponse<{ users: Array<{ id: string; blockedAt: string }> }>
  > {
    return this.get<{ users: Array<{ id: string; blockedAt: string }> }>(
      '/messages/blocked',
      undefined,
      {
        cache: {
          enabled: true,
          ttl: 300000, // 5 minutes
        },
      }
    );
  }

  /**
   * Report message/conversation
   */
  async reportContent(
    targetId: string,
    type: 'message' | 'conversation',
    reason: string,
    description?: string
  ): Promise<ApiResponse<{ reported: boolean }>> {
    return this.post<{ reported: boolean }>('/messages/report', {
      targetId,
      type,
      reason,
      description,
    });
  }
}
