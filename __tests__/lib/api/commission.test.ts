// Tests use isolated module loading so we can mock dependencies before require
describe('commission API client', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('getCommissions returns paginated response', async () => {
    // Mock dependencies before requiring the module
    const mockApiClient = {
      apiClient: {
        get: jest.fn(),
        post: jest.fn(),
      },
    };

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
        warn: jest.fn(),
        error: jest.fn(),
      },
    };

    jest.doMock('@/lib/infrastructure/api/client', () => mockApiClient);
    jest.doMock('@/lib/infrastructure/monitoring/logger', () => mockLogger);
    // Prevent internal sentry module from executing logging side-effects during tests
    jest.doMock('@/lib/infrastructure/monitoring/sentry', () => ({
      setSentryUser: () => {},
      clearSentryUser: () => {},
      setSentryContext: () => {},
      setSentryTag: () => {},
      addSentryBreadcrumb: () => {},
      captureSentryError: () => {},
      captureSentryMessage: () => {},
      withSentrySpan: (name: string, op: string, cb: any) => cb(),
      withSentrySpanAsync: async (_name: string, _op: string, cb: any) => cb(),
    }));

    // Require module after mocks
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { apiClient } = require('@/lib/infrastructure/api/client');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const commission = require('@/lib/api/commission');

    const mockPage = {
      content: [
        {
          id: '11111111-1111-1111-1111-111111111111',
          paymentId: '22222222-2222-2222-2222-222222222222',
          orderId: '33333333-3333-3333-3333-333333333333',
          sellerId: '44444444-4444-4444-4444-444444444444',
          orderAmount: 100,
          commissionRate: 0.05,
          commissionAmount: 5,
          sellerAmount: 95,
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      page: 0,
      size: 20,
      totalElements: 1,
      totalPages: 1,
    };

    apiClient.get.mockResolvedValue({ data: mockPage });

    const res = await commission.getCommissions(0, 20);

    expect(apiClient.get).toHaveBeenCalled();
    expect(res).toEqual(mockPage);
  });

  test('createCommissionRule posts to API and returns created rule', async () => {
    const mockApiClient = {
      apiClient: {
        get: jest.fn(),
        post: jest.fn(),
      },
    };

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
        warn: jest.fn(),
        error: jest.fn(),
      },
    };

    jest.doMock('@/lib/infrastructure/api/client', () => mockApiClient);
    jest.doMock('@/lib/infrastructure/monitoring/logger', () => mockLogger);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { apiClient } = require('@/lib/infrastructure/api/client');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const commission = require('@/lib/api/commission');

    const req = {
      ruleType: 'GLOBAL',
      rate: 0.05,
      validFrom: new Date().toISOString(),
      isActive: true,
    };

    const created = {
      id: '55555555-5555-5555-5555-555555555555',
      ...req,
      createdBy: '66666666-6666-6666-6666-666666666666',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    apiClient.post.mockResolvedValue({ data: created });

    const res = await commission.createCommissionRule(req);

    expect(apiClient.post).toHaveBeenCalledWith(
      '/admin/commissions/rules',
      req
    );
    expect(res).toEqual(created);
  });
});
