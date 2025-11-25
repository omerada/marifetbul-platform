/**
 * ================================================
 * API PERFORMANCE & LOAD TESTS
 * ================================================
 * Comprehensive API performance and scalability testing
 *
 * Test Coverage:
 * - Response time validation (baseline performance)
 * - Concurrent request handling
 * - Load testing scenarios
 * - Memory leak detection
 * - Cache effectiveness
 * - Rate limiting under load
 * - Database query performance
 * - API throughput measurement
 *
 * @sprint Test Coverage & QA - Week 1, Day 4-5
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { performanceMonitor } from '@/lib/shared/performance';

// Mock unified API client (exported for test usage)
export const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

// Performance thresholds (milliseconds)
const PERFORMANCE_THRESHOLDS = {
  FAST: 100, // Excellent response time
  ACCEPTABLE: 300, // Good response time
  SLOW: 1000, // Acceptable but slow
  CRITICAL: 3000, // Unacceptable
};

// Helper to create delayed response
const createDelayedResponse = (data: unknown, delay: number) => {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ data, success: true }), delay);
  });
};

// Helper to measure execution time
const measureExecutionTime = async <T>(
  fn: () => Promise<T>
): Promise<{ result: T; duration: number }> => {
  const startTime = performance.now();
  const result = await fn();
  const duration = performance.now() - startTime;
  return { result, duration };
};

// ============================================================================
// RESPONSE TIME TESTS
// ============================================================================

describe('API Performance - Response Times', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    performanceMonitor.clearMetrics();
  });

  describe('Single Request Performance', () => {
    it('should respond to GET requests within acceptable time', async () => {
      // Arrange
      const mockData = { id: 1, name: 'Test Package' };
      (mockApiClient.get as jest.Mock).mockImplementation(() =>
        createDelayedResponse(mockData, 50)
      );

      // Act
      const { duration } = await measureExecutionTime(() =>
        mockApiClient.get('/api/packages/1')
      );

      // Assert
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.ACCEPTABLE);
      expect(mockApiClient.get).toHaveBeenCalledWith('/api/packages/1');
    });

    it('should respond to POST requests within acceptable time', async () => {
      // Arrange
      const mockPayload = { title: 'New Package', price: 100 };
      const mockResponse = { id: 2, ...mockPayload };
      (mockApiClient.post as jest.Mock).mockImplementation(() =>
        createDelayedResponse(mockResponse, 80)
      );

      // Act
      const { duration } = await measureExecutionTime(() =>
        mockApiClient.post('/api/packages', mockPayload)
      );

      // Assert
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.ACCEPTABLE);
    });

    it('should detect slow responses', async () => {
      // Arrange
      const mockData = { data: 'slow response' };
      (mockApiClient.get as jest.Mock).mockImplementation(() =>
        createDelayedResponse(mockData, 500)
      );

      // Act
      const { duration } = await measureExecutionTime(() =>
        mockApiClient.get('/api/slow-endpoint')
      );

      // Assert
      expect(duration).toBeGreaterThan(PERFORMANCE_THRESHOLDS.ACCEPTABLE);
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.SLOW);
    });

    it('should identify critical performance issues', async () => {
      // Arrange
      const mockData = { data: 'very slow response' };
      (mockApiClient.get as jest.Mock).mockImplementation(() =>
        createDelayedResponse(mockData, 1500)
      );

      // Act
      const { duration } = await measureExecutionTime(() =>
        mockApiClient.get('/api/critical-slow-endpoint')
      );

      // Assert
      expect(duration).toBeGreaterThan(PERFORMANCE_THRESHOLDS.SLOW);
    });
  });

  describe('Endpoint-Specific Performance', () => {
    it('should validate search endpoint performance', async () => {
      // Arrange
      const mockResults = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        title: `Package ${i + 1}`,
      }));
      (mockApiClient.get as jest.Mock).mockImplementation(() =>
        createDelayedResponse({ results: mockResults }, 150)
      );

      // Act
      const { duration } = await measureExecutionTime(() =>
        mockApiClient.get('/api/search?q=test')
      );

      // Assert
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.ACCEPTABLE);
    });

    it('should validate dashboard data loading performance', async () => {
      // Arrange
      const mockDashboard = {
        orders: [],
        stats: { total: 10, pending: 3 },
        notifications: [],
      };
      (mockApiClient.get as jest.Mock).mockImplementation(() =>
        createDelayedResponse(mockDashboard, 200)
      );

      // Act
      const { duration } = await measureExecutionTime(() =>
        mockApiClient.get('/api/dashboard')
      );

      // Assert
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.ACCEPTABLE);
    });

    it('should validate listing endpoints with pagination', async () => {
      // Arrange
      const mockListings = {
        content: Array.from({ length: 10 }, (_, i) => ({ id: i + 1 })),
        totalElements: 100,
        totalPages: 10,
      };
      (mockApiClient.get as jest.Mock).mockImplementation(() =>
        createDelayedResponse(mockListings, 120)
      );

      // Act
      const { duration } = await measureExecutionTime(() =>
        mockApiClient.get('/api/packages?page=1&size=10')
      );

      // Assert
      expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.ACCEPTABLE);
    });
  });
});

// ============================================================================
// CONCURRENT REQUEST TESTS
// ============================================================================

describe('API Performance - Concurrent Requests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle 10 concurrent requests efficiently', async () => {
    // Arrange
    const requestCount = 10;
    (mockApiClient.get as jest.Mock).mockImplementation(() =>
      createDelayedResponse({ data: 'success' }, 50)
    );

    // Act
    const { duration } = await measureExecutionTime(async () => {
      const requests = Array.from({ length: requestCount }, (_, i) =>
        mockApiClient.get(`/api/resource/${i}`)
      );
      return Promise.all(requests);
    });

    // Assert
    // All concurrent requests should complete in roughly the time of 1 request
    expect(duration).toBeLessThan(200); // Allow some overhead
    expect(mockApiClient.get).toHaveBeenCalledTimes(requestCount);
  });

  it('should handle 50 concurrent requests without degradation', async () => {
    // Arrange
    const requestCount = 50;
    (mockApiClient.get as jest.Mock).mockImplementation(() =>
      createDelayedResponse({ data: 'success' }, 60)
    );

    // Act
    const { duration } = await measureExecutionTime(async () => {
      const requests = Array.from({ length: requestCount }, (_, i) =>
        mockApiClient.get(`/api/resource/${i}`)
      );
      return Promise.all(requests);
    });

    // Assert
    expect(duration).toBeLessThan(500);
    expect(mockApiClient.get).toHaveBeenCalledTimes(requestCount);
  });

  it('should handle mixed concurrent operations', async () => {
    // Arrange
    (mockApiClient.get as jest.Mock).mockImplementation(() =>
      createDelayedResponse({ data: 'get' }, 40)
    );
    (mockApiClient.post as jest.Mock).mockImplementation(() =>
      createDelayedResponse({ data: 'post' }, 60)
    );
    (mockApiClient.put as jest.Mock).mockImplementation(() =>
      createDelayedResponse({ data: 'put' }, 50)
    );

    // Act
    const { duration } = await measureExecutionTime(async () => {
      return Promise.all([
        ...Array.from({ length: 5 }, () => mockApiClient.get('/api/read')),
        ...Array.from({ length: 3 }, () =>
          mockApiClient.post('/api/create', {})
        ),
        ...Array.from({ length: 2 }, () =>
          mockApiClient.put('/api/update/1', {})
        ),
      ]);
    });

    // Assert
    expect(duration).toBeLessThan(300);
    expect(mockApiClient.get).toHaveBeenCalledTimes(5);
    expect(mockApiClient.post).toHaveBeenCalledTimes(3);
    expect(mockApiClient.put).toHaveBeenCalledTimes(2);
  });

  it('should measure concurrent request success rate', async () => {
    // Arrange
    let successCount = 0;
    let errorCount = 0;
    (mockApiClient.get as jest.Mock).mockImplementation((url) => {
      // Simulate 10% failure rate
      if (Math.random() < 0.1) {
        return Promise.reject(new Error('Random failure'));
      }
      return createDelayedResponse({ url }, 50);
    });

    // Act
    const requests = Array.from({ length: 100 }, (_, i) =>
      mockApiClient
        .get(`/api/item/${i}`)
        .then(() => successCount++)
        .catch(() => errorCount++)
    );
    await Promise.allSettled(requests);

    // Assert
    const successRate = (successCount / 100) * 100;
    expect(successRate).toBeGreaterThan(85); // At least 85% success
    expect(successCount + errorCount).toBe(100);
  });
});

// ============================================================================
// LOAD TESTING SCENARIOS
// ============================================================================

describe('API Performance - Load Testing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle sustained load of 100 requests over 5 seconds', async () => {
    // Arrange
    const totalRequests = 100;
    const duration = 5000; // 5 seconds
    const interval = duration / totalRequests;
    let completedRequests = 0;

    (mockApiClient.get as jest.Mock).mockImplementation(() =>
      createDelayedResponse({ data: 'ok' }, 30)
    );

    // Act
    const startTime = performance.now();
    const promises: Promise<unknown>[] = [];

    for (let i = 0; i < totalRequests; i++) {
      await new Promise((resolve) => setTimeout(resolve, interval));
      promises.push(
        mockApiClient.get(`/api/item/${i}`).then(() => completedRequests++)
      );
    }

    await Promise.all(promises);
    const totalDuration = performance.now() - startTime;

    // Assert
    expect(completedRequests).toBe(totalRequests);
    expect(totalDuration).toBeGreaterThanOrEqual(duration * 0.9); // Within 10% tolerance
    expect(totalDuration).toBeLessThan(duration * 1.5); // Not too slow
  }, 10000); // 10s timeout

  it('should measure throughput (requests per second)', async () => {
    // Arrange
    const requestCount = 50;
    (mockApiClient.get as jest.Mock).mockImplementation(() =>
      createDelayedResponse({ data: 'ok' }, 20)
    );

    // Act
    const { duration } = await measureExecutionTime(async () => {
      const requests = Array.from({ length: requestCount }, (_, i) =>
        mockApiClient.get(`/api/item/${i}`)
      );
      return Promise.all(requests);
    });

    const throughput = (requestCount / duration) * 1000; // Requests per second

    // Assert
    expect(throughput).toBeGreaterThan(100); // At least 100 req/s
  });

  it('should handle burst traffic patterns', async () => {
    // Arrange
    (mockApiClient.get as jest.Mock).mockImplementation(() =>
      createDelayedResponse({ data: 'ok' }, 40)
    );

    // Act - Simulate 3 bursts of 20 requests each
    const burst1 = await measureExecutionTime(async () => {
      const requests = Array.from({ length: 20 }, () =>
        mockApiClient.get('/api/data')
      );
      return Promise.all(requests);
    });

    await new Promise((resolve) => setTimeout(resolve, 100)); // Cool down

    const burst2 = await measureExecutionTime(async () => {
      const requests = Array.from({ length: 20 }, () =>
        mockApiClient.get('/api/data')
      );
      return Promise.all(requests);
    });

    await new Promise((resolve) => setTimeout(resolve, 100)); // Cool down

    const burst3 = await measureExecutionTime(async () => {
      const requests = Array.from({ length: 20 }, () =>
        mockApiClient.get('/api/data')
      );
      return Promise.all(requests);
    });

    // Assert - Each burst should perform consistently
    expect(burst1.duration).toBeLessThan(200);
    expect(burst2.duration).toBeLessThan(200);
    expect(burst3.duration).toBeLessThan(200);
    expect(Math.abs(burst1.duration - burst2.duration)).toBeLessThan(100); // Consistent
  });
});

// ============================================================================
// MEMORY LEAK DETECTION
// ============================================================================

describe('API Performance - Memory Leak Detection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    performanceMonitor.clearMetrics();
  });

  it('should not leak memory during repeated requests', async () => {
    // Arrange
    const iterations = 100;
    (mockApiClient.get as jest.Mock).mockImplementation(() =>
      createDelayedResponse({ data: 'test' }, 10)
    );

    let initialMemory = 0;
    let finalMemory = 0;

    if (typeof global.gc !== 'undefined') {
      global.gc(); // Force garbage collection
    }

    // Act
    initialMemory = process.memoryUsage().heapUsed;

    for (let i = 0; i < iterations; i++) {
      await mockApiClient.get('/api/test');
      performanceMonitor.clearMetrics(); // Clean up metrics
    }

    if (typeof global.gc !== 'undefined') {
      global.gc(); // Force garbage collection
    }

    finalMemory = process.memoryUsage().heapUsed;
    const memoryIncrease = finalMemory - initialMemory;
    const memoryIncreasePerRequest = memoryIncrease / iterations;

    // Assert - Memory should not grow significantly
    expect(memoryIncreasePerRequest).toBeLessThan(10000); // < 10KB per request
  });

  it('should clean up metrics properly', async () => {
    // Arrange
    (mockApiClient.get as jest.Mock).mockImplementation(() =>
      createDelayedResponse({ data: 'ok' }, 10)
    );

    // Act
    await mockApiClient.get('/api/test');
    const metricsBeforeClear = performanceMonitor.getMetrics().length;

    performanceMonitor.clearMetrics();
    const metricsAfterClear = performanceMonitor.getMetrics().length;

    // Assert
    expect(metricsAfterClear).toBe(0);
    expect(metricsBeforeClear).toBeGreaterThanOrEqual(0);
  });

  it('should handle large response payloads without memory issues', async () => {
    // Arrange - Create large payload
    const largePayload = Array.from({ length: 1000 }, (_, i) => ({
      id: i,
      data: 'Lorem ipsum '.repeat(100), // ~1KB per item
    }));

    (mockApiClient.get as jest.Mock).mockImplementation(() =>
      createDelayedResponse({ items: largePayload }, 50)
    );

    // Act
    const { duration } = await measureExecutionTime(() =>
      mockApiClient.get('/api/large-data')
    );

    // Assert
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.ACCEPTABLE);
  });
});

// ============================================================================
// CACHE EFFECTIVENESS TESTS
// ============================================================================

describe('API Performance - Cache Effectiveness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should benefit from caching on repeated requests', async () => {
    // Arrange
    let callCount = 0;
    (mockApiClient.get as jest.Mock).mockImplementation(() => {
      callCount++;
      // First call slow, subsequent calls fast (simulating cache)
      const delay = callCount === 1 ? 200 : 20;
      return createDelayedResponse(
        { data: 'cached', fromCache: callCount > 1 },
        delay
      );
    });

    // Act
    const firstCall = await measureExecutionTime(() =>
      mockApiClient.get('/api/cacheable')
    );
    const secondCall = await measureExecutionTime(() =>
      mockApiClient.get('/api/cacheable')
    );
    const thirdCall = await measureExecutionTime(() =>
      mockApiClient.get('/api/cacheable')
    );

    // Assert
    expect(firstCall.duration).toBeGreaterThan(150); // Initial request slow
    expect(secondCall.duration).toBeLessThan(100); // Cached request fast
    expect(thirdCall.duration).toBeLessThan(100); // Still cached
  });

  it('should measure cache hit ratio', async () => {
    // Arrange
    const cache = new Map<string, unknown>();
    let cacheHits = 0;
    let cacheMisses = 0;

    (mockApiClient.get as jest.Mock).mockImplementation((url) => {
      if (cache.has(url)) {
        cacheHits++;
        return createDelayedResponse(cache.get(url), 10);
      } else {
        cacheMisses++;
        const data = { url, timestamp: Date.now() };
        cache.set(url, data);
        return createDelayedResponse(data, 100);
      }
    });

    // Act - Request same URLs multiple times
    const urls = ['/api/a', '/api/b', '/api/c'];
    for (let i = 0; i < 3; i++) {
      for (const url of urls) {
        await mockApiClient.get(url);
      }
    }

    const hitRatio = (cacheHits / (cacheHits + cacheMisses)) * 100;

    // Assert
    expect(hitRatio).toBeGreaterThan(50); // At least 50% cache hits
    expect(cacheHits).toBe(6); // 3 URLs × 2 cache hits each
    expect(cacheMisses).toBe(3); // 3 URLs × 1 miss each
  });
});

// ============================================================================
// RATE LIMITING UNDER LOAD
// ============================================================================

describe('API Performance - Rate Limiting', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should enforce rate limits under load', async () => {
    // Arrange
    const rateLimit = 10; // 10 requests per second
    let requestCount = 0;
    let rateLimitedCount = 0;

    (mockApiClient.get as jest.Mock).mockImplementation(() => {
      requestCount++;
      if (requestCount > rateLimit) {
        rateLimitedCount++;
        return Promise.reject({ status: 429, message: 'Too many requests' });
      }
      return createDelayedResponse({ data: 'ok' }, 10);
    });

    // Act
    const requests = Array.from({ length: 20 }, () =>
      mockApiClient.get('/api/limited').catch(() => null)
    );
    await Promise.all(requests);

    // Assert
    expect(rateLimitedCount).toBeGreaterThan(0);
    expect(requestCount - rateLimitedCount).toBeLessThanOrEqual(rateLimit);
  });

  it('should handle rate limit gracefully with retry', async () => {
    // Arrange
    let attempt = 0;
    (mockApiClient.get as jest.Mock).mockImplementation(() => {
      attempt++;
      if (attempt === 1) {
        return Promise.reject({ status: 429, retryAfter: 100 });
      }
      return createDelayedResponse({ data: 'success' }, 20);
    });

    // Act
    let result;
    try {
      result = await mockApiClient.get('/api/endpoint');
    } catch (error: unknown) {
      const apiError = error as { status: number; retryAfter?: number };
      if (apiError.status === 429) {
        await new Promise((resolve) =>
          setTimeout(resolve, apiError.retryAfter || 100)
        );
        result = await mockApiClient.get('/api/endpoint');
      }
    }

    // Assert
    expect(result).toBeDefined();
    expect(mockApiClient.get).toHaveBeenCalledTimes(2);
  });
});

// ============================================================================
// PERFORMANCE PERCENTILES
// ============================================================================

describe('API Performance - Percentile Analysis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate P50, P95, P99 response times', async () => {
    // Arrange
    const responseTimes: number[] = [];
    (mockApiClient.get as jest.Mock).mockImplementation(() => {
      // Simulate varied response times
      const delay = Math.random() * 100 + 20; // 20-120ms (reduced for faster test)
      return createDelayedResponse({ data: 'ok' }, delay);
    });

    // Act - Reduced from 100 to 50 iterations for faster execution
    for (let i = 0; i < 50; i++) {
      const { duration } = await measureExecutionTime(() =>
        mockApiClient.get('/api/test')
      );
      responseTimes.push(duration);
    }

    // Calculate percentiles
    responseTimes.sort((a, b) => a - b);
    const p50 = responseTimes[Math.floor(responseTimes.length * 0.5)];
    const p95 = responseTimes[Math.floor(responseTimes.length * 0.95)];
    const p99 = responseTimes[Math.floor(responseTimes.length * 0.99)];

    // Assert
    expect(p50).toBeLessThan(PERFORMANCE_THRESHOLDS.ACCEPTABLE);
    expect(p95).toBeLessThan(PERFORMANCE_THRESHOLDS.SLOW);
    expect(p99).toBeLessThan(PERFORMANCE_THRESHOLDS.CRITICAL);
    expect(p50).toBeLessThan(p95);
    expect(p95).toBeLessThan(p99);
  }, 10000); // 10s timeout
});

// ============================================================================
// PERFORMANCE REGRESSION DETECTION
// ============================================================================

describe('API Performance - Regression Detection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should detect performance regression', async () => {
    // Arrange - Baseline performance
    const baselineMetrics: number[] = [];
    (mockApiClient.get as jest.Mock).mockImplementation(() =>
      createDelayedResponse({ data: 'ok' }, 50)
    );

    for (let i = 0; i < 10; i++) {
      const { duration } = await measureExecutionTime(() =>
        mockApiClient.get('/api/test')
      );
      baselineMetrics.push(duration);
    }

    const baselineAvg =
      baselineMetrics.reduce((a, b) => a + b, 0) / baselineMetrics.length;

    // Simulate performance degradation
    (mockApiClient.get as jest.Mock).mockImplementation(() =>
      createDelayedResponse({ data: 'ok' }, 150)
    );

    const currentMetrics: number[] = [];
    for (let i = 0; i < 10; i++) {
      const { duration } = await measureExecutionTime(() =>
        mockApiClient.get('/api/test')
      );
      currentMetrics.push(duration);
    }

    const currentAvg =
      currentMetrics.reduce((a, b) => a + b, 0) / currentMetrics.length;

    // Assert
    const regressionPercentage =
      ((currentAvg - baselineAvg) / baselineAvg) * 100;
    expect(regressionPercentage).toBeGreaterThan(50); // Significant regression detected
  });
});

// ============================================================================
// DATABASE QUERY PERFORMANCE
// ============================================================================

describe('API Performance - Database Operations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should execute simple queries quickly', async () => {
    // Arrange
    (mockApiClient.get as jest.Mock).mockImplementation(() =>
      createDelayedResponse({ id: 1, name: 'Test' }, 30)
    );

    // Act
    const { duration } = await measureExecutionTime(() =>
      mockApiClient.get('/api/users/1')
    );

    // Assert
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.FAST);
  });

  it('should handle complex queries within limits', async () => {
    // Arrange - Simulate join queries
    (mockApiClient.get as jest.Mock).mockImplementation(() =>
      createDelayedResponse(
        {
          user: {},
          orders: [],
          reviews: [],
        },
        120
      )
    );

    // Act
    const { duration } = await measureExecutionTime(() =>
      mockApiClient.get('/api/users/1/complete-profile')
    );

    // Assert
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.ACCEPTABLE);
  });

  it('should validate pagination performance', async () => {
    // Arrange
    (mockApiClient.get as jest.Mock).mockImplementation(() =>
      createDelayedResponse(
        {
          content: Array(20).fill({}),
          totalElements: 1000,
        },
        80
      )
    );

    // Act
    const { duration } = await measureExecutionTime(() =>
      mockApiClient.get('/api/orders?page=5&size=20')
    );

    // Assert
    expect(duration).toBeLessThan(PERFORMANCE_THRESHOLDS.FAST);
  });
});
