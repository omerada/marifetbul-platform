'use client';

import React, { useState, useEffect } from 'react';
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
  MapPin,
} from 'lucide-react';
import { usePackageDetail } from '@/hooks';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Loading } from '@/components/ui';
import { OrderForm } from './OrderForm';
import { PackageReviewsTab } from './PackageReviewsTab';
import logger from '@/lib/infrastructure/monitoring/logger';

// Helper function to get image source as string
const getPackageImageSrc = (
  image:
    | string
    | { id: string; name: string; url: string; type: string }
    | undefined
): string => {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.url || '';
};

interface ServiceDetailProps {
  packageId: string;
  className?: string;
}

export function ServiceDetail({ packageId, className }: ServiceDetailProps) {
  const {
    currentPackage: servicePackage,
    isLoading: loading,
    error,
    selectedTier,
    selectedAddOns,
    setSelectedTier,
    toggleAddOn,
    canOrder,
    totalPrice,
    deliveryTime,
  } = usePackageDetail(packageId);

  const { user, isAuthenticated } = useAuthStore();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [canReview, setCanReview] = useState(false);

  // Check if user can review this package
  useEffect(() => {
    async function checkCanReview() {
      if (!isAuthenticated || !user) {
        setCanReview(false);
        return;
      }

      try {
        // Get user's completed orders for this package
        // We'll check if any completed order allows review
        // Production Ready: When order API supports filtering by packageId, use:
        // const orders = await orderApi.getOrders({ packageId: servicePackage.id, status: 'COMPLETED' });
        // setCanReview(orders.length > 0 && !isSeller);

        // For now, we'll allow review if user is authenticated and not the seller
        const isSeller = servicePackage?.freelancer?.id === user.id;
        setCanReview(isAuthenticated && !isSeller);
      } catch (error) {
        logger.debug('Error checking review eligibility', {
          component: 'ServiceDetail',
          error: error as Error,
        });
        setCanReview(false);
      }
    }

    checkCanReview();
  }, [packageId, isAuthenticated, user, servicePackage?.freelancer?.id]);

  if (loading) {
    return (
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        <Loading size="lg" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        <Loading />
      </div>
    );
  }

  if (error || !servicePackage) {
    return (
      <div className={`container mx-auto px-4 py-8 ${className}`}>
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Hizmet Bulunamad�
          </h1>
          <p className="mb-6 text-gray-600">
            Arad���n�z hizmet mevcut de�il veya kald�r�lm�� olabilir.
          </p>
          <Link href="/marketplace">
            <Button>�� & Hizmet&apos;e D�n</Button>
          </Link>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('tr-TR')}`;
  };

  const formatDeliveryTime = (days: number) => {
    if (days === 1) return '1 g�n';
    if (days < 7) return `${days} g�n`;
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
        logger.debug('Error sharing', {
          component: 'ServiceDetail',
          error: err as Error,
        });
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className={`container mx-auto px-4 py-4 sm:py-8 ${className}`}>
      <div className="grid grid-cols-1 gap-4 sm:gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="space-y-4 sm:space-y-6 lg:col-span-2">
          {/* Header */}
          <Card className="p-4 sm:p-6">
            <div className="mb-4 flex flex-col space-y-3 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
              <div className="min-w-0 flex-1">
                <h1 className="mb-2 text-xl font-bold break-words text-gray-900 sm:text-2xl">
                  {servicePackage.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 sm:gap-4">
                  <div className="flex items-center">
                    <User className="mr-1 h-4 w-4 flex-shrink-0" />
                    {servicePackage.freelancer ? (
                      <Link
                        href={`/profile/${servicePackage.freelancer.id}`}
                        className="truncate font-medium hover:text-blue-600"
                      >
                        {servicePackage.freelancer.firstName || 'N/A'}{' '}
                        {servicePackage.freelancer.lastName || ''}
                      </Link>
                    ) : (
                      <span className="truncate">Freelancer Bilgisi Yok</span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Star className="mr-1 h-4 w-4 flex-shrink-0 text-yellow-400" />
                    <span className="truncate">
                      {(servicePackage.rating || 0).toFixed(1)} (
                      {Array.isArray(servicePackage.reviews)
                        ? servicePackage.reviews.length
                        : servicePackage.reviews || 0}{' '}
                      de�erlendirme)
                    </span>
                  </div>
                  <div className="flex items-center">
                    <ShoppingCart className="mr-1 h-4 w-4 flex-shrink-0" />
                    {servicePackage.orders} sipari�
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex items-center space-x-2 sm:mt-0 sm:ml-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSaveToggle}
                  className={`${isSaved ? 'text-red-600' : ''} h-8 px-2 sm:h-10 sm:px-4`}
                >
                  <Heart
                    className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`}
                  />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="h-8 px-2 sm:h-10 sm:px-4"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 sm:h-10 sm:px-4"
                >
                  <Flag className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Package Images */}
            {servicePackage.images && servicePackage.images.length > 0 && (
              <div className="mb-4 sm:mb-6">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={
                      getPackageImageSrc(
                        servicePackage.images?.[currentImageIndex]
                      ) || '/placeholder.jpg'
                    }
                    alt={servicePackage.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      // Create a fallback SVG as data URL
                      const svg = `<svg width="800" height="450" xmlns="http://www.w3.org/2000/svg">
                        <rect width="100%" height="100%" fill="#f3f4f6"/>
                        <text x="50%" y="50%" font-family="system-ui, -apple-system, sans-serif" 
                              font-size="18" font-weight="500" fill="#6b7280" 
                              text-anchor="middle" dy="0.3em">
                          ${servicePackage.title.length > 30 ? servicePackage.title.substring(0, 30) + '...' : servicePackage.title}
                        </text>
                      </svg>`;
                      target.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
                    }}
                  />
                  {servicePackage.images.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 space-x-2 sm:bottom-4">
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

          {/* Tabs Section */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
              <TabsTrigger
                value="overview"
                className="rounded-none border-b-2 border-transparent px-4 pb-3 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
              >
                Genel Bilgiler
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent px-4 pb-3 data-[state=active]:border-blue-600 data-[state=active]:bg-transparent"
              >
                Değerlendirmeler
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              {/* Pricing Tiers */}
              {'pricing' in servicePackage && servicePackage.pricing && (
                <Card>
                  <CardHeader>
                    <CardTitle>Paket Se�enekleri</CardTitle>
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
                                variant={
                                  tier === 'premium' ? 'default' : 'outline'
                                }
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
                              {details.features?.map(
                                (feature: string, index: number) => (
                                  <li
                                    key={index}
                                    className="flex items-start text-sm"
                                  >
                                    <Check className="mt-0.5 mr-1 h-3 w-3 text-green-500" />
                                    {feature}
                                  </li>
                                )
                              )}
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
                                    {addOn.deliveryTime} g�n
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
              {'whatIncluded' in servicePackage &&
                servicePackage.whatIncluded && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Paket �eri�i</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {servicePackage.whatIncluded?.map((item, index) => (
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
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="mt-6">
              <PackageReviewsTab packageId={packageId} canReview={canReview} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Freelancer Card */}
          <Card className="p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <Avatar
                src={
                  servicePackage.freelancer?.avatar || '/avatars/default.jpg'
                }
                alt={`${servicePackage.freelancer?.firstName} ${servicePackage.freelancer?.lastName}`}
                className="h-10 w-10 flex-shrink-0 sm:h-12 sm:w-12"
              >
                <AvatarFallback>
                  {servicePackage.freelancer?.firstName?.charAt(0) || 'F'}
                  {servicePackage.freelancer?.lastName?.charAt(0) || ''}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold">
                  {servicePackage.freelancer?.firstName}{' '}
                  {servicePackage.freelancer?.lastName}
                </h3>
                {servicePackage.freelancer &&
                  'title' in servicePackage.freelancer && (
                    <p className="truncate text-sm text-gray-600">
                      {servicePackage.freelancer.title}
                    </p>
                  )}
                {servicePackage.freelancer &&
                  'location' in servicePackage.freelancer && (
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="mr-1 h-3 w-3 flex-shrink-0" />
                      <span className="truncate">
                        {String(servicePackage.freelancer.location)}
                      </span>
                    </div>
                  )}
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3 text-center sm:mt-4 sm:gap-4">
              <div>
                <div className="text-base font-semibold sm:text-lg">
                  {servicePackage.freelancer?.rating || 0}
                </div>
                <div className="text-xs text-gray-600 sm:text-sm">Puan</div>
              </div>
              <div>
                <div className="text-base font-semibold sm:text-lg">
                  {servicePackage.freelancer &&
                  'reviewCount' in servicePackage.freelancer
                    ? servicePackage.freelancer.reviewCount
                    : 0}
                </div>
                <div className="text-xs text-gray-600 sm:text-sm">
                  De�erlendirme
                </div>
              </div>
            </div>

            <div className="mt-3 space-y-2 sm:mt-4">
              <Link href={`/profile/${servicePackage.freelancer?.id || ''}`}>
                <Button
                  className="w-full text-sm sm:text-base"
                  variant="outline"
                >
                  Profili G�r�nt�le
                </Button>
              </Link>
              <Button className="w-full" variant="outline">
                <MessageCircle className="mr-2 h-4 w-4" />
                Mesaj G�nder
              </Button>
            </div>
          </Card>

          {/* Order Summary */}
          <Card className="p-4 sm:p-6">
            <h3 className="mb-3 text-base font-semibold sm:mb-4 sm:text-lg">
              Sipari� �zeti
            </h3>

            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>Se�ili Paket:</span>
                <span className="ml-2 text-right font-medium">
                  {'pricing' in servicePackage &&
                  servicePackage.pricing &&
                  servicePackage.pricing[selectedTier]
                    ? servicePackage.pricing[selectedTier].title
                    : 'Temel Paket'}
                </span>
              </div>

              <div className="flex justify-between text-xs sm:text-sm">
                <span>Teslimat:</span>
                <span className="ml-2 text-right font-medium">
                  {formatDeliveryTime(deliveryTime)}
                </span>
              </div>

              <div className="flex justify-between text-xs sm:text-sm">
                <span>Revizyon:</span>
                <span className="ml-2 text-right font-medium">
                  {'pricing' in servicePackage &&
                  servicePackage.pricing &&
                  servicePackage.pricing[selectedTier]
                    ? `${servicePackage.pricing[selectedTier].revisions} kez`
                    : `${servicePackage.revisions} kez`}
                </span>
              </div>

              {selectedAddOns.length > 0 && (
                <div className="border-t pt-2 sm:pt-3">
                  <div className="text-xs font-medium sm:text-sm">
                    Ek Hizmetler:
                  </div>
                  {'addOns' in servicePackage &&
                    servicePackage.addOns &&
                    servicePackage.addOns
                      .filter((addOn) => selectedAddOns.includes(addOn.id))
                      .map((addOn) => (
                        <div
                          key={addOn.id}
                          className="flex justify-between text-sm"
                        >
                          <span>� {addOn.title}</span>
                          <span>+{formatPrice(addOn.price)}</span>
                        </div>
                      ))}
                </div>
              )}

              <div className="border-t pt-2 sm:pt-3">
                <div className="flex justify-between text-sm font-semibold sm:text-base">
                  <span>Toplam:</span>
                  <span className="text-base text-green-600 sm:text-lg">
                    ?{formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-2 sm:mt-6">
              {canOrder ? (
                <Button
                  className="w-full py-2 text-sm sm:py-3 sm:text-base"
                  onClick={() => setShowOrderForm(true)}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Sipari� Ver
                </Button>
              ) : (
                <Button
                  className="w-full py-2 text-sm sm:py-3 sm:text-base"
                  disabled
                >
                  Sipari� Verilemez
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && 'overview' in servicePackage && (
        <OrderForm
          servicePackage={servicePackage}
          onSubmit={(data) => {
            logger.debug('Order submitted:', data);
            setShowOrderForm(false);
          }}
          onCancel={() => setShowOrderForm(false)}
        />
      )}
    </div>
  );
}
