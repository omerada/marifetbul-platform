// ================================================
// JOB REPOSITORY
// ================================================
// Repository for job/gig-related API operations

import {
  BaseRepository,
  PaginatedResult,
  SearchOptions,
} from './BaseRepository';

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget: {
    type: 'FIXED' | 'HOURLY';
    min: number;
    max?: number;
    currency: string;
  };
  duration: {
    type: 'SHORT' | 'MEDIUM' | 'LONG';
    estimatedHours?: number;
    deadline?: string;
  };
  skills: string[];
  requirements: string[];
  attachments?: JobAttachment[];
  location?: {
    type: 'REMOTE' | 'ONSITE' | 'HYBRID';
    city?: string;
    country?: string;
    coordinates?: [number, number];
  };
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  employer: {
    id: string;
    username: string;
    avatar?: string;
    rating: number;
    reviewCount: number;
    verificationStatus: boolean;
  };
  proposals: {
    count: number;
    averageBid: number;
  };
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  featuredUntil?: string;
  views: number;
  savedCount: number;
}

export interface JobAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
}

export interface CreateJobData {
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  budget: {
    type: 'FIXED' | 'HOURLY';
    min: number;
    max?: number;
    currency: string;
  };
  duration: {
    type: 'SHORT' | 'MEDIUM' | 'LONG';
    estimatedHours?: number;
    deadline?: string;
  };
  skills: string[];
  requirements: string[];
  location?: {
    type: 'REMOTE' | 'ONSITE' | 'HYBRID';
    city?: string;
    country?: string;
  };
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  attachments?: File[];
  expiresAt?: string;
}

export interface UpdateJobData {
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  budget?: {
    type: 'FIXED' | 'HOURLY';
    min: number;
    max?: number;
    currency: string;
  };
  duration?: {
    type: 'SHORT' | 'MEDIUM' | 'LONG';
    estimatedHours?: number;
    deadline?: string;
  };
  skills?: string[];
  requirements?: string[];
  location?: {
    type: 'REMOTE' | 'ONSITE' | 'HYBRID';
    city?: string;
    country?: string;
  };
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status?: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  expiresAt?: string;
}

export interface JobStats {
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  averageBudget: number;
  popularCategories: Array<{ category: string; count: number }>;
  popularSkills: Array<{ skill: string; count: number }>;
}

export interface JobSearchFilters {
  category?: string;
  subcategory?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetType?: 'FIXED' | 'HOURLY';
  skills?: string[];
  locationType?: 'REMOTE' | 'ONSITE' | 'HYBRID';
  location?: string;
  urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  duration?: 'SHORT' | 'MEDIUM' | 'LONG';
  postedWithin?: number; // days
  hasAttachments?: boolean;
  verifiedEmployersOnly?: boolean;
}

class JobRepository extends BaseRepository<Job, CreateJobData, UpdateJobData> {
  protected readonly baseEndpoint = '/jobs';

  constructor() {
    super('job');
  }

  // ================================================
  // JOB-SPECIFIC METHODS
  // ================================================

  async findByCategory(category: string, limit?: number): Promise<Job[]> {
    return this.customQuery<Job[]>(
      `category/${encodeURIComponent(category)}${limit ? `?limit=${limit}` : ''}`
    );
  }

  async findByEmployer(employerId: string): Promise<Job[]> {
    return this.customQuery<Job[]>(`employer/${employerId}`);
  }

  async findMyJobs(status?: Job['status']): Promise<Job[]> {
    const params = status ? { status } : undefined;
    return this.customQuery<Job[]>('my-jobs', 'GET', params);
  }

  async findRecommended(limit: number = 10): Promise<Job[]> {
    return this.customQuery<Job[]>(`recommended?limit=${limit}`);
  }

  async findSimilar(jobId: string, limit: number = 5): Promise<Job[]> {
    return this.customQuery<Job[]>(`${jobId}/similar?limit=${limit}`);
  }

  // ================================================
  // JOB SEARCH & FILTERING
  // ================================================

  async searchJobs(options: SearchOptions & JobSearchFilters): Promise<Job[]> {
    return this.search(options);
  }

  async searchJobsPaginated(
    options: SearchOptions & JobSearchFilters
  ): Promise<PaginatedResult<Job>> {
    return this.searchPaginated(options);
  }

  async getFeaturedJobs(limit: number = 5): Promise<Job[]> {
    return this.customQuery<Job[]>(`featured?limit=${limit}`);
  }

  async getRecentJobs(limit: number = 10): Promise<Job[]> {
    return this.customQuery<Job[]>(`recent?limit=${limit}`);
  }

  async getPopularJobs(
    period: 'day' | 'week' | 'month' = 'week',
    limit: number = 10
  ): Promise<Job[]> {
    return this.customQuery<Job[]>(`popular?period=${period}&limit=${limit}`);
  }

  // ================================================
  // JOB MANAGEMENT
  // ================================================

  async publishJob(jobId: string): Promise<Job> {
    return this.customQuery<Job>(`${jobId}/publish`, 'POST');
  }

  async pauseJob(jobId: string): Promise<Job> {
    return this.customQuery<Job>(`${jobId}/pause`, 'POST');
  }

  async resumeJob(jobId: string): Promise<Job> {
    return this.customQuery<Job>(`${jobId}/resume`, 'POST');
  }

  async completeJob(jobId: string): Promise<Job> {
    return this.customQuery<Job>(`${jobId}/complete`, 'POST');
  }

