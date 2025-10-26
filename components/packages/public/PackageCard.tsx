'use client';

/**
 * Package Card Component
 * Customer-facing package card for marketplace listings
 */

import Link from 'next/link';
import Image from 'next/image';
import { Star, Package as PackageIcon } from 'lucide-react';
import type { PackageSummary } from '@/types/business/features/package';

interface PackageCardProps {
  package: PackageSummary;
}

export function PackageCard({ package: pkg }: PackageCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link href={`/marketplace/packages/${pkg.slug}`}>
      <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white transition-all hover:border-purple-300 hover:shadow-lg">
        {/* Image */}
        <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
          <Image
            src={pkg.coverImage}
            alt={pkg.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {pkg.isFeatured && (
            <div className="absolute top-2 left-2 rounded-full bg-purple-600 px-3 py-1 text-xs font-medium text-white">
              Öne Çıkan
            </div>
          )}
          {pkg.isVerified && (
            <div className="absolute top-2 right-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
              ✓ Doğrulanmış
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Seller Info */}
          <div className="mb-3 flex items-center gap-2">
            {pkg.sellerAvatar ? (
              <Image
                src={pkg.sellerAvatar}
                alt={pkg.sellerName}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-100">
                <span className="text-xs font-medium text-purple-600">
                  {pkg.sellerName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-sm font-medium text-gray-700">
              {pkg.sellerName}
            </span>
            {pkg.sellerRating && (
              <div className="ml-auto flex items-center gap-1 text-xs text-gray-600">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="font-medium">
                  {pkg.sellerRating.toFixed(1)}
                </span>
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-purple-600">
            {pkg.title}
          </h3>

          {/* Description */}
          <p className="mb-3 line-clamp-2 text-sm text-gray-600">
            {pkg.description}
          </p>

          {/* Stats */}
          <div className="mb-3 flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <PackageIcon className="h-3 w-3" />
              <span>{pkg.orders} sipariş</span>
            </div>
            {pkg.rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span>
                  {pkg.rating.toFixed(1)} ({pkg.reviewCount})
                </span>
              </div>
            )}
          </div>

          {/* Category */}
          <div className="mb-3">
            <span className="inline-block rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
              {pkg.categoryName}
            </span>
          </div>

          {/* Price */}
          <div className="flex items-end justify-between border-t border-gray-100 pt-3">
            <div>
              <div className="text-xs text-gray-500">Başlangıç fiyatı</div>
              <div className="text-xl font-bold text-gray-900">
                {formatPrice(pkg.basicPrice)}
              </div>
            </div>
            {pkg.premiumPrice && (
              <div className="text-right">
                <div className="text-xs text-gray-500">En yüksek</div>
                <div className="text-sm font-semibold text-gray-700">
                  {formatPrice(pkg.premiumPrice)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
