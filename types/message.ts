/**
 * Message & Conversation Types
 *
 * Type definitions for real-time messaging system.
 * Aligned with backend MessageResponse and ConversationResponse DTOs.
 *
 * @sprint Sprint 5 - Real-time Messaging
 */

// ==================== MESSAGE TYPES ====================

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  isRead: boolean;
  isEdited: boolean;
  isDeleted: boolean;
  deletedAt?: string;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
  readAt?: string;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  replyTo?: string; // Message ID being replied to
  metadata?: Record<string, unknown>;
}

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
  SYSTEM = 'SYSTEM',
}

export enum MessageStatus {
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
}

export interface MessageAttachment {
  id: string;
  messageId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  duration?: number; // For audio/video
  uploadedAt: string;
}

export interface MessageReaction {
  id: string;
  messageId: string;
  userId: string;
  userName: string;
  emoji: string;
  createdAt: string;
}

// ==================== CONVERSATION TYPES ====================

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantAvatar?: string;
  participantRole: 'freelancer' | 'employer' | 'admin';
  participantOnline: boolean;
  lastSeenAt?: string;
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  isBlocked: boolean;
  contextType?: ConversationContextType;
  contextId?: string;
  contextTitle?: string;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
}

export enum ConversationContextType {
  ORDER = 'ORDER',
  JOB = 'JOB',
  PACKAGE = 'PACKAGE',
  SUPPORT = 'SUPPORT',
  GENERAL = 'GENERAL',
}

// ==================== TYPING INDICATOR ====================

export interface TypingIndicator {
  userId: string;
  userName: string;
  conversationId: string;
  isTyping: boolean;
  timestamp: string;
}

// ==================== PRESENCE ====================

export interface UserPresence {
  userId: string;
  status: PresenceStatus;
  lastSeen?: string;
  device?: string;
}

export enum PresenceStatus {
  ONLINE = 'ONLINE',
  AWAY = 'AWAY',
  BUSY = 'BUSY',
  OFFLINE = 'OFFLINE',
}

// ==================== API REQUEST/RESPONSE ====================

export interface CreateMessageRequest {
  conversationId?: string;
  recipientId?: string;
  content: string;
  type?: MessageType;
  attachments?: string[]; // Attachment IDs
  replyToMessageId?: string;
  contextType?: ConversationContextType;
  contextId?: string;
}

export interface SendMessageResponse {
  message: Message;
  conversation: Conversation;
}

export interface CreateConversationRequest {
  participantId: string;
  contextType?: ConversationContextType;
  contextId?: string;
  initialMessage?: string;
}

export interface MarkMessagesReadRequest {
  messageIds: string[];
  conversationId: string;
}

export interface ConversationSearchRequest {
  query: string;
  page?: number;
  size?: number;
}

// ==================== WEBSOCKET MESSAGE TYPES ====================

export interface WebSocketMessageEvent {
  type: 'NEW_MESSAGE' | 'MESSAGE_UPDATE' | 'MESSAGE_DELETE';
  message: Message;
  conversationId: string;
}

export interface WebSocketTypingEvent {
  type: 'TYPING_START' | 'TYPING_STOP';
  userId: string;
  userName: string;
  conversationId: string;
  timestamp: string;
}

export interface WebSocketPresenceEvent {
  type: 'USER_ONLINE' | 'USER_OFFLINE' | 'USER_AWAY';
  userId: string;
  status: PresenceStatus;
  lastSeen?: string;
}

export interface WebSocketReadReceiptEvent {
  type: 'MESSAGE_READ' | 'MESSAGES_READ';
  messageIds: string[];
  conversationId: string;
  userId: string;
  readAt: string;
}

// ==================== UI STATE ====================

export interface MessageListState {
  messages: Message[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string | null;
}

export interface ConversationListState {
  conversations: Conversation[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
}

export interface MessageInputState {
  text: string;
  attachments: File[];
  replyTo: Message | null;
  isUploading: boolean;
  uploadProgress: number;
}
