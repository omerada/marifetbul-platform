'use client';

/**
 * ================================================
 * USE JOB FILTERING HOOK
 * ================================================
 * Advanced filtering logic for job listings
 *
 * Sprint 2 - Story 4: Jobs Hooks Expansion
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 25, 2025
 */

import { useMemo, useCallback } from 'react';
import type { JobResponse } from '@/types/backend-aligned';

// ================================================
// TYPES
// ================================================

export type JobStatus = 'ACTIVE' | 'DRAFT' | 'CLOSED' | 'PENDING';
export type BudgetType = 'FIXED' | 'HOURLY';
export type SortField =
  | 'createdAt'
  | 'budget'
  | 'proposals'
  | 'views'
  | 'title';
export type SortOrder = 'asc' | 'desc';

export interface JobFilterOptions {
  // Status filter
  statuses?: JobStatus[];

  // Budget filters
  budgetType?: BudgetType;
  minBudget?: number;
  maxBudget?: number;

  // Category filter
  categoryIds?: string[];

  // Skills filter
  requiredSkills?: string[];
  skillsMatchMode?: 'any' | 'all'; // any: OR, all: AND

  // Text search
  searchQuery?: string;
  searchFields?: ('title' | 'description')[];

  // Date filters
  createdAfter?: Date;
  createdBefore?: Date;

  // Engagement filters
  minProposals?: number;
  maxProposals?: number;
  minViews?: number;

  // Sort
  sortBy?: SortField;
  sortOrder?: SortOrder;
}

export interface UseJobFilteringReturn {
  // Filtered results
  filteredJobs: JobResponse[];

  // Counts
  totalCount: number;
  filteredCount: number;

  // Filter utilities
  applyFilters: (filters: JobFilterOptions) => JobResponse[];
  clearFilters: () => JobResponse[];

  // Individual filter helpers
  filterByStatus: (jobs: JobResponse[], statuses: JobStatus[]) => JobResponse[];
  filterByBudget: (
    jobs: JobResponse[],
    min?: number,
    max?: number
  ) => JobResponse[];
  filterByCategory: (
    jobs: JobResponse[],
    categoryIds: string[]
  ) => JobResponse[];
  filterBySkills: (
    jobs: JobResponse[],
    skills: string[],
    mode?: 'any' | 'all'
  ) => JobResponse[];
  filterBySearch: (
    jobs: JobResponse[],
    query: string,
    fields?: ('title' | 'description')[]
  ) => JobResponse[];

  // Sort helpers
  sortJobs: (
    jobs: JobResponse[],
    field: SortField,
    order: SortOrder
  ) => JobResponse[];
}

// ================================================
// HOOK
// ================================================

