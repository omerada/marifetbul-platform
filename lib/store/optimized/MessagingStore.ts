import React from 'react';
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// ================================================
// OPTIMIZED MESSAGING STORE - PRODUCTION READY
// ================================================
// Memory leak fixes and performance optimizations for messaging store

import type {
  ChatMessage,
  ChatConversation,
  MessagesResponse,
  ConversationsResponse,
  SendMessageRequest,
  CreateConversationRequest,
  MessageSearchResponse,
  MessageSearchResult,
  PaginationMeta,
} from '@/types';

interface TypingStatus {
  userId: string;
  conversationId: string;
  isTyping: boolean;
  timestamp: number;
}

interface MessagingState {
  // Data
  conversations: ChatConversation[];
  messages: Record<string, ChatMessage[]>;
  currentConversation: ChatConversation | null;

  // UI State
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  searchQuery: string;
  searchResults: MessageSearchResult[];
  isSearching: boolean;

  // Pagination
  conversationsPagination: PaginationMeta | null;
  messagesPagination: Record<string, PaginationMeta>;

  // Errors
  error: string | null;

  // Real-time features (optimized for memory)
  typingStatuses: TypingStatus[];
  onlineUsers: string[]; // Changed from Set to Array for better serialization

  // Performance tracking
  lastFetchTime: Record<string, number>;
  totalUnreadCount: number;
}

interface MessagingActions {
  // Conversation actions
  loadConversations: () => Promise<void>;
  loadMoreConversations: () => Promise<void>;
  setCurrentConversation: (conversation: ChatConversation | null) => void;
  createConversation: (
    request: CreateConversationRequest
  ) => Promise<ChatConversation | null>;

  // Message actions
  loadMessages: (conversationId: string) => Promise<void>;
  loadMoreMessages: (conversationId: string) => Promise<void>;
  sendMessage: (
    conversationId: string,
    request: SendMessageRequest
  ) => Promise<ChatMessage | null>;
  markMessagesAsRead: (conversationId: string) => Promise<void>;

  // Search actions
  searchMessages: (query: string) => Promise<void>;
  clearSearch: () => void;

  // Real-time updates (optimized)
  handleNewMessage: (message: ChatMessage) => void;
  updateTypingStatus: (
    conversationId: string,
    userId: string,
    isTyping: boolean
  ) => void;
  updateUserOnlineStatus: (userId: string, isOnline: boolean) => void;

  // Cleanup and optimization
  clearOldTypingStatuses: () => void;
  optimizeMemory: () => void;
  clearError: () => void;
  reset: () => void;
}

type MessagingStore = MessagingState & MessagingActions;

const TYPING_TIMEOUT = 5000; // 5 seconds
const MAX_MESSAGES_PER_CONVERSATION = 100; // Limit to prevent memory issues
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

const initialState: MessagingState = {
  conversations: [],
  messages: {},
  currentConversation: null,
  isLoadingConversations: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  searchQuery: '',
  searchResults: [],
  isSearching: false,
  conversationsPagination: null,
  messagesPagination: {},
  error: null,
  typingStatuses: [],
  onlineUsers: [],
  lastFetchTime: {},
  totalUnreadCount: 0,
};

