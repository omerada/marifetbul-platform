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
export { TypingIndicator } from './TypingIndicator';
export { ConversationSearch } from './ConversationSearch';
export type { ConversationSearchFilters } from './ConversationSearch';

// Message Thread Components (Story 1.4 & 1.5)
export { MessageThread } from './MessageThread';
export { MessageBubble } from './MessageBubble';
export { MessageInput } from './MessageInput';
export { ConversationHeader } from './ConversationHeader';

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
