/**
 * ================================================
 * PAYMENT FLOW INTEGRATION TESTS - V2
 * ================================================
 * Simplified integration tests focusing on actual implementations
 *
 * @sprint Test Coverage & QA - Week 1, Priority 1
 * @author MarifetBul Development Team
 * @version 2.0.0
 */

import { renderHook, act } from '@testing-library/react';
import useIyzicoPayment from '../../hooks/business/useIyzicoPayment';
import * as clientModule from '../../lib/infrastructure/api/client';

// ============================================================================
// MOCKS
// ============================================================================

jest.mock('@/lib/infrastructure/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
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

const mockOrderId = 'order-123';
const mockPaymentId = 'payment-456';

const mockValidCardOptions = {
  cardHolderName: 'JOHN DOE',
  cardNumber: '5528790000000008',
  expireMonth: '12',
  expireYear: '2030',
  cvc: '123',
};

// ============================================================================
// TEST SUITE
// ============================================================================

describe('Payment Flow Integration Tests - V2', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useIyzicoPayment Hook', () => {
    describe('initiatePayment', () => {
      it('should successfully initiate payment without 3D Secure', async () => {
        // Arrange
        const mockResponse = {
          paymentId: mockPaymentId,
          status: 'succeeded' as const,
          requiresAction: false,
        };

        (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useIyzicoPayment());

        // Act
        let paymentResult;
        await act(async () => {
          paymentResult = await result.current.initiatePayment({
            orderId: mockOrderId,
            cardOptions: mockValidCardOptions,
          });
        });

        // Assert
        expect(result.current.isProcessing).toBe(false);
        expect(result.current.error).toBeNull();
        expect(paymentResult).toEqual({
          success: true,
          paymentId: mockPaymentId,
          status: 'succeeded',
          requiresAction: false,
        });

        expect(apiClient.post).toHaveBeenCalledTimes(1);
        expect(apiClient.post).toHaveBeenCalledWith(
          expect.stringContaining('/payments/intent'),
          expect.objectContaining({
            orderId: mockOrderId,
          })
        );
      });

      it('should handle 3D Secure requirement', async () => {
        // Arrange
        const mockResponse = {
          paymentId: mockPaymentId,
          status: 'pending' as const,
          requiresAction: true,
          nextActionUrl: 'https://bank.com/3dsecure',
        };

        (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const { result } = renderHook(() =>
          useIyzicoPayment({ autoRedirect: false })
        );

        // Act
        let paymentResult;
        await act(async () => {
          paymentResult = await result.current.initiatePayment({
            orderId: mockOrderId,
            cardOptions: mockValidCardOptions,
          });
        });

        // Assert
        expect(paymentResult).toEqual({
          success: false,
          paymentId: mockPaymentId,
          status: 'pending',
          requiresAction: true,
          nextActionUrl: 'https://bank.com/3dsecure',
        });

        expect(result.current.currentPaymentIntentId).toBe(mockPaymentId);
      });

      it('should handle payment failure', async () => {
        // Arrange
        const errorMessage = 'Yetersiz bakiye';
        (apiClient.post as jest.Mock).mockRejectedValue({
          errorCode: '10041',
          errorMessage,
        });

        const { result } = renderHook(() => useIyzicoPayment());

        // Act
        let paymentResult;
        await act(async () => {
          paymentResult = await result.current.initiatePayment({
            orderId: mockOrderId,
            cardOptions: mockValidCardOptions,
          });
        });

        // Assert
        expect(paymentResult?.success).toBe(false);
        expect(paymentResult?.error).toBeDefined();
        expect(paymentResult?.error?.message).toContain('limit');
        expect(result.current.error).not.toBeNull();
      });

      it('should prevent duplicate payment attempts', async () => {
        // Arrange
        const mockResponse = {
          paymentId: mockPaymentId,
          status: 'succeeded' as const,
          requiresAction: false,
        };

        (apiClient.post as jest.Mock).mockImplementation(
          () =>
            new Promise((resolve) => {
              setTimeout(() => resolve(mockResponse), 100);
            })
        );

        const { result } = renderHook(() => useIyzicoPayment());

        // Act - Try to initiate payment twice simultaneously
        let result1, result2;
        await act(async () => {
          const promise1 = result.current.initiatePayment({
            orderId: mockOrderId,
            cardOptions: mockValidCardOptions,
          });

          const promise2 = result.current.initiatePayment({
            orderId: mockOrderId,
            cardOptions: mockValidCardOptions,
          });

          [result1, result2] = await Promise.all([promise1, promise2]);
        });

        // Assert - Only one should succeed
        expect(apiClient.post).toHaveBeenCalledTimes(1);
        expect(result1?.success || result2?.success).toBe(true);
        expect(result1?.success && result2?.success).toBe(false);
      });
    });

    describe('confirmPayment', () => {
      it('should confirm payment successfully', async () => {
        // Arrange
        const mockResponse = {
          paymentId: mockPaymentId,
          status: 'succeeded' as const,
        };

        (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useIyzicoPayment());

        // Act
        let paymentResult;
        await act(async () => {
          paymentResult = await result.current.confirmPayment({
            paymentIntentId: mockPaymentId,
          });
        });

        // Assert
        expect(paymentResult).toEqual({
          success: true,
          paymentId: mockPaymentId,
          status: 'succeeded',
        });

        expect(apiClient.post).toHaveBeenCalledWith(
          expect.stringContaining(mockPaymentId),
          expect.any(Object)
        );
      });

      it('should handle confirmation failure', async () => {
        // Arrange
        const mockResponse = {
          paymentId: mockPaymentId,
          status: 'failed' as const,
        };

        (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useIyzicoPayment());

        // Act
        let paymentResult;
        await act(async () => {
          paymentResult = await result.current.confirmPayment({
            paymentIntentId: mockPaymentId,
          });
        });

        // Assert
        expect(paymentResult?.success).toBe(false);
        expect(paymentResult?.status).toBe('failed');
      });
    });

    describe('handleCallback', () => {
      it('should handle 3D Secure callback successfully', async () => {
        // Arrange
        const mockResponse = {
          paymentId: mockPaymentId,
          status: 'succeeded' as const,
        };

        (apiClient.post as jest.Mock).mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useIyzicoPayment());

        // Act
        let paymentResult;
        await act(async () => {
          paymentResult = await result.current.handleCallback(mockPaymentId);
        });

        // Assert
        expect(paymentResult?.success).toBe(true);
        expect(paymentResult?.paymentId).toBe(mockPaymentId);
      });

      it('should handle missing payment ID', async () => {
        // Arrange
        const { result } = renderHook(() => useIyzicoPayment());

        // Act
        let paymentResult;
        await act(async () => {
          paymentResult = await result.current.handleCallback('');
        });

        // Assert
        expect(paymentResult?.success).toBe(false);
        expect(paymentResult?.error).toBeDefined();
        expect(result.current.error?.type).toBe('validation_error');
      });
    });

    describe('checkStatus', () => {
      it('should check payment status successfully', async () => {
        // Arrange
        const mockResponse = {
          paymentId: mockPaymentId,
          status: 'succeeded' as const,
        };

        (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useIyzicoPayment());

        // Act
        let paymentResult;
        await act(async () => {
          paymentResult = await result.current.checkStatus(mockPaymentId);
        });

        // Assert
        expect(paymentResult?.success).toBe(true);
        expect(paymentResult?.status).toBe('succeeded');

        expect(apiClient.get).toHaveBeenCalledWith(
          expect.stringContaining(mockPaymentId)
        );
      });
    });

    describe('clearError', () => {
      it('should clear error state', async () => {
        // Arrange
        (apiClient.post as jest.Mock).mockRejectedValue({
          errorCode: '10041',
          errorMessage: 'Test error',
        });

        const { result } = renderHook(() => useIyzicoPayment());

        // Create an error first
        await act(async () => {
          await result.current.initiatePayment({
            orderId: mockOrderId,
            cardOptions: mockValidCardOptions,
          });
        });

        expect(result.current.error).not.toBeNull();

        // Act - Clear error
        act(() => {
          result.current.clearError();
        });

        // Assert
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('Error Handling', () => {
    it('should map known Iyzico error codes to user-friendly messages', async () => {
      // Arrange
      const testCases = [
        { code: '10051', expectedContains: 'Kart numarası' },
        { code: '10005', expectedContains: 'tarihi' },
        { code: '10012', expectedContains: 'CVV' },
        { code: '10041', expectedContains: 'limit' },
      ];

      for (const testCase of testCases) {
        // Arrange
        (apiClient.post as jest.Mock).mockRejectedValue({
          errorCode: testCase.code,
          errorMessage: `Error ${testCase.code}`,
        });

        const { result } = renderHook(() => useIyzicoPayment());

        // Act
        await act(async () => {
          await result.current.initiatePayment({
            orderId: mockOrderId,
            cardOptions: mockValidCardOptions,
          });
        });

        // Assert
        expect(result.current.error?.message).toContain(
          testCase.expectedContains
        );

        // Cleanup
        jest.clearAllMocks();
      }
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      (apiClient.post as jest.Mock).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useIyzicoPayment());

      // Act
      let paymentResult;
      await act(async () => {
        paymentResult = await result.current.initiatePayment({
          orderId: mockOrderId,
          cardOptions: mockValidCardOptions,
        });
      });

      // Assert
      expect(paymentResult?.success).toBe(false);
      expect(paymentResult?.error).toBeDefined();
      expect(result.current.error?.type).toBe('api_error');
    });
  });
});
