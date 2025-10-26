/**
 * ================================================
 * CATEGORY API CLIENT
 * ================================================
 * Client functions for Category API endpoints
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 4: API Standardization
 */

import { apiClient } from '../infrastructure/api/client';
import {
  validateResponse,
  CategorySchema,
  CategoryWithSubcategoriesSchema,
} from './validators';
import type {
  Category as ValidatedCategory,
  CategoryWithSubcategories,
} from './validators';
import type { Category } from '@/types/business/features/marketplace-categories';

// ================================================
// PUBLIC CATEGORY ENDPOINTS
// ================================================

/**
 * Get all categories
 * GET /api/v1/categories
 * @throws {ValidationError} Invalid response format
 */
export const getAllCategories = async (): Promise<ValidatedCategory[]> => {
  const response = await apiClient.get<Category[]>('/categories');
  return response.map((cat) =>
    validateResponse(CategorySchema, cat, 'Category')
  );
};

/**
 * Get category by ID
 * GET /api/v1/categories/{id}
 * @throws {NotFoundError} Category not found
 * @throws {ValidationError} Invalid response format
 */
export const getCategoryById = async (
  categoryId: string
): Promise<ValidatedCategory> => {
  const response = await apiClient.get<Category>(`/categories/${categoryId}`);
  return validateResponse(CategorySchema, response, 'Category');
};

/**
 * Get category tree (hierarchical structure)
 * GET /api/v1/categories/tree
 * @throws {ValidationError} Invalid response format
 */
export const getCategoryTree = async (): Promise<
  CategoryWithSubcategories[]
> => {
  const response = await apiClient.get<Category[]>('/categories/tree');
  return response.map((cat) =>
    validateResponse(CategoryWithSubcategoriesSchema, cat, 'Category')
  );
};

/**
 * Get root categories (top-level only)
 * GET /api/v1/categories/roots
 * @throws {ValidationError} Invalid response format
 */
export const getRootCategories = async (): Promise<ValidatedCategory[]> => {
  const response = await apiClient.get<Category[]>('/categories/roots');
  return response.map((cat) =>
    validateResponse(CategorySchema, cat, 'Category')
  );
};

/**
 * Get children of a category
 * GET /api/v1/categories/{id}/children
 * @throws {NotFoundError} Category not found
 * @throws {ValidationError} Invalid response format
 */
export const getCategoryChildren = async (
  categoryId: string
): Promise<ValidatedCategory[]> => {
  const response = await apiClient.get<Category[]>(
    `/categories/${categoryId}/children`
  );
  return response.map((cat) =>
    validateResponse(CategorySchema, cat, 'Category')
  );
};

// ================================================
// CATEGORY API OBJECT
// ================================================

export const categoryApi = {
  getAllCategories,
  getCategoryById,
  getCategoryTree,
  getRootCategories,
  getCategoryChildren,
};

export default categoryApi;
