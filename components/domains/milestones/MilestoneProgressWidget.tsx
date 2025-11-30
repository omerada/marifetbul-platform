/**
 * ================================================
 * MILESTONE PROGRESS WIDGET - Sprint 1 Story 1.7
 * ================================================
 * Dashboard widget showing milestone completion progress
 * Displays pending, completed, and overdue milestones
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Milestone Payment System
 */

'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Badge } from '@/components/ui';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Package,
} from 'lucide-react';
import { formatCurrency } from '@/lib/shared/formatters';
import type { OrderMilestone } from '@/types/business/features/milestone';

// ================================================
// TYPES
// ================================================

export interface MilestoneProgressWidgetProps {
  /** Array of all active milestones */
  milestones: OrderMilestone[];

  /** Currency code */
  currency?: string;

  /** User role for filtering */
  role: 'FREELANCER' | 'EMPLOYER';

  /** Loading state */
  isLoading?: boolean;

  /** Additional CSS classes */
  className?: string;

  /** Show detailed breakdown */
  showDetails?: boolean;
}

interface MilestoneStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  totalValue: number;
  completedValue: number;
  pendingValue: number;
}

// ================================================
// HELPERS
// ================================================

function calculateMilestoneStats(milestones: OrderMilestone[]): MilestoneStats {
  const now = new Date();

  const completed = milestones.filter((m) => m.status === 'ACCEPTED');
  const pending = milestones.filter((m) => m.status === 'DELIVERED');
  const overdue = milestones.filter(
    (m) => m.status === 'IN_PROGRESS' && m.dueDate && new Date(m.dueDate) < now
  );

  return {
    total: milestones.length,
    completed: completed.length,
    pending: pending.length,
    overdue: overdue.length,
    totalValue: milestones.reduce((sum, m) => sum + m.amount, 0),
    completedValue: completed.reduce((sum, m) => sum + m.amount, 0),
    pendingValue: pending.reduce((sum, m) => sum + m.amount, 0),
  };
}

// ================================================
// SUB-COMPONENTS
// ================================================

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  count: number;
  value?: number;
  currency?: string;
  color: string;
}

function StatItem({
  icon,
  label,
  count,
  value,
  currency,
  color,
}: StatItemProps) {
  return (
    <div className={`rounded-lg p-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <Badge variant="outline" className="bg-white">
          {count}
        </Badge>
      </div>
      {value !== undefined && currency && (
        <p className="mt-2 text-lg font-bold text-gray-900">
          {formatCurrency(value, currency)}
        </p>
      )}
    </div>
  );
}

// ================================================
// MAIN COMPONENT
// ================================================

/**
 * MilestoneProgressWidget Component
 *
 * Dashboard widget for milestone progress tracking
 * Shows completed, pending acceptance, and overdue counts
 *
 * @example
 * ```tsx
 * <MilestoneProgressWidget
 *   milestones={activeMilestones}
 *   role="FREELANCER"
 *   currency="TRY"
 *   showDetails
 * />
 * ```
 */
export function MilestoneProgressWidget({
  milestones,
  currency = 'TRY',
  role,
  isLoading = false,
  className = '',
  showDetails = false,
}: MilestoneProgressWidgetProps) {
  // Calculate stats
  const stats = calculateMilestoneStats(milestones);
  const completionRate =
    stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

  // Loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-1/2 rounded bg-gray-200" />
            <div className="h-24 rounded bg-gray-200" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-20 rounded bg-gray-200" />
              <div className="h-20 rounded bg-gray-200" />
            </div>
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
            <Package className="h-5 w-5 text-purple-600" />
            <span>Milestone İlerlemesi</span>
          </CardTitle>
          <Badge
            variant={stats.overdue > 0 ? 'destructive' : 'outline'}
            className={stats.overdue === 0 ? 'bg-white' : ''}
          >
            {stats.total} Toplam
          </Badge>
        </div>

        {/* Overall Progress */}
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-gray-600">Genel Tamamlanma</span>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-purple-600">
                %{completionRate.toFixed(0)}
              </span>
            </div>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 p-6">
        {/* Completed Milestones */}
        <StatItem
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          label="Tamamlandı"
          count={stats.completed}
          value={showDetails ? stats.completedValue : undefined}
          currency={currency}
          color="bg-green-50"
        />

        {/* Pending Acceptance (for employer) */}
        {role === 'EMPLOYER' && stats.pending > 0 && (
          <StatItem
            icon={<Clock className="h-5 w-5 text-yellow-600" />}
            label="Onay Bekliyor"
            count={stats.pending}
            value={showDetails ? stats.pendingValue : undefined}
            currency={currency}
            color="bg-yellow-50"
          />
        )}

        {/* Overdue Milestones */}
        {stats.overdue > 0 && (
          <StatItem
            icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
            label="Gecikmiş"
            count={stats.overdue}
            color="bg-red-50"
          />
        )}

        {/* No milestones message */}
        {stats.total === 0 && (
          <div className="py-8 text-center text-gray-500">
            <Package className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <p className="text-sm">Henüz milestone bulunmuyor</p>
          </div>
        )}

        {/* Role-specific action hint */}
        {stats.total > 0 && (
          <div className="mt-4 rounded-lg bg-blue-50 p-3 text-xs text-gray-600">
            {role === 'EMPLOYER' && stats.pending > 0 ? (
              <p>
                💡 <strong>{stats.pending} milestone</strong> onayınızı
                bekliyor. Sipariş detaylarından onaylayabilirsiniz.
              </p>
            ) : role === 'FREELANCER' && stats.overdue > 0 ? (
              <p>
                ⚠️ <strong>{stats.overdue} milestone</strong> teslim tarihi
                geçmiş. Acil teslim etmeniz önerilir.
              </p>
            ) : (
              <p>✅ Tüm milestone&apos;lar zamanında ilerliyor.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default MilestoneProgressWidget;
