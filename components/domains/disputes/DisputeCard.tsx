/**
 * ================================================
 * DISPUTE CARD COMPONENT
 * ================================================
 * Individual dispute card for list view
 *
 * Features:
 * - Dispute summary information
 * - Status badge
 * - Action buttons
 * - Timestamp display
 * - Order information
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 16: Dispute System Completion
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import type { DisputeResponse } from '@/types/dispute';
import {
  disputeStatusLabels,
  disputeStatusColors,
  disputeReasonLabels,
} from '@/types/dispute';
import {
  AlertTriangle,
  Clock,
  FileText,
  ChevronRight,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

// ================================================
// TYPES
// ================================================

interface DisputeCardProps {
  dispute: DisputeResponse;
  onClick?: () => void;
  showOrderInfo?: boolean;
  className?: string;
}

// ================================================
// COMPONENT
// ================================================

export function DisputeCard({
  dispute,
  onClick,
  showOrderInfo = true,
  className = '',
}: DisputeCardProps) {
  const isResolved = dispute.status === 'RESOLVED';
  const isClosed = dispute.status === 'CLOSED';
  const isActive = !isResolved && !isClosed;

  return (
    <Card
      className={`overflow-hidden transition-all hover:shadow-md ${className}`}
    >
      <div className="p-5">
        {/* Header: Status Badge & Date */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex items-center gap-2">
            {/* Status Icon */}
            {isResolved && <CheckCircle className="h-5 w-5 text-green-600" />}
            {isClosed && <XCircle className="h-5 w-5 text-gray-600" />}
            {isActive && <AlertTriangle className="h-5 w-5 text-red-600" />}

            {/* Status Badge */}
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${disputeStatusColors[dispute.status]}`}
            >
              {disputeStatusLabels[dispute.status]}
            </span>
          </div>

          {/* Created Date */}
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3.5 w-3.5" />
            <span>
              {formatDistanceToNow(new Date(dispute.createdAt), {
                addSuffix: true,
                locale: tr,
              })}
            </span>
          </div>
        </div>

        {/* Order Info */}
        {showOrderInfo && (
          <div className="mb-3 rounded-lg bg-gray-50 p-3">
            <div className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="font-medium text-gray-700">
                Sipariş: #{dispute.orderId.slice(0, 8)}
              </span>
            </div>
          </div>
        )}

        {/* Reason & Description */}
        <div className="mb-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Sebep:</span>
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
              {disputeReasonLabels[dispute.reason]}
            </span>
          </div>

          <p className="line-clamp-2 text-sm text-gray-600">
            {dispute.description}
          </p>
        </div>

        {/* Evidence Count */}
        {dispute.evidenceUrls && dispute.evidenceUrls.length > 0 && (
          <div className="mb-4 flex items-center gap-1 text-xs text-gray-500">
            <FileText className="h-3.5 w-3.5" />
            <span>{dispute.evidenceUrls.length} kanıt dosyası</span>
          </div>
        )}

        {/* Raised By */}
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
          <span>Açan:</span>
          <span className="font-medium text-gray-800">
            {dispute.raisedByUserFullName}
          </span>
        </div>

        {/* Resolution Info (if resolved) */}
        {isResolved && dispute.resolution && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3">
            <div className="mb-1 text-xs font-medium text-green-700">
              Çözüm:
            </div>
            <p className="text-sm text-green-800">{dispute.resolution}</p>
            {dispute.resolvedByUserFullName && (
              <div className="mt-2 text-xs text-green-600">
                Çözümleyen: {dispute.resolvedByUserFullName}
              </div>
            )}
          </div>
        )}

        {/* Footer: Action Buttons */}
        <div className="flex items-center justify-between border-t pt-4">
          <Link href={`/disputes/${dispute.id}`} className="w-full">
            <Button variant="outline" size="sm" className="w-full">
              <span>Detayları Gör</span>
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          {isActive && onClick && (
            <Button
              variant="primary"
              size="sm"
              onClick={onClick}
              className="ml-2"
            >
              Kanıt Ekle
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Accent Border */}
      <div
        className={`h-1 ${
          isResolved ? 'bg-green-500' : isClosed ? 'bg-gray-400' : 'bg-red-500'
        }`}
      />
    </Card>
  );
}

export default DisputeCard;
