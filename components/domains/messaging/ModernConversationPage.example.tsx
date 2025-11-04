/**
 * Modern Conversation Page - Refactored
 *
 * Uses new modular components:
 * - ConversationHeader
 * - MessageThread
 * - MessageInput
 *
 * With real-time WebSocket updates from Story 1.2
 *
 * @sprint Sprint 1 - Stories 1.4 & 1.5
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppLayout } from '@/components/layout';
import { Loading } from '@/components/ui';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { useMessagingStore } from '@/lib/core/store/domains/messaging/MessagingStore';
import { useWebSocket } from '@/hooks/infrastructure/websocket/useWebSocket';
import {
  ConversationHeader,
  MessageThread,
  MessageInput,
} from '@/components/domains/messaging';
import { logger } from '@/lib/shared/utils/logger';
import {
  getConversationById,
  getMessages,
  sendMessage as apiSendMessage,
  markConversationAsRead,
} from '@/lib/api/messaging';
import type {
  Conversation,
  Message,
} from '@/types/business/features/messaging';
import type { MessageAttachment } from '@/hooks/business/messaging/useMessageAttachments';

export default function ModernConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const conversationId = params?.id as string;

  // Local state
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Store state
  const typingUsers = useMessagingStore(
    (state) => state.typingUsers[conversationId] || []
  );

  // WebSocket connection (auto-enabled from Story 1.2)
  const { isConnected, send: wsSend } = useWebSocket({
    autoConnect: true,
    enableStoreIntegration: true,
  });

  // Load conversation and messages
  useEffect(() => {
    if (!conversationId || !isAuthenticated) return;

    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load conversation
        const convData = await getConversationById(conversationId);
        setConversation(convData as any); // Type mismatch between API and component types

        // Load messages
        const messagesData = await getMessages(conversationId, 0, 50);
        setMessages(messagesData.content.reverse() as any); // Type conversion needed

        // Mark as read
        await markConversationAsRead(conversationId);

        logger.info('ModernConversationPage', 'Data loaded', {
          conversationId,
          messageCount: messagesData.content.length,
        });
      } catch (error) {
        logger.error('ModernConversationPage', 'Failed to load data', {
          error,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [conversationId, isAuthenticated]);

  // Listen for new messages from store (updated by WebSocket)
  useEffect(() => {
    if (!conversationId) return;

    const storeMessages =
      useMessagingStore.getState().messages[conversationId] || [];

    // Merge with local messages (avoid duplicates)
    setMessages((prevMessages) => {
      const existingIds = new Set(prevMessages.map((m) => m.id));
      const newMessages = storeMessages.filter((m) => !existingIds.has(m.id));

      if (newMessages.length > 0) {
        return [...prevMessages, ...newMessages];
      }

      return prevMessages;
    });
  }, [conversationId]);

  // Send typing indicator
  const handleTypingStart = useCallback(() => {
    if (!isConnected || !conversationId || !user) return;

    wsSend(`/app/conversation/${conversationId}/typing/start`, {
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
    });
  }, [isConnected, conversationId, user, wsSend]);

  const handleTypingStop = useCallback(() => {
    if (!isConnected || !conversationId || !user) return;

    wsSend(`/app/conversation/${conversationId}/typing/stop`, {
      userId: user.id,
      userName: `${user.firstName} ${user.lastName}`,
    });
  }, [isConnected, conversationId, user, wsSend]);

  // Send message
  const handleSendMessage = useCallback(
    async (content: string, attachments?: MessageAttachment[]) => {
      if (!conversationId || !user) return;

      setIsSending(true);

      try {
        // Optimistic update
        const tempId = `temp-${Date.now()}`;

        // Map MessageAttachment to FileAttachment
        const fileAttachments = attachments?.map((att) => ({
          id: att.id,
          name: att.filename,
          url: att.url,
          type: att.mimeType,
          size: att.size,
          uploadedAt: att.uploadedAt,
          thumbnailUrl: att.thumbnailUrl,
        }));

        const optimisticMessage: Message = {
          id: tempId,
          conversationId,
          senderId: user.id,
          receiverId: conversation?.participants[0]?.id,
          content,
          type: 'text',
          isRead: false,
          isEdited: false,
          sentAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          timestamp: new Date().toISOString(),
          attachments: fileAttachments || [],
        };

        setMessages((prev) => [...prev, optimisticMessage]);

        // Send to backend
        const { message } = await apiSendMessage({
          conversationId,
          content,
          type: 'text' as any, // Type will be converted by API
          attachments: attachments?.map((a) => a.id),
        });

        // Replace optimistic message with real one
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? (message as any) : m))
        );

        logger.info('ModernConversationPage', 'Message sent', {
          messageId: message.id,
          attachmentCount: attachments?.length || 0,
        });
      } catch (error) {
        logger.error('ModernConversationPage', 'Failed to send message', {
          error,
        });

        // Remove optimistic message on error
        setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-')));

        throw error; // Re-throw to let MessageInput handle it
      } finally {
        setIsSending(false);
      }
    },
    [conversationId, conversation, user]
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Loading state
  if (isLoading) {
    return (
      <AppLayout showFooter={false}>
        <div className="flex min-h-screen items-center justify-center">
          <Loading size="lg" text="Sohbet yükleniyor..." />
        </div>
      </AppLayout>
    );
  }

  // Not found state
  if (!conversation) {
    return (
      <AppLayout showFooter={false}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-900">
              Sohbet bulunamadı
            </h2>
            <p className="mt-2 text-gray-600">
              Bu sohbet mevcut değil veya erişim izniniz yok.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Check if other participant is typing
  const otherParticipant = conversation.participants[0];
  const isTyping = typingUsers.some(
    (userId) => userId === otherParticipant?.id
  );
  const typingUserName = isTyping
    ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
    : undefined;

  return (
    <AppLayout showFooter={false}>
      <div className="flex h-screen flex-col">
        {/* Header */}
        <ConversationHeader conversation={conversation} showBackButton={true} />

        {/* Message Thread */}
        <MessageThread
          messages={messages}
          currentUserId={user?.id || ''}
          isLoading={false}
          isTyping={isTyping}
          typingUserName={typingUserName}
          autoScroll={true}
        />

        {/* Message Input */}
        <MessageInput
          disabled={!isConnected}
          isSending={isSending}
          onSend={handleSendMessage}
          onTypingStart={handleTypingStart}
          onTypingStop={handleTypingStop}
        />
      </div>
    </AppLayout>
  );
}
