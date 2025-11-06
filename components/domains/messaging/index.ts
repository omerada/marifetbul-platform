/**
 * Messaging Components
 *
 * Components for messaging and context-aware messaging functionality.
 * Enhanced with real-time WebSocket updates.
 *
 * @sprint Sprint 1 - Real-time Messaging System
 */

// Conversation List Components (Story 1.3)
export { MessagesList } from './MessagesList';
export { ConversationItem } from './ConversationItem';
export { ConversationListHeader } from './ConversationListHeader';
export { ConversationListSkeleton } from './ConversationListSkeleton';
export { ConversationFilters } from './ConversationFilters';
export type { ConversationFiltersState } from './ConversationFilters';
export { TypingIndicator } from './TypingIndicator';
export { ConversationSearch } from './ConversationSearch';
export type { ConversationSearchFilters } from './ConversationSearch';

// Message Thread Components (Story 1.4 & 1.5)
export { MessageThread } from './MessageThread';
export { MessageBubble } from './MessageBubble';
export { MessageInput } from './MessageInput';
export { MessageAttachment } from './MessageAttachment';
export {
  MessageStatusIndicator,
  getMessageStatus,
} from './MessageStatusIndicator';
export type { MessageStatus } from './MessageStatusIndicator';
export { ConversationHeader } from './ConversationHeader';
export { MessageSearch } from './MessageSearch';
export { MessageSearchFilters } from './MessageSearchFilters';
export type { MessageSearchFilters as MessageSearchFiltersType } from './MessageSearchFilters';
export { MessageReactions } from './MessageReactions';

// Context Menu and Modals
export { ConversationContextMenu } from './ConversationContextMenu';
export {
  ConfirmArchiveModal,
  ConfirmUnarchiveModal,
  ConfirmDeleteModal,
} from './ConversationConfirmModals';

// Context-Aware Messaging Components
export { MessageButton } from './MessageButton';
export type { MessageButtonProps } from './MessageButton';

export { QuickMessageModal } from './QuickMessageModal';
export type { QuickMessageModalProps } from './QuickMessageModal';

export { ContextBadge } from './ContextBadge';

export { ContextQuickActions } from './ContextQuickActions';
