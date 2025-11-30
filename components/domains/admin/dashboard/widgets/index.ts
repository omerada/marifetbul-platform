/**
 * ================================================
 * ADMIN DASHBOARD WIDGETS - BARREL EXPORT
 * ================================================
 * Consolidated widgets for admin dashboard
 *
 * @module components/domains/admin/dashboard/widgets
 * @since Sprint 2 - Code Consolidation
 */

// Revenue Breakdown Widgets
export {
  RevenueBreakdownWidget,
  type RevenueBreakdownDto,
  type RevenueBreakdownWidgetProps,
} from './RevenueBreakdownWidget';

export {
  RevenueBreakdownContainer,
  type RevenueBreakdownContainerProps,
} from './RevenueBreakdownContainer';

// Revenue Comparison Widgets
export {
  RevenueComparisonWidget,
  type RevenueComparisonDto,
  type RevenueComparisonWidgetProps,
} from './RevenueComparisonWidget';

// Alias for backward compatibility
export { RevenueComparisonWidget as RevenueComparisonChart } from './RevenueComparisonWidget';

export {
  RevenueComparisonContainer,
  type RevenueComparisonContainerProps,
} from './RevenueComparisonContainer';

// Revenue Forecast Widgets
export {
  RevenueForecastWidget,
  type RevenueForecastDto,
  type RevenueForecastWidgetProps,
} from './RevenueForecastWidget';

export {
  RevenueForecastContainer,
  type RevenueForecastContainerProps,
} from './RevenueForecastContainer';

// Refund Widgets
export {
  RefundStatisticsWidget,
  type RefundStatisticsWidgetProps,
} from './RefundStatisticsWidget';

export {
  RefundTrendChart,
  type RefundTrendChartProps,
} from './RefundTrendChart';

// Re-export from analytics (backward compatibility)
export { RevenueChart } from '@/components/domains/admin/analytics';
