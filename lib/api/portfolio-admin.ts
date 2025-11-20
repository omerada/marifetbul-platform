/**
 * ================================================
 * PORTFOLIO ADMIN API CLIENT
 * ================================================
 * API client for portfolio moderation endpoints
 *
 * Sprint 1: Portfolio Approval System
 * Production-ready, type-safe implementation
 *
 * @author MarifetBul Development Team
 * @version 1.0
 * @since 2025-11-20
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import { PORTFOLIO_ENDPOINTS } from './endpoints';
import type {
  PortfolioResponse,
  PageResponse,
  BulkActionResult,
  PortfolioStatistics,
} from '@/types/business/features/portfolio';

// ================================================
// REQUEST TYPES
// ================================================

export interface RejectPortfolioRequest {
  reason: string;
  moderationNotes?: string;
}

export interface BulkPortfolioActionRequest {
  portfolioIds: string[];
}

export interface BulkRejectPortfolioRequest {
  portfolioIds: string[];
  reason: string;
}

// ================================================
// API CLIENT
// ================================================

export const portfolioAdminApi = {
  /**
   * Get pending portfolios awaiting moderation
   *
   * @param page Page number (0-based)
   * @param size Page size
   * @param sortBy Sort field
   * @param sortDir Sort direction
   * @returns Page of pending portfolios
   */
  async getPendingPortfolios(
    page: number = 0,
    size: number = 20,
    sortBy: string = 'createdAt',
    sortDir: 'ASC' | 'DESC' = 'ASC'
  ): Promise<PageResponse<PortfolioResponse>> {
    const response = await apiClient.get(
      PORTFOLIO_ENDPOINTS.ADMIN_PENDING_PORTFOLIOS,
      {
        params: { page, size, sortBy, sortDir },
      }
    );
    return response.data.data;
  },

  /**
   * Get portfolios by status
   *
   * @param status Portfolio status (PENDING, APPROVED, REJECTED)
   * @param page Page number
   * @param size Page size
   * @returns Page of portfolios
   */
  async getPortfoliosByStatus(
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<PortfolioResponse>> {
    const response = await apiClient.get(
      PORTFOLIO_ENDPOINTS.ADMIN_PORTFOLIOS_BY_STATUS(status),
      { params: { page, size } }
    );
    return response.data.data;
  },

  /**
   * Approve a portfolio
   *
   * @param portfolioId Portfolio ID
   * @returns Approved portfolio
   */
  async approvePortfolio(portfolioId: string): Promise<PortfolioResponse> {
    const response = await apiClient.post(
      PORTFOLIO_ENDPOINTS.ADMIN_APPROVE_PORTFOLIO(portfolioId)
    );
    return response.data.data;
  },

  /**
   * Reject a portfolio
   *
   * @param portfolioId Portfolio ID
   * @param request Rejection details
   * @returns Rejected portfolio
   */
  async rejectPortfolio(
    portfolioId: string,
    request: RejectPortfolioRequest
  ): Promise<PortfolioResponse> {
    const response = await apiClient.post(
      PORTFOLIO_ENDPOINTS.ADMIN_REJECT_PORTFOLIO(portfolioId),
      request
    );
    return response.data.data;
  },

  /**
   * Bulk approve portfolios
   *
   * @param portfolioIds List of portfolio IDs
   * @returns Bulk action result
   */
  async bulkApprovePortfolios(
    portfolioIds: string[]
  ): Promise<BulkActionResult> {
    const response = await apiClient.post(
      PORTFOLIO_ENDPOINTS.ADMIN_BULK_APPROVE_PORTFOLIOS,
      { portfolioIds }
    );
    return response.data.data;
  },

  /**
   * Bulk reject portfolios
   *
   * @param portfolioIds List of portfolio IDs
   * @param reason Common rejection reason
   * @returns Bulk action result
   */
  async bulkRejectPortfolios(
    portfolioIds: string[],
    reason: string
  ): Promise<BulkActionResult> {
    const response = await apiClient.post(
      PORTFOLIO_ENDPOINTS.ADMIN_BULK_REJECT_PORTFOLIOS,
      { portfolioIds, reason }
    );
    return response.data.data;
  },

  /**
   * Get moderation statistics
   *
   * @returns Portfolio statistics
   */
  async getStatistics(): Promise<PortfolioStatistics> {
    const response = await apiClient.get(
      PORTFOLIO_ENDPOINTS.ADMIN_PORTFOLIO_STATISTICS
    );
    return response.data.data;
  },

  /**
   * Search portfolios with filters
   *
   * @param searchQuery Search term
   * @param userId Filter by user ID
   * @param status Filter by status
   * @param page Page number
   * @param size Page size
   * @returns Page of portfolios
   */
  async searchPortfolios(
    searchQuery?: string,
    userId?: string,
    status?: string,
    page: number = 0,
    size: number = 20
  ): Promise<PageResponse<PortfolioResponse>> {
    const response = await apiClient.get(
      PORTFOLIO_ENDPOINTS.ADMIN_SEARCH_PORTFOLIOS,
      {
        params: {
          searchQuery,
          userId,
          status,
          page,
          size,
        },
      }
    );
    return response.data.data;
  },
};

// Export as default
export default portfolioAdminApi;
