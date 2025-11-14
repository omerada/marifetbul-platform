import { describe, test, expect, beforeEach } from '@jest/globals';

describe('useCommissions hook module', () => {
  beforeEach(() => {
    // Reset module registry so setup mocks from jest.setup.js apply before require
    jest.resetModules();
  });

  test('exports useCommissions function', () => {
    // Provide lightweight mocks for internal modules that execute side-effects on import
    const mockLogger = {
      default: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      },
      apiLogger: {
        debug: jest.fn(),
        info: jest.fn(),
      },
    };
    jest.doMock('@/lib/infrastructure/monitoring/logger', () => mockLogger);
    jest.doMock('@/lib/infrastructure/monitoring/sentry', () => ({
      setSentryUser: () => {},
      clearSentryUser: () => {},
      captureSentryError: () => {},
    }));

    // Require inside the test after mocks are in place
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const hookModule = require('@/hooks/business/useCommissions');
    expect(typeof hookModule.useCommissions).toBe('function');
  });
});
