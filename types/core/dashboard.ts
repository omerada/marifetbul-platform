/**
 * Dashboard Core Types
 * Role-specific dashboard structures
 */

import type { Order } from '../business/features/order';
import type { Job } from '../business/features/marketplace';
import type { ProposalResponse } from '../backend-aligned';
import type { EnhancedNotification } from '../domains/notification/notification.types';
import type {
  FreelancerAnalytics,
  EmployerAnalytics,
} from '../business/features/analytics';
import type { Recommendation } from '../business/features/recommendations';

// ==================== Freelancer Dashboard ====================

export interface FreelancerDashboard {
  overview: {
    totalEarnings: number;
    completedJobs: number;
    activeJobs: number;
    profileViews: number;
    successRate: number;
    responseTime: number;
  };
  stats: {
    totalEarnings: number;
    currentMonthEarnings: number;
    activeOrders: number;
    completedJobs: number;
    rating: number;
    profileViews: number;
    responseRate: number;
  };
  quickStats: {
    messagesWaiting: number;
    pendingProposals: number;
    reviewsPending: number;
  };
  recentJobs: Job[];
  recentOrders: Order[];
  recentProposals: ProposalResponse[];
  earnings: Record<string, number>;
  analytics: FreelancerAnalytics;
  recommendations: Recommendation[];
  notifications: EnhancedNotification[];
  chartData?: {
    earnings: Array<{ date: string; amount: number; orderCount?: number }>;
    packages: Array<{
      packageId: string;
      packageName: string;
      sales: number;
      revenue: number;
      views: number;
      conversionRate: number;
    }>;
    clients: {
      totalClients: number;
      newClients: number;
      repeatClients: number;
      averageSatisfaction: number;
      repeatRate: number;
      topClients: Array<{
        id: string;
        name: string;
        orders: number;
        totalSpent: number;
      }>;
    };
  };
}

// ==================== Employer Dashboard ====================

export interface EmployerDashboard {
  overview: {
    totalSpent: number;
    jobsPosted: number;
    activeJobs: number;
    completedJobs: number;
    avgTimeToHire: number;
    freelancerRetention: number;
  };
  stats: {
    activeJobs: number;
    totalSpent: number;
    savedFreelancers: number;
    completedJobs: number;
  };
  activeJobs: Job[];
  recentJobs: Job[];
  spending: Record<string, number>;
  analytics: EmployerAnalytics;
  recommendations: Recommendation[];
  notifications: EnhancedNotification[];
  chartData?: {
    spending: Array<{ date: string; amount: number; jobCount?: number }>;
    hiring: {
      avgTimeToHire: number;
      freelancerRetention: number;
      satisfaction: number;
    };
  };
}
