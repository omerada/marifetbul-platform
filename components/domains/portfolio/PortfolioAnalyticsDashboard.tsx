'use client';

/**
 * Portfolio Analytics Dashboard
 * Sprint 1: Story 3.3 - Analytics Dashboard Component
 *
 * Complete analytics dashboard with charts and metrics
 */

'use client';

import { useState } from 'react';
import {
  TrendingUp,
  Eye,
  BarChart3,
  Lock,
  Globe,
  RefreshCw,
  Download,
} from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui/Card';
import { usePortfolioAnalytics } from '@/hooks/business/portfolio/usePortfolioAnalytics';
import {
  ViewCountChart,
  CategoryChart,
  TopSkillsList,
  TopPortfoliosTable,
} from './PortfolioAnalyticsCharts';
import { toast } from 'sonner';

// ============================================================================
// SUMMARY CARD COMPONENT
// ============================================================================

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color?: 'blue' | 'green' | 'purple' | 'orange';
}

function SummaryCard({
  title,
  value,
  icon,
  trend,
  color = 'blue',
}: SummaryCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <p className="mt-2 flex items-center text-sm text-gray-500">
              <TrendingUp className="mr-1 h-4 w-4" />
              {trend}
            </p>
          )}
        </div>
        <div className={`rounded-full p-3 ${colorClasses[color]}`}>{icon}</div>
      </div>
    </Card>
  );
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================

interface PortfolioAnalyticsDashboardProps {
  className?: string;
}

export function PortfolioAnalyticsDashboard({
  className = '',
}: PortfolioAnalyticsDashboardProps) {
  const { analytics, isLoading, error, refresh } = usePortfolioAnalytics();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
      toast.success('Veriler güncellendi!');
    } catch (_err) {
      toast.error('Veriler güncellenirken hata oluştu');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle export (basic implementation)
  const handleExport = () => {
    if (!analytics) return;

    const csvContent = [
      'Portfolio Analitiği',
      '',
      'Genel Özet',
      `Toplam Portfolio,${analytics.totalPortfolios}`,
      `Toplam Görüntülenme,${analytics.totalViews}`,
      `Ortalama Görüntülenme,${analytics.averageViews}`,
      `Açık Portfolio,${analytics.publicPortfolios}`,
      `Gizli Portfolio,${analytics.privatePortfolios}`,
      '',
      'En Çok Görüntülenen Portfoliolar',
      'Sıra,Başlık,Kategori,Görüntülenme',
      ...analytics.topViewedPortfolios.map(
        (p, i) => `${i + 1},${p.title},${p.category || '-'},${p.viewCount}`
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `portfolio-analytics-${new Date().toISOString().split('T')[0]}.csv`
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Analiz raporu indirildi!');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
            <p className="mt-4 text-gray-600">Analiz verileri yükleniyor...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-red-100 p-3 text-red-600">
              <BarChart3 className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Veri Yüklenemedi
            </h3>
            <p className="mt-2 text-gray-600">
              Analiz verileri yüklenirken bir hata oluştu.
            </p>
            <Button onClick={handleRefresh} className="mt-4">
              Tekrar Dene
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // No data state
  if (!analytics || analytics.totalPortfolios === 0) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="rounded-full bg-gray-100 p-3 text-gray-400">
              <BarChart3 className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Henüz Portfolio Yok
            </h3>
            <p className="mt-2 text-gray-600">
              Portfolio ekleyerek analiz verilerinizi görebilirsiniz.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Portfolio Analitiği
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Portfolio performansınızı takip edin
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
            Yenile
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Dışa Aktar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Toplam Portfolio"
          value={analytics.totalPortfolios}
          icon={<BarChart3 className="h-6 w-6" />}
          color="blue"
        />
        <SummaryCard
          title="Toplam Görüntülenme"
          value={analytics.totalViews}
          icon={<Eye className="h-6 w-6" />}
          color="green"
        />
        <SummaryCard
          title="Ortalama Görüntülenme"
          value={analytics.averageViews}
          icon={<TrendingUp className="h-6 w-6" />}
          color="purple"
        />
        <SummaryCard
          title="Açık / Gizli"
          value={`${analytics.publicPortfolios} / ${analytics.privatePortfolios}`}
          icon={
            analytics.publicPortfolios > analytics.privatePortfolios ? (
              <Globe className="h-6 w-6" />
            ) : (
              <Lock className="h-6 w-6" />
            )
          }
          color="orange"
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            En Çok Görüntülenen Portfoliolar
          </h3>
          <ViewCountChart data={analytics.viewTrend} />
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Kategori Dağılımı
          </h3>
          <CategoryChart data={analytics.categoryDistribution} />
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            En Popüler Yetenekler
          </h3>
          <TopSkillsList data={analytics.topSkills} />
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Top 5 Portfolio
          </h3>
          <TopPortfoliosTable data={analytics.topViewedPortfolios} />
        </Card>
      </div>
    </div>
  );
}

export default PortfolioAnalyticsDashboard;
