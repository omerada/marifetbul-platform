'use client';

import useSWR from 'swr';
import { useState } from 'react';
import {
  getBankAccounts,
  getVerifiedBankAccounts,
  getDefaultBankAccount,
  addBankAccount,
  setDefaultBankAccount,
  removeBankAccount,
  type BankAccountResponse,
  type AddBankAccountRequest,
} from '@/lib/api/bank-accounts';

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to fetch all bank accounts for the current user
 */
export function useBankAccounts() {
  return useSWR<BankAccountResponse[]>(
    '/api/wallet/bank-accounts',
    () => getBankAccounts(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );
}

/**
 * Hook to fetch only verified bank accounts
 */
export function useVerifiedBankAccounts() {
  return useSWR<BankAccountResponse[]>(
    '/api/wallet/bank-accounts/verified',
    () => getVerifiedBankAccounts(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );
}

/**
 * Hook to fetch the default bank account
 */
export function useDefaultBankAccount() {
  return useSWR<BankAccountResponse | null>(
    '/api/wallet/bank-accounts/default',
    () => getDefaultBankAccount(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );
}

/**
 * Hook to manage bank account operations (add, set default, remove)
 */
export function useBankAccountMutations() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addBankAccountMutation = async (request: AddBankAccountRequest) => {
    setIsLoading(true);
    setError(null);

    try {
      return await addBankAccount(request);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const setDefaultBankAccountMutation = async (accountId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      return await setDefaultBankAccount(accountId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeBankAccountMutation = async (accountId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await removeBankAccount(accountId);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addBankAccount: addBankAccountMutation,
    setDefaultBankAccount: setDefaultBankAccountMutation,
    removeBankAccount: removeBankAccountMutation,
    isLoading,
    error,
    clearError: () => setError(null),
  };
}
