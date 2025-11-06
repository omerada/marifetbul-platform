/**
 * ================================================
 * USE BANK ACCOUNTS HOOK
 * ================================================
 * Manage user's bank accounts for payouts
 *
 * Sprint 1 - Story 2.2: Frontend Integration
 *
 * Features:
 * - Fetch user's bank accounts
 * - Add new bank account
 * - Set default account
 * - Remove account
 * - Real-time updates with SWR
 *
 * @version 1.0.0
 * @since Sprint 1
 */

import { useState } from 'react';
import useSWR from 'swr';
import { apiClient } from '@/lib/infrastructure/api/client/apiClient';
import type { ApiResponse } from '@/lib/infrastructure/api/types';
import { toast } from 'sonner';

/**
 * Bank account status enum
 */
export type BankAccountStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

/**
 * Bank account interface
 */
export interface BankAccount {
  id: string;
  userId: string;
  iban: string;
  bankCode: string;
  bankName: string;
  accountHolder: string;
  isDefault: boolean;
  status: BankAccountStatus;
  verifiedAt?: string;
  rejectionReason?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Add bank account request
 */
export interface AddBankAccountRequest {
  iban: string;
  accountHolder: string;
  setAsDefault?: boolean;
}

/**
 * Hook return type
 */
export interface UseBankAccountsReturn {
  accounts: BankAccount[];
  verifiedAccounts: BankAccount[];
  defaultAccount: BankAccount | null;
  isLoading: boolean;
  error: Error | null;
  addAccount: (data: AddBankAccountRequest) => Promise<BankAccount>;
  setDefault: (accountId: string) => Promise<BankAccount>;
  removeAccount: (accountId: string) => Promise<void>;
  refresh: () => void;
  isAdding: boolean;
  isUpdating: boolean;
}

/**
 * Fetch user's bank accounts
 */
async function fetchBankAccounts(): Promise<BankAccount[]> {
  const response =
    await apiClient.get<ApiResponse<BankAccount[]>>('/bank-accounts');

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Failed to fetch bank accounts');
  }

  return response.data;
}

/**
 * Hook to manage user's bank accounts
 *
 * @example
 * ```tsx
 * function BankAccountManager() {
 *   const {
 *     accounts,
 *     verifiedAccounts,
 *     defaultAccount,
 *     isLoading,
 *     addAccount,
 *     setDefault,
 *     removeAccount
 *   } = useBankAccounts();
 *
 *   const handleAdd = async () => {
 *     await addAccount({
 *       iban: 'TR330006100519786457841326',
 *       accountHolder: 'Ahmet Yılmaz'
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       {accounts.map(account => (
 *         <BankAccountCard
 *           key={account.id}
 *           account={account}
 *           onSetDefault={() => setDefault(account.id)}
 *           onRemove={() => removeAccount(account.id)}
 *         />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBankAccounts(): UseBankAccountsReturn {
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch accounts with SWR
  const { data, error, isLoading, mutate } = useSWR<BankAccount[]>(
    '/bank-accounts',
    fetchBankAccounts,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      onError: (err) => {
        console.error('Failed to fetch bank accounts:', err);
        toast.error('Hata', {
          description: 'Banka hesapları yüklenemedi',
        });
      },
    }
  );

  const accounts = data ?? [];

  // Get verified accounts
  const verifiedAccounts = accounts.filter(
    (account) => account.status === 'VERIFIED' && !account.isArchived
  );

  // Get default account
  const defaultAccount =
    accounts.find((account) => account.isDefault && !account.isArchived) ??
    null;

  /**
   * Add new bank account
   */
  const addAccount = async (
    data: AddBankAccountRequest
  ): Promise<BankAccount> => {
    setIsAdding(true);
    try {
      const response = await apiClient.post<ApiResponse<BankAccount>>(
        '/bank-accounts',
        data
      );

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to add bank account');
      }

      // Refresh accounts list
      await mutate();

      toast.success('Başarılı', {
        description: 'Banka hesabı eklendi. Doğrulama için lütfen bekleyin.',
      });

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Banka hesabı eklenemedi';
      toast.error('Hata', { description: message });
      throw error;
    } finally {
      setIsAdding(false);
    }
  };

  /**
   * Set account as default
   */
  const setDefault = async (accountId: string): Promise<BankAccount> => {
    setIsUpdating(true);
    try {
      const response = await apiClient.put<ApiResponse<BankAccount>>(
        `/bank-accounts/${accountId}/default`,
        {}
      );

      if (!response.success || !response.data) {
        throw new Error(
          response.message || 'Failed to set default bank account'
        );
      }

      // Refresh accounts list
      await mutate();

      toast.success('Başarılı', {
        description: 'Varsayılan hesap değiştirildi',
      });

      return response.data;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Varsayılan hesap değiştirilemedi';
      toast.error('Hata', { description: message });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Remove (archive) bank account
   */
  const removeAccount = async (accountId: string): Promise<void> => {
    setIsUpdating(true);
    try {
      const response = await apiClient.delete<ApiResponse<void>>(
        `/bank-accounts/${accountId}`
      );

      if (!response.success) {
        throw new Error(response.message || 'Failed to remove bank account');
      }

      // Refresh accounts list
      await mutate();

      toast.success('Başarılı', {
        description: 'Banka hesabı kaldırıldı',
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Banka hesabı kaldırılamadı';
      toast.error('Hata', { description: message });
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    accounts,
    verifiedAccounts,
    defaultAccount,
    isLoading,
    error: error ?? null,
    addAccount,
    setDefault,
    removeAccount,
    refresh: mutate,
    isAdding,
    isUpdating,
  };
}

export default useBankAccounts;
