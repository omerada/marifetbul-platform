/**
 * ================================================
 * ORDER SUMMARY COMPONENT
 * ================================================
 * Display order details and price breakdown
 *
 * Features:
 * - Package information
 * - Price breakdown
 * - Delivery estimate
 * - Seller information
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import { formatCurrency } from '@/lib/shared/formatters';
import Image from 'next/image';
import type { CheckoutSession } from '@/types/business/features/payments';

interface Package {
  id: string;
  title: string;
  price: number;
  deliveryTime: number;
  description?: string;
  images?: string[];
  seller?: {
    id: string;
    name: string;
    avatar?: string;
    rating?: number;
  };
}

interface OrderSummaryProps {
  packageData: Package;
  checkoutSession: CheckoutSession | null;
}

export function OrderSummary({
  packageData,
  checkoutSession,
}: OrderSummaryProps) {
  // Calculate fees
  const platformFeeRate = 0.15; // %15 platform fee
  const platformFee = packageData.price * platformFeeRate;
  const total = packageData.price + platformFee;

  // Calculate delivery date
  const deliveryDate = new Date();
  deliveryDate.setDate(
    deliveryDate.getDate() + (packageData.deliveryTime || 7)
  );

  return (
    <div className="sticky top-4 rounded-lg bg-white p-6 shadow-md">
      {/* Package Image */}
      {packageData.images && packageData.images[0] && (
        <div className="relative mb-4 h-48 w-full overflow-hidden rounded-lg">
          <Image
            src={packageData.images[0]}
            alt={packageData.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Package Title */}
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        {packageData.title}
      </h2>

      {/* Seller Info */}
      {packageData.seller && (
        <div className="mb-4 flex items-center border-b border-gray-200 pb-4">
          {packageData.seller.avatar && (
            <div className="relative mr-3 h-10 w-10 overflow-hidden rounded-full">
              <Image
                src={packageData.seller.avatar}
                alt={packageData.seller.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {packageData.seller.name}
            </p>
            {packageData.seller.rating && (
              <div className="flex items-center text-sm text-gray-600">
                <svg
                  className="mr-1 h-4 w-4 text-yellow-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {packageData.seller.rating.toFixed(1)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delivery Time */}
      <div className="mb-4 border-b border-gray-200 pb-4">
        <div className="mb-2 flex justify-between text-sm">
          <span className="text-gray-600">Teslimat Süresi</span>
          <span className="font-medium text-gray-900">
            {packageData.deliveryTime} gün
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tahmini Teslimat</span>
          <span className="font-medium text-gray-900">
            {deliveryDate.toLocaleDateString('tr-TR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Price Breakdown */}
      <div className="mb-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          Fiyat Detayı
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Paket Fiyatı</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(packageData.price, 'TRY')}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Hizmet Bedeli (%15)</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(platformFee, 'TRY')}
            </span>
          </div>
        </div>
      </div>

      {/* Total */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-900">Toplam</span>
          <span className="text-2xl font-bold text-indigo-600">
            {formatCurrency(total, 'TRY')}
          </span>
        </div>
      </div>

      {/* Order Status */}
      {checkoutSession && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
          <div className="flex items-center text-sm text-green-800">
            <svg
              className="mr-2 h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            Sipariş oluşturuldu
          </div>
        </div>
      )}

      {/* Security Badge */}
      <div className="mt-4 rounded-lg bg-gray-50 p-3">
        <div className="flex items-center text-xs text-gray-600">
          <svg
            className="mr-2 h-4 w-4 text-green-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Ödemeleriniz SSL ile güvence altında
        </div>
      </div>
    </div>
  );
}

export default OrderSummary;
