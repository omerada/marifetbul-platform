'use client';

import React from 'react';
import Link from 'next/link';
import { ServicePackage } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Clock, Star, Heart, ShoppingCart } from 'lucide-react';
import Image from 'next/image';

interface ServiceCardProps {
  service: ServicePackage;
  onAddToCart?: (service: ServicePackage) => void;
  onSaveService?: (service: ServicePackage) => void;
  className?: string;
}

export function ServiceCard({
  service,
  onAddToCart,
  onSaveService,
  className,
}: ServiceCardProps) {
  const formatPrice = (price: number) => {
    return `₺${price.toLocaleString('tr-TR')}`;
  };

  const formatDeliveryTime = (days: number) => {
    if (days === 1) return '1 gün';
    if (days < 7) return `${days} gün`;
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    if (remainingDays === 0) return `${weeks} hafta`;
    return `${weeks}h ${remainingDays}g`;
  };

  return (
    <Card
      className={`cursor-pointer overflow-hidden transition-shadow hover:shadow-lg ${className}`}
    >
      <div className="relative">
        {/* Service Image */}
        <div className="relative h-48 bg-gray-200">
          {service.images && service.images[0] ? (
            <Image
              src={service.images[0]}
              alt={service.title}
              fill
              className="object-cover"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
              <div className="text-center">
                <ShoppingCart className="mx-auto mb-2 h-12 w-12 text-gray-400" />
                <p className="text-sm text-gray-500">{service.category}</p>
              </div>
            </div>
          )}

          {/* Save button */}
          {onSaveService && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSaveService(service);
              }}
              className="absolute top-3 right-3 rounded-full bg-white/80 p-2 shadow-sm transition-colors hover:bg-white"
            >
              <Heart className="h-4 w-4 text-gray-600 hover:text-red-500" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3 p-4">
          {/* Freelancer info */}
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-300">
              <span className="text-xs font-medium text-gray-600">
                {service.freelancer.firstName[0]}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {service.freelancer.firstName} {service.freelancer.lastName}
            </span>
            <div className="flex items-center">
              <Star className="h-3 w-3 fill-current text-yellow-400" />
              <span className="ml-1 text-xs text-gray-600">
                {service.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Title */}
          <h3 className="line-clamp-2 font-semibold text-gray-900 transition-colors hover:text-blue-600">
            {service.title}
          </h3>

          {/* Features */}
          <div className="space-y-1">
            {service.features.slice(0, 3).map((feature, index) => (
              <div
                key={index}
                className="flex items-center text-sm text-gray-600"
              >
                <div className="mr-2 h-1 w-1 rounded-full bg-green-500"></div>
                {feature}
              </div>
            ))}
            {service.features.length > 3 && (
              <p className="text-xs text-gray-500">
                +{service.features.length - 3} daha fazla özellik
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Clock className="mr-1 h-3 w-3" />
                {formatDeliveryTime(service.deliveryTime)}
              </span>
              <span>{service.orders} sipariş</span>
            </div>
            <span>{service.reviews} değerlendirme</span>
          </div>

          {/* Price and Action */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <div>
              <span className="text-lg font-bold text-gray-900">
                {formatPrice(service.price)}
              </span>
            </div>

            <div className="flex space-x-2">
              {onAddToCart && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(service);
                  }}
                >
                  Sepete Ekle
                </Button>
              )}
              <Link href={`/packages/${service.id}`}>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  Detayları Gör
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
