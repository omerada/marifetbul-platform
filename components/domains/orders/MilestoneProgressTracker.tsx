/**
 * ================================================
 * MILESTONE PROGRESS TRACKER
 * ================================================
 * Visual progress tracker for order milestones
 *
 * Features:
 * - Progress bar with percentage
 * - Milestone list with status
 * - Payment tracking
 * - Interactive milestone cards
 *
 * @version 1.0.0
 * @sprint Sprint 4 - Milestone Payment System
 * @author MarifetBul Development Team
 */

'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import {
  CheckCircle,
  Clock,
  Loader,
  Package,
  RefreshCw,
  XCircle,
  DollarSign,
} from 'lucide-react';
import type {
  OrderMilestone,
  MilestoneProgress,
  MilestoneStatus,
} from '@/types/business/features/milestone';
import {
  calculateMilestoneProgress,
  formatMilestoneAmount,
  isMilestoneOverdue,
  MILESTONE_STATUS_METADATA,
} from '@/types/business/features/milestone';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

export interface MilestoneProgressTrackerProps {
  /** Order milestones */
  milestones: OrderMilestone[];
  /** Show detailed view */
  detailed?: boolean;
  /** Callback when milestone clicked */
  onMilestoneClick?: (milestone: OrderMilestone) => void;
  /** User role (buyer or seller) */
  userRole?: 'buyer' | 'seller';
  /** Custom className */
  className?: string;
}

// ================================================
// ICON MAPPING
// ================================================

const statusIcons: Record<MilestoneStatus, React.ReactNode> = {
  PENDING: <Clock className="h-5 w-5" />,
  IN_PROGRESS: <Loader className="h-5 w-5 animate-spin" />,
  DELIVERED: <Package className="h-5 w-5" />,
  ACCEPTED: <CheckCircle className="h-5 w-5" />,
  REVISION_REQUESTED: <RefreshCw className="h-5 w-5" />,
  CANCELED: <XCircle className="h-5 w-5" />,
};

// ================================================
// COMPONENT
// ================================================

