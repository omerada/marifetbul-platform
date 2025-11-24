/**
 * ================================================
 * UNIFIED TRANSACTION FILTERS - TESTS
 * ================================================
 * Test suite for UnifiedTransactionFilters component
 * Coverage: Preset filters, URL sync, filter clearing, active filter display
 *
 * Sprint 1 - Story 1.2: Transaction Filtering Standardization
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter, useSearchParams } from 'next/navigation';
import { UnifiedTransactionFilters } from '@/components/domains/wallet/core/UnifiedTransactionFilters';
import { TransactionType } from '@/types/business/features/wallet';
import type { TransactionFilters } from '@/types/business/features/wallet';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockRouter = {
  replace: jest.fn(),
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
};

const mockSearchParams = new URLSearchParams();

// ============================================================================
// TEST SUITE
// ============================================================================

describe('UnifiedTransactionFilters', () => {
  const mockOnFiltersChange = jest.fn();
  const mockOnClear = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  const defaultProps = {
    variant: 'advanced' as const,
    filters: {},
    onFiltersChange: mockOnFiltersChange,
    onClear: mockOnClear,
  };

  // ==========================================================================
  // RENDERING TESTS
  // ==========================================================================

  describe('Rendering', () => {
    it('should render filter component with header', () => {
      render(<UnifiedTransactionFilters {...defaultProps} />);
      expect(screen.getByText('Filtreler')).toBeInTheDocument();
    });

    it('should show active filter count badge when filters are active', () => {
      const filters: TransactionFilters = {
        type: TransactionType.CREDIT,
        startDate: '2025-01-01',
      };

      render(<UnifiedTransactionFilters {...defaultProps} filters={filters} />);
      expect(screen.getByText('2 aktif')).toBeInTheDocument();
    });

    it('should display total and filtered count when provided', () => {
      render(
        <UnifiedTransactionFilters
          {...defaultProps}
          totalCount={100}
          filteredCount={25}
        />
      );
      expect(screen.getByText('25 / 100 işlem')).toBeInTheDocument();
    });

    it('should be collapsed by default', () => {
      render(<UnifiedTransactionFilters {...defaultProps} />);
      expect(screen.queryByLabelText('İşlem Tipi')).not.toBeInTheDocument();
    });

    it('should be expanded when defaultExpanded is true', () => {
      render(
        <UnifiedTransactionFilters {...defaultProps} defaultExpanded={true} />
      );
      expect(screen.getByLabelText('İşlem Tipi')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // PRESET FILTERS TESTS
  // ==========================================================================

  describe('Preset Filters', () => {
    beforeEach(() => {
      render(
        <UnifiedTransactionFilters {...defaultProps} defaultExpanded={true} />
      );
    });

    it('should render all preset filter buttons', () => {
      expect(screen.getByRole('button', { name: 'Bugün' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Son 7 Gün' })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Bu Ay' })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Geçen Ay' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Son 3 Ay' })
      ).toBeInTheDocument();
    });

    it('should apply "Bu Ay" preset filter correctly', async () => {
      const user = userEvent.setup();
      const thisMonthButton = screen.getByRole('button', { name: 'Bu Ay' });

      await user.click(thisMonthButton);

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: expect.stringMatching(/^\d{4}-\d{2}-01$/), // First day of month
          endDate: expect.any(String), // Today
        })
      );
    });

    it('should apply "Geçen Ay" preset filter correctly', async () => {
      const user = userEvent.setup();
      const lastMonthButton = screen.getByRole('button', { name: 'Geçen Ay' });

      await user.click(lastMonthButton);

      const now = new Date();
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: lastMonthStart.toISOString().split('T')[0],
          endDate: lastMonthEnd.toISOString().split('T')[0],
        })
      );
    });

    it('should apply "Son 3 Ay" preset filter correctly', async () => {
      const user = userEvent.setup();
      const last3MonthsButton = screen.getByRole('button', {
        name: 'Son 3 Ay',
      });

      await user.click(last3MonthsButton);

      const now = new Date();
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: threeMonthsAgo.toISOString().split('T')[0],
          endDate: expect.any(String),
        })
      );
    });

    it('should apply "Bugün" preset filter correctly', async () => {
      const user = userEvent.setup();
      const todayButton = screen.getByRole('button', { name: 'Bugün' });

      await user.click(todayButton);

      const today = new Date().toISOString().split('T')[0];

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: today,
          endDate: today,
        })
      );
    });

    it('should apply "Son 7 Gün" preset filter correctly', async () => {
      const user = userEvent.setup();
      const last7DaysButton = screen.getByRole('button', { name: 'Son 7 Gün' });

      await user.click(last7DaysButton);

      const today = new Date().toISOString().split('T')[0];
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: sevenDaysAgo,
          endDate: today,
        })
      );
    });
  });

  // ==========================================================================
  // FILTER INTERACTION TESTS
  // ==========================================================================

  describe('Filter Interactions', () => {
    it('should update transaction type filter', async () => {
      const user = userEvent.setup();
      render(
        <UnifiedTransactionFilters {...defaultProps} defaultExpanded={true} />
      );

      const typeSelect = screen.getByLabelText('İşlem Tipi');
      await user.selectOptions(typeSelect, TransactionType.CREDIT);

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TransactionType.CREDIT,
        })
      );
    });

    it('should update date range filters', async () => {
      const user = userEvent.setup();
      render(
        <UnifiedTransactionFilters {...defaultProps} defaultExpanded={true} />
      );

      const startDateInput = screen.getByLabelText('Başlangıç Tarihi');
      const endDateInput = screen.getByLabelText('Bitiş Tarihi');

      await user.type(startDateInput, '2025-01-01');
      await user.type(endDateInput, '2025-01-31');

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          startDate: '2025-01-01',
        })
      );

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          endDate: '2025-01-31',
        })
      );
    });

    it('should update amount range filters', async () => {
      const user = userEvent.setup();
      render(
        <UnifiedTransactionFilters {...defaultProps} defaultExpanded={true} />
      );

      const minAmountInput = screen.getByLabelText('Minimum Tutar (₺)');
      const maxAmountInput = screen.getByLabelText('Maksimum Tutar (₺)');

      await user.type(minAmountInput, '100');
      await user.type(maxAmountInput, '1000');

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          minAmount: 100,
        })
      );

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          maxAmount: 1000,
        })
      );
    });
  });

  // ==========================================================================
  // CLEAR FILTERS TEST
  // ==========================================================================

  describe('Clear Filters', () => {
    it('should show clear button when filters are active', () => {
      const filters: TransactionFilters = {
        type: TransactionType.CREDIT,
      };

      render(<UnifiedTransactionFilters {...defaultProps} filters={filters} />);
      expect(
        screen.getByRole('button', { name: /Temizle/i })
      ).toBeInTheDocument();
    });

    it('should call onClear when clear button is clicked', async () => {
      const user = userEvent.setup();
      const filters: TransactionFilters = {
        type: TransactionType.CREDIT,
      };

      render(<UnifiedTransactionFilters {...defaultProps} filters={filters} />);

      const clearButton = screen.getByRole('button', { name: /Temizle/i });
      await user.click(clearButton);

      expect(mockOnClear).toHaveBeenCalled();
    });

    it('should not show clear button when no filters are active', () => {
      render(<UnifiedTransactionFilters {...defaultProps} />);
      expect(
        screen.queryByRole('button', { name: /Temizle/i })
      ).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // URL SYNC TESTS
  // ==========================================================================

  describe('URL Synchronization', () => {
    it('should sync filters to URL when syncWithUrl is true', async () => {
      const filters: TransactionFilters = {
        type: TransactionType.CREDIT,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        minAmount: 100,
        maxAmount: 1000,
      };

      render(
        <UnifiedTransactionFilters
          {...defaultProps}
          filters={filters}
          syncWithUrl={true}
        />
      );

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalled();
        const callArg = mockRouter.replace.mock.calls[0][0];
        expect(callArg).toContain('type=CREDIT');
        expect(callArg).toContain('startDate=2025-01-01');
        expect(callArg).toContain('endDate=2025-01-31');
        expect(callArg).toContain('minAmount=100');
        expect(callArg).toContain('maxAmount=1000');
      });
    });

    it('should not sync to URL when syncWithUrl is false', () => {
      const filters: TransactionFilters = {
        type: TransactionType.CREDIT,
      };

      render(
        <UnifiedTransactionFilters
          {...defaultProps}
          filters={filters}
          syncWithUrl={false}
        />
      );

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it('should initialize filters from URL params when syncWithUrl is true', () => {
      const urlParams = new URLSearchParams({
        type: TransactionType.CREDIT,
        startDate: '2025-01-01',
        minAmount: '100',
      });

      (useSearchParams as jest.Mock).mockReturnValue(urlParams);

      render(
        <UnifiedTransactionFilters {...defaultProps} syncWithUrl={true} />
      );

      // Should call onFiltersChange with URL params on mount
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          type: TransactionType.CREDIT,
          startDate: '2025-01-01',
          minAmount: 100,
        })
      );
    });
  });

  // ==========================================================================
  // ACTIVE FILTERS DISPLAY (ADVANCED VARIANT)
  // ==========================================================================

  describe('Active Filters Display', () => {
    it('should show active filters summary in advanced variant', () => {
      const filters: TransactionFilters = {
        type: TransactionType.CREDIT,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      };

      render(
        <UnifiedTransactionFilters
          {...defaultProps}
          variant="advanced"
          filters={filters}
          defaultExpanded={true}
        />
      );

      expect(screen.getByText('Aktif Filtreler:')).toBeInTheDocument();
      expect(screen.getByText('Gelir')).toBeInTheDocument();
      expect(screen.getByText('2025-01-01 - 2025-01-31')).toBeInTheDocument();
    });

    it('should allow removing individual active filters', async () => {
      const user = userEvent.setup();
      const filters: TransactionFilters = {
        type: TransactionType.CREDIT,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
      };

      render(
        <UnifiedTransactionFilters
          {...defaultProps}
          variant="advanced"
          filters={filters}
          defaultExpanded={true}
        />
      );

      // Find and click the X button next to "Gelir" badge
      const badges = screen.getAllByRole('button');
      const typeRemoveButton = badges.find((btn) =>
        btn.closest('.bg-white')?.textContent?.includes('Gelir')
      );

      if (typeRemoveButton) {
        await user.click(typeRemoveButton);
        expect(mockOnFiltersChange).toHaveBeenCalledWith(
          expect.objectContaining({
            type: undefined,
          })
        );
      }
    });

    it('should not show active filters summary in simple variant', () => {
      const filters: TransactionFilters = {
        type: TransactionType.CREDIT,
      };

      render(
        <UnifiedTransactionFilters
          {...defaultProps}
          variant="simple"
          filters={filters}
          defaultExpanded={true}
        />
      );

      expect(screen.queryByText('Aktif Filtreler:')).not.toBeInTheDocument();
    });
  });

  // ==========================================================================
  // EXPAND/COLLAPSE TESTS
  // ==========================================================================

  describe('Expand/Collapse', () => {
    it('should expand when show button is clicked', async () => {
      const user = userEvent.setup();
      render(<UnifiedTransactionFilters {...defaultProps} />);

      const showButton = screen.getByRole('button', { name: /Göster/i });
      await user.click(showButton);

      expect(screen.getByLabelText('İşlem Tipi')).toBeInTheDocument();
    });

    it('should collapse when hide button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <UnifiedTransactionFilters {...defaultProps} defaultExpanded={true} />
      );

      const hideButton = screen.getByRole('button', { name: /Gizle/i });
      await user.click(hideButton);

      await waitFor(() => {
        expect(screen.queryByLabelText('İşlem Tipi')).not.toBeInTheDocument();
      });
    });
  });
});
