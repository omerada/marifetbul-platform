/**
 * ================================================
 * MILESTONE LIST COMPONENT
 * ================================================
 * Display and manage milestones for an order
 * Sprint 1 - Story 1.1
 *
 * Features:
 * - Timeline visualization
 * - Status indicators
 * - Role-based actions
 * - Progress tracking
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Milestone Payment System
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import {
  CheckCircle2,
  Clock,
  Play,
  Upload,
  XCircle,
  AlertCircle,
  Calendar,
  DollarSign,
  FileText,
} from 'lucide-react';
import {
  useOrderMilestones,
  useMilestoneActions,
} from '@/hooks/business/useMilestones';
import {
  OrderMilestone,
  MilestoneStatus,
  formatMilestoneAmount,
  getMilestoneStatusColor,
  getMilestoneStatusText,
  canStartMilestone,
  canDeliverMilestone,
  canAcceptMilestone,
  canRejectMilestone,
} from '@/types/business/features/milestone';
import { formatDate } from '@/lib/shared/utils/date';
import logger from '@/lib/infrastructure/monitoring/logger';
import { useAutoAcceptanceCountdown } from '@/hooks/business/useAutoAcceptanceCountdown';
import { DeliverMilestoneModal } from './DeliverMilestoneModal';
import { AcceptMilestoneModal } from './AcceptMilestoneModal';
import { RejectMilestoneModal } from './RejectMilestoneModal';

// ============================================================================
// TYPES
// ============================================================================

export interface MilestoneListProps {
  /** Order ID */
  orderId: string;
  /** Current user role for the order */
  userRole: 'FREELANCER' | 'EMPLOYER';
  /** Show create milestone button (for freelancer during order creation) */
  showCreateButton?: boolean;
  /** Callback when create milestone clicked */
  onCreateClick?: () => void;
}

// ============================================================================
// MILESTONE CARD COMPONENT
// ============================================================================

interface MilestoneCardProps {
  milestone: OrderMilestone;
  userRole: 'FREELANCER' | 'EMPLOYER';
  onStart: (id: string) => void;
  onDeliver: (id: string) => void;
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  isLoading: boolean;
}

