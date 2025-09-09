'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { Card } from '@/components/ui/Card';
import {
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface ChartData {
  period: string;
  value: number;
  label: string;
}

interface DashboardChartsProps {
  user: User;
}

export function DashboardCharts({ user }: DashboardChartsProps) {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [chartType, setChartType] = useState<'earnings' | 'projects' | 'clients'>('earnings');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (user.userType === 'freelancer') {
          if (chartType === 'earnings') {
            setChartData([
              { period: '1. Hafta', value: 1200, label: '₺1,200' },
              { period: '2. Hafta', value: 1800, label: '₺1,800' },
              { period: '3. Hafta', value: 2200, label: '₺2,200' },
              { period: '4. Hafta', value: 1950, label: '₺1,950' },
              { period: '5. Hafta', value: 2800, label: '₺2,800' },
              { period: '6. Hafta', value: 3200, label: '₺3,200' },
            ]);
          } else if (chartType === 'projects') {
            setChartData([
              { period: '1. Hafta', value: 2, label: '2 Proje' },
              { period: '2. Hafta', value: 1, label: '1 Proje' },
              { period: '3. Hafta', value: 3, label: '3 Proje' },
              { period: '4. Hafta', value: 2, label: '2 Proje' },
              { period: '5. Hafta', value: 4, label: '4 Proje' },
              { period: '6. Hafta', value: 3, label: '3 Proje' },
            ]);
          } else {
            setChartData([
              { period: '1. Hafta', value: 1, label: '1 Müşteri' },
              { period: '2. Hafta', value: 1, label: '1 Müşteri' },
              { period: '3. Hafta', value: 2, label: '2 Müşteri' },
              { period: '4. Hafta', value: 1, label: '1 Müşteri' },
              { period: '5. Hafta', value: 3, label: '3 Müşteri' },
              { period: '6. Hafta', value: 2, label: '2 Müşteri' },
            ]);
          }
        } else {
          if (chartType === 'earnings') {
            setChartData([
              { period: '1. Hafta', value: 800, label: '₺800' },
              { period: '2. Hafta', value: 1200, label: '₺1,200' },
              { period: '3. Hafta', value: 1500, label: '₺1,500' },
              { period: '4. Hafta', value: 1100, label: '₺1,100' },
              { period: '5. Hafta', value: 1800, label: '₺1,800' },
              { period: '6. Hafta', value: 2200, label: '₺2,200' },
            ]);
          } else if (chartType === 'projects') {
            setChartData([
              { period: '1. Hafta', value: 1, label: '1 İlan' },
              { period: '2. Hafta', value: 2, label: '2 İlan' },
              { period: '3. Hafta', value: 1, label: '1 İlan' },
              { period: '4. Hafta', value: 3, label: '3 İlan' },
              { period: '5. Hafta', value: 2, label: '2 İlan' },
              { period: '6. Hafta', value: 1, label: '1 İlan' },
            ]);
          } else {
            setChartData([
              { period: '1. Hafta', value: 1, label: '1 İşe Alım' },
              { period: '2. Hafta', value: 2, label: '2 İşe Alım' },
              { period: '3. Hafta', value: 1, label: '1 İşe Alım' },
              { period: '4. Hafta', value: 3, label: '3 İşe Alım' },
              { period: '5. Hafta', value: 2, label: '2 İşe Alım' },
              { period: '6. Hafta', value: 1, label: '1 İşe Alım' },
            ]);
          }
        }
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [user, chartType, selectedPeriod]);

  const maxValue = Math.max(...chartData.map(d => d.value));
  const totalValue = chartData.reduce((sum, d) => sum + d.value, 0);
  const avgValue = totalValue / chartData.length;
  const trend = chartData.length > 1 ? 
    ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value) * 100 : 0;

  const getChartTitle = () => {
    if (user.userType === 'freelancer') {
      switch (chartType) {
        case 'earnings': return 'Kazanç Trendi';
        case 'projects': return 'Proje Sayısı';
        case 'clients': return 'Yeni Müşteriler';
        default: return 'İstatistikler';
      }
    } else {
      switch (chartType) {
        case 'earnings': return 'Harcama Trendi';
        case 'projects': return 'İlan Sayısı';
        case 'clients': return 'İşe Alımlar';
        default: return 'İstatistikler';
      }
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-6">
            <div className="h-6 bg-gray-200 rounded w-32"></div>
            <div className="flex space-x-2">
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{getChartTitle()}</h3>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              {trend >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend).toFixed(1)}%
              </span>
            </div>
            <span className="text-sm text-gray-500">son 6 hafta</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as 'earnings' | 'projects' | 'clients')}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {user.userType === 'freelancer' ? (
              <>
                <option value="earnings">Kazançlar</option>
                <option value="projects">Projeler</option>
                <option value="clients">Müşteriler</option>
              </>
            ) : (
              <>
                <option value="earnings">Harcamalar</option>
                <option value="projects">İlanlar</option>
                <option value="clients">İşe Alımlar</option>
              </>
            )}
          </select>

          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '7d' | '30d' | '90d' | '1y')}
            className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">7 Gün</option>
            <option value="30d">30 Gün</option>
            <option value="90d">90 Gün</option>
            <option value="1y">1 Yıl</option>
          </select>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="mb-6">
        <div className="flex items-end space-x-2 h-48">
          {chartData.map((data, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full flex items-end justify-center h-40">
                <div
                  className="w-8 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-sm hover:from-blue-600 hover:to-blue-500 transition-all duration-300 relative group"
                  style={{
                    height: `${(data.value / maxValue) * 100}%`,
                    minHeight: '8px'
                  }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {data.label}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-600 mt-2 text-center">
                {data.period}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {chartType === 'earnings' ? `₺${totalValue.toLocaleString('tr-TR')}` : totalValue}
          </div>
          <div className="text-sm text-gray-500">Toplam</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {chartType === 'earnings' ? `₺${Math.round(avgValue).toLocaleString('tr-TR')}` : Math.round(avgValue)}
          </div>
          <div className="text-sm text-gray-500">Ortalama</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {chartType === 'earnings' ? `₺${maxValue.toLocaleString('tr-TR')}` : maxValue}
          </div>
          <div className="text-sm text-gray-500">En Yüksek</div>
        </div>
      </div>
    </Card>
  );
}