export const useOptimizedMessagingStore = create<MessagingStore>()(
  subscribeWithSelector(
    devtools(
      immer((set, get) => ({
        ...initialState,

        // Optimized conversation loading with caching
        loadConversations: async () => {
          const state = get();
          const now = Date.now();
          const lastFetch = state.lastFetchTime.conversations || 0;

          // Skip if recently fetched
          if (
            now - lastFetch < CACHE_TIMEOUT &&
            state.conversations.length > 0
          ) {
            return;
          }

          set((draft) => {
            draft.isLoadingConversations = true;
            draft.error = null;
          });

          try {
            const response = await fetch('/api/conversations');
            if (!response.ok) throw new Error('Failed to load conversations');

            const data: ConversationsResponse = await response.json();

            set((draft) => {
              draft.conversations = data.conversations;
              draft.conversationsPagination = data.pagination;
              draft.totalUnreadCount = data.conversations.reduce(
                (sum, conv) => sum + (conv.unreadCount || 0),
                0
              );
              draft.lastFetchTime.conversations = now;
              draft.isLoadingConversations = false;
            });
          } catch (error) {
            set((draft) => {
              draft.error =
                error instanceof Error ? error.message : 'Unknown error';
              draft.isLoadingConversations = false;
            });
          }
        },

        loadMoreConversations: async () => {
          const { conversationsPagination } = get();
          if (!conversationsPagination?.hasNext) return;

          set((draft) => {
            draft.isLoadingConversations = true;
          });

          try {
            const response = await fetch(
              `/api/conversations?page=${conversationsPagination.page + 1}&pageSize=${conversationsPagination.pageSize}`
            );
            if (!response.ok)
              throw new Error('Failed to load more conversations');

            const data: ConversationsResponse = await response.json();

            set((draft) => {
              draft.conversations.push(...data.conversations);
              draft.conversationsPagination = data.pagination;
              draft.isLoadingConversations = false;
            });
          } catch (error) {
            set((draft) => {
              draft.error =
                error instanceof Error ? error.message : 'Unknown error';
              draft.isLoadingConversations = false;
            });
          }
        },

        setCurrentConversation: (conversation) => {
          set((draft) => {
            draft.currentConversation = conversation;
          });
        },

        createConversation: async (request) => {
          try {
            const response = await fetch('/api/conversations', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(request),
            });

            if (!response.ok) throw new Error('Failed to create conversation');

            const { data: conversation } = await response.json();

            set((draft) => {
              draft.conversations.unshift(conversation);
              draft.currentConversation = conversation;
            });

            return conversation;
          } catch (error) {
            set((draft) => {
              draft.error =
                error instanceof Error ? error.message : 'Unknown error';
            });
            return null;
          }
        },

        // Optimized message loading with memory management
        loadMessages: async (conversationId) => {
          const state = get();
          const now = Date.now();
          const cacheKey = `messages_${conversationId}`;
          const lastFetch = state.lastFetchTime[cacheKey] || 0;

          // Skip if recently fetched
          if (
            now - lastFetch < CACHE_TIMEOUT &&
            state.messages[conversationId]?.length > 0
          ) {
            return;
          }

          set((draft) => {
            draft.isLoadingMessages = true;
            draft.error = null;
          });

          try {
            const response = await fetch(
              `/api/conversations/${conversationId}/messages`
            );
            if (!response.ok) throw new Error('Failed to load messages');

            const data: MessagesResponse = await response.json();

            set((draft) => {
              // Limit messages to prevent memory issues
              const limitedMessages = data.messages.slice(
                -MAX_MESSAGES_PER_CONVERSATION
              );
              draft.messages[conversationId] = limitedMessages;
              draft.messagesPagination[conversationId] = data.pagination;
              draft.lastFetchTime[cacheKey] = now;
              draft.isLoadingMessages = false;
            });
          } catch (error) {
            set((draft) => {
              draft.error =
                error instanceof Error ? error.message : 'Unknown error';
              draft.isLoadingMessages = false;
            });
          }
        },

        loadMoreMessages: async (conversationId) => {
          const { messagesPagination } = get();
          const pagination = messagesPagination[conversationId];
          if (!pagination?.hasNext) return;

          set((draft) => {
            draft.isLoadingMessages = true;
          });

          try {
            const response = await fetch(
              `/api/conversations/${conversationId}/messages?page=${pagination.page + 1}&pageSize=${pagination.pageSize}`
            );
            if (!response.ok) throw new Error('Failed to load more messages');

            const data: MessagesResponse = await response.json();

            set((draft) => {
              const existingMessages = draft.messages[conversationId] || [];
              const allMessages = [...data.messages, ...existingMessages];

              // Keep only recent messages to prevent memory bloat
              draft.messages[conversationId] = allMessages.slice(
                -MAX_MESSAGES_PER_CONVERSATION
              );
              draft.messagesPagination[conversationId] = data.pagination;
              draft.isLoadingMessages = false;
            });
          } catch (error) {
            set((draft) => {
              draft.error =
                error instanceof Error ? error.message : 'Unknown error';
              draft.isLoadingMessages = false;
            });
          }
        },

        sendMessage: async (conversationId, request) => {
          set((draft) => {
            draft.isSendingMessage = true;
            draft.error = null;
          });

          try {
            const response = await fetch(
              `/api/conversations/${conversationId}/messages`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(request),
              }
            );

            if (!response.ok) throw new Error('Failed to send message');

            const { data: message } = await response.json();

            set((draft) => {
              // Add message to conversation
              if (!draft.messages[conversationId]) {
                draft.messages[conversationId] = [];
              }
              draft.messages[conversationId].push(message);

              // Limit messages
              if (
                draft.messages[conversationId].length >
                MAX_MESSAGES_PER_CONVERSATION
              ) {
                draft.messages[conversationId] = draft.messages[
                  conversationId
                ].slice(-MAX_MESSAGES_PER_CONVERSATION);
              }

              // Update conversation's last message
              const convIndex = draft.conversations.findIndex(
                (c) => c.id === conversationId
              );
              if (convIndex !== -1) {
                draft.conversations[convIndex].lastMessage = message;
              }

              draft.isSendingMessage = false;
            });

            return message;
          } catch (error) {
            set((draft) => {
              draft.error =
                error instanceof Error ? error.message : 'Unknown error';
              draft.isSendingMessage = false;
            });
            return null;
          }
        },

        markMessagesAsRead: async (conversationId) => {
          try {
            const response = await fetch(
              `/api/conversations/${conversationId}/read`,
              {
                method: 'POST',
              }
            );

            if (!response.ok)
              throw new Error('Failed to mark messages as read');

            set((draft) => {
              // Update conversation unread count
              const convIndex = draft.conversations.findIndex(
                (c) => c.id === conversationId
              );
              if (convIndex !== -1) {
                const prevUnreadCount =
                  draft.conversations[convIndex].unreadCount || 0;
                draft.conversations[convIndex].unreadCount = 0;
                draft.totalUnreadCount = Math.max(
                  0,
                  draft.totalUnreadCount - prevUnreadCount
                );
              }
            });
          } catch (error) {
            set((draft) => {
              draft.error =
                error instanceof Error ? error.message : 'Unknown error';
            });
          }
        },

        searchMessages: async (query) => {
          set((draft) => {
            draft.isSearching = true;
            draft.searchQuery = query;
            draft.error = null;
          });

          try {
            const response = await fetch(
              `/api/messages/search?q=${encodeURIComponent(query)}`
            );
            if (!response.ok) throw new Error('Failed to search messages');

            const data: MessageSearchResponse = await response.json();

            set((draft) => {
              draft.searchResults = data.results;
              draft.isSearching = false;
            });
          } catch (error) {
            set((draft) => {
              draft.error =
                error instanceof Error ? error.message : 'Unknown error';
              draft.isSearching = false;
            });
          }
        },

        clearSearch: () => {
          set((draft) => {
            draft.searchQuery = '';
            draft.searchResults = [];
          });
        },

        // Optimized real-time updates
        handleNewMessage: (message) => {
          set((draft) => {
            const conversationId = message.conversationId;

            // Add message
            if (!draft.messages[conversationId]) {
              draft.messages[conversationId] = [];
            }
            draft.messages[conversationId].push(message);

            // Limit messages
            if (
              draft.messages[conversationId].length >
              MAX_MESSAGES_PER_CONVERSATION
            ) {
              draft.messages[conversationId] = draft.messages[
                conversationId
              ].slice(-MAX_MESSAGES_PER_CONVERSATION);
            }

            // Update conversation
            const convIndex = draft.conversations.findIndex(
              (c) => c.id === conversationId
            );
            if (convIndex !== -1) {
              draft.conversations[convIndex].lastMessage = message;
              draft.conversations[convIndex].unreadCount =
                (draft.conversations[convIndex].unreadCount || 0) + 1;
              draft.totalUnreadCount += 1;
            }
          });
        },

        updateTypingStatus: (conversationId, userId, isTyping) => {
          set((draft) => {
            const now = Date.now();

            // Remove existing typing status for this user in this conversation
            draft.typingStatuses = draft.typingStatuses.filter(
              (status) =>
                !(
                  status.conversationId === conversationId &&
                  status.userId === userId
                )
            );

            // Add new typing status if typing
            if (isTyping) {
              draft.typingStatuses.push({
                conversationId,
                userId,
                isTyping,
                timestamp: now,
              });
            }
          });

          // Auto-clear typing status after timeout
          if (isTyping) {
            setTimeout(() => {
              get().clearOldTypingStatuses();
            }, TYPING_TIMEOUT);
          }
        },

        updateUserOnlineStatus: (userId, isOnline) => {
          set((draft) => {
            const userIndex = draft.onlineUsers.indexOf(userId);

            if (isOnline && userIndex === -1) {
              draft.onlineUsers.push(userId);
            } else if (!isOnline && userIndex !== -1) {
              draft.onlineUsers.splice(userIndex, 1);
            }
          });
        },

        // Memory optimization methods
        clearOldTypingStatuses: () => {
          set((draft) => {
            const now = Date.now();
            draft.typingStatuses = draft.typingStatuses.filter(
              (status) => now - status.timestamp < TYPING_TIMEOUT
            );
          });
        },

        optimizeMemory: () => {
          set((draft) => {
            // Clear old message caches
            const now = Date.now();
            Object.keys(draft.lastFetchTime).forEach((key) => {
              if (now - draft.lastFetchTime[key] > CACHE_TIMEOUT * 2) {
                delete draft.lastFetchTime[key];
              }
            });

            // Limit messages in each conversation
            Object.keys(draft.messages).forEach((conversationId) => {
              if (
                draft.messages[conversationId].length >
                MAX_MESSAGES_PER_CONVERSATION
              ) {
                draft.messages[conversationId] = draft.messages[
                  conversationId
                ].slice(-MAX_MESSAGES_PER_CONVERSATION);
              }
            });

            // Clear old typing statuses
            const typingCutoff = now - TYPING_TIMEOUT;
            draft.typingStatuses = draft.typingStatuses.filter(
              (status) => status.timestamp > typingCutoff
            );
          });
        },

        clearError: () => {
          set((draft) => {
            draft.error = null;
          });
        },

        reset: () => {
          set(() => ({ ...initialState }));
        },
      })),
      { name: 'optimized-messaging-store' }
    )
  )
);

