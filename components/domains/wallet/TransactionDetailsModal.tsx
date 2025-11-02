/**
 * ================================================
 * TRANSACTION DETAILS MODAL
 * ================================================
 * Detailed view of individual transaction with actions
 *
 * Features:
 * - Full transaction information display
 * - Related order/payment link
 * - Transaction receipt download
 * - Status indicators
 * - Metadata viewer
 *
 * Sprint 1 - Epic 1.1 - Day 2
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  ExternalLink,
  Calendar,
  CreditCard,
  FileText,
  DollarSign,
  Hash,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { formatCurrency } from '@/lib/shared/utils/format';
import type {
  Transaction,
  TransactionType,
} from '@/types/business/features/wallet';

// ============================================================================
// TYPES
// ============================================================================

export interface TransactionDetailsModalProps {
  /** Transaction to display */
  transaction: Transaction | null;

  /** Modal open state */
  isOpen: boolean;

  /** Close modal callback */
  onClose: () => void;

  /** Download receipt callback */
  onDownloadReceipt?: (transactionId: string) => void;

  /** View related order callback */
  onViewRelatedOrder?: (orderId: string) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format full date and time
 */
function formatFullDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('tr-TR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Get transaction type display info
 */
function getTypeInfo(type: TransactionType): {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  icon: string;
} {
  switch (type) {
    case 'CREDIT':
      return {
        label: 'Ödeme Alındı',
        description: 'Bir siparişten ödeme aldınız',
        color: 'text-green-800',
        bgColor: 'bg-green-100',
        icon: '↗️',
      };
    case 'DEBIT':
      return {
        label: 'Ödeme Gönderildi',
        description: 'Bir sipariş için ödeme yaptınız',
        color: 'text-red-800',
        bgColor: 'bg-red-100',
        icon: '↙️',
      };
    case 'ESCROW_HOLD':
      return {
        label: 'Escrow Beklemede',
        description: 'Ödeme güvende tutuluyor',
        color: 'text-yellow-800',
        bgColor: 'bg-yellow-100',
        icon: '⏳',
      };
    case 'ESCROW_RELEASE':
      return {
        label: 'Escrow Serbest Bırakıldı',
        description: 'Güvende tutulan ödeme serbest bırakıldı',
        color: 'text-green-800',
        bgColor: 'bg-green-100',
        icon: '✅',
      };
    case 'PAYOUT':
      return {
        label: 'Para Çekim',
        description: 'Hesabınıza para transferi yapıldı',
        color: 'text-blue-800',
        bgColor: 'bg-blue-100',
        icon: '💳',
      };
    case 'REFUND':
      return {
        label: 'İade',
        description: 'Ödeme iade edildi',
        color: 'text-purple-800',
        bgColor: 'bg-purple-100',
        icon: '↩️',
      };
    case 'FEE':
      return {
        label: 'Komisyon',
        description: 'Platform komisyon ücreti',
        color: 'text-gray-800',
        bgColor: 'bg-gray-100',
        icon: '💰',
      };
    default:
      return {
        label: String(type),
        description: 'İşlem',
        color: 'text-gray-800',
        bgColor: 'bg-gray-100',
        icon: '📄',
      };
  }
}

/**
 * Get related entity label
 */
function getRelatedEntityLabel(type?: string): string {
  switch (type) {
    case 'ORDER':
      return 'Sipariş';
    case 'PAYMENT':
      return 'Ödeme';
    case 'PAYOUT':
      return 'Çekim';
    default:
      return 'İlişkili Varlık';
  }
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Info row component
 */
function InfoRow({
  icon: Icon,
  label,
  value,
  valueClassName = '',
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-start space-x-3 border-b border-gray-100 py-3 last:border-0">
      <Icon className="mt-0.5 h-5 w-5 text-gray-400" />
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-sm text-gray-600">{label}</p>
        <p
          className={`text-sm font-medium ${valueClassName || 'text-gray-900'}`}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

/**
 * Metadata viewer component
 */
function MetadataViewer({ metadata }: { metadata?: Record<string, unknown> }) {
  if (!metadata || Object.keys(metadata).length === 0) {
    return null;
  }

  return (
    <div className="mt-6">
      <h4 className="mb-3 flex items-center text-sm font-semibold text-gray-900">
        <Info className="mr-2 h-4 w-4" />
        Ek Bilgiler
      </h4>
      <div className="rounded-lg bg-gray-50 p-4">
        <pre className="overflow-x-auto text-xs break-words whitespace-pre-wrap text-gray-700">
          {JSON.stringify(metadata, null, 2)}
        </pre>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * TransactionDetailsModal Component
 *
 * Displays detailed information about a transaction in a modal
 *
 * @example
 * ```tsx
 * <TransactionDetailsModal
 *   transaction={selectedTransaction}
 *   isOpen={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   onDownloadReceipt={handleDownloadReceipt}
 *   onViewRelatedOrder={handleViewOrder}
 * />
 * ```
 */
export function TransactionDetailsModal({
  transaction,
  isOpen,
  onClose,
  onDownloadReceipt,
  onViewRelatedOrder,
}: TransactionDetailsModalProps) {
  // Don't render if no transaction
  if (!transaction) return null;

  const typeInfo = getTypeInfo(transaction.type);
  const isCredit =
    transaction.type === 'CREDIT' || transaction.type === 'ESCROW_RELEASE';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50"
          />

          {/* Modal */}
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto"
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="mb-2 flex items-center space-x-2">
                        <span
                          className={`rounded-lg px-3 py-1 text-sm font-medium ${typeInfo.bgColor} ${typeInfo.color}`}
                        >
                          {typeInfo.icon} {typeInfo.label}
                        </span>
                      </div>
                      <CardTitle>
                        {transaction.description || 'İşlem Detayı'}
                      </CardTitle>
                      <p className="mt-1 text-sm text-gray-600">
                        {typeInfo.description}
                      </p>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-gray-400 transition-colors hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Amount Display */}
                  <div className="mb-6 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 p-6">
                    <p className="mb-2 text-sm text-gray-600">İşlem Tutarı</p>
                    <p
                      className={`text-4xl font-bold ${
                        isCredit ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {isCredit ? '+' : '-'}
                      {formatCurrency(transaction.amount, transaction.currency)}
                    </p>
                  </div>

                  {/* Transaction Details */}
                  <div className="space-y-0">
                    <InfoRow
                      icon={Hash}
                      label="İşlem ID"
                      value={transaction.id}
                      valueClassName="font-mono text-xs"
                    />

                    <InfoRow
                      icon={Calendar}
                      label="İşlem Tarihi"
                      value={formatFullDate(transaction.createdAt)}
                    />

                    <InfoRow
                      icon={CreditCard}
                      label="İşlem Sonrası Bakiye"
                      value={formatCurrency(
                        transaction.balanceAfter,
                        transaction.currency
                      )}
                      valueClassName="text-blue-600 font-semibold"
                    />

                    <InfoRow
                      icon={DollarSign}
                      label="Para Birimi"
                      value={transaction.currency}
                    />

                    {transaction.relatedEntityId && (
                      <InfoRow
                        icon={FileText}
                        label={getRelatedEntityLabel(
                          transaction.relatedEntityType
                        )}
                        value={
                          onViewRelatedOrder &&
                          transaction.relatedEntityType === 'ORDER' ? (
                            <button
                              onClick={() =>
                                onViewRelatedOrder(transaction.relatedEntityId!)
                              }
                              className="flex items-center space-x-1 font-medium text-blue-600 hover:text-blue-700"
                            >
                              <span>{transaction.relatedEntityId}</span>
                              <ExternalLink className="h-3 w-3" />
                            </button>
                          ) : (
                            transaction.relatedEntityId
                          )
                        }
                      />
                    )}
                  </div>

                  {/* Metadata */}
                  {transaction.metadata && (
                    <MetadataViewer metadata={transaction.metadata} />
                  )}

                  {/* Action Buttons */}
                  <div className="mt-6 flex items-center space-x-3">
                    {onDownloadReceipt && (
                      <Button
                        onClick={() => onDownloadReceipt(transaction.id)}
                        variant="outline"
                        className="flex-1"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Makbuz İndir
                      </Button>
                    )}

                    <Button
                      onClick={onClose}
                      variant="primary"
                      className="flex-1"
                    >
                      Kapat
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export default TransactionDetailsModal;
