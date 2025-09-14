import { User } from '../core/base';
import { PaginationMeta } from '../utils/api';

// Chat Types
export interface ChatSession {
  id: string;
  participants: User[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  metadata?: {
    jobId?: string;
    orderId?: string;
    subject?: string;
  };
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  attachments?: ChatAttachment[];
  isRead: boolean;
  isEdited: boolean;
  replyTo?: string;
  timestamp: string;
  editedAt?: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  thumbnailUrl?: string;
}

export interface ChatAvailability {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen?: string;
  customMessage?: string;
}

// Conversation Types (alias for ChatSession for compatibility)
export type Conversation = ChatSession;

export interface MessagesResponse {
  messages: ChatMessage[];
  pagination: PaginationMeta;
  hasMore: boolean;
}

export interface ConversationsResponse {
  conversations: ChatSession[];
  pagination: PaginationMeta;
  totalUnread: number;
}

export interface SendMessageRequest {
  sessionId: string;
  content: string;
  type?: 'text' | 'image' | 'file';
  attachments?: File[];
  replyTo?: string;
}

export interface CreateConversationRequest {
  participantIds: string[];
  initialMessage?: string;
  metadata?: {
    jobId?: string;
    orderId?: string;
    subject?: string;
  };
}

export interface MessageSearchResponse {
  messages: ChatMessage[];
  pagination: PaginationMeta;
  totalResults: number;
  query: string;
}

export interface ChatConversation extends ChatSession {
  // Additional properties for chat conversation
  isPinned?: boolean;
  isMuted?: boolean;
  customName?: string;
}
