/**
 * ================================================
 * IBAN DISPLAY CARD COMPONENT (DEPRECATED)
 * ================================================
 * @deprecated Use UnifiedIBANDisplay from @/components/shared/payments instead
 *
 * This component is kept for backwards compatibility but will be removed in v2.0.
 * Migration guide:
 *
 * Old:
 * ```tsx
 * import { IBANDisplayCard } from '@/components/domains/payments/IBANDisplayCard';
 * <IBANDisplayCard orderId={id} amount={amount} />
 * ```
 *
 * New:
 * ```tsx
 * import { UnifiedIBANDisplay } from '@/components/shared/payments';
 * <UnifiedIBANDisplay type="platform" orderId={id} amount={amount} />
 * ```
 *
 * Displays platform IBAN information for manual bank transfers
 *
 * Features:
 * - Platform IBAN display with formatting
 * - Copy to clipboard functionality
 * - Payment instructions
 * - Bank account holder information
 * - Transfer amount display
 * - Reference number for tracking
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1: Epic 2 Story 2.1
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Copy, Check, Building2, AlertCircle, CreditCard } from 'lucide-react';
import * as configurationApi from '@/lib/api/configuration-api';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

export interface IBANDisplayCardProps {
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
   * Additional instructions
   */
  customInstructions?: string;

  /**
   * Callback when copy action is performed
   */
  onCopy?: () => void;
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

/**
 * Platform bank account information - fetched from backend configuration
 */
const FALLBACK_BANK_ACCOUNT: PlatformBankAccount = {
  iban: 'TR33 0006 1005 1978 6457 8413 26',
  accountHolder: 'MarifetBul Teknoloji A.Ş.',
  bankName: 'Garanti BBVA',
  branchCode: '1005',
  accountNumber: '6457841326',
};

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Format amount with thousand separators
 */
const formatAmount = (amount: number, currency = 'TRY'): string => {
  const formatted = amount.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
};

/**
 * Copy text to clipboard
 */
const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      textArea.remove();
      return success;
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
};

/**
 * Generate reference number from order ID
 */
const generateReference = (orderId: string): string => {
  // Extract last 8 characters from order ID
  return orderId.slice(-8).toUpperCase();
};

// ================================================
// COMPONENT
// ================================================

