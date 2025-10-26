'use client';

/**
 * Package Detail View Component
 * Seller's detailed view of their package with analytics
 */

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Edit,
  Eye,
  TrendingUp,
  DollarSign,
  Clock,
  Star,
  Users,
  Package as PackageIcon,
  PlayCircle,
} from 'lucide-react';
import type { Package } from '@/types/business/features/package';
import { Button } from '@/components/ui';

interface PackageDetailViewProps {
  package: Package;
  analytics?: {
    viewsToday: number;
    ordersToday: number;
    revenue: number;
    conversionRate: number;
  };
}

export function PackageDetailView({
  package: pkg,
  analytics,
}: PackageDetailViewProps) {
  const [selectedTier, setSelectedTier] = useState<
    'BASIC' | 'STANDARD' | 'PREMIUM'
  >('BASIC');

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const currentTier =
    selectedTier === 'BASIC'
      ? pkg.basicTier
      : selectedTier === 'STANDARD'
        ? pkg.standardTier
        : pkg.premiumTier;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{pkg.title}</h1>
          <p className="mt-2 text-gray-600">{pkg.description}</p>
        </div>
        <Link href={`/dashboard/freelancer/packages/${pkg.id}/edit`}>
          <Button leftIcon={<Edit className="h-5 w-5" />}>Düzenle</Button>
        </Link>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-4">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
            pkg.status === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : pkg.status === 'PAUSED'
                ? 'bg-yellow-100 text-yellow-800'
                : pkg.status === 'DRAFT'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-red-100 text-red-800'
          }`}
        >
          {pkg.status}
        </span>
        {pkg.isFeatured && (
          <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
            Öne Çıkan
          </span>
        )}
        {pkg.isVerified && (
          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            Doğrulanmış
          </span>
        )}
      </div>

      {/* Analytics Grid */}
      {analytics && (
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bugünkü Görüntüleme</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {analytics.viewsToday}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bugünkü Sipariş</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {analytics.ordersToday}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Toplam Gelir</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {formatPrice(analytics.revenue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Dönüşüm Oranı</p>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {analytics.conversionRate.toFixed(1)}%
                </p>
              </div>
              <Users className="h-8 w-8 text-amber-500" />
            </div>
          </div>
        </div>
      )}

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <Eye className="h-6 w-6 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Toplam Görüntülenme</p>
              <p className="text-xl font-bold text-gray-900">{pkg.views}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <PackageIcon className="h-6 w-6 text-gray-600" />
            <div>
              <p className="text-sm text-gray-600">Toplam Sipariş</p>
              <p className="text-xl font-bold text-gray-900">{pkg.orders}</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <Star className="h-6 w-6 text-amber-500" />
            <div>
              <p className="text-sm text-gray-600">Ortalama Puan</p>
              <p className="text-xl font-bold text-gray-900">
                {pkg.rating
                  ? `${pkg.rating.toFixed(1)} (${pkg.reviewCount})`
                  : 'Henüz puan yok'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Package Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Images */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Görseller
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {pkg.images.map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={`${pkg.title} - ${index + 1}`}
                  width={300}
                  height={200}
                  className="aspect-video rounded-lg object-cover"
                />
              ))}
            </div>
            {pkg.videoUrl && (
              <div className="mt-4">
                <a
                  href={pkg.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                >
                  <PlayCircle className="h-5 w-5" />
                  Tanıtım Videosunu İzle
                </a>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Özellikler
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-medium text-gray-900">Öne Çıkanlar</h3>
                <ul className="list-inside list-disc space-y-1 text-gray-700">
                  {pkg.highlights.map((highlight, index) => (
                    <li key={index}>{highlight}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-medium text-gray-900">
                  Teslim Edilecekler
                </h3>
                <ul className="list-inside list-disc space-y-1 text-gray-700">
                  {pkg.deliverables.map((deliverable, index) => (
                    <li key={index}>{deliverable}</li>
                  ))}
                </ul>
              </div>
              {pkg.requirements.length > 0 && (
                <div>
                  <h3 className="mb-2 font-medium text-gray-900">
                    Gereksinimler
                  </h3>
                  <ul className="list-inside list-disc space-y-1 text-gray-700">
                    {pkg.requirements.map((requirement, index) => (
                      <li key={index}>{requirement}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Pricing */}
        <div className="space-y-6">
          {/* Tier Selector */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Paket Seçimi
            </h2>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedTier('BASIC')}
                className={`w-full rounded-lg border-2 p-3 text-left transition ${
                  selectedTier === 'BASIC'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-medium text-gray-900">Basic</div>
                <div className="text-sm text-gray-600">
                  {formatPrice(pkg.basicTier.price)}
                </div>
              </button>
              {pkg.standardTier && (
                <button
                  onClick={() => setSelectedTier('STANDARD')}
                  className={`w-full rounded-lg border-2 p-3 text-left transition ${
                    selectedTier === 'STANDARD'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">Standard</div>
                  <div className="text-sm text-gray-600">
                    {formatPrice(pkg.standardTier.price)}
                  </div>
                </button>
              )}
              {pkg.premiumTier && (
                <button
                  onClick={() => setSelectedTier('PREMIUM')}
                  className={`w-full rounded-lg border-2 p-3 text-left transition ${
                    selectedTier === 'PREMIUM'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">Premium</div>
                  <div className="text-sm text-gray-600">
                    {formatPrice(pkg.premiumTier.price)}
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Selected Tier Details */}
          {currentTier && (
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 font-semibold text-gray-900">
                Paket Detayları
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">
                    {formatPrice(currentTier.price)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{currentTier.deliveryDays} gün teslimat</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-gray-500" />
                  <span>
                    {currentTier.revisionCount === -1
                      ? 'Sınırsız revizyon'
                      : `${currentTier.revisionCount} revizyon`}
                  </span>
                </div>
              </div>
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h4 className="mb-2 text-sm font-medium text-gray-900">
                  Özellikler
                </h4>
                <ul className="space-y-1">
                  {currentTier.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-sm text-gray-700"
                    >
                      <span className="text-green-500">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 font-semibold text-gray-900">Bilgiler</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Kategori:</span>
                <span className="font-medium">{pkg.category?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Oluşturulma:</span>
                <span className="font-medium">{formatDate(pkg.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Güncellenme:</span>
                <span className="font-medium">{formatDate(pkg.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
