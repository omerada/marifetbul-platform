/**
 * ================================================
 * JOB API CLIENT
 * ================================================
 * API client for job/project request management
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1: Job System Implementation
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import type {
  PageResponse,
  JobResponse,
  JobStatus,
  JobBudgetType,
  JobExperienceLevel,
} from '@/types/backend-aligned';
import { JOB_ENDPOINTS } from './endpoints';

// ================================================
// TYPES
// ================================================

export interface CreateJobRequest {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  budgetType: JobBudgetType;
  budgetMin?: number;
  budgetMax?: number;
  hourlyRate?: number;
  requiredSkills: string[];
  experienceLevel: JobExperienceLevel;
  duration?: string;
  location?: string;
  isRemote: boolean;
  deadline?: string;
}

export interface UpdateJobRequest {
  title?: string;
  description?: string;
  categoryId?: string;
  subcategoryId?: string;
  budgetType?: JobBudgetType;
  budgetMin?: number;
  budgetMax?: number;
  hourlyRate?: number;
  requiredSkills?: string[];
  experienceLevel?: JobExperienceLevel;
  duration?: string;
  location?: string;
  isRemote?: boolean;
  deadline?: string;
  status?: JobStatus;
}

export interface JobFilters {
  status?: JobStatus | JobStatus[];
  categoryId?: string;
  subcategoryId?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetType?: JobBudgetType;
  experienceLevel?: JobExperienceLevel | JobExperienceLevel[];
  isRemote?: boolean;
  skills?: string[];
  location?: string;
  search?: string;
  employerId?: string;
  sortBy?:
    | 'latest'
    | 'oldest'
    | 'budget_high'
    | 'budget_low'
    | 'deadline'
    | 'proposals';
  page?: number;
  size?: number;
}

export interface JobStats {
  totalJobs: number;
  openJobs: number;
  inProgressJobs: number;
  completedJobs: number;
  closedJobs: number;
  totalProposals: number;
  averageProposalsPerJob: number;
}

// ================================================
// JOB API SERVICE
// ================================================

/**
 * Create a new job posting
 * @throws {ValidationError} Invalid job data
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Must be EMPLOYER role
 */
export async function createJob(data: CreateJobRequest): Promise<JobResponse> {
  return apiClient.post<JobResponse>(JOB_ENDPOINTS.CREATE, data);
}

/**
 * Get job by ID
 * @throws {NotFoundError} Job not found
 */
export async function getJobById(jobId: string): Promise<JobResponse> {
  return apiClient.get<JobResponse>(JOB_ENDPOINTS.GET_BY_ID(jobId));
}

/**
 * Update job (employer only, must be job owner)
 * @throws {ValidationError} Invalid job data
 * @throws {NotFoundError} Job not found
 * @throws {AuthorizationError} Not job owner
 */
export async function updateJob(
  jobId: string,
  data: UpdateJobRequest
): Promise<JobResponse> {
  return apiClient.put<JobResponse>(JOB_ENDPOINTS.UPDATE(jobId), data);
}

/**
 * Delete job (hard delete, employer only)
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not job owner
 * @throws {NotFoundError} Job not found
 * @throws {ValidationError} Cannot delete job with accepted proposals
 */
export async function deleteJob(jobId: string): Promise<void> {
  await apiClient.delete<void>(JOB_ENDPOINTS.DELETE(jobId));
}

/**
 * Close job (no more proposals accepted)
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not job owner
 * @throws {NotFoundError} Job not found
 */
export async function closeJob(jobId: string): Promise<JobResponse> {
  return apiClient.post<JobResponse>(JOB_ENDPOINTS.CLOSE(jobId), {});
}

/**
 * Reopen closed job
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not job owner
 * @throws {NotFoundError} Job not found
 * @throws {ValidationError} Job must be CLOSED status
 */
export async function reopenJob(jobId: string): Promise<JobResponse> {
  return apiClient.post<JobResponse>(JOB_ENDPOINTS.REOPEN(jobId), {});
}

/**
 * Publish draft job
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Not job owner
 * @throws {NotFoundError} Job not found
 * @throws {ValidationError} Job must be DRAFT status
 */
