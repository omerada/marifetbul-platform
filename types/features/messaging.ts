// Consolidated messaging types
import { User, FileAttachment } from '../core/base';
import { PaginationMeta } from '../utils/api';

// Legacy compatibility types
export interface ChatMessage extends Message {}
export interface ChatConversation extends Conversation {}

export interface MessagesResponse {
  messages: Message[];
  pagination: PaginationMeta;
  hasMore: boolean;
}

export interface ConversationsResponse {
  conversations: Conversation[];
  pagination: PaginationMeta;
  totalUnread: number;
}

export interface SendMessageRequest {
  conversationId: string;
  content: string;
  type?: MessageType;
  attachments?: File[];
  replyTo?: string;
}

export interface CreateConversationRequest {
  participantIds: string[];
  type?: 'direct' | 'group' | 'support';
  title?: string;
  initialMessage?: string;
}

export interface MessageSearchResponse {
  messages: Message[];
  pagination: PaginationMeta;
  totalResults: number;
  query: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: MessageType;
  attachments?: FileAttachment[];
  isRead: boolean;
  isEdited: boolean;
  sentAt: string;
  readAt?: string;
  editedAt?: string;
  replyTo?: string;
  reactions?: MessageReaction[];
}

export type MessageType =
  | 'text'
  | 'image'
  | 'file'
  | 'voice'
  | 'video'
  | 'location'
  | 'system';

export interface MessageReaction {
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participants: ConversationParticipant[];
  type: 'direct' | 'group' | 'support';
  title?: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  isArchived: boolean;
  isMuted: boolean;
  settings: ConversationSettings;
}

export interface ConversationParticipant {
  userId: string;
  user: User;
  role: 'member' | 'admin' | 'owner';
  joinedAt: string;
  lastSeenAt?: string;
  permissions: ConversationPermissions;
}

export interface ConversationPermissions {
  canSendMessages: boolean;
  canSendMedia: boolean;
  canInviteUsers: boolean;
  canRemoveUsers: boolean;
  canEditSettings: boolean;
}

export interface ConversationSettings {
  allowInvites: boolean;
  allowMediaSharing: boolean;
  requireApproval: boolean;
  maxParticipants?: number;
  autoDeleteDays?: number;
}

export interface MessageDraft {
  conversationId: string;
  content: string;
  attachments?: File[];
  replyTo?: string;
  updatedAt: string;
}

export interface TypingIndicator {
  conversationId: string;
  userId: string;
  isTyping: boolean;
  timestamp: string;
}

export interface MessageSearch {
  query: string;
  conversationId?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  messageType?: MessageType;
  senderId?: string;
}

export interface MessageSearchResult {
  messages: Message[];
  total: number;
  hasMore: boolean;
  nextCursor?: string;
}

export interface ChatStatus {
  isOnline: boolean;
  lastSeen?: string;
  isTyping: boolean;
}

export interface MessageThread {
  id: string;
  parentMessageId: string;
  messages: Message[];
  participantCount: number;
  lastReplyAt: string;
}

export interface MessageNotification {
  id: string;
  messageId: string;
  conversationId: string;
  userId: string;
  type: 'new_message' | 'mention' | 'reply';
  isRead: boolean;
  createdAt: string;
}
