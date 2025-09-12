'use client';

import { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Briefcase,
  DollarSign,
  Star,
  Filter,
  Download,
  RefreshCw,
  PieChart,
  LineChart,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface AnalyticsData {
  period: 'day' | 'week' | 'month' | 'year';
  metrics: {
    totalJobs: number;
    totalFreelancers: number;
    totalRevenue: number;
    averageRating: number;
    completionRate: number;
    responseTime: number;
  };
  trends: {
    jobs: number;
    freelancers: number;
    revenue: number;
    rating: number;
  };
  chartData: {
    labels: string[];
    jobs: number[];
    revenue: number[];
    users: number[];
  };
  categoryDistribution: {
    name: string;
    value: number;
    color: string;
  }[];
  topPerformers: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    projects: number;
    revenue: number;
  }[];
}

// Mock data generator
const generateMockData = (period: AnalyticsData['period']): AnalyticsData => {
  const baseData = {
    day: {
      multiplier: 1,
      labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    },
    week: {
      multiplier: 7,
      labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
    },
    month: { multiplier: 30, labels: ['Hf1', 'Hf2', 'Hf3', 'Hf4'] },
    year: {
      multiplier: 365,
      labels: [
        'Oca',
        'Şub',
        'Mar',
        'Nis',
        'May',
        'Haz',
        'Tem',
        'Ağu',
        'Eyl',
        'Eki',
        'Kas',
        'Ara',
      ],
    },
  };

  const config = baseData[period];

  return {
    period,
    metrics: {
      totalJobs: Math.floor(Math.random() * 1000) * config.multiplier,
      totalFreelancers: Math.floor(Math.random() * 500) * config.multiplier,
      totalRevenue: Math.floor(Math.random() * 50000) * config.multiplier,
      averageRating: 4.2 + Math.random() * 0.8,
      completionRate: 85 + Math.random() * 15,
      responseTime: Math.floor(Math.random() * 24) + 1,
    },
    trends: {
      jobs: (Math.random() - 0.5) * 40,
      freelancers: (Math.random() - 0.5) * 30,
      revenue: (Math.random() - 0.5) * 50,
      rating: (Math.random() - 0.5) * 10,
    },
    chartData: {
      labels: config.labels,
      jobs: config.labels.map(() => Math.floor(Math.random() * 100)),
      revenue: config.labels.map(() => Math.floor(Math.random() * 10000)),
      users: config.labels.map(() => Math.floor(Math.random() * 50)),
    },
    categoryDistribution: [
      { name: 'Web Development', value: 35, color: '#3B82F6' },
      { name: 'Mobile Apps', value: 25, color: '#10B981' },
      { name: 'UI/UX Design', value: 20, color: '#F59E0B' },
      { name: 'Content Writing', value: 12, color: '#EF4444' },
      { name: 'Other', value: 8, color: '#6B7280' },
    ],
    topPerformers: [
      {
        id: '1',
        name: 'Ahmet Yılmaz',
        avatar: '👨‍💻',
        rating: 4.9,
        projects: 47,
        revenue: 125000,
      },
      {
        id: '2',
        name: 'Zeynep Demir',
        avatar: '👩‍🎨',
        rating: 4.8,
        projects: 32,
        revenue: 98000,
      },
      {
        id: '3',
        name: 'Mehmet Özkan',
        avatar: '👨‍💼',
        rating: 4.7,
        projects: 28,
        revenue: 87000,
      },
    ],
  };
};

interface AnalyticsDashboardProps {
  className?: string;
}

