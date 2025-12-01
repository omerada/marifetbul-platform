'use client';

/**
 * ================================================
 * JOB EDIT FORM COMPONENT
 * ================================================
 * Form for editing existing job postings
 * Reuses JobCreateForm logic with edit mode
 *
 * Features:
 * - Pre-filled with existing job data
 * - Validation before save
 * - Preview changes before submitting
 * - Status change controls
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2: Job Management Workflow
 */

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { JobCreateForm } from './JobCreateForm';
import { updateJob } from '@/lib/api/jobs';
import type { JobResponse } from '@/types/backend-aligned';
import type { JobPostingFormData } from '@/lib/core/validations/jobs';
import logger from '@/lib/infrastructure/monitoring/logger';
import { toast } from 'sonner';

// ================================================
// TYPES
// ================================================

export interface JobEditFormProps {
  job: JobResponse;
  onSuccess?: (updatedJob: JobResponse) => void;
  onCancel?: () => void;
}

// ================================================
// COMPONENT
// ================================================

export function JobEditForm({ job, onSuccess, onCancel }: JobEditFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==================== HANDLERS ====================

  const handleSubmit = async (data: JobPostingFormData) => {
    try {
      setIsSubmitting(true);
      logger.info('Updating job', { jobId: job.id, title: data.title });

      // Convert form data to UpdateJobRequest
      const updateData = {
        title: data.title,
        description: data.description,
        category: data.category,
        budgetType: data.budgetType,
        budgetMin: data.budgetMin,
        budgetMax: data.budgetMax,
        hourlyRate: data.hourlyRate,
        requiredSkills: data.requiredSkills,
        experienceLevel: data.experienceLevel,
        duration: data.duration,
        location: data.location,
        isRemote: data.isRemote,
        deadline: data.deadline,
      };

      const updatedJob = await updateJob(job.id, updateData);

      toast.success('İş ilanı başarıyla güncellendi!');
      logger.info('Job updated successfully', { jobId: updatedJob.id });

      // Callback or redirect
      if (onSuccess) {
        onSuccess(updatedJob);
      } else {
        router.push(`/marketplace/jobs/${updatedJob.id}`);
        router.refresh();
      }
    } catch (error) {
      logger.error('Failed to update job', error as Error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'İş ilanı güncellenirken bir hata oluştu'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== RENDER ====================

  // Convert JobResponse to JobPostingFormData for form default values
  const defaultValues: Partial<JobPostingFormData> = {
    title: job.title,
    description: job.description,
    category: job.category as any, // Backend returns CategoryResponse, form expects enum
    // Note: Backend doesn't send subcategoryId, using category only
    budgetType: job.budgetType,
    budgetMin: job.budgetMin,
    budgetMax: job.budgetMax,
    hourlyRate: job.hourlyRate,
    requiredSkills: job.requiredSkills || [],
    experienceLevel: job.experienceLevel,
    duration: job.duration,
    location: job.location,
    isRemote: job.isRemote,
    deadline: job.deadline,
  };

  return (
    <JobCreateForm
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onCancel={onCancel}
      isSubmitting={isSubmitting}
    />
  );
}
