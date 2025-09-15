import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { ChatSession, ChatAvailability, PaginationMeta } from '@/types';
import type {
  StartChatFormData,
  SendChatMessageFormData,
  ChatFeedbackFormData,
} from '@/lib/core/validations/support';

// Local chat message type for store
interface ChatMessage {
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
}

interface ChatState {
  // Current Chat Session
  activeChatId: string | null;
  currentSession: ChatSession | null;
  sessionLoading: boolean;
  sessionError: string | null;

  // Messages
  messages: ChatMessage[];
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
  addMessage: (message: ChatMessage) => void;
  markMessageAsRead: (messageId: string) => void;
  clearCurrentSession: () => void;
  clearError: (
    type: 'session' | 'messages' | 'sendMessage' | 'feedbackSubmission'
  ) => void;
}

export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      // Initial state
      activeChatId: null,
      currentSession: null,
      sessionLoading: false,
      sessionError: null,

      messages: [],
      messagesLoading: false,
      messagesError: null,
      messagesPagination: null,

      isConnected: false,
      isTyping: false,
      queuePosition: 0,
      estimatedWaitTime: 0,

      availability: null,
      availabilityLoading: false,

      sendMessageLoading: false,
      sendMessageError: null,

      feedbackSubmissionLoading: false,
      feedbackSubmissionError: null,

      // Actions
      checkAvailability: async () => {
        set({ availabilityLoading: true });

        try {
          const response = await fetch('/api/v1/chat/availability');
          const result = await response.json();

          if (result.success) {
            set({
              availability: result.data,
              availabilityLoading: false,
            });
          } else {
            set({ availabilityLoading: false });
          }
        } catch (error) {
          console.error('Failed to check chat availability:', error);
          set({ availabilityLoading: false });
        }
      },

      startChat: async (data: StartChatFormData) => {
        set({ sessionLoading: true, sessionError: null });

        try {
          const response = await fetch('/api/v1/chat/start', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
          });

          const result = await response.json();

          if (result.success) {
            set({
              activeChatId: result.data.chatId,
              queuePosition: result.data.queuePosition,
              estimatedWaitTime: result.data.estimatedWaitTime,
              isConnected: result.data.queuePosition === 0,
              sessionLoading: false,
            });

            // Start fetching messages for the new chat
            await get().fetchMessages(result.data.chatId);

            return { success: true, chatId: result.data.chatId };
          } else {
            set({
              sessionError: result.error || 'Chat başlatılırken hata oluştu',
              sessionLoading: false,
            });
            return { success: false };
          }
        } catch (error) {
          console.error('Failed to start chat:', error);
          set({
            sessionError: 'Ağ hatası: Chat başlatılamadı',
            sessionLoading: false,
          });
          return { success: false };
        }
      },

      fetchMessages: async (chatId: string, page = 1) => {
        set({ messagesLoading: true, messagesError: null });

        try {
          const response = await fetch(
            `/api/v1/chat/${chatId}/messages?page=${page}&limit=50`
          );
          const result = await response.json();

          if (result.success) {
            set({
              messages:
                page === 1 ? result.data : [...get().messages, ...result.data],
              messagesPagination: result.pagination,
              messagesLoading: false,
            });
          } else {
            set({
              messagesError: result.error || 'Mesajlar yüklenirken hata oluştu',
              messagesLoading: false,
            });
          }
        } catch (error) {
          console.error('Failed to fetch messages:', error);
          set({
            messagesError: 'Ağ hatası: Mesajlar yüklenemedi',
            messagesLoading: false,
          });
        }
      },

      sendMessage: async (data: SendChatMessageFormData) => {
        if (!get().activeChatId) return;

        set({ sendMessageLoading: true, sendMessageError: null });

        try {
          const response = await fetch(`/api/v1/chat/${data.chatId}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: data.message,
              messageType: data.messageType,
              attachments: data.attachments,
              replyTo: data.replyTo,
            }),
          });

          const result = await response.json();

          if (result.success) {
            // Add the sent message to local state
            get().addMessage(result.data);
            set({ sendMessageLoading: false });
          } else {
            set({
              sendMessageError:
                result.error || 'Mesaj gönderilirken hata oluştu',
              sendMessageLoading: false,
            });
          }
        } catch (error) {
          console.error('Failed to send message:', error);
          set({
            sendMessageError: 'Ağ hatası: Mesaj gönderilemedi',
            sendMessageLoading: false,
          });
        }
      },

      endChat: async () => {
        const chatId = get().activeChatId;
        if (!chatId) return;

        try {
          const response = await fetch(`/api/v1/chat/${chatId}/end`, {
            method: 'POST',
          });

          const result = await response.json();

          if (result.success) {
            set({
              isConnected: false,
              activeChatId: null,
              currentSession: null,
            });
          }
        } catch (error) {
          console.error('Failed to end chat:', error);
        }
      },

      submitFeedback: async (data: ChatFeedbackFormData) => {
        set({ feedbackSubmissionLoading: true, feedbackSubmissionError: null });

        try {
          const response = await fetch(`/api/v1/chat/${data.chatId}/feedback`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              rating: data.rating,
              feedback: data.feedback,
              categories: data.categories,
              wouldRecommend: data.wouldRecommend,
            }),
          });

          const result = await response.json();

          if (result.success) {
            set({ feedbackSubmissionLoading: false });
          } else {
            set({
              feedbackSubmissionError:
                result.error || 'Geri bildirim gönderilirken hata oluştu',
              feedbackSubmissionLoading: false,
            });
          }
        } catch (error) {
          console.error('Failed to submit feedback:', error);
          set({
            feedbackSubmissionError: 'Ağ hatası: Geri bildirim gönderilemedi',
            feedbackSubmissionLoading: false,
          });
        }
      },

      setTyping: (isTyping: boolean) => {
        set({ isTyping });
      },

      addMessage: (message: ChatMessage) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },

      markMessageAsRead: (messageId: string) => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === messageId
              ? { ...msg, readAt: new Date().toISOString() }
              : msg
          ),
        }));
      },

      clearCurrentSession: () => {
        set({
          activeChatId: null,
          currentSession: null,
          messages: [],
          isConnected: false,
          queuePosition: 0,
          estimatedWaitTime: 0,
          sessionError: null,
          messagesError: null,
          sendMessageError: null,
        });
      },

      clearError: (type) => {
        switch (type) {
          case 'session':
            set({ sessionError: null });
            break;
          case 'messages':
            set({ messagesError: null });
            break;
          case 'sendMessage':
            set({ sendMessageError: null });
            break;
          case 'feedbackSubmission':
            set({ feedbackSubmissionError: null });
            break;
        }
      },
    }),
    {
      name: 'chat-store',
    }
  )
);
