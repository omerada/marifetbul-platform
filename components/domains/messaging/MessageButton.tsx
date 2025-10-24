'use client';

import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { UnifiedButton } from '@/components/ui/UnifiedButton';
import { QuickMessageModal } from './QuickMessageModal';
import type { MessageContext } from '@/types/business/features/messaging';

export interface MessageButtonProps {
  /**
   * Recipient user ID
   */
  recipientId: string;

  /**
   * Recipient display name
   */
  recipientName: string;

  /**
   * Optional context (Order, Proposal, Job, Package)
   */
  context?: MessageContext;

  /**
   * Button variant
   */
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'destructive'
    | 'success'
    | 'warning';

  /**
   * Button size
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Button text (default: "Mesaj Gönder")
   */
  children?: React.ReactNode;

  /**
   * Show icon
   */
  showIcon?: boolean;

  /**
   * Callback after message sent
   */
  onMessageSent?: (conversationId: string) => void;

  /**
   * Disable button
   */
  disabled?: boolean;
}

/**
 * Reusable button component for context-aware messaging.
 * Opens a modal to send messages with optional template selection.
 *
 * @example
 * ```tsx
 * // Simple usage
 * <MessageButton
 *   recipientId={freelancerId}
 *   recipientName={freelancerName}
 * />
 *
 * // With order context
 * <MessageButton
 *   recipientId={seller.id}
 *   recipientName={seller.name}
 *   context={{
 *     type: 'ORDER',
 *     id: order.id,
 *     title: order.title,
 *     additionalData: {
 *       orderNumber: order.orderNumber,
 *       status: order.status
 *     }
 *   }}
 *   variant="outline"
 * />
 * ```
 */
export function MessageButton({
  recipientId,
  recipientName,
  context,
  variant = 'primary',
  size = 'md',
  className,
  children,
  showIcon = true,
  onMessageSent,
  disabled = false,
}: MessageButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleMessageSent = (conversationId: string) => {
    setIsModalOpen(false);
    onMessageSent?.(conversationId);
  };

  return (
    <>
      <UnifiedButton
        variant={variant}
        size={size}
        className={className}
        onClick={handleOpenModal}
        disabled={disabled}
        aria-label={`${recipientName} ile mesajlaş`}
      >
        {showIcon && <MessageSquare className="mr-2 h-4 w-4" />}
        {children || 'Mesaj Gönder'}
      </UnifiedButton>

      <QuickMessageModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        recipientId={recipientId}
        recipientName={recipientName}
        context={context}
        onMessageSent={handleMessageSent}
      />
    </>
  );
}
