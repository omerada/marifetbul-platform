/**
 * ================================================
 * BLOG API CLIENT
 * ================================================
 * Client functions for blog system API endpoints
 * Handles posts, categories, comments, and tags
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 4: API Standardization with Validation
 */

import { apiClient } from '../infrastructure/api/client';
import { BLOG_ENDPOINTS, buildUrlWithParams } from './endpoints';
import {
  validateResponse,
  BlogPostSchema,
  BlogCategorySchema,
  BlogCommentSchema,
} from './validators';
import type {
  BlogPost as ValidatedBlogPost,
  BlogCategory as ValidatedBlogCategory,
  BlogComment as ValidatedBlogComment,
} from './validators';
import type { BulkCommentActionResponse } from '@/types/blog';

// ================================================
// TYPE DEFINITIONS
// ================================================

export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string;
  postCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogTag {
  id: number;
  name: string;
  slug: string;
  usageCount?: number;
}

export interface AuthorSummary {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string | null; // Allow null for validator compatibility
  // Backward compatibility aliases
  name?: string;
  avatar?: string;
}

export interface BlogPostSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED';
  featured: boolean;
  viewCount: number;
  commentCount: number;
  readingTime: number;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  category?: BlogCategory;
  author: AuthorSummary;
  tags: BlogTag[];
}

export interface BlogPost extends BlogPostSummary {
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  comments?: BlogComment[];
}

export interface BlogComment {
  id: number;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  author: AuthorSummary;
  parentId?: number | null; // Allow null for validator compatibility
  replies: BlogComment[];
  createdAt: string;
  updatedAt: string;
  approvedAt?: string | null; // Allow null
  depth: number;
}

