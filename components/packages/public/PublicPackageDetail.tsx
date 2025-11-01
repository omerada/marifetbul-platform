'use client';

/**
 * Public Package Detail Component
 * Customer-facing package detail with order functionality
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  Clock,
  RefreshCw,
  CheckCircle,
  PlayCircle,
  Shield,
  Award,
  Heart,
  Share2,
} from 'lucide-react';
import type { Package } from '@/types/business/features/package';
import { Button } from '@/components/ui';
import { favoritesApi } from '@/lib/api/favorites';
import { OrderModal } from './OrderModal';
import { ReviewList } from '@/components/shared/ReviewList';
import { usePackageReviewsHook } from '@/hooks';
import { logger } from '@/lib/shared/utils/logger';

interface PublicPackageDetailProps {
  package: Package;
}

export function PublicPackageDetail({
  package: pkg,
}: PublicPackageDetailProps) {
  const [selectedTier, setSelectedTier] = useState<
    'BASIC' | 'STANDARD' | 'PREMIUM'
  >('BASIC');
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  // Fetch package reviews
  const {
    reviews,
    stats,
    loading: reviewsLoading,
    error: reviewsError,
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    fetchReviews,
    filterByRating,
    sortReviews,
  } = usePackageReviewsHook({
    packageId: pkg.id,
    autoFetch: true,
    pageSize: 10,
  });

  // Check if package is favorited on mount
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const response = await favoritesApi.checkPackageFavorite(pkg.id);
        setIsFavorited(response.isFavorited);
      } catch {
        // User might not be logged in, ignore error silently
      }
    };

    checkFavorite();
  }, [pkg.id]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(price);
  };

  const currentTier =
    selectedTier === 'BASIC'
      ? pkg.basicTier
      : selectedTier === 'STANDARD'
        ? pkg.standardTier
        : pkg.premiumTier;

  if (!currentTier) return null;

  const handleOrder = () => {
    setIsOrderModalOpen(true);
  };

  const handleFavorite = async () => {
    if (favoriteLoading) return;

    try {
      setFavoriteLoading(true);
      const response = await favoritesApi.togglePackageFavorite(pkg.id);
      setIsFavorited(response.isFavorited);
    } catch (error) {
      logger.error('Failed to toggle favorite:', error);
      // Revert on error
      setIsFavorited(!isFavorited);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: pkg.title,
        text: pkg.description,
        url: window.location.href,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{pkg.title}</h1>
          <p className="mt-2 text-gray-600">{pkg.description}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleFavorite}
            disabled={favoriteLoading}
            leftIcon={
              <Heart
                className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`}
              />
            }
          >
            {favoriteLoading
              ? 'Kaydediliyor...'
              : isFavorited
                ? 'Favorilerde'
                : 'Favorile'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            leftIcon={<Share2 className="h-4 w-4" />}
          >
            Paylaş
          </Button>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2">
        {pkg.isFeatured && (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-800">
            <Award className="h-4 w-4" />
            Öne Çıkan
          </span>
        )}
        {pkg.isVerified && (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
            <Shield className="h-4 w-4" />
            Doğrulanmış
          </span>
        )}
        <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
          {pkg.category?.name}
        </span>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Images */}
          <div className="space-y-4">
            <Image
              src={pkg.images[0]}
              alt={pkg.title}
              width={800}
              height={500}
              className="w-full rounded-lg object-cover"
            />
            <div className="grid grid-cols-4 gap-4">
              {pkg.images.slice(1, 5).map((image, index) => (
                <Image
                  key={index}
                  src={image}
                  alt={`${pkg.title} - ${index + 2}`}
                  width={200}
                  height={150}
                  className="aspect-video rounded-lg object-cover"
                />
              ))}
            </div>
            {pkg.videoUrl && (
              <a
                href={pkg.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
              >
                <PlayCircle className="h-5 w-5" />
                Tanıtım Videosunu İzle
              </a>
            )}
          </div>

          {/* Seller Info */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-4">
              {pkg.seller?.avatarUrl ? (
                <Image
                  src={pkg.seller.avatarUrl}
                  alt={pkg.seller.fullName}
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <span className="text-2xl font-bold text-purple-600">
                    {pkg.seller?.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <Link
                  href={`/profile/${pkg.seller?.username}`}
                  className="text-lg font-semibold text-gray-900 hover:text-purple-600"
                >
                  {pkg.seller?.fullName}
                </Link>
                {pkg.seller?.rating && (
                  <div className="mt-1 flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="font-medium">
                      {pkg.seller.rating.toFixed(1)}
                    </span>
                    <span className="text-gray-500">
                      ({pkg.seller.reviewCount} değerlendirme)
                    </span>
                  </div>
                )}
              </div>
              <Link href={`/messages/new?to=${pkg.sellerId}`}>
                <Button variant="outline" size="sm">
                  Mesaj Gönder
                </Button>
              </Link>
            </div>
          </div>

          {/* About Package */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold text-gray-900">
              Paket Hakkında
            </h2>

            {/* Highlights */}
            <div className="mb-6">
              <h3 className="mb-2 font-medium text-gray-900">
                Öne Çıkan Özellikler
              </h3>
              <ul className="space-y-2">
                {pkg.highlights.map((highlight, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-gray-700"
                  >
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Deliverables */}
            <div className="mb-6">
              <h3 className="mb-2 font-medium text-gray-900">
                Teslim Edilecekler
              </h3>
              <ul className="space-y-2">
                {pkg.deliverables.map((deliverable, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-gray-700"
                  >
                    <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                    <span>{deliverable}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            {pkg.requirements.length > 0 && (
              <div>
                <h3 className="mb-2 font-medium text-gray-900">
                  Sizden Gerekenler
                </h3>
                <ul className="space-y-2">
                  {pkg.requirements.map((requirement, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 text-gray-700"
                    >
                      <span className="text-purple-500">•</span>
                      <span>{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {pkg.orders}
                </div>
                <div className="text-sm text-gray-600">Sipariş</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {pkg.views}
                </div>
                <div className="text-sm text-gray-600">Görüntülenme</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {pkg.rating ? pkg.rating.toFixed(1) : '-'}
                </div>
                <div className="text-sm text-gray-600">Puan</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Order Card (Sticky) */}
        <div className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            {/* Tier Selector */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Paket Seç
              </h3>
              <div className="space-y-2">
                {/* Basic */}
                <button
                  onClick={() => setSelectedTier('BASIC')}
                  className={`w-full rounded-lg border-2 p-4 text-left transition ${
                    selectedTier === 'BASIC'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">Basic</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPrice(pkg.basicTier.price)}
                      </div>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {pkg.basicTier.deliveryDays} gün
                      </div>
                    </div>
                  </div>
                </button>

                {/* Standard */}
                {pkg.standardTier && (
                  <button
                    onClick={() => setSelectedTier('STANDARD')}
                    className={`w-full rounded-lg border-2 p-4 text-left transition ${
                      selectedTier === 'STANDARD'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">
                          Standard
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(pkg.standardTier.price)}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {pkg.standardTier.deliveryDays} gün
                        </div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Premium */}
                {pkg.premiumTier && (
                  <button
                    onClick={() => setSelectedTier('PREMIUM')}
                    className={`w-full rounded-lg border-2 p-4 text-left transition ${
                      selectedTier === 'PREMIUM'
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-gray-900">
                          Premium
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatPrice(pkg.premiumTier.price)}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {pkg.premiumTier.deliveryDays} gün
                        </div>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            </div>

            {/* Selected Tier Details */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h4 className="mb-4 font-semibold text-gray-900">
                Paket İçeriği
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>{currentTier.deliveryDays} gün teslimat</span>
                </div>
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 text-gray-500" />
                  <span>
                    {currentTier.revisionCount === -1
                      ? 'Sınırsız revizyon'
                      : `${currentTier.revisionCount} revizyon`}
                  </span>
                </div>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4">
                <ul className="space-y-2">
                  {currentTier.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button onClick={handleOrder} className="mt-6 w-full" size="lg">
                Sipariş Ver ({formatPrice(currentTier.price)})
              </Button>
            </div>

            {/* Trust Badge */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-5 w-5 text-green-500" />
                <span>MarifetBul Alıcı Güvencesi</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <ReviewList
          reviews={reviews}
          stats={stats}
          loading={reviewsLoading}
          error={reviewsError}
          currentPage={currentPage}
          totalPages={totalPages}
          _pageSize={pageSize}
          totalElements={totalElements}
          onPageChange={(page) => fetchReviews(page - 1)}
          onFilterChange={(filters) => {
            if (filters.minRating) {
              filterByRating(filters.minRating);
            }
          }}
          onSortChange={(sortBy, sortDirection) =>
            sortReviews(sortBy, sortDirection)
          }
          showStats={true}
          showFilters={true}
          showPackageInfo={false}
          showActions={false}
        />
      </div>

      {/* Order Modal */}
      <OrderModal
        package={pkg}
        initialTier={selectedTier}
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
      />
    </div>
  );
}
