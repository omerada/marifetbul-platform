/**
 * ================================================
 * MILESTONE PAYMENT CARD - Sprint 1 Story 1.6
 * ================================================
 * Displays milestone payment details with escrow breakdown
 * Shows pending balance breakdown for milestone-based orders
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Milestone Payment System
 */

'use client';

import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
  DollarSign,
  Clock,
  CheckCircle2,
  Lock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency } from '@/lib/shared/formatters';
import type { OrderMilestone } from '@/types/business/features/milestone';

// ================================================
// TYPES
// ================================================

export interface MilestonePaymentCardProps {
  /** Array of milestones for the order */
  milestones: OrderMilestone[];

  /** Total order amount */
  totalAmount: number;

  /** Currency code */
  currency?: string;

  /** Loading state */
  isLoading?: boolean;

  /** Additional CSS classes */
  className?: string;
}

interface PaymentBreakdown {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  remainingAmount: number;
  completedCount: number;
  totalCount: number;
}

// ================================================
// HELPERS
// ================================================

function calculatePaymentBreakdown(
  milestones: OrderMilestone[],
  totalAmount: number
): PaymentBreakdown {
  const completedMilestones = milestones.filter((m) => m.status === 'ACCEPTED');
  const deliveredMilestones = milestones.filter(
    (m) => m.status === 'DELIVERED'
  );

  const paidAmount = completedMilestones.reduce((sum, m) => sum + m.amount, 0);
  const pendingAmount = deliveredMilestones.reduce(
    (sum, m) => sum + m.amount,
    0
  );
  const remainingAmount = totalAmount - paidAmount - pendingAmount;

  return {
    totalAmount,
    paidAmount,
    pendingAmount,
    remainingAmount,
    completedCount: completedMilestones.length,
    totalCount: milestones.length,
  };
}

// ================================================
// SUB-COMPONENTS
// ================================================

interface BreakdownItemProps {
  icon: React.ReactNode;
  label: string;
  amount: number;
  currency: string;
  color: string;
  count?: string;
}

function BreakdownItem({
  icon,
  label,
  amount,
  currency,
  color,
  count,
}: BreakdownItemProps) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
      <div className="flex items-center gap-3">
        <div className={`rounded-lg p-2 ${color}`}>{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          {count && <p className="text-xs text-gray-500">{count}</p>}
        </div>
      </div>
      <p className="text-lg font-bold text-gray-900">
        {formatCurrency(amount, currency)}
      </p>
    </div>
  );
}

// ================================================
// MAIN COMPONENT
// ================================================

/**
 * MilestonePaymentCard Component
 *
 * Displays escrow balance breakdown for milestone-based orders
 * Shows: paid, pending (delivered awaiting acceptance), remaining
 *
 * @example
 * ```tsx
 * <MilestonePaymentCard
 *   milestones={orderMilestones}
 *   totalAmount={5000}
 *   currency="TRY"
 * />
 * ```
 */
export function MilestonePaymentCard({
  milestones,
  totalAmount,
  currency = 'TRY',
  isLoading = false,
  className = '',
}: MilestonePaymentCardProps) {
  // Calculate breakdown
  const breakdown = useMemo(
    () => calculatePaymentBreakdown(milestones, totalAmount),
    [milestones, totalAmount]
  );

  // Calculate progress percentage
  const progress = (breakdown.paidAmount / totalAmount) * 100;

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-1/2 rounded bg-gray-200" />
            <div className="h-16 rounded bg-gray-200" />
            <div className="h-16 rounded bg-gray-200" />
            <div className="h-16 rounded bg-gray-200" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <span>Milestone Ödeme Durumu</span>
          </CardTitle>
          <Badge variant="outline" className="bg-white">
            {breakdown.completedCount}/{breakdown.totalCount} Tamamlandı
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="mb-2 flex justify-between text-sm">
            <span className="text-gray-600">İlerleme</span>
            <span className="font-semibold text-purple-600">
              %{progress.toFixed(0)}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-6">
        {/* Paid Amount */}
        <BreakdownItem
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          label="Ödenen Tutar"
          amount={breakdown.paidAmount}
          currency={currency}
          color="bg-green-100"
          count={`${breakdown.completedCount} milestone onaylandı`}
        />

        {/* Pending Amount (Delivered, awaiting acceptance) */}
        {breakdown.pendingAmount > 0 && (
          <BreakdownItem
            icon={<Clock className="h-5 w-5 text-yellow-600" />}
            label="Onay Bekliyor"
            amount={breakdown.pendingAmount}
            currency={currency}
            color="bg-yellow-100"
            count="Teslim edildi, onay bekleniyor"
          />
        )}

        {/* Remaining Amount (Not yet delivered) */}
        {breakdown.remainingAmount > 0 && (
          <BreakdownItem
            icon={<Lock className="h-5 w-5 text-gray-600" />}
            label="Escrow'da Kilitli"
            amount={breakdown.remainingAmount}
            currency={currency}
            color="bg-gray-100"
            count="Henüz teslim edilmedi"
          />
        )}

        {/* Total Amount Summary */}
        <div className="mt-4 rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-gray-700">
                Toplam Sipariş Tutarı
              </span>
            </div>
            <span className="text-2xl font-bold text-purple-600">
              {formatCurrency(totalAmount, currency)}
            </span>
          </div>
        </div>

        {/* Info Note */}
        <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm text-gray-600">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600" />
          <p>
            Her milestone onaylandığında, tutar otomatik olarak escrow&apos;dan
            serbest bırakılır ve freelancer&apos;ın cüzdanına aktarılır.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export default MilestonePaymentCard;
