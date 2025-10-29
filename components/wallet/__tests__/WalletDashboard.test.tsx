/**
 * ================================================
 * WALLET DASHBOARD TESTS
 * ================================================
 * Comprehensive tests for WalletDashboard component
 *
 * Test Coverage:
 * - Rendering with different states
 * - Balance card display
 * - Transaction list
 * - Quick actions functionality
 * - Loading and error states
 * - User interactions
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 1
 */

import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WalletDashboard } from '../WalletDashboard';

// ============================================================================
// MOCK TYPES (inline to avoid import issues)
// ============================================================================

enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  ESCROW_HOLD = 'ESCROW_HOLD',
  ESCROW_RELEASE = 'ESCROW_RELEASE',
  PAYOUT = 'PAYOUT',
  REFUND = 'REFUND',
  FEE = 'FEE',
}

interface WalletBalance {
  availableBalance: number;
  pendingBalance: number;
  totalBalance: number;
  totalEarnings: number;
  pendingPayouts: number;
  currency: string;
}

interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  description: string;
  balanceAfter: number;
  createdAt: string;
  relatedEntityType?: 'ORDER' | 'PAYMENT' | 'PAYOUT';
  relatedEntityId?: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockBalance: WalletBalance = {
  availableBalance: 5000,
  pendingBalance: 1500,
  totalBalance: 6500,
  totalEarnings: 15000,
  pendingPayouts: 2,
  currency: 'TRY',
};

const mockTransactions: Transaction[] = [
  {
    id: '1',
    walletId: 'wallet-1',
    type: 'CREDIT' as TransactionType,
    amount: 500,
    currency: 'TRY',
    description: 'Proje ödemesi alındı',
    balanceAfter: 5000,
    createdAt: new Date().toISOString(),
    relatedEntityType: 'ORDER',
    relatedEntityId: 'order-1',
  },
  {
    id: '2',
    walletId: 'wallet-1',
    type: 'DEBIT' as TransactionType,
    amount: -200,
    currency: 'TRY',
    description: 'Para çekme işlemi',
    balanceAfter: 4800,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    relatedEntityType: 'PAYOUT',
    relatedEntityId: 'payout-1',
  },
  {
    id: '3',
    walletId: 'wallet-1',
    type: 'ESCROW_HOLD' as TransactionType,
    amount: 1500,
    currency: 'TRY',
    description: 'Emanet tutuldu',
    balanceAfter: 4800,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    relatedEntityType: 'ORDER',
    relatedEntityId: 'order-2',
  },
  {
    id: '4',
    walletId: 'wallet-1',
    type: 'FEE' as TransactionType,
    amount: -25,
    currency: 'TRY',
    description: 'Platform komisyonu',
    balanceAfter: 4775,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: '5',
    walletId: 'wallet-1',
    type: 'REFUND' as TransactionType,
    amount: 300,
    currency: 'TRY',
    description: 'İade işlemi',
    balanceAfter: 5075,
    createdAt: new Date(Date.now() - 345600000).toISOString(),
    relatedEntityType: 'ORDER',
    relatedEntityId: 'order-3',
  },
];

// ============================================================================
// TESTS
// ============================================================================