export const IBANDisplayCard: React.FC<IBANDisplayCardProps> = ({
  orderId,
  amount,
  currency = 'TRY',
  customInstructions,
  onCopy,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [bankAccount, setBankAccount] = useState<PlatformBankAccount | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const referenceNumber = generateReference(orderId);

  /**
   * Fetch platform bank account from backend
   */
  useEffect(() => {
    const fetchBankAccount = async () => {
      try {
        setLoading(true);
        const account = await configurationApi.getPlatformBankAccount();
        setBankAccount({
          iban: account.iban,
          accountHolder: account.accountHolder,
          bankName: account.bankName,
          branchCode: account.branchCode,
          accountNumber: account.accountNumber,
        });
        logger.info('Platform bank account fetched successfully');
      } catch (error) {
        logger.error('Failed to fetch platform bank account', error as Error);
        // Fallback to default values if backend API fails
        setBankAccount(FALLBACK_BANK_ACCOUNT);
      } finally {
        setLoading(false);
      }
    };

    fetchBankAccount();
  }, []);

  /**
   * Handle copy action
   */
  const handleCopy = async (text: string, fieldName: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(fieldName);
      onCopy?.();
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Banka Havalesi Bilgileri
            </h3>
            <p className="text-sm text-gray-600">
              Aşağıdaki hesaba ödemenizi yapınız
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-6">
        {/* Amount to Transfer */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-amber-600" />
              <span className="font-medium text-gray-700">
                Gönderilecek Tutar:
              </span>
            </div>
            <span className="text-2xl font-bold text-amber-700">
              {formatAmount(amount, currency)}
            </span>
          </div>
          <p className="mt-2 text-xs text-amber-700">
            ⚠️ Lütfen tam bu tutarı gönderin. Farklı tutarlar işlem gecikmesine
            neden olabilir.
          </p>
        </div>

        {/* Bank Account Details */}
        {loading ? (
          <div className="py-8 text-center">
            <p className="text-gray-500">Banka bilgileri yükleniyor...</p>
          </div>
        ) : !bankAccount ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-red-700">
              Banka bilgileri yüklenemedi. Lütfen daha sonra tekrar deneyin.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* IBAN */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                IBAN Numarası
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={bankAccount.iban}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 font-mono text-sm text-gray-900 focus:outline-none"
                />
                <button
                  onClick={() =>
                    handleCopy(bankAccount.iban.replace(/\s/g, ''), 'iban')
                  }
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                  aria-label="IBAN'ı kopyala"
                >
                  {copiedField === 'iban' ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Kopyalandı</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Kopyala</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Account Holder */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Hesap Sahibi
              </label>
              <input
                type="text"
                value={bankAccount.accountHolder}
                readOnly
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:outline-none"
              />
            </div>

            {/* Bank Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Banka
              </label>
              <input
                type="text"
                value={bankAccount.bankName}
                readOnly
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 focus:outline-none"
              />
            </div>

            {/* Reference Number */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Açıklama (Referans Numarası)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={referenceNumber}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 font-mono text-sm text-gray-900 focus:outline-none"
                />
                <button
                  onClick={() => handleCopy(referenceNumber, 'reference')}
                  className="flex items-center gap-2 rounded-lg bg-gray-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
                  aria-label="Referans numarasını kopyala"
                >
                  {copiedField === 'reference' ? (
                    <>
                      <Check className="h-4 w-4" />
                      <span>Kopyalandı</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>Kopyala</span>
                    </>
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Havale açıklamasına bu referans numarasını yazınız
              </p>
            </div>
          </div>
        )}

        {/* Important Instructions */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div className="space-y-2 text-sm text-blue-900">
              <p className="font-semibold">Önemli Bilgilendirme:</p>
              <ul className="list-inside list-disc space-y-1 text-blue-800">
                <li>
                  Havale/EFT işleminizi yaptıktan sonra dekont/fotoğrafını
                  yükleyiniz
                </li>
                <li>Referans numarasını mutlaka havale açıklamasına yazınız</li>
                <li>Ödeme onayı 1-2 iş günü içinde gerçekleşecektir</li>
                <li>
                  Farklı hesaptan gönderilen ödemeler güvenlik nedeniyle
                  reddedilebilir
                </li>
                <li>
                  Sorun yaşarsanız{' '}
                  <a
                    href="/support"
                    className="font-medium text-blue-600 underline hover:text-blue-700"
                  >
                    destek ekibimize
                  </a>{' '}
                  ulaşın
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Custom Instructions */}
        {customInstructions && (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm text-gray-700">{customInstructions}</p>
          </div>
        )}

        {/* Quick Copy All Info Button */}
        <button
          onClick={() => {
            const allInfo = `
IBAN: ${PLATFORM_BANK_ACCOUNT.iban.replace(/\s/g, '')}
Hesap Sahibi: ${PLATFORM_BANK_ACCOUNT.accountHolder}
Banka: ${PLATFORM_BANK_ACCOUNT.bankName}
Tutar: ${formatAmount(amount, currency)}
Referans: ${referenceNumber}
            `.trim();
            handleCopy(allInfo, 'all');
          }}
          className="w-full rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
        >
          {copiedField === 'all' ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="h-4 w-4 text-green-600" />
              <span className="text-green-600">Tüm Bilgiler Kopyalandı</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Copy className="h-4 w-4" />
              <span>Tüm Bilgileri Kopyala</span>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

// ================================================
// DISPLAY NAME
// ================================================

IBANDisplayCard.displayName = 'IBANDisplayCard';
