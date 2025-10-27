/**
 * ================================================
 * PAYMENT METHOD HOOK
 * ================================================
 * React hook for managing payment methods (cards & bank accounts)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { useState, useEffect, useCallback } from 'react';
import {
  paymentMethodApi,
  type PaymentMethod,
  type AddPaymentMethodRequest,
  type UpdatePaymentMethodRequest,
} from '@/lib/api/payment-method';
import { useToast } from '@/hooks';

// ============================================================================
// TYPES
// ============================================================================

interface UsePaymentMethodsOptions {
  autoLoad?: boolean;
  filterType?: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER';
}

export interface UsePaymentMethodsReturn {
  // State
  paymentMethods: PaymentMethod[];
  bankAccounts: PaymentMethod[];
  defaultPaymentMethod: PaymentMethod | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  load: () => Promise<void>;
  add: (data: AddPaymentMethodRequest) => Promise<PaymentMethod>;
  update: (
    id: string,
    data: UpdatePaymentMethodRequest
  ) => Promise<PaymentMethod>;
  remove: (id: string) => Promise<void>;
  setAsDefault: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

// Alias for bank accounts hook
export type UseBankAccountsReturn = UsePaymentMethodsReturn;

// ============================================================================
// HOOK
// ============================================================================

export function usePaymentMethods(
  options: UsePaymentMethodsOptions = {}
): UsePaymentMethodsReturn {
  const { autoLoad = true, filterType } = options;
  const { success: showSuccess, error: showError } = useToast();

  // State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Computed values
  const bankAccounts = paymentMethods.filter(
    (pm) => pm.type === 'BANK_TRANSFER'
  );
  const defaultPaymentMethod =
    paymentMethods.find((pm) => pm.isDefault) || null;

  // Load payment methods
  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const methods = await paymentMethodApi.getPaymentMethods();

      // Apply filter if specified
      const filteredMethods = filterType
        ? methods.filter((m) => m.type === filterType)
        : methods;

      setPaymentMethods(filteredMethods);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Ödeme yöntemleri yüklenemedi';
      setError(errorMsg);
      console.error('Failed to load payment methods:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filterType]);

  // Add payment method
  const add = useCallback(
    async (data: AddPaymentMethodRequest): Promise<PaymentMethod> => {
      setIsLoading(true);
      setError(null);

      try {
        const newMethod = await paymentMethodApi.addPaymentMethod(data);
        setPaymentMethods((prev) => [newMethod, ...prev]);

        showSuccess(
          data.type === 'BANK_TRANSFER'
            ? 'Banka hesabı eklendi'
            : 'Ödeme yöntemi eklendi'
        );

        return newMethod;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Ödeme yöntemi eklenemedi';
        setError(errorMsg);
        showError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [showSuccess, showError]
  );

  // Update payment method
  const update = useCallback(
    async (
      id: string,
      data: UpdatePaymentMethodRequest
    ): Promise<PaymentMethod> => {
      setIsLoading(true);
      setError(null);

      try {
        const updatedMethod = await paymentMethodApi.updatePaymentMethod(
          id,
          data
        );

        setPaymentMethods((prev) =>
          prev.map((pm) => (pm.id === id ? updatedMethod : pm))
        );

        showSuccess('Ödeme yöntemi güncellendi');

        return updatedMethod;
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Ödeme yöntemi güncellenemedi';
        setError(errorMsg);
        showError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [showSuccess, showError]
  );

  // Remove payment method
  const remove = useCallback(
    async (id: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await paymentMethodApi.deletePaymentMethod(id);
        setPaymentMethods((prev) => prev.filter((pm) => pm.id !== id));
        showSuccess('Ödeme yöntemi silindi');
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Ödeme yöntemi silinemedi';
        setError(errorMsg);
        showError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [showSuccess, showError]
  );

  // Set as default
  const setAsDefault = useCallback(
    async (id: string): Promise<void> => {
      setIsLoading(true);
      setError(null);

      try {
        await paymentMethodApi.setPaymentMethodAsDefault(id);

        // Update local state: unset all defaults, then set new default
        setPaymentMethods((prev) =>
          prev.map((pm) => ({
            ...pm,
            isDefault: pm.id === id,
          }))
        );

        showSuccess('Varsayılan ödeme yöntemi güncellendi');
      } catch (err) {
        const errorMsg =
          err instanceof Error
            ? err.message
            : 'Varsayılan ödeme yöntemi ayarlanamadı';
        setError(errorMsg);
        showError(errorMsg);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [showSuccess, showError]
  );

  // Refresh
  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad) {
      load();
    }
  }, [autoLoad, load]);

  return {
    // State
    paymentMethods,
    bankAccounts,
    defaultPaymentMethod,
    isLoading,
    error,

    // Actions
    load,
    add,
    update,
    remove,
    setAsDefault,
    refresh,
  };
}

// ============================================================================
// BANK ACCOUNTS SPECIFIC HOOK
// ============================================================================

export function useBankAccounts() {
  return usePaymentMethods({ filterType: 'BANK_TRANSFER' });
}

export default usePaymentMethods;
