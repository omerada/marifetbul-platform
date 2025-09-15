import useSWR from 'swr';
import { Job, JobFilters, PaginatedResponse, ApiResponse } from '@/types';
import { apiClient } from '@/lib/api/client';

// Typed fetchers for jobs
const jobFetcher = async (url: string): Promise<ApiResponse<Job>> => {
  return apiClient.get<ApiResponse<Job>>(url);
};

const jobsFetcherWithParams = async ([url, params]: readonly [
  string,
  Record<string, string>,
]): Promise<ApiResponse<PaginatedResponse<Job>>> => {
  return apiClient.get<ApiResponse<PaginatedResponse<Job>>>(url, params);
};

// Hook for fetching jobs with pagination and filters
export function useJobs(page = 1, limit = 10, filters: JobFilters = {}) {
  const params = {
    page: page.toString(),
    limit: limit.toString(),
    ...Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => value !== undefined && value !== ''
      )
    ),
  };

  const { data, error, mutate, isLoading } = useSWR(
    ['/jobs', params] as const,
    jobsFetcherWithParams,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    jobs: data?.data?.data || [],
    pagination: data?.data?.pagination,
    isLoading,
    error,
    mutate,
    refetch: mutate,
  };
}

// Hook for fetching a single job
export function useJob(id: string) {
  const { data, error, mutate, isLoading } = useSWR(
    id ? `/jobs/${id}` : null,
    jobFetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    job: data?.data,
    isLoading,
    error,
    mutate,
  };
}

// Hook for creating a new job
export function useCreateJob() {
  const createJob = async (jobData: Partial<Job>) => {
    try {
      const response = await apiClient.post<ApiResponse<Job>>('/jobs', jobData);
      return response;
    } catch {
      throw new Error('Failed to create job');
    }
  };

  return { createJob };
}

// Hook for updating a job
export function useUpdateJob() {
  const updateJob = async (id: string, jobData: Partial<Job>) => {
    try {
      const response = await apiClient.put<ApiResponse<Job>>(
        `/jobs/${id}`,
        jobData
      );
      return response;
    } catch {
      throw new Error('Failed to update job');
    }
  };

  return { updateJob };
}

// Hook for deleting a job
export function useDeleteJob() {
  const deleteJob = async (id: string) => {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/jobs/${id}`);
      return response;
    } catch {
      throw new Error('Failed to delete job');
    }
  };

  return { deleteJob };
}
