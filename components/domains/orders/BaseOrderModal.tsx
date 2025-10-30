/**
 * ================================================
 * BASE ORDER MODAL COMPONENT
 * ================================================
 * Base modal component for all order-related modals
 * Provides consistent structure, props, and behavior
 *
 * Features:
 * - Standardized prop interface
 * - Consistent UI layout
 * - Loading state management
 * - Error handling
 * - Order data normalization
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 6: Modal Standardization
 */

'use client';

import React, { ReactNode } from 'react';
import { X, LucideIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/Dialog';
import { Card } from '@/components/ui/Card';
import type { Order } from '@/types/business/features/orders';

// Import order normalization utilities
import {
  normalizeOrder,
  getOrderTitle,
  getTotalAmount,
  getCurrency,
  getSellerName,
  getBuyerName,
  getRevisionInfo,
  formatCurrency,
  formatDate,
  type NormalizedOrder,
} from '@/lib/utils/order-normalization';

// ================================================
// TYPES
// ================================================

/**
 * Base props that all order modals should accept
 */
export interface BaseOrderModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback to close the modal */
  onClose: () => void;
  /** Order ID (minimal required prop) */
  orderId: string;
  /** Optional order data (avoids prop drilling) */
  order?: Order;
  /** Callback after successful action */
  onSuccess?: (order?: Order) => void;
  /** Optional loading state (can be overridden) */
  isLoading?: boolean;
}

/**
 * Props for the BaseOrderModal wrapper component
 */
export interface BaseOrderModalWrapperProps extends BaseOrderModalProps {
  /** Modal title */
  title: string;
  /** Optional modal description */
  description?: string;
  /** Optional icon to display in header */
  icon?: LucideIcon;
  /** Icon color class (e.g., 'text-green-600') */
  iconColor?: string;
  /** Modal content */
  children: ReactNode;
  /** Optional custom header content (replaces default) */
  headerContent?: ReactNode;
  /** Optional custom footer content */
  footerContent?: ReactNode;
  /** Maximum width class (default: 'max-w-2xl') */
  maxWidth?: string;
  /** Use Dialog (default) or custom Card layout */
  variant?: 'dialog' | 'card';
  /** Disable close when loading */
  preventCloseOnLoading?: boolean;
}

/**
 * Order data extraction helpers
 * Re-exported from order-normalization utility for backward compatibility
 */
export const orderHelpers = {
  normalizeOrder,
  getOrderTitle,
  getTotalAmount,
  getCurrency,
  getSellerName,
  getBuyerName,
  getRevisionInfo,
  formatCurrency,
  formatDate,
};

// ================================================
// COMPONENTS
// ================================================

/**
 * Dialog variant of BaseOrderModal
 */
const DialogVariant: React.FC<BaseOrderModalWrapperProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  iconColor = 'text-blue-600',
  children,
  headerContent,
  footerContent,
  maxWidth = 'max-w-2xl',
  isLoading,
  preventCloseOnLoading,
}) => {
  const handleOpenChange = (open: boolean) => {
    if (!open && !(preventCloseOnLoading && isLoading)) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className={maxWidth}>
        {headerContent || (
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {Icon && <Icon className={`h-6 w-6 ${iconColor}`} />}
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
        )}

        {children}

        {footerContent}
      </DialogContent>
    </Dialog>
  );
};

/**
 * Card variant of BaseOrderModal (for full-screen style)
 */
const CardVariant: React.FC<BaseOrderModalWrapperProps> = ({
  isOpen,
  onClose,
  title,
  description,
  icon: Icon,
  iconColor = 'text-blue-600',
  children,
  headerContent,
  footerContent,
  maxWidth = 'max-w-2xl',
  isLoading,
  preventCloseOnLoading,
}) => {
  const handleClose = () => {
    if (!(preventCloseOnLoading && isLoading)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <Card className={`max-h-[90vh] w-full ${maxWidth} overflow-y-auto`}>
        {headerContent || (
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
            <div>
              <div className="flex items-center gap-2">
                {Icon && <Icon className={`h-6 w-6 ${iconColor}`} />}
                <h2 className="text-xl font-bold text-gray-900">{title}</h2>
              </div>
              {description && (
                <p className="mt-1 text-sm text-gray-600">{description}</p>
              )}
            </div>
            <button
              onClick={handleClose}
              disabled={preventCloseOnLoading && isLoading}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Kapat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {children}

        {footerContent}
      </Card>
    </div>
  );
};

/**
 * Main BaseOrderModal component
 * Delegates to Dialog or Card variant based on variant prop
 */
export const BaseOrderModal: React.FC<BaseOrderModalWrapperProps> = ({
  variant = 'dialog',
  ...props
}) => {
  if (variant === 'card') {
    return <CardVariant {...props} />;
  }
  return <DialogVariant {...props} />;
};

export default BaseOrderModal;
