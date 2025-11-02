/**
 * ================================================
 * USE WALLET DATA HOOK TESTS
 * ================================================
 * Unit tests for useWalletData hook
 *
 * Sprint 1 - Epic 1.1 - Day 1
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useWalletData } from '@/hooks/business/wallet/useWalletData';
import { walletApi } from '@/lib/api/wallet';

// Mock wallet API
jest.mock('@/lib/api/wallet');
jest.mock('@/lib/shared/utils/logger');

const mockWalletApi = walletApi as jest.Mocked<typeof walletApi>;

describe('useWalletData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch wallet data on mount', async () => {
    const mockWalletStats = {
      wallet: {
        id: '123',
        userId: 'user-1',
        balance: 1500,
        pendingBalance: 500,
        currency: 'TRY',
        status: 'ACTIVE',
        activeOrdersCount: 5,
      },
      balance: {
        availableBalance: 1500,
        pendingBalance: 500,
        totalEarnings: 5000,
        totalPayouts: 3000,
      },
    };

    const mockTransactions = [
      {
        id: 'tx-1',
        amount: 100,
        type: 'PAYMENT_RECEIVED',
        description: 'Payment received',
        createdAt: '2025-11-01T10:00:00Z',
      },
    ];

    mockWalletApi.getWalletStats.mockResolvedValue(mockWalletStats);
    mockWalletApi.getTransactions.mockResolvedValue(mockTransactions);

    const { result } = renderHook(() => useWalletData(false));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.wallet).toEqual(mockWalletStats.wallet);
    expect(result.current.balance).toEqual(mockWalletStats.balance);
    expect(result.current.transactions).toEqual(mockTransactions);
    expect(result.current.availableBalance).toBe(1500);
    expect(result.current.pendingBalance).toBe(500);
  });

  it('should handle errors gracefully', async () => {
    const error = new Error('Failed to fetch wallet data');
    mockWalletApi.getWalletStats.mockRejectedValue(error);

    const { result } = renderHook(() => useWalletData(false));

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });

    expect(result.current.error?.message).toBe('Failed to fetch wallet data');
  });

  it('should refresh data on demand', async () => {
    const mockWalletStats = {
      wallet: {
        id: '123',
        userId: 'user-1',
        balance: 1500,
        pendingBalance: 500,
        currency: 'TRY',
        status: 'ACTIVE',
        activeOrdersCount: 5,
      },
      balance: {
        availableBalance: 1500,
        pendingBalance: 500,
        totalEarnings: 5000,
        totalPayouts: 3000,
      },
    };

    mockWalletApi.getWalletStats.mockResolvedValue(mockWalletStats);
    mockWalletApi.getTransactions.mockResolvedValue([]);

    const { result } = renderHook(() => useWalletData(false));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Call refresh
    result.current.refresh();

    expect(result.current.isRefreshing).toBe(true);

    await waitFor(() => {
      expect(result.current.isRefreshing).toBe(false);
    });

    expect(mockWalletApi.getWalletStats).toHaveBeenCalledTimes(2);
  });
});
