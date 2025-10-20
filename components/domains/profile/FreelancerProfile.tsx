'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Freelancer } from '@/types';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  MapPin,
  Clock,
  Star,
  CheckCircle,
  Briefcase,
  DollarSign,
  Mail,
  Phone,
  Calendar,
  Award,
  Heart,
  MessageCircle,
} from 'lucide-react';

interface FreelancerProfileProps {
  user: Freelancer;
}

export function FreelancerProfile({ user }: FreelancerProfileProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'portfolio' | 'reviews'
  >('overview');
  const [isFavorited, setIsFavorited] = useState(false);

  const formatJoinDate = (dateString?: string) => {
    if (!dateString) return 'Belirtilmemiş';
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
    });
  };

  const getAvailabilityColor = (status: boolean | string | undefined) => {
    // Boolean type compatibility
    if (typeof status === 'boolean') {
      return status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    }

    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'busy':
        return 'bg-yellow-100 text-yellow-800';
      case 'not_available':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAvailabilityText = (status: boolean | string | undefined) => {
    // Boolean type compatibility
    if (typeof status === 'boolean') {
      return status ? 'Müsait' : 'Uygun Değil';
    }

    switch (status) {
      case 'available':
        return 'Müsait';
      case 'busy':
        return 'Meşgul';
      case 'not_available':
        return 'Uygun Değil';
      default:
        return 'Bilinmiyor';
    }
  };

  const getExperienceText = (level?: string) => {
    if (!level) return 'Belirtilmemiş';
    switch (level) {
      case 'beginner':
        return 'Başlangıç';
      case 'intermediate':
        return 'Orta Seviye';
      case 'expert':
        return 'Uzman';
      default:
        return level;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="mb-8 overflow-hidden rounded-xl bg-white shadow-sm">
        <div className="from-primary-600 to-primary-700 h-32 bg-gradient-to-r sm:h-40"></div>
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
              <div
                className={`absolute right-1 bottom-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white text-xs font-semibold ${getAvailabilityColor(user.availability)}`}
              >
                {typeof user.availability === 'boolean'
                  ? user.availability
                    ? '✓'
                    : '✕'
                  : user.availability === 'available'
                    ? '✓'
                    : user.availability === 'busy'
                      ? '⚡'
                      : user.availability === 'not_available'
                        ? '✕'
                        : ''}
              </div>
            </div>

            <div className="mt-4 flex-1 sm:mt-0 sm:mb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="mt-1 text-lg text-gray-600">{user.title}</p>
                  <div className="mt-2 flex items-center text-gray-500">
                    <MapPin className="mr-1 h-4 w-4" />
                    <span className="text-sm">{user.location}</span>
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
                  <Button size="sm">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Mesaj Gönder
                  </Button>
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
                {user.rating}
              </div>
              <div className="text-sm text-gray-500">
                {user.totalReviews} Değerlendirme
              </div>
            </Card>

            <Card className="p-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {user.completedJobs}
              </div>
              <div className="text-sm text-gray-500">Tamamlanan İş</div>
            </Card>

            <Card className="p-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {user.responseTime}
              </div>
              <div className="text-sm text-gray-500">Yanıt Süresi</div>
            </Card>

            <Card className="p-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                ₺{user.hourlyRate || 0}
              </div>
              <div className="text-sm text-gray-500">Saatlik Ücret</div>
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
                { key: 'overview', label: 'Genel Bakış', icon: Briefcase },
                { key: 'portfolio', label: 'Portfolio', icon: Award },
                { key: 'reviews', label: 'Değerlendirmeler', icon: Star },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() =>
                    setActiveTab(key as 'overview' | 'portfolio' | 'reviews')
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
              {/* About */}
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Hakkında
                </h3>
                <p className="leading-relaxed text-gray-600">
                  {user.bio ||
                    'Bu kullanıcı henüz bir tanıtım yazısı eklememış.'}
                </p>
              </Card>

              {/* Skills */}
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Yetenekler
                </h3>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-800 rounded-full px-3 py-1 text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'portfolio' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Portfolio
                </h3>
                {user.portfolio && user.portfolio.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {user.portfolio.map((item) => (
                      <div
                        key={item.id}
                        className="overflow-hidden rounded-lg border"
                      >
                        <Image
                          src={
                            (item.images && item.images[0]) ||
                            '/images/default-portfolio.jpg'
                          }
                          alt={item.title}
                          width={300}
                          height={200}
                          className="h-48 w-full object-cover"
                        />
                        <div className="p-4">
                          <h4 className="mb-2 font-semibold text-gray-900">
                            {item.title}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-gray-500">
                    Henüz portfolio öğesi eklenmemiş.
                  </p>
                )}
              </Card>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Müşteri Değerlendirmeleri
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
          {/* Status */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Durum</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Müsaitlik</span>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${getAvailabilityColor(user.availability)}`}
                >
                  {getAvailabilityText(user.availability)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Deneyim</span>
                <span className="font-medium text-gray-900">
                  {getExperienceText(user.experience)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Üyelik</span>
                <span className="font-medium text-gray-900">
                  {formatJoinDate(user.createdAt)}
                </span>
              </div>
            </div>
          </Card>

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
                <Phone className="mr-3 h-4 w-4" />
                <span className="text-sm">Telefon: İş başladıktan sonra</span>
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
              <p className="text-sm text-gray-500">Son giriş: 2 saat önce</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