export async function publishJob(jobId: string): Promise<JobResponse> {
  return apiClient.post<JobResponse>(JOB_ENDPOINTS.PUBLISH(jobId), {});
}

/**
 * Get all jobs with filters and pagination
 */
export async function getJobs(
  filters?: JobFilters
): Promise<PageResponse<JobResponse>> {
  const params = new URLSearchParams();

  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      filters.status.forEach((s) => params.append('status', s));
    } else {
      params.set('status', filters.status);
    }
  }

  if (filters?.categoryId) {
    params.set('categoryId', filters.categoryId);
  }

  if (filters?.subcategoryId) {
    params.set('subcategoryId', filters.subcategoryId);
  }

  if (filters?.budgetMin !== undefined) {
    params.set('budgetMin', filters.budgetMin.toString());
  }

  if (filters?.budgetMax !== undefined) {
    params.set('budgetMax', filters.budgetMax.toString());
  }

  if (filters?.budgetType) {
    params.set('budgetType', filters.budgetType);
  }

  if (filters?.experienceLevel) {
    if (Array.isArray(filters.experienceLevel)) {
      filters.experienceLevel.forEach((level) =>
        params.append('experienceLevel', level)
      );
    } else {
      params.set('experienceLevel', filters.experienceLevel);
    }
  }

  if (filters?.isRemote !== undefined) {
    params.set('isRemote', filters.isRemote.toString());
  }

  if (filters?.skills && filters.skills.length > 0) {
    filters.skills.forEach((skill) => params.append('skills', skill));
  }

  if (filters?.location) {
    params.set('location', filters.location);
  }

  if (filters?.search) {
    params.set('search', filters.search);
  }

  if (filters?.employerId) {
    params.set('employerId', filters.employerId);
  }

  if (filters?.sortBy) {
    params.set('sort', filters.sortBy);
  }

  if (filters?.page !== undefined) {
    params.set('page', filters.page.toString());
  }

  if (filters?.size !== undefined) {
    params.set('size', filters.size.toString());
  }

  const queryString = params.toString();
  const url = `${JOB_ENDPOINTS.GET_ALL}${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<PageResponse<JobResponse>>(url);
}

/**
 * Search jobs
 */
export async function searchJobs(
  keyword: string,
  filters?: Omit<JobFilters, 'search'>
): Promise<PageResponse<JobResponse>> {
  return getJobs({ ...filters, search: keyword });
}

/**
 * Get jobs by category
 */
export async function getJobsByCategory(
  categoryId: string,
  filters?: Omit<JobFilters, 'categoryId'>
): Promise<PageResponse<JobResponse>> {
  return getJobs({ ...filters, categoryId });
}

/**
 * Get jobs by employer
 */
export async function getJobsByEmployer(
  employerId: string,
  filters?: Omit<JobFilters, 'employerId'>
): Promise<PageResponse<JobResponse>> {
  return getJobs({ ...filters, employerId });
}

/**
 * Get my jobs (current user's jobs)
 * @throws {AuthenticationError} Not authenticated
 * @throws {AuthorizationError} Must be EMPLOYER role
 */
export async function getMyJobs(
  filters?: Omit<JobFilters, 'employerId'>
): Promise<PageResponse<JobResponse>> {
  const params = new URLSearchParams();

  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      filters.status.forEach((s) => params.append('status', s));
    } else {
      params.set('status', filters.status);
    }
  }

  if (filters?.page !== undefined) {
    params.set('page', filters.page.toString());
  }

  if (filters?.size !== undefined) {
    params.set('size', filters.size.toString());
  }

  if (filters?.sortBy) {
    params.set('sort', filters.sortBy);
  }

  const queryString = params.toString();
  const url = `${JOB_ENDPOINTS.MY_JOBS}${queryString ? `?${queryString}` : ''}`;

  return apiClient.get<PageResponse<JobResponse>>(url);
}

/**
 * Get active jobs (OPEN status)
 */
export async function getActiveJobs(
  filters?: Omit<JobFilters, 'status'>
): Promise<PageResponse<JobResponse>> {
  return getJobs({ ...filters, status: 'OPEN' });
}

/**
 * Get closed jobs
 */
export async function getClosedJobs(
  filters?: Omit<JobFilters, 'status'>
): Promise<PageResponse<JobResponse>> {
  return getJobs({ ...filters, status: 'CLOSED' });
}

/**
 * Get job statistics
 * @throws {NotFoundError} Job not found
 */
export async function getJobStats(jobId: string): Promise<JobStats> {
  return apiClient.get<JobStats>(JOB_ENDPOINTS.GET_STATS(jobId));
}

/**
 * Get proposal count for a job
 * @throws {NotFoundError} Job not found
 */
export async function getJobProposalsCount(jobId: string): Promise<number> {
  const response = await apiClient.get<{ count: number }>(
    JOB_ENDPOINTS.GET_PROPOSALS_COUNT(jobId)
  );
  return response.count;
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

/**
 * Check if job can be edited
 */
export function canEditJob(job: JobResponse): boolean {
  return job.status === 'DRAFT' || job.status === 'OPEN';
}

/**
 * Check if job can be deleted
 */
export function canDeleteJob(job: JobResponse): boolean {
  // Can't delete if has accepted proposals or in progress
  return (
    job.status === 'DRAFT' ||
    (job.status === 'OPEN' && job.proposalCount === 0) ||
    job.status === 'CLOSED'
  );
}

/**
 * Check if job can be closed
 */
export function canCloseJob(job: JobResponse): boolean {
  return job.status === 'OPEN';
}

/**
 * Check if job can be reopened
 */
export function canReopenJob(job: JobResponse): boolean {
  return job.status === 'CLOSED';
}

/**
 * Check if job accepts proposals
 */
export function acceptsProposals(job: JobResponse): boolean {
  return job.status === 'OPEN';
}

/**
 * Get job status color
 */
export function getJobStatusColor(status: JobStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'gray';
    case 'OPEN':
      return 'green';
    case 'IN_PROGRESS':
      return 'blue';
    case 'COMPLETED':
      return 'purple';
    case 'CLOSED':
      return 'red';
    default:
      return 'gray';
  }
}

/**
 * Get job status label (Turkish)
 */
export function getJobStatusLabel(status: JobStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'Taslak';
    case 'OPEN':
      return 'Açık';
    case 'IN_PROGRESS':
      return 'Devam Ediyor';
    case 'COMPLETED':
      return 'Tamamlandı';
    case 'CLOSED':
      return 'Kapalı';
    default:
      return status;
  }
}

/**
 * Get budget type label (Turkish)
 */
export function getBudgetTypeLabel(type: JobBudgetType): string {
  switch (type) {
    case 'FIXED':
      return 'Sabit Fiyat';
    case 'HOURLY':
      return 'Saatlik';
    default:
      return type;
  }
}

/**
 * Get experience level label (Turkish)
 */
export function getExperienceLevelLabel(level: JobExperienceLevel): string {
  switch (level) {
    case 'ENTRY':
      return 'Başlangıç';
    case 'INTERMEDIATE':
      return 'Orta';
    case 'EXPERT':
      return 'Uzman';
    default:
      return level;
  }
}

/**
 * Format budget display
 */
export function formatBudget(job: JobResponse): string {
  if (job.budgetType === 'HOURLY' && job.hourlyRate) {
    return `${job.hourlyRate} ${job.currency}/saat`;
  }

  if (job.budgetType === 'FIXED') {
    if (job.budgetMin && job.budgetMax) {
      return `${job.budgetMin} - ${job.budgetMax} ${job.currency}`;
    }
    if (job.budgetMin) {
      return `${job.budgetMin} ${job.currency}+`;
    }
  }

  return 'Belirtilmemiş';
}

/**
 * Check if deadline is approaching (within 3 days)
 */
export function isDeadlineApproaching(job: JobResponse): boolean {
  if (!job.deadline) return false;

  const deadline = new Date(job.deadline);
  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  return deadline <= threeDaysFromNow && deadline > now;
}

/**
 * Check if deadline is passed
 */
export function isDeadlinePassed(job: JobResponse): boolean {
  if (!job.deadline) return false;

  const deadline = new Date(job.deadline);
  const now = new Date();

  return deadline < now;
}

/**
 * Get days until deadline
 */
export function getDaysUntilDeadline(job: JobResponse): number | null {
  if (!job.deadline) return null;

  const deadline = new Date(job.deadline);
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}
