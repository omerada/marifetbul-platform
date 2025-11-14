'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import {
  Clock,
  CheckCircle,
  MessageSquare,
  Star,
  BarChart3,
} from 'lucide-react';
import { StatsCard } from '@/components/domains/dashboard/widgets/StatsCard';
import type { SupportAnalytics } from '@/types';

interface SupportStatsProps {
  analytics: SupportAnalytics;
  isLoading?: boolean;
  className?: string;
}

export function SupportStats({
  analytics,
  isLoading = false,
  className,
}: SupportStatsProps) {
  if (isLoading) {
    return <SupportStatsSkeleton className={className} />;
  }

  const { overview, ticketsByCategory, responseTimeMetrics } = analytics;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          data={{
            id: 'total-tickets',
            title: 'Toplam Destek Talepleri',
            value: overview?.totalTickets?.toLocaleString() || '0',
            subtitle: `${overview?.openTickets || 0} açık`,
            icon: MessageSquare,
            iconColor: 'blue',
            trend: {
              percentage: Math.round(
                ((overview?.resolvedTickets || 0) /
                  (overview?.totalTickets || 1)) *
                  100
              ),
              direction:
                (overview?.resolvedTickets || 0) >
                (overview?.totalTickets || 0) * 0.8
                  ? 'up'
                  : 'neutral',
              isPositive:
                (overview?.resolvedTickets || 0) >
                (overview?.totalTickets || 0) * 0.8,
            },
          }}
        />

        <StatsCard
          data={{
            id: 'resolution-time',
            title: 'Ortalama Çözüm Süresi',
            value: `${overview?.averageResolutionTime || 0}s`,
            subtitle: 'hedef: 24s',
            icon: Clock,
            iconColor: 'orange',
            trend: {
              percentage: Math.abs(
                Math.round(
                  (((overview?.averageResolutionTime || 0) - 24) / 24) * 100
                )
              ),
              direction:
                (overview?.averageResolutionTime || 0) <= 24 ? 'down' : 'up',
              isPositive: (overview?.averageResolutionTime || 0) <= 24,
            },
          }}
        />

        <StatsCard
          data={{
            id: 'satisfaction',
            title: 'Müşteri Memnuniyeti',
            value: `${overview?.customerSatisfaction || 0}/5`,
            subtitle: `${overview?.firstCallResolution || 0}% ilk çözüm`,
            icon: Star,
            iconColor: 'yellow',
            trend: {
              percentage: Math.round(
                ((overview?.customerSatisfaction || 0) / 5) * 100
              ),
              direction:
                (overview?.customerSatisfaction || 0) >= 4.5 ? 'up' : 'neutral',
              isPositive: (overview?.customerSatisfaction || 0) >= 4.5,
            },
          }}
        />

        <StatsCard
          data={{
            id: 'resolved-tickets',
            title: 'Çözümlenen Talepler',
            value: `${Math.round(
              ((overview?.resolvedTickets || 0) /
                (overview?.totalTickets || 1)) *
                100
            )}%`,
            subtitle: `${overview?.resolvedTickets || 0} / ${overview?.totalTickets || 0}`,
            icon: CheckCircle,
            iconColor: 'green',
            trend: {
              percentage: Math.round(
                ((overview?.resolvedTickets || 0) /
                  (overview?.totalTickets || 1)) *
                  100
              ),
              direction: 'up',
              isPositive: true,
            },
          }}
        />
      </div>

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Kategori Bazında Dağılım
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticketsByCategory?.map((category) => (
              <div key={category.category} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium capitalize">
                    {getCategoryLabel(category.category)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {category.count} talep
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      %{category.percentage.toFixed(1)}
                    </Badge>
                  </div>
                </div>
                <Progress value={category.percentage} className="h-2" />
                <div className="text-muted-foreground text-xs">
                  {category.count} talep
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Response Time Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Yanıt Süresi Performansı
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {responseTimeMetrics?.map((metric, index) => (
              <div key={metric.metric || index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {metric.metric}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      {metric.value}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {metric.trend}
                    </Badge>
                  </div>
                </div>
                <Progress value={metric.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Internal StatsCard removed - now using unified StatsCard from dashboard widgets

function SupportStatsSkeleton({ className }: { className?: string }) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
            </CardHeader>
            <CardContent className="animate-pulse">
              <div className="mb-2 h-8 w-1/2 rounded bg-gray-200"></div>
              <div className="h-3 w-2/3 rounded bg-gray-200"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-5 w-1/2 rounded bg-gray-200"></div>
            </CardHeader>
            <CardContent className="animate-pulse space-y-4">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="h-4 rounded bg-gray-200"></div>
                  <div className="h-2 rounded bg-gray-200"></div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Helper functions
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    technical: 'Teknik',
    billing: 'Faturalandırma',
    account: 'Hesap',
    general: 'Genel',
    report_user: 'Kullanıcı Şikayeti',
    feature_request: 'Özellik Talebi',
    bug_report: 'Hata Bildirimi',
  };
  return labels[category] || category;
}

export default SupportStats;
