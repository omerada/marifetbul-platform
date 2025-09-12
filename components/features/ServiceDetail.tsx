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
  MapPin,
} from 'lucide-react';
import { usePackageDetail } from '@/hooks/usePackageDetail';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/Avatar';
import { Loading } from '@/components/ui';
import { OrderForm } from './OrderForm';

interface ServiceDetailProps {
  packageId: string;
  className?: string;
}

export function ServiceDetail({ packageId, className }: ServiceDetailProps) {
  const {
    currentPackage: servicePackage,
    isLoading,
    error,
    totalPrice,
    deliveryTime,
    selectedTier,
    selectedAddOns,
    setSelectedTier,
    toggleAddOn,
    clearError,
    canOrder,
  } = usePackageDetail(packageId);

  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (isLoading) {
    return (
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        <Loading size="lg" />
      </div>
    );
  }

  if (error || !servicePackage) {
    return (
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Hizmet Bulunamadı
          </h1>
          <p className="mb-6 text-gray-600">
            Aradığınız hizmet mevcut değil veya kaldırılmış olabilir.
          </p>
          <Button asChild>
            <Link href="/marketplace">Keşfet'e Dön</Link>
          </Button>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('tr-TR')}`;
  };

  const formatDeliveryTime = (days: number) => {
    if (days === 1) return '1 gün';
    if (days < 7) return `${days} gün`;
    const weeks = Math.floor(days / 7);
    const remainingDays = days % 7;
    if (remainingDays === 0) return `${weeks} hafta`;
    return `${weeks}h ${remainingDays}g`;
  };

  const handleSaveToggle = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: servicePackage.title,
          text: servicePackage.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
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
                    <User className="mr-1 h-4 w-4" />
                    <Link
                      href={`/profile/${servicePackage.freelancer.id}`}
                      className="font-medium hover:text-blue-600"
                    >
                      {servicePackage.freelancer.firstName}{' '}
                      {servicePackage.freelancer.lastName}
                    </Link>
                  </div>
                  <div className="flex items-center">
                    <Star className="mr-1 h-4 w-4 text-yellow-400" />
                    {servicePackage.rating.toFixed(1)} ({servicePackage.reviews}{' '}
                    değerlendirme)
                  </div>
                  <div className="flex items-center">
                    <ShoppingCart className="mr-1 h-4 w-4" />
                    {servicePackage.orders} sipariş
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveToggle}
                  className={isSaved ? 'text-red-600' : ''}
                >
                  <Heart
                    className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`}
                  />
                </Button>
                <Button variant="outline" size="sm" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Package Images */}
            {servicePackage.images && servicePackage.images.length > 0 && (
              <div className="mb-6">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={servicePackage.images[currentImageIndex]}
                    alt={servicePackage.title}
                    fill
                    className="object-cover"
                  />
                  {servicePackage.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 space-x-2">
                      {servicePackage.images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`h-2 w-2 rounded-full ${
                            index === currentImageIndex
                              ? 'bg-white'
                              : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="prose max-w-none">
              <p className="text-gray-700">{servicePackage.description}</p>
            </div>
          </Card>

          {/* Pricing Tiers */}
          {'pricing' in servicePackage && servicePackage.pricing && (
            <Card>
              <CardHeader>
                <CardTitle>Paket Seçenekleri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {Object.entries(servicePackage.pricing).map(
                    ([tier, details]) => (
                      <div
                        key={tier}
                        className={`cursor-pointer rounded-lg border-2 p-4 transition-colors ${
                          selectedTier === tier
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() =>
                          setSelectedTier(
                            tier as 'basic' | 'standard' | 'premium'
                          )
                        }
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="font-semibold">{details.title}</h3>
                          <Badge
                            variant={tier === 'premium' ? 'default' : 'outline'}
                          >
                            {formatPrice(details.price)}
                          </Badge>
                        </div>
                        <p className="mb-3 text-sm text-gray-600">
                          {details.description}
                        </p>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {formatDeliveryTime(details.deliveryTime)}
                          </div>
                          <div className="flex items-center">
                            <RefreshCw className="mr-1 h-3 w-3" />
                            {details.revisions} revizyon
                          </div>
                        </div>
                        <ul className="mt-3 space-y-1">
                          {details.features.map((feature, index) => (
                            <li
                              key={index}
                              className="flex items-start text-sm"
                            >
                              <Check className="mt-0.5 mr-1 h-3 w-3 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add-ons */}
          {'addOns' in servicePackage &&
            servicePackage.addOns &&
            servicePackage.addOns.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ek Hizmetler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {servicePackage.addOns.map((addOn) => (
                      <div
                        key={addOn.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedAddOns.includes(addOn.id)}
                            onChange={() => toggleAddOn(addOn.id)}
                            className="h-4 w-4 rounded border-gray-300"
                          />
                          <div>
                            <h4 className="font-medium">{addOn.title}</h4>
                            {addOn.deliveryTime !== 0 && (
                              <p className="text-sm text-gray-600">
                                {addOn.deliveryTime > 0 ? '+' : ''}
                                {addOn.deliveryTime} gün
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-semibold">
                          +{formatPrice(addOn.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* What's Included */}
          {'whatIncluded' in servicePackage && servicePackage.whatIncluded && (
            <Card>
              <CardHeader>
                <CardTitle>Paket çeriği</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {servicePackage.whatIncluded.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="mt-0.5 mr-2 h-4 w-4 text-green-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* FAQ */}
          {'faq' in servicePackage &&
            servicePackage.faq &&
            servicePackage.faq.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Sıkça Sorulan Sorular</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {servicePackage.faq.map((item, index) => (
                      <div key={index}>
                        <h4 className="font-medium text-gray-900">
                          {item.question}
                        </h4>
                        <p className="mt-1 text-gray-600">{item.answer}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Freelancer Card */}
          <Card className="p-6">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage
                  src={servicePackage.freelancer.avatar}
                  alt={`${servicePackage.freelancer.firstName} ${servicePackage.freelancer.lastName}`}
                />
                <AvatarFallback>
                  {servicePackage.freelancer.firstName.charAt(0)}
                  {servicePackage.freelancer.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {servicePackage.freelancer.firstName}{' '}
                  {servicePackage.freelancer.lastName}
                </h3>
                {'title' in servicePackage.freelancer && (
                  <p className="text-sm text-gray-600">
                    {servicePackage.freelancer.title}
                  </p>
                )}
                {'location' in servicePackage.freelancer && (
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="mr-1 h-3 w-3" />
                    {servicePackage.freelancer.location}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold">
                  {servicePackage.freelancer.rating}
                </div>
                <div className="text-sm text-gray-600">Puan</div>
              </div>
              <div>
                <div className="text-lg font-semibold">
                  {servicePackage.freelancer.totalReviews}
                </div>
                <div className="text-sm text-gray-600">Değerlendirme</div>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Button asChild className="w-full" variant="outline">
                <Link href={`/profile/${servicePackage.freelancer.id}`}>
                  Profili Görüntüle
                </Link>
              </Button>
              <Button className="w-full" variant="outline">
                <MessageCircle className="mr-2 h-4 w-4" />
                Mesaj Gönder
              </Button>
            </div>
          </Card>

          {/* Order Summary */}
          <Card className="p-6">
            <h3 className="mb-4 font-semibold">Sipariş Özeti</h3>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Seçili Paket:</span>
                <span className="font-medium">
                  {'pricing' in servicePackage && servicePackage.pricing
                    ? servicePackage.pricing[selectedTier].title
                    : 'Temel Paket'}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Teslimat:</span>
                <span className="font-medium">
                  {formatDeliveryTime(deliveryTime)}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span>Revizyon:</span>
                <span className="font-medium">
                  {'pricing' in servicePackage && servicePackage.pricing
                    ? `${servicePackage.pricing[selectedTier].revisions} kez`
                    : `${servicePackage.revisions} kez`}
                </span>
              </div>

              {selectedAddOns.length > 0 && (
                <div className="border-t pt-3">
                  <div className="text-sm font-medium">Ek Hizmetler:</div>
                  {'addOns' in servicePackage &&
                    servicePackage.addOns &&
                    servicePackage.addOns
                      .filter((addOn) => selectedAddOns.includes(addOn.id))
                      .map((addOn) => (
                        <div
                          key={addOn.id}
                          className="flex justify-between text-sm"
                        >
                          <span>• {addOn.title}</span>
                          <span>+{formatPrice(addOn.price)}</span>
                        </div>
                      ))}
                </div>
              )}

              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Toplam:</span>
                  <span className="text-lg text-green-600">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              {canOrder ? (
                <Button
                  className="w-full"
                  onClick={() => setShowOrderForm(true)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Sipariş Ver
                </Button>
              ) : (
                <Button className="w-full" disabled>
                  Sipariş Verilemez
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <OrderForm
          servicePackage={servicePackage}
          onClose={() => setShowOrderForm(false)}
        />
      )}
    </div>
  );
}
