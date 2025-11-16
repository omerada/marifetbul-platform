/**
 * ================================================
 * USE MILESTONES HOOK - UNIT TESTS
 * ================================================
 * Tests for milestone management hook
 * Sprint 1: Milestone Payment System
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { renderHook, waitFor } from '@testing-library/react';
import { useMilestoneActions } from '@/hooks/business/useMilestones';
import { milestoneApiEnhanced as milestoneApi } from '@/lib/api/milestones-enhanced';
import { toast } from 'sonner';

// Mock dependencies
jest.mock('@/lib/api/milestones');
jest.mock('sonner');
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: undefined,
    error: undefined,
    isLoading: false,
    mutate: jest.fn(),
  })),
  mutate: jest.fn(),
}));

describe('useMilestoneActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMilestone', () => {
    it('should create a single milestone successfully', async () => {
      const mockMilestone = {
        id: 'milestone-1',
        orderId: 'order-1',
        sequence: 1,
        title: 'Logo Design',
        amount: 500,
        status: 'PENDING',
      };

      (milestoneApi.createMilestone as jest.Mock).mockResolvedValue(
        mockMilestone
      );

      const { result } = renderHook(() => useMilestoneActions());

      await waitFor(async () => {
        const milestone = await result.current.createMilestone('order-1', {
          sequence: 1,
          title: 'Logo Design',
          description: 'Design company logo',
          amount: 500,
        });

        expect(milestone).toEqual(mockMilestone);
        expect(toast.success).toHaveBeenCalledWith('Milestone oluşturuldu');
      });
    });

    it('should handle creation error', async () => {
      (milestoneApi.createMilestone as jest.Mock).mockRejectedValue(
        new Error('API Error')
      );

      const { result } = renderHook(() => useMilestoneActions());

      await expect(
        result.current.createMilestone('order-1', {
          sequence: 1,
          title: 'Logo Design',
          description: 'Design company logo',
          amount: 500,
        })
      ).rejects.toThrow('API Error');

      expect(toast.error).toHaveBeenCalledWith('API Error');
    });
  });

  describe('createMilestonesBatch', () => {
    it('should create multiple milestones successfully', async () => {
      const mockMilestones = [
        {
          id: 'milestone-1',
          orderId: 'order-1',
          sequence: 1,
          title: 'Milestone 1',
          amount: 300,
          status: 'PENDING',
        },
        {
          id: 'milestone-2',
          orderId: 'order-1',
          sequence: 2,
          title: 'Milestone 2',
          amount: 200,
          status: 'PENDING',
        },
      ];

      (milestoneApi.createMilestonesBatch as jest.Mock).mockResolvedValue(
        mockMilestones
      );

      const { result } = renderHook(() => useMilestoneActions());

      await waitFor(async () => {
        const milestones = await result.current.createMilestonesBatch(
          'order-1',
          [
            {
              sequence: 1,
              title: 'Milestone 1',
              description: 'First milestone',
              amount: 300,
            },
            {
              sequence: 2,
              title: 'Milestone 2',
              description: 'Second milestone',
              amount: 200,
            },
          ]
        );

        expect(milestones).toEqual(mockMilestones);
        expect(toast.success).toHaveBeenCalledWith('2 milestone oluşturuldu');
      });
    });
  });

  describe('deliverMilestone', () => {
    it('should deliver milestone successfully', async () => {
      const mockMilestone = {
        id: 'milestone-1',
        orderId: 'order-1',
        status: 'DELIVERED',
        deliveryNotes: 'Milestone completed',
      };

      (milestoneApi.deliverMilestone as jest.Mock).mockResolvedValue(
        mockMilestone
      );

      const { result } = renderHook(() => useMilestoneActions());

      await waitFor(async () => {
        const milestone = await result.current.deliverMilestone('milestone-1', {
          deliveryNotes: 'Milestone completed',
          attachments: [],
        });

        expect(milestone).toEqual(mockMilestone);
        expect(toast.success).toHaveBeenCalledWith('Milestone teslim edildi');
      });
    });
  });

  describe('acceptMilestone', () => {
    it('should accept milestone successfully', async () => {
      const mockMilestone = {
        id: 'milestone-1',
        orderId: 'order-1',
        status: 'ACCEPTED',
      };

      (milestoneApi.acceptMilestone as jest.Mock).mockResolvedValue(
        mockMilestone
      );

      const { result } = renderHook(() => useMilestoneActions());

      await waitFor(async () => {
        const milestone = await result.current.acceptMilestone('milestone-1');

        expect(milestone).toEqual(mockMilestone);
        expect(toast.success).toHaveBeenCalledWith('Milestone onaylandı');
      });
    });
  });

  describe('rejectMilestone', () => {
    it('should reject milestone successfully', async () => {
      const mockMilestone = {
        id: 'milestone-1',
        orderId: 'order-1',
        status: 'REVISION_REQUESTED',
      };

      (milestoneApi.rejectMilestone as jest.Mock).mockResolvedValue(
        mockMilestone
      );

      const { result } = renderHook(() => useMilestoneActions());

      await waitFor(async () => {
        const milestone = await result.current.rejectMilestone(
          'milestone-1',
          'Needs improvement'
        );

        expect(milestone).toEqual(mockMilestone);
        expect(toast.success).toHaveBeenCalledWith('Revizyon talep edildi');
      });
    });
  });

  describe('Loading states', () => {
    it('should track loading state correctly', async () => {
      (milestoneApi.createMilestone as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ id: 'milestone-1' }), 100)
          )
      );

      const { result } = renderHook(() => useMilestoneActions());

      expect(result.current.isCreating).toBe(false);

      const createPromise = result.current.createMilestone('order-1', {
        sequence: 1,
        title: 'Test',
        description: 'Test',
        amount: 100,
      });

      expect(result.current.isCreating).toBe(true);

      await createPromise;

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });
    });
  });
});
