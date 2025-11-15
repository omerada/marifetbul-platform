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
import { useOrderMilestones, useMilestoneActions } from '@/hooks/business/useMilestones';
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

  // Role-based action permissions
  const showStartButton = isFreelancer && canStartMilestone(milestone);
  const showDeliverButton = isFreelancer && canDeliverMilestone(milestone);
  const showAcceptButton = isEmployer && canAcceptMilestone(milestone);
  const showRejectButton = isEmployer && canRejectMilestone(milestone);

  return (
    <Card className="p-6 border-l-4" style={{ borderLeftColor: statusColor }}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-700 font-semibold text-sm">
              {milestone.sequence}
            </span>
            <h3 className="text-lg font-semibold text-gray-900">
              {milestone.title}
            </h3>
          </div>
          {milestone.description && (
            <p className="text-sm text-gray-600 ml-11">{milestone.description}</p>
          )}
        </div>

        {/* Status Badge */}
        <Badge
          variant="outline"
          className="ml-4"
          style={{ borderColor: statusColor, color: statusColor }}
        >
          {statusText}
        </Badge>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 ml-11 mb-4">
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
        <div className="ml-11 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
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
      {milestone.status === MilestoneStatus.REVISION_REQUESTED && milestone.deliveryNotes && (
        <Alert variant="destructive" className="ml-11 mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Revizyon İstendi:</strong> {milestone.deliveryNotes}
          </AlertDescription>
        </Alert>
      )}

      {/* Action Buttons */}
      {(showStartButton || showDeliverButton || showAcceptButton || showRejectButton) && (
        <div className="flex items-center gap-3 ml-11 mt-4 pt-4 border-t">
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
              className="gap-2 text-red-600 hover:text-red-700 hover:border-red-600"
            >
              <XCircle className="h-4 w-4" />
              Revizyon İste
            </Button>
          )}
        </div>
      )}

      {/* Timestamps */}
      <div className="ml-11 mt-4 pt-4 border-t text-xs text-gray-500 space-y-1">
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
  const {
    startMilestone,
    acceptMilestone,
    isStarting,
    isAccepting,
  } = useMilestoneActions();

  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | null>(null);

  // ========== HANDLERS ==========

  const handleStart = async (milestoneId: string) => {
    try {
      setSelectedMilestoneId(milestoneId);
      await startMilestone(milestoneId);
    } catch (error) {
      logger.error('[MilestoneList] Start failed', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setSelectedMilestoneId(null);
    }
  };

  const handleDeliver = (milestoneId: string) => {
    setSelectedMilestoneId(milestoneId);
    // TODO: Open DeliverMilestoneModal (Story 1.4)
    logger.info('[MilestoneList] Deliver clicked - modal TODO', { milestoneId });
  };

  const handleAccept = async (milestoneId: string) => {
    try {
      setSelectedMilestoneId(milestoneId);
      await acceptMilestone(milestoneId);
    } catch (error) {
      logger.error('[MilestoneList] Accept failed', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setSelectedMilestoneId(null);
    }
  };

  const handleReject = (milestoneId: string) => {
    setSelectedMilestoneId(milestoneId);
    // TODO: Open RejectMilestoneModal (Story 1.6)
    logger.info('[MilestoneList] Reject clicked - modal TODO', { milestoneId });
  };

  // ========== LOADING STATE ==========

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-100 rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-gray-100 rounded w-1/2"></div>
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
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Henüz Milestone Eklenmemiş
        </h3>
        <p className="text-sm text-gray-600 mb-4">
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
    selectedMilestoneId === id && (isStarting || isAccepting);

  // Calculate progress
  const completedCount = milestones.filter(
    (m) => m.status === MilestoneStatus.ACCEPTED
  ).length;
  const progressPercent = Math.round((completedCount / milestones.length) * 100);

  return (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="flex items-center justify-between mb-3">
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
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </Card>

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
        {milestones.map((milestone) => (
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
        ))}
      </div>
    </div>
  );
}

export default MilestoneList;
