/**
 * ================================================
 * ERROR HANDLER TESTS
 * ================================================
 * Comprehensive tests for centralized error handling
 *
 * @module lib/api/error-handler.test
 */

import {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  ServerError,
  NetworkError,
  TimeoutError,
  ErrorHandler,
  errorHandler,
  transformError,
  getUserErrorMessage,
  requiresReauth,
  isRetriable,
  isClientError,
  isServerError,
  formatValidationErrors,
  isApiError,
  isValidationError,
  isAuthenticationError,
  isNetworkError,
  isTimeoutError,
  ERROR_CODES,
} from './error-handler';

describe('Error Classes', () => {
  describe('ApiError', () => {
    it('should create ApiError with correct properties', () => {
      const error = new ApiError('Test error', 500, 'TEST_ERROR', {
        foo: 'bar',
      });

      expect(error.message).toBe('Test error');
      expect(error.status).toBe(500);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toEqual({ foo: 'bar' });
      expect(error.retriable).toBe(true); // 500 is retriable
      expect(error.name).toBe('ApiError');
    });

    it('should determine retriable correctly', () => {
      expect(new ApiError('', 0).retriable).toBe(true); // Network error
      expect(new ApiError('', 408).retriable).toBe(true); // Timeout
      expect(new ApiError('', 429).retriable).toBe(true); // Rate limit
      expect(new ApiError('', 500).retriable).toBe(true); // Server error
      expect(new ApiError('', 503).retriable).toBe(true); // Service unavailable

      expect(new ApiError('', 400).retriable).toBe(false); // Bad request
      expect(new ApiError('', 401).retriable).toBe(false); // Unauthorized
      expect(new ApiError('', 404).retriable).toBe(false); // Not found
    });

    it('should convert to JSON', () => {
      const error = new ApiError('Test', 500, 'TEST');
      const json = error.toJSON();

      expect(json.name).toBe('ApiError');
      expect(json.message).toBe('Test');
      expect(json.status).toBe(500);
      expect(json.code).toBe('TEST');
    });

    it('should get user message', () => {
      const error = new ApiError(
        'Technical error',
        500,
        ERROR_CODES.SERVER_ERROR
      );
      expect(error.getUserMessage()).toBe('Sunucu hatası oluştu');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with fields', () => {
      const fields = {
        email: ['Email geçersiz'],
        password: ['Şifre çok kısa', 'Şifre özel karakter içermeli'],
      };
      const error = new ValidationError('Validation failed', fields);

      expect(error.status).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.fields).toEqual(fields);
    });

    it('should get field errors', () => {
      const fields = { email: ['Invalid email'] };
      const error = new ValidationError('Failed', fields);

      expect(error.getFieldErrors()).toEqual(fields);
      expect(error.hasFieldError('email')).toBe(true);
      expect(error.hasFieldError('password')).toBe(false);
      expect(error.getFieldError('email')).toEqual(['Invalid email']);
    });

    it('should get all errors as array', () => {
      const fields = {
        email: ['Error 1'],
        password: ['Error 2', 'Error 3'],
      };
      const error = new ValidationError('Failed', fields);
      const allErrors = error.getAllErrors();

      expect(allErrors).toHaveLength(3);
      expect(allErrors).toContain('email: Error 1');
      expect(allErrors).toContain('password: Error 2');
      expect(allErrors).toContain('password: Error 3');
    });
  });

  describe('AuthenticationError', () => {
    it('should create auth error with default message', () => {
      const error = new AuthenticationError();

      expect(error.status).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.message).toContain('Oturum');
    });

    it('should create auth error with custom message', () => {
      const error = new AuthenticationError('Token invalid');
      expect(error.message).toBe('Token invalid');
    });
  });

  describe('Other Error Classes', () => {
    it('should create AuthorizationError', () => {
      const error = new AuthorizationError();
      expect(error.status).toBe(403);
      expect(error.code).toBe('AUTHORIZATION_ERROR');
    });

    it('should create NotFoundError', () => {
      const error = new NotFoundError('Sipariş');
      expect(error.status).toBe(404);
      expect(error.message).toContain('Sipariş');
    });

    it('should create ConflictError', () => {
      const error = new ConflictError();
      expect(error.status).toBe(409);
    });

    it('should create RateLimitError', () => {
      const error = new RateLimitError('Too many', 60);
      expect(error.status).toBe(429);
      expect(error.retryAfter).toBe(60);
    });

    it('should create ServerError', () => {
      const error = new ServerError();
      expect(error.status).toBe(500);
    });

    it('should create NetworkError', () => {
      const error = new NetworkError();
      expect(error.status).toBe(0);
      expect(error.retriable).toBe(true);
    });

    it('should create TimeoutError', () => {
      const error = new TimeoutError();
      expect(error.status).toBe(408);
      expect(error.retriable).toBe(true);
    });
  });
});

