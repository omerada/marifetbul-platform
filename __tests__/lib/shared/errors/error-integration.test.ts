/**
 * ================================================
 * ERROR HANDLING INTEGRATION TESTS
 * ================================================
 * Integration tests for error handling in Review System
 *
 * @module __tests__/lib/shared/errors/error-integration.test
 */

import { toast } from 'sonner';
import {
  getErrorMessage,
  logError,
  isRetryableError,
  showErrorToast,
} from '../../../../lib/shared/errors/error-utils';
import {
  NetworkError,
  ValidationError,
  AuthenticationError,
  ServerError,
} from '../../../../lib/api/error-handler';

// Mock sonner
jest.mock('sonner', () => ({
  toast: {
    error: jest.fn(),
    success: jest.fn(),
  },
}));

describe('Error Handling Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Network Errors', () => {
    it('should handle network error properly', () => {
      const error = new NetworkError();
      const message = getErrorMessage(error);

      expect(message).toContain('bağlant');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should show network error toast', () => {
      const error = new NetworkError();
      showErrorToast(error);

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('Validation Errors', () => {
    it('should handle validation error with fields', () => {
      const error = new ValidationError('Validation failed', {
        email: ['Email geçersiz'],
        password: ['Şifre çok kısa'],
      });

      const message = getErrorMessage(error);
      expect(message).toBeDefined();
      expect(isRetryableError(error)).toBe(false);
    });

    it('should show validation error toast', () => {
      const error = new ValidationError('Validation failed');
      showErrorToast(error);

      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('Authentication Errors', () => {
    it('should handle authentication error', () => {
      const error = new AuthenticationError();
      const message = getErrorMessage(error);

      expect(message).toContain('Oturum');
      expect(isRetryableError(error)).toBe(false);
    });

    it('should show authentication error toast', () => {
      const error = new AuthenticationError();
      showErrorToast(error);

      expect(toast.error).toHaveBeenCalled();
      const callArgs = (toast.error as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toContain('Oturum');
    });
  });

  describe('Server Errors', () => {
    it('should handle server error', () => {
      const error = new ServerError();
      const message = getErrorMessage(error);

      expect(message).toContain('Sunucu');
      expect(isRetryableError(error)).toBe(true);
    });

    it('should log server error with context', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new ServerError();

      logError(error, { action: 'fetchData', userId: '123' });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Error Message Consistency', () => {
    it('should provide Turkish error messages', () => {
      const errors = [
        new NetworkError(),
        new ValidationError(),
        new AuthenticationError(),
        new ServerError(),
      ];

      errors.forEach((error) => {
        const message = getErrorMessage(error);
        expect(message).toBeDefined();
        expect(message.length).toBeGreaterThan(0);
      });
    });

    it('should handle unknown errors gracefully', () => {
      const unknownError = new Error('Unknown error');
      const message = getErrorMessage(unknownError);

      expect(message).toBeDefined();
      expect(message).toBe('Unknown error');
    });

    it('should handle string errors', () => {
      const message = getErrorMessage('Simple error string');
      expect(message).toBeDefined();
    });
  });

  describe('Toast Integration', () => {
    it('should show error toast with proper options', () => {
      const error = new NetworkError();
      showErrorToast(error);

      expect(toast.error).toHaveBeenCalled();
      const callArgs = (toast.error as jest.Mock).mock.calls[0];
      expect(callArgs).toBeDefined();
    });

    it('should show custom error message in toast', () => {
      const error = new Error('Test error');
      showErrorToast(error, 'Custom message');

      expect(toast.error).toHaveBeenCalled();
      const callArgs = (toast.error as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toBe('Custom message');
    });
  });

  describe('Logging Integration', () => {
    it('should log errors without throwing', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');

      expect(() => {
        logError(error);
      }).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should log errors with context', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error');
      const context = { action: 'test', data: { id: 1 } };

      logError(error, context);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Retry Logic', () => {
    it('should identify retriable errors correctly', () => {
      expect(isRetryableError(new NetworkError())).toBe(true);
      expect(isRetryableError(new ServerError())).toBe(true);
      expect(isRetryableError(new ValidationError())).toBe(false);
      expect(isRetryableError(new AuthenticationError())).toBe(false);
    });

    it('should identify HTTP status codes for retry', () => {
      const retriableCodes = [0, 408, 429, 500, 502, 503, 504];
      retriableCodes.forEach((status) => {
        const error = { response: { status } };
        expect(isRetryableError(error)).toBe(true);
      });

      const nonRetriableCodes = [400, 401, 403, 404];
      nonRetriableCodes.forEach((status) => {
        const error = { response: { status } };
        expect(isRetryableError(error)).toBe(false);
      });
    });
  });
});
