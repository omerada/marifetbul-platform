'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Star,
  Users,
  BarChart3,
} from 'lucide-react';
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

  const { overview, ticketsByCategory, responseTimeMetrics, chatMetrics } =
    analytics;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Toplam Destek Talepleri"
          value={overview.totalTickets.toLocaleString()}
          subtitle={`${overview.openTickets} açık`}
          icon={<MessageSquare className="h-4 w-4" />}
          trend={
            overview.resolvedTickets > overview.totalTickets * 0.8
              ? 'positive'
              : 'neutral'
          }
        />

        <StatsCard
          title="Ortalama Çözüm Süresi"
          value={`${overview.averageResolutionTime}s`}
          subtitle="hedef: 24s"
          icon={<Clock className="h-4 w-4" />}
          trend={overview.averageResolutionTime <= 24 ? 'positive' : 'negative'}
        />

        <StatsCard
          title="Müşteri Memnuniyeti"
          value={`${overview.customerSatisfaction}/5`}
          subtitle={`${overview.firstCallResolution}% ilk çözüm`}
          icon={<Star className="h-4 w-4" />}
          trend={overview.customerSatisfaction >= 4.5 ? 'positive' : 'neutral'}
        />

        <StatsCard
          title="Çözümlenen Talepler"
          value={`${Math.round(
            (overview.resolvedTickets / overview.totalTickets) * 100
          )}%`}
          subtitle={`${overview.resolvedTickets} / ${overview.totalTickets}`}
          icon={<CheckCircle className="h-4 w-4" />}
          trend="positive"
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
            {ticketsByCategory.map((category, index) => (
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
                  Ortalama çözüm: {category.averageResolutionTime}s
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
            {responseTimeMetrics.map((metric) => (
              <div key={metric.period} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {getPeriodLabel(metric.period)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">
                      {metric.averageTime}s / {metric.target}s
                    </span>
                    <Badge
                      variant={
                        metric.performance >= 90
                          ? 'default'
                          : metric.performance >= 70
                            ? 'secondary'
                            : 'destructive'
                      }
                      className="text-xs"
                    >
                      %{metric.performance}
                    </Badge>
                  </div>
                </div>
                <Progress value={metric.performance} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Chat Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Canlı Chat Metrikleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-6">
            <div className="text-center">
              <div className="text-primary text-2xl font-bold">
                {chatMetrics.totalSessions.toLocaleString()}
              </div>
              <div className="text-muted-foreground text-xs">Toplam Oturum</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {chatMetrics.averageWaitTime.toFixed(1)}dk
              </div>
              <div className="text-muted-foreground text-xs">
                Ortalama Bekleme
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {chatMetrics.averageSessionDuration.toFixed(1)}dk
              </div>
              <div className="text-muted-foreground text-xs">Ortalama Süre</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                %{(100 - chatMetrics.abandonmentRate).toFixed(1)}
              </div>
              <div className="text-muted-foreground text-xs">Başarı Oranı</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {chatMetrics.satisfactionRating.toFixed(1)}/5
              </div>
              <div className="text-muted-foreground text-xs">Memnuniyet</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                %{chatMetrics.transferRate.toFixed(1)}
              </div>
              <div className="text-muted-foreground text-xs">
                Transfer Oranı
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend: 'positive' | 'negative' | 'neutral';
}

function StatsCard({ title, value, subtitle, icon, trend }: StatsCardProps) {
  const trendColors = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-muted-foreground',
  };

  const trendIcons = {
    positive: <TrendingUp className="h-3 w-3" />,
    negative: <AlertCircle className="h-3 w-3" />,
    neutral: <BarChart3 className="h-3 w-3" />,
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div
          className={`flex items-center gap-1 text-xs ${trendColors[trend]}`}
        >
          {trendIcons[trend]}
          {subtitle}
        </div>
      </CardContent>
    </Card>
  );
}

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

function getPeriodLabel(period: string): string {
  const labels: Record<string, string> = {
    today: 'Bugün',
    week: 'Bu Hafta',
    month: 'Bu Ay',
    quarter: 'Bu Çeyrek',
    year: 'Bu Yıl',
  };
  return labels[period] || period;
}

export default SupportStats;
