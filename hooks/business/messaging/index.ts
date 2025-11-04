// ================================================
// CONTEXT-AWARE MESSAGING HOOKS
// ================================================
export { useMessageTemplates } from './useMessageTemplates';
export { useContextMessage } from './useContextMessage';
export { useMessageAttachments } from './useMessageAttachments';
export type { MessageAttachment } from './useMessageAttachments';
export { useConversationSearch } from './useConversationSearch';
export { useReadReceipts } from './useReadReceipts';
export { useAutoMarkAsRead } from './useAutoMarkAsRead';
export { useMessagePagination } from './useMessagePagination';
export type {
  ReadReceiptEvent,
  UseReadReceiptsOptions,
  UseReadReceiptsReturn,
} from './useReadReceipts';
export type {
  UseAutoMarkAsReadOptions,
  UseAutoMarkAsReadReturn,
} from './useAutoMarkAsRead';
export type {
  MessagePaginationState,
  UseMessagePaginationOptions,
  UseMessagePaginationReturn,
} from './useMessagePagination';
export type {
  ConversationSearchRequest,
  ConversationSearchResult,
  ConversationSearchResponse,
} from './useConversationSearch';
export { useMessageNotifications } from './useMessageNotifications';
export type {
  MessageNotification,
  NotificationPermission,
  UseNotificationOptions,
} from './useMessageNotifications';

// ================================================
// CORE MESSAGING HOOKS
// ================================================
export {
  useConversations,
  useConversation,
  useMessages,
  useUnreadCount,
  useMessaging,
  useUnreadMessagesCount,
  type AttachmentInfo,
  type SendMessageOptions,
} from './useMessages';
