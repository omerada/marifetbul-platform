/**
 * ================================================
 * PROPOSAL STATISTICS COMPONENT
 * ================================================
 * Statistics cards for job proposals overview
 *
 * Features:
 * - Total, pending, accepted proposals count
 * - Average bid amount
 * - Min/max bid amounts
 * - Visual stat cards with icons
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created 2025-11-09 - Sprint: Dashboard Route Consolidation
 */

'use client';

import { Card } from '@/components/ui';
import { Clock, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency } from '@/lib/shared/formatters';

export interface ProposalStatsData {
  total: number;
  pending: number;
  accepted: number;
  rejected: number;
  avgBidAmount: number;
  minBidAmount: number;
  maxBidAmount: number;
}

interface ProposalStatisticsProps {
  stats: ProposalStatsData;
  className?: string;
}

export function ProposalStatistics({
  stats,
  className = '',
}: ProposalStatisticsProps) {
  // Don't render if no proposals
  if (stats.total === 0) {
    return null;
  }

  return (
    <div className={`mb-6 grid grid-cols-1 gap-4 md:grid-cols-4 ${className}`}>
      {/* Pending Proposals */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Bekleyen</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </p>
          </div>
          <Clock className="h-8 w-8 text-yellow-600" />
        </div>
      </Card>

      {/* Accepted Proposals */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Kabul Edilen</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.accepted}
            </p>
          </div>
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
      </Card>

      {/* Average Bid */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Ortalama Teklif</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.avgBidAmount)}
            </p>
          </div>
          <TrendingUp className="h-8 w-8 text-gray-600" />
        </div>
      </Card>

      {/* Minimum Bid */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">En Düşük Teklif</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(stats.minBidAmount)}
            </p>
          </div>
          <TrendingDown className="h-8 w-8 text-blue-600" />
        </div>
      </Card>
    </div>
  );
}
