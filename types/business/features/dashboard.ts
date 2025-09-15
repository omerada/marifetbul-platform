import { User } from '../../core/base';

// Dashboard Types
export interface FreelancerDashboard {
  overview: {
    totalEarnings: number;
    completedJobs: number;
    activeJobs: number;
    profileViews: number;
    successRate: number;
    responseTime: number;
  };
  recentJobs: DashboardJob[];
  earnings: EarningsData;
  analytics: FreelancerAnalytics;
  recommendations: DashboardRecommendation[];
  notifications: DashboardNotification[];
}

export interface EmployerDashboard {
  overview: {
    totalSpent: number;
    jobsPosted: number;
    activeJobs: number;
    completedJobs: number;
    avgTimeToHire: number;
    freelancerRetention: number;
  };
  recentJobs: DashboardJob[];
  spending: SpendingData;
  analytics: EmployerAnalytics;
  recommendations: DashboardRecommendation[];
  notifications: DashboardNotification[];
}

export interface DashboardJob {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'cancelled' | 'pending';
  budget: number;
  deadline: string;
  freelancer?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  progress: number;
  lastUpdate: string;
}

export interface EarningsData {
  total: number;
  thisMonth: number;
  lastMonth: number;
  pending: number;
  available: number;
  weekly: { week: string; amount: number }[];
  monthly: { month: string; amount: number }[];
}

export interface SpendingData {
  total: number;
  thisMonth: number;
  lastMonth: number;
  budgeted: number;
  remaining: number;
  weekly: { week: string; amount: number }[];
  monthly: { month: string; amount: number }[];
}

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

export interface DashboardRecommendation {
  id: string;
  type: 'job' | 'freelancer' | 'skill' | 'tip';
  title: string;
  description: string;
  actionText?: string;
  actionUrl?: string;
  relevanceScore: number;
  createdAt: string;
}

export interface DashboardNotification {
  id: string;
  type: 'job' | 'message' | 'payment' | 'review' | 'system';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
}
