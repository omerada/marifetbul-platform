// ================================================
// ANALYTICS DOMAIN COMPONENTS
// ================================================
// All analytics related components
// Sprint 1 Day 3: Consolidated analytics components

/**
 * SPRINT 1 DAY 3 - CLEANUP COMPLETED
 * ================================================
 * REMOVED: AnalyticsDashboard.tsx (unused, duplicate)
 * REMOVED: AdvancedAnalyticsDashboard.tsx (unused, duplicate)
 * REMOVED: SearchAnalyticsDashboard.tsx (unused, duplicate)
 *
 * Reason: These were unused legacy dashboard implementations.
 * Current analytics are in:
 * - @/components/domains/admin/dashboard (admin-specific analytics widgets)
 * - @/components/domains/dashboard/views (role-based dashboard views)
 *
 * @removed 2025-11-13
 */

// Dashboard analytics (moved from components/dashboard/analytics)
export { default as RevenueBreakdown } from './RevenueBreakdown';
export { default as TransactionSummary } from './TransactionSummary';
// Note: EarningsChart moved to domains/wallet (removed duplicate)