  async cancelJob(jobId: string, reason?: string): Promise<Job> {
    return this.customQuery<Job>(`${jobId}/cancel`, 'POST', { reason });
  }

  async extendDeadline(jobId: string, newDeadline: string): Promise<Job> {
    return this.customQuery<Job>(`${jobId}/extend-deadline`, 'POST', {
      deadline: newDeadline,
    });
  }

  async renewJob(jobId: string, duration: number): Promise<Job> {
    return this.customQuery<Job>(`${jobId}/renew`, 'POST', { duration });
  }

  // ================================================
  // JOB INTERACTIONS
  // ================================================

  async viewJob(jobId: string): Promise<void> {
    await this.customQuery<void>(`${jobId}/view`, 'POST');
  }

  async saveJob(jobId: string): Promise<void> {
    await this.customQuery<void>(`${jobId}/save`, 'POST');
  }

  async unsaveJob(jobId: string): Promise<void> {
    await this.customQuery<void>(`${jobId}/unsave`, 'POST');
  }

  async getSavedJobs(): Promise<Job[]> {
    return this.customQuery<Job[]>('saved');
  }

  async reportJob(
    jobId: string,
    reason: string,
    details?: string
  ): Promise<void> {
    await this.customQuery<void>(`${jobId}/report`, 'POST', {
      reason,
      details,
    });
  }

  // ================================================
  // JOB ATTACHMENTS
  // ================================================

  async uploadAttachment(jobId: string, file: File): Promise<JobAttachment> {
    const formData = new FormData();
    formData.append('attachment', file);

    return this.customQuery<JobAttachment>(
      `${jobId}/attachments`,
      'POST',
      formData,
      {
        headers: {}, // Let browser set Content-Type for FormData
      }
    );
  }

  async deleteAttachment(jobId: string, attachmentId: string): Promise<void> {
    await this.customQuery<void>(
      `${jobId}/attachments/${attachmentId}`,
      'DELETE'
    );
  }

  // ================================================
  // JOB STATISTICS
  // ================================================

  async getJobStats(): Promise<JobStats> {
    return this.customQuery<JobStats>('stats');
  }

  async getJobMetrics(jobId: string): Promise<{
    views: number;
    proposals: number;
    saves: number;
    viewsOverTime: Record<string, number>;
    proposalsOverTime: Record<string, number>;
  }> {
    return this.customQuery<{
      views: number;
      proposals: number;
      saves: number;
      viewsOverTime: Record<string, number>;
      proposalsOverTime: Record<string, number>;
    }>(`${jobId}/metrics`);
  }

  async getCategoryStats(): Promise<
    Array<{ category: string; count: number; averageBudget: number }>
  > {
    return this.customQuery<
      Array<{ category: string; count: number; averageBudget: number }>
    >('stats/categories');
  }

  async getSkillDemand(): Promise<
    Array<{ skill: string; demand: number; averageRate: number }>
  > {
    return this.customQuery<
      Array<{ skill: string; demand: number; averageRate: number }>
    >('stats/skills');
  }

  // ================================================
  // JOB CATEGORIES & SKILLS
  // ================================================

  async getCategories(): Promise<
    Array<{
      id: string;
      name: string;
      subcategories: Array<{ id: string; name: string }>;
    }>
  > {
    return this.customQuery<
      Array<{
        id: string;
        name: string;
        subcategories: Array<{ id: string; name: string }>;
      }>
    >('categories');
  }

  async getSkillSuggestions(query: string): Promise<string[]> {
    return this.customQuery<string[]>(
      `skills/suggestions?q=${encodeURIComponent(query)}`
    );
  }

  async getPopularSkills(category?: string): Promise<string[]> {
    const params = category ? { category } : undefined;
    return this.customQuery<string[]>('skills/popular', 'GET', params);
  }

  // ================================================
  // JOB PROMOTION
  // ================================================

  async featureJob(jobId: string, duration: number): Promise<Job> {
    return this.customQuery<Job>(`${jobId}/feature`, 'POST', { duration });
  }

  async boostJob(jobId: string, amount: number): Promise<Job> {
    return this.customQuery<Job>(`${jobId}/boost`, 'POST', { amount });
  }

  async getPromotionOptions(): Promise<{
    feature: { durations: number[]; prices: number[] };
    boost: { amounts: number[]; multipliers: number[] };
  }> {
    return this.customQuery<{
      feature: { durations: number[]; prices: number[] };
      boost: { amounts: number[]; multipliers: number[] };
    }>('promotion-options');
  }

  // ================================================
  // ADMIN OPERATIONS
  // ================================================

  async moderateJob(
    jobId: string,
    action: 'APPROVE' | 'REJECT',
    reason?: string
  ): Promise<Job> {
    return this.customQuery<Job>(`${jobId}/moderate`, 'POST', {
      action,
      reason,
    });
  }

  async getFlaggedJobs(): Promise<Job[]> {
    return this.customQuery<Job[]>('flagged');
  }

  async getJobReports(jobId: string): Promise<
    Array<{
      id: string;
      reason: string;
      details?: string;
      reporter: { id: string; username: string };
      createdAt: string;
    }>
  > {
    return this.customQuery<
      Array<{
        id: string;
        reason: string;
        details?: string;
        reporter: { id: string; username: string };
        createdAt: string;
      }>
    >(`${jobId}/reports`);
  }
}

// Export singleton instance
export const jobRepository = new JobRepository();
export default jobRepository;