describe('transformError', () => {
  it('should return ApiError as-is', () => {
    const original = new ApiError('Test', 500);
    const transformed = transformError(original);
    expect(transformed).toBe(original);
  });

  it('should transform TypeError to NetworkError', () => {
    const error = new TypeError('Failed to fetch');
    const transformed = transformError(error);

    expect(transformed).toBeInstanceOf(NetworkError);
    expect(transformed.status).toBe(0);
  });

  it('should transform timeout TypeError', () => {
    const error = new TypeError('timeout exceeded');
    const transformed = transformError(error);

    expect(transformed).toBeInstanceOf(TimeoutError);
  });

  it('should transform HTTP 400 to ValidationError', () => {
    const error = { status: 400, message: 'Invalid data' };
    const transformed = transformError(error);

    expect(transformed).toBeInstanceOf(ValidationError);
    expect(transformed.message).toBe('Invalid data');
  });

  it('should transform HTTP 401 to AuthenticationError', () => {
    const error = { status: 401, message: 'Unauthorized' };
    const transformed = transformError(error);

    expect(transformed).toBeInstanceOf(AuthenticationError);
  });

  it('should transform HTTP 404 to NotFoundError', () => {
    const error = { status: 404, message: 'Not found' };
    const transformed = transformError(error);

    expect(transformed).toBeInstanceOf(NotFoundError);
  });

  it('should transform HTTP 500 to ServerError', () => {
    const error = { status: 500, message: 'Server error' };
    const transformed = transformError(error);

    expect(transformed).toBeInstanceOf(ServerError);
  });

  it('should transform backend error format', () => {
    const error = {
      error: {
        code: 'INSUFFICIENT_BALANCE',
        message: 'Yetersiz bakiye',
        details: { required: 100, available: 50 },
      },
    };
    const transformed = transformError(error);

    expect(transformed).toBeInstanceOf(ApiError);
    expect(transformed.code).toBe('INSUFFICIENT_BALANCE');
    expect(transformed.message).toBe('Yetersiz bakiye');
    expect(transformed.details).toEqual({ required: 100, available: 50 });
  });

  it('should transform standard Error', () => {
    const error = new Error('Something went wrong');
    const transformed = transformError(error);

    expect(transformed).toBeInstanceOf(ApiError);
    expect(transformed.message).toBe('Something went wrong');
    expect(transformed.status).toBe(500);
  });

  it('should transform string error', () => {
    const transformed = transformError('Error message');

    expect(transformed).toBeInstanceOf(ApiError);
    expect(transformed.message).toBe('Error message');
  });

  it('should transform unknown error', () => {
    const transformed = transformError({ foo: 'bar' });

    expect(transformed).toBeInstanceOf(ApiError);
    expect(transformed.code).toBe('UNKNOWN_ERROR');
  });
});

describe('ErrorHandler', () => {
  let handler: ErrorHandler;

  beforeEach(() => {
    handler = new ErrorHandler();
  });

  describe('handle', () => {
    it('should handle and transform error', () => {
      const error = new Error('Test error');
      const handled = handler.handle(error, { context: 'test' });

      expect(handled).toBeInstanceOf(ApiError);
      expect(handled.message).toBe('Test error');
    });

    it('should handle with context', () => {
      const error = { status: 500, message: 'Server error' };
      const handled = handler.handle(error, { userId: '123' });

      expect(handled).toBeInstanceOf(ServerError);
    });
  });

  describe('withErrorHandling', () => {
    it('should return result on success', async () => {
      const fn = async () => 'success';
      const result = await handler.withErrorHandling(fn);

      expect(result).toBe('success');
    });

    it('should transform error on failure', async () => {
      const fn = async () => {
        throw new Error('Failed');
      };

      await expect(handler.withErrorHandling(fn)).rejects.toBeInstanceOf(
        ApiError
      );
    });
  });

  describe('retry', () => {
    it('should succeed on first attempt', async () => {
      const fn = jest.fn().mockResolvedValue('success');
      const result = await handler.retry(fn);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retriable error', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new ServerError())
        .mockResolvedValueOnce('success');

      const result = await handler.retry(fn, {
        maxAttempts: 3,
        initialDelay: 10,
      });

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should not retry non-retriable error', async () => {
      const fn = jest.fn().mockRejectedValue(new ValidationError());

      await expect(
        handler.retry(fn, { maxAttempts: 3, initialDelay: 10 })
      ).rejects.toBeInstanceOf(ValidationError);

      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should respect max attempts', async () => {
      const fn = jest.fn().mockRejectedValue(new ServerError());

      await expect(
        handler.retry(fn, { maxAttempts: 3, initialDelay: 10 })
      ).rejects.toBeInstanceOf(ServerError);

      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should apply exponential backoff', async () => {
      const fn = jest.fn().mockRejectedValue(new TimeoutError());
      const startTime = Date.now();

      await expect(
        handler.retry(fn, {
          maxAttempts: 3,
          initialDelay: 100,
          backoffFactor: 2,
        })
      ).rejects.toBeInstanceOf(TimeoutError);

      const elapsed = Date.now() - startTime;
      // Should wait approximately: 100ms + 200ms = 300ms (with some tolerance)
      expect(elapsed).toBeGreaterThanOrEqual(250);
    });
  });
});

