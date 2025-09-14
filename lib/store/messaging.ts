/**
 * Messaging Store - Production Ready
 * Re-exports the optimized messaging store from domains
 */

// Re-export the optimized messaging store
export {
  useMessagingStore,
  useConversations,
  useCurrentConversation,
  useConversationById,
  useMessagesByConversation,
  useCurrentMessages,
  useTypingUsersInConversation,
  useSearchResults,
  useConversationStatus,
  useTotalUnreadCount,
} from './domains/messaging/MessagingStore';

// Default export for compatibility
export { useMessagingStore as default } from './domains/messaging/MessagingStore';
