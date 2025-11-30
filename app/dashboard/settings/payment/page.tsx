/**
 * ================================================
 * PAYMENT METHODS MANAGEMENT PAGE
 * ================================================
 * Modern payment methods management with real API
 * Production version (formerly V2)
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Production Ready
 */

'use client';

import { useState, useEffect } from 'react';
import {
  CreditCard,
  Building,
  Plus,
  Trash2,
  Star,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';
import {
  paymentMethodApi,
  PaymentMethodType,
  type PaymentMethod,
  type AddPaymentMethodRequest,
} from '@/lib/api/payment-method';
import {
  isValidCreditCard,
  isValidIBAN,
  getCreditCardType,
} from '@/lib/shared/utils/validation';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getPaymentMethodTypeName(type: PaymentMethodType): string {
  const typeNames = {
    [PaymentMethodType.CREDIT_CARD]: 'Kredi Kartı',
    [PaymentMethodType.DEBIT_CARD]: 'Banka Kartı',
    [PaymentMethodType.BANK_TRANSFER]: 'Banka Hesabı',
  };
  return typeNames[type] || type;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentMethodApi.getPaymentMethods();
      setPaymentMethods(data);
      logger.info('Payment methods loaded', { count: data.length });
    } catch (err) {
      setError('Ödeme yöntemleri yüklenemedi');
      logger.error(
        'Failed to load payment methods',
        err instanceof Error ? err : new Error(String(err))
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await paymentMethodApi.setPaymentMethodAsDefault(id);
      await loadPaymentMethods();
      logger.info('Default payment method set', { id });
    } catch (err) {
      logger.error(
        'Failed to set default payment method',
        err instanceof Error ? err : new Error(String(err)),
        { id }
      );
      setError('Varsayılan ödeme yöntemi ayarlanamadı');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ödeme yöntemini silmek istediğinize emin misiniz?'))
      return;

    try {
      await paymentMethodApi.deletePaymentMethod(id);
      await loadPaymentMethods();
      logger.info('Payment method deleted', { id });
    } catch (err) {
      logger.error(
        'Failed to delete payment method',
        err instanceof Error ? err : new Error(String(err)),
        { id }
      );
      setError('Ödeme yöntemi silinemedi');
    }
  };

  // ================================================
  // LOADING STATE
  // ================================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  // ================================================
  // MAIN RENDER
  // ================================================

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Ödeme Yöntemleri
        </h1>
        <p className="text-gray-600">
          Kredi kartlarınızı ve banka hesaplarınızı yönetin
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
          <p className="flex-1 text-red-800">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="mb-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
      >
        <Plus className="h-5 w-5" />
        Yeni Ödeme Yöntemi Ekle
      </button>

      {/* Payment Methods List */}
      <div className="space-y-4">
        {paymentMethods.length === 0 ? (
          <div className="rounded-lg bg-gray-50 py-12 text-center">
            <CreditCard className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Henüz ödeme yöntemi eklenmemiş
            </h3>
            <p className="mb-4 text-gray-600">
              Ödeme almak için bir ödeme yöntemi ekleyin
            </p>
          </div>
        ) : (
          paymentMethods.map((method) => (
            <PaymentMethodCard
              key={method.id}
              method={method}
              onSetDefault={handleSetDefault}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Add Payment Method Modal */}
      {showAddModal && (
        <AddPaymentMethodModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadPaymentMethods();
          }}
        />
      )}
    </div>
  );
}

// ============================================================================
// PAYMENT METHOD CARD COMPONENT
// ============================================================================

interface PaymentMethodCardProps {
  method: PaymentMethod;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
}

function PaymentMethodCard({
  method,
  onSetDefault,
  onDelete,
}: PaymentMethodCardProps) {
  const isCard =
    method.type === PaymentMethodType.CREDIT_CARD ||
    method.type === PaymentMethodType.DEBIT_CARD;
  const isBank = method.type === PaymentMethodType.BANK_TRANSFER;

  return (
    <div
      className={`rounded-lg border p-6 ${
        method.isDefault
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-1 items-start gap-4">
          {/* Icon */}
          <div
            className={`rounded-lg p-3 ${
              isCard ? 'bg-blue-100' : 'bg-green-100'
            }`}
          >
            {isCard ? (
              <CreditCard className="h-6 w-6 text-blue-600" />
            ) : (
              <Building className="h-6 w-6 text-green-600" />
            )}
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {method.nickname || getPaymentMethodTypeName(method.type)}
              </h3>
              {method.isDefault && (
                <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  <Star className="h-3 w-3 fill-current" />
                  Varsayılan
                </span>
              )}
              {method.isVerified && (
                <span title="Doğrulanmış">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </span>
              )}
            </div>

            {/* Masked Identifier */}
            <p className="mb-1 text-sm text-gray-600">
              {method.maskedIdentifier}
            </p>

            {/* Card Details */}
            {isCard && method.cardExpiryMonth && method.cardExpiryYear && (
              <p
                className={`text-sm ${
                  method.isExpired ? 'text-red-600' : 'text-gray-500'
                }`}
              >
                Son kullanma: {method.cardExpiryMonth}/{method.cardExpiryYear}
                {method.isExpired && ' (Süresi dolmuş)'}
              </p>
            )}

            {/* Bank Details */}
            {isBank && method.bankName && (
              <p className="text-sm text-gray-500">{method.bankName}</p>
            )}

            {/* Expired Warning */}
            {method.isExpired && (
              <div className="mt-2 inline-flex items-center gap-1 rounded bg-red-100 px-2 py-1 text-xs text-red-700">
                <AlertCircle className="h-3 w-3" />
                Kartın süresi dolmuş, lütfen güncelleyin
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!method.isDefault && (
            <button
              onClick={() => onSetDefault(method.id)}
              className="p-2 text-gray-400 transition-colors hover:text-blue-600"
              title="Varsayılan yap"
            >
              <Star className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => onDelete(method.id)}
            className="p-2 text-gray-400 transition-colors hover:text-red-600"
            title="Sil"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ADD PAYMENT METHOD MODAL
// ============================================================================

interface AddPaymentMethodModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function AddPaymentMethodModal({
  onClose,
  onSuccess,
}: AddPaymentMethodModalProps) {
  const [type, setType] = useState<'card' | 'bank'>('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const request: AddPaymentMethodRequest = {
        type:
          type === 'card'
            ? PaymentMethodType.CREDIT_CARD
            : PaymentMethodType.BANK_TRANSFER,
        nickname: (formData.get('nickname') as string) || undefined,
      };

      if (type === 'card') {
        const cardNumber = formData.get('cardNumber') as string;
        const cleanNumber = cardNumber.replace(/\D/g, '');

        // Validate card
        if (!isValidCreditCard(cleanNumber)) {
          throw new Error('Geçersiz kart numarası');
        }

        request.cardLastFour = cleanNumber.slice(-4);
        request.cardBrand = getCreditCardType(cleanNumber) || undefined;
        request.cardExpiryMonth = parseInt(
          formData.get('expiryMonth') as string
        );
        request.cardExpiryYear = parseInt(formData.get('expiryYear') as string);
        request.cardHolderName = formData.get('cardHolderName') as string;

        // Validate expiry
        if (
          !paymentMethodApi.validateCardExpiry(
            request.cardExpiryMonth!,
            request.cardExpiryYear!
          )
        ) {
          throw new Error('Kart süresi geçersiz veya dolmuş');
        }
      } else {
        const iban = (formData.get('iban') as string)
          .replace(/\s/g, '')
          .toUpperCase();

        // Validate IBAN
        if (!isValidIBAN(iban)) {
          throw new Error('Geçersiz IBAN');
        }

        request.bankName = formData.get('bankName') as string;
        request.iban = iban;
        request.accountHolderName = formData.get('accountHolderName') as string;
      }

      await paymentMethodApi.addPaymentMethod(request);
      logger.info('Payment method added', { type: request.type });
      onSuccess();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Ödeme yöntemi eklenemedi';
      setError(errorMessage);
      logger.error('Failed to add payment method', { error: err });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white">
        <div className="p-6">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Ödeme Yöntemi Ekle
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Type Tabs */}
          <div className="mb-6 flex gap-2">
            <button
              type="button"
              onClick={() => setType('card')}
              className={`flex-1 rounded-lg px-4 py-2 font-medium transition-colors ${
                type === 'card'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Kart
            </button>
            <button
              type="button"
              onClick={() => setType('bank')}
              className={`flex-1 rounded-lg px-4 py-2 font-medium transition-colors ${
                type === 'bank'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Banka Hesabı
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nickname */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Takma Ad (İsteğe bağlı)
              </label>
              <input
                type="text"
                name="nickname"
                maxLength={50}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Örn: İş kartım"
              />
            </div>

            {type === 'card' ? (
              <>
                {/* Card Number */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Kart Numarası <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cardNumber"
                    required
                    maxLength={19}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="1234 5678 9012 3456"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Luhn algoritması ile doğrulanacak
                  </p>
                </div>

                {/* Expiry */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Ay <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="expiryMonth"
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Ay</option>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                        <option key={m} value={m}>
                          {m.toString().padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Yıl <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="expiryYear"
                      required
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      <option value="">Yıl</option>
                      {Array.from(
                        { length: 20 },
                        (_, i) => new Date().getFullYear() + i
                      ).map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Kart Sahibi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="cardHolderName"
                    required
                    maxLength={100}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Kartın üzerindeki isim"
                  />
                </div>
              </>
            ) : (
              <>
                {/* Bank Name */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Banka Adı <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="bankName"
                    required
                    maxLength={100}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Örn: Ziraat Bankası"
                  />
                </div>

                {/* IBAN */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    IBAN <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="iban"
                    required
                    maxLength={34}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono uppercase focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="TR33 0006 1005 1978 6457 8413 26"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    TR ile başlamalı, toplam 26 karakter
                  </p>
                </div>

                {/* Account Holder */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Hesap Sahibi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="accountHolderName"
                    required
                    maxLength={100}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ad Soyad"
                  />
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Ekleniyor...' : 'Ekle'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
