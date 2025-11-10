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
import IyzicoProvider from '@/components/shared/IyzicoProvider';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { RequirementsForm } from '@/components/checkout/RequirementsForm';
import { IyzicoCheckoutForm } from '@/components/checkout/IyzicoCheckoutForm';
import {
  PaymentModeSelector,
  IBANDisplayCard,
  PaymentProofUploadModal,
} from '@/components/domains/payments';
import type { PaymentMode } from '@/types/business/features/order';
import { apiClient } from '@/lib/infrastructure/api/client';
import { PACKAGE_ENDPOINTS, ORDER_ENDPOINTS } from '@/lib/api/endpoints';
import type { CheckoutSession } from '@/types/business/features/payments';

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

// Order response type
interface OrderResponse {
  id: string;
  status: string;
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const packageId = params.packageId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('ESCROW_PROTECTED');
  const [checkoutSession, setCheckoutSession] =
    useState<CheckoutSession | null>(null);
  const [showProofUploadModal, setShowProofUploadModal] = useState(false);

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
  const handleCreateOrder = async (requirements: string, notes?: string) => {
    if (!packageData) return;

    try {
      setIsLoading(true);
      setError(null);

      // Create order with payment mode
      const orderResponse = await apiClient.post<OrderResponse>(
        ORDER_ENDPOINTS.CREATE,
        {
          packageId: packageData.id,
          requirements,
          notes,
          paymentMode, // Include selected payment mode
        }
      );

      // Calculate delivery date
      const deliveryDate = new Date();
      deliveryDate.setDate(
        deliveryDate.getDate() + (packageData.deliveryTime || 7)
      );

      // Set checkout session
      setCheckoutSession({
        orderId: orderResponse.id,
        packageId: packageData.id,
        amount: packageData.price,
        currency: 'TRY',
        deliveryDate: deliveryDate.toISOString(),
        requirements,
        notes,
        paymentMode, // Pass payment mode to session
      });
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
                checkoutSession={checkoutSession}
              />
            </div>

            {/* Right Column - Payment Mode Selection, Requirements & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Payment Mode Selection (only before checkout session) */}
              {!checkoutSession && (
                <div className="rounded-lg bg-white p-6 shadow-sm">
                  <h2 className="mb-4 text-xl font-semibold text-gray-900">
                    Ödeme Yöntemi Seçin
                  </h2>
                  <PaymentModeSelector
                    selectedMode={paymentMode}
                    onModeChange={setPaymentMode}
                  />
                </div>
              )}

              {/* Step 2: Requirements Form or Payment Processing */}
              {!checkoutSession ? (
                <RequirementsForm
                  packageData={packageData}
                  onSubmit={handleCreateOrder}
                  isLoading={isLoading}
                />
              ) : paymentMode === 'ESCROW_PROTECTED' ? (
                <IyzicoProvider>
                  <IyzicoCheckoutForm checkoutSession={checkoutSession} />
                </IyzicoProvider>
              ) : (
                // Manual IBAN Payment Flow
                <div className="space-y-6">
                  {/* IBAN Display Card */}
                  <IBANDisplayCard
                    orderId={checkoutSession.orderId}
                    amount={packageData.price}
                    currency="TRY"
                    onCopy={() => {
                      // Optional: Track copy events
                      console.log('IBAN information copied');
                    }}
                  />

                  {/* Upload Payment Proof Button */}
                  <div className="rounded-lg bg-white p-6 shadow-sm">
                    <h3 className="mb-4 text-lg font-semibold text-gray-900">
                      Ödeme Kanıtı
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                      Havale/EFT işleminizi yaptıktan sonra dekontunuzu
                      yükleyerek ödeme onayını hızlandırabilirsiniz.
                    </p>
                    <button
                      onClick={() => setShowProofUploadModal(true)}
                      className="w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Ödeme Kanıtı Yükle
                    </button>
                  </div>

                  {/* Payment Proof Upload Modal */}
                  <PaymentProofUploadModal
                    orderId={checkoutSession.orderId}
                    amount={packageData.price}
                    currency="TRY"
                    isOpen={showProofUploadModal}
                    onClose={() => setShowProofUploadModal(false)}
                    onUploadSuccess={(fileUrl) => {
                      console.log('Payment proof uploaded:', fileUrl);
                      // TODO: Update order status or show success message
                      setShowProofUploadModal(false);
                      // Optionally redirect to order tracking page
                      // router.push(`/dashboard/orders/${checkoutSession.orderId}`);
                    }}
                    onUploadError={(error) => {
                      console.error('Upload error:', error);
                      // Error is already shown in modal
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
