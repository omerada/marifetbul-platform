'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import {
  TrendingUp,
  Clock,
  DollarSign,
  Star,
  Eye,
  MessageCircle,
  ChevronRight,
  Calendar,
  Target,
  Briefcase,
  Package,
} from 'lucide-react';

interface MobileDashboardProps {
  user: {
    id: string;
    name: string;
    userType: 'freelancer' | 'employer';
  };
  stats: {
    totalEarnings?: number;
    activeProjects?: number;
    completedProjects?: number;
    avgRating?: number;
    totalViews?: number;
    responseTime?: string;
    activeJobs?: number;
    totalSpent?: number;
    totalHires?: number;
  };
}

export function MobileDashboard({ user, stats }: MobileDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'quick'>(
    'overview'
  );

  const isFreelancer = user.userType === 'freelancer';

  const quickActions = [
    {
      icon: isFreelancer ? Package : Briefcase,
      label: isFreelancer ? 'Yeni Hizmet' : 'Yeni İş İlanı',
      href: isFreelancer ? '/packages/create' : '/jobs/create',
      color: 'bg-blue-500',
    },
    {
      icon: MessageCircle,
      label: 'Mesajlar',
      href: '/messages',
      color: 'bg-green-500',
    },
    {
      icon: Calendar,
      label: 'Takvim',
      href: '/calendar',
      color: 'bg-purple-500',
    },
    {
      icon: Target,
      label: 'Hedefler',
      href: '/goals',
      color: 'bg-orange-500',
    },
  ];

  const recentActivity = [
    {
      icon: MessageCircle,
      title: 'Yeni mesaj aldınız',
      description: 'Ahmed K. sizinle iletişime geçti',
      time: '5 dk önce',
      type: 'message',
    },
    {
      icon: Eye,
      title: 'Profiliniz görüntülendi',
      description: '3 yeni profil görüntülenmesi',
      time: '1 saat önce',
      type: 'view',
    },
    {
      icon: Star,
      title: 'Yeni değerlendirme',
      description: '5 yıldızlı değerlendirme aldınız',
      time: '2 saat önce',
      type: 'rating',
    },
  ];

  const freelancerStats = [
    {
      icon: DollarSign,
      label: 'Toplam Kazanç',
      value: stats.totalEarnings
        ? `₺${stats.totalEarnings.toLocaleString()}`
        : '₺0',
      change: '+15%',
      color: 'text-green-600',
    },
    {
      icon: Briefcase,
      label: 'Aktif Projeler',
      value: stats.activeProjects?.toString() || '0',
      change: '+2',
      color: 'text-blue-600',
    },
    {
      icon: Star,
      label: 'Ortalama Puan',
      value: stats.avgRating?.toFixed(1) || '0.0',
      change: '+0.2',
      color: 'text-yellow-600',
    },
    {
      icon: Clock,
      label: 'Yanıt Süresi',
      value: stats.responseTime || '< 1 saat',
      change: '-10 dk',
      color: 'text-purple-600',
    },
  ];

  const employerStats = [
    {
      icon: DollarSign,
      label: 'Toplam Harcama',
      value: stats.totalSpent ? `₺${stats.totalSpent.toLocaleString()}` : '₺0',
      change: '+8%',
      color: 'text-blue-600',
    },
    {
      icon: Briefcase,
      label: 'Aktif İş İlanları',
      value: stats.activeJobs?.toString() || '0',
      change: '+1',
      color: 'text-green-600',
    },
    {
      icon: Target,
      label: 'Toplam İşe Alım',
      value: stats.totalHires?.toString() || '0',
      change: '+3',
      color: 'text-purple-600',
    },
    {
      icon: Eye,
      label: 'Toplam Görüntülenme',
      value: stats.totalViews?.toString() || '0',
      change: '+25',
      color: 'text-orange-600',
    },
  ];

  const currentStats = isFreelancer ? freelancerStats : employerStats;

  const tabs = [
    { id: 'overview', label: 'Genel Bakış' },
    { id: 'activity', label: 'Aktivite' },
    { id: 'quick', label: 'Hızlı İşlemler' },
  ];

  return (
    <div className="lg:hidden">
      {/* Tab Navigation */}
      <div className="sticky top-16 z-20 border-b border-gray-200 bg-white">
        <div className="scrollbar-hide flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setActiveTab(tab.id as 'overview' | 'activity' | 'quick')
              }
              className={`flex-shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4 p-4 pb-20">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            {/* Welcome Card */}
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white">
              <div>
                <h2 className="text-lg font-semibold">Merhaba {user.name}!</h2>
                <p className="mt-1 text-blue-100">
                  {isFreelancer
                    ? 'Bugün hangi projeye odaklanacaksın?'
                    : 'Yeni yetenekler keşfetmeye hazır mısın?'}
                </p>
              </div>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3">
              {currentStats.map((stat, index) => (
                <Card key={index} className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <span className="text-xs text-gray-500">{stat.change}</span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{stat.value}</p>
                    <p className="text-xs text-gray-600">{stat.label}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Quick Stats */}
            <Card className="p-4">
              <h3 className="mb-3 font-semibold text-gray-900">Bu Hafta</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Tamamlanan İşler
                  </span>
                  <span className="text-sm font-medium">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Yeni Mesajlar</span>
                  <span className="text-sm font-medium">12</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Profil Görüntülenme
                  </span>
                  <span className="text-sm font-medium">45</span>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <>
            <Card className="p-4">
              <h3 className="mb-4 font-semibold text-gray-900">
                Son Aktiviteler
              </h3>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div
                      className={`rounded-full p-2 ${
                        activity.type === 'message'
                          ? 'bg-blue-100'
                          : activity.type === 'view'
                            ? 'bg-green-100'
                            : 'bg-yellow-100'
                      }`}
                    >
                      <activity.icon
                        className={`h-4 w-4 ${
                          activity.type === 'message'
                            ? 'text-blue-600'
                            : activity.type === 'view'
                              ? 'text-green-600'
                              : 'text-yellow-600'
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        {activity.description}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4">
              <h3 className="mb-4 font-semibold text-gray-900">
                Bugünün Görevleri
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm">
                    Client toplantısına katıl (14:00)
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm">Proje sunumunu hazırla</span>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    defaultChecked
                  />
                  <span className="text-sm text-gray-500 line-through">
                    Teklif gönder
                  </span>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* Quick Actions Tab */}
        {activeTab === 'quick' && (
          <>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <Card
                  key={index}
                  className="p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex flex-col items-center space-y-3 text-center">
                    <div className={`rounded-full p-3 ${action.color}`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {action.label}
                    </span>
                  </div>
                </Card>
              ))}
            </div>

            <Card className="p-4">
              <h3 className="mb-4 font-semibold text-gray-900">
                Sık Kullanılan
              </h3>
              <div className="space-y-3">
                <button className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium">
                      Performans Raporları
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>

                <button className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium">Ödeme Geçmişi</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>

                <button className="flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Star className="h-5 w-5 text-gray-400" />
                    <span className="text-sm font-medium">
                      Değerlendirmeler
                    </span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </button>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
