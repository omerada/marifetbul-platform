// Consolidated messaging types
import { User, FileAttachment } from '../core/base';
import { PaginationMeta } from '../utils/api';

// Legacy compatibility types
export type ChatMessage = Message;
export type ChatConversation = Conversation;

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
  receiverId?: string; // Made optional for MSW compatibility
  content: string;
  type: MessageType;
  attachments?: FileAttachment[];
  isRead: boolean;
  isEdited?: boolean; // Made optional for MSW compatibility
  sentAt: string;
  createdAt: string; // For MSW compatibility
  readAt?: string;
  editedAt?: string;
  replyTo?: string;
  reactions?: MessageReaction[];
  sender?: User; // For MSW compatibility (backward compatibility with API handlers)
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
  type?: 'direct' | 'group' | 'support' | 'order'; // Made optional for MSW compatibility
  title?: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean; // Made optional for MSW compatibility
  isMuted?: boolean; // Made optional for MSW compatibility
  settings?: ConversationSettings; // Made optional for MSW compatibility
  // MSW and store compatibility fields
  lastActivity?: string;
  isPinned?: boolean;
  jobId?: string;
  packageId?: string;
  orderId?: string; // For component compatibility
  metadata?: Record<string, unknown>; // For MSW compatibility
}

export interface ConversationParticipant {
  userId: string;
  user?: User; // Optional for backward compatibility
  role?: 'member' | 'admin' | 'owner'; // Optional for MSW compatibility
  joinedAt?: string; // Optional for MSW compatibility
  lastSeenAt?: string;
  lastReadAt?: string; // For MSW compatibility
  permissions?: ConversationPermissions; // Optional for MSW compatibility
  // MSW compatibility fields - directly from User for backward compatibility
  id?: string; // From User
  email?: string; // From User
  name?: string; // From User
  firstName?: string; // From User
  lastName?: string; // From User
  avatar?: string; // From User
  userType?: 'freelancer' | 'employer' | 'admin'; // From User
  accountStatus?: string; // From User
  verificationStatus?: string; // From User
  verificationBadges?: string[]; // From User
  createdAt?: string; // From User
  updatedAt?: string; // From User
  isTyping?: boolean; // For messaging
  isOnline?: boolean; // For messaging
  location?: string; // For component compatibility
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
