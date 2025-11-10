/**
 * ================================================
 * PAYMENT MODE DISPLAY COMPONENT
 * ================================================
 * Displays payment mode information and status in order details
 *
 * Features:
 * - Payment mode badge (Escrow vs IBAN)
 * - Payment status indicator
 * - Payment proof display for MANUAL_IBAN
 * - Payment timeline
 * - Conditional rendering based on user role
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1: Epic 3
 */

'use client';

import React, { useState } from 'react';
import {
  Shield,
  Building2,
  Check,
  Clock,
  AlertCircle,
  Eye,
  Download,
  CreditCard,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import type { PaymentMode } from '@/types/business/features/order';

// ================================================
// TYPES
// ================================================

export interface PaymentModeDisplayProps {
  /**
   * Payment mode
   */
  paymentMode: PaymentMode;

  /**
   * Order status
   */
  orderStatus: string;

  /**
   * Payment proof URL (for MANUAL_IBAN)
   */
  paymentProofUrl?: string;

  /**
   * Payment confirmed at timestamp
   */
  paymentConfirmedAt?: string;

  /**
   * Payment confirmed by user info
   */
  paymentConfirmedBy?: {
    name: string;
    role: string;
  };

  /**
   * Buyer confirmed payment
   */
  buyerConfirmed?: boolean;

  /**
   * Seller confirmed payment
   */
  sellerConfirmed?: boolean;

  /**
   * User's role in this order
   */
  userRole?: 'buyer' | 'seller';

  /**
   * Callback when payment proof is viewed
   */
  onViewProof?: () => void;
}

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Get payment mode label
 */
const getPaymentModeLabel = (mode: PaymentMode): string => {
  return mode === 'ESCROW_PROTECTED'
    ? 'Güvenli Ödeme (Escrow)'
    : 'IBAN ile Ödeme';
};

/**
 * Get payment mode icon
 */
const getPaymentModeIcon = (mode: PaymentMode) => {
  return mode === 'ESCROW_PROTECTED' ? Shield : Building2;
};

/**
 * Get payment status info
 */
const getPaymentStatusInfo = (
  orderStatus: string,
  paymentMode: PaymentMode,
  buyerConfirmed?: boolean,
  sellerConfirmed?: boolean
): {
  label: string;
  variant: 'success' | 'warning' | 'error' | 'info' | 'default';
  icon: React.ElementType;
} => {
  if (orderStatus === 'PENDING_PAYMENT') {
    if (paymentMode === 'MANUAL_IBAN') {
      if (buyerConfirmed && sellerConfirmed) {
        return {
          label: 'Her İki Taraf Onayladı',
          variant: 'success',
          icon: Check,
        };
      } else if (buyerConfirmed || sellerConfirmed) {
        return {
          label: 'Tek Taraflı Onay Bekliyor',
          variant: 'warning',
          icon: Clock,
        };
      }
      return {
        label: 'Ödeme Onayı Bekleniyor',
        variant: 'warning',
        icon: Clock,
      };
    }
    return {
      label: 'Ödeme Bekleniyor',
      variant: 'warning',
      icon: Clock,
    };
  }

  if (
    orderStatus === 'IN_PROGRESS' ||
    orderStatus === 'DELIVERED' ||
    orderStatus === 'COMPLETED'
  ) {
    return {
      label: 'Ödeme Tamamlandı',
      variant: 'success',
      icon: Check,
    };
  }

  if (orderStatus === 'CANCELLED') {
    return {
      label: 'İptal Edildi',
      variant: 'error',
      icon: AlertCircle,
    };
  }

  return {
    label: 'Beklemede',
    variant: 'default',
    icon: Clock,
  };
};

/**
 * Format date for display
 */
const formatDate = (dateString?: string): string => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// ================================================
// COMPONENT
// ================================================

export const PaymentModeDisplay: React.FC<PaymentModeDisplayProps> = ({
  paymentMode,
  orderStatus,
  paymentProofUrl,
  paymentConfirmedAt,
  paymentConfirmedBy,
  buyerConfirmed,
  sellerConfirmed,
  userRole,
  onViewProof,
}) => {
  const [showProofModal, setShowProofModal] = useState(false);
  const PaymentIcon = getPaymentModeIcon(paymentMode);
  const statusInfo = getPaymentStatusInfo(
    orderStatus,
    paymentMode,
    buyerConfirmed,
    sellerConfirmed
  );
  const StatusIcon = statusInfo.icon;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`rounded-full p-2 ${
              paymentMode === 'ESCROW_PROTECTED'
                ? 'bg-blue-100'
                : 'bg-green-100'
            }`}
          >
            <PaymentIcon
              className={`h-5 w-5 ${
                paymentMode === 'ESCROW_PROTECTED'
                  ? 'text-blue-600'
                  : 'text-green-600'
              }`}
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Ödeme Bilgileri
            </h3>
            <p className="text-sm text-gray-600">
              {getPaymentModeLabel(paymentMode)}
            </p>
          </div>
        </div>
        <Badge variant={statusInfo.variant}>
          <StatusIcon className="mr-1 h-3 w-3" />
          {statusInfo.label}
        </Badge>
      </div>

      {/* Payment Mode Details */}
      <div className="space-y-3">
        {/* Escrow Payment Info */}
        {paymentMode === 'ESCROW_PROTECTED' && (
          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start gap-2">
              <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">Platform Güvenceli Ödeme</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800 text-xs">
                  <li>Ödeme iyzico üzerinden güvenli şekilde alındı</li>
                  <li>Tutar platform escrow hesabında tutuluyor</li>
                  <li>Sipariş tamamlandığında satıcıya aktarılacak</li>
                  <li>İptal durumunda otomatik iade edilir</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Manual IBAN Payment Info */}
        {paymentMode === 'MANUAL_IBAN' && (
          <div className="space-y-3">
            {/* Confirmation Status */}
            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
              <p className="mb-3 text-sm font-medium text-gray-700">
                Onay Durumu:
              </p>
              <div className="grid grid-cols-2 gap-3">
                {/* Buyer Confirmation */}
                <div
                  className={`rounded-lg border p-3 ${
                    buyerConfirmed
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {buyerConfirmed ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        buyerConfirmed ? 'text-green-700' : 'text-gray-600'
                      }`}
                    >
                      Alıcı
                    </span>
                  </div>
                  <p
                    className={`mt-1 text-xs ${
                      buyerConfirmed ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {buyerConfirmed ? 'Ödeme yaptı' : 'Onay bekleniyor'}
                  </p>
                </div>

                {/* Seller Confirmation */}
                <div
                  className={`rounded-lg border p-3 ${
                    sellerConfirmed
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {sellerConfirmed ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-gray-400" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        sellerConfirmed ? 'text-green-700' : 'text-gray-600'
                      }`}
                    >
                      Satıcı
                    </span>
                  </div>
                  <p
                    className={`mt-1 text-xs ${
                      sellerConfirmed ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {sellerConfirmed ? 'Aldığını onayladı' : 'Onay bekleniyor'}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Proof */}
            {paymentProofUrl && (
              <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-900">
                        Ödeme Kanıtı Yüklendi
                      </p>
                      <p className="text-xs text-green-700">
                        {formatDate(paymentConfirmedAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowProofModal(true);
                        onViewProof?.();
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <Eye className="h-3 w-3" />
                      Görüntüle
                    </button>
                    <a
                      href={paymentProofUrl}
                      download
                      className="inline-flex items-center gap-1 rounded-lg border border-green-600 bg-white px-3 py-1.5 text-xs font-medium text-green-600 transition-colors hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      <Download className="h-3 w-3" />
                      İndir
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* No Proof Yet */}
            {!paymentProofUrl && orderStatus === 'PENDING_PAYMENT' && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-900">
                    <p className="font-medium mb-1">Ödeme Kanıtı Bekleniyor</p>
                    <p className="text-amber-800 text-xs">
                      {userRole === 'buyer'
                        ? 'Ödeme yaptıktan sonra dekontunuzu yükleyiniz.'
                        : 'Alıcının ödeme kanıtı yüklemesi bekleniyor.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Confirmation Info */}
            {paymentConfirmedAt && paymentConfirmedBy && (
              <div className="text-xs text-gray-600">
                <p>
                  <span className="font-medium">Son Onay:</span>{' '}
                  {paymentConfirmedBy.name} ({paymentConfirmedBy.role}) -{' '}
                  {formatDate(paymentConfirmedAt)}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Proof Modal */}
      {showProofModal && paymentProofUrl && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowProofModal(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Ödeme Kanıtı
                </h3>
                <button
                  onClick={() => setShowProofModal(false)}
                  className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Image */}
              <div className="overflow-auto bg-gray-100 p-4">
                <img
                  src={paymentProofUrl}
                  alt="Ödeme kanıtı"
                  className="mx-auto max-h-[70vh] rounded-lg shadow-lg"
                />
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Yüklenme: {formatDate(paymentConfirmedAt)}
                  </p>
                  <a
                    href={paymentProofUrl}
                    download
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <Download className="h-4 w-4" />
                    İndir
                  </a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// ================================================
// DISPLAY NAME
// ================================================

PaymentModeDisplay.displayName = 'PaymentModeDisplay';
