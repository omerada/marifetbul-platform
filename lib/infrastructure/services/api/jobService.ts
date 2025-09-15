import type { Job, PaginatedResponse } from '@/types';

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

export class JobService {
  private static mockJobs: Job[] = [
    // Mock data will be moved here
  ];

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

    let filteredJobs = [...this.mockJobs];

    // Apply filters
    if (search) {
      filteredJobs = this.filterBySearch(filteredJobs, search);
    }

    if (category) {
      filteredJobs = this.filterByCategory(filteredJobs, category);
    }

    if (location) {
      filteredJobs = this.filterByLocation(filteredJobs, location);
    }

    if (minBudget || maxBudget) {
      filteredJobs = this.filterByBudget(filteredJobs, minBudget, maxBudget);
    }

    if (skills.length > 0) {
      filteredJobs = this.filterBySkills(filteredJobs, skills);
    }

    // Apply sorting
    filteredJobs = this.sortJobs(filteredJobs, sortBy, sortOrder);

    // Apply pagination
    const total = filteredJobs.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedJobs = filteredJobs.slice(offset, offset + limit);

    return {
      data: paginatedJobs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
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
    return this.mockJobs.find((job) => job.id === id) || null;
  }

  static async createJob(jobData: Partial<Job>): Promise<Job> {
    const newJob: Job = {
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      proposalsCount: 0,
      status: 'open',
      ...jobData,
    } as Job;

    this.mockJobs.push(newJob);
    return newJob;
  }

  static async updateJob(
    id: string,
    updates: Partial<Job>
  ): Promise<Job | null> {
    const jobIndex = this.mockJobs.findIndex((job) => job.id === id);
    if (jobIndex === -1) return null;

    this.mockJobs[jobIndex] = {
      ...this.mockJobs[jobIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return this.mockJobs[jobIndex];
  }

  static async deleteJob(id: string): Promise<boolean> {
    const jobIndex = this.mockJobs.findIndex((job) => job.id === id);
    if (jobIndex === -1) return false;

    this.mockJobs.splice(jobIndex, 1);
    return true;
  }
}
