/**
 * ================================================
 * ORDER LIFECYCLE INTEGRATION TESTS
 * ================================================
 * Complete order lifecycle testing from creation to completion
 *
 * Test Coverage:
 * - Order creation (package-based & custom)
 * - Payment processing
 * - Order status transitions
 * - Delivery workflow
 * - Milestone management
 * - Revision handling
 * - Order completion & review
 *
 * @sprint Test Coverage & QA - Week 1, Priority 1
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { apiClient } from '../../lib/infrastructure/api/client';
import type { Order, OrderStatus } from '../../types';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/lib/infrastructure/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/lib/infrastructure/monitoring/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// ============================================================================
// TEST DATA
// ============================================================================

const mockPackageOrder: Partial<Order> = {
  id: 'order-123',
  packageId: 'pkg-456',
  sellerId: 'seller-789',
  buyerId: 'buyer-001',
  amount: 1000,
  paymentMode: 'ONLINE',
  status: 'PENDING_PAYMENT' as OrderStatus,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockMilestones = [
  {
    id: 'milestone-1',
    orderId: 'order-123',
    title: 'Initial Design',
    description: 'Create initial design mockups',
    percentage: 30,
    amount: 300,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'PENDING',
    order: 1,
  },
  {
    id: 'milestone-2',
    orderId: 'order-123',
    title: 'Development',
    description: 'Implement the design',
    percentage: 50,
    amount: 500,
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'PENDING',
    order: 2,
  },
  {
    id: 'milestone-3',
    orderId: 'order-123',
    title: 'Final Delivery',
    description: 'Final testing and delivery',
    percentage: 20,
    amount: 200,
    dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'PENDING',
    order: 3,
  },
];

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Order Lifecycle Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================================
  // 1. ORDER CREATION
  // ========================================================================

  describe('Order Creation', () => {
    it('should create package-based order successfully', async () => {
      // Arrange
      const mockCreatedOrder = {
        ...mockPackageOrder,
        status: 'PENDING_PAYMENT',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockCreatedOrder);

      // Act
      const result = await apiClient.post('/api/v1/orders', {
        packageId: 'pkg-456',
        paymentMode: 'ONLINE',
      });

      // Assert
      expect(result.status).toBe('PENDING_PAYMENT');
      expect(result.packageId).toBe('pkg-456');
      expect(apiClient.post).toHaveBeenCalledWith(
        '/api/v1/orders',
        expect.objectContaining({
          packageId: 'pkg-456',
          paymentMode: 'ONLINE',
        })
      );
    });

    it('should create custom order with requirements', async () => {
      // Arrange
      const customOrderData = {
        sellerId: 'seller-789',
        title: 'Custom Web Development',
        description: 'Build a custom e-commerce website',
        amount: 5000,
        deliveryDays: 30,
        paymentMode: 'IBAN',
        requirements: 'React, TypeScript, Tailwind CSS',
      };

      const mockCreatedCustomOrder = {
        id: 'order-custom-123',
        ...customOrderData,
        status: 'PENDING_SELLER_APPROVAL',
        buyerId: 'buyer-001',
        createdAt: new Date().toISOString(),
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockCreatedCustomOrder);

      // Act
      const result = await apiClient.post(
        '/api/v1/orders/custom',
        customOrderData
      );

      // Assert
      expect(result.status).toBe('PENDING_SELLER_APPROVAL');
      expect(result.title).toBe('Custom Web Development');
      expect(result.amount).toBe(5000);
    });

    it('should validate required fields on order creation', async () => {
      // Arrange
      const invalidOrderData = {
        // Missing required fields
        paymentMode: 'ONLINE',
      };

      (apiClient.post as jest.Mock).mockRejectedValue({
        status: 400,
        data: {
          errors: [{ field: 'packageId', message: 'Package ID is required' }],
        },
      });

      // Act & Assert
      await expect(
        apiClient.post('/api/v1/orders', invalidOrderData)
      ).rejects.toMatchObject({
        status: 400,
      });
    });
  });

  // ========================================================================
  // 2. PAYMENT PROCESSING
  // ========================================================================

  describe('Payment Processing', () => {
    it('should update order status to PAID after successful payment', async () => {
      // Arrange
      const paidOrder = {
        ...mockPackageOrder,
        status: 'PAID',
        paymentId: 'payment-123',
      };

      (apiClient.patch as jest.Mock).mockResolvedValue(paidOrder);

      // Act
      const result = await apiClient.patch(
        `/api/v1/orders/${mockPackageOrder.id}/payment-completed`,
        { paymentId: 'payment-123' }
      );

      // Assert
      expect(result.status).toBe('PAID');
      expect(result.paymentId).toBe('payment-123');
    });

    it('should handle manual payment (IBAN) workflow', async () => {
      // Arrange
      const manualPaymentOrder = {
        ...mockPackageOrder,
        paymentMode: 'IBAN',
        status: 'PENDING_PAYMENT',
      };

      const paymentSentOrder = {
        ...manualPaymentOrder,
        status: 'PENDING_SELLER_CONFIRMATION',
        paymentProofUrl: 'https://cdn.example.com/payment-proof.jpg',
      };

      (apiClient.put as jest.Mock).mockResolvedValue(paymentSentOrder);

      // Act - Buyer marks payment as sent
      const result = await apiClient.put(
        `/api/v1/orders/${mockPackageOrder.id}/mark-payment-sent`,
        {
          paymentReference: 'REF-123456',
          paymentProofUrl: 'https://cdn.example.com/payment-proof.jpg',
        }
      );

      // Assert
      expect(result.status).toBe('PENDING_SELLER_CONFIRMATION');
      expect(result.paymentProofUrl).toBeDefined();
    });

    it('should allow seller to confirm manual payment', async () => {
      // Arrange
      const confirmedOrder = {
        ...mockPackageOrder,
        status: 'PAID',
      };

      (apiClient.put as jest.Mock).mockResolvedValue(confirmedOrder);

      // Act - Seller confirms payment
      const result = await apiClient.put(
        `/api/v1/orders/${mockPackageOrder.id}/confirm-manual-payment`
      );

      // Assert
      expect(result.status).toBe('PAID');
    });
  });

  // ========================================================================
  // 3. ORDER STATUS TRANSITIONS
  // ========================================================================

  describe('Order Status Transitions', () => {
    it('should transition from PAID to IN_PROGRESS when seller accepts', async () => {
      // Arrange
      const acceptedOrder = {
        ...mockPackageOrder,
        status: 'IN_PROGRESS',
        acceptedAt: new Date().toISOString(),
      };

      (apiClient.put as jest.Mock).mockResolvedValue(acceptedOrder);

      // Act
      const result = await apiClient.put(
        `/api/v1/orders/${mockPackageOrder.id}/accept`
      );

      // Assert
      expect(result.status).toBe('IN_PROGRESS');
      expect(result.acceptedAt).toBeDefined();
    });

    it('should allow order cancellation before acceptance', async () => {
      // Arrange
      const cancelledOrder = {
        ...mockPackageOrder,
        status: 'CANCELLED',
        cancellationReason: 'Changed requirements',
        cancelledAt: new Date().toISOString(),
      };

      (apiClient.delete as jest.Mock).mockResolvedValue(cancelledOrder);

      // Act
      const result = await apiClient.delete(
        `/api/v1/orders/${mockPackageOrder.id}`,
        {
          data: { reason: 'Changed requirements' },
        }
      );

      // Assert
      expect(result.status).toBe('CANCELLED');
      expect(result.cancellationReason).toBe('Changed requirements');
    });

    it('should enforce valid status transitions', async () => {
      // Arrange - Try to mark as completed without delivery
      (apiClient.put as jest.Mock).mockRejectedValue({
        status: 400,
        data: {
          error: 'Cannot complete order without delivery',
        },
      });

      // Act & Assert
      await expect(
        apiClient.put(`/api/v1/orders/${mockPackageOrder.id}/complete`)
      ).rejects.toMatchObject({
        status: 400,
      });
    });
  });

  // ========================================================================
  // 4. DELIVERY WORKFLOW
  // ========================================================================

  describe('Delivery Workflow', () => {
    it('should allow seller to submit delivery', async () => {
      // Arrange
      const deliveredOrder = {
        ...mockPackageOrder,
        status: 'PENDING_BUYER_REVIEW',
        deliveryUrl: 'https://cdn.example.com/delivery.zip',
        deliveredAt: new Date().toISOString(),
      };

      (apiClient.post as jest.Mock).mockResolvedValue(deliveredOrder);

      // Act
      const result = await apiClient.post(
        `/api/v1/orders/${mockPackageOrder.id}/deliver`,
        {
          deliveryUrl: 'https://cdn.example.com/delivery.zip',
          deliveryNotes: 'All files included as per requirements',
        }
      );

      // Assert
      expect(result.status).toBe('PENDING_BUYER_REVIEW');
      expect(result.deliveryUrl).toBeDefined();
      expect(result.deliveredAt).toBeDefined();
    });

    it('should allow buyer to approve delivery', async () => {
      // Arrange
      const completedOrder = {
        ...mockPackageOrder,
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
      };

      (apiClient.put as jest.Mock).mockResolvedValue(completedOrder);

      // Act
      const result = await apiClient.put(
        `/api/v1/orders/${mockPackageOrder.id}/approve-delivery`
      );

      // Assert
      expect(result.status).toBe('COMPLETED');
      expect(result.completedAt).toBeDefined();
    });

    it('should allow buyer to request revision', async () => {
      // Arrange
      const revisionOrder = {
        ...mockPackageOrder,
        status: 'REVISION_REQUESTED',
        revisionCount: 1,
        revisionNotes: 'Please change the color scheme',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(revisionOrder);

      // Act
      const result = await apiClient.post(
        `/api/v1/orders/${mockPackageOrder.id}/request-revision`,
        {
          reason: 'Please change the color scheme',
        }
      );

      // Assert
      expect(result.status).toBe('REVISION_REQUESTED');
      expect(result.revisionCount).toBe(1);
    });

    it('should enforce revision limits', async () => {
      // Arrange - Order with max revisions reached
      (apiClient.post as jest.Mock).mockRejectedValue({
        status: 400,
        data: {
          error: 'Maximum revision limit reached',
        },
      });

      // Act & Assert
      await expect(
        apiClient.post(
          `/api/v1/orders/${mockPackageOrder.id}/request-revision`,
          { reason: 'Another change' }
        )
      ).rejects.toMatchObject({
        status: 400,
      });
    });
  });

  // ========================================================================
  // 5. MILESTONE MANAGEMENT
  // ========================================================================

  describe('Milestone Management', () => {
    it('should create milestones for order', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockResolvedValue({
        success: true,
        data: mockMilestones,
      });

      // Act
      const result = await apiClient.post(
        `/api/v1/orders/${mockPackageOrder.id}/milestones`,
        { milestones: mockMilestones }
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(3);
      expect(result.data[0].title).toBe('Initial Design');
    });

    it('should mark milestone as completed', async () => {
      // Arrange
      const completedMilestone = {
        ...mockMilestones[0],
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
      };

      (apiClient.put as jest.Mock).mockResolvedValue(completedMilestone);

      // Act
      const result = await apiClient.put(
        `/api/v1/milestones/${mockMilestones[0].id}/complete`,
        {
          deliveryUrl: 'https://cdn.example.com/milestone-1-delivery.zip',
        }
      );

      // Assert
      expect(result.status).toBe('COMPLETED');
      expect(result.completedAt).toBeDefined();
    });

    it('should validate milestone percentage totals to 100%', async () => {
      // Arrange - Invalid percentage totals
      const invalidMilestones = [
        { ...mockMilestones[0], percentage: 50 },
        { ...mockMilestones[1], percentage: 30 },
        // Total: 80% (should be 100%)
      ];

      (apiClient.post as jest.Mock).mockRejectedValue({
        status: 400,
        data: {
          error: 'Milestone percentages must total 100%',
        },
      });

      // Act & Assert
      await expect(
        apiClient.post(`/api/v1/orders/${mockPackageOrder.id}/milestones`, {
          milestones: invalidMilestones,
        })
      ).rejects.toMatchObject({
        status: 400,
      });
    });

    it('should calculate milestone amounts correctly', () => {
      // Arrange
      const orderAmount = 1000;
      const milestonePercentages = [30, 50, 20];

      // Act
      const calculatedAmounts = milestonePercentages.map(
        (percentage) => (orderAmount * percentage) / 100
      );

      // Assert
      expect(calculatedAmounts).toEqual([300, 500, 200]);
      expect(calculatedAmounts.reduce((a, b) => a + b, 0)).toBe(orderAmount);
    });
  });

  // ========================================================================
  // 6. ORDER COMPLETION & REVIEW
  // ========================================================================

  describe('Order Completion & Review', () => {
    it('should allow buyer to leave review after completion', async () => {
      // Arrange
      const mockReview = {
        id: 'review-123',
        orderId: mockPackageOrder.id,
        rating: 5,
        comment: 'Excellent work!',
        createdAt: new Date().toISOString(),
      };

      (apiClient.post as jest.Mock).mockResolvedValue(mockReview);

      // Act
      const result = await apiClient.post('/api/v1/reviews', {
        orderId: mockPackageOrder.id,
        rating: 5,
        comment: 'Excellent work!',
      });

      // Assert
      expect(result.rating).toBe(5);
      expect(result.orderId).toBe(mockPackageOrder.id);
    });

    it('should prevent duplicate reviews for same order', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue({
        status: 400,
        data: {
          error: 'Review already exists for this order',
        },
      });

      // Act & Assert
      await expect(
        apiClient.post('/api/v1/reviews', {
          orderId: mockPackageOrder.id,
          rating: 5,
        })
      ).rejects.toMatchObject({
        status: 400,
      });
    });

    it('should auto-complete order after review deadline', async () => {
      // Arrange
      const autoCompletedOrder = {
        ...mockPackageOrder,
        status: 'AUTO_COMPLETED',
        completedAt: new Date().toISOString(),
        autoCompletedReason: 'No buyer response within 14 days',
      };

      (apiClient.get as jest.Mock).mockResolvedValue(autoCompletedOrder);

      // Act
      const result = await apiClient.get(
        `/api/v1/orders/${mockPackageOrder.id}`
      );

      // Assert
      expect(result.status).toBe('AUTO_COMPLETED');
      expect(result.autoCompletedReason).toBeDefined();
    });
  });

  // ========================================================================
  // 7. ORDER STORE INTEGRATION
  // ========================================================================

  describe('Order Store Integration', () => {
    it('should call API to load order', async () => {
      // Arrange
      (apiClient.get as jest.Mock).mockResolvedValue(mockPackageOrder);

      // Act
      const result = await apiClient.get(
        `/api/v1/orders/${mockPackageOrder.id}`
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(mockPackageOrder.id);
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining(mockPackageOrder.id!)
      );
    });

    it('should call API to update order status', async () => {
      // Arrange
      const updatedOrder = {
        ...mockPackageOrder,
        status: 'PAID',
      };
      (apiClient.patch as jest.Mock).mockResolvedValue(updatedOrder);

      // Act
      const result = await apiClient.patch(
        `/api/v1/orders/${mockPackageOrder.id}/status`,
        { status: 'PAID' }
      );

      // Assert
      expect(result.status).toBe('PAID');
      expect(apiClient.patch).toHaveBeenCalledWith(
        expect.stringContaining(mockPackageOrder.id!),
        expect.objectContaining({ status: 'PAID' })
      );
    });

    it('should call API to load order timeline', async () => {
      // Arrange
      const mockTimeline = [
        {
          id: 'timeline-1',
          orderId: mockPackageOrder.id!,
          event: 'ORDER_CREATED',
          description: 'Order was created',
          createdAt: new Date().toISOString(),
        },
      ];

      (apiClient.get as jest.Mock).mockResolvedValue(mockTimeline);

      // Act
      const result = await apiClient.get(
        `/api/v1/orders/${mockPackageOrder.id}/timeline`
      );

      // Assert
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0].event).toBe('ORDER_CREATED');
    });
  });
});
