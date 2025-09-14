import { ApiResponse } from '../utils/api';

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
}

export type AnalyticsExportResponse = ApiResponse<{ downloadUrl: string }>;

export type GetAnalyticsResponse = ApiResponse<{
  freelancer?: FreelancerAnalytics;
  employer?: EmployerAnalytics;
}>;
