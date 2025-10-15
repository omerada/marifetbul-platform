'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { Card } from '@/components/ui/Card';
import { logger } from '@/lib/shared/utils/logger';
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
            ? '/api/v1/dashboard/freelancer/stats'
            : '/api/v1/dashboard/employer/stats';

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
        logger.error('Error fetching stats:', error);
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
    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6 transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Toplam Kazanç</p>
              <p className="text-2xl font-bold text-gray-900">
                ₺{freelancerStats.totalEarnings.toLocaleString('tr-TR')}
              </p>
              <p className="mt-1 text-xs text-green-600">+12% bu ay</p>
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
                Aktif Projeler
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {freelancerStats.activeProjects}
              </p>
              <p className="mt-1 text-xs text-blue-600">2 yeni proje</p>
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
                {freelancerStats.rating}
              </p>
              <p className="mt-1 text-xs text-yellow-600">
                {freelancerStats.completedJobs} değerlendirme
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
                {freelancerStats.profileViews}
              </p>
              <p className="mt-1 text-xs text-purple-600">+8% bu hafta</p>
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
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="p-6 transition-shadow hover:shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Toplam Harcama</p>
            <p className="text-2xl font-bold text-gray-900">
              ₺{employerStats.totalSpent.toLocaleString('tr-TR')}
            </p>
            <p className="mt-1 text-xs text-green-600">15 proje</p>
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
              Aktif İş İlanları
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {employerStats.activeJobs}
            </p>
            <p className="mt-1 text-xs text-blue-600">
              {employerStats.receivedProposals} teklif
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
            <p className="text-sm font-medium text-gray-600">İşe Alınan</p>
            <p className="text-2xl font-bold text-gray-900">
              {employerStats.hiredFreelancers}
            </p>
            <p className="mt-1 text-xs text-yellow-600">
              {employerStats.successRate}% başarı
            </p>
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
              ₺{employerStats.avgProjectValue.toLocaleString('tr-TR')}
            </p>
            <p className="mt-1 text-xs text-purple-600">+5% artış</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
            <BarChart3 className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </Card>
    </div>
  );
}
