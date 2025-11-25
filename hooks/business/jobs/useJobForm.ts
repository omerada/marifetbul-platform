'use client';

/**
 * ================================================
 * USE JOB FORM HOOK
 * ================================================
 * Form state management hook for job creation/editing
 *
 * Sprint 2 - Story 4: Jobs Hooks Expansion
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 25, 2025
 */

import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  jobPostingSchema,
  type JobPostingFormData,
} from '@/lib/core/validations/jobs';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// TYPES
// ================================================

export interface UseJobFormOptions {
  /** Initial form data */
  defaultValues?: Partial<JobPostingFormData>;

  /** Mode: create or edit */
  mode?: 'create' | 'edit';

  /** Callback on successful submission */
  onSuccess?: (data: JobPostingFormData) => void;

  /** Callback on error */
  onError?: (error: Error) => void;
}

export interface UseJobFormReturn {
  // Form state
  form: ReturnType<typeof useForm<JobPostingFormData>>;
  isDirty: boolean;
  isValid: boolean;

  // File attachments
  attachments: File[];
  addAttachment: (file: File) => void;
  removeAttachment: (index: number) => void;

  // Skills management
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;

  // Form actions
  submit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  reset: () => void;
  setFieldValue: <K extends keyof JobPostingFormData>(
    field: K,
    value: JobPostingFormData[K]
  ) => void;

  // Computed values
  budgetType: JobPostingFormData['budgetType'];
  requiredSkills: string[];
}

// ================================================
// HOOK
// ================================================

export function useJobForm({
  defaultValues,
  mode = 'create',
  onSuccess,
  onError,
}: UseJobFormOptions = {}): UseJobFormReturn {
  // ==================== STATE ====================

  const [attachments, setAttachments] = useState<File[]>([]);

  // ==================== FORM ====================

  const form = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      budgetType: 'FIXED',
      experienceLevel: 'INTERMEDIATE',
      isRemote: true,
      requiredSkills: [],
      ...defaultValues,
    },
    mode: 'onChange',
  });

  const {
    watch,
    setValue,
    formState: { isDirty, isValid },
  } = form;

  // ==================== HANDLERS ====================

  /**
   * Add file attachment
   */
  const addAttachment = useCallback((file: File) => {
    setAttachments((prev) => [...prev, file]);
    logger.debug('File attached', { fileName: file.name, size: file.size });
  }, []);

  /**
   * Remove file attachment
   */
  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    logger.debug('File removed', { index });
  }, []);

  /**
   * Add skill to required skills
   */
  const addSkill = useCallback(
    (skill: string) => {
      const currentSkills = form.getValues('requiredSkills') || [];
      if (!currentSkills.includes(skill)) {
        setValue('requiredSkills', [...currentSkills, skill], {
          shouldValidate: true,
          shouldDirty: true,
        });
      }
    },
    [form, setValue]
  );

  /**
   * Remove skill from required skills
   */
  const removeSkill = useCallback(
    (skill: string) => {
      const currentSkills = form.getValues('requiredSkills') || [];
      setValue(
        'requiredSkills',
        currentSkills.filter((s) => s !== skill),
        { shouldValidate: true, shouldDirty: true }
      );
    },
    [form, setValue]
  );

  /**
   * Set field value with validation
   */
  const setFieldValue = useCallback(
    <K extends keyof JobPostingFormData>(
      field: K,
      value: JobPostingFormData[K]
    ) => {
      // Type assertion needed due to react-hook-form complex type inference
      setValue(field as never, value as never, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue]
  );

  /**
   * Reset form to initial state
   */
  const reset = useCallback(() => {
    form.reset();
    setAttachments([]);
    logger.debug('Form reset', { mode });
  }, [form, mode]);

  /**
   * Handle form submission
   */
  const submit = form.handleSubmit(
    (data) => {
      try {
        logger.info('Job form submitted', { mode, jobId: data.title });
        onSuccess?.(data);
      } catch (error) {
        logger.error('Job form submission error', error as Error);
        onError?.(error as Error);
      }
    },
    (errors) => {
      logger.warn('Job form validation failed', { errors });
    }
  );

  // ==================== RETURN ====================

  return {
    // Form state
    form,
    isDirty,
    isValid,

    // Attachments
    attachments,
    addAttachment,
    removeAttachment,

    // Skills
    addSkill,
    removeSkill,

    // Actions
    submit,
    reset,
    setFieldValue,

    // Computed values
    budgetType: watch('budgetType'),
    requiredSkills: watch('requiredSkills') || [],
  };
}
