/**
 * Messaging API Service
 *
 * Simplified API client for messaging system.
 * Backend returns data wrapped in ApiResponse<T> format.
 *
 * @sprint Sprint 5 - Real-time Messaging
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import type {
  Message,
  Conversation,
  CreateMessageRequest,
  CreateConversationRequest,
  SendMessageResponse,
  MessageAttachment,
  MessageReaction,
} from '@/types/message';

// Backend response wrapper
interface BackendApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

// Backend PageResponse
interface BackendPageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

// ==================== CONVERSATIONS ====================

export async function getConversations(page = 0, size = 20) {
  const response = await apiClient.get<
    BackendApiResponse<BackendPageResponse<Conversation>>
  >('/api/v1/conversations', { page: String(page), size: String(size) });
  return response.data;
}

export async function getActiveConversations(page = 0, size = 20) {
  const response = await apiClient.get<
    BackendApiResponse<BackendPageResponse<Conversation>>
  >('/api/v1/conversations/active', { page: String(page), size: String(size) });
  return response.data;
}

export async function getArchivedConversations(page = 0, size = 20) {
  const response = await apiClient.get<
    BackendApiResponse<BackendPageResponse<Conversation>>
  >('/api/v1/conversations/archived', {
    page: String(page),
    size: String(size),
  });
  return response.data;
}

export async function getOrCreateConversation(participantId: string) {
  const response = await apiClient.get<BackendApiResponse<Conversation>>(
    `/api/v1/conversations/user/${participantId}`
  );
  return response.data;
}

export async function createConversation(request: CreateConversationRequest) {
  const response = await apiClient.post<BackendApiResponse<Conversation>>(
    '/api/v1/conversations',
    request
  );
  return response.data;
}

export async function getConversationById(conversationId: string) {
  const response = await apiClient.get<BackendApiResponse<Conversation>>(
    `/api/v1/conversations/${conversationId}`
  );
  return response.data;
}

export async function archiveConversation(conversationId: string) {
  await apiClient.put(`/api/v1/conversations/${conversationId}/archive`);
}

export async function unarchiveConversation(conversationId: string) {
  await apiClient.put(`/api/v1/conversations/${conversationId}/unarchive`);
}

export async function pinConversation(conversationId: string) {
  await apiClient.put(`/api/v1/conversations/${conversationId}/pin`);
}

export async function unpinConversation(conversationId: string) {
  await apiClient.put(`/api/v1/conversations/${conversationId}/unpin`);
}

export async function muteConversation(conversationId: string) {
  await apiClient.put(`/api/v1/conversations/${conversationId}/mute`);
}

export async function unmuteConversation(conversationId: string) {
  await apiClient.put(`/api/v1/conversations/${conversationId}/unmute`);
}

export async function blockConversation(conversationId: string) {
  await apiClient.put(`/api/v1/conversations/${conversationId}/block`);
}

export async function unblockConversation(conversationId: string) {
  await apiClient.put(`/api/v1/conversations/${conversationId}/unblock`);
}

export async function deleteConversation(conversationId: string) {
  await apiClient.delete(`/api/v1/conversations/${conversationId}`);
}

export async function searchConversations(query: string, page = 0, size = 20) {
  const response = await apiClient.post<
    BackendApiResponse<BackendPageResponse<Conversation>>
  >('/api/v1/conversations/search', { query, page, size });
  return response.data;
}

export async function getUnreadMessageCount() {
  const response = await apiClient.get<BackendApiResponse<{ count: number }>>(
    '/api/v1/conversations/unread-count'
  );
  return response.data.count;
}

// ==================== MESSAGES ====================

export async function getMessages(conversationId: string, page = 0, size = 50) {
  const response = await apiClient.get<
    BackendApiResponse<BackendPageResponse<Message>>
  >(`/api/v1/conversations/${conversationId}/messages`, {
    page: String(page),
    size: String(size),
  });
  return response.data;
}

export async function sendMessage(
  request: CreateMessageRequest
): Promise<SendMessageResponse> {
  const response = await apiClient.post<BackendApiResponse<Message>>(
    '/api/v1/messages',
    request
  );

  const message = response.data;
  const conversation = await getConversationById(message.conversationId);

  return { message, conversation };
}

export async function getMessageById(messageId: string) {
  const response = await apiClient.get<BackendApiResponse<Message>>(
    `/api/v1/messages/${messageId}`
  );
  return response.data;
}

/**
 * Mark single message as read
 * Backend: PATCH /api/v1/messages/{messageId}/read
 */
export async function markMessageAsRead(messageId: string) {
  const response = await apiClient.patch<BackendApiResponse<Message>>(
    `/api/v1/messages/${messageId}/read`
  );
  return response.data;
}

/**
 * Mark all messages in conversation as read (bulk operation)
 * Backend: PATCH /api/v1/messages/conversations/{conversationId}/read-all
 */
export async function markConversationAsRead(conversationId: string) {
  const response = await apiClient.patch<BackendApiResponse<{ count: number }>>(
    `/api/v1/messages/conversations/${conversationId}/read-all`
  );
  return response.data;
}

