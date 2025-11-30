'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Employer } from '@/types';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { MessageButton } from '@/components/domains/messaging';
import {
  MapPin,
  Building,
  Star,
  Briefcase,
  DollarSign,
  Mail,
  Calendar,
  Heart,
  Users,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';

interface EmployerProfileProps {
  user: Employer;
}

export function EmployerProfile({ user }: EmployerProfileProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'jobs' | 'reviews'>(
    'overview'
  );
  const [isFavorited, setIsFavorited] = useState(false);

  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'Belirtilmemiş';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
    });
  };

  const getCompanySizeText = (size?: string) => {
    if (!size) return 'Belirtilmemiş';

    switch (size) {
      case '1-10':
        return '1-10 Çalışan';
      case '11-50':
        return '11-50 Çalışan';
      case '51-200':
        return '51-200 Çalışan';
      case '201-500':
        return '201-500 Çalışan';
      case '500+':
        return '500+ Çalışan';
      default:
        return size;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-8 overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="h-32 bg-gradient-to-r from-blue-600 to-blue-700 sm:h-40"></div>
        <div className="relative px-6 pb-6">
          <div className="-mt-16 flex flex-col sm:-mt-20 sm:flex-row sm:items-end sm:space-x-6">
            <div className="relative">
              <Image
                src={user.avatar || '/images/default-avatar.jpg'}
                alt={`${user.firstName} ${user.lastName}`}
                width={120}
                height={120}
                priority
                className="h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg sm:h-32 sm:w-32"
              />
              <div className="absolute right-1 bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-green-500">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </div>

            <div className="mt-4 flex-1 sm:mt-0 sm:mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {user.firstName} {user.lastName}
                  </h1>
                  {user.companyName && (
                    <p className="mt-1 text-lg text-gray-600">
                      {user.companyName}
                    </p>
                  )}
                  <div className="mt-2 flex items-center space-x-4">
                    <div className="flex items-center text-gray-500">
                      <MapPin className="mr-1 h-4 w-4" />
                      <span className="text-sm">{user.location}</span>
                    </div>
                    {user.industry && (
                      <div className="flex items-center text-gray-500">
                        <Building className="mr-1 h-4 w-4" />
                        <span className="text-sm">{user.industry}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center space-x-3 sm:mt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsFavorited(!isFavorited)}
                    className={isFavorited ? 'border-red-600 text-red-600' : ''}
                  >
                    <Heart
                      className={`mr-2 h-4 w-4 ${isFavorited ? 'fill-current' : ''}`}
                    />
                    Favorile Ekle
                  </Button>
                  <MessageButton
                    recipientId={user.id}
                    recipientName={`${user.firstName} ${user.lastName}`}
                    variant="primary"
                    size="sm"
                  >
                    Mesaj Gönder
                  </MessageButton>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="p-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-100">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {user.rating ?? 0}
              </div>
              <div className="text-sm text-gray-500">
                {user.totalReviews ?? 0} Değerlendirme
              </div>
            </Card>

            <Card className="p-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {user.completedJobs ?? 0}
              </div>
              <div className="text-sm text-gray-500">Tamamlanan İş</div>
            </Card>

            <Card className="p-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Briefcase className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {user.activeJobs ?? 0}
              </div>
              <div className="text-sm text-gray-500">Aktif İş</div>
            </Card>

            <Card className="p-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ₺{(user.totalSpent ?? 0).toLocaleString('tr-TR')}
              </div>
              <div className="text-sm text-gray-500">Toplam Harcama</div>
            </Card>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { key: 'overview', label: 'Genel Bakış', icon: Building },
                { key: 'jobs', label: 'İş İlanları', icon: Briefcase },
                { key: 'reviews', label: 'Değerlendirmeler', icon: Star },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() =>
                    setActiveTab(key as 'overview' | 'jobs' | 'reviews')
                  }
                  className={`flex items-center border-b-2 px-1 py-4 text-sm font-medium ${
                    activeTab === key
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* About Company */}
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Şirket Hakkında
                </h3>
                <p className="leading-relaxed text-gray-600">
                  {user.bio || 'Bu şirket henüz bir tanıtım yazısı eklememış.'}
                </p>
              </Card>

              {/* Company Details */}
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Şirket Bilgileri
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-center">
                    <Building className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Şirket Adı</div>
                      <div className="font-medium text-gray-900">
                        {user.companyName || 'Belirtilmemiş'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">
                        Çalışan Sayısı
                      </div>
                      <div className="font-medium text-gray-900">
                        {getCompanySizeText(user.companySize)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Sektör</div>
                      <div className="font-medium text-gray-900">
                        {user.industry || 'Belirtilmemiş'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-3 h-5 w-5 text-gray-400" />
                    <div>
                      <div className="text-sm text-gray-500">Üyelik Tarihi</div>
                      <div className="font-medium text-gray-900">
                        {formatJoinDate(user.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Aktif İş İlanları
                </h3>
                <div className="py-8 text-center">
                  <Briefcase className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">
                    İş ilanları yakında eklenecek.
                  </p>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Freelancer Değerlendirmeleri
                </h3>
                <div className="py-8 text-center">
                  <Star className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <p className="text-gray-500">
                    Değerlendirmeler yakında eklenecek.
                  </p>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              İletişim
            </h3>
            <div className="space-y-3">
              <div className="flex items-center text-gray-600">
                <Mail className="mr-3 h-4 w-4" />
                <span className="text-sm">Mesaj ile iletişim</span>
              </div>
              <div className="flex items-center text-gray-600">
                <MapPin className="mr-3 h-4 w-4" />
                <span className="text-sm">{user.location}</span>
              </div>
            </div>
          </Card>

          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              İstatistikler
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Toplam İş</span>
                <span className="font-medium text-gray-900">
                  {user.totalJobs ?? 0}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Başarı Oranı</span>
                <span className="font-medium text-gray-900">
                  {(user.totalJobs ?? 0) > 0
                    ? Math.round(
                        ((user.completedJobs ?? 0) / (user.totalJobs ?? 1)) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Ortalama Değerlendirme</span>
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 text-yellow-400" />
                  <span className="font-medium text-gray-900">
                    {user.rating ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Son Aktivite
            </h3>
            <div className="py-4 text-center">
              <Calendar className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-500">Son giriş: 5 saat önce</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