// ================================================
// OPTIMIZED SELECTORS
// ================================================
// Memoized selectors to prevent unnecessary re-renders

export const useMessagingConversations = () =>
  useOptimizedMessagingStore((state) => state.conversations);

export const useMessagingMessages = (conversationId?: string) =>
  useOptimizedMessagingStore((state) =>
    conversationId ? state.messages[conversationId] || [] : []
  );

export const useMessagingLoading = () =>
  useOptimizedMessagingStore((state) => ({
    isLoadingConversations: state.isLoadingConversations,
    isLoadingMessages: state.isLoadingMessages,
    isSendingMessage: state.isSendingMessage,
    isSearching: state.isSearching,
  }));

export const useMessagingError = () =>
  useOptimizedMessagingStore((state) => state.error);

export const useMessagingCurrentConversation = () =>
  useOptimizedMessagingStore((state) => state.currentConversation);

export const useMessagingSearch = () =>
  useOptimizedMessagingStore((state) => ({
    searchQuery: state.searchQuery,
    searchResults: state.searchResults,
    isSearching: state.isSearching,
  }));

export const useMessagingTypingStatuses = (conversationId: string) =>
  useOptimizedMessagingStore((state) =>
    state.typingStatuses.filter(
      (status) => status.conversationId === conversationId
    )
  );

