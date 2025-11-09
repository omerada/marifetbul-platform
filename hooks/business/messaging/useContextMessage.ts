'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/infrastructure/api/client';
import type {
  MessageContext,
  CreateContextConversationRequest,
  CreateContextMessageResponse,
  Conversation,
} from '@/types/business/features/messaging';

interface UseContextMessageReturn {
  isLoading: boolean;
  error: Error | null;
  sendContextMessage: (
    params: SendContextMessageParams
  ) => Promise<CreateContextMessageResponse>;
  createContextConversation: (
    params: CreateContextConversationParams
  ) => Promise<Conversation>;
}

interface SendContextMessageParams {
  recipientId: string;
  content?: string;
  context?: MessageContext;
  templateCode?: string;
  templateVariables?: Record<string, unknown>;
}

interface CreateContextConversationParams {
  recipientId: string;
  contextType?: string;
  contextId?: string;
  contextData?: Record<string, unknown>;
  initialMessage?: string;
  templateCode?: string;
  templateVariables?: Record<string, unknown>;
}

/**
 * Hook for context-aware messaging.
 * Handles conversation creation and message sending with business entity context.
 *
 * @returns Context message sending functions and state
 *
 * @example
 * ```tsx
 * const { sendContextMessage, isLoading } = useContextMessage();
 *
 * // Send message about an order
 * const result = await sendContextMessage({
 *   recipientId: freelancerId,
 *   context: {
 *     type: 'ORDER',
 *     id: orderId,
 *     title: orderTitle
 *   },
 *   templateCode: 'ORDER_REQUIREMENTS',
 *   templateVariables: {
 *     buyer_name: buyerName,
 *     order_title: orderTitle,
 *     deadline: deadline
 *   }
 * });
 *
 * // Navigate to conversation
 * router.push(`/messages?conversationId=${result.conversationId}`);
 * ```
 */
export function useContextMessage(): UseContextMessageReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Send a context-aware message by creating or getting a conversation.
   */
  const sendContextMessage = useCallback(
    async (
      params: SendContextMessageParams
    ): Promise<CreateContextMessageResponse> => {
      const { recipientId, content, context, templateCode, templateVariables } =
        params;

      setIsLoading(true);
      setError(null);

      try {
        const request: CreateContextConversationRequest = {
          recipientId,
          contextType: context?.type,
          contextId: context?.id,
          contextData: context ? JSON.stringify(context) : undefined,
          initialMessage: content,
          templateCode,
          templateVariables,
        };

        const conversation = await apiClient.post<Conversation>(
          '/api/v1/conversations/create-with-context',
          request
        );

        return {
          conversationId: conversation.id,
          messageId: conversation.lastMessage?.id || '',
          createdAt:
            conversation.lastMessage?.createdAt || new Date().toISOString(),
        };
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error('Failed to send message');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Create a context-aware conversation without sending an initial message.
   */
  const createContextConversation = useCallback(
    async (params: CreateContextConversationParams): Promise<Conversation> => {
      const {
        recipientId,
        contextType,
        contextId,
        contextData,
        initialMessage,
        templateCode,
        templateVariables,
      } = params;

      setIsLoading(true);
      setError(null);

      try {
        const request: CreateContextConversationRequest = {
          recipientId,
          contextType,
          contextId,
          contextData: contextData ? JSON.stringify(contextData) : undefined,
          initialMessage,
          templateCode,
          templateVariables,
        };

        const conversation = await apiClient.post<Conversation>(
          '/api/v1/conversations/create-with-context',
          request
        );

        return conversation;
      } catch (err) {
        const error =
          err instanceof Error
            ? err
            : new Error('Failed to create conversation');
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    isLoading,
    error,
    sendContextMessage,
    createContextConversation,
  };
}
