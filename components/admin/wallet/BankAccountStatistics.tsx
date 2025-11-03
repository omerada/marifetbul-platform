/**
 * ================================================
 * ADMIN BANK ACCOUNT STATISTICS
 * ================================================
 * Statistics cards for bank account verification dashboard
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created December 2024
 */

'use client';

import { Building2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/UnifiedSkeleton';

// ================================================
// TYPES
// ================================================

export interface BankAccountStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
}

export interface BankAccountStatisticsProps {
  stats: BankAccountStats | null;
  isLoading: boolean;
}

// ================================================
// COMPONENT
// ================================================

export const BankAccountStatistics: React.FC<BankAccountStatisticsProps> = ({
  stats,
  isLoading,
}) => {
  if (isLoading || !stats) {
    return <LoadingSkeleton />;
  }

  const cards = [
    {
      label: 'Toplam Hesap',
      value: stats.total,
      icon: Building2,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      label: 'Bekleyen',
      value: stats.pending,
      icon: Clock,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
    },
    {
      label: 'Onaylandı',
      value: stats.verified,
      icon: CheckCircle,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      label: 'Reddedildi',
      value: stats.rejected,
      icon: XCircle,
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.label}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow transition-shadow hover:shadow-md"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 rounded-md ${card.bgColor} p-3`}>
                  <Icon className={`h-6 w-6 ${card.textColor}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500">
                      {card.label}
                    </dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">
                        {card.value.toLocaleString('tr-TR')}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ================================================
// LOADING SKELETON
// ================================================

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border border-gray-200 bg-white p-5 shadow"
        >
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
