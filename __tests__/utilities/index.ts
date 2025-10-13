/**
 * Testing Infrastructure - Production Ready Testing Utilities
 *
 * Bu modül production-ready test altyapısı sağlar:
 * - Test factories and fixtures
 * - Mock utilities
 * - Test helpers
 */

// Test Factory Types
export interface TestFactory<T> {
  create(overrides?: Partial<T>): T;
  build(overrides?: Partial<T>): T;
  createMany(count: number, overrides?: Partial<T>): T[];
}

// Mock API Response Factory
export class MockApiResponseFactory {
  static success<T>(data: T, meta?: Record<string, unknown>) {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  }

  static error(message: string, code = 'UNKNOWN_ERROR', status = 500) {
    return {
      success: false,
      error: {
        message,
        code,
        status,
        timestamp: new Date().toISOString(),
      },
    };
  }

  static pagination<T>(items: T[], page = 1, limit = 10) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = items.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginatedItems,
      meta: {
        pagination: {
          page,
          limit,
          total: items.length,
          totalPages: Math.ceil(items.length / limit),
          hasNext: endIndex < items.length,
          hasPrev: page > 1,
        },
      },
    };
  }
}

// User Factory
export class UserFactory {
  private static counter = 1;

  static create(overrides: any = {}) {
    const id = UserFactory.counter++;
    return {
      id: `user-${id}`,
      email: `user${id}@test.com`,
      username: `user${id}`,
      firstName: `User`,
      lastName: `${id}`,
      avatar: `https://example.com/avatar${id}.jpg`,
      role: 'freelancer',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isVerified: true,
      isActive: true,
      ...overrides,
    };
  }

  static build = UserFactory.create;

  static createMany(count: number, overrides: any = {}) {
    return Array.from({ length: count }, () => UserFactory.create(overrides));
  }

  static admin(overrides: any = {}) {
    return UserFactory.create({
      role: 'admin',
      permissions: ['*'],
      ...overrides,
    });
  }

  static employer(overrides: any = {}) {
    return UserFactory.create({
      role: 'employer',
      ...overrides,
    });
  }

  static freelancer(overrides: any = {}) {
    return UserFactory.create({
      role: 'freelancer',
      ...overrides,
    });
  }
}

// Message Factory
export class MessageFactory {
  private static counter = 1;

  static create(overrides: any = {}) {
    const id = MessageFactory.counter++;
    return {
      id: `message-${id}`,
      content: `Test message ${id}`,
      senderId: `user-${id}`,
      conversationId: `conversation-1`,
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'sent',
      attachments: [],
      ...overrides,
    };
  }

  static build = MessageFactory.create;

  static createMany(count: number, overrides: any = {}) {
    return Array.from({ length: count }, () =>
      MessageFactory.create(overrides)
    );
  }

  static withAttachment(overrides: any = {}) {
    return MessageFactory.create({
      type: 'file',
      attachments: [
        {
          id: 'attachment-1',
          name: 'test-file.pdf',
          url: 'https://example.com/test-file.pdf',
          size: 1024,
          type: 'application/pdf',
        },
      ],
      ...overrides,
    });
  }
}

// Conversation Factory
export class ConversationFactory {
  private static counter = 1;

  static create(overrides: any = {}) {
    const id = ConversationFactory.counter++;
    return {
      id: `conversation-${id}`,
      title: `Test Conversation ${id}`,
      participantIds: [`user-1`, `user-2`],
      lastMessage: MessageFactory.create(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      type: 'direct',
      ...overrides,
    };
  }

  static build = ConversationFactory.create;

  static createMany(count: number, overrides: any = {}) {
    return Array.from({ length: count }, () =>
      ConversationFactory.create(overrides)
    );
  }

  static group(overrides: any = {}) {
    return ConversationFactory.create({
      type: 'group',
      participantIds: [`user-1`, `user-2`, `user-3`],
      title: 'Test Group Chat',
      ...overrides,
    });
  }
}

// Test Utilities
export class TestUtils {
  // Wait for a specific condition
  static async waitFor(
    condition: () => boolean | Promise<boolean>,
    timeout = 5000,
    interval = 100
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new Error(`Condition not met within ${timeout}ms`);
  }

  // Mock localStorage
  static mockLocalStorage() {
    const storage: Record<string, string> = {};

    return {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, value: string) => {
        storage[key] = value;
      },
      removeItem: (key: string) => {
        delete storage[key];
      },
      clear: () => {
        Object.keys(storage).forEach((key) => delete storage[key]);
      },
      length: Object.keys(storage).length,
      key: (index: number) => Object.keys(storage)[index] || null,
    };
  }

  // Mock fetch
  static mockFetch(responses: Record<string, unknown>) {
    return (url: string) => {
      const response = responses[url];
      if (!response) {
        return Promise.reject(new Error(`No mock response for ${url}`));
      }

      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(response),
      });
    };
  }

  // Generate random data
  static randomString(length = 10) {
    return Math.random()
      .toString(36)
      .substring(2, length + 2);
  }

  static randomEmail() {
    return `${TestUtils.randomString()}@test.com`;
  }

  static randomDate(start = new Date(2020, 0, 1), end = new Date()) {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
  }
}

// Performance Testing Utilities
export class PerformanceTestUtils {
  static async measureRenderTime<T>(
    renderFn: () => T,
    iterations = 10
  ): Promise<{ average: number; min: number; max: number; results: T }> {
    const times: number[] = [];
    let result: T;

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      result = renderFn();
      const end = performance.now();
      times.push(end - start);
    }

    return {
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
      results: result!,
    };
  }

  static createPerformanceObserver(
    entryTypes: string[] = ['measure', 'navigation']
  ) {
    const entries: PerformanceEntry[] = [];

    const observer = new PerformanceObserver((list) => {
      entries.push(...list.getEntries());
    });

    observer.observe({ entryTypes });

    return {
      observer,
      getEntries: () => entries,
      disconnect: () => observer.disconnect(),
    };
  }
}

// Export factories
export {
  UserFactory as User,
  MessageFactory as Message,
  ConversationFactory as Conversation,
  MockApiResponseFactory as MockApiResponse,
};

// Export all utilities
