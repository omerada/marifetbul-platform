/**
 * Moderation Analytics Type Definitions
 *
 * Centralized type definitions for the moderation analytics system.
 * Extracted from ModerationAnalytics.tsx for reusability.
 */

// Date Range Types
export type DateRangeType = '1d' | '7d' | '30d' | '90d' | 'custom';
export type WorkloadType = 'light' | 'normal' | 'heavy' | 'overloaded';
export type StatusType = 'online' | 'offline' | 'busy';
export type RiskLevelType = 'low' | 'medium' | 'high' | 'critical';
export type ContentTypeValue =
  | 'job'
  | 'service'
  | 'review'
  | 'message'
  | 'profile';

// Overview Metrics
export interface AnalyticsOverview {
  totalActions: number;
  actionsToday: number;
  actionsTrend: number; // percentage change
  averageResponseTime: number; // minutes
  responseTrend: number;
  accuracyRate: number; // percentage
  accuracyTrend: number;
  activeContentFlags: number;
  flagsTrend: number;
}

// Action Breakdown
export interface ActionBreakdown {
  approved: number;
  rejected: number;
  escalated: number;
  autoApproved: number;
  autoRejected: number;
  pending: number;
}

// Category Statistics
export interface CategoryStats {
  category: string;
  totalActions: number;
  approvalRate: number;
  averageTime: number;
  accuracy: number;
  trend: number;
}

// Moderator Performance
export interface ModeratorPerformance {
  moderatorId: string;
  moderatorName: string;
  totalActions: number;
  averageTime: number;
  accuracyRate: number;
  approvalRate: number;
  workload: WorkloadType;
  onlineStatus: StatusType;
  lastActive: string;
}

// Time Series Data
export interface DailyTimeSeriesData {
  date: string;
  actions: number;
  approved: number;
  rejected: number;
  escalated: number;
  averageTime: number;
  accuracy: number;
}

export interface HourlyTimeSeriesData {
  hour: number;
  actions: number;
  averageTime: number;
}

export interface TimeSeriesData {
  daily: DailyTimeSeriesData[];
  hourly: HourlyTimeSeriesData[];
}

// Content Types
export interface ContentTypeStats {
  type: ContentTypeValue;
  count: number;
  approvalRate: number;
  riskScore: number;
}

// Automation Metrics
export interface AutomationMetrics {
  totalAutomated: number;
  automationRate: number; // percentage
  accuracyRate: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  timeSaved: number; // hours
  costSavings: number; // in currency
}

// Risk Analysis
export interface RiskDistribution {
  riskLevel: RiskLevelType;
  count: number;
  percentage: number;
}

export interface RiskTrend {
  date: string;
  riskScore: number;
  incidents: number;
}

export interface RiskAnalysis {
  highRiskUsers: number;
  highRiskContent: number;
  riskDistribution: RiskDistribution[];
  riskTrends: RiskTrend[];
}

// Reporting Data
export interface ReportingData {
  userReports: number;
  systemFlags: number;
  adminReviews: number;
  appealsCases: number;
  resolutionRate: number;
  escalationRate: number;
}

// Main Analytics Interface
export interface ModerationAnalytics {
  overview: AnalyticsOverview;
  actionBreakdown: ActionBreakdown;
  categoryStats: CategoryStats[];
  moderatorPerformance: ModeratorPerformance[];
  timeSeriesData: TimeSeriesData;
  contentTypes: ContentTypeStats[];
  automationMetrics: AutomationMetrics;
  riskAnalysis: RiskAnalysis;
  reportingData: ReportingData;
}

// Analytics Filters
export interface AnalyticsFilters {
  dateRange: DateRangeType;
  startDate?: string;
  endDate?: string;
  moderators: string[];
  categories: string[];
  contentTypes: string[];
  actionTypes: string[];
}

// Export Format
export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

// Tab Types
export type TabType =
  | 'overview'
  | 'moderators'
  | 'automation'
  | 'risk'
  | 'reports';

// API Response
export interface AnalyticsResponse {
  analytics: ModerationAnalytics;
  success: boolean;
  message?: string;
}