describe('Utility Functions', () => {
  describe('getUserErrorMessage', () => {
    it('should get user-friendly message', () => {
      const error = new ServerError();
      const message = getUserErrorMessage(error);

      expect(message).toBe('Sunucu hatası oluştu');
    });

    it('should handle unknown error', () => {
      const message = getUserErrorMessage('Random error');
      expect(message).toBeTruthy();
    });
  });

  describe('requiresReauth', () => {
    it('should detect authentication errors', () => {
      expect(requiresReauth(new AuthenticationError())).toBe(true);
      expect(requiresReauth(new ValidationError())).toBe(false);
      expect(requiresReauth(new ServerError())).toBe(false);
    });
  });

  describe('isRetriable', () => {
    it('should detect retriable errors', () => {
      expect(isRetriable(new NetworkError())).toBe(true);
      expect(isRetriable(new TimeoutError())).toBe(true);
      expect(isRetriable(new ServerError())).toBe(true);
      expect(isRetriable(new RateLimitError())).toBe(true);

      expect(isRetriable(new ValidationError())).toBe(false);
      expect(isRetriable(new AuthenticationError())).toBe(false);
      expect(isRetriable(new NotFoundError())).toBe(false);
    });
  });

  describe('isClientError', () => {
    it('should detect 4xx errors', () => {
      expect(isClientError(new ValidationError())).toBe(true);
      expect(isClientError(new AuthenticationError())).toBe(true);
      expect(isClientError(new NotFoundError())).toBe(true);

      expect(isClientError(new ServerError())).toBe(false);
      expect(isClientError(new NetworkError())).toBe(false);
    });
  });

  describe('isServerError', () => {
    it('should detect 5xx errors', () => {
      expect(isServerError(new ServerError())).toBe(true);
      expect(isServerError(new ServerError('', 503))).toBe(true);

      expect(isServerError(new ValidationError())).toBe(false);
      expect(isServerError(new NetworkError())).toBe(false);
    });
  });

  describe('formatValidationErrors', () => {
    it('should format validation errors', () => {
      const fields = {
        email: ['Email geçersiz'],
        password: ['Şifre çok kısa'],
      };
      const error = new ValidationError('Failed', fields);
      const formatted = formatValidationErrors(error);

      expect(formatted).toHaveLength(2);
      expect(formatted[0]).toContain('email');
      expect(formatted[1]).toContain('password');
    });

    it('should format non-validation errors', () => {
      const error = new ServerError();
      const formatted = formatValidationErrors(error);

      expect(formatted).toHaveLength(1);
      expect(formatted[0]).toBeTruthy();
    });
  });
});

describe('Type Guards', () => {
  it('should detect ApiError', () => {
    expect(isApiError(new ApiError('', 500))).toBe(true);
    expect(isApiError(new ValidationError())).toBe(true);
    expect(isApiError(new Error())).toBe(false);
  });

  it('should detect ValidationError', () => {
    expect(isValidationError(new ValidationError())).toBe(true);
    expect(isValidationError(new ApiError('', 400))).toBe(false);
  });

  it('should detect AuthenticationError', () => {
    expect(isAuthenticationError(new AuthenticationError())).toBe(true);
    expect(isAuthenticationError(new ApiError('', 401))).toBe(false);
  });

  it('should detect NetworkError', () => {
    expect(isNetworkError(new NetworkError())).toBe(true);
    expect(isNetworkError(new ApiError('', 0))).toBe(false);
  });

  it('should detect TimeoutError', () => {
    expect(isTimeoutError(new TimeoutError())).toBe(true);
    expect(isTimeoutError(new ApiError('', 408))).toBe(false);
  });
});

describe('Singleton Instance', () => {
  it('should export singleton errorHandler', () => {
    expect(errorHandler).toBeInstanceOf(ErrorHandler);
  });

  it('should handle errors with singleton', () => {
    const error = new Error('Test');
    const handled = errorHandler.handle(error);

    expect(handled).toBeInstanceOf(ApiError);
  });
});
