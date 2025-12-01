/**
 * ================================================
 * USE WALLET CONFIG HOOK
 * ================================================
 * Fetches wallet configuration from backend
 *
 * Sprint 1 - Story 2.2: Frontend Integration
 *
 * Features:
 * - Fetch payout limits (min/max amounts)
 * - Fetch fee configuration
 * - Fetch wallet limits
 * - SWR caching with 5min revalidation
 *
 * @version 1.0.0
 * @since Sprint 1
 */

import useSWR from 'swr';
import { apiClient } from '@/lib/infrastructure/api/client/apiClient';
import type { ApiResponse } from '@/types/backend-aligned';

/**
 * Wallet configuration response from backend
 */
export interface WalletConfig {
  payout: {
    minAmount: number;
    maxAmount: number;
    dailyLimit: number;
    monthlyCountLimit: number;
    processingTimeHours: number;
    autoProcessEnabled: boolean;
  };
  fees: {
    transactionFeePercentage: number;
    fixedTransactionFee: number;
    instantPayoutFeePercentage: number;
  };
  limits: {
    maxBalance: number;
    minBalance: number;
  };
  currency: string;
}

/**
 * Hook return type
 */
export interface UseWalletConfigReturn {
  config: WalletConfig | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Default configuration (fallback if API fails)
 */
const DEFAULT_CONFIG: WalletConfig = {
  payout: {
    minAmount: 50,
    maxAmount: 10000,
    dailyLimit: 20000,
    monthlyCountLimit: 10,
    processingTimeHours: 24,
    autoProcessEnabled: false,
  },
  fees: {
    transactionFeePercentage: 0,
    fixedTransactionFee: 0,
    instantPayoutFeePercentage: 1,
  },
  limits: {
    maxBalance: 100000,
    minBalance: 0,
  },
  currency: 'TRY',
};

/**
 * Fetch wallet configuration from backend
 */
async function fetchWalletConfig(): Promise<WalletConfig> {
  const response =
    await apiClient.get<ApiResponse<WalletConfig>>('/config/wallet');

  if (!response.success || !response.data) {
    console.warn('Failed to fetch wallet config, using defaults');
    return DEFAULT_CONFIG;
  }

  return response.data;
}

/**
 * Hook to fetch wallet configuration
 *
 * @example
 * ```tsx
 * function WalletComponent() {
 *   const { config, isLoading, error } = useWalletConfig();
 *
 *   if (isLoading) return <Loading />;
 *   if (error) return <Error />;
 *
 *   return (
 *     <div>
 *       Min payout: {config.payout.minAmount} TRY
 *       Max payout: {config.payout.maxAmount} TRY
 *     </div>
 *   );
 * }
 * ```
 */
export function useWalletConfig(): UseWalletConfigReturn {
  const { data, error, isLoading, mutate } = useSWR<WalletConfig>(
    '/wallet-config',
    fetchWalletConfig,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      fallbackData: DEFAULT_CONFIG, // Use defaults while loading
      onError: (err) => {
        console.error('Failed to fetch wallet config:', err);
      },
    }
  );

  return {
    config: data ?? DEFAULT_CONFIG,
    isLoading,
    error: error ?? null,
    mutate,
  };
}

export default useWalletConfig;
