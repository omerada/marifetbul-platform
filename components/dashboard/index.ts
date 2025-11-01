/**
 * Dashboard Components Index
 *
 * Note: Most components have been relocated to domains/ as part of Story 1.3
 * This file maintains backward compatibility exports
 */

// Components relocated to domains/packages (Story 1.3)
export { PackageAnalytics } from '../domains/packages/PackageAnalytics';
export { PackagePerformance } from '../domains/packages/PackagePerformance';

// Chart Components (still in dashboard/)
export { RevenueChart } from './RevenueChart';
export { ClientStatistics } from './ClientStatistics';

// Analytics Components relocated to domains/analytics (Story 1.3)
export { EarningsChart } from '../domains/wallet/EarningsChart';
export { default as RevenueBreakdown } from '../domains/analytics/RevenueBreakdown';
export { default as TransactionSummary } from '../domains/analytics/TransactionSummary';

// Disputes Widget (Sprint 16 - Story 2.1)
export { DisputesWidget } from './DisputesWidget';
