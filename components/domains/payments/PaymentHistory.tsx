/**
 * ================================================
 * PAYMENT HISTORY COMPONENT
 * ================================================
 * Display payment transaction history
 *
 * Features:
 * - Transaction list
 * - Payment status badges
 * - Amount and date display
 * - Payment method info
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React from 'react';
import {
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/shared/formatters';

interface PaymentTransaction {
  id: string;
  type: 'PAYMENT' | 'REFUND' | 'ESCROW_RELEASE' | 'PLATFORM_FEE';
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';
  method?: string;
  description: string;
  createdAt: string;
  completedAt?: string;
}

interface PaymentHistoryProps {
  transactions: PaymentTransaction[];
  className?: string;
}

export function PaymentHistory({
  transactions,
  className = '',
}: PaymentHistoryProps) {
  // Get status config
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return {
          icon: <CheckCircle className="h-4 w-4" />,
          label: 'Tamamlandı',
          color: 'text-green-600 bg-green-100',
        };
      case 'PENDING':
        return {
          icon: <Clock className="h-4 w-4" />,
          label: 'Beklemede',
          color: 'text-yellow-600 bg-yellow-100',
        };
      case 'FAILED':
        return {
          icon: <XCircle className="h-4 w-4" />,
          label: 'Başarısız',
          color: 'text-red-600 bg-red-100',
        };
      case 'REFUNDED':
        return {
          icon: <RefreshCw className="h-4 w-4" />,
          label: 'İade Edildi',
          color: 'text-blue-600 bg-blue-100',
        };
      default:
        return {
          icon: <Clock className="h-4 w-4" />,
          label: status,
          color: 'text-gray-600 bg-gray-100',
        };
    }
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return 'Ödeme';
      case 'REFUND':
        return 'İade';
      case 'ESCROW_RELEASE':
        return 'Emanet Serbest Bırakma';
      case 'PLATFORM_FEE':
        return 'Platform Ücreti';
      default:
        return type;
    }
  };

  if (transactions.length === 0) {
    return (
      <div className={`rounded-lg bg-white p-6 shadow-md ${className}`}>
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Ödeme Geçmişi
        </h3>
        <div className="py-8 text-center">
          <CreditCard className="mx-auto mb-3 h-12 w-12 text-gray-400" />
          <p className="text-gray-600">Henüz ödeme işlemi bulunmuyor</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg bg-white p-6 shadow-md ${className}`}>
      <h3 className="mb-4 text-lg font-semibold text-gray-900">
        Ödeme Geçmişi
      </h3>

      <div className="space-y-4">
        {transactions.map((transaction) => {
          const statusConfig = getStatusConfig(transaction.status);
          const isRefund = transaction.type === 'REFUND';

          return (
            <div
              key={transaction.id}
              className="flex items-start gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50"
            >
              {/* Icon */}
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                  isRefund ? 'bg-blue-100' : 'bg-indigo-100'
                }`}
              >
                <CreditCard
                  className={`h-5 w-5 ${isRefund ? 'text-blue-600' : 'text-indigo-600'}`}
                />
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="mb-1 flex items-start justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {getTypeLabel(transaction.type)}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {transaction.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-lg font-bold ${
                        isRefund ? 'text-blue-600' : 'text-gray-900'
                      }`}
                    >
                      {isRefund && '+'}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex items-center gap-4 text-sm">
                  {/* Status Badge */}
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${statusConfig.color}`}
                  >
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>

                  {/* Payment Method */}
                  {transaction.method && (
                    <span className="text-gray-600">{transaction.method}</span>
                  )}

                  {/* Date */}
                  <span className="text-gray-500">
                    {formatDate(transaction.createdAt, 'DATETIME')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default PaymentHistory;
