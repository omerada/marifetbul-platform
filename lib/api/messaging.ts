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
  const response = await apiClient.get<BackendApiResponse<BackendPageResponse<Conversation>>>(
    '/api/v1/conversations',
    { page: String(page), size: String(size) }
  );
  return response.data;
}

export async function getActiveConversations(page = 0, size = 20) {
  const response = await apiClient.get<BackendApiResponse<BackendPageResponse<Conversation>>>(
    '/api/v1/conversations/active',
    { page: String(page), size: String(size) }
  );
  return response.data;
}

export async function getArchivedConversations(page = 0, size = 20) {
  const response = await apiClient.get<BackendApiResponse<BackendPageResponse<Conversation>>>(
    '/api/v1/conversations/archived',
    { page: String(page), size: String(size) }
  );
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
  const response = await apiClient.post<BackendApiResponse<BackendPageResponse<Conversation>>>(
    '/api/v1/conversations/search',
    { query, page, size }
  );
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
  const response = await apiClient.get<BackendApiResponse<BackendPageResponse<Message>>>(
    `/api/v1/conversations/${conversationId}/messages`,
    { page: String(page), size: String(size) }
  );
  return response.data;
}

export async function sendMessage(request: CreateMessageRequest): Promise<SendMessageResponse> {
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

export async function markMessageAsRead(messageId: string) {
  const response = await apiClient.put<BackendApiResponse<Message>>(
    `/api/v1/messages/${messageId}/mark-read`
  );
  return response.data;
}

export async function markConversationAsRead(conversationId: string) {
  await apiClient.put(
    `/api/v1/conversations/${conversationId}/mark-all-read`
  );
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
  
  const response = await apiClient.get<BackendApiResponse<BackendPageResponse<Message>>>(
    '/api/v1/messages/search',
    params
  );
  return response.data;
}

// ==================== ATTACHMENTS ====================

export async function uploadAttachment(
  file: File,
  onProgress?: (progress: number) => void
): Promise<MessageAttachment> {
  const formData = new FormData();
  formData.append('file', file);

  // For file upload, we'll use fetch directly
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  const xhr = new XMLHttpRequest();
  
  return new Promise((resolve, reject) => {
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded * 100) / e.total);
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200 || xhr.status === 201) {
        const response = JSON.parse(xhr.responseText) as BackendApiResponse<MessageAttachment>;
        resolve(response.data);
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL}/api/v1/messages/attachments`);
    
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    
    xhr.send(formData);
  });
}

export async function deleteAttachment(attachmentId: string) {
  await apiClient.delete(`/api/v1/messages/attachments/${attachmentId}`);
}

// ==================== MESSAGE REACTIONS ====================

export async function addMessageReaction(messageId: string, emoji: string) {
  await apiClient.post(`/api/v1/messages/${messageId}/reactions`, { emoji });
}

export async function removeMessageReaction(messageId: string, emoji: string) {
  // Using fetch directly for DELETE with body
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  
  await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/messages/${messageId}/reactions`,
    {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ emoji }),
      credentials: 'include',
    }
  );
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
