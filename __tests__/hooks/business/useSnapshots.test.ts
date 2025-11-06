/**
 * ================================================
 * SNAPSHOT HOOKS TESTS
 * ================================================
 * Tests for snapshot custom hooks
 *
 * Coverage:
 * - usePlatformSnapshot: Admin snapshot with auto-refresh
 * - useSellerSnapshot: Freelancer snapshot with auto-refresh
 * - useBuyerSnapshot: Employer snapshot with auto-refresh
 * - useDashboardSnapshot: Unified role-based snapshot
 *
 * @sprint Sprint 1 - Story 4: Testing & Documentation
 * @version 1.0.0
 * @date November 6, 2025
 * @author MarifetBul Development Team
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import {
  usePlatformSnapshot,
  useSellerSnapshot,
  useBuyerSnapshot,
  useDashboardSnapshot,
} from '../../../hooks/business/dashboard/useSnapshots';
import {
  PlatformSnapshot,
  SellerSnapshot,
  BuyerSnapshot,
  SystemStatus,
} from '../../../types/backend/dashboard';

// ================================================
// MOCKS
// ================================================

const mockPlatformSnapshot: PlatformSnapshot = {
  systemStatus: SystemStatus.HEALTHY,
  totalUsers: 1000,
  activeUsersToday: 500,
  newUsersThisWeek: 50,
  totalOrders: 200,
  activeOrders: 30,
  completedOrdersToday: 10,
  pendingOrders: 5,
  totalRevenue: 150000,
  revenueToday: 5000,
  revenueThisMonth: 45000,
  platformFees: 15000,
  totalPackages: 500,
  activePackages: 300,
  newPackagesToday: 10,
  activeDisputes: 3,
  pendingRefunds: 2,
  averageRating: 4.5,
  completionRate: 0.92,
  pendingSupportTickets: 5,
  moderationQueueSize: 8,
};

const mockSellerSnapshot: SellerSnapshot = {
  sellerId: 'seller-123',
  sellerName: 'Jane Smith',
  totalEarnings: 50000,
  availableBalance: 12000,
  pendingBalance: 3000,
  earningsThisMonth: 5000,
  earningsGrowthRate: 15.5,
  completedOrders: 50,
  activeOrders: 5,
  ordersRequiringAction: 2,
  completionRate: 0.95,
  onTimeDeliveryRate: 0.88,
  activePackages: 10,
  totalViews: 5000,
  viewsThisWeek: 250,
  conversionRate: 0.05,
  averageRating: 4.7,
  totalReviews: 45,
  pendingReviews: 3,
  totalCustomers: 35,
  repeatCustomerRate: 0.4,
  unreadMessages: 5,
  averageResponseTime: 2.5,
  responseRate: 0.95,
  pendingActions: {
    ordersToAccept: 1,
    ordersToDeliver: 3,
    messagesToRespond: 5,
    reviewsToGive: 2,
  },
  topPackage: {
    packageId: 'pkg-1',
    packageTitle: 'Logo Design',
    totalSales: 25,
    totalRevenue: 12500,
    averageRating: 4.8,
  },
};

const mockBuyerSnapshot: BuyerSnapshot = {
  buyerId: 'buyer-456',
  buyerName: 'John Doe',
  totalSpent: 30000,
  spentThisMonth: 3000,
  walletBalance: 5000,
  totalSavings: 1500,
  totalOrders: 30,
  activeOrders: 3,
  completedOrders: 25,
  ordersAwaitingApproval: 1,
  ordersRequiringAction: 2,
  favoritePackages: 15,
  jobsPosted: 0,
  activeJobs: 0,
  proposalsReceived: 0,
  reviewsGiven: 20,
  pendingReviews: 3,
  averageRatingGiven: 4.5,
  unreadMessages: 3,
  activeConversations: 5,
  recommendedPackagesCount: 10,
  personalizationScore: 0.85,
  pendingActions: {
    ordersToApprove: 1,
    ordersToReview: 3,
    messagesToRespond: 2,
    proposalsToReview: 0,
  },
  recentOrder: {
    orderId: 'ord-1',
    orderNumber: 'ORD-001',
    packageTitle: 'Logo Design',
    sellerName: 'Jane Smith',
    status: 'IN_PROGRESS',
    amount: 500,
    createdAt: new Date().toISOString(),
  },
};

// Mock fetch
global.fetch = jest.fn();

// Mock useAuthState
const mockUseAuthState = jest.fn();
jest.mock('../../../hooks/shared/useAuthState', () => ({
  useAuthState: () => mockUseAuthState(),
}));

// Mock logger
jest.mock('../../../lib/infrastructure/logger', () => ({
  logger: {
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  },
}));

// ================================================
// TESTS
// ================================================

describe('usePlatformSnapshot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPlatformSnapshot }),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ================================================
  // INITIAL STATE
  // ================================================

  describe('Initial State', () => {
    it('should initialize with loading state', () => {
      const { result } = renderHook(() => usePlatformSnapshot(false));

      expect(result.current.loading).toBe(true);
      expect(result.current.data).toBeNull();
      expect(result.current.error).toBeNull();
    });

    it('should fetch data on mount when enabled', async () => {
      const { result } = renderHook(() => usePlatformSnapshot(true));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockPlatformSnapshot);
      expect(result.current.error).toBeNull();
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/v1/dashboard/admin/snapshot',
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });
  });

  // ================================================
  // AUTO-REFRESH
  // ================================================

  describe('Auto-Refresh', () => {
    it('should auto-refresh at specified interval', async () => {
      const refreshInterval = 60000; // 1 minute
      const { result } = renderHook(() =>
        usePlatformSnapshot(true, refreshInterval)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Fast-forward time
      act(() => {
        jest.advanceTimersByTime(refreshInterval);
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });

    it('should not auto-refresh when disabled', async () => {
      const { result } = renderHook(() => usePlatformSnapshot(false));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialCallCount = (global.fetch as jest.Mock).mock.calls.length;

      act(() => {
        jest.advanceTimersByTime(300000); // 5 minutes
      });

      expect(global.fetch).toHaveBeenCalledTimes(initialCallCount);
    });

    it('should clear interval on unmount', async () => {
      const { unmount } = renderHook(() => usePlatformSnapshot(true));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      const callCountBeforeUnmount = (global.fetch as jest.Mock).mock.calls
        .length;

      unmount();

      act(() => {
        jest.advanceTimersByTime(300000);
      });

      expect(global.fetch).toHaveBeenCalledTimes(callCountBeforeUnmount);
    });
  });

  // ================================================
  // ERROR HANDLING
  // ================================================

  describe('Error Handling', () => {
    it('should handle fetch errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => usePlatformSnapshot(true));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Network error');
      expect(result.current.data).toBeNull();
    });

    it('should handle non-OK responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      const { result } = renderHook(() => usePlatformSnapshot(true));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toContain('Failed to fetch');
      expect(result.current.data).toBeNull();
    });
  });

  // ================================================
  // MANUAL REFRESH
  // ================================================

  describe('Manual Refresh', () => {
    it('should support manual refresh', async () => {
      const { result } = renderHook(() => usePlatformSnapshot(true));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Manual refresh
      act(() => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2);
      });
    });
  });

  // ================================================
  // ABORT CONTROLLER
  // ================================================

  describe('Abort Controller', () => {
    it('should abort pending requests on unmount', async () => {
      const abortSpy = jest.spyOn(AbortController.prototype, 'abort');

      const { unmount } = renderHook(() => usePlatformSnapshot(true));

      unmount();

      expect(abortSpy).toHaveBeenCalled();
      abortSpy.mockRestore();
    });
  });
});

// ================================================
// SELLER SNAPSHOT TESTS
// ================================================

describe('useSellerSnapshot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockSellerSnapshot }),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should fetch seller snapshot', async () => {
    const { result } = renderHook(() => useSellerSnapshot(true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockSellerSnapshot);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/dashboard/seller/me/snapshot',
      expect.objectContaining({
        credentials: 'include',
      })
    );
  });

  it('should auto-refresh at 2-minute intervals by default', async () => {
    const { result } = renderHook(() => useSellerSnapshot(true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(120000); // 2 minutes
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });

  it('should handle seller-specific errors', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error('Seller not found')
    );

    const { result } = renderHook(() => useSellerSnapshot(true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Seller not found');
  });
});

// ================================================
// BUYER SNAPSHOT TESTS
// ================================================

describe('useBuyerSnapshot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockBuyerSnapshot }),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should fetch buyer snapshot', async () => {
    const { result } = renderHook(() => useBuyerSnapshot(true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockBuyerSnapshot);
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/dashboard/buyer/me/snapshot',
      expect.objectContaining({
        credentials: 'include',
      })
    );
  });

  it('should auto-refresh at 2-minute intervals by default', async () => {
    const { result } = renderHook(() => useBuyerSnapshot(true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    act(() => {
      jest.advanceTimersByTime(120000); // 2 minutes
    });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});

// ================================================
// UNIFIED DASHBOARD SNAPSHOT TESTS
// ================================================

describe('useDashboardSnapshot', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPlatformSnapshot }),
    });
  });

  it('should fetch platform snapshot for admin role', async () => {
    mockUseAuthState.mockReturnValue({
      user: { id: 'user-1', role: 'admin', userType: 'employer' },
      isAuthenticated: true,
    });

    const { result } = renderHook(() => useDashboardSnapshot(true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/dashboard/admin/snapshot',
      expect.any(Object)
    );
  });

  it('should fetch seller snapshot for freelancer userType', async () => {
    mockUseAuthState.mockReturnValue({
      user: { id: 'user-2', role: 'freelancer', userType: 'freelancer' },
      isAuthenticated: true,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockSellerSnapshot }),
    });

    const { result } = renderHook(() => useDashboardSnapshot(true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/dashboard/seller/me/snapshot',
      expect.any(Object)
    );
  });

  it('should fetch buyer snapshot for employer userType', async () => {
    mockUseAuthState.mockReturnValue({
      user: { id: 'user-3', role: 'employer', userType: 'employer' },
      isAuthenticated: true,
    });

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockBuyerSnapshot }),
    });

    const { result } = renderHook(() => useDashboardSnapshot(true));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/v1/dashboard/buyer/me/snapshot',
      expect.any(Object)
    );
  });

  it('should return null when user is not authenticated', async () => {
    mockUseAuthState.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });

    const { result } = renderHook(() => useDashboardSnapshot(true));

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBeNull();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
