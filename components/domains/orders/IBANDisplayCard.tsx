/**
 * ================================================
 * IBAN DISPLAY CARD
 * ================================================
 * Displays seller's IBAN for manual payment
 *
 * Features:
 * - IBAN display with copy-to-clipboard
 * - Payment instructions
 * - Status indicator
 * - Masked IBAN for security
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @sprint Sprint 1 - Story 1.1 - IBAN Display & Manual Payment
 */

'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { formatIBAN } from '@/lib/shared/formatters';
import logger from '@/lib/infrastructure/monitoring/logger';
import {
  Building2,
  Copy,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ================================================
// TYPES
// ================================================

export interface IBANDisplayCardProps {
  /** Seller's IBAN */
  iban: string;
  /** Current order status */
  orderStatus: string;
  /** User role (buyer sees IBAN, seller sees confirmation) */
  userRole: 'buyer' | 'seller';
  /** Seller name */
  sellerName?: string;
  /** Order amount */
  orderAmount?: number;
  /** Currency */
  currency?: string;
  /** Order number for reference */
  orderNumber?: string;
  /** Payment confirmed status */
  isPaymentConfirmed?: boolean;
  /** Custom className */
  className?: string;
}

// ================================================
// HELPERS
// ================================================

/**
 * Mask IBAN for security (show first 4 and last 4 characters)
 * Uses formatIBAN from @/lib/shared/formatters for consistent formatting
 */
function maskIBAN(iban: string, reveal: boolean = false): string {
  if (reveal) return formatIBAN(iban);
  return formatIBAN(iban, true); // Use mask parameter from shared formatter
}

/**
 * Copy to clipboard
 */
async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    logger.error('Failed to copy to clipboard', err as Error);
    return false;
  }
}

// ================================================
// COMPONENT
// ================================================

