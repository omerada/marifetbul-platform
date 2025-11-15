/**
 * ================================================
 * MILESTONE LIST CARD
 * ================================================
 * @deprecated This component is deprecated. Use MilestoneList from @/components/domains/milestones instead.
 *
 * DEPRECATION NOTICE:
 * - Date: 2025-01-14
 * - Reason: Duplicate functionality with components/domains/milestones/MilestoneList.tsx
 * - Migration: Use dedicated /dashboard/orders/[id]/milestones page for milestone management
 * - Preview: Use milestone preview card in order detail page
 * - Will be removed: Sprint 2 cleanup phase
 *
 * Original Description:
 * Comprehensive milestone list with actions
 *
 * Features:
 * - Full milestone list with expandable details
 * - Role-based action buttons
 * - Status indicators and progress
 * - Delivery/acceptance forms
 * - Timeline view
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @sprint Sprint 1 - Story 1.2 - Milestone List & Progress
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import {
  CheckCircle,
  Clock,
  Loader2,
  Package,
  RefreshCw,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FileText,
  Edit,
  Trash2,
} from 'lucide-react';
import type { MilestoneResponse } from '@/types/backend-aligned';
import { cn } from '@/lib/utils';
import { formatCurrency, formatDate } from '@/lib/shared/formatters';
import { UnifiedDeliveryButton } from './UnifiedDeliveryButton';

// ================================================
// TYPES
// ================================================

export interface MilestoneListCardProps {
  /** Order milestones */
  milestones: MilestoneResponse[];
  /** User role */
  userRole: 'buyer' | 'seller';
  /** Order ID */
  orderId: string;
  /** Currency */
  currency?: string;
  /** Callback when action needed */
  onDeliverClick?: (milestone: MilestoneResponse) => void;
  onAcceptClick?: (milestone: MilestoneResponse) => void;
  onRejectClick?: (milestone: MilestoneResponse) => void;
  onStartClick?: (milestone: MilestoneResponse) => void;
  /** Sprint 2: Edit & Delete callbacks */
  onEditClick?: (milestone: MilestoneResponse) => void;
  onDeleteClick?: (milestone: MilestoneResponse) => void;
  /** Custom className */
  className?: string;
}

// ================================================
// HELPERS
// ================================================

const STATUS_CONFIG: Record<
  MilestoneResponse['status'],
  {
    label: string;
    color: string;
    bgColor: string;
    borderColor: string;
    icon: React.ReactNode;
    variant: 'default' | 'success' | 'warning' | 'destructive';
  }
> = {
  PENDING: {
    label: 'Beklemede',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: <Clock className="h-5 w-5" />,
    variant: 'default',
  },
  IN_PROGRESS: {
    label: 'Devam Ediyor',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: <Loader2 className="h-5 w-5 animate-spin" />,
    variant: 'default',
  },
  DELIVERED: {
    label: 'Teslim Edildi',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: <Package className="h-5 w-5" />,
    variant: 'warning',
  },
  REVISION_REQUESTED: {
    label: 'Revizyon İstendi',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: <RefreshCw className="h-5 w-5" />,
    variant: 'warning',
  },
  ACCEPTED: {
    label: 'Kabul Edildi',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: <CheckCircle className="h-5 w-5" />,
    variant: 'success',
  },
  CANCELED: {
    label: 'İptal Edildi',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: <XCircle className="h-5 w-5" />,
    variant: 'destructive',
  },
};

/**
 * Check if milestone is overdue
 */
function isMilestoneOverdue(milestone: MilestoneResponse): boolean {
  if (!milestone.dueDate || milestone.status === 'ACCEPTED') return false;
  return new Date(milestone.dueDate) < new Date();
}

/**
 * Get action hint for user
 */
