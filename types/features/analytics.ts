import type { BaseApiResponse } from '../../lib/types/enhanced/api-responses';

// Analytics Types
export interface FreelancerAnalytics {
  profileViews: number;
  jobApplications: number;
  jobsCompleted: number;
  totalEarnings: number;
  averageRating: number;
  responseTime: number;
  clientSatisfaction: number;
  skillDemand: { skill: string; demand: number }[];
  monthlyStats: {
    month: string;
    applications: number;
    earnings: number;
    completedJobs: number;
  }[];
}

export interface EmployerAnalytics {
  jobsPosted: number;
  totalSpent: number;
  activeJobs: number;
  completedJobs: number;
  averageJobValue: number;
  timeToHire: number;
  freelancerRetention: number;
  projectSuccessRate: number;
  monthlyStats: {
    month: string;
    jobsPosted: number;
    spent: number;
    hired: number;
  }[];
}

export interface AnalyticsTimeframe {
  start: Date;
  end: Date;
  period: 'day' | 'week' | 'month' | 'quarter' | 'year';
}

export interface AnalyticsFilters {
  timeframe: AnalyticsTimeframe;
  userType?: 'freelancer' | 'employer';
  category?: string;
  location?: string;
  minValue?: number;
  maxValue?: number;
}

export interface AnalyticsExport {
  format: 'csv' | 'excel' | 'pdf';
  data: Record<string, unknown>[];
  filename: string;
  // Compatibility fields
  sections?: string[];
  timeframe?: Record<string, unknown>;
  includeCharts?: boolean;
  includeRawData?: boolean;
  createdAt?: string;
}

export interface AnalyticsExportResponse
  extends BaseApiResponse<{ downloadUrl: string }> {
  // Additional compatibility fields
  expiresAt?: string;
  fileSize?: number;
  error?: string;
}

export interface GetAnalyticsResponse
  extends BaseApiResponse<{
    freelancer?: FreelancerAnalytics;
    employer?: EmployerAnalytics;
  }> {
  // Compatibility fields for MSW handlers and stores
  timeframe?: AnalyticsTimeframe | string;
  lastUpdated?: string;
  error?: string;
}
