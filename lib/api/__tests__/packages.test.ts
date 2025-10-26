/**
 * ================================================
 * PACKAGES API - UNIT TESTS
 * ================================================
 * Unit tests for standardized packages API service
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 5
 */

import {
  getPackageById,
  getPackageBySlug,
  getMyPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from '../packages';
import { apiClient } from '../../infrastructure/api/client';
import type {
  Package,
  PackageSummary,
} from '../../../types/business/features/package';

// Type for pagination response
interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
  isFirst: boolean;
}

// Mock apiClient
jest.mock('../../infrastructure/api/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

describe('Packages API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // MOCK DATA
  // ============================================================================

  const mockPackage: Package = {
    id: 'package-123',
    title: 'Professional Web Development',
    slug: 'professional-web-development',
    description: 'Full-stack web development service with modern technologies',
    categoryId: 'cat-1',
    category: {
      id: 'cat-1',
      name: 'Web Development',
      slug: 'web-development',
    },
    sellerId: 'seller-123',
    seller: {
      id: 'seller-123',
      username: 'johndoe',
      fullName: 'John Doe',
      avatarUrl: 'https://example.com/avatar.jpg',
      rating: 4.8,
      reviewCount: 150,
      isVerified: true,
    },
    basicTier: {
      price: 500,
      deliveryDays: 7,
      revisionCount: 2,
      features: ['Responsive Design', '3 Pages'],
      isActive: true,
    },
    standardTier: {
      price: 1000,
      deliveryDays: 14,
      revisionCount: 5,
      features: ['Responsive Design', '5 Pages', 'SEO Optimization'],
      isActive: true,
    },
    premiumTier: {
      price: 2000,
      deliveryDays: 21,
      revisionCount: 10,
      features: ['Responsive Design', '10 Pages', 'SEO', 'E-commerce'],
      isActive: true,
    },
    highlights: ['Fast Delivery', 'Quality Code', '24/7 Support'],
    deliverables: ['Source Code', 'Documentation', 'Deployment'],
    requirements: ['Design Mockups', 'Content', 'Logo'],
    images: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg',
    ],
    videoUrl: 'https://youtube.com/watch?v=123',
    status: 'ACTIVE',
    isFeatured: true,
    isVerified: true,
    views: 1250,
    orders: 45,
    rating: 4.9,
    reviewCount: 38,
    metaDescription: 'Professional web development service',
    keywords: ['web', 'development', 'react', 'nodejs'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-10-20T15:30:00Z',
  };

  const mockPackageSummary: PackageSummary = {
    id: 'package-123',
    title: 'Professional Web Development',
    slug: 'professional-web-development',
    description: 'Professional web dev service',
    categoryId: 'cat-1',
    categoryName: 'Web Development',
    sellerId: 'seller-123',
    sellerName: 'John Doe',
    sellerAvatar: 'https://example.com/avatar.jpg',
    sellerRating: 4.8,
    basicPrice: 500,
    standardPrice: 1000,
    premiumPrice: 2000,
    coverImage: 'https://example.com/image1.jpg',
    status: 'ACTIVE',
    isFeatured: true,
    isVerified: true,
    views: 1250,
    orders: 45,
    rating: 4.9,
    reviewCount: 38,
    createdAt: '2024-01-15T10:00:00Z',
  };

  // ============================================================================
  // GET PACKAGE BY ID
  // ============================================================================

  describe('getPackageById', () => {
    it('should fetch a package by ID', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockPackage);

      const result = await getPackageById('package-123');

      expect(apiClient.get).toHaveBeenCalledWith('/packages/package-123');
      expect(result).toEqual(mockPackage);
      expect(result.id).toBe('package-123');
      expect(result.title).toBe('Professional Web Development');
    });

    it('should handle not found errors', async () => {
      const error = new Error('Package not found');
      error.name = 'NotFoundError';
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(getPackageById('invalid-id')).rejects.toThrow(
        'Package not found'
      );
    });

    it('should validate package response structure', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockPackage);

      const result = await getPackageById('package-123');

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('pricing');
      expect(result).toHaveProperty('seller');
      expect(result.pricing).toHaveProperty('basic');
      expect(result.pricing).toHaveProperty('standard');
      expect(result.pricing).toHaveProperty('premium');
    });
  });

  // ============================================================================
  // GET PACKAGE BY SLUG
  // ============================================================================

  describe('getPackageBySlug', () => {
    it('should fetch a package by slug', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockPackage);

      const result = await getPackageBySlug('professional-web-development');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/packages/slug/professional-web-development'
      );
      expect(result).toEqual(mockPackage);
      expect(result.slug).toBe('professional-web-development');
    });

    it('should handle not found errors for invalid slug', async () => {
      const error = new Error('Package not found');
      error.name = 'NotFoundError';
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(getPackageBySlug('nonexistent-package')).rejects.toThrow(
        'Package not found'
      );
    });

    it('should work with URL-encoded slugs', async () => {
      (apiClient.get as jest.Mock).mockResolvedValue(mockPackage);

      const result = await getPackageBySlug('web-development-services');

      expect(apiClient.get).toHaveBeenCalledWith(
        '/packages/slug/web-development-services'
      );
      expect(result).toEqual(mockPackage);
    });
  });

  // ============================================================================
  // GET MY PACKAGES
  // ============================================================================

  describe('getMyPackages', () => {
    it('should fetch my packages with default pagination', async () => {
      const mockResponse: PaginatedResponse<PackageSummary> = {
        content: [mockPackageSummary],
        page: 0,
        size: 20,
        totalElements: 1,
        totalPages: 1,
        isLast: true,
        isFirst: true,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getMyPackages();

      expect(apiClient.get).toHaveBeenCalledWith(
        '/seller/packages',
        expect.any(Object)
      );
      expect(result.content).toHaveLength(1);
      expect(result.content[0]).toEqual(mockPackageSummary);
      expect(result.page).toBe(0);
      expect(result.size).toBe(20);
    });

    it('should fetch my packages with custom pagination', async () => {
      const mockResponse: PaginatedResponse<PackageSummary> = {
        content: [mockPackageSummary],
        page: 1,
        size: 10,
        totalElements: 15,
        totalPages: 2,
        isLast: false,
        isFirst: false,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await getMyPackages({
        page: 1,
        size: 10,
        sortBy: 'PRICE',
        sortDir: 'ASC',
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        '/seller/packages',
        expect.objectContaining({
          page: '1',
          size: '10',
          sortBy: 'PRICE',
          sortDir: 'ASC',
        })
      );
      expect(result.page).toBe(1);
      expect(result.size).toBe(10);
    });

    it('should handle empty package list', async () => {
      const emptyResponse: PaginatedResponse<PackageSummary> = {
        content: [],
        page: 0,
        size: 20,
        totalElements: 0,
        totalPages: 0,
        isLast: true,
        isFirst: true,
      };

      (apiClient.get as jest.Mock).mockResolvedValue(emptyResponse);

      const result = await getMyPackages();

      expect(result.content).toHaveLength(0);
      expect(result.totalElements).toBe(0);
    });

    it('should handle authentication errors', async () => {
      const error = new Error('Not authenticated');
      error.name = 'AuthenticationError';
      (apiClient.get as jest.Mock).mockRejectedValue(error);

      await expect(getMyPackages()).rejects.toThrow('Not authenticated');
    });
  });

  // ============================================================================
  // CREATE PACKAGE
  // ============================================================================

  describe('createPackage', () => {
    it('should create a package successfully', async () => {
      const request: CreatePackageRequest = {
        title: 'Professional Web Development',
        description: 'Full-stack web development service',
        shortDescription: 'Professional web dev',
        categoryId: 'cat-1',
        subcategoryId: 'subcat-1',
        pricing: {
          basic: {
            name: 'Basic',
            description: 'Basic website',
            price: 500,
            deliveryDays: 7,
            revisions: 2,
            features: ['Responsive Design', '3 Pages'],
          },
        },
        tags: ['React', 'Node.js'],
      };

      const createdPackage = {
        ...mockPackage,
        status: 'DRAFT' as const,
      };

      (apiClient.post as jest.Mock).mockResolvedValue(createdPackage);

      const result = await createPackage(request);

      expect(apiClient.post).toHaveBeenCalledWith('/seller/packages', request);
      expect(result.title).toBe('Professional Web Development');
      expect(result.status).toBe('DRAFT');
    });

    it('should handle validation errors for missing required fields', async () => {
      const error = new Error('Title is required');
      error.name = 'ValidationError';
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(
        createPackage({
          title: '',
          description: 'Test',
          shortDescription: 'Test',
          categoryId: 'cat-1',
          pricing: {} as any,
        })
      ).rejects.toThrow('Title is required');
    });

    it('should handle validation errors for invalid pricing', async () => {
      const error = new Error('Invalid pricing structure');
      error.name = 'ValidationError';
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(
        createPackage({
          title: 'Test Package',
          description: 'Test',
          shortDescription: 'Test',
          categoryId: 'cat-1',
          pricing: {
            basic: {
              name: 'Basic',
              description: 'Basic',
              price: -100, // Invalid negative price
              deliveryDays: 7,
              revisions: 2,
              features: [],
            },
          },
        })
      ).rejects.toThrow('Invalid pricing structure');
    });

    it('should handle authentication errors', async () => {
      const error = new Error('Not authenticated');
      error.name = 'AuthenticationError';
      (apiClient.post as jest.Mock).mockRejectedValue(error);

      await expect(
        createPackage({
          title: 'Test',
          description: 'Test',
          shortDescription: 'Test',
          categoryId: 'cat-1',
          pricing: {} as any,
        })
      ).rejects.toThrow('Not authenticated');
    });
  });

  // ============================================================================
  // UPDATE PACKAGE
  // ============================================================================

  describe('updatePackage', () => {
    it('should update a package successfully', async () => {
      const updateData: UpdatePackageRequest = {
        title: 'Updated Web Development Service',
        shortDescription: 'Updated description',
        featured: true,
      };

      const updatedPackage = { ...mockPackage, ...updateData };
      (apiClient.put as jest.Mock).mockResolvedValue(updatedPackage);

      const result = await updatePackage('package-123', updateData);

      expect(apiClient.put).toHaveBeenCalledWith(
        '/seller/packages/package-123',
        updateData
      );
      expect(result.title).toBe('Updated Web Development Service');
      expect(result.featured).toBe(true);
    });

    it('should handle not found errors', async () => {
      const error = new Error('Package not found');
      error.name = 'NotFoundError';
      (apiClient.put as jest.Mock).mockRejectedValue(error);

      await expect(
        updatePackage('invalid-id', { title: 'Updated' })
      ).rejects.toThrow('Package not found');
    });

    it('should handle authorization errors for non-owner', async () => {
      const error = new Error('Not package owner');
      error.name = 'AuthorizationError';
      (apiClient.put as jest.Mock).mockRejectedValue(error);

      await expect(
        updatePackage('package-123', { title: 'Updated' })
      ).rejects.toThrow('Not package owner');
    });

    it('should allow partial updates', async () => {
      const partialUpdate: UpdatePackageRequest = {
        featured: false,
      };

      const updatedPackage = { ...mockPackage, featured: false };
      (apiClient.put as jest.Mock).mockResolvedValue(updatedPackage);

      const result = await updatePackage('package-123', partialUpdate);

      expect(result.featured).toBe(false);
      expect(result.title).toBe(mockPackage.title); // Unchanged
    });
  });

  // ============================================================================
  // DELETE PACKAGE
  // ============================================================================

  describe('deletePackage', () => {
    it('should delete a package successfully', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValue(undefined);

      await deletePackage('package-123');

      expect(apiClient.delete).toHaveBeenCalledWith(
        '/seller/packages/package-123'
      );
    });

    it('should handle not found errors', async () => {
      const error = new Error('Package not found');
      error.name = 'NotFoundError';
      (apiClient.delete as jest.Mock).mockRejectedValue(error);

      await expect(deletePackage('invalid-id')).rejects.toThrow(
        'Package not found'
      );
    });

    it('should handle authorization errors', async () => {
      const error = new Error('Not package owner');
      error.name = 'AuthorizationError';
      (apiClient.delete as jest.Mock).mockRejectedValue(error);

      await expect(deletePackage('package-123')).rejects.toThrow(
        'Not package owner'
      );
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

      await expect(getPackageById('package-123')).rejects.toThrow(
        'Request timeout'
      );
    });

    it('should handle server errors', async () => {
      const serverError = new Error('Internal server error');
      serverError.name = 'ServerError';
      (apiClient.post as jest.Mock).mockRejectedValue(serverError);

      await expect(
        createPackage({
          title: 'Test',
          description: 'Test',
          shortDescription: 'Test',
          categoryId: 'cat-1',
          pricing: {} as any,
        })
      ).rejects.toThrow('Internal server error');
    });

    it('should handle rate limiting', async () => {
      const rateLimitError = new Error('Too many requests');
      rateLimitError.name = 'RateLimitError';
      (apiClient.get as jest.Mock).mockRejectedValue(rateLimitError);

      await expect(getMyPackages()).rejects.toThrow('Too many requests');
    });
  });
});
