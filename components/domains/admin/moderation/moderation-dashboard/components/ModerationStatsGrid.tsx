/**
 * ModerationStatsGrid Component
 *
 * Grid displaying moderation statistics
 */

import { Flag, Clock, CheckCircle, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { STAT_ICON_COLORS } from '../utils/moderationConstants';
import type { ModerationStatsGridProps } from '../types/moderationDashboardTypes';

const STAT_CONFIG = [
  {
    key: 'totalReports',
    label: 'Toplam Rapor',
    icon: Flag,
    color: STAT_ICON_COLORS.totalReports,
    trend: { label: '+12%', sublabel: 'bu hafta', className: 'text-green-600' },
  },
  {
    key: 'pendingReports',
    label: 'Bekleyen',
    icon: Clock,
    color: STAT_ICON_COLORS.pendingReports,
    valueClassName: 'text-orange-600',
    trend: {
      label: 'Acil: 23',
      sublabel: 'kritik',
      className: 'text-orange-600',
    },
  },
  {
    key: 'resolvedToday',
    label: 'Bugün Çözülen',
    icon: CheckCircle,
    color: STAT_ICON_COLORS.resolvedToday,
    valueClassName: 'text-green-600',
    trend: { label: 'Ortalama: ', sublabel: '', className: 'text-gray-600' },
  },
  {
    key: 'autoFlagged',
    label: 'Otomatik Algılama',
    icon: Shield,
    color: STAT_ICON_COLORS.autoFlagged,
    valueClassName: 'text-purple-600',
    trend: { label: '', sublabel: 'doğruluk', className: 'text-purple-600' },
  },
];

export function ModerationStatsGrid({ stats }: ModerationStatsGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {STAT_CONFIG.map((config, index) => {
        const rawValue = stats?.[config.key as keyof typeof stats];
        const value = typeof rawValue === 'number' ? rawValue : 0;
        const IconComponent = config.icon;

        return (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {config.label}
                  </p>
                  <p
                    className={`text-2xl font-bold ${config.valueClassName || 'text-gray-900'}`}
                  >
                    {value}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-full ${config.color.bg}`}
                >
                  <IconComponent className={`h-6 w-6 ${config.color.text}`} />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center text-sm">
                  {config.key === 'resolvedToday' ? (
                    <>
                      <span className={config.trend.className}>
                        {config.trend.label}
                      </span>
                      <span className="ml-1 font-medium text-green-600">
                        {stats?.averageResponseTime}h
                      </span>
                    </>
                  ) : config.key === 'autoFlagged' ? (
                    <>
                      <span className="font-medium text-purple-600">
                        {stats?.moderationAccuracy}%
                      </span>
                      <span className="ml-1 text-gray-600">
                        {config.trend.sublabel}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className={`font-medium ${config.trend.className}`}>
                        {config.trend.label}
                      </span>
                      <span className="ml-1 text-gray-600">
                        {config.trend.sublabel}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