export const useMessagingOnlineUsers = () =>
  useOptimizedMessagingStore((state) => state.onlineUsers);

export const useMessagingUnreadCount = () =>
  useOptimizedMessagingStore((state) => state.totalUnreadCount);

export const useMessagingActions = () =>
  useOptimizedMessagingStore((state) => ({
    loadConversations: state.loadConversations,
    loadMoreConversations: state.loadMoreConversations,
    setCurrentConversation: state.setCurrentConversation,
    createConversation: state.createConversation,
    loadMessages: state.loadMessages,
    loadMoreMessages: state.loadMoreMessages,
    sendMessage: state.sendMessage,
    markMessagesAsRead: state.markMessagesAsRead,
    searchMessages: state.searchMessages,
    clearSearch: state.clearSearch,
    handleNewMessage: state.handleNewMessage,
    updateTypingStatus: state.updateTypingStatus,
    updateUserOnlineStatus: state.updateUserOnlineStatus,
    clearOldTypingStatuses: state.clearOldTypingStatuses,
    optimizeMemory: state.optimizeMemory,
    clearError: state.clearError,
    reset: state.reset,
  }));

// ================================================
// MEMORY MANAGEMENT HOOK
// ================================================
// Hook to automatically optimize memory usage

export function useMessagingMemoryManager() {
  const optimizeMemory = useOptimizedMessagingStore(
    (state) => state.optimizeMemory
  );
  const clearOldTypingStatuses = useOptimizedMessagingStore(
    (state) => state.clearOldTypingStatuses
  );

  React.useEffect(() => {
    // Cleanup interval
    const cleanupInterval = setInterval(() => {
      clearOldTypingStatuses();
    }, TYPING_TIMEOUT);

    // Memory optimization interval
    const memoryInterval = setInterval(() => {
      optimizeMemory();
    }, CACHE_TIMEOUT);

    return () => {
      clearInterval(cleanupInterval);
      clearInterval(memoryInterval);
    };
  }, [optimizeMemory, clearOldTypingStatuses]);
}

// ================================================
// PERSISTENCE OPTIMIZATION
// ================================================
// Only persist essential data to localStorage

export const messagingPersistConfig = {
  name: 'messaging-store',
  partialize: (state: MessagingState) => ({
    conversations: state.conversations.slice(0, 50), // Limit persisted conversations
    messages: Object.fromEntries(
      Object.entries(state.messages).map(([id, messages]) => [
        id,
        messages.slice(-20), // Limit persisted messages per conversation
      ])
    ),
    totalUnreadCount: state.totalUnreadCount,
  }),
};

export default useOptimizedMessagingStore;
