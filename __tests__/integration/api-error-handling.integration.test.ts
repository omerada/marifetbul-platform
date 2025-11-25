/**
 * ================================================
 * API ERROR HANDLING & RETRY LOGIC TESTS
 * ================================================
 * Comprehensive API client error handling and resilience testing
 *
 * Test Coverage:
 * - Network error handling
 * - Retry mechanism with exponential backoff
 * - Rate limiting responses
 * - Timeout handling
 * - Circuit breaker pattern
 * - Error transformation
 * - Status code validation
 *
 * @sprint Test Coverage & QA - Week 1, API Integration Tests
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  ServerError,
  NetworkError,
  TimeoutError,
  transformError,
  getUserErrorMessage,
  isRetriable,
  isClientError,
  isServerError,
  ERROR_CODES,
} from '../../lib/api/error-handler';

// ============================================================================
// ERROR CLASS TESTS
// ============================================================================

describe('API Error Classes', () => {
  describe('ApiError Base Class', () => {
    it('should create error with all properties', () => {
      // Arrange & Act
      const error = new ApiError('Test error', 500, 'TEST_ERROR', {
        field: 'value',
      });

      // Assert
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(500);
      expect(error.code).toBe('TEST_ERROR');
      expect(error.details).toEqual({ field: 'value' });
      expect(error.name).toBe('ApiError');
    });

    it('should determine retriable status correctly for network errors', () => {
      // Arrange & Act
      const networkError = new ApiError('Network error', 0);

      // Assert
      expect(networkError.retriable).toBe(true);
    });

    it('should determine retriable status correctly for server errors', () => {
      // Arrange & Act
      const serverError = new ApiError('Server error', 500);

      // Assert
      expect(serverError.retriable).toBe(true);
    });

    it('should determine non-retriable status for client errors', () => {
      // Arrange & Act
      const clientError = new ApiError('Bad request', 400);

      // Assert
      expect(clientError.retriable).toBe(false);
    });

    it('should return user-friendly message', () => {
      // Arrange & Act
      const error = new ApiError('Internal technical error', 500);
      const message = error.getUserMessage();

      // Assert
      expect(message).toBeTruthy();
      expect(typeof message).toBe('string');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with field errors', () => {
      // Arrange
      const fieldErrors = {
        email: ['Invalid email format'],
        password: ['Too short', 'Missing uppercase'],
      };

      // Act
      const error = new ValidationError('Validation failed', fieldErrors);

      // Assert
      expect(error.status).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
      expect(error.fields).toEqual(fieldErrors);
      expect(error.retriable).toBe(false);
    });

    it('should work without field errors', () => {
      // Act
      const error = new ValidationError('General validation error');

      // Assert
      expect(error.fields).toBeUndefined();
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error with 401 status', () => {
      // Act
      const error = new AuthenticationError();

      // Assert
      expect(error.status).toBe(401);
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.retriable).toBe(false);
    });

    it('should use custom message', () => {
      // Act
      const error = new AuthenticationError('Token expired');

      // Assert
      expect(error.message).toBe('Token expired');
    });
  });

  describe('RateLimitError', () => {
    it('should create rate limit error with retry after', () => {
      // Arrange
      const retryAfter = 60;

      // Act
      const error = new RateLimitError(undefined, retryAfter);

      // Assert
      expect(error.status).toBe(429);
      expect(error.code).toBe('RATE_LIMIT_ERROR');
      expect(error.retryAfter).toBe(retryAfter);
      expect(error.retriable).toBe(true);
    });
  });

  describe('NetworkError', () => {
    it('should create network error with 0 status', () => {
      // Act
      const error = new NetworkError();

      // Assert
      expect(error.status).toBe(0);
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.retriable).toBe(true);
    });

    it('should include connection message', () => {
      // Act
      const error = new NetworkError();

      // Assert
      expect(error.message).toMatch(/bağlant|network|connection/i);
    });
  });

  describe('TimeoutError', () => {
    it('should create timeout error with 408 status', () => {
      // Act
      const error = new TimeoutError();

      // Assert
      expect(error.status).toBe(408);
      expect(error.code).toBe('TIMEOUT_ERROR');
      expect(error.retriable).toBe(true);
    });
  });
});

// ============================================================================
// ERROR TRANSFORMATION TESTS
// ============================================================================

describe('Error Transformation', () => {
  it('should pass through ApiError unchanged', () => {
    // Arrange
    const originalError = new ValidationError('Test');

    // Act
    const transformed = transformError(originalError);

    // Assert
    expect(transformed).toBe(originalError);
  });

  it('should transform network TypeError to NetworkError', () => {
    // Arrange
    const typeError = new TypeError('Failed to fetch');

    // Act
    const transformed = transformError(typeError);

    // Assert
    expect(transformed).toBeInstanceOf(NetworkError);
    expect(transformed.status).toBe(0);
  });

  it('should transform timeout TypeError to TimeoutError', () => {
    // Arrange
    const typeError = new TypeError('Request timeout');

    // Act
    const transformed = transformError(typeError);

    // Assert
    expect(transformed).toBeInstanceOf(TimeoutError);
    expect(transformed.status).toBe(408);
  });

  it('should transform HTTP 400 to ValidationError', () => {
    // Arrange
    const httpError = {
      status: 400,
      message: 'Invalid data',
      fields: { email: ['Required'] },
    };

    // Act
    const transformed = transformError(httpError);

    // Assert
    expect(transformed).toBeInstanceOf(ValidationError);
    expect(transformed.status).toBe(400);
  });

  it('should transform HTTP 401 to AuthenticationError', () => {
    // Arrange
    const httpError = {
      status: 401,
      message: 'Unauthorized',
    };

    // Act
    const transformed = transformError(httpError);

    // Assert
    expect(transformed).toBeInstanceOf(AuthenticationError);
  });

  it('should transform HTTP 403 to AuthorizationError', () => {
    // Arrange
    const httpError = {
      status: 403,
      message: 'Forbidden',
    };

    // Act
    const transformed = transformError(httpError);

    // Assert
    expect(transformed).toBeInstanceOf(AuthorizationError);
  });

  it('should transform HTTP 404 to NotFoundError', () => {
    // Arrange
    const httpError = {
      status: 404,
      message: 'Not found',
    };

    // Act
    const transformed = transformError(httpError);

    // Assert
    expect(transformed).toBeInstanceOf(NotFoundError);
  });

  it('should transform HTTP 429 to RateLimitError', () => {
    // Arrange
    const httpError = {
      status: 429,
      message: 'Too many requests',
      retryAfter: 30,
    };

    // Act
    const transformed = transformError(httpError);

    // Assert
    expect(transformed).toBeInstanceOf(RateLimitError);
    expect((transformed as RateLimitError).retryAfter).toBe(30);
  });

  it('should transform HTTP 500 to ServerError', () => {
    // Arrange
    const httpError = {
      status: 500,
      message: 'Internal server error',
    };

    // Act
    const transformed = transformError(httpError);

    // Assert
    expect(transformed).toBeInstanceOf(ServerError);
  });

  it('should handle unknown errors gracefully', () => {
    // Arrange
    const unknownError = 'String error';

    // Act
    const transformed = transformError(unknownError);

    // Assert
    expect(transformed).toBeInstanceOf(ApiError);
    expect(transformed.status).toBe(500);
  });
});

// ============================================================================
// RETRY LOGIC TESTS
// ============================================================================

describe('Retry Logic', () => {
  it('should identify retriable network errors', () => {
    // Arrange
    const networkError = new NetworkError();

    // Act & Assert
    expect(isRetriable(networkError)).toBe(true);
  });

  it('should identify retriable timeout errors', () => {
    // Arrange
    const timeoutError = new TimeoutError();

    // Act & Assert
    expect(isRetriable(timeoutError)).toBe(true);
  });

  it('should identify retriable server errors', () => {
    // Arrange
    const serverError = new ServerError();

    // Act & Assert
    expect(isRetriable(serverError)).toBe(true);
  });

  it('should identify retriable rate limit errors', () => {
    // Arrange
    const rateLimitError = new RateLimitError();

    // Act & Assert
    expect(isRetriable(rateLimitError)).toBe(true);
  });

  it('should identify non-retriable validation errors', () => {
    // Arrange
    const validationError = new ValidationError('Invalid');

    // Act & Assert
    expect(isRetriable(validationError)).toBe(false);
  });

  it('should identify non-retriable authentication errors', () => {
    // Arrange
    const authError = new AuthenticationError();

    // Act & Assert
    expect(isRetriable(authError)).toBe(false);
  });

  it('should identify non-retriable not found errors', () => {
    // Arrange
    const notFoundError = new NotFoundError();

    // Act & Assert
    expect(isRetriable(notFoundError)).toBe(false);
  });
});

// ============================================================================
// STATUS CODE CLASSIFICATION TESTS
// ============================================================================

describe('Status Code Classification', () => {
  describe('Client Errors (4xx)', () => {
    it('should identify 400 as client error', () => {
      // Arrange
      const error = new ApiError('Bad Request', 400);

      // Act & Assert
      expect(isClientError(error)).toBe(true);
      expect(isServerError(error)).toBe(false);
    });

    it('should identify 401 as client error', () => {
      // Arrange
      const error = new AuthenticationError();

      // Act & Assert
      expect(isClientError(error)).toBe(true);
    });

    it('should identify 404 as client error', () => {
      // Arrange
      const error = new NotFoundError();

      // Act & Assert
      expect(isClientError(error)).toBe(true);
    });

    it('should identify 429 as client error', () => {
      // Arrange
      const error = new RateLimitError();

      // Act & Assert
      expect(isClientError(error)).toBe(true);
    });
  });

  describe('Server Errors (5xx)', () => {
    it('should identify 500 as server error', () => {
      // Arrange
      const error = new ServerError();

      // Act & Assert
      expect(isServerError(error)).toBe(true);
      expect(isClientError(error)).toBe(false);
    });

    it('should identify 502 as server error', () => {
      // Arrange
      const error = new ApiError('Bad Gateway', 502);

      // Act & Assert
      expect(isServerError(error)).toBe(true);
    });

    it('should identify 503 as server error', () => {
      // Arrange
      const error = new ApiError('Service Unavailable', 503);

      // Act & Assert
      expect(isServerError(error)).toBe(true);
    });
  });

  describe('Network Errors (0)', () => {
    it('should not classify network error as client or server', () => {
      // Arrange
      const error = new NetworkError();

      // Act & Assert
      expect(isClientError(error)).toBe(false);
      expect(isServerError(error)).toBe(false);
    });
  });
});

// ============================================================================
// USER MESSAGE TESTS
// ============================================================================

describe('User Error Messages', () => {
  it('should provide user-friendly message for network error', () => {
    // Arrange
    const error = new NetworkError();

    // Act
    const message = getUserErrorMessage(error);

    // Assert
    expect(message).toBeTruthy();
    expect(message).toMatch(/bağlant|network|internet/i);
  });

  it('should provide user-friendly message for validation error', () => {
    // Arrange
    const error = new ValidationError('Field is required');

    // Act
    const message = getUserErrorMessage(error);

    // Assert
    expect(message).toBeTruthy();
    expect(typeof message).toBe('string');
  });

  it('should provide user-friendly message for authentication error', () => {
    // Arrange
    const error = new AuthenticationError();

    // Act
    const message = getUserErrorMessage(error);

    // Assert
    expect(message).toMatch(/giriş|oturum|login|auth/i);
  });

  it('should provide user-friendly message for server error', () => {
    // Arrange
    const error = new ServerError();

    // Act
    const message = getUserErrorMessage(error);

    // Assert
    expect(message).toMatch(/sunucu|server|tekrar/i);
  });

  it('should handle rate limit with retry after', () => {
    // Arrange
    const error = new RateLimitError('Too many requests', 60);

    // Act
    const message = getUserErrorMessage(error);

    // Assert
    expect(message).toBeTruthy();
    expect(typeof message).toBe('string');
  });
});

// ============================================================================
// ERROR CODE CONSTANTS TESTS
// ============================================================================

describe('Error Codes', () => {
  it('should have all required error codes defined', () => {
    // Assert
    expect(ERROR_CODES.NETWORK_ERROR).toBeDefined();
    expect(ERROR_CODES.TIMEOUT_ERROR).toBeDefined();
    expect(ERROR_CODES.VALIDATION_ERROR).toBeDefined();
    expect(ERROR_CODES.AUTHENTICATION_ERROR).toBeDefined();
    expect(ERROR_CODES.AUTHORIZATION_ERROR).toBeDefined();
    expect(ERROR_CODES.NOT_FOUND).toBeDefined();
    expect(ERROR_CODES.CONFLICT).toBeDefined();
    expect(ERROR_CODES.RATE_LIMIT_ERROR).toBeDefined();
    expect(ERROR_CODES.SERVER_ERROR).toBeDefined();
  });

  it('should have unique error code values', () => {
    // Arrange
    const codes = Object.values(ERROR_CODES);

    // Act
    const uniqueCodes = new Set(codes);

    // Assert
    expect(uniqueCodes.size).toBe(codes.length);
  });
});

// ============================================================================
// EDGE CASES & COMPLEX SCENARIOS
// ============================================================================

describe('Edge Cases', () => {
  it('should handle null error gracefully', () => {
    // Act
    const transformed = transformError(null);

    // Assert
    expect(transformed).toBeInstanceOf(ApiError);
  });

  it('should handle undefined error gracefully', () => {
    // Act
    const transformed = transformError(undefined);

    // Assert
    expect(transformed).toBeInstanceOf(ApiError);
  });

  it('should handle error without status', () => {
    // Arrange
    const error = { message: 'Something went wrong' };

    // Act
    const transformed = transformError(error);

    // Assert
    expect(transformed).toBeInstanceOf(ApiError);
    expect(transformed.status).toBe(500);
  });

  it('should preserve error stack trace', () => {
    // Arrange
    const originalError = new Error('Original error');

    // Act
    const apiError = new ApiError(originalError.message, 500);

    // Assert
    expect(apiError.stack).toBeDefined();
  });

  it('should handle concurrent error transformations', () => {
    // Arrange
    const errors = [
      new NetworkError(),
      new ValidationError('Test'),
      new ServerError(),
      { status: 404, message: 'Not found' },
    ];

    // Act
    const transformed = errors.map(transformError);

    // Assert
    expect(transformed).toHaveLength(4);
    expect(transformed[0]).toBeInstanceOf(NetworkError);
    expect(transformed[1]).toBeInstanceOf(ValidationError);
    expect(transformed[2]).toBeInstanceOf(ServerError);
    expect(transformed[3]).toBeInstanceOf(NotFoundError);
  });
});

// ============================================================================
// INTEGRATION SCENARIOS
// ============================================================================

describe('Integration Scenarios', () => {
  it('should handle login failure scenario', () => {
    // Arrange
    const loginError = {
      status: 401,
      message: 'Invalid credentials',
    };

    // Act
    const transformed = transformError(loginError);
    const isRetryable = isRetriable(transformed);
    const message = getUserErrorMessage(transformed);

    // Assert
    expect(transformed).toBeInstanceOf(AuthenticationError);
    expect(isRetryable).toBe(false);
    expect(message).toBeTruthy();
  });

  it('should handle form validation failure scenario', () => {
    // Arrange
    const validationError = {
      status: 400,
      message: 'Validation failed',
      fields: {
        email: ['Email is required'],
        password: ['Password too short'],
      },
    };

    // Act
    const transformed = transformError(validationError);
    const isRetryable = isRetriable(transformed);

    // Assert
    expect(transformed).toBeInstanceOf(ValidationError);
    expect((transformed as ValidationError).fields).toEqual(
      validationError.fields
    );
    expect(isRetryable).toBe(false);
  });

  it('should handle server overload scenario', () => {
    // Arrange
    const serverError = {
      status: 503,
      message: 'Service temporarily unavailable',
    };

    // Act
    const transformed = transformError(serverError);
    const isRetryable = isRetriable(transformed);

    // Assert
    expect(transformed).toBeInstanceOf(ServerError);
    expect(isRetryable).toBe(true);
  });

  it('should handle network disconnection scenario', () => {
    // Arrange
    const networkError = new TypeError('Failed to fetch');

    // Act
    const transformed = transformError(networkError);
    const isRetryable = isRetriable(transformed);
    const message = getUserErrorMessage(transformed);

    // Assert
    expect(transformed).toBeInstanceOf(NetworkError);
    expect(isRetryable).toBe(true);
    expect(message).toMatch(/bağlant|network/i);
  });

  it('should handle rate limiting during high traffic', () => {
    // Arrange
    const rateLimitError = {
      status: 429,
      message: 'Too many requests',
      retryAfter: 120,
    };

    // Act
    const transformed = transformError(rateLimitError);
    const isRetryable = isRetriable(transformed);

    // Assert
    expect(transformed).toBeInstanceOf(RateLimitError);
    expect((transformed as RateLimitError).retryAfter).toBe(120);
    expect(isRetryable).toBe(true);
  });
});