describe('WalletDashboard Component', () => {
  // ==================== RENDERING TESTS ====================

  describe('Rendering', () => {
    it('renders loading state correctly', () => {
      render(<WalletDashboard isLoading={true} />);

      // Should show skeleton loaders (check for common skeleton classes)
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('renders error state correctly', () => {
      const errorMessage = 'Cüzdan yüklenirken hata oluştu';
      render(<WalletDashboard error={errorMessage} />);

      expect(screen.getByText('Cüzdan Yüklenemedi')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('Tekrar Dene')).toBeInTheDocument();
    });

    it('renders empty state when no transactions', () => {
      render(<WalletDashboard balance={mockBalance} transactions={[]} />);

      expect(screen.getByText('Henüz işlem bulunmuyor')).toBeInTheDocument();
    });

    it('renders dashboard with balance and transactions', () => {
      render(
        <WalletDashboard
          balance={mockBalance}
          transactions={mockTransactions}
        />
      );

      // Should display balance cards
      expect(screen.getByText('Kullanılabilir Bakiye')).toBeInTheDocument();
      expect(screen.getByText('Bekleyen Bakiye')).toBeInTheDocument();
      expect(screen.getByText('Toplam Kazanç')).toBeInTheDocument();

      // Should display formatted amounts
      expect(screen.getByText(/5\.000,00/)).toBeInTheDocument();
      expect(screen.getByText(/1\.500,00/)).toBeInTheDocument();
      expect(screen.getByText(/15\.000,00/)).toBeInTheDocument();
    });
  });

  // ==================== BALANCE DISPLAY TESTS ====================

  describe('Balance Display', () => {
    it('displays correct balance information', () => {
      render(<WalletDashboard balance={mockBalance} transactions={[]} />);

      expect(screen.getByText('Çekebileceğiniz tutar')).toBeInTheDocument();
      expect(screen.getByText('Emanette tutulan tutar')).toBeInTheDocument();
      expect(screen.getByText('Tüm zamanlar toplamı')).toBeInTheDocument();
    });

    it('shows trend indicators when provided', () => {
      render(
        <WalletDashboard
          balance={mockBalance}
          transactions={mockTransactions}
        />
      );

      // Should show positive trend
      const trendTexts = screen.getAllByText(/bu ay/);
      expect(trendTexts.length).toBeGreaterThan(0);
    });

    it('handles zero balance correctly', () => {
      const zeroBalance: WalletBalance = {
        ...mockBalance,
        availableBalance: 0,
        pendingBalance: 0,
        totalEarnings: 0,
      };

      render(<WalletDashboard balance={zeroBalance} transactions={[]} />);

      // Should display 0,00 for all balances
      const zeroAmounts = screen.getAllByText(/0,00/);
      expect(zeroAmounts.length).toBeGreaterThan(0);
    });
  });

  // ==================== TRANSACTION LIST TESTS ====================

  describe('Transaction List', () => {
    it('displays all transaction types correctly', () => {
      render(
        <WalletDashboard
          balance={mockBalance}
          transactions={mockTransactions}
        />
      );

      expect(screen.getByText('Gelir')).toBeInTheDocument();
      expect(screen.getByText('Gider')).toBeInTheDocument();
      expect(screen.getByText('Emanet Tutma')).toBeInTheDocument();
      expect(screen.getByText('Komisyon')).toBeInTheDocument();
      expect(screen.getByText('İade')).toBeInTheDocument();
    });

    it('displays transaction amounts with correct colors', () => {
      render(
        <WalletDashboard
          balance={mockBalance}
          transactions={mockTransactions}
        />
      );

      // Credit transactions should be green
      const creditAmount = screen.getByText(/\+500,00/);
      expect(creditAmount).toHaveClass('text-green-600');

      // Debit transactions should be red
      const debitAmount = screen.getByText(/-200,00/);
      expect(debitAmount).toHaveClass('text-red-600');
    });

    it('shows only first 5 transactions', () => {
      const manyTransactions = Array(10)
        .fill(mockTransactions[0])
        .map((t, i) => ({
          ...t,
          id: `trans-${i}`,
        }));

      render(
        <WalletDashboard
          balance={mockBalance}
          transactions={manyTransactions}
        />
      );

      // Should only show 5 transactions
      const transactionElements = screen.getAllByText('Proje ödemesi alındı');
      expect(transactionElements.length).toBeLessThanOrEqual(5);
    });

    it('displays relative time for transactions', () => {
      render(
        <WalletDashboard
          balance={mockBalance}
          transactions={mockTransactions}
        />
      );

      // Should show relative times like "1 dakika önce", "1 saat önce", etc.
      // The exact text depends on the current time
      expect(screen.getByText(/önce|az önce/i)).toBeInTheDocument();
    });
  });

  // ==================== QUICK ACTIONS TESTS ====================

  describe('Quick Actions', () => {
    it('displays all quick action buttons', () => {
      render(
        <WalletDashboard
          balance={mockBalance}
          transactions={mockTransactions}
        />
      );

      expect(screen.getByText('Para Çek')).toBeInTheDocument();
      expect(screen.getByText('İşlem Geçmişi')).toBeInTheDocument();
      expect(screen.getByText('Çekim Geçmişi')).toBeInTheDocument();
      expect(screen.getByText('Yenile')).toBeInTheDocument();
    });

    it('disables payout button when balance is zero', () => {
      const zeroBalance: WalletBalance = {
        ...mockBalance,
        availableBalance: 0,
      };

      render(<WalletDashboard balance={zeroBalance} transactions={[]} />);

      const payoutButton = screen.getByText('Para Çek').closest('button');
      expect(payoutButton).toBeDisabled();
    });

    it('calls onRequestPayout when payout button clicked', () => {
      const onRequestPayout = jest.fn();

      render(
        <WalletDashboard
          balance={mockBalance}
          transactions={[]}
          onRequestPayout={onRequestPayout}
        />
      );

      const payoutButton = screen.getByText('Para Çek');
      fireEvent.click(payoutButton);

      expect(onRequestPayout).toHaveBeenCalledTimes(1);
    });

    it('calls onViewTransactions when transaction history clicked', () => {
      const onViewTransactions = jest.fn();

      render(
        <WalletDashboard
          balance={mockBalance}
          transactions={mockTransactions}
          onViewTransactions={onViewTransactions}
        />
      );

      const transactionButton = screen.getByText('İşlem Geçmişi');
      fireEvent.click(transactionButton);

      expect(onViewTransactions).toHaveBeenCalledTimes(1);
    });

    it('calls onRefresh when refresh button clicked', () => {
      const onRefresh = jest.fn();

      render(
        <WalletDashboard
          balance={mockBalance}
          transactions={[]}
          onRefresh={onRefresh}
        />
      );

      const refreshButton = screen.getByText('Yenile');
      fireEvent.click(refreshButton);

      expect(onRefresh).toHaveBeenCalledTimes(1);
    });
  });

  // ==================== STATS DISPLAY TESTS ====================

  describe('Stats Summary', () => {
    it('displays correct transaction statistics', () => {
      render(
        <WalletDashboard
          balance={mockBalance}
          transactions={mockTransactions}
        />
      );

      expect(screen.getByText('Toplam İşlem')).toBeInTheDocument();
      expect(
        screen.getByText(mockTransactions.length.toString())
      ).toBeInTheDocument();

      expect(screen.getByText('Bekleyen Çekim')).toBeInTheDocument();
      expect(
        screen.getByText(mockBalance.pendingPayouts.toString())
      ).toBeInTheDocument();
    });

    it('calculates average transaction correctly', () => {
      render(
        <WalletDashboard
          balance={mockBalance}
          transactions={mockTransactions}
        />
      );

      expect(screen.getByText('Ort. İşlem')).toBeInTheDocument();
      // Average of |500|, |200|, |1500|, |25|, |300| = 505
      expect(screen.getByText(/505/)).toBeInTheDocument();
    });
  });

  // ==================== ERROR HANDLING TESTS ====================

  describe('Error Handling', () => {
    it('shows retry button on error', () => {
      const onRefresh = jest.fn();

      render(<WalletDashboard error="Network error" onRefresh={onRefresh} />);

      const retryButton = screen.getByText('Tekrar Dene');
      fireEvent.click(retryButton);

      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    it('maintains error state until refresh', () => {
      const { rerender } = render(<WalletDashboard error="Test error" />);

      expect(screen.getByText('Test error')).toBeInTheDocument();

      // Rerender with same error
      rerender(<WalletDashboard error="Test error" />);

      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  // ==================== RESPONSIVE DESIGN TESTS ====================

  describe('Responsive Design', () => {
    it('applies custom className', () => {
      const { container } = render(
        <WalletDashboard
          balance={mockBalance}
          transactions={[]}
          className="custom-class"
        />
      );

      const dashboard = container.firstChild;
      expect(dashboard).toHaveClass('custom-class');
    });

    it('renders grid layouts for balance cards', () => {
      render(<WalletDashboard balance={mockBalance} transactions={[]} />);

      // Balance cards should be in a grid
      const gridElements = document.querySelectorAll('.grid');
      expect(gridElements.length).toBeGreaterThan(0);
    });
  });

  // ==================== INTEGRATION TESTS ====================

  describe('Integration', () => {
    it('displays complete dashboard with all features', () => {
      render(
        <WalletDashboard
          balance={mockBalance}
          transactions={mockTransactions}
          onRefresh={jest.fn()}
          onRequestPayout={jest.fn()}
          onViewTransactions={jest.fn()}
          onViewPayouts={jest.fn()}
        />
      );

      // Balance section
      expect(screen.getByText('Kullanılabilir Bakiye')).toBeInTheDocument();
      expect(screen.getByText('Bekleyen Bakiye')).toBeInTheDocument();
      expect(screen.getByText('Toplam Kazanç')).toBeInTheDocument();

      // Quick actions
      expect(screen.getByText('Para Çek')).toBeInTheDocument();
      expect(screen.getByText('Yenile')).toBeInTheDocument();

      // Stats
      expect(screen.getByText('Toplam İşlem')).toBeInTheDocument();
      expect(screen.getByText('Bekleyen Çekim')).toBeInTheDocument();

      // Transactions
      expect(screen.getByText('Son İşlemler')).toBeInTheDocument();
      expect(
        screen.getByText(mockTransactions[0].description)
      ).toBeInTheDocument();
    });

    it('handles loading to success transition', async () => {
      const { rerender } = render(<WalletDashboard isLoading={true} />);

      // Should show loading state
      expect(
        document.querySelectorAll('.animate-pulse').length
      ).toBeGreaterThan(0);

      // Transition to success
      rerender(
        <WalletDashboard
          balance={mockBalance}
          transactions={mockTransactions}
          isLoading={false}
        />
      );

      await waitFor(() => {
        expect(document.querySelectorAll('.animate-pulse').length).toBe(0);
        expect(screen.getByText('Kullanılabilir Bakiye')).toBeInTheDocument();
      });
    });

    it('handles loading to error transition', async () => {
      const { rerender } = render(<WalletDashboard isLoading={true} />);

      // Transition to error
      rerender(<WalletDashboard error="Failed to load" isLoading={false} />);

      await waitFor(() => {
        expect(document.querySelectorAll('.animate-pulse').length).toBe(0);
        expect(screen.getByText('Cüzdan Yüklenemedi')).toBeInTheDocument();
      });
    });
  });
});