export function AnalyticsDashboard({
  className = '',
}: AnalyticsDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] =
    useState<AnalyticsData['period']>('week');
  const [isLoading, setIsLoading] = useState(false);

  const data = useMemo(
    () => generateMockData(selectedPeriod),
    [selectedPeriod]
  );

  const handlePeriodChange = (period: AnalyticsData['period']) => {
    setIsLoading(true);
    setSelectedPeriod(period);

    // Simulate loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handlePeriodChange(selectedPeriod)}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Yenile
          </Button>

          <Button size="sm" variant="outline">
            <Download className="h-4 w-4" />
            Export
          </Button>

          <Button size="sm" variant="outline">
            <Filter className="h-4 w-4" />
            Filtrele
          </Button>
        </div>
      </div>

      {/* Period Selector */}
      <Card className="p-4">
        <div className="flex gap-2">
          {(['day', 'week', 'month', 'year'] as const).map((period) => (
            <Button
              key={period}
              size="sm"
              variant={selectedPeriod === period ? 'primary' : 'outline'}
              onClick={() => handlePeriodChange(period)}
              disabled={isLoading}
            >
              {period === 'day' && 'Günlük'}
              {period === 'week' && 'Haftalık'}
              {period === 'month' && 'Aylık'}
              {period === 'year' && 'Yıllık'}
            </Button>
          ))}
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Toplam İşler"
          value={formatNumber(data.metrics.totalJobs)}
          trend={data.trends.jobs}
          icon={<Briefcase className="h-5 w-5" />}
          color="blue"
        />
        <MetricCard
          title="Freelancerlar"
          value={formatNumber(data.metrics.totalFreelancers)}
          trend={data.trends.freelancers}
          icon={<Users className="h-5 w-5" />}
          color="green"
        />
        <MetricCard
          title="Toplam Gelir"
          value={formatCurrency(data.metrics.totalRevenue)}
          trend={data.trends.revenue}
          icon={<DollarSign className="h-5 w-5" />}
          color="yellow"
        />
        <MetricCard
          title="Ortalama Puan"
          value={data.metrics.averageRating.toFixed(1)}
          trend={data.trends.rating}
          icon={<Star className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Line Chart */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <LineChart className="h-5 w-5" />
              Zaman Serisi Analizi
            </h3>
          </div>
          <div className="flex h-64 items-end justify-between gap-2">
            {data.chartData.labels.map((label, index) => (
              <div key={label} className="flex flex-1 flex-col items-center">
                <div
                  className="relative w-full overflow-hidden rounded-t bg-gray-200"
                  style={{ height: '200px' }}
                >
                  <div
                    className="absolute bottom-0 w-full bg-blue-500 transition-all duration-1000 ease-out"
                    style={{
                      height: `${(data.chartData.jobs[index] / Math.max(...data.chartData.jobs)) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute bottom-0 w-full bg-green-500 opacity-70 transition-all duration-1000 ease-out"
                    style={{
                      height: `${(data.chartData.revenue[index] / Math.max(...data.chartData.revenue)) * 50}%`,
                    }}
                  />
                </div>
                <span className="mt-2 text-xs">{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-blue-500"></div>
              <span>İşler</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-500"></div>
              <span>Gelir</span>
            </div>
          </div>
        </Card>

        {/* Pie Chart */}
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <PieChart className="h-5 w-5" />
              Kategori Dağılımı
            </h3>
          </div>
          <div className="flex h-64 items-center justify-center">
            <div className="relative h-48 w-48">
              {/* Simple pie chart representation */}
              <div className="h-full w-full rounded-full border-8 border-blue-500"></div>
              <div className="absolute inset-4 rounded-full border-8 border-green-500"></div>
              <div className="absolute inset-8 rounded-full border-8 border-yellow-500"></div>
              <div className="absolute inset-12 rounded-full border-8 border-red-500"></div>
              <div className="absolute inset-16 rounded-full bg-gray-500"></div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {data.categoryDistribution.map((category) => (
              <div
                key={category.name}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded"
                    style={{ backgroundColor: category.color }}
                  />
                  <span>{category.name}</span>
                </div>
                <span className="font-medium">%{category.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Performance Metrics */}
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold">Performans Metrikleri</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Tamamlanma Oranı</span>
              <span className="font-semibold">
                %{data.metrics.completionRate.toFixed(1)}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-green-500 transition-all duration-1000"
                style={{ width: `${data.metrics.completionRate}%` }}
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">Yanıt Süresi</span>
              <span className="font-semibold">
                {data.metrics.responseTime} saat
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-blue-500 transition-all duration-1000"
                style={{
                  width: `${((24 - data.metrics.responseTime) / 24) * 100}%`,
                }}
              />
            </div>
          </div>
        </Card>

        {/* Top Performers */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="mb-4 text-lg font-semibold">
            En İyi Performans Gösterenler
          </h3>
          <div className="space-y-3">
            {data.topPerformers.map((performer) => (
              <div
                key={performer.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{performer.avatar}</div>
                  <div>
                    <p className="font-medium">{performer.name}</p>
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {performer.rating}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(performer.revenue)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {performer.projects} proje
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// Metric Card Component
interface MetricCardProps {
  title: string;
  value: string;
  trend: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'yellow' | 'purple';
}

function MetricCard({ title, value, trend, icon, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    purple: 'text-purple-600 bg-purple-100',
  };

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className={`rounded-lg p-2 ${colorClasses[color]}`}>{icon}</div>
        <div className="flex items-center gap-1">
          {getTrendIcon(trend)}
          <span className={`text-sm font-medium ${getTrendColor(trend)}`}>
            {Math.abs(trend).toFixed(1)}%
          </span>
        </div>
      </div>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </Card>
  );
}

// Helper functions (defined outside component to avoid recreating on each render)
function getTrendIcon(trend: number) {
  return trend > 0 ? (
    <TrendingUp className="h-4 w-4 text-green-500" />
  ) : (
    <TrendingDown className="h-4 w-4 text-red-500" />
  );
}

function getTrendColor(trend: number) {
  return trend > 0 ? 'text-green-600' : 'text-red-600';
}
