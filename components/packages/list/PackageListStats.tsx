'use client';

/**
 * Package List Stats Component
 * Summary statistics for seller's packages
 */

import { Package, Eye, TrendingUp, Star } from 'lucide-react';

interface PackageListStatsProps {
  totalPackages: number;
  activePackages: number;
  totalViews: number;
  totalOrders: number;
  averageRating: number;
}

export function PackageListStats({
  totalPackages,
  activePackages,
  totalViews,
  totalOrders,
  averageRating,
}: PackageListStatsProps) {
  const stats = [
    {
      label: 'Toplam Paket',
      value: totalPackages,
      subtext: `${activePackages} aktif`,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Toplam Görüntülenme',
      value: totalViews.toLocaleString('tr-TR'),
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Toplam Sipariş',
      value: totalOrders.toLocaleString('tr-TR'),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Ortalama Puan',
      value: averageRating.toFixed(1),
      icon: Star,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="rounded-lg border border-gray-200 bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>
                {stat.subtext && (
                  <p className="mt-1 text-sm text-gray-500">{stat.subtext}</p>
                )}
              </div>
              <div className={`rounded-full p-3 ${stat.bgColor}`}>
                <Icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
