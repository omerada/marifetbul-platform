'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Clock,
  User,
  Star,
  ShoppingCart,
  Heart,
  Share2,
  Flag,
  Check,
  RefreshCw,
  MessageCircle,
  Award,
} from 'lucide-react';
import { ServicePackage } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { OrderForm } from './OrderForm';

interface ServiceDetailProps {
  servicePackage: ServicePackage;
  className?: string;
}

export function ServiceDetail({
  servicePackage,
  className,
}: ServiceDetailProps) {
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return 'Şimdi';
    if (diffInHours < 24) return `${diffInHours} saat önce`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} hafta önce`;
  };

  return (
    <div className={`container mx-auto px-4 py-8 ${className}`}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-6 lg:col-span-2">
          {/* Header */}
          <Card className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex-1">
                <h1 className="mb-2 text-2xl font-bold text-gray-900">
                  {servicePackage.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Star className="mr-1 h-4 w-4 fill-current text-yellow-400" />
                    <span className="font-medium">
                      {servicePackage.rating.toFixed(1)}
                    </span>
                    <span className="ml-1">
                      ({servicePackage.reviews} değerlendirme)
                    </span>
                  </div>
                  <span>{servicePackage.orders} sipariş</span>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSaved(!isSaved)}
                  className={isSaved ? 'text-red-500' : 'text-gray-400'}
                >
                  <Heart
                    className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`}
                  />
                </Button>
                <Button variant="ghost" size="sm">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Image Gallery */}
            {servicePackage.images && servicePackage.images.length > 0 && (
              <div className="mb-6">
                <div className="relative mb-4 aspect-video overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={servicePackage.images[currentImageIndex]}
                    alt={servicePackage.title}
                    fill
                    className="object-cover"
                    onError={() => {
                      // Fallback for image load errors
                    }}
                  />
                </div>

                {servicePackage.images.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto">
                    {servicePackage.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                          currentImageIndex === index
                            ? 'border-blue-500'
                            : 'border-gray-200'
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${servicePackage.title} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Hizmet Açıklaması
              </h3>
              <div className="prose max-w-none text-gray-700">
                {servicePackage.description
                  .split('\n')
                  .map((paragraph, index) => (
                    <p key={index} className="mb-3">
                      {paragraph}
                    </p>
                  ))}
              </div>
            </div>

            {/* Features */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Bu Hizmette Neler Var?
              </h3>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {servicePackage.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-gray-700">
                    <Check className="mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Service Details */}
            <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-3">
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Teslimat Süresi
                  </div>
                  <div className="text-sm text-gray-600">
                    {formatDeliveryTime(servicePackage.deliveryTime)}
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <RefreshCw className="mr-2 h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Revizyon
                  </div>
                  <div className="text-sm text-gray-600">
                    {servicePackage.revisions} kez ücretsiz
                  </div>
                </div>
              </div>
              <div className="flex items-center">
                <Award className="mr-2 h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    Kategori
                  </div>
                  <div className="text-sm text-gray-600">
                    {servicePackage.category}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Order Form */}
          {showOrderForm && (
            <Card className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-gray-900">
                Sipariş Ver
              </h3>
              <OrderForm
                servicePackage={servicePackage}
                onSubmit={() => setShowOrderForm(false)}
                onCancel={() => setShowOrderForm(false)}
              />
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <Card className="p-6">
            <div className="mb-6 text-center">
              <div className="mb-2 text-3xl font-bold text-gray-900">
                {formatPrice(servicePackage.price)}
              </div>
              <div className="text-sm text-gray-600">Başlangıç fiyatı</div>
            </div>

            {!showOrderForm ? (
              <Button
                size="lg"
                fullWidth
                onClick={() => setShowOrderForm(true)}
                className="mb-4"
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Hemen Sipariş Ver
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                fullWidth
                onClick={() => setShowOrderForm(false)}
                className="mb-4"
              >
                Formu Kapat
              </Button>
            )}

            <Button variant="outline" fullWidth className="mb-4">
              <MessageCircle className="mr-2 h-4 w-4" />
              Mesaj Gönder
            </Button>

            <div className="text-center text-xs text-gray-500">
              • Güvenli ödeme
              <br />
              • 7 gün para iade garantisi
              <br />• 24/7 müşteri desteği
            </div>
          </Card>

          {/* Freelancer Info */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Hizmet Sağlayıcı
            </h3>

            <div className="mb-4 flex items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-300">
                <span className="text-lg font-medium text-gray-600">
                  {servicePackage.freelancer.firstName[0]}
                </span>
              </div>
              <div className="ml-3">
                <div className="font-medium text-gray-900">
                  {servicePackage.freelancer.firstName}{' '}
                  {servicePackage.freelancer.lastName}
                </div>
                <div className="flex items-center">
                  <Star className="mr-1 h-4 w-4 fill-current text-yellow-400" />
                  <span className="text-sm text-gray-600">
                    {servicePackage.freelancer.rating.toFixed(1)} (
                    {servicePackage.freelancer.totalReviews} değerlendirme)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Üyelik:</span>
                <span className="text-gray-900">
                  {formatTimeAgo(servicePackage.freelancer.createdAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tamamlanan İş:</span>
                <span className="text-gray-900">
                  {servicePackage.freelancer.completedJobs}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Yanıt Süresi:</span>
                <span className="text-gray-900">
                  {servicePackage.freelancer.responseTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Konum:</span>
                <span className="text-gray-900">
                  {servicePackage.freelancer.location || 'Türkiye'}
                </span>
              </div>
            </div>

            <Link href={`/profile/${servicePackage.freelancer.id}`}>
              <Button variant="outline" fullWidth className="mt-4">
                <User className="mr-2 h-4 w-4" />
                Profili Görüntüle
              </Button>
            </Link>
          </Card>

          {/* Similar Services */}
          <Card className="p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Benzer Hizmetler
            </h3>
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="border-b border-gray-100 pb-3 last:border-b-0"
                >
                  <h4 className="mb-1 text-sm font-medium text-gray-900">
                    Profesyonel Logo Tasarımı
                  </h4>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>₺500 - ₺1.500</span>
                    <div className="flex items-center">
                      <Star className="mr-1 h-3 w-3 fill-current text-yellow-400" />
                      <span>4.9</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/marketplace?mode=services">
              <Button variant="outline" size="sm" fullWidth className="mt-4">
                Tüm Hizmetler
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
