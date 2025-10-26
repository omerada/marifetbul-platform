/**
 * ================================================
 * CATEGORY API CLIENT
 * ================================================
 * Client functions for Category API endpoints
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { apiClient } from '../infrastructure/api/client';
import type { Category } from '@/types/business/features/marketplace-categories';

// ================================================
// PUBLIC CATEGORY ENDPOINTS
// ================================================

/**
 * Get all categories
 * GET /api/v1/categories
 */
export const getAllCategories = async (): Promise<Category[]> => {
  return await apiClient.get<Category[]>('/categories');
};

/**
 * Get category by ID
 * GET /api/v1/categories/{id}
 */
export const getCategoryById = async (categoryId: string): Promise<Category> => {
  return await apiClient.get<Category>(`/categories/${categoryId}`);
};

/**
 * Get category tree (hierarchical structure)
 * GET /api/v1/categories/tree
 */
export const getCategoryTree = async (): Promise<Category[]> => {
  return await apiClient.get<Category[]>('/categories/tree');
};

/**
 * Get root categories (top-level only)
 * GET /api/v1/categories/roots
 */
export const getRootCategories = async (): Promise<Category[]> => {
  return await apiClient.get<Category[]>('/categories/roots');
};

/**
 * Get children of a category
 * GET /api/v1/categories/{id}/children
 */
export const getCategoryChildren = async (categoryId: string): Promise<Category[]> => {
  return await apiClient.get<Category[]>(`/categories/${categoryId}/children`);
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
