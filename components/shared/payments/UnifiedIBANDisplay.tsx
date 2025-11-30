/**
 * ================================================
 * UNIFIED IBAN DISPLAY COMPONENT
 * ================================================
 * Displays IBAN information for both platform and seller payments
 *
 * Features:
 * - Platform IBAN display (for manual bank transfers to MarifetBul)
 * - Seller IBAN display (for manual payments to freelancer)
 * - Copy to clipboard functionality
 * - Payment instructions
 * - Reference number tracking
 * - Masked/unmasked IBAN toggle
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1: Duplicate Cleanup
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Building2,
  AlertCircle,
  CreditCard,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { useClipboard } from '@/hooks/shared/ui/useClipboard';
import { useIBANFormat } from '@/hooks/shared/formatters/useIBANFormat';
import * as configurationApi from '@/lib/api/configuration-api';
import logger from '@/lib/infrastructure/monitoring/logger';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ================================================
// TYPES
// ================================================

type IBANDisplayType = 'platform' | 'seller';

export interface UnifiedIBANDisplayProps {
  /**
   * Type of IBAN to display
   * - 'platform': MarifetBul's IBAN for buyer payments
   * - 'seller': Freelancer's IBAN for direct payments
   */
  type: IBANDisplayType;

  /**
   * Order ID for reference
   */
  orderId: string;

  /**
   * Amount to be transferred
   */
  amount: number;

  /**
   * Currency (default: TRY)
   */
  currency?: string;

  /**
   * Seller's IBAN (required when type='seller')
   */
  sellerIBAN?: string;

  /**
   * Seller name (for seller type)
   */
  sellerName?: string;

  /**
   * Current order status
   */
  orderStatus?: string;

  /**
   * User role (buyer/seller)
   */
  userRole?: 'buyer' | 'seller';

  /**
   * Order number for reference
   */
  orderNumber?: string;

  /**
   * Whether payment is confirmed
   */
  isPaymentConfirmed?: boolean;

  /**
   * Additional custom instructions
   */
  customInstructions?: string;

  /**
   * Callback when copy action is performed
   */
  onCopy?: () => void;

  /**
   * Custom className
   */
  className?: string;
}

interface PlatformBankAccount {
  iban: string;
  accountHolder: string;
  bankName: string;
  branchCode?: string;
  accountNumber?: string;
}

// ================================================
// CONSTANTS
// ================================================

const FALLBACK_BANK_ACCOUNT: PlatformBankAccount = {
  iban: 'TR33 0006 1005 1978 6457 8413 26',
  accountHolder: 'MarifetBul Teknoloji A.Ş.',
  bankName: 'Garanti BBVA',
  branchCode: '1005',
  accountNumber: '6457841326',
};

// ================================================
// HELPERS
// ================================================

const formatAmount = (amount: number, currency = 'TRY'): string => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const generateReference = (orderId: string, orderNumber?: string): string => {
  if (orderNumber) return `MarifetBul - ${orderNumber}`;
  return orderId.slice(-8).toUpperCase();
};

// ================================================
// COMPONENT
// ================================================

