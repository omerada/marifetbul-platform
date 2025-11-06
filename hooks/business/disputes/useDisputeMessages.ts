/**
 * useDisputeMessages Hook
 * Fetch and manage dispute messages with real-time updates
 *
 * Sprint 2 Story 2.1: Updated to use backend messaging API
 * - Real dispute message endpoints
 * - Read/unread tracking
 * - System message support
 * - 5-minute delete window
 * - Mark as read functionality
 */

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import {
  getDisputeMessages,
  sendDisputeMessage,
  markDisputeMessagesAsRead,
  deleteDisputeMessage,
} from '@/lib/api/disputes';
import type {
  DisputeMessageResponse,
  DisputeConversationResponse,
} from '@/types/dispute';
import { toast } from 'sonner';
import logger from '@/lib/infrastructure/monitoring/logger';

interface UseDisputeMessagesReturn {
  messages: DisputeMessageResponse[];
  totalMessages: number;
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  isSending: boolean;
  sendMessage: (content: string, attachmentUrls?: string[]) => Promise<boolean>;
  markAsRead: () => Promise<void>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  refresh: () => void;
}

export function useDisputeMessages(
  disputeId: string | null
): UseDisputeMessagesReturn {
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch messages with SWR (auto-refresh every 10 seconds)
  const { data, error, isLoading, mutate } =
    useSWR<DisputeConversationResponse>(
      disputeId ? `/api/v1/disputes/${disputeId}/messages` : null,
      disputeId ? () => getDisputeMessages(disputeId) : null,
      {
        refreshInterval: 10000, // Refresh every 10 seconds for new messages
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
      }
    );

  // Send a new message
  const sendMessage = useCallback(
    async (content: string, attachmentUrls?: string[]): Promise<boolean> => {
      if (!disputeId) {
        toast.error('Geçersiz itiraz ID');
        return false;
      }

      if (!content.trim()) {
        toast.error('Mesaj boş olamaz');
        return false;
      }

      if (content.length > 5000) {
        toast.error('Mesaj çok uzun (maksimum 5000 karakter)');
        return false;
      }

      setIsSending(true);

      try {
        await sendDisputeMessage(disputeId, content.trim(), attachmentUrls);
        logger.info('Message sent successfully', { disputeId });

        // Refresh messages immediately
        await mutate();

        toast.success('Mesaj gönderildi');
        return true;
      } catch (err) {
        logger.error('Failed to send message', { error: err });
        toast.error('Mesaj gönderilemedi', {
          description: 'Lütfen tekrar deneyin',
        });
        return false;
      } finally {
        setIsSending(false);
      }
    },
    [disputeId, mutate]
  );

  // Mark all messages as read
  const markAsRead = useCallback(async (): Promise<void> => {
    if (!disputeId) return;

    try {
      const result = await markDisputeMessagesAsRead(disputeId);
      logger.info('Messages marked as read', { disputeId, countresultmarkedCount,  });

      // Refresh to update UI
      await mutate();
    } catch (err) {
      logger.error('Failed to mark messages as read', { error: err });
      // Silent fail - not critical
    }
  }, [disputeId, mutate]);

  // Delete a message (within 5-minute window)
  const deleteMessage = useCallback(
    async (messageId: string): Promise<boolean> => {
      if (isDeleting) return false;

      setIsDeleting(true);

      try {
        await deleteDisputeMessage(messageId);
        logger.info('Message deleted', { messageId });

        // Refresh messages
        await mutate();

        toast.success('Mesaj silindi');
        return true;
      } catch (err) {
        logger.error('Failed to delete message', { error: err });

        const errorMessage = err instanceof Error ? err.message : String(err);

        // Check if error is due to time window
        if (
          errorMessage.includes('5 dakika') ||
          errorMessage.includes('5-minute')
        ) {
          toast.error('Mesaj silinemedi', {
            description:
              'Mesajlar sadece gönderildikten sonraki 5 dakika içinde silinebilir',
          });
        } else {
          toast.error('Mesaj silinemedi');
        }

        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [isDeleting, mutate]
  );

  // Auto mark as read when messages are loaded
  useEffect(() => {
    if (data && data.unreadCount > 0) {
      // Mark as read after 2 seconds of viewing
      const timer = setTimeout(() => {
        markAsRead();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [data, markAsRead]);

  return {
    messages: data?.messages || [],
    totalMessages: data?.totalMessages || 0,
    unreadCount: data?.unreadCount || 0,
    isLoading,
    error: error || null,
    isSending,
    sendMessage,
    markAsRead,
    deleteMessage,
    refresh: mutate,
  };
}
