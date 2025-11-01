/**
 * useDisputeMessages Hook
 * Fetch and manage dispute messages
 */

import { useState } from 'react';
import useSWR from 'swr';
import { getDisputeMessages, addDisputeMessage } from '@/lib/api/disputes';
import type { DisputeMessage } from '@/types/dispute';
import { toast } from 'sonner';
import { logger } from '@/lib/shared/utils/logger';

export function useDisputeMessages(disputeId: string | null) {
  const [isSending, setIsSending] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<DisputeMessage[] | null>(
    disputeId ? `/api/v1/disputes/${disputeId}/messages` : null,
    disputeId ? () => getDisputeMessages(disputeId) : null,
    {
      refreshInterval: 10000, // Refresh every 10 seconds for new messages
      revalidateOnFocus: true,
    }
  );

  const sendMessage = async (
    message: string,
    attachments?: string[]
  ): Promise<boolean> => {
    if (!disputeId) {
      toast.error('Geçersiz itiraz ID');
      return false;
    }

    if (!message.trim()) {
      toast.error('Mesaj boş olamaz');
      return false;
    }

    setIsSending(true);

    try {
      await addDisputeMessage(disputeId, message.trim(), attachments);
      logger.info('Message sent', { disputeId });

      // Optimistically update the UI
      await mutate();

      toast.success('Mesaj gönderildi');
      return true;
    } catch (err) {
      logger.error('Failed to send message', { error: err });
      toast.error('Mesaj gönderilemedi');
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return {
    messages: data || [],
    isLoading,
    error,
    isSending,
    sendMessage,
    refresh: mutate,
  };
}
