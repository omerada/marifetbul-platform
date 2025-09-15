import React, { useCallback } from 'react';
import { useChatStore } from '@/lib/core/store/chat';
import type { ChatSession, ChatAvailability, PaginationMeta } from '@/types';
import type {
  StartChatFormData,
  SendChatMessageFormData,
  ChatFeedbackFormData,
} from '@/lib/core/validations/support';

export interface UseChatReturn {
  // Current Chat Session
  activeChatId: string | null;
  currentSession: ChatSession | null;
  sessionLoading: boolean;
  sessionError: string | null;

  // Messages
  messages: Array<{
    id: string;
    chatId: string;
    from: 'user' | 'agent' | 'system' | 'bot';
    senderId: string;
    sender?: {
      id: string;
      firstName?: string;
      lastName?: string;
      name?: string;
      avatar: string;
    };
    message: string;
    messageType:
      | 'text'
      | 'file'
      | 'image'
      | 'system'
      | 'automated'
      | 'quick_reply'
      | 'card';
    timestamp: string;
    readAt?: string;
    deliveredAt?: string;
    attachments?: Array<{
      id: string;
      name: string;
      url: string;
      type: string;
      size: number;
      thumbnailUrl?: string;
      uploadedAt: string;
    }>;
  }>;
  messagesLoading: boolean;
  messagesError: string | null;
  messagesPagination: PaginationMeta | null;

  // Chat Status
  isConnected: boolean;
  isTyping: boolean;
  queuePosition: number;
  estimatedWaitTime: number;

  // Chat Availability
  availability: ChatAvailability | null;
  availabilityLoading: boolean;

  // Send Message State
  sendMessageLoading: boolean;
  sendMessageError: string | null;

  // Feedback
  feedbackSubmissionLoading: boolean;
  feedbackSubmissionError: string | null;

  // Actions
  checkAvailability: () => Promise<void>;
  startChat: (
    data: StartChatFormData
  ) => Promise<{ success: boolean; chatId?: string }>;
  fetchMessages: (chatId: string, page?: number) => Promise<void>;
  sendMessage: (data: SendChatMessageFormData) => Promise<void>;
  endChat: () => Promise<void>;
  submitFeedback: (data: ChatFeedbackFormData) => Promise<void>;
  setTyping: (isTyping: boolean) => void;
  addMessage: (message: {
    id: string;
    chatId: string;
    from: 'user' | 'agent' | 'system' | 'bot';
    senderId: string;
    message: string;
    messageType:
      | 'text'
      | 'file'
      | 'image'
      | 'system'
      | 'automated'
      | 'quick_reply'
      | 'card';
    timestamp: string;
  }) => void;
  markMessageAsRead: (messageId: string) => void;
  clearCurrentSession: () => void;
  clearError: (
    type: 'session' | 'messages' | 'sendMessage' | 'feedbackSubmission'
  ) => void;
}

/**
 * Custom hook for managing chat operations
 *
 * Provides a clean interface to the chat store with:
 * - Chat session management
 * - Real-time messaging
 * - Queue management
 * - Availability checking
 * - Feedback collection
 *
 * @example
 * ```tsx
 * function ChatWidget() {
 *   const {
 *     isConnected,
 *     messages,
 *     sendMessage,
 *     startChat,
 *     endChat
 *   } = useChat();
 *
 *   const handleStartChat = async () => {
 *     const result = await startChat({
 *       department: 'technical',
 *       priority: 'normal'
 *     });
 *
 *     if (result.success) {
 *       console.log('Chat started:', result.chatId);
 *     }
 *   };
 *
 *   return (
 *     <div className="chat-widget">
 *       {isConnected ? (
 *         <ChatInterface
 *           messages={messages}
 *           onSendMessage={sendMessage}
 *           onEndChat={endChat}
 *         />
 *       ) : (
 *         <button onClick={handleStartChat}>
 *           Start Chat
 *         </button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export const useChat = (): UseChatReturn => {
  const store = useChatStore();

  const checkAvailability = useCallback(async () => {
    await store.checkAvailability();
  }, [store]);

  const startChat = useCallback(
    async (data: StartChatFormData) => {
      return await store.startChat(data);
    },
    [store]
  );

  const fetchMessages = useCallback(
    async (chatId: string, page?: number) => {
      await store.fetchMessages(chatId, page);
    },
    [store]
  );

  const sendMessage = useCallback(
    async (data: SendChatMessageFormData) => {
      await store.sendMessage(data);
    },
    [store]
  );

  const endChat = useCallback(async () => {
    await store.endChat();
  }, [store]);

  const submitFeedback = useCallback(
    async (data: ChatFeedbackFormData) => {
      await store.submitFeedback(data);
    },
    [store]
  );

  const setTyping = useCallback(
    (isTyping: boolean) => {
      store.setTyping(isTyping);
    },
    [store]
  );

  const addMessage = useCallback(
    (message: {
      id: string;
      chatId: string;
      from: 'user' | 'agent' | 'system' | 'bot';
      senderId: string;
      message: string;
      messageType:
        | 'text'
        | 'file'
        | 'image'
        | 'system'
        | 'automated'
        | 'quick_reply'
        | 'card';
      timestamp: string;
    }) => {
      store.addMessage(message);
    },
    [store]
  );

  const markMessageAsRead = useCallback(
    (messageId: string) => {
      store.markMessageAsRead(messageId);
    },
    [store]
  );

  const clearCurrentSession = useCallback(() => {
    store.clearCurrentSession();
  }, [store]);

  const clearError = useCallback(
    (type: 'session' | 'messages' | 'sendMessage' | 'feedbackSubmission') => {
      store.clearError(type);
    },
    [store]
  );

  return {
    // Current Chat Session
    activeChatId: store.activeChatId,
    currentSession: store.currentSession,
    sessionLoading: store.sessionLoading,
    sessionError: store.sessionError,

    // Messages
    messages: store.messages,
    messagesLoading: store.messagesLoading,
    messagesError: store.messagesError,
    messagesPagination: store.messagesPagination,

    // Chat Status
    isConnected: store.isConnected,
    isTyping: store.isTyping,
    queuePosition: store.queuePosition,
    estimatedWaitTime: store.estimatedWaitTime,

    // Chat Availability
    availability: store.availability,
    availabilityLoading: store.availabilityLoading,

    // Send Message State
    sendMessageLoading: store.sendMessageLoading,
    sendMessageError: store.sendMessageError,

    // Feedback
    feedbackSubmissionLoading: store.feedbackSubmissionLoading,
    feedbackSubmissionError: store.feedbackSubmissionError,

    // Actions
    checkAvailability,
    startChat,
    fetchMessages,
    sendMessage,
    endChat,
    submitFeedback,
    setTyping,
    addMessage,
    markMessageAsRead,
    clearCurrentSession,
    clearError,
  };
};

/**
 * Hook for managing an active chat session
 * Automatically manages session lifecycle and message handling
 *
 * @param autoStart - Whether to automatically check availability on mount
 */