export function IBANDisplayCard({
  iban,
  orderStatus,
  userRole,
  sellerName,
  orderAmount,
  currency = 'TRY',
  orderNumber,
  isPaymentConfirmed = false,
  className,
}: IBANDisplayCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [showFullIBAN, setShowFullIBAN] = useState(false);

  // Only show for manual payment and pending payment status
  const shouldShow = orderStatus === 'PENDING_PAYMENT';

  if (!shouldShow) return null;

  // Handle copy IBAN
  const handleCopy = async () => {
    const success = await copyToClipboard(iban);
    if (success) {
      setIsCopied(true);
      toast.success('IBAN kopyalandı', {
        description: 'IBAN numarası panonuza kopyalandı',
      });
      setTimeout(() => setIsCopied(false), 3000);
    } else {
      toast.error('Kopyalama başarısız', {
        description: 'IBAN kopyalanamadı. Lütfen manuel olarak kopyalayın.',
      });
    }
  };

  return (
    <Card
      className={cn(
        'border-2 border-blue-200 bg-blue-50 p-6',
        isPaymentConfirmed && 'border-green-200 bg-green-50',
        className
      )}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              isPaymentConfirmed ? 'bg-green-200' : 'bg-blue-200'
            )}
          >
            {isPaymentConfirmed ? (
              <CheckCircle2
                className={cn(
                  'h-6 w-6',
                  isPaymentConfirmed ? 'text-green-700' : 'text-blue-700'
                )}
              />
            ) : (
              <Building2
                className={cn(
                  'h-6 w-6',
                  isPaymentConfirmed ? 'text-green-700' : 'text-blue-700'
                )}
              />
            )}
          </div>
          <div>
            <h3
              className={cn(
                'text-lg font-semibold',
                isPaymentConfirmed ? 'text-green-900' : 'text-blue-900'
              )}
            >
              {userRole === 'buyer'
                ? 'Manuel Ödeme Bilgileri'
                : 'Ödeme Bekleniyor'}
            </h3>
            <p
              className={cn(
                'text-sm',
                isPaymentConfirmed ? 'text-green-700' : 'text-blue-700'
              )}
            >
              {userRole === 'buyer'
                ? "Aşağıdaki IBAN'a ödeme yapınız"
                : 'Alıcının ödeme yapması bekleniyor'}
            </p>
          </div>
        </div>
        <Badge variant={isPaymentConfirmed ? 'success' : 'warning'} size="md">
          {isPaymentConfirmed ? 'Onaylandı' : 'Bekliyor'}
        </Badge>
      </div>

      {/* IBAN Display - Only for buyer */}
      {userRole === 'buyer' && (
        <div
          className={cn(
            'space-y-4 border-t pt-4',
            isPaymentConfirmed ? 'border-green-200' : 'border-blue-200'
          )}
        >
          {/* Seller Info */}
          {sellerName && (
            <div>
              <label
                className={cn(
                  'text-sm font-medium',
                  isPaymentConfirmed ? 'text-green-800' : 'text-blue-800'
                )}
              >
                Alıcı (Freelancer)
              </label>
              <p
                className={cn(
                  'font-semibold',
                  isPaymentConfirmed ? 'text-green-900' : 'text-blue-900'
                )}
              >
                {sellerName}
              </p>
            </div>
          )}

          {/* IBAN */}
          <div>
            <label
              className={cn(
                'text-sm font-medium',
                isPaymentConfirmed ? 'text-green-800' : 'text-blue-800'
              )}
            >
              IBAN Numarası
            </label>
            <div className="mt-1 flex items-center gap-2">
              <div
                className={cn(
                  'flex-1 rounded-lg border-2 p-3 font-mono text-lg font-semibold',
                  isPaymentConfirmed
                    ? 'border-green-300 bg-green-100 text-green-900'
                    : 'border-blue-300 bg-white text-blue-900'
                )}
              >
                {maskIBAN(iban, showFullIBAN)}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={isCopied}
                className={cn(
                  'h-12 w-12 p-0',
                  isCopied && 'bg-green-100 text-green-700'
                )}
              >
                {isCopied ? (
                  <CheckCircle2 className="h-5 w-5" />
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

          {/* Amount */}
          {orderAmount && (
            <div>
              <label
                className={cn(
                  'text-sm font-medium',
                  isPaymentConfirmed ? 'text-green-800' : 'text-blue-800'
                )}
              >
                Gönderilecek Tutar
              </label>
              <p
                className={cn(
                  'text-2xl font-bold',
                  isPaymentConfirmed ? 'text-green-900' : 'text-blue-900'
                )}
              >
                {new Intl.NumberFormat('tr-TR', {
                  style: 'currency',
                  currency: currency,
                }).format(orderAmount)}
              </p>
            </div>
          )}

          {/* Reference */}
          {orderNumber && (
            <div>
              <label
                className={cn(
                  'text-sm font-medium',
                  isPaymentConfirmed ? 'text-green-800' : 'text-blue-800'
                )}
              >
                Açıklama Alanına Yazınız
              </label>
              <div
                className={cn(
                  'mt-1 rounded-lg border-2 p-3',
                  isPaymentConfirmed
                    ? 'border-green-300 bg-green-100'
                    : 'border-blue-300 bg-blue-100'
                )}
              >
                <p
                  className={cn(
                    'font-mono font-semibold',
                    isPaymentConfirmed ? 'text-green-900' : 'text-blue-900'
                  )}
                >
                  MarifetBul - {orderNumber}
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
            <div className="flex gap-3">
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
                <p className="font-semibold">Ödeme Talimatları:</p>
                <ol className="ml-4 list-decimal space-y-1">
                  <li>Yukarıdaki IBAN numarasına ödeme yapın</li>
                  <li>
                    Açıklama alanına sipariş numarasını (
                    <span className="font-mono font-semibold">
                      {orderNumber}
                    </span>
                    ) yazın
                  </li>
                  <li>Ödeme yaptıktan sonra satıcının onayını bekleyin</li>
                  <li>Satıcı ödemeyi onayladıktan sonra işe başlayacaktır</li>
                </ol>
                <p className="mt-3 rounded bg-yellow-50 p-2 text-xs text-yellow-800">
                  <AlertCircle className="mr-1 inline h-4 w-4" />
                  <strong>Önemli:</strong> Ödeme işlemi genellikle birkaç dakika
                  içinde gerçekleşir. Satıcı ödemeyi aldıktan sonra sistem
                  üzerinden onaylayacaktır.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Seller View - Waiting message */}
      {userRole === 'seller' && !isPaymentConfirmed && (
        <div className="border-t border-blue-200 pt-4">
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
        </div>
      )}
    </Card>
  );
}
