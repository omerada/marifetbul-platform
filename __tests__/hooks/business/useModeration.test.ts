/**
 * ================================================
 * MODERATION HOOKS TESTS
 * ================================================
 * Tests for moderation custom hooks
 *
 * Sprint: Moderator Dashboard Implementation
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { renderHook, act } from '@testing-library/react';
import useSWR, { mutate as swrMutate } from 'swr';
import type {
  ModerationStats,
  BlogCommentDto,
  ReviewDto,
} from '../../../types/business/moderation';
import {
  CommentStatus,
  ReviewStatus,
} from '../../../types/business/moderation';
import * as moderationAPI from '../../../lib/api/moderation';
import { useToast } from '../../../hooks/core/useToast';
import {
  useModerationStats,
  usePendingComments,
  useBulkCommentActions,
  useCommentActions,
  usePendingReviews,
  useReviewActions,
  useUserModerationActions,
} from '../../../hooks/business/useModeration';

// ================================================
// MOCKS
// ================================================

jest.mock('swr');
jest.mock('../../../lib/api/moderation');
jest.mock('../../../hooks/core/useToast');

const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;
const mockSwrMutate = swrMutate as jest.MockedFunction<typeof swrMutate>;
const mockModerationAPI = moderationAPI as jest.Mocked<typeof moderationAPI>;
const mockUseToast = useToast as jest.MockedFunction<typeof useToast>;

const mockStats: ModerationStats = {
  pendingComments: 5,
  flaggedComments: 3,
  commentsApprovedToday: 10,
  commentsRejectedToday: 2,
  pendingReviews: 4,
  flaggedReviews: 2,
  reviewsApprovedToday: 8,
  reviewsRejectedToday: 1,
  pendingReports: 3,
  reportsResolvedToday: 5,
  pendingSupportTickets: 2,
  ticketsClosedToday: 7,
  totalPendingItems: 14,
  totalActionsToday: 33,
  averageResponseTimeMinutes: 15.5,
  accuracyRate: 0.95,
};

const mockComments: BlogCommentDto[] = [
  {
    id: '1',
    content: 'Great article!',
    authorId: 'user1',
    authorName: 'John Doe',
    postId: 'post1',
    postTitle: 'React Best Practices',
    status: CommentStatus.PENDING,
    flaggedCount: 0,
    flagReasons: [],
    createdAt: '2025-11-01T10:00:00Z',
  },
  {
    id: '2',
    content: 'Spam content here',
    authorId: 'user2',
    authorName: 'Jane Smith',
    postId: 'post2',
    postTitle: 'TypeScript Tips',
    status: CommentStatus.PENDING,
    flaggedCount: 3,
    flagReasons: ['SPAM', 'INAPPROPRIATE'],
    createdAt: '2025-11-01T09:00:00Z',
  },
];

const mockReviews: ReviewDto[] = [
  {
    id: '1',
    rating: 5,
    comment: 'Excellent service!',
    reviewerId: 'user1',
    reviewerName: 'John Doe',
    packageId: 'pkg1',
    packageTitle: 'Logo Design',
    sellerId: 'seller1',
    status: ReviewStatus.PENDING,
    flaggedCount: 0,
    flagReasons: [],
    createdAt: '2025-11-01T10:00:00Z',
    verified: true,
  },
];

const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
  toasts: [],
  addToast: jest.fn(),
  removeToast: jest.fn(),
  clearToasts: jest.fn(),
};

// ================================================
// TESTS
// ================================================

describe('useModeration Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseToast.mockReturnValue(mockToast);
  });

  describe('useModerationStats', () => {
    it('should return moderation statistics', () => {
      mockUseSWR.mockReturnValue({
        data: mockStats,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const { result } = renderHook(() => useModerationStats());

      expect(result.current.stats).toEqual(mockStats);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeUndefined();
    });

    it('should handle loading state', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const { result } = renderHook(() => useModerationStats());

      expect(result.current.stats).toBeUndefined();
      expect(result.current.isLoading).toBe(true);
    });

    it('should handle error state', () => {
      const mockError = new Error('Failed to fetch stats');
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: mockError,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const { result } = renderHook(() => useModerationStats());

      expect(result.current.error).toBe(mockError);
      expect(result.current.stats).toBeUndefined();
    });
  });

  describe('usePendingComments', () => {
    it('should return pending comments', () => {
      mockUseSWR.mockReturnValue({
        data: { comments: mockComments, total: 2 },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const { result } = renderHook(() => usePendingComments(0, 20));

      expect(result.current.comments).toEqual(mockComments);
      expect(result.current.total).toBe(2);
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('useBulkCommentActions', () => {
    it('should approve comments in bulk', async () => {
      mockModerationAPI.bulkApproveComments.mockResolvedValue({
        successCount: 2,
        failureCount: 0,
        failures: [],
      });

      const { result } = renderHook(() => useBulkCommentActions());

      await act(async () => {
        await result.current.bulkApprove(['1', '2']);
      });

      expect(mockModerationAPI.bulkApproveComments).toHaveBeenCalledWith([
        '1',
        '2',
      ]);
      expect(mockToast.success).toHaveBeenCalledWith('2 yorum onaylandı');
    });

    it('should reject comments in bulk', async () => {
      mockModerationAPI.bulkRejectComments.mockResolvedValue({
        successCount: 2,
        failureCount: 0,
        failures: [],
      });

      const { result } = renderHook(() => useBulkCommentActions());

      await act(async () => {
        await result.current.bulkReject(['1', '2'], 'Inappropriate content');
      });

      expect(mockModerationAPI.bulkRejectComments).toHaveBeenCalledWith(
        ['1', '2'],
        'Inappropriate content'
      );
      expect(mockToast.success).toHaveBeenCalledWith('2 yorum reddedildi');
    });

    it('should mark comments as spam in bulk', async () => {
      mockModerationAPI.bulkMarkCommentsAsSpam.mockResolvedValue({
        successCount: 2,
        failureCount: 0,
        failures: [],
      });

      const { result } = renderHook(() => useBulkCommentActions());

      await act(async () => {
        await result.current.bulkSpam(['1', '2']);
      });

      expect(mockModerationAPI.bulkMarkCommentsAsSpam).toHaveBeenCalledWith([
        '1',
        '2',
      ]);
      expect(mockToast.success).toHaveBeenCalledWith(
        '2 yorum spam olarak işaretlendi'
      );
    });

    it('should handle partial failures', async () => {
      mockModerationAPI.bulkApproveComments.mockResolvedValue({
        successCount: 1,
        failureCount: 1,
        failures: [{ id: '2', error: 'Not found' }],
      });

      const { result } = renderHook(() => useBulkCommentActions());

      await act(async () => {
        await result.current.bulkApprove(['1', '2']);
      });

      // Hook shows partial success with both counts
      expect(mockToast.success).toHaveBeenCalledWith(
        '1 yorum onaylandı, 1 başarısız'
      );
    });

    it('should handle errors', async () => {
      mockModerationAPI.bulkApproveComments.mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHook(() => useBulkCommentActions());

      await expect(
        act(async () => {
          await result.current.bulkApprove(['1', '2']);
        })
      ).rejects.toThrow('Network error');

      expect(mockToast.error).toHaveBeenCalled();
    });
  });

  describe('useCommentActions', () => {
    it('should approve a single comment', async () => {
      mockModerationAPI.approveComment.mockResolvedValue(mockComments[0]);

      const { result } = renderHook(() => useCommentActions());

      await act(async () => {
        await result.current.approve('1');
      });

      expect(mockModerationAPI.approveComment).toHaveBeenCalledWith('1');
      expect(mockToast.success).toHaveBeenCalledWith('Yorum onaylandı');
    });

    it('should reject a single comment', async () => {
      mockModerationAPI.rejectComment.mockResolvedValue(mockComments[0]);

      const { result } = renderHook(() => useCommentActions());

      await act(async () => {
        await result.current.reject('1', 'Spam content');
      });

      expect(mockModerationAPI.rejectComment).toHaveBeenCalledWith(
        '1',
        'Spam content'
      );
      expect(mockToast.success).toHaveBeenCalledWith('Yorum reddedildi');
    });

    it('should mark comment as spam', async () => {
      mockModerationAPI.markCommentAsSpam.mockResolvedValue(mockComments[1]);

      const { result } = renderHook(() => useCommentActions());

      await act(async () => {
        await result.current.spam('2');
      });

      expect(mockModerationAPI.markCommentAsSpam).toHaveBeenCalledWith('2');
      expect(mockToast.success).toHaveBeenCalledWith(
        'Yorum spam olarak işaretlendi'
      );
    });
  });

  describe('usePendingReviews', () => {
    it('should return pending reviews', () => {
      mockUseSWR.mockReturnValue({
        data: { reviews: mockReviews, total: 1 },
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const { result } = renderHook(() => usePendingReviews(0, 20));

      expect(result.current.reviews).toEqual(mockReviews);
      expect(result.current.total).toBe(1);
    });
  });

  describe('useReviewActions', () => {
    it('should approve a review', async () => {
      mockModerationAPI.approveReview.mockResolvedValue(mockReviews[0]);

      const { result } = renderHook(() => useReviewActions());

      await act(async () => {
        await result.current.approve('1');
      });

      expect(mockModerationAPI.approveReview).toHaveBeenCalledWith('1');
      expect(mockToast.success).toHaveBeenCalledWith('Değerlendirme onaylandı');
    });

    it('should reject a review', async () => {
      mockModerationAPI.rejectReview.mockResolvedValue(mockReviews[0]);

      const { result } = renderHook(() => useReviewActions());

      await act(async () => {
        await result.current.reject('1', 'Fake review');
      });

      expect(mockModerationAPI.rejectReview).toHaveBeenCalledWith(
        '1',
        'Fake review'
      );
      expect(mockToast.success).toHaveBeenCalledWith(
        'Değerlendirme reddedildi'
      );
    });
  });

  describe('useUserModerationActions', () => {
    it('should issue a warning to a user', async () => {
      const mockWarning = {
        id: '1',
        userId: 'user1',
        moderatorId: 'mod1',
        warningLevel: 'LEVEL_1' as const,
        reason: 'Spam content',
        reasonDescription: 'Spam',
        details: 'Please stop spamming',
        status: 'ACTIVE' as const,
        createdAt: '2025-11-01T10:00:00Z',
        active: true,
        canAppeal: true,
      };
      mockModerationAPI.issueWarning.mockResolvedValue(mockWarning);

      const { result } = renderHook(() => useUserModerationActions());

      await act(async () => {
        await result.current.issueWarning(
          'user1',
          'Spam content',
          'Please stop spamming'
        );
      });

      expect(mockModerationAPI.issueWarning).toHaveBeenCalledWith({
        userId: 'user1',
        reason: 'Spam content',
        details: 'Please stop spamming',
        relatedContentRef: undefined,
      });
      expect(mockToast.success).toHaveBeenCalledWith(
        'Kullanıcıya uyarı gönderildi'
      );
    });

    it('should suspend a user temporarily', async () => {
      const mockSuspension = {
        id: '1',
        userId: 'user2',
        moderatorId: 'mod1',
        suspensionType: 'TEMPORARY' as const,
        suspensionTypeDescription: 'Temporary',
        reason: 'Multiple violations',
        reasonDescription: 'Violations',
        details: 'User violated terms repeatedly',
        startsAt: '2025-11-01T10:00:00Z',
        status: 'ACTIVE' as const,
        active: true,
        canAppeal: true,
        createdAt: '2025-11-01T10:00:00Z',
        permanent: false,
      };
      mockModerationAPI.suspendUser.mockResolvedValue(mockSuspension);

      const { result } = renderHook(() => useUserModerationActions());

      await act(async () => {
        await result.current.suspend(
          'user2',
          'TEMPORARY',
          'Multiple violations',
          'User violated terms repeatedly',
          7
        );
      });

      expect(mockModerationAPI.suspendUser).toHaveBeenCalledWith({
        userId: 'user2',
        suspensionType: 'TEMPORARY',
        reason: 'Multiple violations',
        details: 'User violated terms repeatedly',
        durationDays: 7,
      });
      expect(mockToast.success).toHaveBeenCalledWith(
        'Kullanıcı 7 gün askıya alındı'
      );
    });

    it('should suspend a user permanently', async () => {
      const mockSuspension = {
        id: '1',
        userId: 'user2',
        moderatorId: 'mod1',
        suspensionType: 'PERMANENT' as const,
        suspensionTypeDescription: 'Permanent',
        reason: 'Severe violations',
        reasonDescription: 'Violations',
        details: 'User violated terms severely',
        startsAt: '2025-11-01T10:00:00Z',
        status: 'ACTIVE' as const,
        active: true,
        canAppeal: false,
        createdAt: '2025-11-01T10:00:00Z',
        permanent: true,
      };
      mockModerationAPI.suspendUser.mockResolvedValue(mockSuspension);

      const { result } = renderHook(() => useUserModerationActions());

      await act(async () => {
        await result.current.suspend(
          'user2',
          'PERMANENT',
          'Severe violations',
          'User violated terms severely'
        );
      });

      expect(mockModerationAPI.suspendUser).toHaveBeenCalledWith({
        userId: 'user2',
        suspensionType: 'PERMANENT',
        reason: 'Severe violations',
        details: 'User violated terms severely',
        durationDays: undefined,
      });
      expect(mockToast.success).toHaveBeenCalledWith(
        'Kullanıcı kalıcı olarak askıya alındı'
      );
    });

    it('should handle user action errors', async () => {
      mockModerationAPI.issueWarning.mockRejectedValue(
        new Error('User not found')
      );

      const { result } = renderHook(() => useUserModerationActions());

      await expect(
        act(async () => {
          await result.current.issueWarning('invalid', 'reason', 'details');
        })
      ).rejects.toThrow('User not found');

      expect(mockToast.error).toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should refresh data after bulk action', async () => {
      mockModerationAPI.bulkApproveComments.mockResolvedValue({
        successCount: 2,
        failureCount: 0,
        failures: [],
      });

      mockSwrMutate.mockResolvedValue(undefined);

      const { result } = renderHook(() => useBulkCommentActions());

      await act(async () => {
        await result.current.bulkApprove(['1', '2']);
      });

      expect(mockSwrMutate).toHaveBeenCalled();
    });
  });
});
