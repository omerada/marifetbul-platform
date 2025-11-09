/**
 * ============================================================================
 * DISPUTE MESSAGES API - Real-time Messaging for Disputes
 * ============================================================================
 * API client for dispute messaging system with WebSocket support
 *
 * Features:
 * - Send & receive messages
 * - File attachments
 * - Admin participation
 * - Message history
 * - Typing indicators (via WebSocket)
 * - Read receipts
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created December 2024
 * @sprint Security & Settings Sprint - Story 5
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Message sender type
 */
export enum MessageSenderType {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  ADMIN = 'ADMIN',
}

/**
 * Message status
 */
export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
}

/**
 * Dispute message
 */
export interface DisputeMessage {
  id: string;
  disputeId: string;
  senderId: string;
  senderName: string;
  senderType: MessageSenderType;
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
  status: MessageStatus;
  createdAt: string;
  readAt?: string;
}

/**
 * Send message request
 */
export interface SendMessageRequest {
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
  attachmentType?: string;
}

/**
 * Message list response
 */
export interface MessageListResponse {
  messages: DisputeMessage[];
  total: number;
  hasMore: boolean;
}

/**
 * Typing indicator
 */
export interface TypingIndicator {
  disputeId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get messages for a dispute with pagination
 *
 * @param disputeId - Dispute ID
 * @param page - Page number (0-based)
 * @param size - Page size
 * @returns Promise<MessageListResponse>
 *
 * @example
 * ```ts
 * const messages = await getDisputeMessages('dispute-123', 0, 20);
 * ```
 */
export async function getDisputeMessages(
  disputeId: string,
  page: number = 0,
  size: number = 50
): Promise<MessageListResponse> {
  try {
    logger.debug('disputeMessagesApi.getDisputeMessages: Fetching', {
      disputeId,
      page,
      size,
    });

    const response = await apiClient.get<MessageListResponse>(
      `/disputes/${disputeId}/messages`,
      { page: String(page), size: String(size) }
    );

    logger.info('disputeMessagesApi.getDisputeMessages: Success', {
      disputeId,
      count: response.messages.length,
      total: response.total,
    });

    return response;
  } catch (error) {
    logger.error(
      'disputeMessagesApi.getDisputeMessages: Failed',
      error as Error
    );
    throw error;
  }
}

/**
 * Send a message in a dispute
 *
 * @param disputeId - Dispute ID
 * @param request - Message content and optional attachment
 * @returns Promise<DisputeMessage>
 *
 * @example
 * ```ts
 * const message = await sendDisputeMessage('dispute-123', {
 *   content: 'Here is the proof',
 *   attachmentUrl: 'https://...'
 * });
 * ```
 */
export async function sendDisputeMessage(
  disputeId: string,
  request: SendMessageRequest
): Promise<DisputeMessage> {
  try {
    logger.debug('disputeMessagesApi.sendDisputeMessage: Sending', {
      disputeId,
      hasAttachment: !!request.attachmentUrl,
    });

    const response = await apiClient.post<DisputeMessage>(
      `/disputes/${disputeId}/messages`,
      request
    );

    logger.info('disputeMessagesApi.sendDisputeMessage: Success', {
      disputeId,
      messageId: response.id,
    });

    return response;
  } catch (error) {
    logger.error(
      'disputeMessagesApi.sendDisputeMessage: Failed',
      error as Error
    );
    throw error;
  }
}

/**
 * Mark message as read
 *
 * @param disputeId - Dispute ID
 * @param messageId - Message ID
 * @returns Promise<void>
 *
 * @example
 * ```ts
 * await markMessageAsRead('dispute-123', 'msg-456');
 * ```
 */
export async function markMessageAsRead(
  disputeId: string,
  messageId: string
): Promise<void> {
  try {
    logger.debug('disputeMessagesApi.markMessageAsRead', {
      disputeId,
      messageId,
    });

    await apiClient.post(`/disputes/${disputeId}/messages/${messageId}/read`);

    logger.info('disputeMessagesApi.markMessageAsRead: Success', {
      disputeId,
      messageId,
    });
  } catch (error) {
    logger.error(
      'disputeMessagesApi.markMessageAsRead: Failed',
      error as Error
    );
    throw error;
  }
}

/**
 * Mark all messages as read in a dispute
 *
 * @param disputeId - Dispute ID
 * @returns Promise<void>
 *
 * @example
 * ```ts
 * await markAllMessagesAsRead('dispute-123');
 * ```
 */
export async function markAllMessagesAsRead(disputeId: string): Promise<void> {
  try {
    logger.debug('disputeMessagesApi.markAllMessagesAsRead', { disputeId });

    await apiClient.post(`/disputes/${disputeId}/messages/read-all`);

    logger.info('disputeMessagesApi.markAllMessagesAsRead: Success', {
      disputeId,
    });
  } catch (error) {
    logger.error(
      'disputeMessagesApi.markAllMessagesAsRead: Failed',
      error as Error
    );
    throw error;
  }
}

/**
 * Get unread message count for a dispute
 *
 * @param disputeId - Dispute ID
 * @returns Promise<number>
 *
 * @example
 * ```ts
 * const unreadCount = await getUnreadCount('dispute-123');
 * ```
 */
export async function getUnreadCount(disputeId: string): Promise<number> {
  try {
    logger.debug('disputeMessagesApi.getUnreadCount', { disputeId });

    const response = await apiClient.get<{ count: number }>(
      `/disputes/${disputeId}/messages/unread-count`
    );

    logger.info('disputeMessagesApi.getUnreadCount: Success', {
      disputeId,
      count: response.count,
    });

    return response.count;
  } catch (error) {
    logger.error('disputeMessagesApi.getUnreadCount: Failed', error as Error);
    throw error;
  }
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Format message timestamp
 */
export function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return 'Şimdi';
  if (diffInMinutes < 60) return `${diffInMinutes} dk önce`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} saat önce`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} gün önce`;

