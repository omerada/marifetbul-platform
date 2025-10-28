/**
 * Unit Tests for Dashboard Transformers
 * Sprint 1 - Epic 1.4: Frontend Unit Tests
 *
 * Tests transformation of backend DTOs to frontend types
 */

import {
  transformSellerDashboard,
  transformBuyerDashboard,
  type BackendSellerDashboardDto,
  type BackendBuyerDashboardDto,
} from '../../../../lib/api/transformers/dashboard';

describe('Dashboard Transformers', () => {
  describe('transformSellerDashboard', () => {
    it('should transform complete freelancer dashboard data correctly', () => {
      // Given
      const mockDTO: BackendSellerDashboardDto = {
        metrics: {
          totalEarnings: 15000.5,
          activeOrderCount: 3,
          completedOrderCount: 12,
          averageRating: 4.8,
          responseRate: 95.0,
        },
        recentOrders: [
          {
            id: 'order-1',
            title: 'Logo Design',
            status: 'IN_PROGRESS',
            totalAmount: 500,
            deliveryDate: '2025-01-15T00:00:00Z',
            createdAt: '2025-01-01T00:00:00Z',
          },
        ],
      };

      // When
      const result = transformSellerDashboard(mockDTO);

      // Then
      expect(result).toBeDefined();
      expect(result.stats.totalEarnings).toBe(15000.5);
      expect(result.stats.activeOrders).toBe(3);
      expect(result.stats.completedJobs).toBe(12);
      expect(result.stats.rating).toBe(4.8);

      // Success rate should be calculated: (12 / (12+3)) * 100 = 80
      expect(result.overview.successRate).toBe(80);

      // Response time should be calculated from response rate: 24 * (1 - 95/100)
      expect(result.overview.responseTime).toBeCloseTo(1.2, 1);

      expect(result.recentOrders).toHaveLength(1);
      expect(result.recentOrders[0].id).toBe('order-1');
    });

    it('should handle zero total orders gracefully', () => {
      // Given
      const mockDTO: BackendSellerDashboardDto = {
        metrics: {
          totalEarnings: 0,
          activeOrderCount: 0,
          completedOrderCount: 0,
          averageRating: 0,
          responseRate: 0,
        },
        recentOrders: [],
      };

      // When
      const result = transformSellerDashboard(mockDTO);

      // Then
      expect(result.overview.successRate).toBe(0);
      expect(result.recentOrders).toHaveLength(0);
    });

    it('should calculate success rate correctly for partial completion', () => {
      // Given
      const mockDTO: BackendSellerDashboardDto = {
        metrics: {
          totalEarnings: 10000,
          activeOrderCount: 2,
          completedOrderCount: 8,
          averageRating: 4.5,
          responseRate: 90,
        },
      };

      // When
      const result = transformSellerDashboard(mockDTO);

      // Then
      // (8 completed / (8+2) total) * 100 = 80%
      expect(result.overview.successRate).toBe(80);
    });

    it('should handle large numbers correctly', () => {
      // Given
      const mockDTO: BackendSellerDashboardDto = {
        metrics: {
          totalEarnings: 999999.99,
          activeOrderCount: 50,
          completedOrderCount: 500,
          averageRating: 4.95,
          responseRate: 98,
        },
      };

      // When
      const result = transformSellerDashboard(mockDTO);

      // Then
      expect(result.stats.totalEarnings).toBe(999999.99);
      expect(result.stats.completedJobs).toBe(500);
    });
  });

  describe('transformBuyerDashboard', () => {
    it('should transform complete employer dashboard data correctly', () => {
      // Given
      const mockDTO: BackendBuyerDashboardDto = {
        metrics: {
          totalSpent: 25000.75,
          activeJobCount: 4,
          completedJobCount: 20,
          averageRating: 4.7,
        },
        activeJobs: [
          {
            id: 'job-1',
            employerId: 'emp-1',
            title: 'Mobile App Development',
            status: 'OPEN',
            budget: 3000,
            createdAt: '2025-01-05T00:00:00Z',
          },
        ],
      };

      // When
      const result = transformBuyerDashboard(mockDTO);

      // Then
      expect(result).toBeDefined();
      expect(result.stats.totalSpent).toBe(25000.75);
      expect(result.stats.activeJobs).toBe(4);
      expect(result.stats.completedJobs).toBe(20);
      expect(result.analytics.hiring.satisfaction).toBe(4.7);

      expect(result.recentJobs).toHaveLength(0); // recentJobs undefined
      expect(result.activeJobs).toHaveLength(1);
      expect(result.activeJobs[0].id).toBe('job-1');
    });

    it('should handle zero spending gracefully', () => {
      // Given
      const mockDTO: BackendBuyerDashboardDto = {
        metrics: {
          totalSpent: 0,
          activeJobCount: 0,
          completedJobCount: 0,
          averageRating: 0,
        },
      };

      // When
      const result = transformBuyerDashboard(mockDTO);

      // Then
      expect(result.stats.totalSpent).toBe(0);
      expect(result.recentJobs).toHaveLength(0);
    });

    it('should handle decimal precision in ratings', () => {
      // Given
      const mockDTO: BackendBuyerDashboardDto = {
        metrics: {
          totalSpent: 5000,
          activeJobCount: 1,
          completedJobCount: 10,
          averageRating: 4.73,
        },
      };

      // When
      const result = transformBuyerDashboard(mockDTO);

      // Then
      expect(result.analytics.hiring.satisfaction).toBe(4.73);
    });
  });
});