export interface BlogStatistics {
  totalPosts: number;
  publishedPosts: number;
  draftPosts: number;
  scheduledPosts: number;
  totalViews: number;
  totalComments: number;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalPages: number;
  totalElements: number;
  last: boolean;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface CreateBlogPostRequest {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  categoryId: number;
  tagIds?: number[];
  featured?: boolean;
  status?: 'DRAFT' | 'PUBLISHED';
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface UpdateBlogPostRequest {
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  categoryId?: number;
  tagIds?: number[];
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface CreateCommentRequest {
  content: string;
  parentId?: number;
}

export interface PublishPostRequest {
  scheduledFor?: string; // ISO date string
}

export interface CreateCategoryRequest {
  name: string;
  slug?: string;
  description: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  slug?: string;
  description?: string;
}

// ================================================
// BLOG POST API
// ================================================

/**
 * Get published blog posts (paginated)
 */
export async function getPublishedPosts(params?: {
  page?: number;
  size?: number;
  sort?: string;
}): Promise<PageResponse<BlogPostSummary>> {
  const url = buildUrlWithParams(BLOG_ENDPOINTS.GET_POSTS, params);
  return apiClient.get(url);
}

/**
 * Get post by slug
 * @throws {NotFoundError} Post not found
 * @throws {ValidationError} Invalid response format
 */
export async function getPostBySlug(slug: string): Promise<ValidatedBlogPost> {
  const response = await apiClient.get<BlogPost>(
    BLOG_ENDPOINTS.GET_POST_BY_SLUG(slug)
  );
  return validateResponse(BlogPostSchema, response, 'BlogPost');
}

/**
 * Get post by ID
 * @throws {NotFoundError} Post not found
 * @throws {ValidationError} Invalid response format
 */
export async function getPostById(postId: number): Promise<ValidatedBlogPost> {
  const response = await apiClient.get<BlogPost>(
    BLOG_ENDPOINTS.GET_POST_BY_ID(postId)
  );
  return validateResponse(BlogPostSchema, response, 'BlogPost');
}

/**
 * Search blog posts
 */
export async function searchPosts(params: {
  q: string;
  page?: number;
  size?: number;
}): Promise<PageResponse<BlogPostSummary>> {
  const url = buildUrlWithParams(BLOG_ENDPOINTS.SEARCH_POSTS, params);
  return apiClient.get(url);
}

/**
 * Get posts by category
 */
export async function getPostsByCategory(
  categorySlug: string,
  params?: {
    page?: number;
    size?: number;
  }
): Promise<PageResponse<BlogPostSummary>> {
  const url = buildUrlWithParams(
    BLOG_ENDPOINTS.BY_CATEGORY(categorySlug),
    params
  );
  return apiClient.get(url);
}

/**
 * Get posts by tag
 */
export async function getPostsByTag(
  tagSlug: string,
  params?: {
    page?: number;
    size?: number;
  }
): Promise<PageResponse<BlogPostSummary>> {
  const url = buildUrlWithParams(BLOG_ENDPOINTS.BY_TAG(tagSlug), params);
  return apiClient.get(url);
}

/**
 * Get posts by author
 */
export async function getPostsByAuthor(
  authorId: string,
  params?: {
    page?: number;
    size?: number;
  }
): Promise<PageResponse<BlogPostSummary>> {
  const url = buildUrlWithParams(BLOG_ENDPOINTS.BY_AUTHOR(authorId), params);
  return apiClient.get(url);
}

/**
 * Get featured posts
 */
export async function getFeaturedPosts(
  limit: number = 5
): Promise<BlogPostSummary[]> {
  const url = buildUrlWithParams(BLOG_ENDPOINTS.GET_FEATURED, { limit });
  return apiClient.get(url);
}

/**
 * Get trending posts
 */
export async function getTrendingPosts(
  limit: number = 10
): Promise<BlogPostSummary[]> {
  const url = buildUrlWithParams(BLOG_ENDPOINTS.GET_TRENDING, { limit });
  return apiClient.get(url);
}

/**
 * Get most viewed posts
 */
export async function getMostViewedPosts(
  limit: number = 10
): Promise<BlogPostSummary[]> {
  const url = buildUrlWithParams(BLOG_ENDPOINTS.GET_POPULAR, { limit });
  return apiClient.get(url);
}

/**
 * Get most commented posts
 */
export async function getMostCommentedPosts(
  limit: number = 10
): Promise<BlogPostSummary[]> {
  const url = buildUrlWithParams(BLOG_ENDPOINTS.GET_DISCUSSED, { limit });
  return apiClient.get(url);
}

/**
 * Get related posts
 */
export async function getRelatedPosts(
  postId: number,
  limit: number = 5
): Promise<BlogPostSummary[]> {
  const url = buildUrlWithParams(BLOG_ENDPOINTS.GET_RELATED(postId), { limit });
  return apiClient.get(url);
}

/**
 * Create a new blog post
 * @throws {ValidationError} Invalid blog post data
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not authorized to create posts
 */
export async function createPost(
  data: CreateBlogPostRequest
): Promise<ValidatedBlogPost> {
  const response = await apiClient.post<BlogPost>(
    BLOG_ENDPOINTS.CREATE_POST,
    data
  );
  return validateResponse(BlogPostSchema, response, 'BlogPost');
}

/**
 * Update a blog post
 * @throws {ValidationError} Invalid blog post data
 * @throws {NotFoundError} Post not found
 * @throws {AuthorizationError} Not post author
 */
export async function updatePost(
  postId: number,
  data: UpdateBlogPostRequest
): Promise<ValidatedBlogPost> {
  const response = await apiClient.put<BlogPost>(
    BLOG_ENDPOINTS.UPDATE_POST(postId),
    data
  );
  return validateResponse(BlogPostSchema, response, 'BlogPost');
}

/**
 * Delete a blog post
 * @throws {NotFoundError} Post not found
 * @throws {AuthorizationError} Not post author
 */
export async function deletePost(postId: number): Promise<void> {
  return apiClient.delete(BLOG_ENDPOINTS.DELETE_POST(postId));
}

/**
 * Publish a post immediately
 * @throws {NotFoundError} Post not found
 * @throws {AuthorizationError} Not post author
 * @throws {ValidationError} Post not ready for publishing
 */
export async function publishPost(postId: number): Promise<ValidatedBlogPost> {
  const response = await apiClient.post<BlogPost>(
    BLOG_ENDPOINTS.PUBLISH_POST(postId),
    {}
  );
  return validateResponse(BlogPostSchema, response, 'BlogPost');
}

/**
 * Schedule a post for future publication
 */
export async function schedulePost(
  postId: number,
  data: PublishPostRequest
): Promise<BlogPost> {
  return apiClient.post(BLOG_ENDPOINTS.SCHEDULE_POST(postId), data);
}

/**
 * Unpublish a post (revert to draft)
 */
export async function unpublishPost(postId: number): Promise<BlogPost> {
  return apiClient.post(BLOG_ENDPOINTS.UNPUBLISH_POST(postId), {});
}

/**
 * Archive a post
 */
export async function archivePost(postId: number): Promise<BlogPost> {
  return apiClient.post(BLOG_ENDPOINTS.ARCHIVE_POST(postId), {});
}

/**
 * Increment view count
 */
export async function incrementViewCount(postId: number): Promise<void> {
  return apiClient.post(BLOG_ENDPOINTS.INCREMENT_VIEW(postId), {});
}

/**
 * Get my posts (authenticated)
 */
export async function getMyPosts(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<BlogPostSummary>> {
  const url = buildUrlWithParams(BLOG_ENDPOINTS.MY_POSTS, params);
  return apiClient.get(url);
}

/**
 * Get my drafts (authenticated)
 */
export async function getMyDrafts(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<BlogPostSummary>> {
  const url = buildUrlWithParams(BLOG_ENDPOINTS.MY_DRAFTS, params);
  return apiClient.get(url);
}

// ================================================
// BLOG CATEGORY API
// ================================================

/**
 * Get all blog categories
 */
export async function getCategories(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<BlogCategory>> {
  const url = buildUrlWithParams(BLOG_ENDPOINTS.GET_CATEGORIES, params);
  return apiClient.get(url);
}

/**
 * Get category by slug
 */
export async function getCategoryBySlug(slug: string): Promise<BlogCategory> {
  return apiClient.get(BLOG_ENDPOINTS.GET_CATEGORY_BY_SLUG(slug));
}

/**
 * Get category by ID
 * @throws {NotFoundError} Category not found
 * @throws {ValidationError} Invalid response format
 */
export async function getCategoryById(
  categoryId: number
): Promise<ValidatedBlogCategory> {
  const response = await apiClient.get<BlogCategory>(
    BLOG_ENDPOINTS.GET_CATEGORY_BY_ID(categoryId)
  );
  return validateResponse(BlogCategorySchema, response, 'BlogCategory');
}

/**
 * Create a new category (admin only)
 * @throws {ValidationError} Invalid category data
 * @throws {AuthorizationError} Not admin
 * @throws {ConflictError} Category slug already exists
 */
export async function createCategory(
  data: CreateCategoryRequest
): Promise<ValidatedBlogCategory> {
  const response = await apiClient.post<BlogCategory>(
    BLOG_ENDPOINTS.CREATE_CATEGORY,
    data
  );
  return validateResponse(BlogCategorySchema, response, 'BlogCategory');
}

/**
 * Update a category (admin only)
 * @throws {ValidationError} Invalid category data
 * @throws {NotFoundError} Category not found
 * @throws {AuthorizationError} Not admin
 */
export async function updateCategory(
  categoryId: number,
  data: UpdateCategoryRequest
): Promise<ValidatedBlogCategory> {
  const response = await apiClient.put<BlogCategory>(
    BLOG_ENDPOINTS.UPDATE_CATEGORY(categoryId),
    data
  );
  return validateResponse(BlogCategorySchema, response, 'BlogCategory');
}

/**
 * Delete a category (admin only)
 * @throws {NotFoundError} Category not found
 * @throws {AuthorizationError} Not admin
 */
export async function deleteCategory(categoryId: number): Promise<void> {
  return apiClient.delete(BLOG_ENDPOINTS.DELETE_CATEGORY(categoryId));
}

// ================================================
// BLOG COMMENT API
// ================================================

/**
 * Get comments for a post
 */
export async function getCommentsByPost(
  postId: number,
  params?: {
    page?: number;
    size?: number;
  }
): Promise<PageResponse<BlogComment>> {
  const url = buildUrlWithParams(
    BLOG_ENDPOINTS.GET_COMMENTS_BY_POST(postId),
    params
  );
  return apiClient.get(url);
}

/**
 * Get approved comments for a post
 */
export async function getApprovedComments(
  postId: number,
  params?: {
    page?: number;
    size?: number;
  }
): Promise<PageResponse<BlogComment>> {
  const url = buildUrlWithParams(
    BLOG_ENDPOINTS.GET_APPROVED_COMMENTS(postId),
    params
  );
  return apiClient.get(url);
}

/**
 * Create a comment
 * @throws {ValidationError} Invalid comment data
 * @throws {NotFoundError} Post not found
 * @throws {AuthenticationError} Not authenticated
 */
export async function createComment(
  postId: number,
  data: CreateCommentRequest
): Promise<ValidatedBlogComment> {
  const response = await apiClient.post<BlogComment>(
    BLOG_ENDPOINTS.CREATE_COMMENT(postId),
    data
  );
  return validateResponse(BlogCommentSchema, response, 'BlogComment');
}

/**
 * Update a comment (author only)
 * @throws {ValidationError} Invalid comment data
 * @throws {NotFoundError} Comment not found
 * @throws {AuthorizationError} Not comment author
 */
export async function updateComment(
  commentId: number,
  data: CreateCommentRequest
): Promise<ValidatedBlogComment> {
  const response = await apiClient.put<BlogComment>(
    BLOG_ENDPOINTS.UPDATE_COMMENT(commentId),
    data
  );
  return validateResponse(BlogCommentSchema, response, 'BlogComment');
}

/**
 * Get replies for a comment
 */
export async function getCommentReplies(
  commentId: number
): Promise<BlogComment[]> {
  return apiClient.get(BLOG_ENDPOINTS.GET_COMMENT_REPLIES(commentId));
}

/**
 * Delete a comment
 */
export async function deleteComment(commentId: number): Promise<void> {
  return apiClient.delete(BLOG_ENDPOINTS.DELETE_COMMENT(commentId));
}

/**
 * Approve a comment (moderator only)
 */
export async function approveComment(commentId: number): Promise<BlogComment> {
  return apiClient.post(BLOG_ENDPOINTS.APPROVE_COMMENT(commentId), {});
}

/**
 * Reject a comment (moderator only)
 */
export async function rejectComment(commentId: number): Promise<BlogComment> {
  return apiClient.post(BLOG_ENDPOINTS.REJECT_COMMENT(commentId), {});
}

/**
 * Mark comment as spam (moderator only)
 */
export async function markCommentAsSpam(
  commentId: number
): Promise<BlogComment> {
  return apiClient.post(BLOG_ENDPOINTS.SPAM_COMMENT(commentId), {});
}

/**
 * Escalate comment to admin (moderator only)
 * Sprint 1 - Task 6: Comment Escalation Feature
 *
 * @param commentId - Comment ID to escalate
 * @param reason - Reason for escalation
 * @param priority - Priority level (LOW, MEDIUM, HIGH)
 * @returns Updated comment with ESCALATED status
 */
export async function escalateComment(
  commentId: number,
  reason: string,
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
): Promise<BlogComment> {
  return apiClient.post(BLOG_ENDPOINTS.ESCALATE_COMMENT(commentId), {
    reason,
    priority: priority || 'MEDIUM',
  });
}

// ================================================
// BULK COMMENT MODERATION (Sprint 1 - EPIC 2)
// ================================================

/**
 * Bulk approve multiple comments
 * @param commentIds Array of comment IDs to approve
 * @returns Response with success/failure details
 */
export async function bulkApproveComments(
  commentIds: number[]
): Promise<BulkCommentActionResponse> {
  return apiClient.post(BLOG_ENDPOINTS.BULK_APPROVE_COMMENTS, { commentIds });
}

/**
 * Bulk reject multiple comments
 * @param commentIds Array of comment IDs to reject
 * @param reason Optional rejection reason
 * @returns Response with success/failure details
 */
export async function bulkRejectComments(
  commentIds: number[],
  reason?: string
): Promise<BulkCommentActionResponse> {
  return apiClient.post(BLOG_ENDPOINTS.BULK_REJECT_COMMENTS, {
    commentIds,
    reason,
  });
}

/**
 * Bulk mark multiple comments as spam
 * @param commentIds Array of comment IDs to mark as spam
 * @returns Response with success/failure details
 */
export async function bulkMarkAsSpam(
  commentIds: number[]
): Promise<BulkCommentActionResponse> {
  return apiClient.post(BLOG_ENDPOINTS.BULK_SPAM_COMMENTS, { commentIds });
}

/**
 * Bulk escalate multiple comments to admin
 * Sprint 1 - EPIC 2: Bulk Moderation Operations
 *
 * @param commentIds Array of comment IDs to escalate
 * @param reason Reason for bulk escalation
 * @param priority Priority level for all escalated comments
 * @returns Response with success/failure details
 */
export async function bulkEscalateComments(
  commentIds: number[],
  reason: string,
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'
): Promise<BulkCommentActionResponse> {
  return apiClient.post(BLOG_ENDPOINTS.BULK_ESCALATE_COMMENTS, {
    commentIds,
    reason,
    priority: priority || 'MEDIUM',
  });
}

// ================================================
// TYPE RE-EXPORTS
// ================================================

export type {
  BulkCommentActionResponse,
  FailedCommentAction,
} from '@/types/blog';

/**
 * Get pending comments (admin only)
 */
export async function getPendingComments(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<BlogComment>> {
  const url = buildUrlWithParams(BLOG_ENDPOINTS.GET_PENDING_COMMENTS, params);
  return apiClient.get(url);
}

/**
 * Get comments by status (admin only)
 */
export async function getCommentsByStatus(
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM',
  params?: {
    page?: number;
    size?: number;
  }
): Promise<PageResponse<BlogComment>> {
  const url = buildUrlWithParams(BLOG_ENDPOINTS.GET_COMMENTS_BY_STATUS, {
    ...params,
    status,
  });
  return apiClient.get(url);
}

/**
 * Get user's comments
 */
export async function getUserComments(
  userId: string,
  params?: {
    page?: number;
    size?: number;
  }
): Promise<PageResponse<BlogComment>> {
  const url = buildUrlWithParams(
    BLOG_ENDPOINTS.GET_USER_COMMENTS(userId),
    params
  );
  return apiClient.get(url);
}

/**
 * Reply to a comment
 */
export async function replyToComment(
  postId: number,
  parentCommentId: number,
  data: CreateCommentRequest
): Promise<BlogComment> {
  return apiClient.post(BLOG_ENDPOINTS.CREATE_COMMENT(postId), {
    ...data,
    parentId: parentCommentId,
  });
}

/**
 * Report a comment
 */
export async function reportComment(
  commentId: number,
  reason: string
): Promise<void> {
  return apiClient.post(BLOG_ENDPOINTS.REPORT_COMMENT(commentId), {
    reason,
  });
}

/**
 * Get comment count for a post
 */
export async function getCommentCount(postId: number): Promise<number> {
  return apiClient.get(BLOG_ENDPOINTS.COUNT_COMMENTS(postId));
}

// ================================================
// ADMIN API
// ================================================

/**
 * Get all posts (admin only)
 */
export async function getAllPosts(params?: {
  page?: number;
  size?: number;
}): Promise<PageResponse<BlogPostSummary>> {
  const url = buildUrlWithParams(BLOG_ENDPOINTS.ADMIN_ALL_POSTS, params);
  return apiClient.get(url);
}

/**
 * Get posts by status (admin only)
 */
export async function getPostsByStatus(
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'SCHEDULED',
  params?: {
    page?: number;
    size?: number;
  }
): Promise<PageResponse<BlogPostSummary>> {
  const url = buildUrlWithParams(
    BLOG_ENDPOINTS.ADMIN_BY_STATUS(status),
    params
  );
  return apiClient.get(url);
}

/**
 * Get blog statistics (admin only)
 */
export async function getBlogStatistics(): Promise<BlogStatistics> {
  return apiClient.get(BLOG_ENDPOINTS.ADMIN_STATISTICS);
}

// ================================================
// EXPORTS
// ================================================

export const blogApi = {
  // Posts
  getPublishedPosts,
  getPostBySlug,
  getPostById,
  searchPosts,
  getPostsByCategory,
  getPostsByTag,
  getPostsByAuthor,
  getFeaturedPosts,
  getTrendingPosts,
  getMostViewedPosts,
  getMostCommentedPosts,
  getRelatedPosts,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  schedulePost,
  unpublishPost,
  archivePost,
  incrementViewCount,
  getMyPosts,
  getMyDrafts,

  // Categories
  getCategories,
  getCategoryBySlug,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,

  // Comments
  getCommentsByPost,
  getApprovedComments,
  createComment,
  updateComment,
  getCommentReplies,
  deleteComment,
  approveComment,
  rejectComment,
  markCommentAsSpam,
  getPendingComments,
  getCommentsByStatus,
  getUserComments,
  replyToComment,
  reportComment,
  getCommentCount,

  // Admin
  getAllPosts,
  getPostsByStatus,
  getBlogStatistics,
};

export default blogApi;
