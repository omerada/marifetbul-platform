/**
 * ================================================
 * MODERATION ITEM CARD COMPONENT
 * ================================================
 * Enhanced card component for displaying moderation queue items
 *
 * Features:
 * - Priority badges with color coding
 * - Type icons (Package, Comment, Review, Report, User)
 * - Status indicators
 * - Flag count display
 * - Quick moderation actions (Approve, Reject, Spam)
 * - Escalation button for moderators
 * - Checkbox selection for bulk actions
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2 Story 2.4
 */

import { memo } from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flag,
  MessageSquare,
  Package,
  User,
  FileText,
  ArrowUp,
} from 'lucide-react';
import { Badge, Button, Checkbox } from '@/components/ui';
import type { ModerationItem } from '@/components/domains/dashboard/types/dashboard.types';

// ============================================================================
// TYPES
// ============================================================================

export interface ModerationItemCardProps {
  /** Moderation item data */
  item: ModerationItem;
  /** Selection checkbox state */
  isSelected?: boolean;
  /** Checkbox change handler */
  onSelectionChange?: (id: string, selected: boolean) => void;
  /** Approve handler */
  onApprove?: (itemId: string) => void;
  /** Reject handler */
  onReject?: (itemId: string) => void;
  /** Mark as spam handler */
  onMarkSpam?: (itemId: string) => void;
  /** Escalate handler (moderators only) */
  onEscalate?: (itemId: string) => void;
  /** Show selection checkbox */
  showSelection?: boolean;
  /** Show quick actions */
  showActions?: boolean;
  /** Current user role */
  userRole?: 'ADMIN' | 'MODERATOR';
  /** Custom className */
  className?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get priority badge variant and label
 */
function getPriorityBadge(priority: ModerationItem['priority']) {
  const badges = {
    low: {
      variant: 'outline' as const,
      label: 'Düşük',
      className: 'border-gray-400 text-gray-700 dark:text-gray-300',
    },
    medium: {
      variant: 'default' as const,
      label: 'Orta',
      className:
        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    },
    high: {
      variant: 'warning' as const,
      label: 'Yüksek',
      className:
        'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    },
    urgent: {
      variant: 'destructive' as const,
      label: 'Acil',
      className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    },
  };
  return badges[priority];
}

/**
 * Get item type icon
 */
function getTypeIcon(type: ModerationItem['type']) {
  const icons = {
    package: Package,
    comment: MessageSquare,
    dispute: AlertTriangle,
    report: Flag,
    user: User,
  };
  return icons[type] || FileText;
}

/**
 * Get status badge
 */
function getStatusBadge(status: ModerationItem['status']) {
  const badges = {
    pending: { variant: 'warning' as const, label: 'Bekliyor' },
    approved: { variant: 'success' as const, label: 'Onaylandı' },
    rejected: { variant: 'destructive' as const, label: 'Reddedildi' },
    spam: { variant: 'outline' as const, label: 'Spam' },
  };
  return badges[status];
}

/**
 * Format date to Turkish locale
 */
function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ModerationItemCard Component
 *
 * Enhanced card for displaying moderation queue items with quick actions
 *
 * @example
 * ```tsx
 * <ModerationItemCard
 *   item={moderationItem}
 *   isSelected={selectedIds.includes(item.id)}
 *   onSelectionChange={handleSelection}
 *   onApprove={handleApprove}
 *   onReject={handleReject}
 *   showSelection={true}
 *   showActions={item.status === 'pending'}
 *   userRole="MODERATOR"
 * />
 * ```
 */
export const ModerationItemCard = memo<ModerationItemCardProps>(
  ({
    item,
    isSelected = false,
    onSelectionChange,
    onApprove,
    onReject,
    onMarkSpam,
    onEscalate,
    showSelection = false,
    showActions = true,
    userRole = 'MODERATOR',
    className = '',
  }) => {
    const TypeIcon = getTypeIcon(item.type);
    const priorityBadge = getPriorityBadge(item.priority);
    const statusBadge = getStatusBadge(item.status);

    const isPending = item.status === 'pending';
    const canEscalate = userRole === 'MODERATOR' && isPending;

    return (
      <div
        className={`bg-card hover:border-primary/50 rounded-lg border p-4 transition-all ${
          isSelected ? 'border-primary ring-primary/20 ring-2' : ''
        } ${className}`}
      >
        <div className="flex items-start gap-3">
          {/* Selection Checkbox */}
          {showSelection && (
            <div className="pt-1">
              <Checkbox
                checked={isSelected}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onSelectionChange?.(item.id, e.target.checked)
                }
                aria-label={`Select ${item.title}`}
              />
            </div>
          )}

          {/* Type Icon */}
          <div className="bg-muted rounded-lg p-2.5">
            <TypeIcon className="text-muted-foreground h-5 w-5" />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="font-semibold">{item.title}</h4>
                <Badge className={priorityBadge.className}>
                  {priorityBadge.label}
                </Badge>
                {item.flagsCount && item.flagsCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="flex items-center gap-1"
                  >
                    <Flag className="h-3 w-3" />
                    {item.flagsCount}
                  </Badge>
                )}
              </div>
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            </div>

            {/* Content Preview */}
            <p className="text-muted-foreground line-clamp-2 text-sm">
              {item.content}
            </p>

            {/* Metadata */}
            <div className="text-muted-foreground flex flex-wrap items-center gap-2 text-xs">
              <span className="capitalize">{item.type}</span>
              <span>•</span>
              <span>Gönderen: {item.submittedBy.name}</span>
              <span>•</span>
              <span>{formatDate(item.submittedAt)}</span>
            </div>

            {/* Quick Actions */}
            {showActions && isPending && (
              <div className="flex flex-wrap items-center gap-2 border-t pt-3">
                <Button
                  size="sm"
                  variant="success"
                  onClick={() => onApprove?.(item.id)}
                  className="flex items-center gap-1"
                >
                  <CheckCircle className="h-4 w-4" />
                  Onayla
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onReject?.(item.id)}
                  className="flex items-center gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  Reddet
                </Button>
                <Button
                  size="sm"
                  variant="warning"
                  onClick={() => onMarkSpam?.(item.id)}
                  className="flex items-center gap-1"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Spam
                </Button>
                {canEscalate && onEscalate && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEscalate(item.id)}
                    className="flex items-center gap-1"
                  >
                    <ArrowUp className="h-4 w-4" />
                    Yönet
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ModerationItemCard.displayName = 'ModerationItemCard';

export default ModerationItemCard;
