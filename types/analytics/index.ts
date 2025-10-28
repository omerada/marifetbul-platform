/**
 * Analytics & Dashboard Types
 * Centralized location for analytics-related type definitions
 */

// Re-export from business features
export type {
  FreelancerAnalytics,
  EmployerAnalytics,
  AnalyticsTimeframe,
  AnalyticsFilters,
  AnalyticsExport,
  AnalyticsExportResponse,
} from '../business/features/analytics';

// Re-export dashboard types from core
export type { FreelancerDashboard, EmployerDashboard } from './dashboard';

// Additional analytics types
export interface AnalyticsMetrics {
  totalJobs: number;
  totalFreelancers: number;
  totalRevenue: number;
  averageRating: number;
  completionRate: number;
  responseTime: number;
}

export interface AnalyticsTrends {
  jobs: number;
  freelancers: number;
  revenue: number;
  rating: number;
}

export interface AnalyticsChartData {
  labels: string[];
  jobs: number[];
  revenue: number[];
  users: number[];
}

export interface CategoryDistribution {
  name: string;
  value: number;
  color: string;
}

export interface TopPerformer {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  projects: number;
  revenue: number;
}

export type AnalyticsPeriod = 'day' | 'week' | 'month' | 'year';

export interface AnalyticsDashboardData {
  period: AnalyticsPeriod;
  metrics: AnalyticsMetrics;
  trends: AnalyticsTrends;
  chartData: AnalyticsChartData;
  categoryDistribution: CategoryDistribution[];
  topPerformers: TopPerformer[];
}
