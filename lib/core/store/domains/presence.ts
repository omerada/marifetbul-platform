import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

/**
 * Presence Domain Store
 * Handles user online status, typing indicators, and real-time presence
 * Separated for better real-time performance
 */
interface TypingStatus {
  userId: string;
  conversationId: string;
  isTyping: boolean;
  timestamp: string;
}

interface PresenceState {
  // Online status
  onlineUsers: Set<string>;

  // Typing indicators
  typingStatuses: TypingStatus[];

  // User activity
  lastSeen: Record<string, string>;

  // Connection status
  isConnected: boolean;
  connectionStatus:
    | 'connecting'
    | 'connected'
    | 'disconnected'
    | 'reconnecting';
}

interface PresenceActions {
  // Online status management
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  updateUserPresence: (userId: string, status: 'online' | 'offline') => void;

  // Typing indicators
  setTypingStatus: (
    conversationId: string,
    userId: string,
    isTyping: boolean
  ) => void;
  clearTypingStatus: (conversationId: string, userId: string) => void;
  getTypingUsers: (conversationId: string) => string[];

  // Last seen management
  updateLastSeen: (userId: string, timestamp?: string) => void;

  // Connection management
  setConnectionStatus: (status: PresenceState['connectionStatus']) => void;
  handleConnect: () => void;
  handleDisconnect: () => void;
  handleReconnect: () => void;

  // Cleanup
  reset: () => void;
}

type PresenceStore = PresenceState & PresenceActions;

export const usePresenceStore = create<PresenceStore>()(
  immer((set, get) => ({
    // Initial state
    onlineUsers: new Set(),
    typingStatuses: [],
    lastSeen: {},
    isConnected: false,
    connectionStatus: 'disconnected',

    // Online status actions
    setUserOnline: (userId) => {
      set((state) => {
        state.onlineUsers.add(userId);
        state.lastSeen[userId] = new Date().toISOString();
      });
    },

    setUserOffline: (userId) => {
      set((state) => {
        state.onlineUsers.delete(userId);
        state.lastSeen[userId] = new Date().toISOString();

        // Clear typing status when user goes offline
        state.typingStatuses = state.typingStatuses.filter(
          (status) => status.userId !== userId
        );
      });
    },

    updateUserPresence: (userId, status) => {
      if (status === 'online') {
        get().setUserOnline(userId);
      } else {
        get().setUserOffline(userId);
      }
    },

    // Typing indicator actions
    setTypingStatus: (conversationId, userId, isTyping) => {
      set((state) => {
        // Remove existing typing status for this user in this conversation
        state.typingStatuses = state.typingStatuses.filter(
          (status) =>
            !(
              status.userId === userId &&
              status.conversationId === conversationId
            )
        );

        // Add new typing status if user is typing
        if (isTyping) {
          state.typingStatuses.push({
            userId,
            conversationId,
            isTyping: true,
            timestamp: new Date().toISOString(),
          });
        }
      });

      // Auto-clear typing status after 3 seconds
      if (isTyping) {
        setTimeout(() => {
          get().clearTypingStatus(conversationId, userId);
        }, 3000);
      }
    },

    clearTypingStatus: (conversationId, userId) => {
      set((state) => {
        state.typingStatuses = state.typingStatuses.filter(
          (status) =>
            !(
              status.userId === userId &&
              status.conversationId === conversationId
            )
        );
      });
    },

    getTypingUsers: (conversationId) => {
      return get()
        .typingStatuses.filter(
          (status) =>
            status.conversationId === conversationId && status.isTyping
        )
        .map((status) => status.userId);
    },

    // Last seen management
    updateLastSeen: (userId, timestamp) => {
      set((state) => {
        state.lastSeen[userId] = timestamp || new Date().toISOString();
      });
    },

    // Connection management
    setConnectionStatus: (status) => {
      set((state) => {
        state.connectionStatus = status;
        state.isConnected = status === 'connected';
      });
    },

    handleConnect: () => {
      set((state) => {
        state.connectionStatus = 'connected';
        state.isConnected = true;
      });
    },

    handleDisconnect: () => {
      set((state) => {
        state.connectionStatus = 'disconnected';
        state.isConnected = false;
        // Clear all online users when disconnected
        state.onlineUsers.clear();
        state.typingStatuses = [];
      });
    },

    handleReconnect: () => {
      set((state) => {
        state.connectionStatus = 'reconnecting';
        state.isConnected = false;
      });
    },

    reset: () => {
      set((state) => {
        state.onlineUsers.clear();
        state.typingStatuses = [];
        state.lastSeen = {};
        state.isConnected = false;
        state.connectionStatus = 'disconnected';
      });
    },
  }))
);

// Selectors for better performance
export const useOnlineUsers = () =>
  usePresenceStore((state) => Array.from(state.onlineUsers));
export const useIsUserOnline = (userId: string) =>
  usePresenceStore((state) => state.onlineUsers.has(userId));

export const useTypingUsers = (conversationId: string) =>
  usePresenceStore((state) => state.getTypingUsers(conversationId));

export const useConnectionStatus = () =>
  usePresenceStore((state) => ({
    isConnected: state.isConnected,
    status: state.connectionStatus,
  }));

export const useLastSeen = (userId: string) =>
  usePresenceStore((state) => state.lastSeen[userId]);

// Action selectors
export const usePresenceActions = () => {
  const store = usePresenceStore();
  return {
    setUserOnline: store.setUserOnline,
    setUserOffline: store.setUserOffline,
    updateUserPresence: store.updateUserPresence,
    setTypingStatus: store.setTypingStatus,
    clearTypingStatus: store.clearTypingStatus,
    getTypingUsers: store.getTypingUsers,
    updateLastSeen: store.updateLastSeen,
    setConnectionStatus: store.setConnectionStatus,
    handleConnect: store.handleConnect,
    handleDisconnect: store.handleDisconnect,
    handleReconnect: store.handleReconnect,
    reset: store.reset,
  };
};
