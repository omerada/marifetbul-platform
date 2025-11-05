/**
 * UnifiedDisputeList Component Tests
 *
 * Sprint 1.1: Comprehensive tests for unified dispute list component
 * Target: 80%+ code coverage
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { UnifiedDisputeList } from '../../../../components/domains/disputes/core/UnifiedDisputeList';
import type {
  DisputeResponse,
  DisputeStatus,
  DisputeReason,
  DisputeResolutionType,
} from '../../../../types/dispute';

// Mock data
const mockDisputes: DisputeResponse[] = [
  {
    id: 'dispute-1',
    orderId: 'order-123',
    raisedByUserId: 'user-1',
    raisedByUserFullName: 'John Doe',
    reason: 'QUALITY_ISSUE' as DisputeReason,
    reasonDisplayName: 'Kalite Sorunu',
    status: 'OPEN' as DisputeStatus,
    description: 'Ürün açıklamaya uygun değil',
    evidenceUrls: [],
    resolution: null,
    resolvedByUserId: null,
    resolvedByUserFullName: null,
    resolutionType: null,
    refundAmount: null,
    createdAt: '2025-11-01T10:00:00Z',
    updatedAt: '2025-11-01T10:00:00Z',
    resolvedAt: null,
  },
  {
    id: 'dispute-2',
    orderId: 'order-456',
    raisedByUserId: 'user-2',
    raisedByUserFullName: 'Jane Smith',
    reason: 'DELIVERY_NOT_RECEIVED' as DisputeReason,
    reasonDisplayName: 'Teslimat Alınmadı',
    status: 'RESOLVED' as DisputeStatus,
    description: 'Ürün teslim edilmedi',
    evidenceUrls: [],
    resolution: 'Ücret iade edildi',
    resolvedByUserId: 'admin-1',
    resolvedByUserFullName: 'Admin User',
    resolutionType: 'FAVOR_BUYER_FULL_REFUND' as DisputeResolutionType,
    refundAmount: 100,
    createdAt: '2025-10-25T10:00:00Z',
    updatedAt: '2025-10-30T15:00:00Z',
    resolvedAt: '2025-10-30T15:00:00Z',
  },
];

describe('UnifiedDisputeList', () => {
  // ============================================================================
  // VARIANT: CARD
  // ============================================================================

  describe('Card Variant', () => {
    it('should render disputes as cards', () => {
      render(<UnifiedDisputeList variant="card" disputes={mockDisputes} />);

      // Check that DisputeCard is rendered
      expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
      expect(screen.getByText(/Jane Smith/i)).toBeInTheDocument();
    });

    it('should show loading state', () => {
      render(<UnifiedDisputeList variant="card" isLoading={true} />);

      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });

    it('should show error state', () => {
      render(<UnifiedDisputeList variant="card" error="Test error message" />);

      expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
    });

    it('should show empty state', () => {
      render(<UnifiedDisputeList variant="card" disputes={[]} />);

      expect(screen.getByText(/İtiraz Bulunamadı/i)).toBeInTheDocument();
    });

    it('should show custom empty message', () => {
      render(
        <UnifiedDisputeList
          variant="card"
          disputes={[]}
          emptyMessage="Özel boş mesaj"
        />
      );

      expect(screen.getByText(/Özel boş mesaj/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // VARIANT: TABLE
  // ============================================================================

  describe('Table Variant', () => {
    it('should render disputes as table', () => {
      render(<UnifiedDisputeList variant="table" disputes={mockDisputes} />);

      // Check table headers
      expect(screen.getByText('Sipariş ID')).toBeInTheDocument();
      expect(screen.getByText('İtiraz Eden')).toBeInTheDocument();
      expect(screen.getByText('Neden')).toBeInTheDocument();
      expect(screen.getByText('Durum')).toBeInTheDocument();

      // Check data
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should show action buttons', () => {
      const onViewDispute = jest.fn();
      const onResolveDispute = jest.fn();

      render(
        <UnifiedDisputeList
          variant="table"
          disputes={mockDisputes}
          onViewDispute={onViewDispute}
          onResolveDispute={onResolveDispute}
        />
      );

      const viewButtons = screen.getAllByText('Görüntüle');
      expect(viewButtons).toHaveLength(2);

      // Only open dispute should have resolve button
      const resolveButtons = screen.getAllByText('Çözümle');
      expect(resolveButtons).toHaveLength(1);
    });

    it('should call onViewDispute when view button is clicked', async () => {
      const onViewDispute = jest.fn();
      const user = userEvent.setup();

      render(
        <UnifiedDisputeList
          variant="table"
          disputes={mockDisputes}
          onViewDispute={onViewDispute}
        />
      );

      const viewButtons = screen.getAllByText('Görüntüle');
      await user.click(viewButtons[0]);

      expect(onViewDispute).toHaveBeenCalledWith('dispute-1');
    });

    it('should call onResolveDispute when resolve button is clicked', async () => {
      const onResolveDispute = jest.fn();
      const user = userEvent.setup();

      render(
        <UnifiedDisputeList
          variant="table"
          disputes={mockDisputes}
          onResolveDispute={onResolveDispute}
        />
      );

      const resolveButton = screen.getByText('Çözümle');
      await user.click(resolveButton);

      expect(onResolveDispute).toHaveBeenCalledWith('dispute-1');
    });

    it('should show pagination when multiple pages', () => {
      render(
        <UnifiedDisputeList
          variant="table"
          disputes={mockDisputes}
          totalCount={100}
          currentPage={0}
          pageSize={20}
        />
      );

      expect(screen.getByText(/Sayfa 1 \/ 5/i)).toBeInTheDocument();
      expect(screen.getByText('Önceki')).toBeInTheDocument();
      expect(screen.getByText('Sonraki')).toBeInTheDocument();
    });

    it('should disable previous button on first page', () => {
      render(
        <UnifiedDisputeList
          variant="table"
          disputes={mockDisputes}
          totalCount={100}
          currentPage={0}
          pageSize={20}
        />
      );

      const prevButton = screen.getByText('Önceki').closest('button');
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', () => {
      render(
        <UnifiedDisputeList
          variant="table"
          disputes={mockDisputes}
          totalCount={40}
          currentPage={1}
          pageSize={20}
        />
      );

      const nextButton = screen.getByText('Sonraki').closest('button');
      expect(nextButton).toBeDisabled();
    });

    it('should call onPageChange when pagination buttons clicked', async () => {
      const onPageChange = jest.fn();
      const user = userEvent.setup();

      render(
        <UnifiedDisputeList
          variant="table"
          disputes={mockDisputes}
          totalCount={100}
          currentPage={1}
          pageSize={20}
          onPageChange={onPageChange}
        />
      );

      // Click next
      const nextButton = screen.getByText('Sonraki');
      await user.click(nextButton);
      expect(onPageChange).toHaveBeenCalledWith(2);

      // Click previous
      const prevButton = screen.getByText('Önceki');
      await user.click(prevButton);
      expect(onPageChange).toHaveBeenCalledWith(0);
    });
  });

  // ============================================================================
  // VARIANT: TABLE-ADVANCED
  // ============================================================================

  describe('Table Advanced Variant', () => {
    it('should render with filters', () => {
      render(
        <UnifiedDisputeList variant="table-advanced" disputes={mockDisputes} />
      );

      expect(screen.getByText('İtiraz Yönetimi')).toBeInTheDocument();
      expect(screen.getByText('Filtrele')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/ID, kullanıcı veya açıklama/i)
      ).toBeInTheDocument();
    });

    it('should show refresh and export buttons', () => {
      const onRefresh = jest.fn();
      const onExport = jest.fn();

      render(
        <UnifiedDisputeList
          variant="table-advanced"
          disputes={mockDisputes}
          onRefresh={onRefresh}
          onExport={onExport}
        />
      );

      expect(screen.getByText('Yenile')).toBeInTheDocument();
      expect(screen.getByText('Dışa Aktar')).toBeInTheDocument();
    });

    it('should call onRefresh when refresh button clicked', async () => {
      const onRefresh = jest.fn();
      const user = userEvent.setup();

      render(
        <UnifiedDisputeList
          variant="table-advanced"
          disputes={mockDisputes}
          onRefresh={onRefresh}
        />
      );

      const refreshButton = screen.getByText('Yenile');
      await user.click(refreshButton);

      expect(onRefresh).toHaveBeenCalled();
    });

    it('should call onExport when export button clicked', async () => {
      const onExport = jest.fn();
      const user = userEvent.setup();

      render(
        <UnifiedDisputeList
          variant="table-advanced"
          disputes={mockDisputes}
          onExport={onExport}
        />
      );

      const exportButton = screen.getByText('Dışa Aktar');
      await user.click(exportButton);

      expect(onExport).toHaveBeenCalled();
    });

    it('should filter by search term', async () => {
      const user = userEvent.setup();

      render(
        <UnifiedDisputeList variant="table-advanced" disputes={mockDisputes} />
      );

      const searchInput = screen.getByPlaceholderText(
        /ID, kullanıcı veya açıklama/i
      );
      await user.type(searchInput, 'John');

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('should filter by status', async () => {
      const user = userEvent.setup();

      render(
        <UnifiedDisputeList variant="table-advanced" disputes={mockDisputes} />
      );

      // Find and click status select
      const statusSelect = screen.getByRole('combobox', { name: /durum/i });
      await user.click(statusSelect);

      // Select "OPEN"
      const openOption = screen.getByText('Açık');
      await user.click(openOption);

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
      });
    });

    it('should clear filters when clear button clicked', async () => {
      const user = userEvent.setup();

      render(
        <UnifiedDisputeList
          variant="table-advanced"
          disputes={mockDisputes}
          initialFilters={{ search: 'John', status: 'OPEN' as DisputeStatus }}
        />
      );

      // Clear filters button should be visible
      const clearButton = screen.getByText('Filtreleri Temizle');
      await user.click(clearButton);

      // All disputes should be visible again
      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================

  describe('Edge Cases', () => {
    it('should handle undefined disputes gracefully', () => {
      render(<UnifiedDisputeList variant="card" disputes={undefined} />);

      expect(screen.getByText(/İtiraz Bulunamadı/i)).toBeInTheDocument();
    });

    it('should handle missing optional callbacks', async () => {
      const user = userEvent.setup();

      render(<UnifiedDisputeList variant="table" disputes={mockDisputes} />);

      // Should render without errors
      const viewButtons = screen.getAllByText('Görüntüle');
      await user.click(viewButtons[0]);
      // No error should be thrown
    });

    it('should apply custom className', () => {
      const { container } = render(
        <UnifiedDisputeList
          variant="card"
          disputes={mockDisputes}
          className="custom-test-class"
        />
      );

      const element = container.querySelector('.custom-test-class');
      expect(element).toBeInTheDocument();
    });
  });

  // ============================================================================
  // ACCESSIBILITY
  // ============================================================================

  describe('Accessibility', () => {
    it('should have accessible loading state', () => {
      render(<UnifiedDisputeList variant="card" isLoading={true} />);

      // Loading spinner should be accessible
      expect(screen.getByRole('status', { hidden: true })).toBeInTheDocument();
    });

    it('should have accessible error alert', () => {
      render(<UnifiedDisputeList variant="card" error="Test error" />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should have accessible table', () => {
      render(<UnifiedDisputeList variant="table" disputes={mockDisputes} />);

      expect(screen.getByRole('table')).toBeInTheDocument();
      expect(screen.getAllByRole('columnheader')).toHaveLength(7);
    });

    it('should have accessible buttons', () => {
      render(<UnifiedDisputeList variant="table" disputes={mockDisputes} />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveAccessibleName();
      });
    });
  });
});
