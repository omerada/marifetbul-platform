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
} from 'lucide-react';
import {
  fetchAllPaymentMethods,
  addPaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  isCardExpired,
  getPaymentMethodTypeName,
  type PaymentMethod,
  type AddPaymentMethodRequest,
} from '@/lib/api/payment-methods';

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
      const data = await fetchAllPaymentMethods();
      setPaymentMethods(data);
      setError(null);
    } catch (err) {
      setError('Ödeme yöntemleri yüklenemedi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await setDefaultPaymentMethod(id);
      await loadPaymentMethods();
    } catch (err) {
      console.error('Failed to set default:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu ödeme yöntemini silmek istediğinize emin misiniz?'))
      return;

    try {
      await deletePaymentMethod(id);
      await loadPaymentMethods();
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

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
          <p className="text-red-800">{error}</p>
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
  const isCard = method.type === 'CREDIT_CARD' || method.type === 'DEBIT_CARD';
  const isBank = method.type === 'BANK_TRANSFER';
  const expired =
    isCard && isCardExpired(method.expiryMonth, method.expiryYear);

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
            <div className="mb-1 flex items-center gap-2">
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
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </div>

            {/* Card Details */}
            {isCard && (
              <>
                <p className="mb-1 text-sm text-gray-600">
                  {method.brand && `${method.brand} • `}
                  •••• {method.lastFour}
                </p>
                {method.expiryMonth && method.expiryYear && (
                  <p
                    className={`text-sm ${
                      expired ? 'text-red-600' : 'text-gray-500'
                    }`}
                  >
                    Son kullanma: {method.expiryMonth}/{method.expiryYear}
                    {expired && ' (Süresi dolmuş)'}
                  </p>
                )}
                {method.cardHolderName && (
                  <p className="text-sm text-gray-500">
                    {method.cardHolderName}
                  </p>
                )}
              </>
            )}

            {/* Bank Details */}
            {isBank && (
              <>
                {method.bankName && (
                  <p className="mb-1 text-sm text-gray-600">
                    {method.bankName}
                  </p>
                )}
                {method.iban && (
                  <p className="font-mono text-sm text-gray-500">
                    {method.iban.replace(/(.{4})/g, '$1 ').trim()}
                  </p>
                )}
                {method.accountHolderName && (
                  <p className="text-sm text-gray-500">
                    {method.accountHolderName}
                  </p>
                )}
              </>
            )}

            {/* Expired Warning */}
            {expired && (
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
        type: type === 'card' ? 'CREDIT_CARD' : 'BANK_TRANSFER',
        nickname: (formData.get('nickname') as string) || undefined,
      };

      if (type === 'card') {
        request.lastFour = formData.get('lastFour') as string;
        request.brand = formData.get('brand') as string;
        request.expiryMonth = parseInt(formData.get('expiryMonth') as string);
        request.expiryYear = parseInt(formData.get('expiryYear') as string);
        request.cardHolderName = formData.get('cardHolderName') as string;
      } else {
        request.bankName = formData.get('bankName') as string;
        request.iban = formData.get('iban') as string;
        request.accountHolderName = formData.get('accountHolderName') as string;
      }

      await addPaymentMethod(request);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ödeme yöntemi eklenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white">
        <div className="p-6">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Ödeme Yöntemi Ekle
          </h2>

          {/* Type Tabs */}
          <div className="mb-6 flex gap-2">
            <button
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

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nickname */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Takma Ad (İsteğe bağlı)
              </label>
              <input
                type="text"
                name="nickname"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="Örn: İş kartım"
              />
            </div>

            {type === 'card' ? (
              <>
                {/* Card Brand */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Kart Markası <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="brand"
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seçiniz</option>
                    <option value="VISA">Visa</option>
                    <option value="MASTERCARD">Mastercard</option>
                    <option value="AMEX">American Express</option>
                    <option value="OTHER">Diğer</option>
                  </select>
                </div>

                {/* Last Four */}
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Son 4 Rakam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastFour"
                    required
                    pattern="\d{4}"
                    maxLength={4}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="1234"
                  />
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
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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
                    pattern="^[A-Z]{2}\d{2}[A-Z0-9]+$"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono focus:border-transparent focus:ring-2 focus:ring-blue-500"
                    placeholder="TR330006100519786457841326"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Boşluksuz ve büyük harflerle giriniz
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
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
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
