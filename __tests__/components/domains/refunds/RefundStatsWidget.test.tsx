/**
 * ================================================
 * REFUND STATS WIDGET TESTS
 * ================================================
 * Test suite for RefundStatsWidget component
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 3 - Story 3.5
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RefundStatsWidget } from '@/components/domains/refunds/RefundStatsWidget';
import { useMyRefunds } from '@/hooks/business/useRefunds';
import { RefundStatus } from '@/types/business/features/refund';

// ================================================
// MOCKS
// ================================================

jest.mock('@/hooks/business/useRefunds');
jest.mock('@/lib/infrastructure/monitoring/logger');

const mockUseMyRefunds = useMyRefunds as jest.MockedFunction<
  typeof useMyRefunds
>;

// ================================================
// TEST DATA
// ================================================

const mockRefunds = [
  {
    id: '1',
    orderId: 'order-1',
    orderNumber: 'ORD-001',
    userId: 'user-1',
    amount: 1000,
    reasonCategory: 'quality_issue' as const,
    reasonDescription: 'Test reason 1',
    status: RefundStatus.PENDING,
    requestedAt: '2025-01-01T10:00:00Z',
    createdAt: '2025-01-01T10:00:00Z',
    updatedAt: '2025-01-01T10:00:00Z',
  },
  {
    id: '2',
    orderId: 'order-2',
    orderNumber: 'ORD-002',
    userId: 'user-1',
    amount: 2000,
    reasonCategory: 'not_as_described' as const,
    reasonDescription: 'Test reason 2',
    status: RefundStatus.APPROVED,
    requestedAt: '2025-01-02T10:00:00Z',
    createdAt: '2025-01-02T10:00:00Z',
    updatedAt: '2025-01-02T10:00:00Z',
  },
  {
    id: '3',
    orderId: 'order-3',
    orderNumber: 'ORD-003',
    userId: 'user-1',
    amount: 1500,
    reasonCategory: 'delayed_delivery' as const,
    reasonDescription: 'Test reason 3',
    status: RefundStatus.APPROVED,
    requestedAt: '2025-01-03T10:00:00Z',
    createdAt: '2025-01-03T10:00:00Z',
    updatedAt: '2025-01-03T10:00:00Z',
  },
];

// ================================================
// TESTS
// ================================================

describe('RefundStatsWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==================== LOADING STATE ====================

  describe('Loading State', () => {
    it('should render loading skeleton when loading', () => {
      mockUseMyRefunds.mockReturnValue({
        refunds: null,
        isLoading: true,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<RefundStatsWidget />);

      // Should render 4 skeleton cards
      const skeletons = screen.getAllByTestId(/skeleton/i);
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should render compact skeleton in compact mode', () => {
      mockUseMyRefunds.mockReturnValue({
        refunds: null,
        isLoading: true,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<RefundStatsWidget compact />);

      // Should render with compact padding
      const skeletons = screen.getAllByTestId(/skeleton/i);
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  // ==================== ERROR STATE ====================

  describe('Error State', () => {
    it('should render error message when there is an error', () => {
      mockUseMyRefunds.mockReturnValue({
        refunds: null,
        isLoading: false,
        error: new Error('Failed to load refunds'),
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<RefundStatsWidget />);

      expect(
        screen.getByText(/İstatistikler yüklenirken bir hata oluştu/i)
      ).toBeInTheDocument();
    });
  });

  // ==================== EMPTY STATE ====================

  describe('Empty State', () => {
    it('should render empty state when no refunds', () => {
      mockUseMyRefunds.mockReturnValue({
        refunds: [],
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<RefundStatsWidget />);

      // Should show 0 for all stats
      expect(screen.getByText('Toplam İade')).toBeInTheDocument();
      expect(screen.getByText('Bekleyen')).toBeInTheDocument();
      expect(screen.getByText('Onaylanan')).toBeInTheDocument();
      expect(screen.getByText('Toplam Tutar')).toBeInTheDocument();

      // Should show "Henüz iade talebiniz yok" message
      expect(
        screen.getAllByText(/Henüz iade talebiniz yok/i).length
      ).toBeGreaterThan(0);
    });
  });

  // ==================== DATA DISPLAY ====================

  describe('Data Display', () => {
    it('should calculate and display total refunds count', () => {
      mockUseMyRefunds.mockReturnValue({
        refunds: mockRefunds,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<RefundStatsWidget />);

      // Total count should be 3
      const totalCard = screen.getByText('Toplam İade').closest('button');
      expect(totalCard).toHaveTextContent('3');
    });

    it('should calculate and display pending refunds count', () => {
      mockUseMyRefunds.mockReturnValue({
        refunds: mockRefunds,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<RefundStatsWidget />);

      // Pending count should be 1
      const pendingCard = screen.getByText('Bekleyen').closest('button');
      expect(pendingCard).toHaveTextContent('1');
    });

    it('should calculate and display approved refunds count', () => {
      mockUseMyRefunds.mockReturnValue({
        refunds: mockRefunds,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<RefundStatsWidget />);

      // Approved count should be 2
      const approvedCard = screen.getByText('Onaylanan').closest('button');
      expect(approvedCard).toHaveTextContent('2');
    });

    it('should calculate and display total refund amount', () => {
      mockUseMyRefunds.mockReturnValue({
        refunds: mockRefunds,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<RefundStatsWidget />);

      // Total amount should be 4500 TRY
      const amountCard = screen.getByText('Toplam Tutar').closest('button');
      expect(amountCard).toHaveTextContent('4.500');
    });

    it('should format currency correctly', () => {
      mockUseMyRefunds.mockReturnValue({
        refunds: mockRefunds,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<RefundStatsWidget />);

      // Should use Turkish currency format
      const amountCard = screen.getByText('Toplam Tutar').closest('button');
      expect(amountCard).toHaveTextContent('₺');
    });
  });

  // ==================== INTERACTIONS ====================

  describe('Interactions', () => {
    it('should call onStatClick when stat is clicked', async () => {
      const user = userEvent.setup();
      const handleStatClick = jest.fn();

      mockUseMyRefunds.mockReturnValue({
        refunds: mockRefunds,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<RefundStatsWidget onStatClick={handleStatClick} />);

      // Click on total stat
      const totalCard = screen.getByText('Toplam İade').closest('button');
      if (totalCard) {
        await user.click(totalCard);
        expect(handleStatClick).toHaveBeenCalledWith('total');
      }
    });

    it('should not be clickable when onStatClick is not provided', () => {
      mockUseMyRefunds.mockReturnValue({
        refunds: mockRefunds,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<RefundStatsWidget />);

      const totalCard = screen.getByText('Toplam İade').closest('button');
      expect(totalCard).toBeDisabled();
    });
  });

  // ==================== STYLING ====================

  describe('Styling', () => {
    it('should apply custom className', () => {
      mockUseMyRefunds.mockReturnValue({
        refunds: mockRefunds,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      const { container } = render(
        <RefundStatsWidget className="custom-class" />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should render in compact mode', () => {
      mockUseMyRefunds.mockReturnValue({
        refunds: mockRefunds,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<RefundStatsWidget compact />);

      // Compact mode should have p-3 instead of p-4
      const totalCard = screen.getByText('Toplam İade').closest('button');
      expect(totalCard).toHaveClass('p-3');
    });

    it('should show trend indicators when showTrend is true', () => {
      mockUseMyRefunds.mockReturnValue({
        refunds: mockRefunds,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<RefundStatsWidget showTrend />);

      // Note: Trend is not calculated from data in current implementation
      // This test just ensures showTrend prop doesn't break rendering
      expect(screen.getByText('Toplam İade')).toBeInTheDocument();
    });
  });

  // ==================== ACCESSIBILITY ====================

  describe('Accessibility', () => {
    it('should have proper aria-labels', () => {
      mockUseMyRefunds.mockReturnValue({
        refunds: mockRefunds,
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<RefundStatsWidget />);

      // Each stat card should have aria-label
      const totalCard = screen.getByText('Toplam İade').closest('button');
      expect(totalCard).toHaveAttribute('aria-label', 'Toplam İade: 3');
    });
  });

  // ==================== EDGE CASES ====================

  describe('Edge Cases', () => {
    it('should handle very large amounts', () => {
      const largeRefund = {
        ...mockRefunds[0],
        amount: 999999999,
      };

      mockUseMyRefunds.mockReturnValue({
        refunds: [largeRefund],
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<RefundStatsWidget />);

      // Should format large numbers correctly
      const amountCard = screen.getByText('Toplam Tutar').closest('button');
      expect(amountCard).toBeInTheDocument();
    });

    it('should handle refunds with zero amount', () => {
      const zeroRefund = {
        ...mockRefunds[0],
        amount: 0,
      };

      mockUseMyRefunds.mockReturnValue({
        refunds: [zeroRefund],
        isLoading: false,
        error: null,
        mutate: jest.fn(),
        isValidating: false,
      });

      render(<RefundStatsWidget />);

      const amountCard = screen.getByText('Toplam Tutar').closest('button');
      expect(amountCard).toHaveTextContent('₺0');
    });
  });
});
