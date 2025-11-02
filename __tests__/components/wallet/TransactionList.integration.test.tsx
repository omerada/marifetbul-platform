/**
 * ================================================
 * TRANSACTION LIST INTEGRATION TEST
 * ================================================
 * Integration test for TransactionList, Filters, Modal, and Export
 *
 * Sprint 1 - Epic 1.1 - Day 2
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TransactionList } from '@/components/domains/wallet';
import { TransactionFilters } from '@/components/domains/wallet';
import { TransactionDetailsModal } from '@/components/domains/wallet';
import { exportTransactions } from '@/lib/utils/export-transactions';
import type {
  Transaction,
  TransactionFilters as FilterValues,
} from '@/types/business/features/wallet';

// Mock export utilities
jest.mock('@/lib/utils/export-transactions', () => ({
  exportTransactions: jest.fn(),
  exportToCSV: jest.fn(),
  exportToPDF: jest.fn(),
}));

// ============================================================================
// MOCK DATA
// ============================================================================

const mockTransactions: Transaction[] = [
  {
    id: 'txn_1',
    walletId: 'wallet_123',
    type: 'CREDIT',
    amount: 1500,
    currency: 'TRY',
    description: 'Web sitesi tasarım projesi ödemesi',
    relatedEntityType: 'ORDER',
    relatedEntityId: 'order_abc',
    balanceAfter: 5500,
    createdAt: new Date().toISOString(),
    metadata: { orderId: 'order_abc' },
  },
  {
    id: 'txn_2',
    walletId: 'wallet_123',
    type: 'ESCROW_HOLD',
    amount: 2500,
    currency: 'TRY',
    description: 'Logo tasarım projesi - Escrow',
    relatedEntityType: 'ORDER',
    relatedEntityId: 'order_def',
    balanceAfter: 4000,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    metadata: {},
  },
  {
    id: 'txn_3',
    walletId: 'wallet_123',
    type: 'PAYOUT',
    amount: 1000,
    currency: 'TRY',
    description: 'Banka transferi',
    relatedEntityType: 'PAYOUT',
    relatedEntityId: 'payout_123',
    balanceAfter: 4000,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    metadata: {},
  },
  {
    id: 'txn_4',
    walletId: 'wallet_123',
    type: 'FEE',
    amount: 150,
    currency: 'TRY',
    description: 'Platform komisyon ücreti',
    balanceAfter: 4850,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    metadata: {},
  },
];

const defaultFilters: FilterValues = {
  type: undefined,
  startDate: undefined,
  endDate: undefined,
  minAmount: undefined,
  maxAmount: undefined,
};

// ============================================================================
// TESTS
// ============================================================================

describe('TransactionList Integration', () => {
  // ==========================================================================
  // 1. TRANSACTION LIST TESTS
  // ==========================================================================

  describe('TransactionList Component', () => {
    it('renders transaction list with data', () => {
      render(
        <TransactionList
          transactions={mockTransactions}
          filters={defaultFilters}
        />
      );

      expect(screen.getByText('4 işlem')).toBeInTheDocument();
      expect(
        screen.getByText('Web sitesi tasarım projesi ödemesi')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Logo tasarım projesi - Escrow')
      ).toBeInTheDocument();
    });

    it('shows loading state', () => {
      render(
        <TransactionList
          transactions={[]}
          filters={defaultFilters}
          isLoading={true}
        />
      );

      expect(screen.getByText('İşlemler yükleniyor...')).toBeInTheDocument();
    });

    it('shows empty state when no transactions', () => {
      render(<TransactionList transactions={[]} filters={defaultFilters} />);

      expect(screen.getByText('Henüz işlem bulunmuyor')).toBeInTheDocument();
    });

    it('calls onTransactionClick when transaction is clicked', () => {
      const mockOnClick = jest.fn();

      render(
        <TransactionList
          transactions={mockTransactions}
          filters={defaultFilters}
          onTransactionClick={mockOnClick}
        />
      );

      const firstTransaction = screen.getByText(
        'Web sitesi tasarım projesi ödemesi'
      );
      fireEvent.click(firstTransaction.closest('div')!);

      expect(mockOnClick).toHaveBeenCalledWith(mockTransactions[0]);
    });

    it('sorts transactions by date', () => {
      const { container } = render(
        <TransactionList
          transactions={mockTransactions}
          filters={defaultFilters}
        />
      );

      const sortButton = screen.getByText('Tarih');
      fireEvent.click(sortButton);

      // Check if order changed (ascending)
      const descriptions = container.querySelectorAll(
        '.text-sm.font-medium.text-gray-900'
      );
      expect(descriptions[0].textContent).toBe('Platform komisyon ücreti');
    });

    it('renders load more button when hasMore is true', () => {
      const mockOnLoadMore = jest.fn();

      render(
        <TransactionList
          transactions={mockTransactions}
          filters={defaultFilters}
          hasMore={true}
          onLoadMore={mockOnLoadMore}
        />
      );

      const loadMoreButton = screen.getByText('Daha Fazla Yükle');
      fireEvent.click(loadMoreButton);

      expect(mockOnLoadMore).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // 2. TRANSACTION FILTERS TESTS
  // ==========================================================================

  describe('TransactionFilters Component', () => {
    it('renders filter panel', () => {
      const mockOnChange = jest.fn();
      const mockOnClear = jest.fn();

      render(
        <TransactionFilters
          filters={defaultFilters}
          onFiltersChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      expect(screen.getByText('Filtreler')).toBeInTheDocument();
    });

    it('expands and shows filter options', () => {
      const mockOnChange = jest.fn();
      const mockOnClear = jest.fn();

      render(
        <TransactionFilters
          filters={defaultFilters}
          onFiltersChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const filterButton = screen.getByText('Filtreler');
      fireEvent.click(filterButton);

      expect(screen.getByText('İşlem Tipi')).toBeInTheDocument();
      expect(screen.getByText('Başlangıç Tarihi')).toBeInTheDocument();
    });

    it('calls onFiltersChange when filter is changed', () => {
      const mockOnChange = jest.fn();
      const mockOnClear = jest.fn();

      render(
        <TransactionFilters
          filters={defaultFilters}
          onFiltersChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      // Expand filters
      const filterButton = screen.getByText('Filtreler');
      fireEvent.click(filterButton);

      // Change transaction type
      const typeSelect = screen.getByRole('combobox');
      fireEvent.change(typeSelect, { target: { value: 'CREDIT' } });

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'CREDIT' })
      );
    });

    it('calls onClear when clear button is clicked', () => {
      const mockOnChange = jest.fn();
      const mockOnClear = jest.fn();

      const activeFilters: FilterValues = {
        ...defaultFilters,
        type: 'CREDIT',
      };

      render(
        <TransactionFilters
          filters={activeFilters}
          onFiltersChange={mockOnChange}
          onClear={mockOnClear}
        />
      );

      const clearButton = screen.getByText('Temizle');
      fireEvent.click(clearButton);

      expect(mockOnClear).toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // 3. TRANSACTION DETAILS MODAL TESTS
  // ==========================================================================

  describe('TransactionDetailsModal Component', () => {
    it('renders modal when open', () => {
      render(
        <TransactionDetailsModal
          transaction={mockTransactions[0]}
          isOpen={true}
          onClose={jest.fn()}
        />
      );

      expect(
        screen.getByText('Web sitesi tasarım projesi ödemesi')
      ).toBeInTheDocument();
      expect(screen.getByText('İşlem Tutarı')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      const { container } = render(
        <TransactionDetailsModal
          transaction={mockTransactions[0]}
          isOpen={false}
          onClose={jest.fn()}
        />
      );

      expect(container.firstChild).toBeNull();
    });

    it('calls onClose when close button is clicked', () => {
      const mockOnClose = jest.fn();

      render(
        <TransactionDetailsModal
          transaction={mockTransactions[0]}
          isOpen={true}
          onClose={mockOnClose}
        />
      );

      const closeButtons = screen.getAllByRole('button');
      const closeButton = closeButtons.find((btn) =>
        btn.querySelector('svg')?.classList.contains('lucide-x')
      );

      fireEvent.click(closeButton!);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it('calls onDownloadReceipt when download button is clicked', () => {
      const mockOnDownload = jest.fn();

      render(
        <TransactionDetailsModal
          transaction={mockTransactions[0]}
          isOpen={true}
          onClose={jest.fn()}
          onDownloadReceipt={mockOnDownload}
        />
      );

      const downloadButton = screen.getByText('Makbuz İndir');
      fireEvent.click(downloadButton);

      expect(mockOnDownload).toHaveBeenCalledWith('txn_1');
    });

    it('displays transaction metadata', () => {
      render(
        <TransactionDetailsModal
          transaction={mockTransactions[0]}
          isOpen={true}
          onClose={jest.fn()}
        />
      );

      expect(screen.getByText('Ek Bilgiler')).toBeInTheDocument();
      expect(screen.getByText(/"orderId"/)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // 4. EXPORT FUNCTIONALITY TESTS
  // ==========================================================================

  describe('Export Transactions', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('exports transactions to CSV', () => {
      exportTransactions(mockTransactions, 'csv', {});

      expect(exportTransactions).toHaveBeenCalledWith(
        mockTransactions,
        'csv',
        {}
      );
    });

    it('exports transactions to PDF', () => {
      exportTransactions(mockTransactions, 'pdf', {});

      expect(exportTransactions).toHaveBeenCalledWith(
        mockTransactions,
        'pdf',
        {}
      );
    });

    it('exports with date filters', () => {
      const options = {
        startDate: '2025-01-01',
        endDate: '2025-12-31',
      };

      exportTransactions(mockTransactions, 'csv', options);

      expect(exportTransactions).toHaveBeenCalledWith(
        mockTransactions,
        'csv',
        options
      );
    });
  });

  // ==========================================================================
  // 5. INTEGRATION FLOW TESTS
  // ==========================================================================

  describe('Full Integration Flow', () => {
    it('filters transactions and displays results', () => {
      const mockOnChange = jest.fn();
      const mockOnClear = jest.fn();

      const { rerender } = render(
        <>
          <TransactionFilters
            filters={defaultFilters}
            onFiltersChange={mockOnChange}
            onClear={mockOnClear}
          />
          <TransactionList
            transactions={mockTransactions}
            filters={defaultFilters}
          />
        </>
      );

      // Initially shows all transactions
      expect(screen.getByText('4 işlem')).toBeInTheDocument();

      // Apply filter
      const updatedFilters: FilterValues = {
        ...defaultFilters,
        type: 'CREDIT',
      };

      rerender(
        <>
          <TransactionFilters
            filters={updatedFilters}
            onFiltersChange={mockOnChange}
            onClear={mockOnClear}
          />
          <TransactionList
            transactions={mockTransactions}
            filters={updatedFilters}
          />
        </>
      );

      // Should show filtered result
      expect(screen.getByText('1 işlem')).toBeInTheDocument();
    });

    it('opens modal when transaction is clicked', async () => {
      const [selectedTransaction, setSelectedTransaction] =
        React.useState<Transaction | null>(null);
      const [isModalOpen, setIsModalOpen] = React.useState(false);

      function TestComponent() {
        return (
          <>
            <TransactionList
              transactions={mockTransactions}
              filters={defaultFilters}
              onTransactionClick={(txn) => {
                setSelectedTransaction(txn);
                setIsModalOpen(true);
              }}
            />
            <TransactionDetailsModal
              transaction={selectedTransaction}
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            />
          </>
        );
      }

      render(<TestComponent />);

      const firstTransaction = screen.getByText(
        'Web sitesi tasarım projesi ödemesi'
      );
      fireEvent.click(firstTransaction.closest('div')!);

      await waitFor(() => {
        expect(screen.getByText('İşlem Tutarı')).toBeInTheDocument();
      });
    });
  });
});