export async function deleteMessage(messageId: string) {
  await apiClient.delete(`/api/v1/messages/${messageId}`);
}

export async function editMessage(messageId: string, content: string) {
  const response = await apiClient.put<BackendApiResponse<Message>>(
    `/api/v1/messages/${messageId}/edit`,
    { content }
  );
  return response.data;
}

export interface MessageSearchParams {
  query: string;
  conversationId?: string;
  dateFrom?: string;
  dateTo?: string;
  hasAttachment?: boolean;
  attachmentType?: string;
  messageType?: 'text' | 'system' | 'file';
  unreadOnly?: boolean;
  page?: number;
  size?: number;
}

export async function searchMessages(
  query: string,
  conversationId?: string,
  page = 0,
  size = 20
) {
  const params: Record<string, string> = {
    query,
    page: String(page),
    size: String(size),
  };

  if (conversationId) {
    params.conversationId = conversationId;
  }

  const response = await apiClient.get<
    BackendApiResponse<BackendPageResponse<Message>>
  >('/api/v1/messages/search', params);
  return response.data;
}

export async function searchMessagesAdvanced(params: MessageSearchParams) {
  const queryParams: Record<string, string> = {
    query: params.query,
    page: String(params.page || 0),
    size: String(params.size || 20),
  };

  if (params.conversationId) {
    queryParams.conversationId = params.conversationId;
  }
  if (params.dateFrom) {
    queryParams.dateFrom = params.dateFrom;
  }
  if (params.dateTo) {
    queryParams.dateTo = params.dateTo;
  }
  if (params.hasAttachment !== undefined) {
    queryParams.hasAttachment = String(params.hasAttachment);
  }
  if (params.attachmentType) {
    queryParams.attachmentType = params.attachmentType;
  }
  if (params.messageType) {
    queryParams.messageType = params.messageType;
  }
  if (params.unreadOnly !== undefined) {
    queryParams.unreadOnly = String(params.unreadOnly);
  }

  const response = await apiClient.get<
    BackendApiResponse<BackendPageResponse<Message>>
  >('/api/v1/messages/search', queryParams);
  return response.data;
}

// ==================== ATTACHMENTS ====================

export async function uploadAttachment(
  file: File,
  onProgress?: (progress: number) => void
): Promise<MessageAttachment> {
  // Use canonical file upload service
  const { fileUploadService } = await import(
    '@/lib/services/file-upload.service'
  );

  try {
    const result = await fileUploadService.uploadFile(file, {
      endpoint: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/messages/attachments`,
      folder: 'messages',
      authenticated: true,
      onProgress: (progress) => {
        onProgress?.(progress.progress);
      },
    });

    // Map to MessageAttachment type
    return {
      id: result.id,
      messageId: '', // Will be set when message is created
      fileName: result.fileName,
      fileUrl: result.fileUrl,
      fileSize: result.fileSize,
      mimeType: result.fileType,
      uploadedAt: result.uploadedAt,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to upload attachment'
    );
  }
}

export async function deleteAttachment(attachmentId: string) {
  await apiClient.delete(`/api/v1/messages/attachments/${attachmentId}`);
}

// ==================== MESSAGE REACTIONS ====================

export async function addMessageReaction(messageId: string, emoji: string) {
  const response = await apiClient.post<BackendApiResponse<MessageReaction>>(
    `/api/v1/messages/${messageId}/reactions`,
    { emoji }
  );
  return response.data;
}

export async function removeMessageReaction(messageId: string, emoji: string) {
  await apiClient.delete(
    `/api/v1/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`
  );
}

export async function toggleMessageReaction(messageId: string, emoji: string) {
  const response = await apiClient.post<
    BackendApiResponse<MessageReaction | null>
  >(`/api/v1/messages/${messageId}/reactions/toggle`, { emoji });
  return response.data;
}

export async function getMessageReactions(messageId: string) {
  const response = await apiClient.get<BackendApiResponse<MessageReaction[]>>(
    `/api/v1/messages/${messageId}/reactions`
  );
  return response.data;
}

export async function getReactionSummary(messageId: string) {
  const response = await apiClient.get<BackendApiResponse<ReactionSummary[]>>(
    `/api/v1/messages/${messageId}/reactions/summary`
  );
  return response.data;
}

// Reaction summary type for grouped reactions
export interface ReactionSummary {
  emoji: string;
  count: number;
  userIds: string[];
  hasReacted: boolean;
}

// ==================== MESSAGE TEMPLATES ====================

export async function getMessageTemplates() {
  const response = await apiClient.get<
    BackendApiResponse<
      Array<{
        id: string;
        name: string;
        content: string;
        category: string;
      }>
    >
  >('/api/v1/messages/templates');
  return response.data;
}

export async function createMessageTemplate(
  name: string,
  content: string,
  category: string
) {
  await apiClient.post('/api/v1/messages/templates', {
    name,
    content,
    category,
  });
}

export async function deleteMessageTemplate(templateId: string) {
  await apiClient.delete(`/api/v1/messages/templates/${templateId}`);
}
