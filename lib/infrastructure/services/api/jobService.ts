import type { Job, PaginatedResponse } from '@/types';
import type { ApiResponse } from '@/types/shared/api';
import { apiClient } from '@/lib/infrastructure/api/client';
import logger from '@/lib/infrastructure/monitoring/logger';

export interface JobFilters {
  search?: string;
  category?: string;
  location?: string;
  minBudget?: number;
  maxBudget?: number;
  skills?: string[];
  sortBy?: 'newest' | 'oldest' | 'budget' | 'proposals';
  sortOrder?: 'asc' | 'desc';
}

export interface JobSearchParams extends JobFilters {
  page: number;
  limit: number;
}

/**
 * Production-ready JobService using real backend API
 * Endpoints: /api/v1/jobs
 */
export class JobService {
  static async searchJobs(
    params: JobSearchParams
  ): Promise<PaginatedResponse<Job>> {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      location,
      minBudget,
      maxBudget,
      skills = [],
      sortBy = 'newest',
      sortOrder = 'desc',
    } = params;

    // Build query parameters
    const queryParams = new URLSearchParams();
    queryParams.set('page', page.toString());
    queryParams.set('limit', limit.toString());
    queryParams.set('sortBy', sortBy);
    queryParams.set('sortOrder', sortOrder);

    if (search) queryParams.set('search', search);
    if (category) queryParams.set('category', category);
    if (location) queryParams.set('location', location);
    if (minBudget) queryParams.set('minBudget', minBudget.toString());
    if (maxBudget) queryParams.set('maxBudget', maxBudget.toString());
    if (skills.length > 0) queryParams.set('skills', skills.join(','));

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Job>>>(
      `/jobs?${queryParams.toString()}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to fetch jobs');
    }

    return response.data;
  }

  private static filterBySearch(jobs: Job[], search: string): Job[] {
    const searchLower = search.toLowerCase();
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(searchLower) ||
        job.description.toLowerCase().includes(searchLower) ||
        (job.skills &&
          job.skills.some((skill) => skill.toLowerCase().includes(searchLower)))
    );
  }

  private static filterByCategory(jobs: Job[], category: string): Job[] {
    return jobs.filter((job) => job.category === category);
  }

  private static filterByLocation(jobs: Job[], location: string): Job[] {
    if (location === 'remote') {
      return jobs.filter((job) => job.isRemote === true);
    }
    return jobs.filter(
      (job) =>
        job.location &&
        job.location.toLowerCase().includes(location.toLowerCase())
    );
  }

  private static filterByBudget(
    jobs: Job[],
    minBudget?: number,
    maxBudget?: number
  ): Job[] {
    return jobs.filter((job) => {
      let jobMinBudget: number;
      let jobMaxBudget: number;

      if (typeof job.budget === 'number') {
        jobMinBudget = job.budget;
        jobMaxBudget = job.budget;
      } else {
        jobMinBudget = job.budget.amount;
        jobMaxBudget = job.budget.maxAmount || job.budget.amount;
      }

      if (minBudget && maxBudget) {
        return jobMaxBudget >= minBudget && jobMinBudget <= maxBudget;
      } else if (minBudget) {
        return jobMaxBudget >= minBudget;
      } else if (maxBudget) {
        return jobMinBudget <= maxBudget;
      }
      return true;
    });
  }

  private static filterBySkills(jobs: Job[], skills: string[]): Job[] {
    return jobs.filter((job) =>
      skills.some((skill) =>
        job.skills?.some((jobSkill) =>
          jobSkill.toLowerCase().includes(skill.toLowerCase())
        )
      )
    );
  }

  private static sortJobs(
    jobs: Job[],
    sortBy: string,
    sortOrder: string
  ): Job[] {
    return jobs.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'newest':
          comparison =
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'oldest':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'budget':
          const budgetA =
            typeof a.budget === 'object'
              ? a.budget.maxAmount || a.budget.amount
              : a.budget;
          const budgetB =
            typeof b.budget === 'object'
              ? b.budget.maxAmount || b.budget.amount
              : b.budget;
          comparison = budgetB - budgetA;
          break;
        case 'proposals':
          comparison = (b.proposalsCount || 0) - (a.proposalsCount || 0);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? comparison : -comparison;
    });
  }

  static async getJobById(id: string): Promise<Job | null> {
    try {
      const response = await apiClient.get<ApiResponse<Job>>(`/jobs/${id}`);

      if (!response.success || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      logger.error(
        'Failed to fetch job',
        error
      );
      return null;
    }
  }

  static async createJob(jobData: Partial<Job>): Promise<Job> {
    const response = await apiClient.post<ApiResponse<Job>>('/jobs', jobData);

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Failed to create job');
    }

    return response.data;
  }

  static async updateJob(
    id: string,
    updates: Partial<Job>
  ): Promise<Job | null> {
    try {
      const response = await apiClient.put<ApiResponse<Job>>(
        `/jobs/${id}`,
        updates
      );

      if (!response.success || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      logger.error(
        'Failed to update job',
        error
      );
      return null;
    }
  }

  static async deleteJob(id: string): Promise<boolean> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/jobs/${id}`);
      return response.success;
    } catch (error) {
      logger.error(
        'Failed to delete job',
        error
      );
      return false;
    }
  }
}
