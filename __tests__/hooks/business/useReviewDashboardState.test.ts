/**
 * ================================================
 * REVIEW DASHBOARD STATE HOOK TESTS
 * ================================================
 * Tests for useReviewDashboardState custom hook
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Story 2.4.3b: Dashboard Reviews Refactor
 */

import { renderHook, act } from '@testing-library/react';
import { useReviewDashboardState } from '../../../hooks/business/useReviewDashboardState';
import type { Review } from '../../../types/business/review';
import { ReviewType, ReviewStatus } from '../../../types/business/review';

// ================================================
// MOCK DATA
// ================================================

const mockReview: Review = {
  id: '1',
  reviewerId: 'reviewer1',
  reviewerName: 'John Doe',
  reviewerAvatar: 'avatar.jpg',
  revieweeId: 'seller1',
  revieweeName: 'Jane Smith',
  type: ReviewType.ORDER,
  status: ReviewStatus.APPROVED,
  overallRating: 5,
  communicationRating: 5,
  qualityRating: 5,
  deliveryRating: 5,
  reviewText: 'Great service!',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  helpfulCount: 10,
  notHelpfulCount: 0,
  isVerifiedPurchase: true,
  flaggedCount: 0,
};

// ================================================
// TESTS
// ================================================

describe('useReviewDashboardState', () => {
  // ================================================
  // INITIAL STATE
  // ================================================

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useReviewDashboardState());

      expect(result.current.state.currentPage).toBe(1);
      expect(result.current.state.sortBy).toBe('CREATED_AT');
      expect(result.current.state.sortDirection).toBe('DESC');
      expect(result.current.state.minRating).toBeUndefined();
      expect(result.current.state.verifiedOnly).toBe(false);
      expect(result.current.state.showResponseDialog).toBe(false);
      expect(result.current.state.selectedReview).toBeNull();
    });
  });

  // ================================================
  // ACTIONS
  // ================================================

  describe('Actions', () => {
    it('should update current page', () => {
      const { result } = renderHook(() => useReviewDashboardState());

      act(() => {
        result.current.actions.setCurrentPage(2);
      });

      expect(result.current.state.currentPage).toBe(2);
    });

    it('should update sort by and reset page', () => {
      const { result } = renderHook(() => useReviewDashboardState());

      act(() => {
        result.current.actions.setCurrentPage(3);
        result.current.actions.setSortBy('RATING');
      });

      expect(result.current.state.sortBy).toBe('RATING');
      expect(result.current.state.currentPage).toBe(1); // Should reset to 1
    });

    it('should update sort direction and reset page', () => {
      const { result } = renderHook(() => useReviewDashboardState());

      act(() => {
        result.current.actions.setCurrentPage(3);
        result.current.actions.setSortDirection('ASC');
      });

      expect(result.current.state.sortDirection).toBe('ASC');
      expect(result.current.state.currentPage).toBe(1); // Should reset to 1
    });

    it('should update min rating and reset page', () => {
      const { result } = renderHook(() => useReviewDashboardState());

      act(() => {
        result.current.actions.setCurrentPage(3);
        result.current.actions.setMinRating(4);
      });

      expect(result.current.state.minRating).toBe(4);
      expect(result.current.state.currentPage).toBe(1); // Should reset to 1
    });

    it('should update verified only and reset page', () => {
      const { result } = renderHook(() => useReviewDashboardState());

      act(() => {
        result.current.actions.setCurrentPage(3);
        result.current.actions.setVerifiedOnly(true);
      });

      expect(result.current.state.verifiedOnly).toBe(true);
      expect(result.current.state.currentPage).toBe(1); // Should reset to 1
    });

    it('should open response dialog', () => {
      const { result } = renderHook(() => useReviewDashboardState());

      act(() => {
        result.current.actions.openResponseDialog(mockReview);
      });

      expect(result.current.state.showResponseDialog).toBe(true);
      expect(result.current.state.selectedReview).toEqual(mockReview);
    });

    it('should close response dialog', () => {
      const { result } = renderHook(() => useReviewDashboardState());

      act(() => {
        result.current.actions.openResponseDialog(mockReview);
        result.current.actions.closeResponseDialog();
      });

      expect(result.current.state.showResponseDialog).toBe(false);
      expect(result.current.state.selectedReview).toBeNull();
    });

    it('should reset filters', () => {
      const { result } = renderHook(() => useReviewDashboardState());

      act(() => {
        result.current.actions.setCurrentPage(3);
        result.current.actions.setSortBy('RATING');
        result.current.actions.setSortDirection('ASC');
        result.current.actions.setMinRating(4);
        result.current.actions.setVerifiedOnly(true);
      });

      act(() => {
        result.current.actions.resetFilters();
      });

      expect(result.current.state.currentPage).toBe(1);
      expect(result.current.state.sortBy).toBe('CREATED_AT');
      expect(result.current.state.sortDirection).toBe('DESC');
      expect(result.current.state.minRating).toBeUndefined();
      expect(result.current.state.verifiedOnly).toBe(false);
    });
  });

  // ================================================
  // INTEGRATION
  // ================================================

  describe('Integration', () => {
    it('should handle complete workflow', () => {
      const { result } = renderHook(() => useReviewDashboardState());

      // Apply filters
      act(() => {
        result.current.actions.setMinRating(4);
        result.current.actions.setVerifiedOnly(true);
        result.current.actions.setSortBy('RATING');
      });

      expect(result.current.state.minRating).toBe(4);
      expect(result.current.state.verifiedOnly).toBe(true);
      expect(result.current.state.sortBy).toBe('RATING');
      expect(result.current.state.currentPage).toBe(1);

      // Navigate to page 2
      act(() => {
        result.current.actions.setCurrentPage(2);
      });

      expect(result.current.state.currentPage).toBe(2);

      // Open dialog
      act(() => {
        result.current.actions.openResponseDialog(mockReview);
      });

      expect(result.current.state.showResponseDialog).toBe(true);
      expect(result.current.state.selectedReview).toEqual(mockReview);

      // Close dialog
      act(() => {
        result.current.actions.closeResponseDialog();
      });

      expect(result.current.state.showResponseDialog).toBe(false);
      expect(result.current.state.selectedReview).toBeNull();

      // Reset filters
      act(() => {
        result.current.actions.resetFilters();
      });

      expect(result.current.state.currentPage).toBe(1);
      expect(result.current.state.minRating).toBeUndefined();
      expect(result.current.state.verifiedOnly).toBe(false);
      expect(result.current.state.sortBy).toBe('CREATED_AT');
    });
  });
});
