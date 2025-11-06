'use client';

/**
 * Order Creation Modal
 * Modal for creating a new package order with tier selection
 *
 * Sprint 26: Enhanced with real API integration
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Clock, RefreshCw, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui';
import { orderApi } from '@/lib/api/orders';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { Package } from '@/types/business/features/package';

interface OrderModalProps {
  package: Package;
  initialTier?: 'BASIC' | 'STANDARD' | 'PREMIUM';
  isOpen: boolean;
  onClose: () => void;
}

export function OrderModal({
  package: pkg,
  initialTier = 'BASIC',
  isOpen,
  onClose,
}: OrderModalProps) {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<
    'BASIC' | 'STANDARD' | 'PREMIUM'
  >(initialTier);
  const [requirements, setRequirements] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      setLoading(true);

      // Create order via API
      const response = await orderApi.createPackageOrder({
        packageId: pkg.id,
        amount: currentTier.price,
        tier: selectedTier,
        requirements: requirements || undefined,
        deadline: new Date(
          Date.now() + currentTier.deliveryDays * 24 * 60 * 60 * 1000
        ).toISOString(),
      });

      // Navigate to checkout with order ID
      router.push(`/checkout/${response.data.id}`);
    } catch (err) {
      logger.error('Failed to create order:', err instanceof Error ? err : new Error(String(err)));
      const errorMessage =
        err instanceof Error ? err.message : 'Sipariş oluşturulamadı';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-1 hover:bg-gray-100"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Sipariş Oluştur</h2>
          <p className="mt-1 text-sm text-gray-600">{pkg.title}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tier Selection */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-900">
              Paket Seç
            </label>
            <div className="space-y-2">
              {/* Basic Tier */}
              <button
                type="button"
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
                  <div className="space-y-1 text-right text-sm text-gray-600">
                    <div className="flex items-center justify-end gap-1">
                      <Clock className="h-4 w-4" />
                      {pkg.basicTier.deliveryDays} gün
                    </div>
                    <div className="flex items-center justify-end gap-1">
                      <RefreshCw className="h-4 w-4" />
                      {pkg.basicTier.revisionCount === -1
                        ? 'Sınırsız'
                        : pkg.basicTier.revisionCount}{' '}
                      revizyon
                    </div>
                  </div>
                </div>
              </button>

              {/* Standard Tier */}
              {pkg.standardTier && (
                <button
                  type="button"
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
                    <div className="space-y-1 text-right text-sm text-gray-600">
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="h-4 w-4" />
                        {pkg.standardTier.deliveryDays} gün
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <RefreshCw className="h-4 w-4" />
                        {pkg.standardTier.revisionCount === -1
                          ? 'Sınırsız'
                          : pkg.standardTier.revisionCount}{' '}
                        revizyon
                      </div>
                    </div>
                  </div>
                </button>
              )}

              {/* Premium Tier */}
              {pkg.premiumTier && (
                <button
                  type="button"
                  onClick={() => setSelectedTier('PREMIUM')}
                  className={`w-full rounded-lg border-2 p-4 text-left transition ${
                    selectedTier === 'PREMIUM'
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">Premium</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatPrice(pkg.premiumTier.price)}
                      </div>
                    </div>
                    <div className="space-y-1 text-right text-sm text-gray-600">
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="h-4 w-4" />
                        {pkg.premiumTier.deliveryDays} gün
                      </div>
                      <div className="flex items-center justify-end gap-1">
                        <RefreshCw className="h-4 w-4" />
                        {pkg.premiumTier.revisionCount === -1
                          ? 'Sınırsız'
                          : pkg.premiumTier.revisionCount}{' '}
                        revizyon
                      </div>
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Selected Tier Features */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h3 className="mb-3 font-semibold text-gray-900">
              Paket İçeriği ({selectedTier})
            </h3>
            <ul className="space-y-2">
              {currentTier.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Requirements */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-900">
              Gereksinimler ve Detaylar
              <span className="ml-1 text-xs font-normal text-gray-500">
                (İsteğe bağlı)
              </span>
            </label>
            <textarea
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Projeniz hakkında detayları paylaşın..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Satıcının projenizi daha iyi anlaması için önemli detayları
              ekleyin.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-gray-200 pt-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(currentTier.price)}
              </div>
              <div className="text-sm text-gray-600">
                {currentTier.deliveryDays} gün teslimat
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'İşleniyor...' : 'Sipariş Ver'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
