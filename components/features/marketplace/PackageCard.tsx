'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Heart,
  Star,
  Clock,
  ShoppingCart,
  User,
  Award,
  CheckCircle,
} from 'lucide-react';
import { useMarketplace } from '@/hooks/useMarketplace';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import type { ServicePackage } from '@/types';
import { cn } from '@/lib/utils';

interface PackageCardProps {
  package: ServicePackage;
  layout: 'grid' | 'list';
}

export function PackageCard({ package: pkg, layout }: PackageCardProps) {
  const { isFavoritePackage, togglePackageFavorite } = useMarketplace();
  const isFavorite = isFavoritePackage(pkg.id);

  const formatDeliveryTime = () => {
    if (pkg.deliveryTime === 1) return '1 gün';
    if (pkg.deliveryTime < 7) return `${pkg.deliveryTime} gün`;
    if (pkg.deliveryTime === 7) return '1 hafta';
    return `${Math.ceil(pkg.deliveryTime / 7)} hafta`;
  };

  if (layout === 'list') {
    return (
      <Card className="group border-gray-200 transition-all duration-300 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:gap-6">
            {/* Image */}
            {pkg.images && pkg.images.length > 0 && (
              <div className="w-full shrink-0 sm:w-32">
                <div className="relative h-48 w-full overflow-hidden rounded-xl shadow-md sm:h-32 sm:w-32">
                  <Image
                    src={pkg.images[0]}
                    alt={pkg.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>
            )}

            {/* Main Content */}
            <div className="min-w-0 flex-1 space-y-3 sm:space-y-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="border-blue-200 bg-blue-50 text-xs text-blue-700"
                    >
                      {pkg.category}
                    </Badge>
                    {pkg.rating >= 4.8 && (
                      <Badge className="border-amber-200 bg-amber-100 text-xs text-amber-800">
                        <Award className="mr-1 h-3 w-3" />
                        Öne Çıkan
                      </Badge>
                    )}
                  </div>

                  <Link
                    href={`/marketplace/packages/${pkg.id}`}
                    className="line-clamp-2 block text-xl font-bold text-gray-900 transition-colors hover:text-blue-600"
                  >
                    {pkg.title}
                  </Link>

                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="mr-1 h-4 w-4" />
                      <Link
                        href={`/profile/${pkg.freelancer.id}`}
                        className="font-medium transition-colors hover:text-blue-600"
                      >
                        {pkg.freelancer.firstName} {pkg.freelancer.lastName}
                      </Link>
                    </div>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center">
                      <Star className="mr-1 h-4 w-4 fill-current text-amber-400" />
                      <span className="font-medium">
                        {pkg.rating.toFixed(1)}
                      </span>
                      <span className="text-gray-500">({pkg.reviews})</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => togglePackageFavorite(pkg.id)}
                  className={cn(
                    'rounded-full p-2 transition-all duration-200 hover:scale-110 sm:p-3',
                    isFavorite
                      ? 'bg-red-50 text-red-500 hover:bg-red-100'
                      : 'text-gray-400 hover:bg-gray-50 hover:text-red-500'
                  )}
                >
                  <Heart
                    className={cn(
                      'h-4 w-4 sm:h-5 sm:w-5',
                      isFavorite && 'fill-current'
                    )}
                  />
                </button>
              </div>

              <p className="line-clamp-2 leading-relaxed text-gray-600">
                {pkg.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center rounded-full bg-gray-50 px-3 py-1">
                  <Clock className="mr-1 h-4 w-4" />
                  <span className="font-medium">{formatDeliveryTime()}</span>
                </div>
                <div className="flex items-center rounded-full bg-gray-50 px-3 py-1">
                  <ShoppingCart className="mr-1 h-4 w-4" />
                  <span className="font-medium">{pkg.orders} sipariş</span>
                </div>
                <div className="flex items-center rounded-full bg-green-50 px-3 py-1 text-green-700">
                  <CheckCircle className="mr-1 h-4 w-4" />
                  <span className="font-medium">{pkg.revisions} revizyon</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {pkg.features.slice(0, 4).map((feature) => (
                  <Badge
                    key={feature}
                    variant="outline"
                    className="border-gray-200 bg-white text-xs"
                  >
                    {feature}
                  </Badge>
                ))}
                {pkg.features.length > 4 && (
                  <Badge
                    variant="outline"
                    className="border-gray-300 bg-gray-100 text-xs"
                  >
                    +{pkg.features.length - 4} daha
                  </Badge>
                )}
              </div>
            </div>

            {/* Right Side - Price & Actions */}
            <div className="flex w-full flex-row items-center justify-between gap-4 border-t border-gray-100 pt-4 sm:w-auto sm:min-w-[140px] sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
              <div className="text-left sm:text-right">
                <div className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  {formatCurrency(pkg.price)}
                </div>
                <div className="text-sm text-gray-500">başlangıç fiyatı</div>
              </div>

              <div className="flex gap-2 sm:w-full sm:flex-col sm:space-y-2">
                <Link
                  href={`/marketplace/packages/${pkg.id}`}
                  className="flex-1 sm:block"
                >
                  <Button
                    size="sm"
                    className="sm:size-lg w-full bg-blue-600 shadow-md hover:bg-blue-700"
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Satın Al
                  </Button>
                </Link>
                <Link
                  href={`/marketplace/packages/${pkg.id}`}
                  className="flex-1 sm:block"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="sm:size-sm w-full border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                  >
                    Detaylar
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group overflow-hidden border-gray-200 transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100">
      {/* Image */}
      {pkg.images && pkg.images.length > 0 && (
        <div className="relative h-48 overflow-hidden">
          <Image
            src={pkg.images[0]}
            alt={pkg.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

          {/* Floating elements */}
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge
              variant="outline"
              className="border-white bg-white/90 text-xs text-gray-700 backdrop-blur-sm"
            >
              {pkg.category}
            </Badge>
            {pkg.rating >= 4.8 && (
              <Badge className="border-amber-600 bg-amber-500 text-xs text-white">
                <Award className="mr-1 h-3 w-3" />
                Öne Çıkan
              </Badge>
            )}
          </div>

          <button
            onClick={() => togglePackageFavorite(pkg.id)}
            className={cn(
              'absolute top-3 right-3 rounded-full p-2 backdrop-blur-sm transition-all duration-200 hover:scale-110',
              isFavorite
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
            )}
          >
            <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
          </button>
        </div>
      )}

      <CardHeader className="space-y-3 pb-3">
        {!pkg.images?.length && (
          <div className="flex items-start justify-between">
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-xs text-blue-700"
            >
              {pkg.category}
            </Badge>
            <button
              onClick={() => togglePackageFavorite(pkg.id)}
              className={cn(
                'rounded-full p-1 transition-colors',
                isFavorite
                  ? 'text-red-500 hover:text-red-600'
                  : 'text-gray-400 hover:text-red-500'
              )}
            >
              <Heart className={cn('h-4 w-4', isFavorite && 'fill-current')} />
            </button>
          </div>
        )}

        <Link
          href={`/marketplace/packages/${pkg.id}`}
          className="line-clamp-2 text-lg leading-tight font-bold text-gray-900 transition-colors hover:text-blue-600"
        >
          {pkg.title}
        </Link>

        <div className="flex items-center text-sm text-gray-600">
          <User className="mr-1 h-4 w-4" />
          <Link
            href={`/profile/${pkg.freelancer.id}`}
            className="font-medium transition-colors hover:text-blue-600"
          >
            {pkg.freelancer.firstName} {pkg.freelancer.lastName}
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
          {pkg.description}
        </p>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
            <div className="flex items-center text-gray-600">
              <Star className="mr-1 h-4 w-4 fill-current text-amber-400" />
              <span className="font-medium">{pkg.rating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-gray-500">({pkg.reviews})</span>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
            <div className="flex items-center text-gray-600">
              <Clock className="mr-1 h-4 w-4" />
              <span className="text-xs font-medium">
                {formatDeliveryTime()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-green-50 px-3 py-2">
          <div className="flex items-center text-green-700">
            <ShoppingCart className="mr-1 h-4 w-4" />
            <span className="text-sm font-medium">{pkg.orders} sipariş</span>
          </div>
          <div className="flex items-center text-green-700">
            <CheckCircle className="mr-1 h-4 w-4" />
            <span className="text-sm font-medium">
              {pkg.revisions} revizyon
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {pkg.features.slice(0, 3).map((feature) => (
            <Badge
              key={feature}
              variant="outline"
              className="border-gray-200 bg-white text-xs"
            >
              {feature}
            </Badge>
          ))}
          {pkg.features.length > 3 && (
            <Badge
              variant="outline"
              className="border-gray-300 bg-gray-100 text-xs"
            >
              +{pkg.features.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(pkg.price)}
            </div>
            <div className="text-xs text-gray-500">başlangıç fiyatı</div>
          </div>

          <div className="space-x-2">
            <Link href={`/marketplace/packages/${pkg.id}`}>
              <Button
                size="sm"
                className="bg-blue-600 shadow-md hover:bg-blue-700"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Satın Al
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
