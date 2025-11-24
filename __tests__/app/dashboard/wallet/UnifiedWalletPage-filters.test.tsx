/**
 * ================================================
 * UNIFIED WALLET PAGE - TRANSACTION FILTERS TEST
 * ================================================
 * Test suite for transaction filtering in UnifiedWalletPage
 * Coverage: Filter integration, URL sync, filtered results
 *
 * Sprint 1 - Story 1.2: Transaction Filtering Standardization
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import { UnifiedWalletPage } from '@/app/dashboard/wallet/UnifiedWalletPage';
import { useWalletData } from '@/hooks/business/wallet/useWalletData';
import { usePayouts } from '@/hooks/business/wallet/usePayouts';
import { useBankAccounts } from '@/hooks/business/wallet/useBankAccounts';
import { useEscrowDetails } from '@/hooks/business/wallet/useEscrowDetails';
import { TransactionType } from '@/types/business/features/wallet';
import type { Transaction } from '@/types/business/features/wallet';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

jest.mock('@/hooks/business/wallet/useWalletData');
jest.mock('@/hooks/business/wallet/usePayouts');
jest.mock('@/hooks/business/wallet/useBankAccounts');
jest.mock('@/hooks/business/wallet/useEscrowDetails');
jest.mock('@/hooks/core/useToast', () => ({
  useToast: () => ({
    success: jest.fn(),
    toast: jest.fn(),
  }),
}));

const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
};

const mockSearchParams = new URLSearchParams();

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    walletId: 'wallet-1',
    type: TransactionType.CREDIT,
    amount: 500,
    balanceBefore: 0,
    balanceAfter: 500,
    description: 'Payment received',
    createdAt: '2025-01-15T10:00:00Z',
  },
  {
    id: '2',
    walletId: 'wallet-1',
    type: TransactionType.DEBIT,
    amount: -100,
    balanceBefore: 500,
    balanceAfter: 400,
    description: 'Commission fee',
    createdAt: '2025-01-20T14:30:00Z',
  },
  {
    id: '3',
    walletId: 'wallet-1',
    type: TransactionType.PAYOUT,
    amount: -200,
    balanceBefore: 400,
    balanceAfter: 200,
    description: 'Withdrawal request',
    createdAt: '2024-12-10T09:00:00Z',
  },
  {
    id: '4',
    walletId: 'wallet-1',
    type: TransactionType.CREDIT,
    amount: 1500,
    balanceBefore: 200,
    balanceAfter: 1700,
    description: 'Large payment',
    createdAt: '2024-11-05T16:45:00Z',
  },
];

// ============================================================================
// TEST SUITE
// ============================================================================

describe('UnifiedWalletPage - Transaction Filtering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);

    // Mock wallet data hook
    (useWalletData as jest.Mock).mockReturnValue({
      wallet: {
        totalBalance: 1700,
        pendingBalance: 0,
      },
      transactions: mockTransactions,
      isLoading: false,
      refresh: jest.fn(),
      availableBalance: 1700,
    });

    // Mock payouts hook
    (usePayouts as jest.Mock).mockReturnValue({
      payouts: [],
      limits: {
        minimumAmount: 50,
        maximumAmount: 10000,
        dailyLimit: 5000,
        monthlyLimit: 50000,
      },
      eligibility: {
        eligible: true,
        reason: '',
        availableBalance: 1700,
        pendingPayouts: 0,
      },
      isLoading: false,
    });

    // Mock bank accounts hook
    (useBankAccounts as jest.Mock).mockReturnValue({
      refresh: jest.fn(),
    });

    // Mock escrow hook
    (useEscrowDetails as jest.Mock).mockReturnValue({
      escrowDetails: [],
      totalEscrow: 0,
      isLoading: false,
    });
  });

  const navigateToTransactionsTab = async (
    user: ReturnType<typeof userEvent.setup>
  ) => {
    const transactionsTab = screen.getByRole('tab', { name: /İşlemler/i });
    await user.click(transactionsTab);
  };

  // ==========================================================================
  // FILTER INTEGRATION TESTS
  // ==========================================================================

  describe('Filter Integration', () => {
    it('should render UnifiedTransactionFilters in transactions tab', async () => {
      const user = userEvent.setup();
      render(<UnifiedWalletPage />);

      await navigateToTransactionsTab(user);

      expect(screen.getByText('Filtreler')).toBeInTheDocument();
    });

    it('should display all transactions by default', async () => {
      const user = userEvent.setup();
      render(<UnifiedWalletPage />);

      await navigateToTransactionsTab(user);

      // Wait for transactions to render
      await waitFor(() => {
        expect(screen.getByText('4 / 4 işlem')).toBeInTheDocument();
      });
    });

    it('should filter by transaction type (CREDIT)', async () => {
      const user = userEvent.setup();
      render(<UnifiedWalletPage />);

      await navigateToTransactionsTab(user);

      // Expand filters
      const showButton = screen.getByRole('button', { name: /Göster/i });
      await user.click(showButton);

      // Select CREDIT type
      const typeSelect = screen.getByLabelText('İşlem Tipi');
      await user.selectOptions(typeSelect, TransactionType.CREDIT);

      // Should show only 2 CREDIT transactions
      await waitFor(() => {
        expect(screen.getByText('2 / 4 işlem')).toBeInTheDocument();
      });
    });

    it('should filter by date range', async () => {
      const user = userEvent.setup();
      render(<UnifiedWalletPage />);

      await navigateToTransactionsTab(user);

      // Expand filters
      const showButton = screen.getByRole('button', { name: /Göster/i });
      await user.click(showButton);

      // Set date range to January 2025
      const startDateInput = screen.getByLabelText('Başlangıç Tarihi');
      const endDateInput = screen.getByLabelText('Bitiş Tarihi');

      await user.type(startDateInput, '2025-01-01');
      await user.type(endDateInput, '2025-01-31');

      // Should show only transactions from January 2025 (2 transactions)
      await waitFor(() => {
        expect(screen.getByText('2 / 4 işlem')).toBeInTheDocument();
      });
    });

    it('should filter by amount range', async () => {
      const user = userEvent.setup();
      render(<UnifiedWalletPage />);

      await navigateToTransactionsTab(user);

      // Expand filters
      const showButton = screen.getByRole('button', { name: /Göster/i });
      await user.click(showButton);

      // Set amount range 200-600
      const minAmountInput = screen.getByLabelText('Minimum Tutar (₺)');
      const maxAmountInput = screen.getByLabelText('Maksimum Tutar (₺)');

      await user.type(minAmountInput, '200');
      await user.type(maxAmountInput, '600');

      // Should show 2 transactions (500 and 200)
      await waitFor(() => {
        expect(screen.getByText('2 / 4 işlem')).toBeInTheDocument();
      });
    });

    it('should combine multiple filters', async () => {
      const user = userEvent.setup();
      render(<UnifiedWalletPage />);

      await navigateToTransactionsTab(user);

      // Expand filters
      const showButton = screen.getByRole('button', { name: /Göster/i });
      await user.click(showButton);

      // Filter: CREDIT type + January 2025 + amount >= 100
      const typeSelect = screen.getByLabelText('İşlem Tipi');
      await user.selectOptions(typeSelect, TransactionType.CREDIT);

      const startDateInput = screen.getByLabelText('Başlangıç Tarihi');
      await user.type(startDateInput, '2025-01-01');

      const minAmountInput = screen.getByLabelText('Minimum Tutar (₺)');
      await user.type(minAmountInput, '100');

      // Should show only 1 transaction (CREDIT, 500, Jan 2025)
      await waitFor(() => {
        expect(screen.getByText('1 / 4 işlem')).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // PRESET FILTERS TESTS
  // ==========================================================================

  describe('Preset Filters', () => {
    it('should apply "Bu Ay" preset filter', async () => {
      const user = userEvent.setup();
      render(<UnifiedWalletPage />);

      await navigateToTransactionsTab(user);

      // Expand filters
      const showButton = screen.getByRole('button', { name: /Göster/i });
      await user.click(showButton);

      // Click "Bu Ay" preset
      const thisMonthButton = screen.getByRole('button', { name: 'Bu Ay' });
      await user.click(thisMonthButton);

      // Should filter to current month (January 2025 in mock date)
      await waitFor(() => {
        expect(
          screen.getByText(/2 \/ 4 işlem|4 \/ 4 işlem/)
        ).toBeInTheDocument();
      });
    });

    it('should apply "Geçen Ay" preset filter', async () => {
      const user = userEvent.setup();
      render(<UnifiedWalletPage />);

      await navigateToTransactionsTab(user);

      // Expand filters
      const showButton = screen.getByRole('button', { name: /Göster/i });
      await user.click(showButton);

      // Click "Geçen Ay" preset
      const lastMonthButton = screen.getByRole('button', { name: 'Geçen Ay' });
      await user.click(lastMonthButton);

      // Should filter to last month (December 2024 - 1 transaction)
      await waitFor(() => {
        expect(screen.getByText('1 / 4 işlem')).toBeInTheDocument();
      });
    });

    it('should apply "Son 3 Ay" preset filter', async () => {
      const user = userEvent.setup();
      render(<UnifiedWalletPage />);

      await navigateToTransactionsTab(user);

      // Expand filters
      const showButton = screen.getByRole('button', { name: /Göster/i });
      await user.click(showButton);

      // Click "Son 3 Ay" preset
      const last3MonthsButton = screen.getByRole('button', {
        name: 'Son 3 Ay',
      });
      await user.click(last3MonthsButton);

      // Should filter to last 3 months (Jan, Dec, Nov - 3 transactions)
      await waitFor(() => {
        expect(screen.getByText('3 / 4 işlem')).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // CLEAR FILTERS TEST
  // ==========================================================================

  describe('Clear Filters', () => {
    it('should clear all filters and show all transactions', async () => {
      const user = userEvent.setup();
      render(<UnifiedWalletPage />);

      await navigateToTransactionsTab(user);

      // Expand filters
      const showButton = screen.getByRole('button', { name: /Göster/i });
      await user.click(showButton);

      // Apply filter
      const typeSelect = screen.getByLabelText('İşlem Tipi');
      await user.selectOptions(typeSelect, TransactionType.CREDIT);

      // Verify filtered count
      await waitFor(() => {
        expect(screen.getByText('2 / 4 işlem')).toBeInTheDocument();
      });

      // Clear filters
      const clearButton = screen.getByRole('button', { name: /Temizle/i });
      await user.click(clearButton);

      // Should show all transactions again
      await waitFor(() => {
        expect(screen.queryByText('2 / 4 işlem')).not.toBeInTheDocument();
        expect(screen.queryByText('4 / 4 işlem')).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // URL SYNC TEST
  // ==========================================================================

  describe('URL Synchronization', () => {
    it('should sync filters to URL', async () => {
      const user = userEvent.setup();
      render(<UnifiedWalletPage />);

      await navigateToTransactionsTab(user);

      // Expand filters
      const showButton = screen.getByRole('button', { name: /Göster/i });
      await user.click(showButton);

      // Apply filter
      const typeSelect = screen.getByLabelText('İşlem Tipi');
      await user.selectOptions(typeSelect, TransactionType.CREDIT);

      // Should update URL
      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalled();
        const callArg = mockRouter.replace.mock.calls[0][0];
        expect(callArg).toContain('type=CREDIT');
      });
    });

    it('should preserve tab param when syncing filters', async () => {
      const user = userEvent.setup();
      render(<UnifiedWalletPage />);

      await navigateToTransactionsTab(user);

      // Expand filters
      const showButton = screen.getByRole('button', { name: /Göster/i });
      await user.click(showButton);

      // Apply filter
      const typeSelect = screen.getByLabelText('İşlem Tipi');
      await user.selectOptions(typeSelect, TransactionType.CREDIT);

      // URL should have both tab and filter params
      await waitFor(() => {
        const calls = mockRouter.replace.mock.calls;
        // Find call with filter param
        const filterCall = calls.find((call) =>
          call[0].includes('type=CREDIT')
        );
        expect(filterCall).toBeTruthy();
      });
    });
  });

  // ==========================================================================
  // EMPTY STATE TEST
  // ==========================================================================

  describe('Empty State', () => {
    it('should show empty state when no transactions match filters', async () => {
      const user = userEvent.setup();
      render(<UnifiedWalletPage />);

      await navigateToTransactionsTab(user);

      // Expand filters
      const showButton = screen.getByRole('button', { name: /Göster/i });
      await user.click(showButton);

      // Apply filter that matches nothing (amount > 10000)
      const minAmountInput = screen.getByLabelText('Minimum Tutar (₺)');
      await user.type(minAmountInput, '10000');

      // Should show 0 results
      await waitFor(() => {
        expect(screen.getByText('0 / 4 işlem')).toBeInTheDocument();
      });
    });
  });
});
