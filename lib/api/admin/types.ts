/**
 * ================================================
 * ADMIN COMMISSION TYPES
 * ================================================
 * TypeScript types for admin commission management
 *
 * Sprint: Admin Commission Management
 * Story: Commission Settings Management (5 SP)
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint Day 1
 */

// ========== Commission Settings ==========

export interface CommissionSettings {
  id: string;
  defaultRate: number;
  minCommissionAmount: number;
  maxCommissionAmount: number | null;
  categoryRatesEnabled: boolean;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface CommissionSettingsUpdateRequest {
  defaultRate: number;
  minCommissionAmount: number;
  maxCommissionAmount: number | null;
  categoryRatesEnabled: boolean;
  updateReason: string;
}

// ========== Category Commission ==========

export interface CategoryCommission {
  id: string;
  categoryId: string;
  categoryName: string;
  commissionRate: number | null;
  useDefaultRate: boolean;
  totalOrders: number;
  totalRevenue: number;
  totalCommissionEarned: number;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface CategoryCommissionUpdateRequest {
  commissionRate: number | null;
  useDefaultRate: boolean;
  updateReason: string;
}

// ========== Analytics ==========

export interface CommissionAnalytics {
  totalCommissionEarned: number;
  averageCommissionPerOrder: number;
  totalOrdersWithCommission: number;
  commissionGrowthRate: number;
  periodData: CommissionPeriod[];
  categoryBreakdown: CategoryCommissionBreakdown[];
  topCategories: TopCategory[];
  startDate: string;
  endDate: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
}

export interface CommissionPeriod {
  date: string;
  commissionEarned: number;
  orderCount: number;
  averageCommission: number;
}

export interface CategoryCommissionBreakdown {
  categoryId: string;
  categoryName: string;
  commissionEarned: number;
  orderCount: number;
  percentage: number;
}

export interface TopCategory {
  categoryId: string;
  categoryName: string;
  commissionEarned: number;
  currentRate: number;
  orderCount: number;
}

// ========== History ==========

export interface CommissionHistory {
  orderId: string;
  paymentId: string;
  categoryId: string;
  categoryName: string;
  orderAmount: number;
  commissionRate: number;
  commissionAmount: number;
  orderStatus: string;
  paymentStatus: string;
  commissionDate: string;
  sellerId: string;
  sellerUsername: string;
  buyerId: string;
  buyerUsername: string;
}

export interface CommissionHistoryParams {
  page?: number;
  size?: number;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

// ========== Preview ==========

export interface CommissionPreviewRequest {
  newRate: number;
  categoryId?: string;
  previewPeriodDays?: number;
}

export interface CommissionPreview {
  currentRate: number;
  newRate: number;
  rateDifference: number;
  currentRevenue: number;
  projectedRevenue: number;
  revenueDifference: number;
  revenueChangePercentage: number;
  affectedOrderCount: number;
  averageOrderCommission: number;
  warnings: string[];
  previewPeriodDays: number;
}

// ========== API Response Types ==========

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