export function UnifiedIBANDisplay({
  type,
  orderId,
  amount,
  currency = 'TRY',
  sellerIBAN,
  sellerName,
  orderStatus,
  userRole = 'buyer',
  orderNumber,
  isPaymentConfirmed = false,
  customInstructions,
  onCopy,
  className,
}: UnifiedIBANDisplayProps) {
  const [showFullIBAN, setShowFullIBAN] = useState(false);
  const [platformAccount, setPlatformAccount] =
    useState<PlatformBankAccount | null>(null);
  const [loading, setLoading] = useState(type === 'platform');

  // Get IBAN based on type
  const ibanToDisplay =
    type === 'platform' ? platformAccount?.iban || '' : sellerIBAN || '';

  const { formatted: formattedIBAN, raw: rawIBAN } = useIBANFormat(
    ibanToDisplay,
    { masked: !showFullIBAN }
  );

  const { copy, isCopied } = useClipboard({
    timeout: 3000,
    onSuccess: () => {
      toast.success('IBAN kopyalandı', {
        description: 'IBAN numarası panonuza kopyalandı',
      });
      onCopy?.();
    },
    onError: () => {
      toast.error('Kopyalama başarısız', {
        description: 'IBAN kopyalanamadı. Lütfen manuel olarak kopyalayın.',
      });
    },
  });

  const referenceNumber = generateReference(orderId, orderNumber);

  /**
   * Fetch platform bank account from backend
   */
  useEffect(() => {
    if (type !== 'platform') return;

    const fetchBankAccount = async () => {
      try {
        setLoading(true);
        const account = await configurationApi.getPlatformBankAccount();
        setPlatformAccount({
          iban: account.iban,
          accountHolder: account.accountHolder,
          bankName: account.bankName,
          branchCode: account.branchCode,
          accountNumber: account.accountNumber,
        });
        logger.info('Platform bank account fetched successfully');
      } catch (error) {
        logger.error('Failed to fetch platform bank account', error as Error);
        setPlatformAccount(FALLBACK_BANK_ACCOUNT);
      } finally {
        setLoading(false);
      }
    };

    fetchBankAccount();
  }, [type]);

  // Don't show for seller type if order status is not pending payment
  if (type === 'seller' && orderStatus !== 'PENDING_PAYMENT') {
    return null;
  }

  // Seller view when they're waiting for payment
  if (type === 'seller' && userRole === 'seller' && !isPaymentConfirmed) {
    return (
      <Card
        className={cn('border-2 border-blue-200 bg-blue-50 p-6', className)}
      >
        <div className="flex items-center gap-3 rounded-lg bg-blue-100 p-4">
          <CreditCard className="h-8 w-8 text-blue-700" />
          <div>
            <p className="font-semibold text-blue-900">
              Alıcının Ödemesi Bekleniyor
            </p>
            <p className="text-sm text-blue-700">
              Alıcı ödeme yaptığında buradan onaylayabileceksiniz
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const accountHolder =
    type === 'platform'
      ? platformAccount?.accountHolder
      : sellerName || 'Freelancer';
  const bankName = type === 'platform' ? platformAccount?.bankName : undefined;

  return (
    <Card
      className={cn(
        'border-2 border-blue-200 bg-blue-50',
        isPaymentConfirmed && 'border-green-200 bg-green-50',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'border-b p-6',
          isPaymentConfirmed
            ? 'border-green-200 bg-gradient-to-r from-green-50 to-emerald-50'
            : 'border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50'
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                'rounded-full p-2',
                isPaymentConfirmed ? 'bg-green-100' : 'bg-blue-100'
              )}
            >
              {isPaymentConfirmed ? (
                <CheckCircle2
                  className={cn(
                    'h-5 w-5',
                    isPaymentConfirmed ? 'text-green-600' : 'text-blue-600'
                  )}
                />
              ) : (
                <Building2
                  className={cn(
                    'h-5 w-5',
                    isPaymentConfirmed ? 'text-green-600' : 'text-blue-600'
                  )}
                />
              )}
            </div>
            <div>
              <h3
                className={cn(
                  'text-lg font-semibold',
                  isPaymentConfirmed ? 'text-green-900' : 'text-gray-900'
                )}
              >
                {type === 'platform'
                  ? 'Banka Havalesi Bilgileri'
                  : 'Manuel Ödeme Bilgileri'}
              </h3>
              <p
                className={cn(
                  'text-sm',
                  isPaymentConfirmed ? 'text-green-600' : 'text-gray-600'
                )}
              >
                {type === 'platform'
                  ? 'Aşağıdaki hesaba ödemenizi yapınız'
                  : "Aşağıdaki IBAN'a ödeme yapınız"}
              </p>
            </div>
          </div>
          {isPaymentConfirmed && (
            <Badge variant="success" size="md">
              Onaylandı
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4 p-6">
        {/* Amount to Transfer */}
        <div
          className={cn(
            'rounded-lg border p-4',
            isPaymentConfirmed
              ? 'border-green-200 bg-green-50'
              : 'border-amber-200 bg-amber-50'
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard
                className={cn(
                  'h-5 w-5',
                  isPaymentConfirmed ? 'text-green-600' : 'text-amber-600'
                )}
              />
              <span className="font-medium text-gray-700">
                Gönderilecek Tutar:
              </span>
            </div>
            <span
              className={cn(
                'text-2xl font-bold',
                isPaymentConfirmed ? 'text-green-700' : 'text-amber-700'
              )}
            >
              {formatAmount(amount, currency)}
            </span>
          </div>
          {!isPaymentConfirmed && (
            <p className="mt-2 text-xs text-amber-700">
              ⚠️ Lütfen tam bu tutarı gönderin. Farklı tutarlar işlem
              gecikmesine neden olabilir.
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">Banka bilgileri yükleniyor...</p>
          </div>
        ) : !ibanToDisplay ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">
              IBAN bilgisi bulunamadı. Lütfen daha sonra tekrar deneyin.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Account Holder / Seller Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                {type === 'platform' ? 'Hesap Sahibi' : 'Alıcı (Freelancer)'}
              </label>
              <input
                type="text"
                value={accountHolder}
                readOnly
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:outline-none"
              />
            </div>

            {/* Bank Name (Platform only) */}
            {type === 'platform' && bankName && (
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Banka
                </label>
                <input
                  type="text"
                  value={bankName}
                  readOnly
                  className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:outline-none"
                />
              </div>
            )}

            {/* IBAN */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                IBAN Numarası
              </label>
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex-1 rounded-lg border-2 p-3 font-mono text-lg font-semibold',
                    isPaymentConfirmed
                      ? 'border-green-300 bg-green-100 text-green-900'
                      : 'border-blue-300 bg-white text-blue-900'
                  )}
                >
                  {formattedIBAN}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copy(rawIBAN)}
                  disabled={isCopied}
                  className={cn(
                    'h-12 w-12 p-0',
                    isCopied && 'bg-green-100 text-green-700'
                  )}
                  aria-label="IBAN'ı kopyala"
                >
                  {isCopied ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Copy className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <button
                onClick={() => setShowFullIBAN(!showFullIBAN)}
                className={cn(
                  'mt-2 text-xs font-medium underline',
                  isPaymentConfirmed ? 'text-green-700' : 'text-blue-700'
                )}
              >
                {showFullIBAN ? "IBAN'ı Gizle" : "IBAN'ı Göster"}
              </button>
            </div>

            {/* Reference Number */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Açıklama {type === 'platform' && '(Referans Numarası)'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={referenceNumber}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 font-mono text-sm text-gray-900 focus:outline-none"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copy(referenceNumber)}
                  className="h-10"
                  aria-label="Referans numarasını kopyala"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Havale açıklamasına bu referansı yazınız
              </p>
            </div>
          </div>
        )}

        {/* Payment Instructions */}
        <div
          className={cn(
            'rounded-lg border-l-4 p-4',
            isPaymentConfirmed
              ? 'border-green-500 bg-green-100'
              : 'border-blue-500 bg-blue-100'
          )}
        >
          <div className="flex items-start gap-3">
            <Info
              className={cn(
                'mt-0.5 h-5 w-5 flex-shrink-0',
                isPaymentConfirmed ? 'text-green-700' : 'text-blue-700'
              )}
            />
            <div
              className={cn(
                'space-y-2 text-sm',
                isPaymentConfirmed ? 'text-green-900' : 'text-blue-900'
              )}
            >
              <p className="font-semibold">
                {type === 'platform'
                  ? 'Önemli Bilgilendirme:'
                  : 'Ödeme Talimatları:'}
              </p>
              <ul className="ml-4 list-disc space-y-1">
                {type === 'platform' ? (
                  <>
                    <li>
                      Havale/EFT işleminizi yaptıktan sonra dekont/fotoğrafını
                      yükleyiniz
                    </li>
                    <li>
                      Referans numarasını mutlaka havale açıklamasına yazınız
                    </li>
                    <li>Ödeme onayı 1-2 iş günü içinde gerçekleşecektir</li>
                    <li>
                      Farklı hesaptan gönderilen ödemeler güvenlik nedeniyle
                      reddedilebilir
                    </li>
                  </>
                ) : (
                  <>
                    <li>Yukarıdaki IBAN numarasına ödeme yapın</li>
                    <li>
                      Açıklama alanına sipariş numarasını ({orderNumber}) yazın
                    </li>
                    <li>Ödeme yaptıktan sonra satıcının onayını bekleyin</li>
                    <li>Satıcı ödemeyi onayladıktan sonra işe başlayacaktır</li>
                  </>
                )}
                <li>
                  Sorun yaşarsanız{' '}
                  <a
                    href="/support"
                    className={cn(
                      'font-medium underline',
                      isPaymentConfirmed
                        ? 'text-green-600 hover:text-green-700'
                        : 'text-blue-600 hover:text-blue-700'
                    )}
                  >
                    destek ekibimize
                  </a>{' '}
                  ulaşın
                </li>
              </ul>
              {!isPaymentConfirmed && type === 'seller' && (
                <p className="mt-3 rounded bg-yellow-50 p-2 text-xs text-yellow-800">
                  <AlertCircle className="mr-1 inline h-4 w-4" />
                  <strong>Önemli:</strong> Ödeme işlemi genellikle birkaç dakika
                  içinde gerçekleşir. Satıcı ödemeyi aldıktan sonra sistem
                  üzerinden onaylayacaktır.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Custom Instructions */}
        {customInstructions && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-700">{customInstructions}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

// ================================================
// DISPLAY NAME
// ================================================

UnifiedIBANDisplay.displayName = 'UnifiedIBANDisplay';
