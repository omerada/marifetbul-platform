'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { Card } from '@/components/ui/Card';
import logger from '@/lib/infrastructure/monitoring/logger';
import {
  Briefcase,
  Star,
  Eye,
  DollarSign,
  Users,
  BarChart3,
} from 'lucide-react';

interface DashboardStatsProps {
  user: User;
}

interface FreelancerStats {
  totalEarnings: number;
  activeProjects: number;
  completedJobs: number;
  rating: number;
  profileViews: number;
  responseRate: number;
  onTimeDelivery: number;
  repeatClients: number;
  // Backend DTO fields
  revenueMetrics?: {
    totalRevenue: number;
    netEarnings: number;
    totalOrders: number;
    averageOrderValue: number;
    availableBalance: number;
    pendingBalance: number;
  };
  packagePerformance?: {
    totalPackages: number;
    activePackages: number;
    totalViews: number;
    totalOrders: number;
    conversionRate: number;
  };
  performanceMetrics?: {
    averageRating: number;
    totalReviews: number;
    completionRate: number;
    onTimeDeliveryRate: number;
    responseRate: number;
    repeatCustomerRate: number;
  };
}

interface EmployerStats {
  totalSpent: number;
  activeJobs: number;
  totalJobs: number;
  receivedProposals: number;
  hiredFreelancers: number;
  avgProjectValue: number;
  successRate: number;
  savedFreelancers: number;
  // Backend DTO fields
  orderSummary?: {
    totalOrders: number;
    completedOrders: number;
    inProgressOrders: number;
    totalSpent: number;
    averageOrderValue: number;
  };
  favorites?: {
    totalFavorites: number;
  };
}

export function DashboardStats({ user }: DashboardStatsProps) {
  const [stats, setStats] = useState<FreelancerStats | EmployerStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Real API call to get dashboard stats
        const endpoint =
          user.userType === 'freelancer'
            ? '/api/v1/dashboard/seller/me'
            : '/api/v1/dashboard/buyer/me';

        const response = await fetch(endpoint, {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();
        setStats(data.data || null);
      } catch (error) {
        logger.error('Error fetching stats:', error instanceof Error ? error : new Error(String(error)));
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-20 rounded bg-gray-200"></div>
                  <div className="h-8 w-16 rounded bg-gray-200"></div>
                </div>
                <div className="h-12 w-12 rounded-lg bg-gray-200"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (user.userType === 'freelancer') {
    const freelancerStats = stats as FreelancerStats;
    const revenue = freelancerStats.revenueMetrics || {
      totalRevenue: freelancerStats.totalEarnings || 0,
      netEarnings: freelancerStats.totalEarnings || 0,
      totalOrders: freelancerStats.completedJobs || 0,
      averageOrderValue: 0,
      availableBalance: 0,
      pendingBalance: 0,
    };
    const performance = freelancerStats.performanceMetrics || {
      averageRating: freelancerStats.rating || 0,
      totalReviews: freelancerStats.completedJobs || 0,
      completionRate: 0,
      onTimeDeliveryRate: freelancerStats.onTimeDelivery || 0,
      responseRate: freelancerStats.responseRate || 0,
      repeatCustomerRate: freelancerStats.repeatClients || 0,
    };
    const packages = freelancerStats.packagePerformance || {
      totalPackages: 0,
      activePackages: freelancerStats.activeProjects || 0,
      totalViews: freelancerStats.profileViews || 0,
      totalOrders: freelancerStats.completedJobs || 0,
      conversionRate: 0,
    };

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Kazanç</p>
              <p className="text-2xl font-bold text-gray-900">
                ₺{(revenue.netEarnings || 0).toLocaleString('tr-TR')}
              </p>
              <p className="mt-1 text-xs text-green-600">
                {revenue.totalOrders || 0} sipariş
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Aktif Paketler
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {packages.activePackages || 0}
              </p>
              <p className="mt-1 text-xs text-blue-600">
                {packages.totalPackages || 0} toplam
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ortalama Puan</p>
              <p className="text-2xl font-bold text-gray-900">
                {(performance.averageRating || 0).toFixed(1)}
              </p>
              <p className="mt-1 text-xs text-yellow-600">
                {performance.totalReviews || 0} değerlendirme
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
              <Star className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Profil Görüntüleme
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {packages.totalViews || 0}
              </p>
              <p className="mt-1 text-xs text-purple-600">
                {packages.conversionRate
                  ? `${(packages.conversionRate * 100).toFixed(1)}%`
                  : '0%'}{' '}
                dönüşüm
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <Eye className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const employerStats = stats as EmployerStats;
  const orders = employerStats.orderSummary || {
    totalOrders: employerStats.totalJobs || 0,
    completedOrders: 0,
    inProgressOrders: employerStats.activeJobs || 0,
    totalSpent: employerStats.totalSpent || 0,
    averageOrderValue: employerStats.avgProjectValue || 0,
  };
  const favorites = employerStats.favorites || {
    totalFavorites: employerStats.savedFreelancers || 0,
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6 transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Toplam Harcama</p>
            <p className="text-2xl font-bold text-gray-900">
              ₺{(orders.totalSpent || 0).toLocaleString('tr-TR')}
            </p>
            <p className="mt-1 text-xs text-green-600">
              {orders.totalOrders || 0} proje
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6 transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Aktif Siparişler
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {orders.inProgressOrders || 0}
            </p>
            <p className="mt-1 text-xs text-blue-600">
              {orders.completedOrders || 0} tamamlandı
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
            <Briefcase className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6 transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Kayıtlı Freelancer
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {favorites.totalFavorites || 0}
            </p>
            <p className="mt-1 text-xs text-yellow-600">Favorilerinizde</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100">
            <Users className="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </Card>

      <Card className="p-6 transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Ort. Proje Değeri
            </p>
            <p className="text-2xl font-bold text-gray-900">
              ₺{(orders.averageOrderValue || 0).toLocaleString('tr-TR')}
            </p>
            <p className="mt-1 text-xs text-purple-600">Ortalama</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
            <BarChart3 className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </Card>
    </div>
  );
}