  return date.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Check if message is from admin
 */
export function isAdminMessage(message: DisputeMessage): boolean {
  return message.senderType === MessageSenderType.ADMIN;
}

/**
 * Check if message has attachment
 */
export function hasAttachment(message: DisputeMessage): boolean {
  return !!message.attachmentUrl;
}

/**
 * Get sender badge color
 */
export function getSenderBadgeColor(senderType: MessageSenderType): string {
  const colors: Record<MessageSenderType, string> = {
    [MessageSenderType.BUYER]: 'bg-blue-100 text-blue-800',
    [MessageSenderType.SELLER]: 'bg-purple-100 text-purple-800',
    [MessageSenderType.ADMIN]: 'bg-red-100 text-red-800',
  };
  return colors[senderType];
}

/**
 * Get sender label
 */
export function getSenderLabel(senderType: MessageSenderType): string {
  const labels: Record<MessageSenderType, string> = {
    [MessageSenderType.BUYER]: 'Alıcı',
    [MessageSenderType.SELLER]: 'Satıcı',
    [MessageSenderType.ADMIN]: 'Yönetim',
  };
  return labels[senderType];
}

// ============================================================================
// WEBSOCKET TOPICS
// ============================================================================

/**
 * Get WebSocket topic for dispute messages
 */
export function getDisputeMessagesTopic(disputeId: string): string {
  return `/topic/disputes/${disputeId}/messages`;
}

/**
 * Get WebSocket topic for typing indicators
 */
export function getTypingTopic(disputeId: string): string {
  return `/topic/disputes/${disputeId}/typing`;
}

/**
 * Get WebSocket destination for sending typing indicator
 */
export function getTypingDestination(disputeId: string): string {
  return `/app/disputes/${disputeId}/typing`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export const disputeMessagesApi = {
  getDisputeMessages,
  sendDisputeMessage,
  markMessageAsRead,
  markAllMessagesAsRead,
  getUnreadCount,
  // Helpers
  formatMessageTime,
  isAdminMessage,
  hasAttachment,
  getSenderBadgeColor,
  getSenderLabel,
  // WebSocket
  getDisputeMessagesTopic,
  getTypingTopic,
  getTypingDestination,
};
