/**
 * ================================================
 * ACCEPT MILESTONE FUNCTIONALITY - TESTS
 * ================================================
 * Sprint Day 3 - Story 3.1: Accept milestone tests (1.5 SP)
 *
 * Test Coverage:
 * - Accept button visibility
 * - API call validation
 * - Status change to ACCEPTED
 * - Payment release confirmation
 * - Employer-only permissions
 * - Delivered milestone requirement
 * - Auto-acceptance countdown
 * - Error handling
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { toast } from 'sonner';
import { MilestoneList } from '@/components/domains/milestones';
import {
  useMilestoneActions,
  useOrderMilestones,
} from '@/hooks/business/useMilestones';
import { useMilestoneWebSocket } from '@/hooks/business/useMilestoneWebSocket';
import { useAutoAcceptanceCountdown } from '@/hooks/business/useAutoAcceptanceCountdown';
import type { OrderMilestone } from '@/types/business/features/milestone';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/hooks/business/useMilestones');
jest.mock('@/hooks/business/useMilestoneWebSocket');
jest.mock('@/hooks/business/useAutoAcceptanceCountdown');
jest.mock('sonner');

// Mock modals
jest.mock('@/components/domains/milestones/DeliverMilestoneModal', () => ({
  DeliverMilestoneModal: () => <div>Deliver Modal</div>,
}));

jest.mock('@/components/domains/milestones/AcceptMilestoneModal', () => ({
  AcceptMilestoneModal: ({
    milestone,
    isOpen,
    onClose,
    onSuccess,
  }: {
    milestone: OrderMilestone;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
  }) =>
    isOpen ? (
      <div data-testid="accept-modal">
        <h2>Milestone Onayla</h2>
        <p>{milestone.title}</p>
        <button onClick={onSuccess}>Onayla ve Ödemeyi Serbest Bırak</button>
        <button onClick={onClose}>İptal</button>
      </div>
    ) : null,
}));

jest.mock('@/components/domains/milestones/RejectMilestoneModal', () => ({
  RejectMilestoneModal: () => <div>Reject Modal</div>,
}));

// ============================================================================
// TEST DATA
// ============================================================================

const createMockMilestone = (
  overrides?: Partial<OrderMilestone>
): OrderMilestone => ({
  id: 'milestone-1',
  orderId: 'order-1',
  sequence: 1,
  title: 'Design Phase',
  description: 'Complete UI/UX design',
  amount: 500,
  status: 'DELIVERED',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  dueDate: '2024-02-01T00:00:00Z',
  deliveredAt: '2024-01-15T10:00:00Z',
  deliveryNotes: 'All design files completed',
  ...overrides,
});

// ============================================================================
// TEST SUITE: ACCEPT MILESTONE FUNCTIONALITY
// ============================================================================

describe('Accept Milestone Functionality', () => {
  const mockAcceptMilestone = jest.fn();
  const mockRefetch = jest.fn();
  const mockSubscribe = jest.fn();
  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    (useOrderMilestones as jest.Mock).mockReturnValue({
      milestones: [createMockMilestone()],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    (useMilestoneActions as jest.Mock).mockReturnValue({
      acceptMilestone: mockAcceptMilestone,
      isAccepting: false,
      startMilestone: jest.fn(),
      isStarting: false,
      deliverMilestone: jest.fn(),
      isDelivering: false,
      rejectMilestone: jest.fn(),
      isRejecting: false,
    });

    (useMilestoneWebSocket as jest.Mock).mockReturnValue({
      subscribe: mockSubscribe,
      unsubscribe: mockUnsubscribe,
      isConnected: true,
      connectionStatus: 'CONNECTED',
    });

    (useAutoAcceptanceCountdown as jest.Mock).mockReturnValue({
      timeRemaining: null,
      isWarning: false,
    });

    jest.clearAllMocks();
  });

  // ==========================================================================
  // 1. ACCEPT BUTTON VISIBILITY
  // ==========================================================================

  describe('Accept Button Visibility', () => {
    test('shows "Onayla" button for DELIVERED milestone as EMPLOYER', () => {
      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      const acceptButton = screen.getByRole('button', { name: /onayla/i });
      expect(acceptButton).toBeDefined();
      expect(acceptButton).not.toHaveAttribute('disabled');
    });

    test('does not show accept button for DELIVERED milestone as FREELANCER', () => {
      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      const acceptButton = screen.queryByRole('button', { name: /^onayla$/i });
      expect(acceptButton).toBeNull();
    });

    test('does not show accept button for PENDING milestone', () => {
      (useOrderMilestones as jest.Mock).mockReturnValue({
        milestones: [createMockMilestone({ status: 'PENDING' })],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      const acceptButton = screen.queryByRole('button', { name: /^onayla$/i });
      expect(acceptButton).toBeNull();
    });

    test('does not show accept button for IN_PROGRESS milestone', () => {
      (useOrderMilestones as jest.Mock).mockReturnValue({
        milestones: [createMockMilestone({ status: 'IN_PROGRESS' })],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      const acceptButton = screen.queryByRole('button', { name: /^onayla$/i });
      expect(acceptButton).toBeNull();
    });

    test('does not show accept button for already ACCEPTED milestone', () => {
      (useOrderMilestones as jest.Mock).mockReturnValue({
        milestones: [createMockMilestone({ status: 'ACCEPTED' })],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      const acceptButton = screen.queryByRole('button', { name: /^onayla$/i });
      expect(acceptButton).toBeNull();
    });
  });

  // ==========================================================================
  // 2. ACCEPT MILESTONE API CALL
  // ==========================================================================

  describe('Accept Milestone API Call', () => {
    test('opens AcceptMilestoneModal when accept button clicked', async () => {
      const user = userEvent.setup();

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      const acceptButton = screen.getByRole('button', { name: /onayla/i });
      await user.click(acceptButton);

      await waitFor(() => {
        expect(screen.getByTestId('accept-modal')).toBeDefined();
        expect(screen.getByText(/design phase/i)).toBeDefined();
      });
    });

    test('calls acceptMilestone with correct milestone ID', async () => {
      const user = userEvent.setup();

      mockAcceptMilestone.mockResolvedValue(
        createMockMilestone({ status: 'ACCEPTED' })
      );

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      const acceptButton = screen.getByRole('button', { name: /onayla/i });
      await user.click(acceptButton);

      const confirmButton = await screen.findByRole('button', {
        name: /onayla ve ödemeyi serbest bırak/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockAcceptMilestone).toHaveBeenCalledTimes(1);
        expect(mockAcceptMilestone).toHaveBeenCalledWith('milestone-1');
      });
    });

    test('shows loading state during acceptance', async () => {
      (useMilestoneActions as jest.Mock).mockReturnValue({
        acceptMilestone: mockAcceptMilestone,
        isAccepting: true,
        startMilestone: jest.fn(),
        deliverMilestone: jest.fn(),
        rejectMilestone: jest.fn(),
      });

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      const acceptButton = screen.getByRole('button', { name: /onayla/i });
      expect(acceptButton).toHaveAttribute('disabled');
    });

    test('shows success toast after acceptance', async () => {
      const user = userEvent.setup();

      mockAcceptMilestone.mockResolvedValue(
        createMockMilestone({ status: 'ACCEPTED' })
      );

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      const acceptButton = screen.getByRole('button', { name: /onayla/i });
      await user.click(acceptButton);

      const confirmButton = await screen.findByRole('button', {
        name: /onayla ve ödemeyi serbest bırak/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringMatching(/milestone onaylandı.*ödeme serbest/i)
        );
      });
    });
  });

  // ==========================================================================
  // 3. STATUS CHANGE TO ACCEPTED
  // ==========================================================================

  describe('Status Change to ACCEPTED', () => {
    test('updates milestone status to ACCEPTED after acceptance', async () => {
      const user = userEvent.setup();

      const acceptedMilestone = createMockMilestone({
        status: 'ACCEPTED',
        acceptedAt: '2024-01-20T14:00:00Z',
      });

      mockAcceptMilestone.mockResolvedValue(acceptedMilestone);

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      // Initially DELIVERED
      expect(screen.getByText(/teslim edildi/i)).toBeDefined();

      const acceptButton = screen.getByRole('button', { name: /onayla/i });
      await user.click(acceptButton);

      const confirmButton = await screen.findByRole('button', {
        name: /onayla ve ödemeyi serbest bırak/i,
      });
      await user.click(confirmButton);

      // Update mock to return ACCEPTED status
      (useOrderMilestones as jest.Mock).mockReturnValue({
        milestones: [acceptedMilestone],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      // Re-render
      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      await waitFor(() => {
        expect(screen.getByText(/onaylandı/i)).toBeDefined();
      });
    });

    test('removes accept/reject buttons after acceptance', async () => {
      (useOrderMilestones as jest.Mock).mockReturnValue({
        milestones: [createMockMilestone({ status: 'ACCEPTED' })],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      const acceptButton = screen.queryByRole('button', { name: /^onayla$/i });
      const rejectButton = screen.queryByRole('button', {
        name: /revizyon iste/i,
      });

      expect(acceptButton).toBeNull();
      expect(rejectButton).toBeNull();
    });
  });

  // ==========================================================================
  // 4. PAYMENT RELEASE CONFIRMATION
  // ==========================================================================

  describe('Payment Release Confirmation', () => {
    test('shows payment amount in accept modal', async () => {
      const user = userEvent.setup();

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      const acceptButton = screen.getByRole('button', { name: /onayla/i });
      await user.click(acceptButton);

      await waitFor(() => {
        expect(screen.getByText(/₺500|500.*try/i)).toBeDefined();
      });
    });

    test('confirms payment release in success message', async () => {
      const user = userEvent.setup();

      mockAcceptMilestone.mockResolvedValue(
        createMockMilestone({ status: 'ACCEPTED' })
      );

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      const acceptButton = screen.getByRole('button', { name: /onayla/i });
      await user.click(acceptButton);

      const confirmButton = await screen.findByRole('button', {
        name: /onayla ve ödemeyi serbest bırak/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringMatching(/ödeme serbest bırakıldı|payment released/i)
        );
      });
    });

    test('prevents acceptance if payment processing fails', async () => {
      const user = userEvent.setup();

      mockAcceptMilestone.mockRejectedValue(
        new Error('Payment processing failed')
      );

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      const acceptButton = screen.getByRole('button', { name: /onayla/i });
      await user.click(acceptButton);

      const confirmButton = await screen.findByRole('button', {
        name: /onayla ve ödemeyi serbest bırak/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/payment processing failed/i)
        );
      });

      // Status should remain DELIVERED
      expect(screen.getByText(/teslim edildi/i)).toBeDefined();
    });
  });

  // ==========================================================================
  // 5. AUTO-ACCEPTANCE COUNTDOWN
  // ==========================================================================

  describe('Auto-Acceptance Countdown', () => {
    test('shows countdown timer for DELIVERED milestone', () => {
      (useAutoAcceptanceCountdown as jest.Mock).mockReturnValue({
        timeRemaining: 48 * 60 * 60 * 1000, // 48 hours
        isWarning: false,
      });

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      expect(screen.getByText(/48.*saat|48.*hours/i)).toBeDefined();
    });

    test('shows warning when countdown < 24 hours', () => {
      (useAutoAcceptanceCountdown as jest.Mock).mockReturnValue({
        timeRemaining: 12 * 60 * 60 * 1000, // 12 hours
        isWarning: true,
      });

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      const countdown = screen.getByText(/12.*saat|12.*hours/i);
      expect(countdown).toHaveClass(/warning|text-orange|text-yellow/);
    });

    test('auto-accepts milestone when countdown reaches 0', async () => {
      (useAutoAcceptanceCountdown as jest.Mock).mockReturnValue({
        timeRemaining: 0,
        isWarning: true,
      });

      mockAcceptMilestone.mockResolvedValue(
        createMockMilestone({ status: 'ACCEPTED' })
      );

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      await waitFor(() => {
        expect(mockAcceptMilestone).toHaveBeenCalledWith('milestone-1');
      });
    });

    test('does not show countdown for already ACCEPTED milestone', () => {
      (useOrderMilestones as jest.Mock).mockReturnValue({
        milestones: [createMockMilestone({ status: 'ACCEPTED' })],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      expect(screen.queryByText(/saat.*kaldı|hours.*remaining/i)).toBeNull();
    });
  });

  // ==========================================================================
  // 6. ERROR HANDLING
  // ==========================================================================

  describe('Error Handling', () => {
    test('shows error toast when acceptance fails', async () => {
      const user = userEvent.setup();

      mockAcceptMilestone.mockRejectedValue(
        new Error('Backend error: Cannot accept milestone')
      );

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      const acceptButton = screen.getByRole('button', { name: /onayla/i });
      await user.click(acceptButton);

      const confirmButton = await screen.findByRole('button', {
        name: /onayla ve ödemeyi serbest bırak/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringMatching(/cannot accept milestone/i)
        );
      });
    });

    test('keeps button enabled after error for retry', async () => {
      const user = userEvent.setup();

      mockAcceptMilestone.mockRejectedValue(new Error('Network error'));

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      const acceptButton = screen.getByRole('button', { name: /onayla/i });
      await user.click(acceptButton);

      const confirmButton = await screen.findByRole('button', {
        name: /onayla ve ödemeyi serbest bırak/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      // Modal should still be open for retry
      expect(screen.getByTestId('accept-modal')).toBeDefined();
    });

    test('does not change milestone status on error', async () => {
      const user = userEvent.setup();

      mockAcceptMilestone.mockRejectedValue(new Error('Acceptance failed'));

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      const acceptButton = screen.getByRole('button', { name: /onayla/i });
      await user.click(acceptButton);

      const confirmButton = await screen.findByRole('button', {
        name: /onayla ve ödemeyi serbest bırak/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });

      // Status should still be DELIVERED
      expect(screen.getByText(/teslim edildi/i)).toBeDefined();
    });
  });

  // ==========================================================================
  // 7. ROLE-BASED PERMISSIONS
  // ==========================================================================

  describe('Role-Based Permissions', () => {
    test('EMPLOYER can accept DELIVERED milestone', () => {
      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      const acceptButton = screen.getByRole('button', { name: /onayla/i });
      expect(acceptButton).toBeDefined();
    });

    test('FREELANCER cannot accept DELIVERED milestone', () => {
      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      const acceptButton = screen.queryByRole('button', { name: /^onayla$/i });
      expect(acceptButton).toBeNull();
    });

    test('EMPLOYER cannot accept non-delivered milestone', () => {
      (useOrderMilestones as jest.Mock).mockReturnValue({
        milestones: [createMockMilestone({ status: 'IN_PROGRESS' })],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      const acceptButton = screen.queryByRole('button', { name: /^onayla$/i });
      expect(acceptButton).toBeNull();
    });
  });
});
