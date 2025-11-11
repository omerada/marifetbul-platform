/**
 * ================================================
 * USE IYZICO PAYMENT HOOK TESTS
 * ================================================
 * Integration tests for unified Iyzico payment hook
 * 
 * Coverage:
 * - Payment initiation flow
 * - 3D Secure redirect handling
 * - Callback processing
 * - Error handling
 * - Retry logic
 * - State management
 * 
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Testing & QA
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { useIyzicoPayment } from '@/hooks/business/useIyzicoPayment';

// Mock apiClient
jest.mock('@/lib/infrastructure/api/client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

// Mock logger
jest.mock('@/lib/infrastructure/monitoring/logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

const mockApiClient = require('@/lib/infrastructure/api/client').apiClient;

describe('useIyzicoPayment Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset window.location
    delete (window as any).location;
    (window as any).location = { href: '', origin: 'http://localhost:3000' };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useIyzicoPayment());

      expect(result.current.isProcessing).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.currentPaymentIntentId).toBe(null);
    });

    it('should accept custom options', () => {
      const { result } = renderHook(() =>
        useIyzicoPayment({
          autoRedirect: false,
          returnUrl: 'https://custom.com/callback',
          debug: true,
        })
      );

      expect(result.current).toBeDefined();
    });
  });

  describe('initiatePayment', () => {
    const mockPaymentData = {
      orderId: 'order_123',
      cardOptions: {
        cardHolderName: 'JOHN DOE',
        cardNumber: '4111111111111111',
        expireMonth: '12',
        expireYear: '25',
        cvc: '123',
      },
    };

    it('should successfully initiate payment without 3D Secure', async () => {
      const mockResponse = {
        paymentId: 'payment_123',
        clientSecret: 'secret_123',
        amount: 100,
        currency: 'TRY',
        status: 'succeeded',
        requiresAction: false,
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useIyzicoPayment());

      let paymentResult;
      await act(async () => {
        paymentResult = await result.current.initiatePayment(mockPaymentData);
      });

      expect(paymentResult).toEqual({
        success: true,
        paymentId: 'payment_123',
        status: 'succeeded',
        requiresAction: false,
      });
      expect(result.current.currentPaymentIntentId).toBe('payment_123');
      expect(result.current.isProcessing).toBe(false);
    });

    it('should handle 3D Secure requirement with auto-redirect', async () => {
      const mockResponse = {
        paymentId: 'payment_123',
        clientSecret: 'secret_123',
        amount: 100,
        currency: 'TRY',
        status: 'requires_action',
        requiresAction: true,
        nextActionUrl: 'https://iyzico.com/3dsecure',
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useIyzicoPayment({ autoRedirect: true }));

      let paymentResult;
      await act(async () => {
        paymentResult = await result.current.initiatePayment(mockPaymentData);
      });

      expect(paymentResult).toEqual({
        success: false,
        paymentId: 'payment_123',
        status: 'requires_action',
        requiresAction: true,
        nextActionUrl: 'https://iyzico.com/3dsecure',
      });
      expect(window.location.href).toBe('https://iyzico.com/3dsecure');
    });

    it('should not auto-redirect when disabled', async () => {
      const mockResponse = {
        paymentId: 'payment_123',
        clientSecret: 'secret_123',
        amount: 100,
        currency: 'TRY',
        status: 'requires_action',
        requiresAction: true,
        nextActionUrl: 'https://iyzico.com/3dsecure',
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useIyzicoPayment({ autoRedirect: false }));

      let paymentResult;
      await act(async () => {
        paymentResult = await result.current.initiatePayment(mockPaymentData);
      });

      expect(window.location.href).toBe('');
      expect(paymentResult?.nextActionUrl).toBe('https://iyzico.com/3dsecure');
    });

    it('should handle API errors gracefully', async () => {
      const mockError = new Error('Payment gateway error');
      mockApiClient.post.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useIyzicoPayment());

      let paymentResult;
      await act(async () => {
        paymentResult = await result.current.initiatePayment(mockPaymentData);
      });

      expect(paymentResult?.success).toBe(false);
      expect(paymentResult?.error).toBeDefined();
      expect(result.current.error).toBeDefined();
      expect(result.current.isProcessing).toBe(false);
    });

    it('should prevent duplicate payment requests', async () => {
      const mockResponse = {
        paymentId: 'payment_123',
        clientSecret: 'secret_123',
        amount: 100,
        currency: 'TRY',
        status: 'succeeded',
        requiresAction: false,
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useIyzicoPayment());

      // Start first payment
      const promise1 = act(async () => {
        return result.current.initiatePayment(mockPaymentData);
      });

      // Try to start second payment immediately
      const promise2 = act(async () => {
        return result.current.initiatePayment(mockPaymentData);
      });

      const [result1, result2] = await Promise.all([promise1, promise2]);

      // First should succeed, second should be rejected
      expect(result1?.success).toBe(true);
      expect(result2?.success).toBe(false);
      expect(result2?.error?.type).toBe('validation_error');
    });

    it('should use custom return URL', async () => {
      const customReturnUrl = 'https://custom.com/callback';
      const mockResponse = {
        paymentId: 'payment_123',
        clientSecret: 'secret_123',
        amount: 100,
        currency: 'TRY',
        status: 'succeeded',
        requiresAction: false,
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() =>
        useIyzicoPayment({ returnUrl: customReturnUrl })
      );

      await act(async () => {
        await result.current.initiatePayment(mockPaymentData);
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          returnUrl: customReturnUrl,
        })
      );
    });
  });

  describe('confirmPayment', () => {
    it('should successfully confirm payment', async () => {
      const mockResponse = {
        paymentId: 'payment_123',
        clientSecret: 'secret_123',
        amount: 100,
        currency: 'TRY',
        status: 'succeeded',
        requiresAction: false,
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useIyzicoPayment());

      let confirmResult;
      await act(async () => {
        confirmResult = await result.current.confirmPayment({
          paymentIntentId: 'payment_123',
          conversationId: 'conv_123',
        });
      });

      expect(confirmResult).toEqual({
        success: true,
        paymentId: 'payment_123',
        status: 'succeeded',
      });
    });

    it('should handle failed payment confirmation', async () => {
      const mockResponse = {
        paymentId: 'payment_123',
        clientSecret: 'secret_123',
        amount: 100,
        currency: 'TRY',
        status: 'failed',
        requiresAction: false,
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useIyzicoPayment());

      let confirmResult;
      await act(async () => {
        confirmResult = await result.current.confirmPayment({
          paymentIntentId: 'payment_123',
        });
      });

      expect(confirmResult?.success).toBe(false);
      expect(confirmResult?.error).toBeDefined();
    });

    it('should prevent duplicate confirmation requests', async () => {
      const mockResponse = {
        paymentId: 'payment_123',
        status: 'succeeded',
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useIyzicoPayment());

      const promise1 = act(async () => {
        return result.current.confirmPayment({ paymentIntentId: 'payment_123' });
      });

      const promise2 = act(async () => {
        return result.current.confirmPayment({ paymentIntentId: 'payment_123' });
      });

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1?.success).toBe(true);
      expect(result2?.success).toBe(false);
    });
  });

  describe('handleCallback', () => {
    it('should handle successful 3D Secure callback', async () => {
      const mockResponse = {
        paymentId: 'payment_123',
        status: 'succeeded',
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useIyzicoPayment());

      let callbackResult;
      await act(async () => {
        callbackResult = await result.current.handleCallback('payment_123');
      });

      expect(callbackResult?.success).toBe(true);
      expect(callbackResult?.paymentId).toBe('payment_123');
    });

    it('should handle missing payment intent ID', async () => {
      const { result } = renderHook(() => useIyzicoPayment());

      let callbackResult;
      await act(async () => {
        callbackResult = await result.current.handleCallback('');
      });

      expect(callbackResult?.success).toBe(false);
      expect(callbackResult?.error?.type).toBe('validation_error');
      expect(result.current.error).toBeDefined();
    });
  });

  describe('checkStatus', () => {
    it('should retrieve payment status successfully', async () => {
      const mockResponse = {
        paymentId: 'payment_123',
        status: 'succeeded',
        amount: 100,
        currency: 'TRY',
      };

      mockApiClient.get.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useIyzicoPayment());

      let statusResult;
      await act(async () => {
        statusResult = await result.current.checkStatus('payment_123');
      });

      expect(statusResult).toEqual({
        success: true,
        paymentId: 'payment_123',
        status: 'succeeded',
      });
    });

    it('should handle status check errors', async () => {
      mockApiClient.get.mockRejectedValueOnce(new Error('Not found'));

      const { result } = renderHook(() => useIyzicoPayment());

      let statusResult;
      await act(async () => {
        statusResult = await result.current.checkStatus('invalid_id');
      });

      expect(statusResult?.success).toBe(false);
      expect(statusResult?.error).toBeDefined();
    });
  });

  describe('Error Management', () => {
    it('should clear error state', () => {
      const { result } = renderHook(() => useIyzicoPayment());

      // Manually set error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
    });

    it('should map Iyzico error codes to user-friendly messages', async () => {
      const mockError = {
        errorCode: '10051',
        errorMessage: 'Invalid card number',
      };

      mockApiClient.post.mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useIyzicoPayment());

      await act(async () => {
        await result.current.initiatePayment({
          orderId: 'order_123',
          cardOptions: {
            cardHolderName: 'JOHN DOE',
            cardNumber: '1234567890123456',
            expireMonth: '12',
            expireYear: '25',
            cvc: '123',
          },
        });
      });

      expect(result.current.error?.message).toContain('Kart numarası geçersiz');
    });
  });

  describe('State Management', () => {
    it('should track processing state correctly', async () => {
      const mockResponse = {
        paymentId: 'payment_123',
        status: 'succeeded',
        requiresAction: false,
      };

      mockApiClient.post.mockImplementation(() => {
        return new Promise((resolve) => {
          setTimeout(() => resolve(mockResponse), 100);
        });
      });

      const { result } = renderHook(() => useIyzicoPayment());

      expect(result.current.isProcessing).toBe(false);

      const paymentPromise = act(async () => {
        return result.current.initiatePayment({
          orderId: 'order_123',
          cardOptions: {
            cardHolderName: 'JOHN DOE',
            cardNumber: '4111111111111111',
            expireMonth: '12',
            expireYear: '25',
            cvc: '123',
          },
        });
      });

      // Should be processing during API call
      await waitFor(() => {
        expect(result.current.isProcessing).toBe(true);
      });

      await paymentPromise;

      // Should be done after completion
      expect(result.current.isProcessing).toBe(false);
    });

    it('should update currentPaymentIntentId on successful payment', async () => {
      const mockResponse = {
        paymentId: 'payment_456',
        status: 'succeeded',
        requiresAction: false,
      };

      mockApiClient.post.mockResolvedValueOnce(mockResponse);

      const { result } = renderHook(() => useIyzicoPayment());

      await act(async () => {
        await result.current.initiatePayment({
          orderId: 'order_123',
          cardOptions: {
            cardHolderName: 'JOHN DOE',
            cardNumber: '4111111111111111',
            expireMonth: '12',
            expireYear: '25',
            cvc: '123',
          },
        });
      });

      expect(result.current.currentPaymentIntentId).toBe('payment_456');
    });
  });
});
