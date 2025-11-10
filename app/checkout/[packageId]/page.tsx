/**
 * ================================================
 * CHECKOUT PAGE
 * ================================================
 * Main checkout page for package purchase
 *
 * Features:
 * - Package details & pricing
 * - Order summary
 * - Payment mode selection (Escrow vs IBAN)
 * - Requirements form
 * - Payment processing
 *
 * Route: /checkout/[packageId]
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 1: Dual Payment System
 */

'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { RequirementsForm } from '@/components/checkout/RequirementsForm';
import { UnifiedCheckout } from '@/components/checkout/UnifiedCheckout';
import { apiClient } from '@/lib/infrastructure/api/client';
import { PACKAGE_ENDPOINTS, ORDER_ENDPOINTS } from '@/lib/api/endpoints';
import type { OrderResponse } from '@/types/backend-aligned';
import type { CreateOrderMilestoneRequest } from '@/types/business/features/milestone';

// Simple Package type for checkout
interface Package {
  id: string;
  title: string;
  price: number;
  deliveryTime: number;
  description?: string;
  images?: string[];
  requirements?: string[];
  seller?: {
    id: string;
    name: string;
    avatar?: string;
    rating?: number;
  };
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.packageId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [orderResponse, setOrderResponse] = useState<OrderResponse | null>(
    null
  );

  // Load package data
  useEffect(() => {
    const loadPackage = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get<Package>(
          PACKAGE_ENDPOINTS.GET_BY_ID(packageId)
        );
        setPackageData(response);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Paket bilgileri yüklenemedi';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (packageId) {
      loadPackage();
    }
  }, [packageId]);

  // Handle order creation
  const handleCreateOrder = async (
    requirements: string,
    notes?: string,
    milestones?: CreateOrderMilestoneRequest[]
  ) => {
    if (!packageData) return;

    try {
      setIsLoading(true);
      setError(null);

      // Create order
      const response = await apiClient.post<OrderResponse>(
        ORDER_ENDPOINTS.CREATE,
        {
          packageId: packageData.id,
          requirements,
          notes,
          milestones, // Sprint 1.1: Include milestones if provided
        }
      );

      setOrderResponse(response);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Sipariş oluşturulamadı';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Error state
  if (error || !packageData) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl text-center">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="mb-2 text-2xl font-bold text-red-800">
              Hata Oluştu
            </h2>
            <p className="mb-4 text-red-600">{error || 'Paket bulunamadı'}</p>
            <button
              onClick={() => router.back()}
              className="rounded-lg bg-red-600 px-6 py-2 text-white transition-colors hover:bg-red-700"
            >
              Geri Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="mb-4 flex items-center text-gray-600 hover:text-gray-900"
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Geri Dön
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Ödeme Sayfası</h1>
            <p className="mt-2 text-gray-600">
              Sipariş bilgilerinizi girin ve ödemeyi tamamlayın
            </p>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Left Column - Order Summary */}
            <div className="lg:col-span-1">
              <OrderSummary
                packageData={packageData}
                checkoutSession={
                  orderResponse
                    ? {
                        orderId: orderResponse.id,
                        packageId: packageData.id,
                        amount: packageData.price,
                        currency: 'TRY',
                        deliveryDate: new Date(
                          Date.now() +
                            (packageData.deliveryTime || 7) *
                              24 *
                              60 *
                              60 *
                              1000
                        ).toISOString(),
                      }
                    : null
                }
              />
            </div>

            {/* Right Column - Requirements & Payment */}
            <div className="lg:col-span-2">
              {!orderResponse ? (
                <RequirementsForm
                  packageData={packageData}
                  onSubmit={handleCreateOrder}
                  isLoading={isLoading}
                />
              ) : (
                <UnifiedCheckout
                  isOpen={true}
                  onClose={() => router.push('/dashboard/orders')}
                  order={orderResponse}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
