/**
 * ================================================
 * BLOG API - UNIT TESTS
 * ================================================
 * Unit tests for standardized blog API service
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 5
 */

import {
  getPostBySlug,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  createCategory,
  createComment,
  getCategoryById,
} from '../blog';
import { apiClient } from '../../infrastructure/api/client';
import type {
  BlogPost,
  BlogCategory,
  BlogComment,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  CreateCategoryRequest,
  CreateCommentRequest,
} from '../blog';

// Mock apiClient
jest.mock('../../infrastructure/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Blog API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // MOCK DATA
  // ============================================================================

  const mockAuthor = {
    id: 'author-123',
    username: 'johndoe',
    fullName: 'John Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  const mockCategory: BlogCategory = {
    id: 1,
    name: 'Technology',
    slug: 'technology',
    description: 'Tech articles and tutorials',
    postCount: 42,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  const mockPost: BlogPost = {
    id: 1,
    slug: 'intro-to-typescript',
    title: 'Introduction to TypeScript',
    excerpt: 'Learn TypeScript basics in this comprehensive guide',
    content:
      '# Introduction to TypeScript\n\nTypeScript is a typed superset of JavaScript...',
    coverImageUrl: 'https://example.com/cover.jpg',
    status: 'PUBLISHED',
    featured: true,
    viewCount: 1250,
    commentCount: 15,
    readingTime: 8,
    publishedAt: '2025-01-15T10:00:00Z',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    category: mockCategory,
    author: mockAuthor,
    tags: [
      { id: 1, name: 'TypeScript', slug: 'typescript', usageCount: 50 },
      { id: 2, name: 'JavaScript', slug: 'javascript', usageCount: 100 },
    ],
    metaTitle: 'Introduction to TypeScript | Blog',
    metaDescription: 'Learn TypeScript basics',
    metaKeywords: 'typescript, javascript, programming',
  };

  const mockComment: BlogComment = {
    id: 1,
    content: 'Great article! Very helpful.',
    status: 'APPROVED',
    author: mockAuthor,
    replies: [],
    createdAt: '2025-01-16T10:00:00Z',
    updatedAt: '2025-01-16T10:00:00Z',
    approvedAt: '2025-01-16T11:00:00Z',
    depth: 0,
  };

  // ============================================================================
  // GET POST BY SLUG
  // ============================================================================

  describe('getPostBySlug', () => {
    it('should fetch a post by slug', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockPost);

      const result = await getPostBySlug('intro-to-typescript');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/blog/posts/slug/intro-to-typescript'
      );
      expect(result).toEqual(mockPost);
      expect(result.slug).toBe('intro-to-typescript');
    });

    it('should handle not found errors', async () => {
      const error = new Error('Post not found');
      error.name = 'NotFoundError';
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(getPostBySlug('nonexistent-slug')).rejects.toThrow(
        'Post not found'
      );
    });

    it('should handle validation errors', async () => {
      const invalidPost = { ...mockPost, title: '' }; // Invalid: empty title
      (apiClient.get as jest.Mock).mockResolvedValue(invalidPost);

      await expect(getPostBySlug('invalid-post')).rejects.toThrow();
    });
  });

  // ============================================================================
  // GET POST BY ID
  // ============================================================================

  describe('getPostById', () => {
    it('should fetch a post by ID', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockPost);

      const result = await getPostById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/blog/posts/1');
      expect(result).toEqual(mockPost);
      expect(result.id).toBe(1);
    });

    it('should handle not found errors', async () => {
      const error = new Error('Post not found');
      error.name = 'NotFoundError';
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(getPostById(99999)).rejects.toThrow('Post not found');
    });
  });

  // ============================================================================
  // CREATE POST
  // ============================================================================

  describe('createPost', () => {
    it('should create a blog post successfully', async () => {
      const request: CreateBlogPostRequest = {
        title: 'Introduction to TypeScript',
        excerpt: 'Learn TypeScript basics',
        content: '# Introduction\n\nTypeScript is great...',
        categoryId: 1,
        tagIds: [1, 2],
        featured: true,
        status: 'DRAFT',
        metaTitle: 'TypeScript Tutorial',
        metaDescription: 'Learn TypeScript',
      };

      const draftPost = { ...mockPost, status: 'DRAFT' as const };
      (apiClient.post as jest.Mock).mockResolvedValue(draftPost);

      const result = await createPost(request);

      expect(apiClient.post).toHaveBeenCalledWith('/blog/posts', request);
      expect(result.title).toBe('Introduction to TypeScript');
      expect(result.status).toBe('DRAFT');
    });

    it('should handle validation errors for empty title', async () => {
      const error = new Error('Title is required');
      error.name = 'ValidationError';
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(
        createPost({
          title: '',
          excerpt: 'Valid excerpt',
          content: 'Valid content',
          categoryId: 1,
        })
      ).rejects.toThrow('Title is required');
    });

    it('should handle authentication errors', async () => {
      const error = new Error('Not authenticated');
      error.name = 'AuthenticationError';
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(
        createPost({
          title: 'Test Post',
          excerpt: 'Test excerpt',
          content: 'Test content',
          categoryId: 1,
        })
      ).rejects.toThrow('Not authenticated');
    });

    it('should handle authorization errors', async () => {
      const error = new Error('Not authorized to create posts');
      error.name = 'AuthorizationError';
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(
        createPost({
          title: 'Test Post',
          excerpt: 'Test excerpt',
          content: 'Test content',
          categoryId: 1,
        })
      ).rejects.toThrow('Not authorized to create posts');
    });
  });

  // ============================================================================
  // UPDATE POST
  // ============================================================================

  describe('updatePost', () => {
    it('should update a post successfully', async () => {
      const updateData: UpdateBlogPostRequest = {
        title: 'Updated Title',
        excerpt: 'Updated excerpt',
        featured: false,
      };

      const updatedPost = { ...mockPost, ...updateData };
      (apiClient.put as jest.Mock).mockResolvedValue(updatedPost);

      const result = await updatePost(1, updateData);

      expect(apiClient.put).toHaveBeenCalledWith('/blog/posts/1', updateData);
      expect(result.title).toBe('Updated Title');
      expect(result.featured).toBe(false);
    });

    it('should handle not found errors', async () => {
      const error = new Error('Post not found');
      error.name = 'NotFoundError';
      (apiClient.put as jest.Mock).mockRejectedValue(error);

      await expect(updatePost(99999, { title: 'Updated' })).rejects.toThrow(
        'Post not found'
      );
    });

    it('should handle authorization errors', async () => {
      const error = new Error('Not post author');
      error.name = 'AuthorizationError';
      (apiClient.put as jest.Mock).mockRejectedValue(error);

      await expect(updatePost(1, { title: 'Updated' })).rejects.toThrow(
        'Not post author'
      );
    });
  });

  // ============================================================================
  // DELETE POST
  // ============================================================================

  describe('deletePost', () => {
    it('should delete a post successfully', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue(undefined);

      await deletePost(1);

      expect(apiClient.delete).toHaveBeenCalledWith('/blog/posts/1');
    });

    it('should handle not found errors', async () => {
      const error = new Error('Post not found');
      error.name = 'NotFoundError';
      (apiClient.delete as jest.Mock).mockRejectedValue(error);

      await expect(deletePost(99999)).rejects.toThrow('Post not found');
    });

    it('should handle authorization errors', async () => {
      const error = new Error('Not post author');
      error.name = 'AuthorizationError';
      (apiClient.delete as jest.Mock).mockRejectedValue(error);

      await expect(deletePost(1)).rejects.toThrow('Not post author');
    });
  });

  // ============================================================================
  // PUBLISH POST
  // ============================================================================

  describe('publishPost', () => {
    it('should publish a post successfully', async () => {
      const publishedPost = {
        ...mockPost,
        status: 'PUBLISHED' as const,
        publishedAt: '2025-01-20T10:00:00Z',
      };
      (apiClient.post as jest.Mock).mockResolvedValue(publishedPost);

      const result = await publishPost(1);

      expect(apiClient.post).toHaveBeenCalledWith('/blog/posts/1/publish', {});
      expect(result.status).toBe('PUBLISHED');
      expect(result.publishedAt).toBeDefined();
    });

    it('should handle not found errors', async () => {
      const error = new Error('Post not found');
      error.name = 'NotFoundError';
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(publishPost(99999)).rejects.toThrow('Post not found');
    });

    it('should handle authorization errors', async () => {
      const error = new Error('Not post author');
      error.name = 'AuthorizationError';
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(publishPost(1)).rejects.toThrow('Not post author');
    });

    it('should handle validation errors for incomplete posts', async () => {
      const error = new Error('Post not ready for publishing');
      error.name = 'ValidationError';
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(publishPost(1)).rejects.toThrow(
        'Post not ready for publishing'
      );
    });
  });

  // ============================================================================
  // CREATE CATEGORY
  // ============================================================================

  describe('createCategory', () => {
    it('should create a category successfully', async () => {
      const request: CreateCategoryRequest = {
        name: 'Web Development',
        slug: 'web-development',
        description: 'Articles about web development',
      };

      const newCategory: BlogCategory = {
        id: 2,
        name: 'Web Development',
        slug: 'web-development',
        description: 'Articles about web development',
        postCount: 0,
        createdAt: '2025-01-20T10:00:00Z',
        updatedAt: '2025-01-20T10:00:00Z',
      };

      (apiClient.post as jest.Mock).mockResolvedValue(newCategory);

      const result = await createCategory(request);

      expect(apiClient.post).toHaveBeenCalledWith('/blog/categories', request);
      expect(result.name).toBe('Web Development');
      expect(result.slug).toBe('web-development');
      expect(result.postCount).toBe(0);
    });

    it('should handle validation errors', async () => {
      const error = new Error('Category name is required');
      error.name = 'ValidationError';
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(
        createCategory({
          name: '',
          description: 'Valid description',
        })
      ).rejects.toThrow('Category name is required');
    });

    it('should handle authorization errors for non-admin users', async () => {
      const error = new Error('Admin access required');
      error.name = 'AuthorizationError';
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(
        createCategory({
          name: 'New Category',
          description: 'Test',
        })
      ).rejects.toThrow('Admin access required');
    });

    it('should handle conflict errors for duplicate slugs', async () => {
      const error = new Error('Category slug already exists');
      error.name = 'ConflictError';
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(
        createCategory({
          name: 'Technology',
          slug: 'technology',
          description: 'Duplicate slug',
        })
      ).rejects.toThrow('Category slug already exists');
    });
  });

  // ============================================================================
  // CREATE COMMENT
  // ============================================================================

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      const request: CreateCommentRequest = {
        content: 'Great article! Very informative.',
      };

      const newComment: BlogComment = {
        ...mockComment,
        id: 2,
        content: 'Great article! Very informative.',
        status: 'PENDING',
        approvedAt: undefined,
      };

      (apiClient.post as jest.Mock).mockResolvedValue(newComment);

      const result = await createComment(1, request);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/blog/posts/1/comments',
        request
      );
      expect(result.content).toBe('Great article! Very informative.');
      expect(result.status).toBe('PENDING');
    });

    it('should create a reply to a comment', async () => {
      const request: CreateCommentRequest = {
        content: 'Thanks for your feedback!',
        parentId: 1,
      };

      const reply: BlogComment = {
        ...mockComment,
        id: 3,
        content: 'Thanks for your feedback!',
        parentId: 1,
        depth: 1,
      };

      (apiClient.post as jest.Mock).mockResolvedValue(reply);

      const result = await createComment(1, request);

      expect(apiClient.post).toHaveBeenCalledWith(
        '/blog/posts/1/comments',
        request
      );
      expect(result.content).toBe('Thanks for your feedback!');
      expect(result.parentId).toBe(1);
      expect(result.depth).toBe(1);
    });

    it('should handle validation errors for empty content', async () => {
      const error = new Error('Comment content is required');
      error.name = 'ValidationError';
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(createComment(1, { content: '' })).rejects.toThrow(
        'Comment content is required'
      );
    });

    it('should handle authentication errors', async () => {
      const error = new Error('Not authenticated');
      error.name = 'AuthenticationError';
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(
        createComment(1, { content: 'Test comment' })
      ).rejects.toThrow('Not authenticated');
    });

    it('should handle not found errors for invalid post', async () => {
      const error = new Error('Post not found');
      error.name = 'NotFoundError';
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(
        createComment(99999, { content: 'Test comment' })
      ).rejects.toThrow('Post not found');
    });
  });

  // ============================================================================
  // GET CATEGORY BY ID
  // ============================================================================

  describe('getCategoryById', () => {
    it('should fetch a category by ID', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockCategory);

      const result = await getCategoryById(1);

      expect(apiClient.get).toHaveBeenCalledWith('/blog/categories/1');
      expect(result).toEqual(mockCategory);
      expect(result.id).toBe(1);
      expect(result.slug).toBe('technology');
    });

    it('should handle not found errors', async () => {
      const error = new Error('Category not found');
      error.name = 'NotFoundError';
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(getCategoryById(99999)).rejects.toThrow(
        'Category not found'
      );
    });

    it('should handle validation errors for invalid response', async () => {
      const invalidCategory = { ...mockCategory, name: '' }; // Invalid: empty name
      (apiClient.get as jest.Mock).mockResolvedValue(invalidCategory);

      await expect(getCategoryById(1)).rejects.toThrow();
    });
  });

  // ============================================================================
  // ERROR HANDLING
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle network timeouts', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError.name = 'TimeoutError';
      (apiClient.get as jest.Mock).mockRejectedValue(timeoutError);

      await expect(getPostById(1)).rejects.toThrow('Request timeout');
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error');
      serverError.name = 'ServerError';
      (apiClient.post as jest.Mock).mockRejectedValue(serverError);

      await expect(
        createPost({
          title: 'Test',
          excerpt: 'Test',
          content: 'Test',
          categoryId: 1,
        })
      ).rejects.toThrow('Internal server error');
    });

    it('should handle rate limiting', async () => {
      const rateLimitError = new Error('Too many requests');
      rateLimitError.name = 'RateLimitError';
      (apiClient.post as jest.Mock).mockRejectedValue(rateLimitError);

      await expect(
        createComment(1, { content: 'Test comment' })
      ).rejects.toThrow('Too many requests');
    });
  });
});
