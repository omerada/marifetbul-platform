/**
 * ModerationStats Component
 *
 * Statistics cards for moderation metrics
 */

import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import type { ModerationStatsProps } from '../types/moderationTypes';

export function ModerationStats({ stats, isLoading }: ModerationStatsProps) {
  if (isLoading || !stats) {
    return null;
  }

  const cards = [
    {
      label: 'Bekleyen',
      value: stats.pendingItems,
      icon: Clock,
      colorClass: 'border-yellow-200 bg-yellow-50',
      textClass: 'text-yellow-600',
      valueClass: 'text-yellow-900',
    },
    {
      label: 'Onaylandı',
      value: stats.approvedItems,
      icon: CheckCircle,
      colorClass: 'border-green-200 bg-green-50',
      textClass: 'text-green-600',
      valueClass: 'text-green-900',
    },
    {
      label: 'Reddedildi',
      value: stats.rejectedItems,
      icon: XCircle,
      colorClass: 'border-red-200 bg-red-50',
      textClass: 'text-red-600',
      valueClass: 'text-red-900',
    },
    {
      label: 'Ort. İnceleme',
      value: `${Math.round(stats.averageReviewTime / 60)}dk`,
      icon: AlertTriangle,
      colorClass: 'border-blue-200 bg-blue-50',
      textClass: 'text-blue-600',
      valueClass: 'text-blue-900',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className={card.colorClass}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${card.textClass}`}>
                    {card.label}
                  </p>
                  <p className={`text-2xl font-bold ${card.valueClass}`}>
                    {card.value}
                  </p>
                </div>
                <Icon className={`h-6 w-6 ${card.textClass}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
