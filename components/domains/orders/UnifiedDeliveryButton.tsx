/**
 * ================================================
 * UNIFIED DELIVERY BUTTON
 * ================================================
 * Trigger button for UnifiedDeliveryModal
 * Handles both regular orders and milestone deliveries
 *
 * Replaces:
 * - DeliverOrderButton (old button component)
 * - Various inline delivery triggers
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Unified Architecture
 * @since Sprint 1 - Code Quality & Refactoring
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui';
import { Upload } from 'lucide-react';
import {
  UnifiedDeliveryModal,
  type DeliveryMode,
} from './UnifiedDeliveryModal';

// ================================================
// TYPES
// ================================================

export interface UnifiedDeliveryButtonProps {
  /** Delivery mode */
  mode: DeliveryMode;
  /** Order ID (for order mode) */
  orderId?: string;
  /** Milestone ID (for milestone mode) */
  milestoneId?: string;
  /** Display title */
  title: string;
  /** Subtitle or description */
  subtitle?: string;
  /** Success callback */
  onSuccess?: () => void;
  /** Button text (optional, defaults based on mode) */
  buttonText?: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Show icon */
  showIcon?: boolean;
  /** Full width button */
  fullWidth?: boolean;
}

// ================================================
// COMPONENT
// ================================================

export function UnifiedDeliveryButton({
  mode,
  orderId,
  milestoneId,
  title,
  subtitle,
  onSuccess,
  buttonText,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  showIcon = true,
  fullWidth = false,
}: UnifiedDeliveryButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Default button text based on mode
  const defaultButtonText =
    mode === 'milestone' ? 'Milestone Teslim Et' : 'Siparişi Teslim Et';

  const handleSuccess = () => {
    setIsModalOpen(false);
    onSuccess?.();
  };

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={() => setIsModalOpen(true)}
        disabled={disabled}
        variant={variant}
        size={size}
        className={`${fullWidth ? 'w-full' : 'w-full sm:w-auto'} ${className}`}
      >
        {showIcon && <Upload className="mr-2 h-4 w-4" />}
        {buttonText || defaultButtonText}
      </Button>

      {/* Delivery Modal */}
      <UnifiedDeliveryModal
        mode={mode}
        orderId={orderId}
        milestoneId={milestoneId}
        title={title}
        subtitle={subtitle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}

export default UnifiedDeliveryButton;