function MilestoneCard({
  milestone,
  userRole,
  onStart,
  onDeliver,
  onAccept,
  onReject,
  isLoading,
}: MilestoneCardProps) {
  const statusColor = getMilestoneStatusColor(milestone.status);
  const statusText = getMilestoneStatusText(milestone.status);
  const isFreelancer = userRole === 'FREELANCER';
  const isEmployer = userRole === 'EMPLOYER';

  // Sprint 1 Story 1.8: Auto-acceptance countdown
  const countdown = useAutoAcceptanceCountdown(
    milestone.deliveredAt,
    milestone.status
  );

  // Role-based action permissions
  const showStartButton = isFreelancer && canStartMilestone(milestone);
  const showDeliverButton = isFreelancer && canDeliverMilestone(milestone);
  const showAcceptButton = isEmployer && canAcceptMilestone(milestone);
  const showRejectButton = isEmployer && canRejectMilestone(milestone);

  return (
    <Card className="border-l-4 p-6" style={{ borderLeftColor: statusColor }}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700">
              {milestone.sequence}
            </span>
            <h3 className="text-lg font-semibold text-gray-900">
              {milestone.title}
            </h3>
          </div>
          {milestone.description && (
            <p className="ml-11 text-sm text-gray-600">
              {milestone.description}
            </p>
          )}
        </div>

        {/* Status Badge */}
        <div className="ml-4 flex flex-col items-end gap-2">
          <Badge
            variant="outline"
            style={{ borderColor: statusColor, color: statusColor }}
          >
            {statusText}
          </Badge>

          {/* Sprint 1 Story 1.8: Auto-acceptance countdown */}
          {countdown &&
            !countdown.isExpired &&
            milestone.status === 'DELIVERED' && (
              <Badge
                variant="outline"
                className={`text-xs ${
                  countdown.hours < 24
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-yellow-300 bg-yellow-50 text-yellow-700'
                }`}
              >
                <Clock className="mr-1 h-3 w-3" />
                Otomatik onay: {countdown.formattedTime}
              </Badge>
            )}
        </div>
      </div>

      {/* Metadata */}
      <div className="mb-4 ml-11 grid grid-cols-2 gap-4">
        {/* Amount */}
        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-900">
            {formatMilestoneAmount(milestone.amount, milestone.currency)}
          </span>
        </div>

        {/* Due Date */}
        {milestone.dueDate && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              Teslim: {formatDate(milestone.dueDate)}
            </span>
          </div>
        )}
      </div>

      {/* Delivery Files */}
      {milestone.attachments && milestone.attachments.length > 0 && (
        <div className="mb-4 ml-11">
          <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
            <FileText className="h-4 w-4" />
            <span className="font-medium">Teslim Edilen Dosyalar:</span>
          </div>
          <div className="space-y-1">
            {milestone.attachments.map((file: string, index: number) => (
              <a
                key={index}
                href={file}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-purple-600 hover:text-purple-700 hover:underline"
              >
                📎 {file.split('/').pop()}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Revision Request */}
      {milestone.status === MilestoneStatus.REVISION_REQUESTED &&
        milestone.deliveryNotes && (
          <Alert variant="destructive" className="mb-4 ml-11">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Revizyon İstendi:</strong> {milestone.deliveryNotes}
            </AlertDescription>
          </Alert>
        )}

      {/* Action Buttons */}
      {(showStartButton ||
        showDeliverButton ||
        showAcceptButton ||
        showRejectButton) && (
        <div className="mt-4 ml-11 flex items-center gap-3 border-t pt-4">
          {showStartButton && (
            <Button
              onClick={() => onStart(milestone.id)}
              disabled={isLoading}
              loading={isLoading}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Play className="h-4 w-4" />
              İşe Başla
            </Button>
          )}

          {showDeliverButton && (
            <Button
              onClick={() => onDeliver(milestone.id)}
              disabled={isLoading}
              loading={isLoading}
              variant="primary"
              size="sm"
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Teslim Et
            </Button>
          )}

          {showAcceptButton && (
            <Button
              onClick={() => onAccept(milestone.id)}
              disabled={isLoading}
              loading={isLoading}
              variant="primary"
              size="sm"
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Onayla & Ödemeyi Serbest Bırak
            </Button>
          )}

          {showRejectButton && (
            <Button
              onClick={() => onReject(milestone.id)}
              disabled={isLoading}
              loading={isLoading}
              variant="outline"
              size="sm"
              className="gap-2 text-red-600 hover:border-red-600 hover:text-red-700"
            >
              <XCircle className="h-4 w-4" />
              Revizyon İste
            </Button>
          )}
        </div>
      )}

      {/* Timestamps */}
      <div className="mt-4 ml-11 space-y-1 border-t pt-4 text-xs text-gray-500">
        {milestone.deliveredAt && (
          <div>Teslim Edildi: {formatDate(milestone.deliveredAt)}</div>
        )}
        {milestone.acceptedAt && (
          <div>Onaylandı: {formatDate(milestone.acceptedAt)}</div>
        )}
        <div>Oluşturuldu: {formatDate(milestone.createdAt)}</div>
      </div>
    </Card>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * MilestoneList Component
 *
 * @example
 * ```tsx
 * <MilestoneList
 *   orderId="123e4567-e89b-12d3-a456-426614174000"
 *   userRole="FREELANCER"
 * />
 * ```
 */
export function MilestoneList({
  orderId,
  userRole,
  showCreateButton = false,
  onCreateClick,
}: MilestoneListProps) {
  const { milestones, isLoading, error } = useOrderMilestones(orderId);
  const { startMilestone, acceptMilestone, isStarting, isAccepting } =
    useMilestoneActions();

  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(
    null
  );
  const [deliverModalMilestone, setDeliverModalMilestone] =
    useState<OrderMilestone | null>(null);
  const [acceptModalMilestone, setAcceptModalMilestone] =
    useState<OrderMilestone | null>(null);
  const [rejectModalMilestone, setRejectModalMilestone] =
    useState<OrderMilestone | null>(null);

  // Sprint 1.2: Filter and sort state
  const [statusFilter, setStatusFilter] = useState<MilestoneStatus | 'ALL'>(
    'ALL'
  );
  const [sortBy, setSortBy] = useState<'sequence' | 'dueDate'>('sequence');

  // ========== HANDLERS ==========

  const handleStart = async (milestoneId: string) => {
    try {
      setSelectedMilestoneId(milestoneId);
      await startMilestone(milestoneId);
    } catch (error) {
      logger.error(
        '[MilestoneList] Start failed',
        error instanceof Error ? error : new Error(String(error))
      );
    } finally {
      setSelectedMilestoneId(null);
    }
  };

  const handleDeliver = (milestoneId: string) => {
    const milestone = milestones?.find((m) => m.id === milestoneId);
    if (milestone) {
      setDeliverModalMilestone(milestone);
    }
  };

  const handleAccept = (milestoneId: string) => {
    const milestone = milestones?.find((m) => m.id === milestoneId);
    if (milestone) {
      setAcceptModalMilestone(milestone);
    }
  };

  const handleReject = (milestoneId: string) => {
    const milestone = milestones?.find((m) => m.id === milestoneId);
    if (milestone) {
      setRejectModalMilestone(milestone);
    }
  };

  // ========== LOADING STATE ==========

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse p-6">
            <div className="mb-4 h-6 w-1/3 rounded bg-gray-200"></div>
            <div className="mb-2 h-4 w-2/3 rounded bg-gray-100"></div>
            <div className="h-4 w-1/2 rounded bg-gray-100"></div>
          </Card>
        ))}
      </div>
    );
  }

  // ========== ERROR STATE ==========

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Milestone&apos;lar yüklenirken hata oluştu: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  // ========== EMPTY STATE ==========

  if (!milestones || milestones.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Clock className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-900">
          Henüz Milestone Eklenmemiş
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Bu sipariş için henüz milestone tanımlanmamış.
        </p>
        {showCreateButton && onCreateClick && (
          <Button onClick={onCreateClick} variant="primary">
            İlk Milestone&apos;u Ekle
          </Button>
        )}
      </Card>
    );
  }

  // ========== MILESTONE LIST ==========

  const isActionLoading = (id: string) =>
    selectedMilestoneId === id && isStarting;

  // Sprint 1.2: Filter and sort milestones
  const filteredMilestones = milestones
    .filter((m) => statusFilter === 'ALL' || m.status === statusFilter)
    .sort((a, b) => {
      if (sortBy === 'sequence') {
        return a.sequence - b.sequence;
      } else {
        // Sort by due date
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
    });

  // Calculate progress
  const completedCount = milestones.filter(
    (m) => m.status === MilestoneStatus.ACCEPTED
  ).length;
  const progressPercent = Math.round(
    (completedCount / milestones.length) * 100
  );

  return (
    <>
      {/* Deliver Modal */}
      {deliverModalMilestone && (
        <DeliverMilestoneModal
          milestone={deliverModalMilestone}
          onClose={() => setDeliverModalMilestone(null)}
          onSuccess={() => {
            // Modal will trigger SWR revalidation via useMilestoneActions
            logger.info('[MilestoneList] Milestone delivered successfully');
          }}
        />
      )}

      {/* Accept Modal */}
      {acceptModalMilestone && (
        <AcceptMilestoneModal
          milestone={acceptModalMilestone}
          onClose={() => setAcceptModalMilestone(null)}
          onSuccess={() => {
            logger.info('[MilestoneList] Milestone accepted successfully');
          }}
        />
      )}

      {/* Reject Modal */}
      {rejectModalMilestone && (
        <RejectMilestoneModal
          milestone={rejectModalMilestone}
          onClose={() => setRejectModalMilestone(null)}
          onSuccess={() => {
            logger.info('[MilestoneList] Milestone revision requested');
          }}
        />
      )}

      <div className="space-y-6">
        {/* Progress Summary */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 p-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Milestone İlerlemesi
              </h3>
              <p className="text-sm text-gray-600">
                {completedCount} / {milestones.length} tamamlandı
              </p>
            </div>
            <div className="text-3xl font-bold text-purple-600">
              {progressPercent}%
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </Card>

        {/* Sprint 1.2: Filters and Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Durum:</label>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as MilestoneStatus | 'ALL')
              }
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              <option value="ALL">Tümü ({milestones.length})</option>
              <option value={MilestoneStatus.PENDING}>
                Beklemede (
                {
                  milestones.filter((m) => m.status === MilestoneStatus.PENDING)
                    .length
                }
                )
              </option>
              <option value={MilestoneStatus.IN_PROGRESS}>
                Devam Ediyor (
                {
                  milestones.filter(
                    (m) => m.status === MilestoneStatus.IN_PROGRESS
                  ).length
                }
                )
              </option>
              <option value={MilestoneStatus.DELIVERED}>
                Teslim Edildi (
                {
                  milestones.filter(
                    (m) => m.status === MilestoneStatus.DELIVERED
                  ).length
                }
                )
              </option>
              <option value={MilestoneStatus.ACCEPTED}>
                Onaylandı (
                {
                  milestones.filter(
                    (m) => m.status === MilestoneStatus.ACCEPTED
                  ).length
                }
                )
              </option>
              <option value={MilestoneStatus.REVISION_REQUESTED}>
                Revizyon (
                {
                  milestones.filter(
                    (m) => m.status === MilestoneStatus.REVISION_REQUESTED
                  ).length
                }
                )
              </option>
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">
              Sıralama:
            </label>
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'sequence' | 'dueDate')
              }
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            >
              <option value="sequence">Sıra Numarasına Göre</option>
              <option value="dueDate">Teslim Tarihine Göre</option>
            </select>
          </div>

          {/* Result Count */}
          <div className="text-sm text-gray-600">
            {filteredMilestones.length} milestone gösteriliyor
          </div>
        </div>

        {/* Create Button (Optional) */}
        {showCreateButton && onCreateClick && (
          <div className="flex justify-end">
            <Button onClick={onCreateClick} variant="outline" size="sm">
              + Yeni Milestone Ekle
            </Button>
          </div>
        )}

        {/* Milestone Cards */}
        <div className="space-y-4">
          {filteredMilestones.length > 0 ? (
            filteredMilestones.map((milestone) => (
              <MilestoneCard
                key={milestone.id}
                milestone={milestone}
                userRole={userRole}
                onStart={handleStart}
                onDeliver={handleDeliver}
                onAccept={handleAccept}
                onReject={handleReject}
                isLoading={isActionLoading(milestone.id)}
              />
            ))
          ) : (
            <Card className="p-8 text-center">
              <AlertCircle className="mx-auto mb-3 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">
                Seçilen filtreye uygun milestone bulunamadı
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatusFilter('ALL')}
                className="mt-4"
              >
                Filtreyi Temizle
              </Button>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

export default MilestoneList;
