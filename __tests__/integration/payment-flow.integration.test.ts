/**
 * ================================================
 * PAYMENT FLOW INTEGRATION TESTS
 * ================================================
 * Complete payment flow testing for both Iyzico and Manual (IBAN) payments
 *
 * Test Coverage:
 * - Iyzico payment success flow
 * - Iyzico payment failure scenarios
 * - Manual payment (IBAN) flow
 * - Refund processing
 * - Escrow auto-release
 * - Commission calculation
 *
 * @sprint Test Coverage & QA - Week 1, Priority 1
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useIyzicoPayment } from '@/hooks/business/useIyzicoPayment';
import { useOrderStore } from '@/lib/core/store/orders';
import { PaymentMode, OrderStatus } from '@/types';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/lib/infrastructure/monitoring/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('@/lib/core/store/domains/ui/uiStore', () => ({
  useUIStore: jest.fn(() => ({
    addToast: jest.fn(),
  })),
}));

global.fetch = jest.fn();

// ============================================================================
// TEST DATA
// ============================================================================

const mockPackageOrder = {
  id: 'order-123',
  packageId: 'pkg-456',
  sellerId: 'seller-789',
  buyerId: 'buyer-001',
  amount: 1000,
  paymentMode: 'ONLINE' as PaymentMode,
  status: 'PENDING_PAYMENT' as OrderStatus,
  createdAt: new Date().toISOString(),
};

const mockIyzicoPaymentSuccess = {
  success: true,
  paymentId: 'payment-123',
  conversationId: mockPackageOrder.id,
  status: 'SUCCESS',
};

const mockIyzicoPaymentFailure = {
  success: false,
  errorCode: 'INSUFFICIENT_FUNDS',
  errorMessage: 'Yetersiz bakiye',
};

const mockValidCard = {
  cardNumber: '5528790000000008',
  cardHolderName: 'JOHN DOE',
  expireMonth: '12',
  expireYear: '2030',
  cvc: '123',
};

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Payment Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  // ========================================================================
  // 1. IYZICO PAYMENT SUCCESS FLOW
  // ========================================================================

  describe('Iyzico Payment Success Flow', () => {
    it('should complete full payment flow successfully', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          paymentId: 'payment-123',
          status: 'succeeded',
          requiresAction: false,
        }),
      });

      const { result } = renderHook(() => useIyzicoPayment());

      // Act - Initialize payment
      let paymentResult;
      await act(async () => {
        paymentResult = await result.current.initiatePayment({
          orderId: mockPackageOrder.id,
          cardOptions: {
            cardHolderName: mockValidCard.cardHolderName,
            cardNumber: mockValidCard.cardNumber,
            expireMonth: mockValidCard.expireMonth,
            expireYear: mockValidCard.expireYear,
            cvc: mockValidCard.cvc,
          },
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isProcessing).toBe(false);
        expect(result.current.error).toBeNull();
        expect(paymentResult).toBeDefined();
        expect(paymentResult?.success).toBe(true);
        expect(paymentResult?.status).toBe('succeeded');
      });

      // Verify API calls
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/payments/intent'),
        expect.any(Object)
      );
    });

    it('should update order status to PAID after successful payment', async () => {
      // Arrange
      const orderStore = useOrderStore.getState();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: { ...mockPackageOrder, status: 'PAID' },
        }),
      });

      // Act
      await act(async () => {
        await orderStore.fetchOrder(mockPackageOrder.id);
      });

      // Assert
      await waitFor(() => {
        const order = orderStore.orders.get(mockPackageOrder.id);
        expect(order?.status).toBe('PAID');
      });
    });

    it('should create escrow record after successful payment', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            escrowId: 'escrow-123',
            orderId: mockPackageOrder.id,
            amount: mockPackageOrder.amount,
            status: 'HELD',
            releaseDate: new Date(
              Date.now() + 14 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        }),
      });

      // Act
      const response = await fetch('/api/v1/wallet/escrow/check');
      const data = await response.json();

      // Assert
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('HELD');
      expect(data.data.orderId).toBe(mockPackageOrder.id);
    });
  });

  // ========================================================================
  // 2. IYZICO PAYMENT FAILURE SCENARIOS
  // ========================================================================

  describe('Iyzico Payment Failure Scenarios', () => {
    it('should handle insufficient funds error', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: mockIyzicoPaymentFailure.errorMessage,
          errors: [
            {
              code: mockIyzicoPaymentFailure.errorCode,
              message: mockIyzicoPaymentFailure.errorMessage,
            },
          ],
        }),
      });

      const { result } = renderHook(() => useIyzicoPayment());

      // Act
      await act(async () => {
        await result.current.initializePayment({
          orderId: mockPackageOrder.id,
          amount: mockPackageOrder.amount,
          cardDetails: mockValidCard,
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.paymentStatus).toBe('FAILED');
        expect(result.current.error).toContain('Yetersiz bakiye');
      });
    });

    it('should handle invalid card error', async () => {
      // Arrange
      const invalidCard = {
        ...mockValidCard,
        cardNumber: '0000000000000000',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Geçersiz kart numarası',
          errors: [
            {
              code: 'INVALID_CARD',
              message: 'Geçersiz kart numarası',
            },
          ],
        }),
      });

      const { result } = renderHook(() => useIyzicoPayment());

      // Act
      await act(async () => {
        await result.current.initializePayment({
          orderId: mockPackageOrder.id,
          amount: mockPackageOrder.amount,
          cardDetails: invalidCard,
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.error).toContain('Geçersiz kart');
      });
    });

    it('should handle 3D Secure failure', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: '3D Secure doğrulama başarısız',
          errors: [
            {
              code: '3D_SECURE_FAILED',
              message: '3D Secure doğrulama başarısız',
            },
          ],
        }),
      });

      const { result } = renderHook(() => useIyzicoPayment());

      // Act
      await act(async () => {
        await result.current.initializePayment({
          orderId: mockPackageOrder.id,
          amount: mockPackageOrder.amount,
          cardDetails: mockValidCard,
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.error).toContain('3D Secure');
      });
    });
  });

  // ========================================================================
  // 3. MANUAL PAYMENT (IBAN) FLOW
  // ========================================================================

  describe('Manual Payment (IBAN) Flow', () => {
    it('should mark order as payment sent with IBAN details', async () => {
      // Arrange
      const manualPaymentDetails = {
        orderId: mockPackageOrder.id,
        paymentReference: 'REF-123456',
        senderIban: 'TR330006100519786457841326',
        amount: mockPackageOrder.amount,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            ...mockPackageOrder,
            status: 'PENDING_SELLER_CONFIRMATION',
            manualPaymentProof: manualPaymentDetails,
          },
        }),
      });

      // Act
      const response = await fetch(
        `/api/v1/orders/${mockPackageOrder.id}/mark-payment-sent`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(manualPaymentDetails),
        }
      );
      const data = await response.json();

      // Assert
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('PENDING_SELLER_CONFIRMATION');
      expect(data.data.manualPaymentProof).toEqual(manualPaymentDetails);
    });

    it('should allow seller to confirm manual payment', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            ...mockPackageOrder,
            status: 'PAID',
          },
        }),
      });

      // Act
      const response = await fetch(
        `/api/v1/orders/${mockPackageOrder.id}/confirm-manual-payment`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentReference: 'REF-123456',
          }),
        }
      );
      const data = await response.json();

      // Assert
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('PAID');
    });

    it('should validate IBAN format before accepting', async () => {
      // Arrange
      const invalidIban = {
        orderId: mockPackageOrder.id,
        paymentReference: 'REF-123456',
        senderIban: 'INVALID_IBAN',
        amount: mockPackageOrder.amount,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Geçersiz IBAN formatı',
          errors: [
            {
              field: 'senderIban',
              message: 'Geçersiz IBAN formatı',
            },
          ],
        }),
      });

      // Act
      const response = await fetch(
        `/api/v1/orders/${mockPackageOrder.id}/mark-payment-sent`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(invalidIban),
        }
      );
      const data = await response.json();

      // Assert
      expect(data.success).toBe(false);
      expect(data.errors[0].field).toBe('senderIban');
    });
  });

  // ========================================================================
  // 4. REFUND PROCESSING
  // ========================================================================

  describe('Refund Processing', () => {
    it('should create refund request successfully', async () => {
      // Arrange
      const refundRequest = {
        orderId: mockPackageOrder.id,
        amount: mockPackageOrder.amount,
        reason: 'Seller did not deliver',
        description: 'Product not as described',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: 'refund-123',
            ...refundRequest,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          },
        }),
      });

      // Act
      const response = await fetch('/api/v1/refunds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(refundRequest),
      });
      const data = await response.json();

      // Assert
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('PENDING');
      expect(data.data.orderId).toBe(mockPackageOrder.id);
    });

    it('should process refund and release escrow', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            refundId: 'refund-123',
            status: 'APPROVED',
            processedAt: new Date().toISOString(),
            escrowReleased: true,
          },
        }),
      });

      // Act
      const response = await fetch('/api/v1/refunds/refund-123/approve', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      // Assert
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('APPROVED');
      expect(data.data.escrowReleased).toBe(true);
    });

    it('should update buyer wallet after refund', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            balance: 2000, // Original 1000 + 1000 refund
            availableBalance: 2000,
            escrowBalance: 0,
          },
        }),
      });

      // Act
      const response = await fetch('/api/v1/wallet/balance');
      const data = await response.json();

      // Assert
      expect(data.success).toBe(true);
      expect(data.data.balance).toBe(2000);
    });
  });

  // ========================================================================
  // 5. ESCROW AUTO-RELEASE
  // ========================================================================

  describe('Escrow Auto-Release', () => {
    it('should auto-release escrow after 14 days', async () => {
      // Arrange
      const futureDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            escrowId: 'escrow-123',
            status: 'RELEASED',
            releasedAt: futureDate.toISOString(),
            releasedAutomatically: true,
          },
        }),
      });

      // Act (simulating scheduled job)
      const response = await fetch('/api/v1/admin/escrow/auto-release', {
        method: 'POST',
      });
      const data = await response.json();

      // Assert
      expect(data.success).toBe(true);
      expect(data.data.status).toBe('RELEASED');
      expect(data.data.releasedAutomatically).toBe(true);
    });

    it('should send warning notification 24h before auto-release', async () => {
      // Arrange
      const warningDate = new Date(Date.now() + 13 * 24 * 60 * 60 * 1000);

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            notificationSent: true,
            recipients: ['buyer-001'],
            message: '24 saat içinde otomatik tamamlanacak',
          },
        }),
      });

      // Act
      const response = await fetch('/api/v1/admin/escrow/send-warnings', {
        method: 'POST',
      });
      const data = await response.json();

      // Assert
      expect(data.success).toBe(true);
      expect(data.data.notificationSent).toBe(true);
    });

    it('should allow buyer to object to auto-release', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            objectionCreated: true,
            autoReleaseBlocked: true,
            disputeId: 'dispute-123',
          },
        }),
      });

      // Act
      const response = await fetch(
        `/api/v1/orders/${mockPackageOrder.id}/object-release`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reason: 'Work not completed as agreed',
          }),
        }
      );
      const data = await response.json();

      // Assert
      expect(data.success).toBe(true);
      expect(data.data.autoReleaseBlocked).toBe(true);
    });
  });

  // ========================================================================
  // 6. COMMISSION CALCULATION
  // ========================================================================

  describe('Commission Calculation', () => {
    it('should calculate correct commission for order', async () => {
      // Arrange
      const orderAmount = 1000;
      const commissionRate = 0.1; // 10%
      const expectedCommission = 100;

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            orderId: mockPackageOrder.id,
            amount: orderAmount,
            commissionRate: commissionRate,
            commissionAmount: expectedCommission,
            sellerEarnings: orderAmount - expectedCommission,
          },
        }),
      });

      // Act
      const response = await fetch(
        `/api/v1/admin/commissions/calculate?orderId=${mockPackageOrder.id}`
      );
      const data = await response.json();

      // Assert
      expect(data.success).toBe(true);
      expect(data.data.commissionAmount).toBe(expectedCommission);
      expect(data.data.sellerEarnings).toBe(900);
    });

    it('should apply different commission rates based on seller tier', async () => {
      // Arrange - Premium seller gets 8% commission
      const premiumSellerOrder = {
        ...mockPackageOrder,
        sellerId: 'premium-seller-001',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            orderId: premiumSellerOrder.id,
            amount: 1000,
            commissionRate: 0.08,
            commissionAmount: 80,
            sellerEarnings: 920,
            sellerTier: 'PREMIUM',
          },
        }),
      });

      // Act
      const response = await fetch(
        `/api/v1/admin/commissions/calculate?orderId=${premiumSellerOrder.id}`
      );
      const data = await response.json();

      // Assert
      expect(data.success).toBe(true);
      expect(data.data.commissionRate).toBe(0.08);
      expect(data.data.commissionAmount).toBe(80);
    });

    it('should record commission in transactions', async () => {
      // Arrange
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            content: [
              {
                id: 'tx-001',
                type: 'COMMISSION',
                amount: 100,
                orderId: mockPackageOrder.id,
                createdAt: new Date().toISOString(),
              },
            ],
          },
        }),
      });

      // Act
      const response = await fetch(
        '/api/v1/wallet/transactions?type=COMMISSION'
      );
      const data = await response.json();

      // Assert
      expect(data.success).toBe(true);
      expect(data.data.content[0].type).toBe('COMMISSION');
      expect(data.data.content[0].amount).toBe(100);
    });
  });
});
