/**
 * ================================================
 * ERROR UTILITIES TESTS
 * ================================================
 * Comprehensive tests for shared error utilities
 *
 * @module __tests__/lib/shared/errors/error-utils.test
 */

import { toast } from 'sonner';
import {
  normalizeError,
  getErrorMessage,
  logError,
  isRetryableError,
  showErrorToast,
  handleAsyncOperation,
  retryOperation,
} from '../../../../lib/shared/errors/error-utils';
import {
  NetworkError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ServerError,
} from '../../../../lib/api/error-handler';

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  },
}));

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

describe('Error Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    console.error = jest.fn();
    console.warn = jest.fn();
  });

  afterAll(() => {
    console.error = originalConsoleError;
    console.warn = originalConsoleWarn;
  });

  describe('normalizeError', () => {
    it('should normalize Error object', () => {
      const error = new Error('Test error');
      const normalized = normalizeError(error);

      expect(normalized.message).toBe('Test error');
      expect(normalized.code).toBeDefined();
      expect(normalized.timestamp).toBeInstanceOf(Date);
    });

    it('should normalize NetworkError', () => {
      const error = new NetworkError('Network failed');
      const normalized = normalizeError(error);

      expect(normalized.message).toBe('Network failed');
      expect(normalized.statusCode).toBe(0);
      expect(normalized.retryable).toBe(true);
    });

    it('should normalize ValidationError', () => {
      const error = new ValidationError('Validation failed', {
        email: ['Email geçersiz'],
      });
      const normalized = normalizeError(error);

      expect(normalized.message).toBe('Validation failed');
      expect(normalized.statusCode).toBe(400);
    });

    it('should normalize AuthenticationError', () => {
      const error = new AuthenticationError('Not authenticated');
      const normalized = normalizeError(error);

      expect(normalized.statusCode).toBe(401);
      expect(normalized.retryable).toBe(false);
    });

    it('should normalize AuthorizationError', () => {
      const error = new AuthorizationError('Not authorized');
      const normalized = normalizeError(error);

      expect(normalized.statusCode).toBe(403);
      expect(normalized.retryable).toBe(false);
    });

    it('should normalize NotFoundError', () => {
      const error = new NotFoundError('Resource');
      const normalized = normalizeError(error);

      expect(normalized.statusCode).toBe(404);
      expect(normalized.retryable).toBe(false);
    });

    it('should normalize HTTP response error', () => {
      const error = {
        response: {
          status: 500,
          data: {
            message: 'Server error',
            code: 'SERVER_ERROR',
          },
        },
      };
      const normalized = normalizeError(error);

      expect(normalized.message).toBe('Server error');
      expect(normalized.statusCode).toBe(500);
    });

    it('should normalize string error', () => {
      const normalized = normalizeError('Simple error message');

      expect(normalized.message).toBe('Simple error message');
    });

    it('should normalize unknown error', () => {
      const normalized = normalizeError({ foo: 'bar' });

      expect(normalized.message).toBeDefined();
    });
  });

  describe('getErrorMessage', () => {
    it('should return user-friendly message for NetworkError', () => {
      const error = new NetworkError();
      const message = getErrorMessage(error);

      expect(message).toBe('İnternet bağlantınızı kontrol edin');
    });

    it('should return user-friendly message for ValidationError', () => {
      const error = new ValidationError('Validation failed', {
        email: ['Email geçersiz'],
        password: ['Şifre çok kısa'],
      });
      const message = getErrorMessage(error);

      expect(message).toBe('Email geçersiz, Şifre çok kısa');
    });

    it('should return user-friendly message for AuthenticationError', () => {
      const error = new AuthenticationError();
      const message = getErrorMessage(error);

      expect(message).toBe('Oturum süreniz doldu. Lütfen tekrar giriş yapın');
    });

    it('should return user-friendly message for AuthorizationError', () => {
      const error = new AuthorizationError();
      const message = getErrorMessage(error);

      expect(message).toBe('Bu işlem için yetkiniz bulunmuyor');
    });

    it('should return user-friendly message for NotFoundError', () => {
      const error = new NotFoundError('Order');
      const message = getErrorMessage(error);

      expect(message).toContain('bulunamadı');
    });

    it('should return custom message from error', () => {
      const error = new Error('Custom error message');
      const message = getErrorMessage(error);

      expect(message).toBe('Custom error message');
    });

    it('should handle HTTP status codes', () => {
      const error = { response: { status: 429 } };
      const message = getErrorMessage(error);

      expect(message).toBe('Çok fazla istek gönderdiniz. Lütfen bekleyin');
    });

    it('should return fallback message for unknown error', () => {
      const message = getErrorMessage({ foo: 'bar' });

      expect(message).toBe('Bir hata oluştu. Lütfen tekrar deneyin');
    });
  });

  describe('logError', () => {
    it('should log error with console.error', () => {
      const error = new Error('Test error');
      logError(error);

      expect(console.error).toHaveBeenCalledWith(
        '[Error]',
        expect.stringContaining('Test error'),
        expect.any(Object)
      );
    });

    it('should log error with context', () => {
      const error = new Error('Test error');
      const context = { action: 'fetchData', userId: '123' };

      logError(error, context);

      expect(console.error).toHaveBeenCalledWith(
        '[Error]',
        expect.any(String),
        expect.objectContaining({
          context,
        })
      );
    });

    it('should log warning for low severity errors', () => {
      const error = new ValidationError('Validation failed');
      logError(error);

      expect(console.warn).toHaveBeenCalled();
    });

    it('should include stack trace in development', () => {
      const error = new Error('Test error');
      logError(error);

      expect(console.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          stack: expect.any(String),
        })
      );
    });
  });

  describe('isRetryableError', () => {
    it('should return true for NetworkError', () => {
      const error = new NetworkError();
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for timeout errors', () => {
      const error = { response: { status: 408 } };
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for rate limit errors', () => {
      const error = { response: { status: 429 } };
      expect(isRetryableError(error)).toBe(true);
    });

    it('should return true for server errors', () => {
      expect(isRetryableError({ response: { status: 500 } })).toBe(true);
      expect(isRetryableError({ response: { status: 502 } })).toBe(true);
      expect(isRetryableError({ response: { status: 503 } })).toBe(true);
      expect(isRetryableError({ response: { status: 504 } })).toBe(true);
    });

    it('should return false for ValidationError', () => {
      const error = new ValidationError();
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for AuthenticationError', () => {
      const error = new AuthenticationError();
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for NotFoundError', () => {
      const error = new NotFoundError('Resource');
      expect(isRetryableError(error)).toBe(false);
    });

    it('should return false for client errors', () => {
      expect(isRetryableError({ response: { status: 400 } })).toBe(false);
      expect(isRetryableError({ response: { status: 404 } })).toBe(false);
    });
  });

  describe('showErrorToast', () => {
    it('should show error toast with default message', () => {
      const error = new Error('Test error');
      showErrorToast(error);

      expect(toast.error).toHaveBeenCalledWith('Test error');
    });

    it('should show error toast with custom message', () => {
      const error = new Error('Test error');
      showErrorToast(error, 'Custom message');

      expect(toast.error).toHaveBeenCalledWith('Custom message');
    });

    it('should show user-friendly message for NetworkError', () => {
      const error = new NetworkError();
      showErrorToast(error);

      expect(toast.error).toHaveBeenCalledWith(
        'İnternet bağlantınızı kontrol edin'
      );
    });

    it('should show validation errors', () => {
      const error = new ValidationError('Failed', {
        email: ['Email geçersiz'],
      });
      showErrorToast(error);

      expect(toast.error).toHaveBeenCalledWith('Email geçersiz');
    });
  });

  describe('handleAsyncOperation', () => {
    it('should execute successful operation', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await handleAsyncOperation(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should handle error and show toast', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Failed'));

      await expect(handleAsyncOperation(operation)).rejects.toThrow('Failed');
      expect(toast.error).toHaveBeenCalled();
    });

    it('should log error with context', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Failed'));
      const context = { action: 'test' };

      await expect(
        handleAsyncOperation(operation, { context })
      ).rejects.toThrow();

      expect(console.error).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.objectContaining({
          context,
        })
      );
    });

    it('should use custom error message', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Failed'));

      await expect(
        handleAsyncOperation(operation, {
          errorMessage: 'Custom error',
        })
      ).rejects.toThrow();

      expect(toast.error).toHaveBeenCalledWith('Custom error');
    });

    it('should not show toast if showToast is false', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Failed'));

      await expect(
        handleAsyncOperation(operation, { showToast: false })
      ).rejects.toThrow();

      expect(toast.error).not.toHaveBeenCalled();
    });

    it('should call onError callback', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Failed'));
      const onError = jest.fn();

      await expect(
        handleAsyncOperation(operation, { onError })
      ).rejects.toThrow();

      expect(onError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('retryOperation', () => {
    it('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');
      const result = await retryOperation(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry on retriable error', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new NetworkError())
        .mockResolvedValueOnce('success');

      const result = await retryOperation(operation, {
        maxRetries: 3,
        initialDelay: 10,
      });

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-retriable error', async () => {
      const operation = jest.fn().mockRejectedValue(new ValidationError());

      await expect(
        retryOperation(operation, { maxRetries: 3 })
      ).rejects.toThrow();

      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should respect max attempts', async () => {
      const operation = jest.fn().mockRejectedValue(new NetworkError());

      await expect(
        retryOperation(operation, {
          maxRetries: 3,
          initialDelay: 10,
        })
      ).rejects.toThrow();

      expect(operation).toHaveBeenCalledTimes(3);
    });

    it('should apply exponential backoff', async () => {
      const operation = jest.fn().mockRejectedValue(new NetworkError());
      const startTime = Date.now();

      await expect(
        retryOperation(operation, {
          maxRetries: 3,
          initialDelay: 100,
          backoffMultiplier: 2,
        })
      ).rejects.toThrow();

      const elapsed = Date.now() - startTime;
      // Should wait: 100ms + 200ms = 300ms (with tolerance)
      expect(elapsed).toBeGreaterThanOrEqual(250);
    });

    it('should call onRetry callback', async () => {
      const operation = jest
        .fn()
        .mockRejectedValueOnce(new NetworkError())
        .mockResolvedValueOnce('success');
      const onRetry = jest.fn();

      await retryOperation(operation, {
        maxRetries: 3,
        initialDelay: 10,
        onRetry,
      });

      expect(onRetry).toHaveBeenCalledWith(1, expect.any(NetworkError));
    });

    it('should handle custom shouldRetry function', async () => {
      const operation = jest.fn().mockRejectedValue(new Error('Custom error'));
      const shouldRetry = jest.fn().mockReturnValue(true);

      await expect(
        retryOperation(operation, {
          maxRetries: 2,
          initialDelay: 10,
          shouldRetry,
        })
      ).rejects.toThrow();

      expect(shouldRetry).toHaveBeenCalled();
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });
});

describe('Error Integration Tests', () => {
  it('should handle complete error flow', async () => {
    const operation = jest
      .fn()
      .mockRejectedValueOnce(new NetworkError())
      .mockResolvedValueOnce('success');

    const result = await handleAsyncOperation(
      () => retryOperation(operation, { maxRetries: 3, initialDelay: 10 }),
      {
        context: { action: 'fetchData' },
        errorMessage: 'Veri yüklenemedi',
      }
    );

    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('should handle validation error without retry', async () => {
    const operation = jest.fn().mockRejectedValue(
      new ValidationError('Invalid data', {
        email: ['Email geçersiz'],
      })
    );

    await expect(
      handleAsyncOperation(() => retryOperation(operation), {
        showToast: true,
      })
    ).rejects.toThrow();

    expect(operation).toHaveBeenCalledTimes(1);
    expect(toast.error).toHaveBeenCalledWith('Email geçersiz');
  });

  it('should handle authentication error', async () => {
    const error = new AuthenticationError();
    const normalized = normalizeError(error);
    const message = getErrorMessage(normalized);

    expect(normalized.statusCode).toBe(401);
    expect(message).toBe('Oturum süreniz doldu. Lütfen tekrar giriş yapın');
  });
});