export const useChatSession = (autoStart = true) => {
  const {
    activeChatId,
    currentSession,
    isConnected,
    messages,
    queuePosition,
    estimatedWaitTime,
    startChat,
    sendMessage,
    endChat,
    fetchMessages,
    checkAvailability,
    clearCurrentSession,
  } = useChat();

  // Auto-check availability on mount
  React.useEffect(() => {
    if (autoStart) {
      checkAvailability();
    }

    // Cleanup on unmount
    return () => {
      if (isConnected) {
        endChat();
      }
      clearCurrentSession();
    };
  }, [autoStart, checkAvailability, isConnected, endChat, clearCurrentSession]);

  // Auto-fetch messages when chat becomes active
  React.useEffect(() => {
    if (activeChatId && isConnected) {
      fetchMessages(activeChatId);
    }
  }, [activeChatId, isConnected, fetchMessages]);

  const handleSendMessage = useCallback(
    async (
      message: string,
      messageType: 'text' | 'file' | 'image' = 'text'
    ) => {
      if (!activeChatId) return;

      await sendMessage({
        chatId: activeChatId,
        message,
        messageType,
      });
    },
    [activeChatId, sendMessage]
  );

  const handleStartChat = useCallback(
    async (options: Partial<StartChatFormData> = {}) => {
      const defaultOptions: StartChatFormData = {
        department: 'general',
        priority: 'normal',
        ...options,
      };

      return await startChat(defaultOptions);
    },
    [startChat]
  );

  return {
    // Session State
    chatId: activeChatId,
    session: currentSession,
    isConnected,
    messages,
    queuePosition,
    estimatedWaitTime,

    // Actions
    startChat: handleStartChat,
    sendMessage: handleSendMessage,
    endChat,

    // Status
    inQueue: queuePosition > 0,
    hasMessages: messages.length > 0,
  };
};

/**
 * Hook for chat message composition with typing indicators
 * Handles message input, typing status, and send functionality
 */
export const useChatComposer = () => {
  const { sendMessage, setTyping, activeChatId, sendMessageLoading } =
    useChat();

  const [message, setMessage] = React.useState('');
  const [isComposing, setIsComposing] = React.useState(false);
  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Handle typing indicator
  const handleMessageChange = useCallback(
    (value: string) => {
      setMessage(value);

      if (!isComposing && value.trim()) {
        setIsComposing(true);
        setTyping(true);
      }

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        setIsComposing(false);
        setTyping(false);
      }, 2000);
    },
    [isComposing, setTyping]
  );

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!activeChatId || !message.trim() || sendMessageLoading) return;

    const messageToSend = message.trim();
    setMessage('');

    // Stop typing indicator
    setIsComposing(false);
    setTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    await sendMessage({
      chatId: activeChatId,
      message: messageToSend,
      messageType: 'text',
    });
  }, [activeChatId, message, sendMessage, sendMessageLoading, setTyping]);

  // Handle Enter key press
  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    },
    [handleSendMessage]
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isComposing) {
        setTyping(false);
      }
    };
  }, [isComposing, setTyping]);

  return {
    message,
    setMessage: handleMessageChange,
    sendMessage: handleSendMessage,
    handleKeyPress,
    canSend: Boolean(activeChatId && message.trim() && !sendMessageLoading),
    isTyping: isComposing,
    loading: sendMessageLoading,
  };
};