export function useJobFiltering(
  jobs: JobResponse[],
  defaultFilters?: JobFilterOptions
): UseJobFilteringReturn {
  /**
   * Filter by status
   */
  const filterByStatus = useCallback(
    (jobList: JobResponse[], statuses: JobStatus[]): JobResponse[] => {
      if (!statuses || statuses.length === 0) return jobList;
      return jobList.filter((job) =>
        statuses.includes(job.status as JobStatus)
      );
    },
    []
  );

  /**
   * Filter by budget range
   */
  const filterByBudget = useCallback(
    (jobList: JobResponse[], min?: number, max?: number): JobResponse[] => {
      return jobList.filter((job) => {
        const budget = job.budgetMin || 0;
        if (min !== undefined && budget < min) return false;
        if (max !== undefined && budget > max) return false;
        return true;
      });
    },
    []
  );

  /**
   * Filter by category
   */
  const filterByCategory = useCallback(
    (jobList: JobResponse[], categoryIds: string[]): JobResponse[] => {
      if (!categoryIds || categoryIds.length === 0) return jobList;
      return jobList.filter((job) => categoryIds.includes(job.category.id));
    },
    []
  );

  /**
   * Filter by skills
   */
  const filterBySkills = useCallback(
    (
      jobList: JobResponse[],
      skills: string[],
      mode: 'any' | 'all' = 'any'
    ): JobResponse[] => {
      if (!skills || skills.length === 0) return jobList;

      return jobList.filter((job) => {
        const jobSkills = job.requiredSkills || [];

        if (mode === 'all') {
          // ALL: Job must have all required skills
          return skills.every((skill) => jobSkills.includes(skill));
        } else {
          // ANY: Job must have at least one required skill
          return skills.some((skill) => jobSkills.includes(skill));
        }
      });
    },
    []
  );

  /**
   * Filter by search query
   */
  const filterBySearch = useCallback(
    (
      jobList: JobResponse[],
      query: string,
      fields: ('title' | 'description')[] = ['title', 'description']
    ): JobResponse[] => {
      if (!query || query.trim() === '') return jobList;

      const lowerQuery = query.toLowerCase();

      return jobList.filter((job) => {
        if (
          fields.includes('title') &&
          job.title.toLowerCase().includes(lowerQuery)
        ) {
          return true;
        }
        if (
          fields.includes('description') &&
          job.description.toLowerCase().includes(lowerQuery)
        ) {
          return true;
        }
        return false;
      });
    },
    []
  );

  /**
   * Sort jobs
   */
  const sortJobs = useCallback(
    (
      jobList: JobResponse[],
      field: SortField,
      order: SortOrder
    ): JobResponse[] => {
      const sorted = [...jobList];

      sorted.sort((a, b) => {
        let aValue: number | string;
        let bValue: number | string;

        switch (field) {
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'budget':
            aValue = a.budgetMin || 0;
            bValue = b.budgetMin || 0;
            break;
          case 'proposals':
            aValue = a.proposalCount || 0;
            bValue = b.proposalCount || 0;
            break;
          case 'views':
            aValue = a.viewCount || 0;
            bValue = b.viewCount || 0;
            break;
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return order === 'asc' ? -1 : 1;
        if (aValue > bValue) return order === 'asc' ? 1 : -1;
        return 0;
      });

      return sorted;
    },
    []
  );

  /**
   * Apply all filters
   */
  const applyFilters = useCallback(
    (filters: JobFilterOptions): JobResponse[] => {
      let result = [...jobs];

      // Status filter
      if (filters.statuses) {
        result = filterByStatus(result, filters.statuses);
      }

      // Budget type filter
      if (filters.budgetType) {
        result = result.filter((job) => job.budgetType === filters.budgetType);
      }

      // Budget range filter
      if (filters.minBudget !== undefined || filters.maxBudget !== undefined) {
        result = filterByBudget(result, filters.minBudget, filters.maxBudget);
      }

      // Category filter
      if (filters.categoryIds) {
        result = filterByCategory(result, filters.categoryIds);
      }

      // Skills filter
      if (filters.requiredSkills) {
        result = filterBySkills(
          result,
          filters.requiredSkills,
          filters.skillsMatchMode || 'any'
        );
      }

      // Search filter
      if (filters.searchQuery) {
        result = filterBySearch(
          result,
          filters.searchQuery,
          filters.searchFields
        );
      }

      // Date filters
      if (filters.createdAfter) {
        result = result.filter(
          (job) => new Date(job.createdAt) >= filters.createdAfter!
        );
      }
      if (filters.createdBefore) {
        result = result.filter(
          (job) => new Date(job.createdAt) <= filters.createdBefore!
        );
      }

      // Engagement filters
      if (filters.minProposals !== undefined) {
        result = result.filter(
          (job) => (job.proposalCount || 0) >= filters.minProposals!
        );
      }
      if (filters.maxProposals !== undefined) {
        result = result.filter(
          (job) => (job.proposalCount || 0) <= filters.maxProposals!
        );
      }
      if (filters.minViews !== undefined) {
        result = result.filter(
          (job) => (job.viewCount || 0) >= filters.minViews!
        );
      }

      // Sort
      if (filters.sortBy) {
        result = sortJobs(result, filters.sortBy, filters.sortOrder || 'desc');
      }

      return result;
    },
    [
      jobs,
      filterByStatus,
      filterByBudget,
      filterByCategory,
      filterBySkills,
      filterBySearch,
      sortJobs,
    ]
  );

  /**
   * Clear all filters
   */
  const clearFilters = useCallback((): JobResponse[] => {
    return [...jobs];
  }, [jobs]);

  /**
   * Memoized filtered results with default filters
   */
  const filteredJobs = useMemo(() => {
    if (!defaultFilters) return jobs;
    return applyFilters(defaultFilters);
  }, [jobs, defaultFilters, applyFilters]);

  return {
    // Results
    filteredJobs,
    totalCount: jobs.length,
    filteredCount: filteredJobs.length,

    // Actions
    applyFilters,
    clearFilters,

    // Individual filters
    filterByStatus,
    filterByBudget,
    filterByCategory,
    filterBySkills,
    filterBySearch,

    // Sort
    sortJobs,
  };
}
