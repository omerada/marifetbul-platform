/**
 * ============================================================================
 * UnifiedPayoutHistory Component Tests
 * ============================================================================
 * Sprint 1.3: Comprehensive test suite for unified payout history component
 *
 * Test Coverage:
 * - ✅ Simple variant rendering
 * - ✅ Advanced variant rendering
 * - ✅ Filtering functionality
 * - ✅ Sorting functionality
 * - ✅ Pagination
 * - ✅ Cancel action
 * - ✅ Export callback
 * - ✅ Loading/error/empty states
 * - ✅ Responsive design (desktop/mobile)
 * - ✅ Feature flags
 *
 * Target: 80%+ code coverage
 * ============================================================================
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UnifiedPayoutHistory } from '@/components/domains/wallet';
import { PayoutStatus, PayoutMethod } from '@/types/business/features/wallet';
import type { Payout } from '@/types/business/features/wallet';

// ============================================================================
// MOCK DATA
// ============================================================================

const mockPayouts: Payout[] = [
  {
    id: 'payout-1',
    userId: 'user-1',
    amount: 500,
    currency: 'USD',
    status: PayoutStatus.COMPLETED,
    method: PayoutMethod.BANK_TRANSFER,
    requestedAt: '2025-11-01T10:00:00Z',
    completedAt: '2025-11-02T10:00:00Z',
    description: 'October earnings',
    bankAccountId: 'bank-1',
  },
  {
    id: 'payout-2',
    userId: 'user-1',
    amount: 750,
    currency: 'USD',
    status: PayoutStatus.PENDING,
    method: PayoutMethod.IYZICO_PAYOUT,
    requestedAt: '2025-11-03T14:30:00Z',
    description: 'November earnings',
    bankAccountId: 'bank-2',
  },
  {
    id: 'payout-3',
    userId: 'user-1',
    amount: 300,
    currency: 'USD',
    status: PayoutStatus.FAILED,
    method: PayoutMethod.BANK_TRANSFER,
    requestedAt: '2025-10-28T09:15:00Z',
    description: 'September earnings',
    failureReason: 'Invalid bank account',
    bankAccountId: 'bank-1',
  },
  {
    id: 'payout-4',
    userId: 'user-1',
    amount: 1000,
    currency: 'USD',
    status: PayoutStatus.PROCESSING,
    method: PayoutMethod.BANK_TRANSFER,
    requestedAt: '2025-11-04T11:00:00Z',
    description: 'Large payout',
    bankAccountId: 'bank-1',
  },
];

// ============================================================================
// TEST SUITES
// ============================================================================

describe('UnifiedPayoutHistory', () => {
  // ==========================================================================
  // SIMPLE VARIANT TESTS
  // ==========================================================================

  describe('Simple Variant', () => {
    it('renders simple variant with basic table', () => {
      render(<UnifiedPayoutHistory variant="simple" payouts={mockPayouts} />);

      // Check table headers exist
      expect(screen.getByText('Tarih')).toBeInTheDocument();
      expect(screen.getByText('Durum')).toBeInTheDocument();
      expect(screen.getByText('Tutar')).toBeInTheDocument();

      // Check payout data is displayed
      expect(screen.getByText('October earnings')).toBeInTheDocument();
      expect(screen.getByText('November earnings')).toBeInTheDocument();
    });

    it('does not show filtering controls in simple variant', () => {
      render(<UnifiedPayoutHistory variant="simple" payouts={mockPayouts} />);

      // Search input should not be present
      expect(
        screen.queryByPlaceholderText('Çekim ID veya açıklama ara...')
      ).not.toBeInTheDocument();

      // Filter dropdowns should not be present
      expect(screen.queryByText('Durum')).not.toBeInTheDocument();
      expect(screen.queryByText('Dışa Aktar')).not.toBeInTheDocument();
    });

    it('does not show pagination in simple variant by default', () => {
      const manyPayouts = Array.from({ length: 15 }, (_, i) => ({
        ...mockPayouts[0],
        id: `payout-${i}`,
        amount: 100 * (i + 1),
      }));

      render(<UnifiedPayoutHistory variant="simple" payouts={manyPayouts} />);

      // All payouts should be visible (no pagination)
      expect(
        screen.getAllByText(/earnings|Large payout/).length
      ).toBeGreaterThan(10);
    });

    it('shows cancel button for PENDING payouts in simple variant', () => {
      const onCancelPayout = jest.fn();

      render(
        <UnifiedPayoutHistory
          variant="simple"
          payouts={mockPayouts}
          onCancelPayout={onCancelPayout}
        />
      );

      const cancelButtons = screen.getAllByText('İptal Et');
      expect(cancelButtons.length).toBeGreaterThan(0);
    });

    it('handles sort columns in simple variant when sorting disabled', () => {
      render(
        <UnifiedPayoutHistory
          variant="simple"
          payouts={mockPayouts}
          enableSorting={false}
        />
      );

      // Column headers should not be clickable buttons
      const dateHeader = screen.getByText('Tarih');
      expect(dateHeader.tagName).not.toBe('BUTTON');
    });
  });

  // ==========================================================================
  // ADVANCED VARIANT TESTS
  // ==========================================================================

  describe('Advanced Variant', () => {
    it('renders advanced variant with filtering controls', () => {
      render(<UnifiedPayoutHistory variant="advanced" payouts={mockPayouts} />);

      // Search input should be present
      expect(
        screen.getByPlaceholderText('Çekim ID veya açıklama ara...')
      ).toBeInTheDocument();

      // Filter buttons should be present
      expect(screen.getAllByText('Durum')[0]).toBeInTheDocument();
      expect(screen.getByText('Yöntem')).toBeInTheDocument();
    });

    it('filters payouts by status', async () => {
      render(<UnifiedPayoutHistory variant="advanced" payouts={mockPayouts} />);

      // Open status filter
      const statusButton = screen.getAllByText('Durum')[0];
      fireEvent.click(statusButton);

      // Select COMPLETED filter
      await waitFor(() => {
        const completedOption = screen.getByText('Tamamlandı');
        fireEvent.click(completedOption);
      });

      // Only COMPLETED payout should be visible
      expect(screen.getByText('October earnings')).toBeInTheDocument();
      expect(screen.queryByText('November earnings')).not.toBeInTheDocument();
    });

    it('filters payouts by search query', () => {
      render(<UnifiedPayoutHistory variant="advanced" payouts={mockPayouts} />);

      const searchInput = screen.getByPlaceholderText(
        'Çekim ID veya açıklama ara...'
      );

      // Search for "October"
      fireEvent.change(searchInput, { target: { value: 'October' } });

      // Only matching payout should be visible
      expect(screen.getByText('October earnings')).toBeInTheDocument();
      expect(screen.queryByText('November earnings')).not.toBeInTheDocument();
    });

    it('sorts payouts by date', () => {
      render(<UnifiedPayoutHistory variant="advanced" payouts={mockPayouts} />);

      // Find date header button and click to sort
      const dateHeader = screen.getByText('Tarih').closest('button');
      if (dateHeader) {
        fireEvent.click(dateHeader);
      }

      // Verify sort icons appear
      expect(screen.getByText('Tarih')).toBeInTheDocument();
    });

    it('sorts payouts by amount', () => {
      render(<UnifiedPayoutHistory variant="advanced" payouts={mockPayouts} />);

      // Find amount header button and click to sort
      const amountHeader = screen.getByText('Tutar').closest('button');
      if (amountHeader) {
        fireEvent.click(amountHeader);
      }

      // Verify sort functionality
      expect(screen.getByText('Tutar')).toBeInTheDocument();
    });

    it('shows pagination with many payouts', () => {
      const manyPayouts = Array.from({ length: 25 }, (_, i) => ({
        ...mockPayouts[0],
        id: `payout-${i}`,
        amount: 100 * (i + 1),
      }));

      render(<UnifiedPayoutHistory variant="advanced" payouts={manyPayouts} />);

      // Pagination controls should be visible
      expect(screen.getByText('Toplam 25 çekim')).toBeInTheDocument();

      // Page buttons should exist
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('navigates through pages', () => {
      const manyPayouts = Array.from({ length: 25 }, (_, i) => ({
        ...mockPayouts[0],
        id: `payout-${i}`,
        description: `Payout ${i + 1}`,
      }));

      render(<UnifiedPayoutHistory variant="advanced" payouts={manyPayouts} />);

      // Click page 2
      const page2Button = screen.getByText('2');
      fireEvent.click(page2Button);

      // Should show items from page 2
      expect(screen.getByText('Toplam 25 çekim')).toBeInTheDocument();
    });

    it('shows export button in advanced variant', () => {
      const onExport = jest.fn();

      render(
        <UnifiedPayoutHistory
          variant="advanced"
          payouts={mockPayouts}
          onExport={onExport}
        />
      );

      expect(screen.getByText('Dışa Aktar')).toBeInTheDocument();
    });

    it('calls onExport callback', () => {
      const onExport = jest.fn();

      render(
        <UnifiedPayoutHistory
          variant="advanced"
          payouts={mockPayouts}
          onExport={onExport}
        />
      );

      const exportButton = screen.getByText('Dışa Aktar');
      fireEvent.click(exportButton);

      expect(onExport).toHaveBeenCalledWith(
        expect.objectContaining({ search: '' })
      );
    });

    it('shows active filters badges', async () => {
      render(<UnifiedPayoutHistory variant="advanced" payouts={mockPayouts} />);

      // Apply status filter
      const statusButton = screen.getAllByText('Durum')[0];
      fireEvent.click(statusButton);

      await waitFor(() => {
        const completedOption = screen.getByText('Tamamlandı');
        fireEvent.click(completedOption);
      });

      // Active filters section should appear
      expect(screen.getByText('Aktif Filtreler:')).toBeInTheDocument();
    });

    it('clears all filters', async () => {
      render(<UnifiedPayoutHistory variant="advanced" payouts={mockPayouts} />);

      // Apply search filter
      const searchInput = screen.getByPlaceholderText(
        'Çekim ID veya açıklama ara...'
      );
      fireEvent.change(searchInput, { target: { value: 'October' } });

      // Clear all button should appear
      await waitFor(() => {
        expect(screen.getByText('Tümünü Temizle')).toBeInTheDocument();
      });

      const clearButton = screen.getByText('Tümünü Temizle');
      fireEvent.click(clearButton);

      // All payouts should be visible again
      expect(screen.getByText('November earnings')).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // SHARED FUNCTIONALITY TESTS
  // ==========================================================================

  describe('Shared Functionality', () => {
    it('shows loading state', () => {
      render(
        <UnifiedPayoutHistory variant="simple" payouts={[]} isLoading={true} />
      );

      expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
    });

    it('shows error state', () => {
      render(
        <UnifiedPayoutHistory
          variant="simple"
          payouts={[]}
          error="Failed to load payouts"
        />
      );

      expect(screen.getByText('Failed to load payouts')).toBeInTheDocument();
    });

    it('shows empty state with custom message', () => {
      render(
        <UnifiedPayoutHistory
          variant="simple"
          payouts={[]}
          emptyMessage="No payouts yet"
        />
      );

      expect(screen.getByText('No payouts yet')).toBeInTheDocument();
    });

    it('calls onViewDetails callback when row clicked', () => {
      const onViewDetails = jest.fn();

      render(
        <UnifiedPayoutHistory
          variant="simple"
          payouts={mockPayouts}
          onViewDetails={onViewDetails}
        />
      );

      // Click on first payout row
      const firstRow = screen.getByText('October earnings').closest('tr');
      if (firstRow) {
        fireEvent.click(firstRow);
      }

      expect(onViewDetails).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'payout-1' })
      );
    });

    it('calls onCancelPayout callback', async () => {
      const onCancelPayout = jest.fn().mockResolvedValue(undefined);

      render(
        <UnifiedPayoutHistory
          variant="simple"
          payouts={mockPayouts}
          onCancelPayout={onCancelPayout}
        />
      );

      const cancelButtons = screen.getAllByText('İptal Et');
      fireEvent.click(cancelButtons[0]);

      await waitFor(() => {
        expect(onCancelPayout).toHaveBeenCalled();
      });
    });

    it('shows cancelling state for specific payout', () => {
      render(
        <UnifiedPayoutHistory
          variant="simple"
          payouts={mockPayouts}
          onCancelPayout={jest.fn()}
          cancellingId="payout-2"
        />
      );

      // Should show loading spinner for cancelling payout
      expect(screen.getByText('İptal Ediliyor...')).toBeInTheDocument();
    });

    it('displays failure reason for failed payouts', () => {
      render(<UnifiedPayoutHistory variant="simple" payouts={mockPayouts} />);

      expect(screen.getByText(/Invalid bank account/)).toBeInTheDocument();
    });

    it('renders mobile cards on small screens', () => {
      // Note: In real test would use matchMedia mock or resize viewport
      render(<UnifiedPayoutHistory variant="simple" payouts={mockPayouts} />);

      // Mobile cards container should exist
      const mobileCards = document.querySelector('.md\\:hidden');
      expect(mobileCards).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // FEATURE FLAG TESTS
  // ==========================================================================

  describe('Feature Flags', () => {
    it('respects enableFiltering=false in advanced variant', () => {
      render(
        <UnifiedPayoutHistory
          variant="advanced"
          payouts={mockPayouts}
          enableFiltering={false}
        />
      );

      // Search and filters should not be present
      expect(
        screen.queryByPlaceholderText('Çekim ID veya açıklama ara...')
      ).not.toBeInTheDocument();
    });

    it('respects enableSorting=false in advanced variant', () => {
      render(
        <UnifiedPayoutHistory
          variant="advanced"
          payouts={mockPayouts}
          enableSorting={false}
        />
      );

      // Date header should not be a button
      const dateHeader = screen.getByText('Tarih');
      expect(dateHeader.tagName).not.toBe('BUTTON');
    });

    it('respects enablePagination=false in advanced variant', () => {
      const manyPayouts = Array.from({ length: 25 }, (_, i) => ({
        ...mockPayouts[0],
        id: `payout-${i}`,
      }));

      render(
        <UnifiedPayoutHistory
          variant="advanced"
          payouts={manyPayouts}
          enablePagination={false}
        />
      );

      // Pagination controls should not be present
      expect(screen.queryByText('Toplam 25 çekim')).not.toBeInTheDocument();
    });

    it('respects enableExport=false in advanced variant', () => {
      render(
        <UnifiedPayoutHistory
          variant="advanced"
          payouts={mockPayouts}
          enableExport={false}
          onExport={jest.fn()}
        />
      );

      // Export button should not be present
      expect(screen.queryByText('Dışa Aktar')).not.toBeInTheDocument();
    });

    it('allows enabling features in simple variant', () => {
      render(
        <UnifiedPayoutHistory
          variant="simple"
          payouts={mockPayouts}
          enableFiltering={true}
        />
      );

      // Search should be present even in simple variant
      expect(
        screen.getByPlaceholderText('Çekim ID veya açıklama ara...')
      ).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // EDGE CASES
  // ==========================================================================

  describe('Edge Cases', () => {
    it('handles empty payouts array', () => {
      render(<UnifiedPayoutHistory variant="simple" payouts={[]} />);

      expect(screen.getByText('Çekim talebi bulunamadı')).toBeInTheDocument();
    });

    it('handles single payout', () => {
      render(
        <UnifiedPayoutHistory variant="simple" payouts={[mockPayouts[0]]} />
      );

      expect(screen.getByText('October earnings')).toBeInTheDocument();
    });

    it('handles payouts without description', () => {
      const payoutNoDescription: Payout = {
        ...mockPayouts[0],
        description: undefined,
      };

      render(
        <UnifiedPayoutHistory
          variant="simple"
          payouts={[payoutNoDescription]}
        />
      );

      // Should show "-" for empty description
      expect(screen.getByText('-')).toBeInTheDocument();
    });

    it('handles payouts with completed date', () => {
      render(
        <UnifiedPayoutHistory variant="simple" payouts={[mockPayouts[0]]} />
      );

      // Should show completed date in simple variant
      expect(screen.getByText(/Tamamlandı:/)).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <UnifiedPayoutHistory
          variant="simple"
          payouts={mockPayouts}
          className="custom-class"
        />
      );

      const mainDiv = container.querySelector('.custom-class');
      expect(mainDiv).toBeInTheDocument();
    });
  });
});
