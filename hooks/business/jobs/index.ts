/**
 * ================================================
 * JOBS HOOKS - INDEX
 * ================================================
 * Central export point for job-related hooks
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @created November 6, 2025
 * @updated November 25, 2025 - Sprint 1: Job Posting Complete Implementation
 * Sprint: Job Posting & Proposal System
 */

// Data fetching
export { useJobs } from './useJobs';
export type { JobFilters, UseJobsReturn } from './useJobs';

// Job creation (NEW - Sprint 1 Task 1.1) ✨
export { useJobCreate } from './useJobCreate';
export type {
  JobCreationStep,
  JobImage,
  UseJobCreateOptions,
  UseJobCreateReturn,
} from './useJobCreate';

// Search params
export { useJobSearchParams } from './useJobSearchParams';
export type { UseJobSearchParamsReturn } from './useJobSearchParams';

// Form management
export { useJobForm } from './useJobForm';
export type { UseJobFormOptions, UseJobFormReturn } from './useJobForm';

// Publishing workflow
export { useJobPublish } from './useJobPublish';
export type { UseJobPublishReturn } from './useJobPublish';

// Statistics & analytics
export { useJobStats } from './useJobStats';
export type { JobStats, UseJobStatsReturn } from './useJobStats';

// Filtering
export { useJobFiltering } from './useJobFiltering';
export type {
  JobFilterOptions,
  UseJobFilteringReturn,
  JobStatus,
  BudgetType,
  SortField,
  SortOrder,
} from './useJobFiltering';
