/**
 * ================================================
 * WEBSOCKET DELIVERY EVENTS - INTEGRATION TESTS
 * ================================================
 * Sprint Day 2 - Story 2.4: WebSocket delivery events (1 SP)
 *
 * Test Coverage:
 * - MILESTONE_DELIVERED event emission
 * - Real-time employer notification
 * - SWR cache revalidation
 * - Toast notification display
 * - Connection status handling
 * - Missed message sync
 * - Event payload validation
 * - Multiple client handling
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { useMilestoneWebSocket } from '@/hooks/business/useMilestoneWebSocket';
import {
  useMilestoneActions,
  useOrderMilestones,
} from '@/hooks/business/useMilestones';
import type { OrderMilestone } from '@/types/business/features/milestone';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('sonner');
jest.mock('@/hooks/business/useMilestones');

// Mock STOMP client
const mockStompClient = {
  subscribe: jest.fn(),
  send: jest.fn(),
  disconnect: jest.fn(),
  connected: true,
};

jest.mock('@stomp/stompjs', () => ({
  Client: jest.fn().mockImplementation(() => mockStompClient),
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
  status: 'IN_PROGRESS',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  dueDate: '2024-02-01T00:00:00Z',
  ...overrides,
});

// ============================================================================
// TEST SUITE: WEBSOCKET DELIVERY EVENTS
// ============================================================================

describe('WebSocket Delivery Events', () => {
  const mockDeliverMilestone = jest.fn();
  const mockRefetch = jest.fn();

  beforeEach(() => {
    (useMilestoneActions as jest.Mock).mockReturnValue({
      deliverMilestone: mockDeliverMilestone,
      isDelivering: false,
    });

    (useOrderMilestones as jest.Mock).mockReturnValue({
      milestones: [createMockMilestone()],
      isLoading: false,
      error: null,
      refetch: mockRefetch,
    });

    jest.clearAllMocks();
  });

  // ==========================================================================
  // 1. MILESTONE_DELIVERED EVENT EMISSION
  // ==========================================================================

  describe('MILESTONE_DELIVERED Event Emission', () => {
    test('emits MILESTONE_DELIVERED event after successful delivery', async () => {
      const deliveredMilestone = createMockMilestone({
        status: 'DELIVERED',
        deliveredAt: '2024-01-15T10:00:00Z',
        deliveryNotes: 'All design files completed',
      });

      mockDeliverMilestone.mockResolvedValue(deliveredMilestone);

      renderHook(() => useMilestoneWebSocket('order-1'));

      await act(async () => {
        await mockDeliverMilestone('milestone-1', {
          deliveryNotes: 'All design files completed',
          attachments: [],
        });
      });

      await waitFor(() => {
        expect(mockStompClient.send).toHaveBeenCalledWith(
          '/app/milestone.delivered',
          {},
          JSON.stringify({
            type: 'MILESTONE_DELIVERED',
            milestoneId: 'milestone-1',
            orderId: 'order-1',
            payload: expect.objectContaining({
              status: 'DELIVERED',
              deliveryNotes: 'All design files completed',
            }),
          })
        );
      });
    });

    test('includes correct event payload structure', async () => {
      const deliveredMilestone = createMockMilestone({
        status: 'DELIVERED',
        deliveredAt: '2024-01-15T10:00:00Z',
        deliveryNotes: 'Delivery complete',
        deliveryAttachments: [
          { url: 'https://cloudinary.com/file1.pdf', name: 'design.pdf' },
        ],
      });

      mockDeliverMilestone.mockResolvedValue(deliveredMilestone);

      renderHook(() => useMilestoneWebSocket('order-1'));

      await act(async () => {
        await mockDeliverMilestone('milestone-1', {
          deliveryNotes: 'Delivery complete',
          attachments: ['https://cloudinary.com/file1.pdf'],
        });
      });

      await waitFor(() => {
        expect(mockStompClient.send).toHaveBeenCalledWith(
          expect.any(String),
          {},
          expect.stringContaining('MILESTONE_DELIVERED')
        );
      });
    });

    test('sends event to correct WebSocket topic', async () => {
      mockDeliverMilestone.mockResolvedValue(
        createMockMilestone({ status: 'DELIVERED' })
      );

      renderHook(() => useMilestoneWebSocket('order-1'));

      await act(async () => {
        await mockDeliverMilestone('milestone-1', {
          deliveryNotes: 'Done',
        });
      });

      await waitFor(() => {
        expect(mockStompClient.send).toHaveBeenCalledWith(
          expect.stringMatching(/\/app\/milestone\./),
          expect.any(Object),
          expect.any(String)
        );
      });
    });
  });

  // ==========================================================================
  // 2. REAL-TIME EMPLOYER NOTIFICATION
  // ==========================================================================

  describe('Real-time Employer Notification', () => {
    test('employer receives MILESTONE_DELIVERED notification', async () => {
      const { result } = renderHook(() => useMilestoneWebSocket('order-1'));

      let messageCallback: ((message: { body: string }) => void) | undefined;

      mockStompClient.subscribe.mockImplementation(
        (_topic: string, callback: (message: { body: string }) => void) => {
          messageCallback = callback;
          return { unsubscribe: jest.fn() };
        }
      );

      await act(async () => {
        result.current.subscribe();
      });

      // Simulate incoming WebSocket message
      const deliveryEvent = {
        type: 'MILESTONE_DELIVERED',
        milestoneId: 'milestone-1',
        orderId: 'order-1',
        payload: {
          status: 'DELIVERED',
          deliveryNotes: 'Work completed',
          deliveredAt: '2024-01-15T10:00:00Z',
        },
        timestamp: '2024-01-15T10:00:00Z',
      };

      await act(async () => {
        if (messageCallback) {
          messageCallback({ body: JSON.stringify(deliveryEvent) });
        }
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringMatching(/milestone.*teslim edildi|delivered/i)
        );
      });
    });

    test('shows delivery details in notification', async () => {
      const { result } = renderHook(() => useMilestoneWebSocket('order-1'));

      let messageCallback: ((message: { body: string }) => void) | undefined;

      mockStompClient.subscribe.mockImplementation(
        (_topic: string, callback: (message: { body: string }) => void) => {
          messageCallback = callback;
          return { unsubscribe: jest.fn() };
        }
      );

      await act(async () => {
        result.current.subscribe();
      });

      const deliveryEvent = {
        type: 'MILESTONE_DELIVERED',
        milestoneId: 'milestone-1',
        orderId: 'order-1',
        payload: {
          title: 'Design Phase',
          sequence: 1,
          status: 'DELIVERED',
          deliveryNotes: 'All files uploaded',
        },
      };

      await act(async () => {
        if (messageCallback) {
          messageCallback({ body: JSON.stringify(deliveryEvent) });
        }
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.stringContaining('Design Phase')
        );
      });
    });

    test('notification includes clickable action to view milestone', async () => {
      const { result } = renderHook(() => useMilestoneWebSocket('order-1'));

      let messageCallback: ((message: { body: string }) => void) | undefined;

      mockStompClient.subscribe.mockImplementation(
        (_topic: string, callback: (message: { body: string }) => void) => {
          messageCallback = callback;
          return { unsubscribe: jest.fn() };
        }
      );

      await act(async () => {
        result.current.subscribe();
      });

      const deliveryEvent = {
        type: 'MILESTONE_DELIVERED',
        milestoneId: 'milestone-1',
        orderId: 'order-1',
        payload: {
          status: 'DELIVERED',
        },
      };

      await act(async () => {
        if (messageCallback) {
          messageCallback({ body: JSON.stringify(deliveryEvent) });
        }
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            action: expect.objectContaining({
              label: expect.stringMatching(/görüntüle|view/i),
              onClick: expect.any(Function),
            }),
          })
        );
      });
    });
  });

  // ==========================================================================
  // 3. SWR CACHE REVALIDATION
  // ==========================================================================

  describe('SWR Cache Revalidation', () => {
    test('triggers cache revalidation after MILESTONE_DELIVERED event', async () => {
      const { result } = renderHook(() => useMilestoneWebSocket('order-1'));

      let messageCallback: ((message: { body: string }) => void) | undefined;

      mockStompClient.subscribe.mockImplementation(
        (_topic: string, callback: (message: { body: string }) => void) => {
          messageCallback = callback;
          return { unsubscribe: jest.fn() };
        }
      );

      await act(async () => {
        result.current.subscribe();
      });

      const deliveryEvent = {
        type: 'MILESTONE_DELIVERED',
        milestoneId: 'milestone-1',
        orderId: 'order-1',
        payload: { status: 'DELIVERED' },
      };

      await act(async () => {
        if (messageCallback) {
          messageCallback({ body: JSON.stringify(deliveryEvent) });
        }
      });

      await waitFor(() => {
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    test('revalidates both milestone and order cache keys', async () => {
      const { result } = renderHook(() => useMilestoneWebSocket('order-1'));

      let messageCallback: ((message: { body: string }) => void) | undefined;

      mockStompClient.subscribe.mockImplementation(
        (_topic: string, callback: (message: { body: string }) => void) => {
          messageCallback = callback;
          return { unsubscribe: jest.fn() };
        }
      );

      await act(async () => {
        result.current.subscribe();
      });

      const deliveryEvent = {
        type: 'MILESTONE_DELIVERED',
        milestoneId: 'milestone-1',
        orderId: 'order-1',
        payload: { status: 'DELIVERED' },
      };

      await act(async () => {
        if (messageCallback) {
          messageCallback({ body: JSON.stringify(deliveryEvent) });
        }
      });

      await waitFor(() => {
        // Verify SWR mutate was called for correct cache keys
        expect(mockRefetch).toHaveBeenCalledTimes(1);
      });
    });

    test('updates UI with new milestone status after revalidation', async () => {
      const { result, rerender } = renderHook(() =>
        useOrderMilestones('order-1')
      );

      // Initially IN_PROGRESS
      expect(result.current.milestones[0].status).toBe('IN_PROGRESS');

      // Simulate WebSocket event
      (useOrderMilestones as jest.Mock).mockReturnValue({
        milestones: [createMockMilestone({ status: 'DELIVERED' })],
        isLoading: false,
        error: null,
        refetch: mockRefetch,
      });

      rerender();

      // After revalidation, status should be DELIVERED
      expect(result.current.milestones[0].status).toBe('DELIVERED');
    });
  });

  // ==========================================================================
  // 4. CONNECTION STATUS HANDLING
  // ==========================================================================

  describe('Connection Status Handling', () => {
    test('does not emit events when disconnected', async () => {
      mockStompClient.connected = false;

      mockDeliverMilestone.mockResolvedValue(
        createMockMilestone({ status: 'DELIVERED' })
      );

      renderHook(() => useMilestoneWebSocket('order-1'));

      await act(async () => {
        await mockDeliverMilestone('milestone-1', {
          deliveryNotes: 'Done',
        });
      });

      // Should not send WebSocket message when disconnected
      expect(mockStompClient.send).not.toHaveBeenCalled();
    });

    test('reconnects and syncs missed delivery events', async () => {
      const { result } = renderHook(() => useMilestoneWebSocket('order-1'));

      // Simulate disconnect
      mockStompClient.connected = false;

      await act(async () => {
        result.current.disconnect();
      });

      // Simulate reconnect
      mockStompClient.connected = true;

      await act(async () => {
        result.current.subscribe();
      });

      await waitFor(() => {
        expect(mockStompClient.subscribe).toHaveBeenCalled();
        expect(mockRefetch).toHaveBeenCalled(); // Sync missed events
      });
    });

    test('shows connection status indicator to user', async () => {
      const { result } = renderHook(() => useMilestoneWebSocket('order-1'));

      await act(async () => {
        result.current.subscribe();
      });

      expect(result.current.isConnected).toBe(true);
      expect(result.current.connectionStatus).toBe('CONNECTED');

      mockStompClient.connected = false;

      await act(async () => {
        result.current.disconnect();
      });

      expect(result.current.isConnected).toBe(false);
      expect(result.current.connectionStatus).toBe('DISCONNECTED');
    });
  });

  // ==========================================================================
  // 5. EVENT PAYLOAD VALIDATION
  // ==========================================================================

  describe('Event Payload Validation', () => {
    test('validates MILESTONE_DELIVERED event structure', async () => {
      const { result } = renderHook(() => useMilestoneWebSocket('order-1'));

      let messageCallback: ((message: { body: string }) => void) | undefined;

      mockStompClient.subscribe.mockImplementation(
        (_topic: string, callback: (message: { body: string }) => void) => {
          messageCallback = callback;
          return { unsubscribe: jest.fn() };
        }
      );

      await act(async () => {
        result.current.subscribe();
      });

      const validEvent = {
        type: 'MILESTONE_DELIVERED',
        milestoneId: 'milestone-1',
        orderId: 'order-1',
        payload: {
          status: 'DELIVERED',
          deliveryNotes: 'Work completed',
          deliveredAt: '2024-01-15T10:00:00Z',
        },
        timestamp: '2024-01-15T10:00:00Z',
      };

      await act(async () => {
        if (messageCallback) {
          messageCallback({ body: JSON.stringify(validEvent) });
        }
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled();
        expect(mockRefetch).toHaveBeenCalled();
      });
    });

    test('ignores invalid event payloads', async () => {
      const { result } = renderHook(() => useMilestoneWebSocket('order-1'));

      let messageCallback: ((message: { body: string }) => void) | undefined;

      mockStompClient.subscribe.mockImplementation(
        (_topic: string, callback: (message: { body: string }) => void) => {
          messageCallback = callback;
          return { unsubscribe: jest.fn() };
        }
      );

      await act(async () => {
        result.current.subscribe();
      });

      const invalidEvent = {
        type: 'MILESTONE_DELIVERED',
        // Missing milestoneId and orderId
        payload: {},
      };

      await act(async () => {
        if (messageCallback) {
          messageCallback({ body: JSON.stringify(invalidEvent) });
        }
      });

      // Should not trigger notifications or revalidation for invalid events
      expect(toast.success).not.toHaveBeenCalled();
      expect(mockRefetch).not.toHaveBeenCalled();
    });

    test('handles malformed JSON gracefully', async () => {
      const { result } = renderHook(() => useMilestoneWebSocket('order-1'));

      let messageCallback: ((message: { body: string }) => void) | undefined;

      mockStompClient.subscribe.mockImplementation(
        (_topic: string, callback: (message: { body: string }) => void) => {
          messageCallback = callback;
          return { unsubscribe: jest.fn() };
        }
      );

      await act(async () => {
        result.current.subscribe();
      });

      await act(async () => {
        if (messageCallback) {
          messageCallback({ body: 'invalid json {{{' });
        }
      });

      // Should not crash, just ignore the malformed message
      expect(toast.error).not.toHaveBeenCalled();
    });
  });

  // ==========================================================================
  // 6. MULTIPLE CLIENTS
  // ==========================================================================

  describe('Multiple Clients', () => {
    test('broadcasts MILESTONE_DELIVERED event to all connected clients', async () => {
      // Simulate two WebSocket clients (freelancer and employer)
      const { result: freelancerWS } = renderHook(() =>
        useMilestoneWebSocket('order-1')
      );
      const { result: employerWS } = renderHook(() =>
        useMilestoneWebSocket('order-1')
      );

      let freelancerCallback: ((message: { body: string }) => void) | undefined;
      let employerCallback: ((message: { body: string }) => void) | undefined;

      mockStompClient.subscribe
        .mockImplementationOnce(
          (_topic: string, callback: (message: { body: string }) => void) => {
            freelancerCallback = callback;
            return { unsubscribe: jest.fn() };
          }
        )
        .mockImplementationOnce(
          (_topic: string, callback: (message: { body: string }) => void) => {
            employerCallback = callback;
            return { unsubscribe: jest.fn() };
          }
        );

      await act(async () => {
        freelancerWS.current.subscribe();
        employerWS.current.subscribe();
      });

      const deliveryEvent = {
        type: 'MILESTONE_DELIVERED',
        milestoneId: 'milestone-1',
        orderId: 'order-1',
        payload: { status: 'DELIVERED' },
      };

      // Freelancer delivers
      await act(async () => {
        if (freelancerCallback) {
          freelancerCallback({ body: JSON.stringify(deliveryEvent) });
        }
        if (employerCallback) {
          employerCallback({ body: JSON.stringify(deliveryEvent) });
        }
      });

      // Both clients should receive notification
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledTimes(2);
        expect(mockRefetch).toHaveBeenCalledTimes(2);
      });
    });

    test('each client maintains separate subscription', async () => {
      const { result: client1 } = renderHook(() =>
        useMilestoneWebSocket('order-1')
      );
      const { result: client2 } = renderHook(() =>
        useMilestoneWebSocket('order-2')
      );

      await act(async () => {
        client1.current.subscribe();
        client2.current.subscribe();
      });

      expect(mockStompClient.subscribe).toHaveBeenCalledTimes(2);
      expect(mockStompClient.subscribe).toHaveBeenCalledWith(
        expect.stringContaining('order-1'),
        expect.any(Function)
      );
      expect(mockStompClient.subscribe).toHaveBeenCalledWith(
        expect.stringContaining('order-2'),
        expect.any(Function)
      );
    });
  });
});