export function MilestoneProgressTracker({
  milestones,
  detailed = false,
  onMilestoneClick,
  userRole,
  className,
}: MilestoneProgressTrackerProps) {
  // Calculate progress
  const progress: MilestoneProgress = calculateMilestoneProgress(milestones);

  // Sort milestones by sequence
  const sortedMilestones = [...milestones].sort(
    (a, b) => a.sequence - b.sequence
  );

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Milestone Aşamaları
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          {progress.completed} / {progress.total} milestone tamamlandı
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">İlerleme</span>
          <span className="font-semibold text-blue-600">
            {progress.progressPercentage}%
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
            style={{ width: `${progress.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Payment Summary - Mobile optimized */}
      <div className="mb-6 grid grid-cols-1 gap-3 rounded-lg bg-gray-50 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4">
        <div className="flex items-center justify-between sm:flex-col sm:text-center">
          <div className="flex items-center text-gray-600">
            <DollarSign className="mr-1 h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm">Toplam</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 sm:mt-1 sm:text-base">
            {formatMilestoneAmount(progress.totalAmount)}
          </p>
        </div>
        <div className="flex items-center justify-between sm:flex-col sm:text-center">
          <div className="flex items-center text-green-600">
            <CheckCircle className="mr-1 h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm">Ödenen</span>
          </div>
          <p className="text-sm font-semibold text-green-700 sm:mt-1 sm:text-base">
            {formatMilestoneAmount(progress.releasedAmount)}
          </p>
        </div>
        <div className="flex items-center justify-between sm:flex-col sm:text-center">
          <div className="flex items-center text-blue-600">
            <Clock className="mr-1 h-4 w-4 shrink-0" />
            <span className="text-xs sm:text-sm">Kalan</span>
          </div>
          <p className="text-sm font-semibold text-blue-700 sm:mt-1 sm:text-base">
            {formatMilestoneAmount(progress.remainingAmount)}
          </p>
        </div>
      </div>

      {/* Milestone List */}
      <div className="space-y-3">
        {sortedMilestones.map((milestone, index) => (
          <MilestoneItem
            key={milestone.id}
            milestone={milestone}
            index={index}
            detailed={detailed}
            onClick={onMilestoneClick}
            userRole={userRole}
          />
        ))}
      </div>

      {/* Empty State */}
      {milestones.length === 0 && (
        <div className="py-8 text-center">
          <Package className="mx-auto h-12 w-12 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">
            Henüz milestone eklenmemiş
          </p>
        </div>
      )}
    </Card>
  );
}

// ================================================
// MILESTONE ITEM SUB-COMPONENT
// ================================================

interface MilestoneItemProps {
  milestone: OrderMilestone;
  index: number;
  detailed: boolean;
  onClick?: (milestone: OrderMilestone) => void;
  userRole?: 'buyer' | 'seller';
}

function MilestoneItem({
  milestone,
  index,
  detailed,
  onClick,
  userRole,
}: MilestoneItemProps) {
  const metadata = MILESTONE_STATUS_METADATA[milestone.status];
  const isOverdue = isMilestoneOverdue(milestone);
  const isClickable = !!onClick;

  // Determine if milestone is actionable
  const isActionable =
    (userRole === 'seller' &&
      (milestone.status === 'IN_PROGRESS' ||
        milestone.status === 'REVISION_REQUESTED')) ||
    (userRole === 'buyer' && milestone.status === 'DELIVERED');

  return (
    <div
      onClick={() => isClickable && onClick(milestone)}
      className={cn(
        'rounded-lg border-2 p-4 transition-all',
        milestone.status === 'ACCEPTED'
          ? 'border-green-200 bg-green-50'
          : milestone.status === 'IN_PROGRESS'
            ? 'border-blue-200 bg-blue-50'
            : milestone.status === 'DELIVERED'
              ? 'border-yellow-200 bg-yellow-50'
              : 'border-gray-200 bg-white',
        isOverdue && milestone.status !== 'ACCEPTED' && 'border-red-300',
        isClickable && 'cursor-pointer hover:shadow-md',
        isActionable && 'ring-opacity-50 ring-2 ring-blue-400'
      )}
    >
      <div className="flex items-start justify-between">
        {/* Left: Icon + Info */}
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full',
              milestone.status === 'ACCEPTED'
                ? 'bg-green-100 text-green-600'
                : milestone.status === 'IN_PROGRESS'
                  ? 'bg-blue-100 text-blue-600'
                  : milestone.status === 'DELIVERED'
                    ? 'bg-yellow-100 text-yellow-600'
                    : 'bg-gray-100 text-gray-600'
            )}
          >
            {statusIcons[milestone.status]}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-500">
                #{index + 1}
              </span>
              <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
            </div>

            {detailed && (
              <p className="mt-1 text-sm text-gray-600">
                {milestone.description}
              </p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-2">
              {/* Status Badge */}
              <Badge
                variant={
                  metadata.color === 'green'
                    ? 'success'
                    : metadata.color === 'yellow'
                      ? 'warning'
                      : metadata.color === 'red'
                        ? 'destructive'
                        : 'default'
                }
              >
                {metadata.label}
              </Badge>

              {/* Amount */}
              <span className="text-sm font-semibold text-gray-900">
                {formatMilestoneAmount(milestone.amount)}
              </span>

              {/* Due Date */}
              <span
                className={cn(
                  'text-xs',
                  isOverdue && milestone.status !== 'ACCEPTED'
                    ? 'font-semibold text-red-600'
                    : 'text-gray-500'
                )}
              >
                {isOverdue && milestone.status !== 'ACCEPTED' && '⚠️ '}
                {new Date(milestone.dueDate).toLocaleDateString('tr-TR')}
              </span>
            </div>

            {/* Delivery/Acceptance Info */}
            {milestone.deliveredAt && (
              <p className="mt-1 text-xs text-gray-500">
                Teslim:{' '}
                {new Date(milestone.deliveredAt).toLocaleDateString('tr-TR')}
              </p>
            )}
            {milestone.acceptedAt && (
              <p className="mt-1 text-xs text-green-600">
                ✓ Onaylandı:{' '}
                {new Date(milestone.acceptedAt).toLocaleDateString('tr-TR')}
              </p>
            )}
          </div>
        </div>

        {/* Right: Action Indicator */}
        {isActionable && (
          <div className="ml-2 flex-shrink-0">
            <Badge variant="warning">Aksiyon Gerekli</Badge>
          </div>
        )}
      </div>
    </div>
  );
}

// ================================================
// EXPORTS
// ================================================

export default MilestoneProgressTracker;
