/**
 * ================================================
 * USE JOBS HOOK UNIT TESTS
 * ================================================
 * Comprehensive tests for job management hook
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 6: Testing Coverage
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useJobs } from '../useJobs';
import type { JobResponse } from '@/types/backend-aligned';

// Mock logger
jest.mock('@/lib/infrastructure/monitoring/logger', () => ({
  default: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock error handler
jest.mock('@/lib/api/error-handler', () => ({
  errorHandler: {
    handle: jest.fn((error) => ({
      getUserMessage: () => error.message || 'An error occurred',
    })),
  },
}));

// Mock jobs API
jest.mock('@/lib/api/jobs', () => ({
  getJobs: jest.fn(),
  getMyJobs: jest.fn(),
  getJobById: jest.fn(),
  createJob: jest.fn(),
  updateJob: jest.fn(),
  deleteJob: jest.fn(),
  publishJob: jest.fn(),
  closeJob: jest.fn(),
  reopenJob: jest.fn(),
}));

import { toast } from 'sonner';
import * as jobsApi from '@/lib/api/jobs';

const mockGetJobs = jobsApi.getJobs as jest.Mock;
const mockGetMyJobs = jobsApi.getMyJobs as jest.Mock;
const mockGetJobById = jobsApi.getJobById as jest.Mock;
const mockCreateJob = jobsApi.createJob as jest.Mock;
const mockUpdateJob = jobsApi.updateJob as jest.Mock;
const mockDeleteJob = jobsApi.deleteJob as jest.Mock;
const mockPublishJob = jobsApi.publishJob as jest.Mock;
const mockCloseJob = jobsApi.closeJob as jest.Mock;
const mockReopenJob = jobsApi.reopenJob as jest.Mock;

describe('useJobs Hook', () => {
  const mockJob: JobResponse = {
    id: 'job-123',
    title: 'Senior Developer',
    description: 'Job description',
    budget: 5000,
    category: 'Technology',
    status: 'OPEN',
    employerId: 'emp-123',
    employerName: 'Test Company',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    proposalCount: 0,
  };

  const mockJobsList: JobResponse[] = [
    mockJob,
    { ...mockJob, id: 'job-456', title: 'Junior Developer' },
  ];

  const mockPaginatedResponse = {
    content: mockJobsList,
    page: 0,
    size: 10,
    totalElements: 2,
    totalPages: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Fetch Operations', () => {
    it('should fetch jobs successfully', async () => {
      mockGetJobs.mockResolvedValueOnce(mockPaginatedResponse);

      const { result } = renderHook(() => useJobs());

      expect(result.current.isLoading).toBe(false);
      expect(result.current.jobs).toBeNull();

      await act(async () => {
        await result.current.fetchJobs();
      });

      expect(mockGetJobs).toHaveBeenCalled();
      expect(result.current.jobs).toEqual(mockJobsList);
      expect(result.current.pagination).toEqual({
        page: 0,
        size: 10,
        totalElements: 2,
        totalPages: 1,
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should fetch jobs with filters', async () => {
      mockGetJobs.mockResolvedValueOnce(mockPaginatedResponse);

      const { result } = renderHook(() => useJobs());

      const filters = {
        category: 'Technology',
        minBudget: 1000,
        maxBudget: 10000,
      };

      await act(async () => {
        await result.current.fetchJobs(filters);
      });

      expect(mockGetJobs).toHaveBeenCalledWith(filters);
    });

    it('should handle fetch jobs error', async () => {
      const error = new Error('Failed to fetch jobs');
      mockGetJobs.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useJobs());

      await act(async () => {
        await result.current.fetchJobs();
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.jobs).toBeNull();
      expect(toast.error).toHaveBeenCalledWith('İş ilanları yüklenemedi');
    });

    it('should fetch my jobs successfully', async () => {
      mockGetMyJobs.mockResolvedValueOnce(mockPaginatedResponse);

      const { result } = renderHook(() => useJobs());

      await act(async () => {
        await result.current.fetchMyJobs();
      });

      expect(mockGetMyJobs).toHaveBeenCalled();
      expect(result.current.jobs).toEqual(mockJobsList);
    });

    it('should fetch job by ID successfully', async () => {
      mockGetJobById.mockResolvedValueOnce(mockJob);

      const { result } = renderHook(() => useJobs());

      await act(async () => {
        await result.current.fetchJobById('job-123');
      });

      expect(mockGetJobById).toHaveBeenCalledWith('job-123');
      expect(result.current.currentJob).toEqual(mockJob);
    });
  });

  describe('Create Operation', () => {
    it('should create job successfully', async () => {
      const newJobData = {
        title: 'New Job',
        description: 'Description',
        budget: 3000,
        category: 'Technology',
      };

      const createdJob = { ...mockJob, ...newJobData };
      mockCreateJob.mockResolvedValueOnce(createdJob);

      const { result } = renderHook(() => useJobs());

      let returnedJob: JobResponse | null = null;

      await act(async () => {
        returnedJob = await result.current.createJob(newJobData);
      });

      expect(mockCreateJob).toHaveBeenCalledWith(newJobData);
      expect(returnedJob).toEqual(createdJob);
      expect(toast.success).toHaveBeenCalledWith(
        'İş ilanı oluşturuldu',
        expect.any(Object)
      );
    });

    it('should add created job to jobs list', async () => {
      mockGetJobs.mockResolvedValueOnce(mockPaginatedResponse);

      const { result } = renderHook(() => useJobs());

      // First fetch jobs
      await act(async () => {
        await result.current.fetchJobs();
      });

      const newJob = { ...mockJob, id: 'job-new', title: 'Brand New Job' };
      mockCreateJob.mockResolvedValueOnce(newJob);

      // Create new job
      await act(async () => {
        await result.current.createJob({
          title: 'Brand New Job',
          description: 'Description',
          budget: 5000,
          category: 'Technology',
        });
      });

      // New job should be at the beginning
      expect(result.current.jobs?.[0]).toEqual(newJob);
      expect(result.current.jobs?.length).toBe(3);
    });

    it('should handle create job error', async () => {
      const error = new Error('Failed to create job');
      mockCreateJob.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useJobs());

      let returnedJob: JobResponse | null = null;

      await act(async () => {
        returnedJob = await result.current.createJob({
          title: 'Test',
          description: 'Test',
          budget: 1000,
          category: 'Technology',
        });
      });

      expect(returnedJob).toBeNull();
      expect(result.current.error).toBeTruthy();
      expect(toast.error).toHaveBeenCalled();
    });
  });

  describe('Update Operation', () => {
    it('should update job successfully', async () => {
      const updatedJob = { ...mockJob, title: 'Updated Title' };
      mockUpdateJob.mockResolvedValueOnce(updatedJob);

      // Pre-populate jobs list
      mockGetJobs.mockResolvedValueOnce(mockPaginatedResponse);

      const { result } = renderHook(() => useJobs());

      await act(async () => {
        await result.current.fetchJobs();
      });

      let success: boolean = false;

      await act(async () => {
        success = await result.current.updateJob('job-123', {
          title: 'Updated Title',
        });
      });

      expect(success).toBe(true);
      expect(mockUpdateJob).toHaveBeenCalledWith('job-123', {
        title: 'Updated Title',
      });
      expect(toast.success).toHaveBeenCalledWith('İş ilanı güncellendi');
    });

    it('should update job in list', async () => {
      mockGetJobs.mockResolvedValueOnce(mockPaginatedResponse);

      const { result } = renderHook(() => useJobs());

      await act(async () => {
        await result.current.fetchJobs();
      });

      const updatedJob = { ...mockJob, title: 'Updated Title' };
      mockUpdateJob.mockResolvedValueOnce(updatedJob);

      await act(async () => {
        await result.current.updateJob('job-123', { title: 'Updated Title' });
      });

      const foundJob = result.current.jobs?.find((j) => j.id === 'job-123');
      expect(foundJob?.title).toBe('Updated Title');
    });

    it('should update current job if it matches', async () => {
      mockGetJobById.mockResolvedValueOnce(mockJob);

      const { result } = renderHook(() => useJobs());

      await act(async () => {
        await result.current.fetchJobById('job-123');
      });

      const updatedJob = { ...mockJob, title: 'Updated Title' };
      mockUpdateJob.mockResolvedValueOnce(updatedJob);

      await act(async () => {
        await result.current.updateJob('job-123', { title: 'Updated Title' });
      });

      expect(result.current.currentJob?.title).toBe('Updated Title');
    });

    it('should handle update job error', async () => {
      const error = new Error('Failed to update job');
      mockUpdateJob.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useJobs());

      let success: boolean = true;

      await act(async () => {
        success = await result.current.updateJob('job-123', {
          title: 'Updated',
        });
      });

      expect(success).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Delete Operation', () => {
    it('should delete job successfully', async () => {
      mockDeleteJob.mockResolvedValueOnce(undefined);
      mockGetJobs.mockResolvedValueOnce(mockPaginatedResponse);

      const { result } = renderHook(() => useJobs());

      await act(async () => {
        await result.current.fetchJobs();
      });

      let success: boolean = false;

      await act(async () => {
        success = await result.current.deleteJob('job-123');
      });

      expect(success).toBe(true);
      expect(mockDeleteJob).toHaveBeenCalledWith('job-123');
      expect(toast.success).toHaveBeenCalledWith('İş ilanı silindi');
    });

    it('should remove deleted job from list', async () => {
      mockGetJobs.mockResolvedValueOnce(mockPaginatedResponse);

      const { result } = renderHook(() => useJobs());

      await act(async () => {
        await result.current.fetchJobs();
      });

      const initialCount = result.current.jobs?.length;

      mockDeleteJob.mockResolvedValueOnce(undefined);

      await act(async () => {
        await result.current.deleteJob('job-123');
      });

      expect(result.current.jobs?.length).toBe((initialCount || 0) - 1);
      expect(
        result.current.jobs?.find((j) => j.id === 'job-123')
      ).toBeUndefined();
    });

    it('should handle delete job error', async () => {
      const error = new Error('Failed to delete job');
      mockDeleteJob.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useJobs());

      let success: boolean = true;

      await act(async () => {
        success = await result.current.deleteJob('job-123');
      });

      expect(success).toBe(false);
      expect(result.current.error).toBeTruthy();
    });
  });

  describe('Status Operations', () => {
    beforeEach(async () => {
      mockGetJobs.mockResolvedValueOnce(mockPaginatedResponse);
    });

    it('should publish job successfully', async () => {
      const publishedJob = { ...mockJob, status: 'PUBLISHED' };
      mockPublishJob.mockResolvedValueOnce(publishedJob);

      const { result } = renderHook(() => useJobs());

      await act(async () => {
        await result.current.fetchJobs();
      });

      let success: boolean = false;

      await act(async () => {
        success = await result.current.publishJob('job-123');
      });

      expect(success).toBe(true);
      expect(mockPublishJob).toHaveBeenCalledWith('job-123');
    });

    it('should close job successfully', async () => {
      const closedJob = { ...mockJob, status: 'CLOSED' };
      mockCloseJob.mockResolvedValueOnce(closedJob);

      const { result } = renderHook(() => useJobs());

      await act(async () => {
        await result.current.fetchJobs();
      });

      let success: boolean = false;

      await act(async () => {
        success = await result.current.closeJob('job-123');
      });

      expect(success).toBe(true);
      expect(mockCloseJob).toHaveBeenCalledWith('job-123');
    });

    it('should reopen job successfully', async () => {
      const reopenedJob = { ...mockJob, status: 'OPEN' };
      mockReopenJob.mockResolvedValueOnce(reopenedJob);

      const { result } = renderHook(() => useJobs());

      await act(async () => {
        await result.current.fetchJobs();
      });

      let success: boolean = false;

      await act(async () => {
        success = await result.current.reopenJob('job-123');
      });

      expect(success).toBe(true);
      expect(mockReopenJob).toHaveBeenCalledWith('job-123');
    });
  });

  describe('Utility Methods', () => {
    it('should clear error', async () => {
      const error = new Error('Test error');
      mockGetJobs.mockRejectedValueOnce(error);

      const { result } = renderHook(() => useJobs());

      await act(async () => {
        await result.current.fetchJobs();
      });

      expect(result.current.error).toBeTruthy();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });

    it('should reset hook state', async () => {
      mockGetJobs.mockResolvedValueOnce(mockPaginatedResponse);

      const { result } = renderHook(() => useJobs());

      await act(async () => {
        await result.current.fetchJobs();
      });

      expect(result.current.jobs).toBeTruthy();

      act(() => {
        result.current.reset();
      });

      expect(result.current.jobs).toBeNull();
      expect(result.current.currentJob).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.pagination).toBeNull();
    });
  });

  describe('Loading States', () => {
    it('should set loading state during fetch', async () => {
      let resolveGetJobs: (value: typeof mockPaginatedResponse) => void;
      const getJobsPromise = new Promise<typeof mockPaginatedResponse>(
        (resolve) => {
          resolveGetJobs = resolve;
        }
      );

      mockGetJobs.mockReturnValueOnce(getJobsPromise);

      const { result } = renderHook(() => useJobs());

      act(() => {
        result.current.fetchJobs();
      });

      // Should be loading
      await waitFor(() => {
        expect(result.current.isLoading).toBe(true);
      });

      // Resolve
      await act(async () => {
        resolveGetJobs!(mockPaginatedResponse);
        await getJobsPromise;
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('should set creating state during create', async () => {
      mockCreateJob.mockResolvedValueOnce(mockJob);

      const { result } = renderHook(() => useJobs());

      expect(result.current.isCreating).toBe(false);

      await act(async () => {
        await result.current.createJob({
          title: 'Test',
          description: 'Test',
          budget: 1000,
          category: 'Technology',
        });
      });

      expect(result.current.isCreating).toBe(false);
    });

    it('should set updating state during update', async () => {
      mockUpdateJob.mockResolvedValueOnce(mockJob);

      const { result } = renderHook(() => useJobs());

      expect(result.current.isUpdating).toBe(false);

      await act(async () => {
        await result.current.updateJob('job-123', { title: 'Updated' });
      });

      expect(result.current.isUpdating).toBe(false);
    });

    it('should set deleting state during delete', async () => {
      mockDeleteJob.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useJobs());

      expect(result.current.isDeleting).toBe(false);

      await act(async () => {
        await result.current.deleteJob('job-123');
      });

      expect(result.current.isDeleting).toBe(false);
    });
  });
});
