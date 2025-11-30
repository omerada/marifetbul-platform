/**
 * ================================================
 * DELETE CONFIRMATION MODAL - REUSABLE COMPONENT
 * ================================================
 * Generic confirmation modal for delete operations
 *
 * Features:
 * - Customizable title and message
 * - Loading state during async operations
 * - Keyboard navigation (Esc to cancel, Enter to confirm)
 * - Accessible (ARIA labels)
 * - Themeable (danger/warning variants)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 2 - Story 2.3
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Alert, AlertDescription } from '@/components/ui';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface DeleteConfirmationModalProps {
  /** Controls modal visibility */
  isOpen: boolean;

  /** Close handler */
  onClose: () => void;

  /** Confirm handler (async) */
  onConfirm: () => Promise<void>;

  /** Modal title */
  title?: string;

  /** Confirmation message */
  message: string;

  /** Item name/description (shown in bold) */
  itemName?: string;

  /** Confirm button label */
  confirmLabel?: string;

  /** Cancel button label */
  cancelLabel?: string;

  /** Severity level (affects styling) */
  severity?: 'danger' | 'warning';

  /** Show count of items to delete (for bulk operations) */
  itemCount?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Silme Onayı',
  message,
  itemName,
  confirmLabel = 'Sil',
  cancelLabel = 'İptal',
  severity = 'danger',
  itemCount,
}: DeleteConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsDeleting(false);
    }
  }, [isOpen]);

  // Handle confirmation
  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      // Success - parent will close modal and show toast
      onClose();
    } catch (_error) {
      // Error handled by parent - keep modal open
      setIsDeleting(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isDeleting) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isDeleting]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {severity === 'danger' ? (
              <AlertTriangle className="h-5 w-5 text-red-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            )}
            {title}
          </DialogTitle>
          <DialogDescription className="text-left">
            {message}
            {itemName && (
              <span className="mt-2 block font-semibold text-gray-900">
                {itemName}
              </span>
            )}
            {itemCount !== undefined && itemCount > 1 && (
              <span className="mt-2 block text-sm font-medium text-gray-700">
                ({itemCount} öğe silinecek)
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Warning alert */}
        <Alert
          variant={severity === 'danger' ? 'destructive' : 'default'}
          className="border-l-4"
        >
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {severity === 'danger'
              ? 'Bu işlem geri alınamaz. Silinen öğeler kalıcı olarak kaldırılacaktır.'
              : 'Bu işlemi onaylamak istediğinizden emin misiniz?'}
          </AlertDescription>
        </Alert>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={severity === 'danger' ? 'destructive' : 'warning'}
            onClick={handleConfirm}
            disabled={isDeleting}
            className="w-full sm:w-auto"
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Siliniyor...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                {confirmLabel}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteConfirmationModal;
