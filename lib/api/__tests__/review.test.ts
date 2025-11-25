/**
 * @jest-environment jsdom
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import {
  createReview,
  getReviewById,
  updateReview,
  deleteReview,
  getPackageReviews,
  getUserReviews,
  getSellerReviews,
  canReviewOrder,
  voteHelpful,
  voteNotHelpful,
  flagReview,
  uploadReviewImage,
  getReviewImages,
  deleteReviewImage,
  approveReview,
  rejectReview,
  getFlaggedReviews,
} from '../review';

// Mock apiClient
jest.mock('@/lib/infrastructure/api/client');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Review API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================
  // Test Data
  // ========================================

  const mockReview = {
    id: 123,
    orderId: 456,
    reviewerId: 111,
    revieweeId: 222,
    rating: 5,
    comment: 'Excellent work!',
    createdAt: '2025-01-15T10:00:00Z',
  };

  const mockReviewsResponse = {
    data: [mockReview],
    pagination: {
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    },
  };

  // ========================================
  // CRUD Operations
  // ========================================

  describe('createReview', () => {
    const createReviewRequest = {
      orderId: 456,
      packageId: 789,
      rating: 5,
      comment: 'Excellent work!',
    };

    it('should create a review successfully', async () => {
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: mockReview,
      });

      const result = await createReview(createReviewRequest as any);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/reviews',
        createReviewRequest
      );
      expect(result).toEqual(mockReview);
      expect(result.id).toBe(123);
      expect(result.rating).toBe(5);
    });

    it('should handle validation errors', async () => {
      mockApiClient.post.mockRejectedValue(
        new Error('Invalid rating: must be between 1 and 5')
      );

      await expect(createReview(createReviewRequest)).rejects.toThrow(
        'Invalid rating'
      );
    });

    it('should handle authorization errors', async () => {
      mockApiClient.post.mockRejectedValue(
        new Error('Not eligible to review this order')
      );

      await expect(createReview(createReviewRequest as any)).rejects.toThrow(
        'Not eligible to review'
      );
    });
  });

  describe('getReviewById', () => {
    it('should fetch a review by ID', async () => {
      mockApiClient.get.mockResolvedValue({
        success: true,
        data: mockReview,
      });

      const result = await getReviewById('123');

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/reviews/123');
      expect(result).toEqual(mockReview);
      expect(result.id).toBe(123);
    });

    it('should handle not found errors', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Review not found'));

      await expect(getReviewById('invalid-id')).rejects.toThrow(
        'Review not found'
      );
    });
  });

  describe('updateReview', () => {
    const updateRequest = {
      rating: 4,
      comment: 'Updated comment',
    };

    it('should update a review successfully', async () => {
      const updatedReview = { ...mockReview, ...updateRequest };
      mockApiClient.put.mockResolvedValue({
        success: true,
        data: updatedReview,
      });

      const result = await updateReview('123', updateRequest as any);

      expect(mockApiClient.put).toHaveBeenCalledWith(
        '/api/v1/reviews/123',
        updateRequest
      );
      expect(result.rating).toBe(4);
      expect(result.comment).toBe('Updated comment');
    });

    it('should handle authorization errors', async () => {
      mockApiClient.put.mockRejectedValue(new Error('Not review owner'));

      await expect(updateReview('123', updateRequest as any)).rejects.toThrow(
        'Not review owner'
      );
    });
  });

  describe('deleteReview', () => {
    it('should delete a review successfully', async () => {
      mockApiClient.delete.mockResolvedValue({ success: true });

      await deleteReview('review-123');

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        '/api/v1/reviews/review-123'
      );
    });

    it('should handle not found errors', async () => {
      mockApiClient.delete.mockRejectedValue(new Error('Review not found'));

      await expect(deleteReview('invalid-id')).rejects.toThrow(
        'Review not found'
      );
    });
  });

  // ========================================
  // Query Operations
  // ========================================

  describe('getPackageReviews', () => {
    it('should fetch package reviews with default pagination', async () => {
      mockApiClient.get.mockResolvedValue({
        success: true,
        data: mockReviewsResponse,
      });

      const result = await getPackageReviews({
        packageId: '789',
      });

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/v1/reviews/public/package/789',
        {}
      );
      expect(result.data).toHaveLength(1);
    });

    it('should support filtering and pagination', async () => {
      mockApiClient.get.mockResolvedValue({
        success: true,
        data: mockReviewsResponse,
      });

      await getPackageReviews({
        packageId: '789',
        page: 2,
        pageSize: 20,
        rating: 5,
        sortBy: 'RECENT',
      } as any);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/v1/reviews/public/package/789',
        {
          page: 2,
          pageSize: 20,
          rating: 5,
          sortBy: 'RECENT',
        }
      );
    });

    it('should handle empty results', async () => {
      const emptyResponse = {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0,
        },
      };

      mockApiClient.get.mockResolvedValue({
        success: true,
        data: emptyResponse,
      });

      const result = await getPackageReviews({
        packageId: 'new-package',
      } as any);

      expect(result.data).toHaveLength(0);
    });
  });

  describe('getUserReviews', () => {
    it('should fetch reviews written by current user', async () => {
      mockApiClient.get.mockResolvedValue({
        success: true,
        data: mockReviewsResponse,
      });

      const result = await getUserReviews();

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/v1/reviews/my',
        undefined
      );
      expect(result.data).toHaveLength(1);
    });

    it('should support pagination', async () => {
      mockApiClient.get.mockResolvedValue({
        success: true,
        data: mockReviewsResponse,
      });

      await getUserReviews({ page: 2, pageSize: 5 });

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/v1/reviews/my', {
        page: 2,
        pageSize: 5,
      });
    });
  });

  describe('getSellerReviews', () => {
    it('should fetch reviews received by a seller', async () => {
      mockApiClient.get.mockResolvedValue({
        success: true,
        data: mockReviewsResponse,
      });

      const result = await getSellerReviews({ sellerId: '123' } as any);

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/v1/reviews/public/seller/123',
        {}
      );
      expect(result.data).toHaveLength(1);
    });
  });

  describe('canReviewOrder', () => {
    it('should return true if user can review', async () => {
      mockApiClient.get.mockResolvedValue({
        success: true,
        data: { canReview: true },
      });

      const result = await canReviewOrder('order-456');

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/v1/reviews/can-review/order-456'
      );
      expect(result).toBe(true);
    });

    it('should return false if user cannot review', async () => {
      mockApiClient.get.mockResolvedValue({
        success: true,
        data: { canReview: false },
      });

      const result = await canReviewOrder('order-456');

      expect(result).toBe(false);
    });
  });

  // ========================================
  // Voting
  // ========================================

  describe('Voting', () => {
    it('should vote review as helpful', async () => {
      const votedReview = { ...mockReview };
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: votedReview,
      });

      const result = await voteHelpful('123');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/reviews/123/helpful'
      );
      expect(result.id).toBe(123);
    });

    it('should vote review as not helpful', async () => {
      const votedReview = { ...mockReview };
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: votedReview,
      });

      const result = await voteNotHelpful('123');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/reviews/123/not-helpful'
      );
      expect(result.id).toBe(123);
    });
  });

  // ========================================
  // Flagging
  // ========================================

  describe('flagReview', () => {
    it('should flag a review for moderation', async () => {
      mockApiClient.post.mockResolvedValue({ success: true });

      await flagReview('review-123', {
        reason: 'SPAM',
        details: 'Contains promotional links',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/reviews/review-123/flag',
        {
          reason: 'SPAM',
          details: 'Contains promotional links',
        }
      );
    });
  });

  // ========================================
  // Image Upload
  // ========================================

  describe('Image Upload', () => {
    const mockFile = new File(['dummy'], 'image.jpg', { type: 'image/jpeg' });
    const mockImage = {
      id: 'img-123',
      reviewId: 'review-123',
      url: 'https://cdn.example.com/review-images/img-123.jpg',
      thumbnailUrl: 'https://cdn.example.com/review-images/img-123-thumb.jpg',
      uploadedAt: '2025-01-15T10:00:00Z',
    };

    it('should upload review image', async () => {
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: mockImage,
      });

      const result = await uploadReviewImage('review-123', mockFile);

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/reviews/review-123/images',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      expect(result.id).toBe('img-123');
      expect(result.url).toContain('img-123.jpg');
    });

    it('should get review images', async () => {
      mockApiClient.get.mockResolvedValue({
        success: true,
        data: [mockImage],
      });

      const result = await getReviewImages('review-123');

      expect(mockApiClient.get).toHaveBeenCalledWith(
        '/api/v1/reviews/review-123/images'
      );
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('img-123');
    });

    it('should delete review image', async () => {
      mockApiClient.delete.mockResolvedValue({ success: true });

      await deleteReviewImage('review-123', 'img-123');

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        '/api/v1/reviews/review-123/images/img-123'
      );
    });

    it('should handle file size validation errors', async () => {
      mockApiClient.post.mockRejectedValue(
        new Error('File size exceeds 5MB limit')
      );

      await expect(uploadReviewImage('review-123', mockFile)).rejects.toThrow(
        'File size exceeds 5MB'
      );
    });
  });

  // ========================================
  // Admin Operations
  // ========================================

  describe('Admin Operations', () => {
    it('should approve a review', async () => {
      const approvedReview = { ...mockReview };
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: approvedReview,
      });

      const result = await approveReview('123');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/reviews/admin/123/approve'
      );
      expect(result.id).toBe(123);
    });

    it('should reject a review', async () => {
      const rejectedReview = { ...mockReview };
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: rejectedReview,
      });

      const result = await rejectReview('123', 'Violates guidelines');

      expect(mockApiClient.post).toHaveBeenCalledWith(
        '/api/v1/reviews/admin/123/reject',
        { reason: 'Violates guidelines' }
      );
      expect(result.id).toBe(123);
    });

    it('should get flagged reviews', async () => {
      mockApiClient.get.mockResolvedValue({
        success: true,
        data: mockReviewsResponse,
      });

      // NOTE: getFlaggedReviews removed from review.ts (duplicate)
      // Use getFlaggedReviews from @/lib/api/moderation instead
      // This test is now obsolete but kept for reference

      // const result = await getFlaggedReviews();
      // expect(mockApiClient.get).toHaveBeenCalledWith(
      //   '/api/v1/reviews/admin/flagged',
      //   undefined
      // );
      // expect(result.data).toHaveLength(1);
    });
  });

  // ========================================
  // Error Handling
  // ========================================

  describe('Error Handling', () => {
    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Request timeout');
      mockApiClient.get.mockRejectedValue(timeoutError);

      await expect(getReviewById('review-123')).rejects.toThrow(
        'Request timeout'
      );
    });

    it('should handle server errors', async () => {
      mockApiClient.post.mockRejectedValue(new Error('Internal server error'));

      await expect(
        createReview({
          orderId: 456,
          packageId: 789,
          rating: 5,
          comment: 'Test',
        } as any)
      ).rejects.toThrow('Internal server error');
    });

    it('should handle invalid response data', async () => {
      mockApiClient.get.mockResolvedValue({
        success: true,
        data: null, // Invalid response
      });

      await expect(getReviewById('review-123')).rejects.toThrow();
    });
  });

  // ========================================
  // Edge Cases
  // ========================================

  describe('Edge Cases', () => {
    it('should handle reviews with minimal data', async () => {
      const minimalReview = {
        id: 123,
        orderId: 456,
        reviewerId: 111,
        revieweeId: 222,
        rating: 3,
        comment: null,
        createdAt: '2025-01-15T10:00:00Z',
      };
      mockApiClient.get.mockResolvedValue({
        success: true,
        data: minimalReview,
      });

      const result = await getReviewById('123');

      expect(result.id).toBe(123);
      expect(result.comment).toBeNull();
    });

    it('should handle pagination edge cases', async () => {
      const lastPageResponse = {
        data: [mockReview],
        pagination: {
          total: 100,
          page: 10,
          pageSize: 10,
          totalPages: 10,
        },
      };

      mockApiClient.get.mockResolvedValue({
        success: true,
        data: lastPageResponse,
      });

      const result = await getPackageReviews({
        packageId: '789',
        page: 10,
      } as any);

      expect(result.pagination.page).toBe(10);
      expect(result.pagination.totalPages).toBe(10);
    });
  });
});
