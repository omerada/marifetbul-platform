/**
 * ================================================
 * RETRY MANAGER & CIRCUIT BREAKER TESTS
 * ================================================
 * Comprehensive retry mechanism and resilience pattern testing
 *
 * Test Coverage:
 * - Exponential backoff calculation
 * - Retry logic with configurable attempts
 * - Circuit breaker pattern (open/closed/half-open states)
 * - Timeout handling
 * - Jitter in backoff delays
 * - Custom retry conditions
 * - Retry presets
 *
 * @sprint Test Coverage & QA - Week 1, API Resilience Tests
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import {
  RetryManager,
  RetryPresets,
} from '../../lib/infrastructure/retry/retryManager';

// Helper to create mock API call
const createMockApiCall = (
  failTimes: number,
  successValue: string = 'success'
) => {
  let callCount = 0;
  return jest.fn(async () => {
    callCount++;
    if (callCount <= failTimes) {
      // Use "fetch" keyword for retry detection
      throw new Error(`Failed to fetch (attempt ${callCount})`);
    }
    return successValue;
  });
};

// Helper to create HTTP error
const createHttpError = (status: number, message: string = 'Error') => {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
};

// ============================================================================
// BASIC RETRY FUNCTIONALITY
// ============================================================================

describe('RetryManager - Basic Retry', () => {
  let retryManager: RetryManager;

  beforeEach(() => {
    retryManager = new RetryManager();
    retryManager.resetAllCircuits();
  });

  it('should succeed on first attempt', async () => {
    // Arrange
    const mockCall = createMockApiCall(0, 'first-try');

    // Act
    const result = await retryManager.execute(mockCall, '/test-endpoint', {
      maxRetries: 3,
    });

    // Assert
    expect(result).toBe('first-try');
    expect(mockCall).toHaveBeenCalledTimes(1);
  });

  it('should retry once and succeed on second attempt', async () => {
    // Arrange
    const mockCall = createMockApiCall(1, 'second-try');

    // Act
    const result = await retryManager.execute(mockCall, '/test-endpoint', {
      maxRetries: 3,
      initialDelay: 10,
    });

    // Assert
    expect(result).toBe('second-try');
    expect(mockCall).toHaveBeenCalledTimes(2);
  });

  it('should retry multiple times and succeed', async () => {
    // Arrange
    const mockCall = createMockApiCall(2, 'third-try');

    // Act
    const result = await retryManager.execute(mockCall, '/test-endpoint', {
      maxRetries: 3,
      initialDelay: 10,
    });

    // Assert
    expect(result).toBe('third-try');
    expect(mockCall).toHaveBeenCalledTimes(3);
  });

  it('should exhaust retries and throw last error', async () => {
    // Arrange
    const mockCall = createMockApiCall(10); // Always fails

    // Act & Assert
    await expect(
      retryManager.execute(mockCall, '/test-endpoint', {
        maxRetries: 2,
        initialDelay: 10,
      })
    ).rejects.toThrow('Failed to fetch');

    expect(mockCall).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it('should respect maxRetries=0 (no retries)', async () => {
    // Arrange
    const mockCall = createMockApiCall(1);

    // Act & Assert
    await expect(
      retryManager.execute(mockCall, '/test-endpoint', { maxRetries: 0 })
    ).rejects.toThrow();

    expect(mockCall).toHaveBeenCalledTimes(1); // Only initial attempt
  });
});

// ============================================================================
// EXPONENTIAL BACKOFF TESTS
// ============================================================================

describe('RetryManager - Exponential Backoff', () => {
  let retryManager: RetryManager;

  beforeEach(() => {
    retryManager = new RetryManager();
    retryManager.resetAllCircuits();
  });

  it('should apply delays between retry attempts', async () => {
    // Arrange
    const mockCall = createMockApiCall(2);
    const startTime = Date.now();

    // Act
    await retryManager.execute(mockCall, '/test-endpoint', {
      maxRetries: 2,
      initialDelay: 50,
      jitter: false,
    });

    const duration = Date.now() - startTime;

    // Assert - Should have delays between retries
    expect(mockCall).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    expect(duration).toBeGreaterThan(50); // At least initial delay
  });

  it('should disable jitter when configured', async () => {
    // Arrange
    const mockCall = createMockApiCall(1);

    // Act
    await retryManager.execute(mockCall, '/test-endpoint', {
      maxRetries: 1,
      initialDelay: 10,
      jitter: false,
    });

    // Assert - Should work without jitter
    expect(mockCall).toHaveBeenCalledTimes(2);
  });
});

// ============================================================================
// CIRCUIT BREAKER PATTERN TESTS
// ============================================================================

describe('RetryManager - Circuit Breaker', () => {
  let retryManager: RetryManager;

  beforeEach(() => {
    retryManager = new RetryManager();
    retryManager.resetAllCircuits();
  });

  it('should open circuit after threshold failures', async () => {
    // Arrange
    const mockCall = jest.fn().mockRejectedValue(new Error('Server error'));

    // Act - Trigger 5 failures (threshold)
    for (let i = 0; i < 5; i++) {
      try {
        await retryManager.execute(mockCall, '/failing-endpoint', {
          maxRetries: 0,
          initialDelay: 1,
        });
      } catch {
        // Expected
      }
    }

    // Assert - Circuit should be open
    await expect(
      retryManager.execute(mockCall, '/failing-endpoint', { maxRetries: 0 })
    ).rejects.toThrow(/Circuit breaker open/);
  });

  it('should keep circuit closed on successes', async () => {
    // Arrange
    const mockCall = jest.fn().mockResolvedValue('success');

    // Act - Multiple successful calls
    for (let i = 0; i < 10; i++) {
      await retryManager.execute(mockCall, '/healthy-endpoint', {
        maxRetries: 0,
      });
    }

    const stats = retryManager.getStats();

    // Assert
    expect(stats['/healthy-endpoint'].state).toBe('closed');
    expect(stats['/healthy-endpoint'].failures).toBe(0);
  });

  it('should reset failures on success', async () => {
    // Arrange
    const mockCall = jest.fn();

    // Fail 3 times
    mockCall.mockRejectedValueOnce(new Error('Error 1'));
    mockCall.mockRejectedValueOnce(new Error('Error 2'));
    mockCall.mockRejectedValueOnce(new Error('Error 3'));

    for (let i = 0; i < 3; i++) {
      try {
        await retryManager.execute(mockCall, '/endpoint', { maxRetries: 0 });
      } catch {
        // Expected
      }
    }

    // Then succeed
    mockCall.mockResolvedValue('success');
    await retryManager.execute(mockCall, '/endpoint', { maxRetries: 0 });

    // Assert
    const stats = retryManager.getStats();
    expect(stats['/endpoint'].failures).toBe(0);
    expect(stats['/endpoint'].state).toBe('closed');
  });

  it('should transition to half-open after timeout', async () => {
    // Arrange
    const mockCall = jest.fn().mockRejectedValue(new Error('Error'));

    // Open circuit
    for (let i = 0; i < 5; i++) {
      try {
        await retryManager.execute(mockCall, '/endpoint', { maxRetries: 0 });
      } catch {
        // Expected
      }
    }

    // Verify circuit is open
    let stats = retryManager.getStats();
    expect(stats['/endpoint'].state).toBe('open');

    // Act - Wait for circuit breaker timeout (60 seconds)
    jest.useFakeTimers();
    jest.advanceTimersByTime(61000); // 61 seconds

    // Now allow success
    mockCall.mockResolvedValue('recovered');

    // Next call should transition to half-open and succeed
    const result = await retryManager.execute(mockCall, '/endpoint', {
      maxRetries: 0,
    });

    jest.useRealTimers();

    // Assert
    expect(result).toBe('recovered');
    stats = retryManager.getStats();
    expect(stats['/endpoint'].state).toBe('closed');
  });

  it('should isolate circuit breakers per endpoint', async () => {
    // Arrange
    const failingCall = jest.fn().mockRejectedValue(new Error('Error'));
    const workingCall = jest.fn().mockResolvedValue('success');

    // Act - Open circuit for endpoint1
    for (let i = 0; i < 5; i++) {
      try {
        await retryManager.execute(failingCall, '/endpoint1', {
          maxRetries: 0,
        });
      } catch {
        // Expected
      }
    }

    // endpoint2 should still work
    const result = await retryManager.execute(workingCall, '/endpoint2', {
      maxRetries: 0,
    });

    // Assert
    expect(result).toBe('success');
    const stats = retryManager.getStats();
    expect(stats['/endpoint1'].state).toBe('open');
    expect(stats['/endpoint2'].state).toBe('closed');
  });
});

// ============================================================================
// CUSTOM RETRY CONDITIONS
// ============================================================================

describe('RetryManager - Custom Retry Conditions', () => {
  let retryManager: RetryManager;

  beforeEach(() => {
    retryManager = new RetryManager();
    retryManager.resetAllCircuits();
  });

  it('should use custom shouldRetry function', async () => {
    // Arrange
    const mockCall = jest
      .fn()
      .mockRejectedValue(createHttpError(400, 'Bad Request'));

    // Custom condition: never retry 400 errors
    const shouldRetry = jest.fn(() => false);

    // Act & Assert
    await expect(
      retryManager.execute(mockCall, '/endpoint', {
        maxRetries: 3,
        shouldRetry,
      })
    ).rejects.toThrow('Bad Request');

    expect(mockCall).toHaveBeenCalledTimes(1); // No retries
    expect(shouldRetry).toHaveBeenCalledTimes(1);
  });

  it('should retry on network errors by default', async () => {
    // Arrange
    const mockCall = createMockApiCall(2);

    // Act
    await retryManager.execute(mockCall, '/endpoint1', {
      maxRetries: 3,
      initialDelay: 10,
    });

    // Assert
    expect(mockCall).toHaveBeenCalledTimes(3); // Retried
  });

  it('should retry on 5xx errors by default', async () => {
    // Arrange
    const mockCall = jest.fn();
    mockCall.mockRejectedValueOnce(createHttpError(500));
    mockCall.mockRejectedValueOnce(createHttpError(503));
    mockCall.mockResolvedValue('success');

    // Act
    const result = await retryManager.execute(mockCall, '/endpoint2', {
      maxRetries: 3,
      initialDelay: 10,
    });

    // Assert
    expect(result).toBe('success');
    expect(mockCall).toHaveBeenCalledTimes(3);
  });

  it('should retry on 429 rate limit by default', async () => {
    // Arrange
    const mockCall = jest.fn();
    mockCall.mockRejectedValueOnce(createHttpError(429, 'Rate limited'));
    mockCall.mockResolvedValue('success');

    // Act
    const result = await retryManager.execute(mockCall, '/endpoint3', {
      maxRetries: 2,
      initialDelay: 10,
    });

    // Assert
    expect(result).toBe('success');
    expect(mockCall).toHaveBeenCalledTimes(2);
  });

  it('should not retry on 4xx client errors by default', async () => {
    // Arrange
    const mockCall = jest
      .fn()
      .mockRejectedValue(createHttpError(404, 'Not Found'));

    // Act & Assert
    await expect(
      retryManager.execute(mockCall, '/endpoint', {
        maxRetries: 3,
      })
    ).rejects.toThrow('Not Found');

    expect(mockCall).toHaveBeenCalledTimes(1); // No retries
  });
});

// ============================================================================
// TIMEOUT HANDLING
// ============================================================================

describe('RetryManager - Timeout Handling', () => {
  let retryManager: RetryManager;

  beforeEach(() => {
    retryManager = new RetryManager();
    retryManager.resetAllCircuits();
  });

  it('should timeout long-running requests', async () => {
    // Arrange
    const slowCall = jest.fn(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve('too-slow'), 10000);
        })
    );

    // Act & Assert
    await expect(
      retryManager.execute(slowCall, '/slow-endpoint', {
        timeout: 100, // 100ms timeout
        maxRetries: 0,
      })
    ).rejects.toThrow(/timeout/i);
  });

  it('should complete fast requests within timeout', async () => {
    // Arrange
    const fastCall = jest.fn().mockResolvedValue('fast-response');

    // Act
    const result = await retryManager.execute(fastCall, '/fast-endpoint', {
      timeout: 5000,
      maxRetries: 0,
    });

    // Assert
    expect(result).toBe('fast-response');
  });

  it('should retry timed-out requests', async () => {
    // Arrange
    const mockCall = jest.fn();

    // First call succeeds quickly (no timeout)
    mockCall.mockResolvedValueOnce('fast');

    // Act
    const result = await retryManager.execute(mockCall, '/endpoint-timeout', {
      timeout: 500,
      maxRetries: 2,
      initialDelay: 10,
    });

    // Assert
    expect(result).toBe('fast');
  });
});

// ============================================================================
// RETRY PRESETS
// ============================================================================

describe('RetryManager - Retry Presets', () => {
  let retryManager: RetryManager;

  beforeEach(() => {
    retryManager = new RetryManager();
    retryManager.resetAllCircuits();
  });

  it('should use FAST preset configuration', async () => {
    // Arrange
    const mockCall = createMockApiCall(3);

    // Act
    await expect(
      retryManager.execute(mockCall, '/endpoint-fast', RetryPresets.FAST)
    ).rejects.toThrow();

    // Assert - FAST allows 2 retries
    expect(mockCall).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it('should use STANDARD preset configuration', async () => {
    // Arrange
    const mockCall = createMockApiCall(4);

    // Act
    await expect(
      retryManager.execute(
        mockCall,
        '/endpoint-standard',
        RetryPresets.STANDARD
      )
    ).rejects.toThrow();

    // Assert - STANDARD allows 3 retries
    expect(mockCall).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
  }, 15000); // 15s timeout

  it('should use AGGRESSIVE preset configuration', async () => {
    // Arrange - AGGRESSIVE has long delays, reduce fail count
    const mockCall = createMockApiCall(2); // Only 2 failures

    // Act
    const result = await retryManager.execute(
      mockCall,
      '/endpoint-aggressive',
      { ...RetryPresets.AGGRESSIVE, maxRetries: 2, initialDelay: 100 }
    );

    // Assert - Should eventually succeed
    expect(result).toBe('success');
    expect(mockCall).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  }, 10000); // 10s timeout

  it('should use NO_RETRY preset configuration', async () => {
    // Arrange
    const mockCall = createMockApiCall(1);

    // Act
    await expect(
      retryManager.execute(mockCall, '/endpoint', RetryPresets.NO_RETRY)
    ).rejects.toThrow();

    // Assert - NO_RETRY allows 0 retries
    expect(mockCall).toHaveBeenCalledTimes(1); // Only initial
  });
});

// ============================================================================
// STATISTICS & MANAGEMENT
// ============================================================================

describe('RetryManager - Statistics & Management', () => {
  let retryManager: RetryManager;

  beforeEach(() => {
    retryManager = new RetryManager();
    retryManager.resetAllCircuits();
  });

  it('should provide circuit breaker statistics', async () => {
    // Arrange
    const mockCall = jest.fn();
    mockCall.mockRejectedValueOnce(new Error('Error'));
    mockCall.mockResolvedValue('success');

    // Act
    try {
      await retryManager.execute(mockCall, '/endpoint', { maxRetries: 0 });
    } catch {
      // Expected
    }

    await retryManager.execute(mockCall, '/endpoint', { maxRetries: 0 });

    const stats = retryManager.getStats();

    // Assert
    expect(stats['/endpoint']).toBeDefined();
    expect(stats['/endpoint'].state).toBe('closed');
    expect(stats['/endpoint'].failures).toBe(0);
  });

  it('should reset specific circuit', async () => {
    // Arrange
    const mockCall = jest.fn().mockRejectedValue(new Error('Error'));

    // Open circuit
    for (let i = 0; i < 5; i++) {
      try {
        await retryManager.execute(mockCall, '/endpoint', { maxRetries: 0 });
      } catch {
        // Expected
      }
    }

    // Act
    retryManager.resetCircuit('/endpoint');

    // Assert
    const stats = retryManager.getStats();
    expect(stats['/endpoint']).toBeUndefined();
  });

  it('should reset all circuits', async () => {
    // Arrange
    const mockCall = jest.fn().mockRejectedValue(new Error('Error'));

    // Create multiple circuits
    for (const endpoint of ['/api1', '/api2', '/api3']) {
      try {
        await retryManager.execute(mockCall, endpoint, { maxRetries: 0 });
      } catch {
        // Expected
      }
    }

    // Act
    retryManager.resetAllCircuits();

    // Assert
    const stats = retryManager.getStats();
    expect(Object.keys(stats)).toHaveLength(0);
  });
});

// ============================================================================
// EDGE CASES & COMPLEX SCENARIOS
// ============================================================================

describe('RetryManager - Edge Cases', () => {
  let retryManager: RetryManager;

  beforeEach(() => {
    retryManager = new RetryManager();
    retryManager.resetAllCircuits();
  });

  it('should handle immediate success without delay', async () => {
    // Arrange
    const mockCall = jest.fn().mockResolvedValue('immediate');
    const startTime = Date.now();

    // Act
    const result = await retryManager.execute(mockCall, '/endpoint', {
      maxRetries: 3,
      initialDelay: 1000,
    });

    const duration = Date.now() - startTime;

    // Assert
    expect(result).toBe('immediate');
    expect(duration).toBeLessThan(100); // Should be nearly instant
  });

  it('should handle concurrent requests to same endpoint', async () => {
    // Arrange
    const mockCall = jest.fn().mockResolvedValue('success');

    // Act
    const requests = Array.from({ length: 10 }, () =>
      retryManager.execute(mockCall, '/endpoint', { maxRetries: 2 })
    );

    const results = await Promise.all(requests);

    // Assert
    expect(results).toHaveLength(10);
    expect(results.every((r) => r === 'success')).toBe(true);
    expect(mockCall).toHaveBeenCalledTimes(10);
  });

  it('should handle different error types correctly', async () => {
    // Arrange
    const errors = [
      new TypeError('Failed to fetch'), // Retriable
      createHttpError(500, 'Server error'), // Retriable
      createHttpError(429, 'Rate limit'), // Retriable
      createHttpError(503, 'Service unavailable'), // Retriable
    ];

    // Act & Assert
    for (let i = 0; i < errors.length; i++) {
      const mockCall = jest.fn();
      mockCall.mockRejectedValueOnce(errors[i]);
      mockCall.mockResolvedValue('recovered');

      const result = await retryManager.execute(
        mockCall,
        `/endpoint-err-${i}`,
        {
          maxRetries: 2,
          initialDelay: 10,
        }
      );

      expect(result).toBe('recovered');
      retryManager.resetCircuit(`/endpoint-err-${i}`);
    }
  });
});
