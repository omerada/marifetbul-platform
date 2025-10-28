/**
 * ================================================
 * BANK ACCOUNT MANAGEMENT COMPONENT
 * ================================================
 * CRUD operations for managing bank accounts
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Check,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { logger } from '@/lib/shared/utils/logger';
import paymentMethodApi, { type PaymentMethod } from '@/lib/api/payment-method';

// ================================================
// TYPES
// ================================================

interface AddBankAccountRequest {
  bankName: string;
  iban: string;
  accountHolderName: string;
}

// ================================================
// MAIN COMPONENT
// ================================================

export function BankAccountManagement() {
  const [bankAccounts, setBankAccounts] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async () => {
    try {
      setLoading(true);
      const data = await paymentMethodApi.getBankAccounts();
      setBankAccounts(data);
      setError(null);
    } catch (err) {
      setError('Banka hesapları yüklenemedi');
      logger.error('Failed to load bank accounts', { error: err });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await paymentMethodApi.setPaymentMethodAsDefault(id);
      await loadBankAccounts();
    } catch (err) {
      logger.error('Failed to set default bank account', { id, error: err });
      setError('Varsayılan hesap ayarlanamadı');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu banka hesabını silmek istediğinize emin misiniz?')) return;

    try {
      await paymentMethodApi.deletePaymentMethod(id);
      await loadBankAccounts();
    } catch (err) {
      logger.error('Failed to delete bank account', { id, error: err });
      setError('Banka hesabı silinemedi');
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
          Banka Hesapları
        </h1>
        <p className="text-gray-600">
          Para çekmek için banka hesaplarınızı ekleyin ve yönetin
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
        Yeni Banka Hesabı Ekle
      </button>

      {/* Bank Accounts List */}
      <div className="space-y-4">
        {bankAccounts.length === 0 ? (
          <div className="rounded-lg bg-gray-50 py-12 text-center">
            <Building2 className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              Henüz banka hesabı eklenmemiş
            </h3>
            <p className="mb-4 text-gray-600">
              Para çekebilmek için bir banka hesabı eklemelisiniz
            </p>
          </div>
        ) : (
          bankAccounts.map((account) => (
            <BankAccountCard
              key={account.id}
              account={account}
              onSetDefault={handleSetDefault}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Add Bank Account Modal */}
      {showAddModal && (
        <AddBankAccountModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadBankAccounts();
          }}
        />
      )}
    </div>
  );
}

// ================================================
// BANK ACCOUNT CARD COMPONENT
// ================================================

interface BankAccountCardProps {
  account: PaymentMethod;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
}

function BankAccountCard({
  account,
  onSetDefault,
  onDelete,
}: BankAccountCardProps) {
  return (
    <div
      className={`rounded-lg border p-6 ${
        account.isDefault
          ? 'border-blue-500 bg-blue-50'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-1 items-start gap-4">
          {/* Icon */}
          <div className="rounded-lg bg-green-100 p-3">
            <Building2 className="h-6 w-6 text-green-600" />
          </div>

          {/* Details */}
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">
                {account.bankName}
              </h3>
              {account.isDefault && (
                <span className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  <Check className="h-3 w-3" />
                  Varsayılan
                </span>
              )}
              {account.isVerified && (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
            </div>

            <p className="mb-1 font-mono text-sm text-gray-600">
              {account.maskedIdentifier || account.accountLastFour || 'N/A'}
            </p>
            <p className="text-sm text-gray-500">
              {account.nickname || account.bankName || 'Hesap Sahibi'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!account.isDefault && (
            <button
              onClick={() => onSetDefault(account.id)}
              className="p-2 text-gray-400 transition-colors hover:text-blue-600"
              title="Varsayılan yap"
            >
              <Check className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => onDelete(account.id)}
            className="p-2 text-gray-400 transition-colors hover:text-red-600"
            title="Sil"
            disabled={account.isDefault}
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ================================================
// ADD BANK ACCOUNT MODAL
// ================================================

interface AddBankAccountModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

function AddBankAccountModal({ onClose, onSuccess }: AddBankAccountModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const request: AddBankAccountRequest = {
        bankName: formData.get('bankName') as string,
        iban: (formData.get('iban') as string).replace(/\s/g, ''),
        accountHolderName: formData.get('accountHolderName') as string,
      };

      await paymentMethodApi.addBankAccount(request);
      logger.info('Bank account added', request);

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Banka hesabı eklenemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Banka Hesabı Ekle
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 transition-colors hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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
                pattern="^TR[0-9]{2}[0-9]{4}[0-9]{1}[0-9]{16}$"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono focus:border-transparent focus:ring-2 focus:ring-blue-500"
                placeholder="TR00 0000 0000 0000 0000 0000 00"
              />
              <p className="mt-1 text-xs text-gray-500">
                TR ile başlayan 26 haneli IBAN numaranızı giriniz
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
              <p className="mt-1 text-xs text-gray-500">
                Hesap sahibinin adı kimlik bilgilerinizle eşleşmelidir
              </p>
            </div>

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

export default BankAccountManagement;
