/**
 * ================================================
 * MILESTONE LIST COMPONENT TESTS
 * ================================================
 * Comprehensive test suite for MilestoneList component
 * Sprint 1 - Story 1.5: Component Tests (2 SP)
 *
 * Test Coverage:
 * - Component rendering
 * - Role-based action visibility
 * - Status indicators
 * - User interactions
 * - WebSocket integration
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MilestoneList } from '@/components/domains/milestones';
import { MilestoneStatus } from '@/types/business/features/milestone';
import type { OrderMilestone } from '@/types/business/features/milestone';

// ============================================================================
// MOCKS
// ============================================================================

// Mock hooks
jest.mock('@/hooks/business/useMilestones', () => ({
  useOrderMilestones: jest.fn(),
  useMilestoneActions: jest.fn(),
}));

jest.mock('@/hooks/business/useMilestoneWebSocket', () => ({
  useMilestoneWebSocket: jest.fn(),
}));

jest.mock('@/hooks/business/useAutoAcceptanceCountdown', () => ({
  useAutoAcceptanceCountdown: jest.fn(),
}));

// Mock modals
jest.mock('@/components/domains/milestones/DeliverMilestoneModal', () => ({
  DeliverMilestoneModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="deliver-modal">Deliver Modal</div> : null,
}));

jest.mock('@/components/domains/milestones/AcceptMilestoneModal', () => ({
  AcceptMilestoneModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="accept-modal">Accept Modal</div> : null,
}));

jest.mock('@/components/domains/milestones/RejectMilestoneModal', () => ({
  RejectMilestoneModal: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="reject-modal">Reject Modal</div> : null,
}));

import {
  useOrderMilestones,
  useMilestoneActions,
} from '@/hooks/business/useMilestones';
import { useMilestoneWebSocket } from '@/hooks/business/useMilestoneWebSocket';
import { useAutoAcceptanceCountdown } from '@/hooks/business/useAutoAcceptanceCountdown';

const mockUseOrderMilestones = useOrderMilestones as jest.Mock;
const mockUseMilestoneActions = useMilestoneActions as jest.Mock;
const mockUseMilestoneWebSocket = useMilestoneWebSocket as jest.Mock;
const mockUseAutoAcceptanceCountdown = useAutoAcceptanceCountdown as jest.Mock;

// ============================================================================
// TEST DATA
// ============================================================================

const createMockMilestone = (
  overrides?: Partial<OrderMilestone>
): OrderMilestone => ({
  id: 'milestone-1',
  orderId: 'order-1',
  sequence: 1,
  title: 'Initial Design',
  description: 'Create wireframes and mockups',
  amount: 500,
  currency: 'TRY',
  dueDate: '2025-12-01T00:00:00Z',
  status: MilestoneStatus.PENDING,
  createdAt: '2025-11-01T00:00:00Z',
  updatedAt: '2025-11-01T00:00:00Z',
  ...overrides,
});

const mockMilestones: OrderMilestone[] = [
  createMockMilestone({
    id: 'milestone-1',
    sequence: 1,
    title: 'Initial Design',
    status: MilestoneStatus.PENDING,
  }),
  createMockMilestone({
    id: 'milestone-2',
    sequence: 2,
    title: 'Development',
    status: MilestoneStatus.IN_PROGRESS,
  }),
  createMockMilestone({
    id: 'milestone-3',
    sequence: 3,
    title: 'Testing',
    status: MilestoneStatus.DELIVERED,
    deliveredAt: '2025-11-15T00:00:00Z',
  }),
  createMockMilestone({
    id: 'milestone-4',
    sequence: 4,
    title: 'Deployment',
    status: MilestoneStatus.ACCEPTED,
    acceptedAt: '2025-11-16T00:00:00Z',
  }),
];

// ============================================================================
// TEST SUITE
// ============================================================================

describe('MilestoneList', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    mockUseOrderMilestones.mockReturnValue({
      milestones: mockMilestones,
      isLoading: false,
      error: null,
      refetch: jest.fn(),
    });

    mockUseMilestoneActions.mockReturnValue({
      startMilestone: jest.fn(),
      deliverMilestone: jest.fn(),
      acceptMilestone: jest.fn(),
      rejectMilestone: jest.fn(),
      isStarting: false,
      isDelivering: false,
      isAccepting: false,
      isRejecting: false,
    });

    mockUseMilestoneWebSocket.mockReturnValue({
      isConnected: true,
      isReconnecting: false,
      subscribeToMilestone: jest.fn(),
      subscribeToOrderMilestones: jest.fn(),
      syncMissedMessages: jest.fn(),
    });

    mockUseAutoAcceptanceCountdown.mockReturnValue(null);
  });

  // ==========================================================================
  // RENDERING TESTS
  // ==========================================================================

  describe('Rendering', () => {
    it('should render milestone list successfully', () => {
      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      expect(screen.getByText('Initial Design')).toBeInTheDocument();
      expect(screen.getByText('Development')).toBeInTheDocument();
      expect(screen.getByText('Testing')).toBeInTheDocument();
      expect(screen.getByText('Deployment')).toBeInTheDocument();
    });

    it('should display milestone sequence numbers', () => {
      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should show loading state', () => {
      mockUseOrderMilestones.mockReturnValue({
        milestones: [],
        isLoading: true,
        error: null,
        refetch: jest.fn(),
      });

      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      expect(screen.getByText(/yükleniyor/i)).toBeInTheDocument();
    });

    it('should show empty state when no milestones', () => {
      mockUseOrderMilestones.mockReturnValue({
        milestones: [],
        isLoading: false,
        error: null,
        refetch: jest.fn(),
      });

      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      expect(
        screen.getByText(/henüz milestone tanımlanmamış/i)
      ).toBeInTheDocument();
    });

    it('should show error state', () => {
      mockUseOrderMilestones.mockReturnValue({
        milestones: [],
        isLoading: false,
        error: new Error('Failed to load milestones'),
        refetch: jest.fn(),
      });

      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      expect(screen.getByText(/hata oluştu/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // STATUS DISPLAY TESTS
  // ==========================================================================

  describe('Status Display', () => {
    it('should show correct status badges', () => {
      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      expect(screen.getByText('Beklemede')).toBeInTheDocument();
      expect(screen.getByText('Devam Ediyor')).toBeInTheDocument();
      expect(screen.getByText('Teslim Edildi')).toBeInTheDocument();
      expect(screen.getByText('Onaylandı')).toBeInTheDocument();
    });

    it('should display milestone amounts', () => {
      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      const amounts = screen.getAllByText(/500/);
      expect(amounts.length).toBeGreaterThan(0);
    });

    it('should show due dates', () => {
      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      expect(screen.getAllByText(/2025/i).length).toBeGreaterThan(0);
    });
  });

  // ==========================================================================
  // ROLE-BASED ACTION TESTS
  // ==========================================================================

  describe('Freelancer Actions', () => {
    it('should show Start button for pending milestone (FREELANCER)', () => {
      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      expect(screen.getByText('İşe Başla')).toBeInTheDocument();
    });

    it('should show Deliver button for in-progress milestone (FREELANCER)', () => {
      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      expect(screen.getByText('Teslim Et')).toBeInTheDocument();
    });

    it('should NOT show Accept/Reject buttons for FREELANCER', () => {
      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      expect(screen.queryByText('Onayla')).not.toBeInTheDocument();
      expect(screen.queryByText('Revizyon İste')).not.toBeInTheDocument();
    });

    it('should call startMilestone when Start button clicked', async () => {
      const mockStart = jest.fn();
      mockUseMilestoneActions.mockReturnValue({
        startMilestone: mockStart,
        deliverMilestone: jest.fn(),
        acceptMilestone: jest.fn(),
        rejectMilestone: jest.fn(),
        isStarting: false,
        isDelivering: false,
        isAccepting: false,
        isRejecting: false,
      });

      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      const startButton = screen.getByText('İşe Başla');
      await userEvent.click(startButton);

      await waitFor(() => {
        expect(mockStart).toHaveBeenCalledWith('milestone-1');
      });
    });

    it('should open DeliverMilestoneModal when Deliver clicked', async () => {
      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      const deliverButton = screen.getByText('Teslim Et');
      await userEvent.click(deliverButton);

      await waitFor(() => {
        expect(screen.getByTestId('deliver-modal')).toBeInTheDocument();
      });
    });
  });

  describe('Employer Actions', () => {
    it('should show Accept button for delivered milestone (EMPLOYER)', () => {
      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      expect(screen.getByText('Onayla')).toBeInTheDocument();
    });

    it('should show Reject button for delivered milestone (EMPLOYER)', () => {
      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      expect(screen.getByText('Revizyon İste')).toBeInTheDocument();
    });

    it('should NOT show Start/Deliver buttons for EMPLOYER', () => {
      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      expect(screen.queryByText('İşe Başla')).not.toBeInTheDocument();
      expect(screen.queryByText('Teslim Et')).not.toBeInTheDocument();
    });

    it('should open AcceptMilestoneModal when Accept clicked', async () => {
      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      const acceptButton = screen.getByText('Onayla');
      await userEvent.click(acceptButton);

      await waitFor(() => {
        expect(screen.getByTestId('accept-modal')).toBeInTheDocument();
      });
    });

    it('should open RejectMilestoneModal when Reject clicked', async () => {
      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      const rejectButton = screen.getByText('Revizyon İste');
      await userEvent.click(rejectButton);

      await waitFor(() => {
        expect(screen.getByTestId('reject-modal')).toBeInTheDocument();
      });
    });
  });

  // ==========================================================================
  // AUTO-ACCEPTANCE COUNTDOWN TESTS
  // ==========================================================================

  describe('Auto-Acceptance Countdown', () => {
    it('should show countdown for delivered milestone', () => {
      mockUseAutoAcceptanceCountdown.mockReturnValue({
        hours: 24,
        minutes: 30,
        seconds: 15,
        isExpired: false,
        formattedTime: '24:30:15',
      });

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      expect(screen.getByText(/24:30:15/)).toBeInTheDocument();
    });

    it('should show warning when countdown < 24 hours', () => {
      mockUseAutoAcceptanceCountdown.mockReturnValue({
        hours: 12,
        minutes: 0,
        seconds: 0,
        isExpired: false,
        formattedTime: '12:00:00',
      });

      render(<MilestoneList orderId="order-1" userRole="EMPLOYER" />);

      // Should have red/warning styling
      const countdown = screen.getByText(/12:00:00/);
      expect(countdown.parentElement).toHaveClass('text-red-700');
    });
  });

  // ==========================================================================
  // WEBSOCKET INTEGRATION TESTS
  // ==========================================================================

  describe('WebSocket Integration', () => {
    it('should subscribe to order milestones on mount', () => {
      const mockSubscribe = jest.fn();
      mockUseMilestoneWebSocket.mockReturnValue({
        isConnected: true,
        isReconnecting: false,
        subscribeToMilestone: jest.fn(),
        subscribeToOrderMilestones: mockSubscribe,
        syncMissedMessages: jest.fn(),
      });

      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      expect(mockUseMilestoneWebSocket).toHaveBeenCalledWith(
        expect.objectContaining({
          orderId: 'order-1',
          autoRevalidate: true,
          showToasts: true,
        })
      );
    });

    it('should show connection status', () => {
      mockUseMilestoneWebSocket.mockReturnValue({
        isConnected: false,
        isReconnecting: true,
        subscribeToMilestone: jest.fn(),
        subscribeToOrderMilestones: jest.fn(),
        syncMissedMessages: jest.fn(),
      });

      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      // Should show reconnecting indicator
      expect(screen.getByText(/bağlanıyor/i)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // PROGRESS TRACKING TESTS
  // ==========================================================================

  describe('Progress Tracking', () => {
    it('should calculate and display progress percentage', () => {
      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      // 1 out of 4 milestones accepted = 25%
      expect(screen.getByText(/25%/)).toBeInTheDocument();
    });

    it('should show completed milestone count', () => {
      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      expect(screen.getByText(/1\/4/)).toBeInTheDocument();
    });

    it('should display total earned amount', () => {
      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      // Only milestone-4 is accepted (500 TRY)
      expect(screen.getByText(/500.*TRY/)).toBeInTheDocument();
    });
  });

  // ==========================================================================
  // CREATE BUTTON TESTS
  // ==========================================================================

  describe('Create Milestone Button', () => {
    it('should show create button when showCreateButton is true', () => {
      render(
        <MilestoneList
          orderId="order-1"
          userRole="FREELANCER"
          showCreateButton={true}
          onCreateClick={jest.fn()}
        />
      );

      expect(screen.getByText(/yeni milestone/i)).toBeInTheDocument();
    });

    it('should call onCreateClick when create button clicked', async () => {
      const mockOnCreate = jest.fn();

      render(
        <MilestoneList
          orderId="order-1"
          userRole="FREELANCER"
          showCreateButton={true}
          onCreateClick={mockOnCreate}
        />
      );

      const createButton = screen.getByText(/yeni milestone/i);
      await userEvent.click(createButton);

      expect(mockOnCreate).toHaveBeenCalled();
    });

    it('should NOT show create button by default', () => {
      render(<MilestoneList orderId="order-1" userRole="FREELANCER" />);

      expect(screen.queryByText(/yeni milestone/i)).not.toBeInTheDocument();
    });
  });
});
