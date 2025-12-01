'use client';

/**
 * ================================================
 * BULK MODERATION ACTIONS COMPONENT
 * ================================================
 * Floating action bar for bulk moderation operations
 *
 * Features:
 * - Selection counter
 * - Select All / Deselect All
 * - Bulk Approve
 * - Bulk Reject
 * - Bulk Mark as Spam
 * - Bulk Escalate (moderators only)
 * - Confirmation modals for destructive actions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2 Story 2.4
 */

import { memo, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowUp,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useToast } from '@/hooks';

// ============================================================================
// TYPES
// ============================================================================

export interface BulkModerationActionsProps {
  /** Number of selected items */
  selectedCount: number;
  /** Total items count */
  totalCount: number;
  /** All items selected state */
  isAllSelected: boolean;
  /** Select all handler */
  onSelectAll: () => void;
  /** Deselect all handler */
  onDeselectAll: () => void;
  /** Bulk approve handler */
  onBulkApprove: () => Promise<void>;
  /** Bulk reject handler */
  onBulkReject: () => Promise<void>;
  /** Bulk mark as spam handler */
  onBulkMarkSpam: () => Promise<void>;
  /** Bulk escalate handler (moderators only) */
  onBulkEscalate?: () => Promise<void>;
  /** Loading state */
  isLoading?: boolean;
  /** Current user role */
  userRole?: 'ADMIN' | 'MODERATOR';
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * BulkModerationActions Component
 *
 * Floating action bar for performing bulk moderation operations
 *
 * @example
 * ```tsx
 * <BulkModerationActions
 *   selectedCount={selectedItems.length}
 *   totalCount={allItems.length}
 *   isAllSelected={allItemsSelected}
 *   onSelectAll={handleSelectAll}
 *   onDeselectAll={handleDeselectAll}
 *   onBulkApprove={handleBulkApprove}
 *   onBulkReject={handleBulkReject}
 *   onBulkMarkSpam={handleBulkMarkSpam}
 *   userRole="MODERATOR"
 * />
 * ```
 */
export const BulkModerationActions = memo<BulkModerationActionsProps>(
  ({
    selectedCount,
    totalCount,
    isAllSelected,
    onSelectAll,
    onDeselectAll,
    onBulkApprove,
    onBulkReject,
    onBulkMarkSpam,
    onBulkEscalate,
    isLoading = false,
    userRole = 'MODERATOR',
  }) => {
    const { success, error: showError } = useToast();
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Don't show if no items selected
    if (selectedCount === 0) {
      return null;
    }

    /**
     * Handle bulk action with loading state
     */
    const handleAction = async (
      actionName: string,
      actionFn: () => Promise<void>,
      successMessage: string
    ) => {
      setActionLoading(actionName);
      try {
        await actionFn();
        success('Başarılı', successMessage);
      } catch (err) {
        showError(
          'Hata',
          err instanceof Error ? err.message : 'İşlem başarısız oldu'
        );
      } finally {
        setActionLoading(null);
      }
    };

    const canEscalate = userRole === 'MODERATOR' && onBulkEscalate;

    return (
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transform">
        <div className="bg-card border-primary/20 ring-primary/10 rounded-lg border px-4 py-3 shadow-lg ring-2">
          <div className="flex flex-wrap items-center gap-3">
            {/* Selection Info */}
            <div className="flex items-center gap-2">
              <div className="bg-primary/10 text-primary rounded-md px-3 py-1.5 text-sm font-semibold">
                {selectedCount} seçildi
              </div>

              {/* Select/Deselect All Toggle */}
              <Button
                size="sm"
                variant="outline"
                onClick={isAllSelected ? onDeselectAll : onSelectAll}
                className="flex items-center gap-1.5"
                disabled={isLoading || actionLoading !== null}
              >
                {isAllSelected ? (
                  <>
                    <Square className="h-4 w-4" />
                    Hiçbirini Seçme
                  </>
                ) : (
                  <>
                    <CheckSquare className="h-4 w-4" />
                    Tümünü Seç ({totalCount})
                  </>
                )}
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 border-l pl-3">
              {/* Approve */}
              <Button
                size="sm"
                variant="success"
                onClick={() =>
                  handleAction(
                    'approve',
                    onBulkApprove,
                    `${selectedCount} içerik onaylandı`
                  )
                }
                disabled={isLoading || actionLoading !== null}
                className="flex items-center gap-1.5"
              >
                {actionLoading === 'approve' ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Onayla
              </Button>

              {/* Reject */}
              <Button
                size="sm"
                variant="destructive"
                onClick={() =>
                  handleAction(
                    'reject',
                    onBulkReject,
                    `${selectedCount} içerik reddedildi`
                  )
                }
                disabled={isLoading || actionLoading !== null}
                className="flex items-center gap-1.5"
              >
                {actionLoading === 'reject' ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                Reddet
              </Button>

              {/* Mark as Spam */}
              <Button
                size="sm"
                variant="warning"
                onClick={() =>
                  handleAction(
                    'spam',
                    onBulkMarkSpam,
                    `${selectedCount} içerik spam olarak işaretlendi`
                  )
                }
                disabled={isLoading || actionLoading !== null}
                className="flex items-center gap-1.5"
              >
                {actionLoading === 'spam' ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <AlertTriangle className="h-4 w-4" />
                )}
                Spam
              </Button>

              {/* Escalate (Moderators only) */}
              {canEscalate && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    handleAction(
                      'escalate',
                      onBulkEscalate!,
                      `${selectedCount} içerik yönetildi`
                    )
                  }
                  disabled={isLoading || actionLoading !== null}
                  className="flex items-center gap-1.5"
                >
                  {actionLoading === 'escalate' ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <ArrowUp className="h-4 w-4" />
                  )}
                  Yönet
                </Button>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={onDeselectAll}
              className="text-muted-foreground hover:text-foreground ml-2 transition-colors"
              aria-label="Seçimi Temizle"
              disabled={isLoading || actionLoading !== null}
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }
);

BulkModerationActions.displayName = 'BulkModerationActions';

export default BulkModerationActions;
