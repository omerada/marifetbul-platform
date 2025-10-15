/**
 * Appeal Stats Cards Component
 *
 * Displays key statistics about content appeals in card format.
 */

import { Card, CardContent } from '@/components/ui/Card';
import { FileText, Clock, Eye, CheckCircle } from 'lucide-react';
import type { AppealStats } from '../types/appeal';

interface AppealStatsCardsProps {
  stats: AppealStats | null;
}

export function AppealStatsCards({ stats }: AppealStatsCardsProps) {
  if (!stats) {
    return null;
  }

  const statCards = [
    {
      label: 'Toplam İtiraz',
      value: stats.totalAppeals,
      icon: FileText,
      iconColor: 'text-blue-500',
      valueColor: '',
    },
    {
      label: 'Bekleyen',
      value: stats.pendingAppeals,
      icon: Clock,
      iconColor: 'text-orange-500',
      valueColor: 'text-orange-600',
    },
    {
      label: 'İnceleniyor',
      value: stats.underReview,
      icon: Eye,
      iconColor: 'text-blue-500',
      valueColor: 'text-blue-600',
    },
    {
      label: 'Bugün Çözülen',
      value: stats.resolvedToday,
      icon: CheckCircle,
      iconColor: 'text-green-500',
      valueColor: 'text-green-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.label}</p>
                  <p className={`text-2xl font-bold ${card.valueColor}`}>
                    {card.value}
                  </p>
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
