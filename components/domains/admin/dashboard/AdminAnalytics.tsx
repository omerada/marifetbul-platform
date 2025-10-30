'use client';

import { useState } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  BarChart3,
  DollarSign,
  Package,
  FolderTree,
  Download,
} from 'lucide-react';

// Sprint 1: Import new analytics widgets
import {
  RevenueBreakdownWidget,
  RevenueForecastChart,
  RevenueComparisonWidget,
  CategoryAnalyticsWidget,
  CategoryGrowthTrends,
  CategoryPerformanceSummary,
  PackagePerformanceWidget,
  PackageTrendChart,
} from '.';

type TabType = 'overview' | 'revenue' | 'categories' | 'packages';
type PeriodType = 'today' | 'week' | 'month' | 'custom';

export function AdminAnalytics() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [period, setPeriod] = useState<PeriodType>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
    {
      id: 'overview',
      label: 'Genel Bakış',
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      id: 'revenue',
      label: 'Gelir Analizi',
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      id: 'categories',
      label: 'Kategori Analizi',
      icon: <FolderTree className="h-5 w-5" />,
    },
    {
      id: 'packages',
      label: 'Paket Analizi',
      icon: <Package className="h-5 w-5" />,
    },
  ];

  const handleExport = () => {
    // TODO: Implement export functionality
    alert('Export özelliği yakında eklenecek');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } `}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={period === 'today' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setPeriod('today')}
          >
            Bugün
          </Button>
          <Button
            variant={period === 'week' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setPeriod('week')}
          >
            Bu Hafta
          </Button>
          <Button
            variant={period === 'month' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setPeriod('month')}
          >
            Bu Ay
          </Button>
          <Button
            variant={period === 'custom' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setPeriod('custom')}
          >
            Özel Tarih
          </Button>
        </div>

        {period === 'custom' && (
          <div className="flex gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
            />
          </div>
        )}

        <Button variant="outline" size="sm" onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RevenueBreakdownWidget period={period} />
            <CategoryAnalyticsWidget />
          </div>
          <PackagePerformanceWidget limit={5} />
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <RevenueBreakdownWidget period={period} />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RevenueForecastChart />
            <RevenueComparisonWidget comparisonType="week" />
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-6">
          <CategoryPerformanceSummary
            startDate={period === 'custom' ? startDate : undefined}
            endDate={period === 'custom' ? endDate : undefined}
          />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <CategoryAnalyticsWidget />
            <CategoryGrowthTrends />
          </div>
        </div>
      )}

      {activeTab === 'packages' && (
        <div className="space-y-6">
          <PackagePerformanceWidget limit={10} />
          <PackageTrendChart packageId="1" days={30} />
        </div>
      )}
    </div>
  );
}

export default AdminAnalytics;