function getActionHint(
  milestone: MilestoneResponse,
  userRole: 'buyer' | 'seller'
): string | null {
  if (userRole === 'seller') {
    if (milestone.status === 'PENDING') return 'İşe başlayabilirsiniz';
    if (milestone.status === 'IN_PROGRESS') return 'Teslim edebilirsiniz';
    if (milestone.status === 'REVISION_REQUESTED')
      return 'Revizyon yapıp yeniden teslim edin';
  } else {
    // buyer
    if (milestone.status === 'DELIVERED') return 'İnceleyip onaylayın';
  }
  return null;
}

// ================================================
// COMPONENT
// ================================================

export function MilestoneListCard({
  milestones,
  userRole,
  orderId,
  currency = 'TRY',
  onDeliverClick,
  onAcceptClick,
  onRejectClick,
  onStartClick,
  onEditClick,
  onDeleteClick,
  className,
}: MilestoneListCardProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Toggle expand
  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Sort milestones by sequence
  const sortedMilestones = [...milestones].sort(
    (a, b) => a.sequence - b.sequence
  );

  // Calculate totals
  const totalAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
  const releasedAmount = milestones
    .filter((m) => m.status === 'ACCEPTED' && m.paymentReleasedAt)
    .reduce((sum, m) => sum + m.amount, 0);
  const completedCount = milestones.filter(
    (m) => m.status === 'ACCEPTED'
  ).length;

  return (
    <Card className={cn('p-6', className)}>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Milestone Detayları
          </h3>
          <p className="mt-1 text-sm text-gray-600">
            {completedCount} / {milestones.length} milestone tamamlandı
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Toplam Tutar</p>
          <p className="text-lg font-bold text-gray-900">
            {formatCurrency(totalAmount, currency)}
          </p>
          <p className="text-xs text-green-600">
            {formatCurrency(releasedAmount, currency)} ödendi
          </p>
        </div>
      </div>

      {/* Milestone List */}
      <div className="space-y-3">
        {sortedMilestones.map((milestone) => {
          const config = STATUS_CONFIG[milestone.status];
          const isExpanded = expandedIds.has(milestone.id);
          const isOverdue = isMilestoneOverdue(milestone);
          const actionHint = getActionHint(milestone, userRole);
          const hasActions =
            (userRole === 'seller' &&
              ['PENDING', 'IN_PROGRESS', 'REVISION_REQUESTED'].includes(
                milestone.status
              )) ||
            (userRole === 'buyer' && milestone.status === 'DELIVERED');

          return (
            <div
              key={milestone.id}
              className={cn(
                'rounded-lg border-2 transition-all',
                config.borderColor,
                config.bgColor,
                isOverdue && 'border-red-300',
                hasActions && 'ring-opacity-30 ring-2 ring-blue-400'
              )}
            >
              {/* Header */}
              <div
                className="flex cursor-pointer items-center justify-between p-4"
                onClick={() => toggleExpand(milestone.id)}
              >
                {/* Left: Info */}
                <div className="flex flex-1 items-center gap-3">
                  {/* Icon */}
                  <div
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full',
                      config.color.replace('text-', 'text-'),
                      config.bgColor.replace('bg-', 'bg-').replace('50', '100')
                    )}
                  >
                    {config.icon}
                  </div>

                  {/* Title & Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">
                        Aşama {milestone.sequence}
                      </span>
                      <h4 className="truncate font-semibold text-gray-900">
                        {milestone.title}
                      </h4>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <Badge variant={config.variant} size="sm">
                        {config.label}
                      </Badge>
                      <span className="text-sm font-semibold text-gray-900">
                        {formatCurrency(milestone.amount, currency)}
                      </span>
                      {milestone.dueDate && (
                        <span
                          className={cn(
                            'text-xs',
                            isOverdue && milestone.status !== 'ACCEPTED'
                              ? 'font-semibold text-red-600'
                              : 'text-gray-500'
                          )}
                        >
                          {isOverdue && milestone.status !== 'ACCEPTED' && (
                            <AlertTriangle className="mr-1 inline h-3 w-3" />
                          )}
                          {formatDate(milestone.dueDate)}
                        </span>
                      )}
                    </div>
                    {actionHint && (
                      <p className="mt-1 text-xs font-medium text-blue-600">
                        → {actionHint}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Expand Icon */}
                <button className="ml-2 text-gray-400 hover:text-gray-600">
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="space-y-4 border-t border-gray-200 p-4">
                  {/* Description */}
                  {milestone.description && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">
                        Açıklama
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {milestone.description}
                      </p>
                    </div>
                  )}

                  {/* Delivery Notes */}
                  {milestone.deliveryNotes && (
                    <div>
                      <label className="flex items-center gap-1 text-xs font-medium text-gray-600">
                        <FileText className="h-3 w-3" />
                        Teslimat Notu
                      </label>
                      <p className="mt-1 rounded border bg-white p-3 text-sm whitespace-pre-wrap text-gray-900">
                        {milestone.deliveryNotes}
                      </p>
                    </div>
                  )}

                  {/* Attachments */}
                  {milestone.attachments && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">
                        Ekler
                      </label>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {milestone.attachments.split(',').map((url, i) => (
                          <a
                            key={i}
                            href={url.trim()}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Ek #{i + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="space-y-2 rounded border bg-white p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Oluşturulma</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(milestone.createdAt)}
                      </span>
                    </div>
                    {milestone.deliveredAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Teslim</span>
                        <span className="font-medium text-gray-900">
                          {formatDate(milestone.deliveredAt)}
                        </span>
                      </div>
                    )}
                    {milestone.acceptedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-green-600">Onaylandı</span>
                        <span className="font-medium text-green-700">
                          {formatDate(milestone.acceptedAt)}
                        </span>
                      </div>
                    )}
                    {milestone.paymentReleasedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-green-600">Ödeme Yapıldı</span>
                        <span className="font-medium text-green-700">
                          {formatDate(milestone.paymentReleasedAt)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {/* Seller Actions */}
                    {userRole === 'seller' && (
                      <>
                        {/* Edit & Delete (only for PENDING/IN_PROGRESS) */}
                        {(milestone.status === 'PENDING' ||
                          milestone.status === 'IN_PROGRESS') && (
                          <>
                            {onEditClick && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEditClick(milestone)}
                              >
                                <Edit className="mr-1 h-4 w-4" />
                                Düzenle
                              </Button>
                            )}
                            {onDeleteClick && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDeleteClick(milestone)}
                                className="border-red-300 text-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="mr-1 h-4 w-4" />
                                Sil
                              </Button>
                            )}
                          </>
                        )}

                        {milestone.status === 'PENDING' && onStartClick && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => onStartClick(milestone)}
                          >
                            <Loader2 className="mr-1 h-4 w-4" />
                            İşe Başla
                          </Button>
                        )}
                        {(milestone.status === 'IN_PROGRESS' ||
                          milestone.status === 'REVISION_REQUESTED') && (
                          <UnifiedDeliveryButton
                            mode="milestone"
                            milestoneId={milestone.id}
                            orderId={orderId}
                            title="Teslim Et"
                            subtitle={milestone.title}
                            variant="primary"
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onSuccess={() => {
                              // Parent will reload order after delivery
                              onDeliverClick?.(milestone);
                            }}
                          />
                        )}
                      </>
                    )}

                    {/* Buyer Actions */}
                    {userRole === 'buyer' &&
                      milestone.status === 'DELIVERED' && (
                        <>
                          {onAcceptClick && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => onAcceptClick(milestone)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Onayla
                            </Button>
                          )}
                          {onRejectClick && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onRejectClick(milestone)}
                            >
                              <RefreshCw className="mr-1 h-4 w-4" />
                              Revizyon İste
                            </Button>
                          )}
                        </>
                      )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {milestones.length === 0 && (
        <div className="py-12 text-center">
          <Package className="mx-auto h-16 w-16 text-gray-300" />
          <p className="mt-4 text-sm font-medium text-gray-900">
            Milestone Bulunamadı
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Bu sipariş için henüz milestone tanımlanmamış
          </p>
        </div>
      )}
    </Card>
  );
}
