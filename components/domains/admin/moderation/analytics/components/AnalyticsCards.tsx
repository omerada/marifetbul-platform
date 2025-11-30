/**
 * Analytics Cards Component
 *
 * Display 4 key overview metrics with trend indicators.
 */

import { Card, CardContent } from '@/components/ui';
import { Activity, Clock, Target, AlertTriangle } from 'lucide-react';
import type { AnalyticsOverview } from '../types/moderationAnalytics';
import {
  getTrendIcon,
  getTrendColor, 
  formatDuration,
} from '../utils/analyticsHelpers';
import { formatNumber } from '@/lib/utils';

interface AnalyticsCardsProps {
  overview: AnalyticsOverview;
}

export function AnalyticsCards({ overview }: AnalyticsCardsProps) {
  const TrendIcon = getTrendIcon(overview.actionsTrend);
  const ResponseTrendIcon = getTrendIcon(overview.responseTrend);
  const AccuracyTrendIcon = getTrendIcon(overview.accuracyTrend);
  const FlagsTrendIcon = getTrendIcon(overview.flagsTrend);

  const cards = [
    {
      title: 'Toplam İşlem',
      value: formatNumber(overview.totalActions),
      trend: overview.actionsTrend,
      TrendIcon,
      icon: Activity,
      iconColor: 'text-blue-500',
    },
    {
      title: 'Ortalama Yanıt Süresi',
      value: formatDuration(overview.averageResponseTime),
      trend: overview.responseTrend,
      TrendIcon: ResponseTrendIcon,
      icon: Clock,
      iconColor: 'text-green-500',
    },
    {
      title: 'Doğruluk Oranı',
      value: `${overview.accuracyRate.toFixed(1)}%`,
      trend: overview.accuracyTrend,
      TrendIcon: AccuracyTrendIcon,
      icon: Target,
      iconColor: 'text-purple-500',
    },
    {
      title: 'Aktif Bayraklar',
      value: formatNumber(overview.activeContentFlags),
      trend: overview.flagsTrend,
      TrendIcon: FlagsTrendIcon,
      icon: AlertTriangle,
      iconColor: 'text-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const TrendIconComponent = card.TrendIcon;

        return (
          <Card key={card.title}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <div className="mt-1 flex items-center gap-1">
                    <TrendIconComponent
                      className={`h-4 w-4 ${getTrendColor(card.trend)}`}
                    />
                    <span className={`text-sm ${getTrendColor(card.trend)}`}>
                      {Math.abs(card.trend).toFixed(1)}%
                    </span>
                  </div>
                </div>
                <Icon className={`h-8 w-8 ${card.iconColor}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
