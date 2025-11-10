'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  MapPin,
  User,
  Star,
  Calendar,
  Users,
  Heart,
  Share2,
  Flag,
  CheckCircle,
  MessageCircle,
  Clock,
  Award,
  Shield,
} from 'lucide-react';
import { usePackageDetail } from '@/hooks';
import type { ServicePackage, PackageDetail, Freelancer } from '@/types';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { SimpleErrorDisplay, Loading } from '@/components/ui';
import logger from '@/lib/infrastructure/monitoring/logger';

interface PackageDetailProps {
  packageId: string;
  className?: string;
}

export function PackageDetail({ packageId, className }: PackageDetailProps) {
  const {
    currentPackage,
    selectedTier,
    selectedAddOns,
    totalPrice,
    isLoading,
    error,
    canOrder,
    setSelectedTier,
    toggleAddOn,
    createOrder,
    refreshPackageDetail,
    isOrdering,
  } = usePackageDetail(packageId);

  const [isSaved, setIsSaved] = useState(false);

  if (isLoading) {
    return <Loading variant="skeleton" text="Paket detayları yükleniyor..." />;
  }

  if (error || !currentPackage) {
    return (
      <SimpleErrorDisplay
        error={error || 'Paket bulunamadı'}
        onRetry={refreshPackageDetail}
      />
    );
  }

  // Type guard to check if the package has pricing (PackageDetail)
  const isPackageDetail = (
    pkg: ServicePackage | PackageDetail
  ): pkg is PackageDetail => {
    return 'pricing' in pkg;
  };

  if (!isPackageDetail(currentPackage)) {
    return (
      <SimpleErrorDisplay
        message="Bu paket için detay görünümü mevcut değil"
        onRetry={refreshPackageDetail}
      />
    );
  }

  const currentTierData = currentPackage.pricing?.[selectedTier];

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'border-gray-300 bg-white';
      case 'standard':
        return 'border-blue-500 bg-blue-50 ring-2 ring-blue-500';
      case 'premium':
        return 'border-purple-500 bg-purple-50 ring-2 ring-purple-500';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'secondary';
      case 'standard':
        return 'default';
      case 'premium':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getTierName = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'Temel';
      case 'standard':
        return 'Standart';
      case 'premium':
        return 'Premium';
      default:
        return tier;
    }
  };

  const handleOrder = async () => {
    if (!canOrder) return;

    try {
      await createOrder({
        packageId,
        tier: selectedTier,
        addOns: selectedAddOns,
      });
      // Navigate to order confirmation or payment
    } catch (error) {
      logger.error('Order creation error:', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const selectedAddOnDetails =
    currentPackage.addOns?.filter((addon) =>
      selectedAddOns.includes(addon.id)
    ) || [];

  return (
    <div className={`mx-auto max-w-6xl space-y-8 p-6 ${className}`}>
      {/* Header Section */}
      <div className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {currentPackage.title}
              </h1>
              <Badge variant="secondary">{currentPackage.category}</Badge>
            </div>

            <div className="mb-4 flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <Calendar className="mr-1 h-4 w-4" />
                {formatDistanceToNow(new Date(currentPackage.createdAt), {
                  addSuffix: true,
                  locale: tr,
                })}
              </span>
              <span className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                {(currentPackage.freelancer as Freelancer)?.location ||
                  'Belirtilmemiş'}
              </span>
              <span className="flex items-center">
                <Users className="mr-1 h-4 w-4" />
                {currentPackage.orders} sipariş
              </span>
            </div>

            {/* Features */}
            <div className="mb-4 flex flex-wrap gap-2">
              {currentPackage.features?.map((feature, index) => (
                <Badge key={index} variant="outline">
                  {feature}
                </Badge>
              )) || null}
            </div>
          </div>

          <div className="text-right">
            <div className="mb-1 text-2xl font-bold text-green-600">
              ₺{currentTierData?.price?.toLocaleString('tr-TR') || '0'}
              {selectedAddOnDetails.length > 0 && (
                <span className="text-lg">
                  +{' '}
                  {selectedAddOnDetails
                    .reduce((sum, addon) => sum + addon.price, 0)
                    .toLocaleString('tr-TR')}
                </span>
              )}
            </div>
            <div className="mb-2 text-sm text-gray-600">
              {getTierName(selectedTier)} Paket
            </div>
            <div className="text-sm font-medium text-gray-700">
              {currentTierData?.deliveryTime || 0} gün
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsSaved(!isSaved)}
          >
            <Heart
              className={`mr-2 h-4 w-4 ${isSaved ? 'fill-current text-red-500' : ''}`}
            />
            {isSaved ? 'Favorilerde' : 'Favorilere Ekle'}
          </Button>

          <Button variant="outline" size="lg">
            <Share2 className="mr-2 h-4 w-4" />
            Paylaş
          </Button>

          <Button variant="outline" size="lg">
            <Flag className="mr-2 h-4 w-4" />
            Şikayet Et
          </Button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column - Package Details */}
        <div className="space-y-6 lg:col-span-2">
          {/* Package Tiers */}
          <Card>
            <CardHeader>
              <CardTitle>Paket Seçenekleri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {(['basic', 'standard', 'premium'] as const).map((tierKey) => {
                  const tier = currentPackage.pricing?.[tierKey];
                  if (!tier) return null;
                  return (
                    <div
                      key={tierKey}
                      className={`cursor-pointer rounded-lg border p-4 transition-all ${
                        selectedTier === tierKey
                          ? getTierColor(tierKey)
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedTier(tierKey)}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">{tier.title}</h3>
                        <Badge variant={getTierBadgeColor(tierKey)}>
                          {getTierName(tierKey)}
                        </Badge>
                      </div>

                      <div className="mb-2 text-2xl font-bold text-green-600">
                        ₺{tier.price.toLocaleString('tr-TR')}
                      </div>

                      <div className="mb-4 text-sm text-gray-600">
                        <Clock className="mr-1 inline h-4 w-4" />
                        {tier.deliveryTime} gün
                      </div>

                      <div className="mb-4 text-sm text-gray-700">
                        {tier.description}
                      </div>

                      <ul className="space-y-2">
                        {tier.features?.map((feature, index) => (
                          <li key={index} className="flex items-start text-sm">
                            <CheckCircle className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0 text-green-500" />
                            <span>{feature}</span>
                          </li>
                        )) || null}
                      </ul>

                      <div className="mt-3 border-t pt-3 text-sm text-gray-600">
                        <Award className="mr-1 inline h-4 w-4" />
                        {tier.revisions === -1
                          ? 'Sınırsız revizyon'
                          : `${tier.revisions} revizyon`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Add-ons */}
          {currentPackage.addOns && currentPackage.addOns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Ek Hizmetler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentPackage.addOns.map((addon) => (
                    <div
                      key={addon.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedAddOns.includes(addon.id)}
                            onChange={() => toggleAddOn(addon.id)}
                            className="mr-3"
                          />
                          <div>
                            <h4 className="font-medium">{addon.title}</h4>
                            <p className="text-sm text-gray-600">
                              Ek hizmet açıklaması
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="ml-4 text-right">
                        <div className="font-semibold text-green-600">
                          +₺{addon.price.toLocaleString('tr-TR')}
                        </div>
                        <div className="text-sm text-gray-500">
                          +{addon.deliveryTime} gün
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs for Description, FAQ, Reviews */}
          <Card>
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Açıklama</TabsTrigger>
                <TabsTrigger value="faq">S.S.S.</TabsTrigger>
                <TabsTrigger value="reviews">Değerlendirmeler</TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="p-6">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700">
                    {currentPackage.description}
                  </div>

                  {currentPackage.overview && (
                    <div className="mt-6">
                      <h3 className="mb-3 text-lg font-semibold">
                        Genel Bakış
                      </h3>
                      <div className="whitespace-pre-wrap text-gray-700">
                        {currentPackage.overview}
                      </div>
                    </div>
                  )}

                  {currentPackage.whatIncluded &&
                    currentPackage.whatIncluded.length > 0 && (
                      <div className="mt-6">
                        <h3 className="mb-3 text-lg font-semibold">
                          Neler Dahil
                        </h3>
                        <ul className="space-y-2">
                          {currentPackage.whatIncluded?.map((item, index) => (
                            <li key={index} className="flex items-start">
                              <CheckCircle className="mt-0.5 mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
                              <span>
                                {typeof item === 'string'
                                  ? item
                                  : (item as { name?: string })?.name || 'Item'}
                              </span>
                            </li>
                          )) || null}
                        </ul>
                      </div>
                    )}
                </div>
              </TabsContent>

              <TabsContent value="faq" className="p-6">
                <div className="space-y-4">
                  {currentPackage.faq?.map((item, index) => (
                    <div key={index}>
                      <h4 className="mb-2 font-medium text-gray-900">
                        {item.question}
                      </h4>
                      <p className="text-gray-700">{item.answer}</p>
                    </div>
                  )) || <p className="text-gray-500">Henüz SSS eklenmemiş.</p>}
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="p-6">
                <div className="text-center text-gray-600">
                  Değerlendirmeler yükleniyor...
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Column - Provider Info & Order */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Sipariş Özeti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>{currentTierData?.title || 'Paket'}</span>
                  <span>
                    ₺{currentTierData?.price?.toLocaleString('tr-TR') || '0'}
                  </span>
                </div>

                {selectedAddOnDetails.map((addon) => (
                  <div key={addon.id} className="flex justify-between text-sm">
                    <span>{addon.title}</span>
                    <span>₺{addon.price.toLocaleString('tr-TR')}</span>
                  </div>
                ))}

                <div className="flex justify-between border-t pt-3 text-lg font-semibold">
                  <span>Toplam</span>
                  <span className="text-green-600">
                    ₺{totalPrice.toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>

              <Button
                className="mt-4 w-full"
                size="lg"
                disabled={!canOrder || isOrdering}
                onClick={handleOrder}
              >
                {isOrdering ? 'Sipariş Veriliyor...' : 'Sipariş Ver'}
              </Button>

              <div className="mt-3 text-center">
                <Button variant="outline" className="w-full">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Soru Sor
                </Button>
              </div>

              <div className="mt-4 text-center text-xs text-gray-500">
                <Shield className="mr-1 inline h-4 w-4" />
                Güvenli ödeme sistemi
              </div>
            </CardContent>
          </Card>

          {/* Provider Card */}
          <Card>
            <CardHeader>
              <CardTitle>Hizmet Sağlayıcı</CardTitle>
            </CardHeader>
            <CardContent>
              {currentPackage.freelancer ? (
                <>
                  <div className="mb-4 flex items-center">
                    <Avatar
                      src={currentPackage.freelancer.avatar}
                      alt={`${currentPackage.freelancer.firstName} ${currentPackage.freelancer.lastName}`}
                      className="mr-4 h-12 w-12"
                    >
                      <AvatarFallback>
                        {currentPackage.freelancer.firstName?.charAt(0) || 'F'}
                        {currentPackage.freelancer.lastName?.charAt(0) || ''}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {currentPackage.freelancer.firstName}{' '}
                        {currentPackage.freelancer.lastName}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600">
                        <Star className="mr-1 h-4 w-4 text-yellow-400" />
                        <span>{currentPackage.freelancer.rating}</span>
                        <span className="mx-1">•</span>
                        <span>
                          {currentPackage.freelancer.reviewCount} değerlendirme
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-gray-500">Sağlayıcı bilgisi mevcut değil</p>
              )}

              <div className="mb-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Toplam Proje:</span>
                  <span>
                    {(currentPackage.freelancer as Freelancer)?.completedJobs ||
                      0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Başarı Oranı:</span>
                  <span>95%</span>
                </div>
                <div className="flex justify-between">
                  <span>Yanıt Süresi:</span>
                  <span>~2 saat</span>
                </div>
                <div className="flex justify-between">
                  <span>Konum:</span>
                  <span>
                    {(currentPackage.freelancer as Freelancer)?.location ||
                      'Belirtilmemiş'}
                  </span>
                </div>
              </div>

              {currentPackage.freelancer && (
                <Link href={`/profile/${currentPackage.freelancer.id}`}>
                  <Button className="w-full" variant="outline">
                    <User className="mr-2 h-4 w-4" />
                    Profili Görüntüle
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Similar Packages */}
          <Card>
            <CardHeader>
              <CardTitle>Benzer Paketler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  Benzer paketler yükleniyor...
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
