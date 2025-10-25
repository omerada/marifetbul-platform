/**
 * ================================================
 * REFUND REQUEST MODAL
 * ================================================
 * Modal for requesting payment refunds
 *
 * Features:
 * - Full or partial refund selection
 * - Amount calculator
 * - Reason input
 * - Refund policy display
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState } from 'react';
import { X, AlertCircle, DollarSign } from 'lucide-react';
import { useRefund } from '@/hooks/business/payment';

interface RefundRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentId: string;
  orderId: string;
  orderTitle: string;
  totalAmount: number;
  currency: string;
  onSuccess?: () => void;
}

export function RefundRequestModal({
  isOpen,
  onClose,
  paymentId,
  orderTitle,
  totalAmount,
  currency,
  onSuccess,
}: RefundRequestModalProps) {
  const [refundType, setRefundType] = useState<'FULL' | 'PARTIAL'>('FULL');
  const [partialAmount, setPartialAmount] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; reason?: string }>(
    {}
  );

  const { requestRefund, isRefunding, error, clearError } = useRefund();

  // Handle refund type change
  const handleTypeChange = (type: 'FULL' | 'PARTIAL') => {
    setRefundType(type);
    setPartialAmount('');
    setErrors({});
    clearError();
  };

  // Handle amount change
  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const sanitized = value.replace(/[^0-9.]/g, '');
    setPartialAmount(sanitized);
    setErrors((prev) => ({ ...prev, amount: undefined }));
  };

  // Validate form
  const validate = () => {
    const newErrors: { amount?: string; reason?: string } = {};

    if (refundType === 'PARTIAL') {
      const amount = parseFloat(partialAmount);
      if (!partialAmount || isNaN(amount)) {
        newErrors.amount = 'Geçerli bir tutar girin';
      } else if (amount <= 0) {
        newErrors.amount = "Tutar 0'dan büyük olmalıdır";
      } else if (amount > totalAmount) {
        newErrors.amount = 'Tutar toplam tutardan büyük olamaz';
      }
    }

    if (!reason.trim()) {
      newErrors.reason = 'İade nedeni zorunludur';
    } else if (reason.trim().length < 10) {
      newErrors.reason = 'İade nedeni en az 10 karakter olmalıdır';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const amount =
      refundType === 'PARTIAL' ? parseFloat(partialAmount) : undefined;
    const success = await requestRefund(paymentId, amount, reason.trim());

    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  // Handle close
  const handleClose = () => {
    if (!isRefunding) {
      setRefundType('FULL');
      setPartialAmount('');
      setReason('');
      setErrors({});
      clearError();
      onClose();
    }
  };

  if (!isOpen) return null;

  const currencySymbol = currency === 'TRY' ? '₺' : currency;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">İade Talebi</h2>
            <p className="mt-1 text-sm text-gray-600">{orderTitle}</p>
          </div>
          <button
            onClick={handleClose}
            disabled={isRefunding}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Amount Info */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-1 text-sm text-gray-600">
              Toplam Sipariş Tutarı
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {currencySymbol}
              {totalAmount.toFixed(2)}
            </div>
          </div>

          {/* Refund Type */}
          <div className="mb-6">
            <label className="mb-3 block text-sm font-medium text-gray-900">
              İade Türü
              <span className="ml-1 text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleTypeChange('FULL')}
                className={`rounded-lg border-2 p-4 text-left transition-colors ${
                  refundType === 'FULL'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="mb-1 font-semibold text-gray-900">Tam İade</div>
                <div className="text-sm text-gray-600">
                  Tüm tutar iade edilecek
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('PARTIAL')}
                className={`rounded-lg border-2 p-4 text-left transition-colors ${
                  refundType === 'PARTIAL'
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="mb-1 font-semibold text-gray-900">
                  Kısmi İade
                </div>
                <div className="text-sm text-gray-600">
                  Belirli bir tutar iade edilecek
                </div>
              </button>
            </div>
          </div>

          {/* Partial Amount */}
          {refundType === 'PARTIAL' && (
            <div className="mb-6">
              <label
                htmlFor="amount"
                className="mb-2 block text-sm font-medium text-gray-900"
              >
                İade Tutarı
                <span className="ml-1 text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="amount"
                  value={partialAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  className={`w-full rounded-lg border py-3 pr-4 pl-10 focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                    errors.amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isRefunding}
                />
              </div>
              {errors.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.amount}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">
                Maksimum: {currencySymbol}
                {totalAmount.toFixed(2)}
              </p>
            </div>
          )}

          {/* Reason */}
          <div className="mb-6">
            <label
              htmlFor="reason"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              İade Nedeni
              <span className="ml-1 text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setErrors((prev) => ({ ...prev, reason: undefined }));
              }}
              placeholder="İade talebinizin nedenini detaylı olarak açıklayın..."
              rows={4}
              className={`w-full resize-none rounded-lg border px-4 py-3 focus:border-transparent focus:ring-2 focus:ring-indigo-500 ${
                errors.reason ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={isRefunding}
            />
            {errors.reason && (
              <p className="mt-1 text-sm text-red-600">{errors.reason}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {reason.length}/500 karakter
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                <div className="flex-1">
                  <h4 className="font-semibold text-red-800">Hata</h4>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Refund Policy */}
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <div className="text-sm text-blue-800">
                <p className="mb-2 font-semibold">İade Politikası</p>
                <ul className="list-inside list-disc space-y-1">
                  <li>
                    İade talebi incelendikten sonra 3-5 iş günü içinde işleme
                    alınır
                  </li>
                  <li>
                    Onaylanan iadeler 7-14 iş günü içinde hesabınıza geçer
                  </li>
                  <li>Platform ücreti (%15) iade edilmez</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={isRefunding}
              className="flex-1 rounded-lg border-2 border-gray-300 px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isRefunding}
              className="flex-1 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRefunding ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="mr-2 h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Gönderiliyor...
                </span>
              ) : (
                'İade Talebi Gönder'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RefundRequestModal;
