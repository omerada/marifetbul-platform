'use client';

/**
 * ================================================
 * USE JOB CREATE HOOK
 * ================================================
 * Complete job creation hook with API integration
 *
 * Sprint 1 - Task 1.1: Job Posting System
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 25, 2025
 *
 * Features:
 * ✅ API integration (POST /api/v1/jobs)
 * ✅ Image upload (Cloudinary)
 * ✅ Draft save/load (localStorage)
 * ✅ Form validation
 * ✅ Multi-step state management
 * ✅ Error handling
 * ✅ Success callback
 */

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  jobPostingSchema,
  type JobPostingFormData,
  jobDraftSchema,
  type JobDraftFormData,
} from '@/lib/core/validations/jobs';
import { createJob, type CreateJobRequest } from '@/lib/api/jobs';
import { uploadToCloudinary } from '@/lib/services/file-upload.service';
import { useToast } from '@/hooks/core/useToast';
import logger from '@/lib/infrastructure/monitoring/logger';

// ================================================
// CONSTANTS
// ================================================

const DRAFT_STORAGE_KEY = 'marifetbul_job_draft';
const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// ================================================
// TYPES
// ================================================

export type JobCreationStep = 'basic' | 'requirements' | 'budget' | 'review';

export interface JobImage {
  file?: File;
  url: string;
  name: string;
  size: number;
  type: string;
  cloudinaryId?: string;
}

export interface UseJobCreateOptions {
  /** Auto-load draft on mount */
  autoLoadDraft?: boolean;
  /** Redirect path after success */
  redirectPath?: string;
  /** Callback on successful creation */
  onSuccess?: (jobId: string) => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

export interface UseJobCreateReturn {
  // Form state
  form: ReturnType<typeof useForm<JobPostingFormData>>;
  isDirty: boolean;
  isValid: boolean;

  // Step management
  currentStep: JobCreationStep;
  setCurrentStep: (step: JobCreationStep) => void;
  nextStep: () => void;
  previousStep: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;

  // Images
  images: JobImage[];
  isUploadingImages: boolean;
  addImages: (files: File[]) => Promise<void>;
  removeImage: (index: number) => void;

  // Skills management
  skills: string[];
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;

  // Requirements management
  requirements: string[];
  addRequirement: (requirement: string) => void;
  removeRequirement: (index: number) => void;

  // Draft management
  saveDraft: () => void;
  loadDraft: () => void;
  clearDraft: () => void;
  hasDraft: boolean;

  // Form actions
  createJob: () => Promise<void>;
  reset: () => void;
  setFieldValue: <K extends keyof JobPostingFormData>(
    field: K,
    value: JobPostingFormData[K]
  ) => void;

  // State
  isCreating: boolean;
  error: string | null;

  // Computed values
  budgetType: JobPostingFormData['budgetType'];
  estimatedBudget: number | null;
}

const STEPS: JobCreationStep[] = ['basic', 'requirements', 'budget', 'review'];

// ================================================
// HOOK
// ================================================

export function useJobCreate({
  autoLoadDraft = true,
  redirectPath,
  onSuccess,
  onError,
}: UseJobCreateOptions = {}): UseJobCreateReturn {
  const router = useRouter();
  const { toast } = useToast();

  // ==================== STATE ====================

  const [currentStep, setCurrentStep] = useState<JobCreationStep>('basic');
  const [images, setImages] = useState<JobImage[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  // ==================== FORM ====================

  const form = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'web-development',
      budgetType: 'FIXED',
      experienceLevel: 'INTERMEDIATE',
      isRemote: true,
      requiredSkills: [],
      requirements: [],
    },
    mode: 'onChange',
  });

  const {
    watch,
    setValue,
    formState: { isDirty, isValid },
    handleSubmit,
    reset: resetForm,
  } = form;

  const budgetType = watch('budgetType');
  const skills = watch('requiredSkills') || [];
  const requirements = watch('requirements') || [];

  // ==================== EFFECTS ====================

  // Auto-load draft on mount
  useEffect(() => {
    if (autoLoadDraft) {
      loadDraft();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-save draft on form change (debounced)
  useEffect(() => {
    if (isDirty) {
      const timer = setTimeout(() => {
        saveDraft();
      }, 3000); // 3 seconds debounce

      return () => clearTimeout(timer);
    }
  }, [watch(), isDirty]); // eslint-disable-line react-hooks/exhaustive-deps

  // ==================== STEP MANAGEMENT ====================

  const stepIndex = STEPS.indexOf(currentStep);
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === STEPS.length - 1;

  const nextStep = useCallback(() => {
    if (!isLastStep) {
      setCurrentStep(STEPS[stepIndex + 1]);
    }
  }, [stepIndex, isLastStep]);

  const previousStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStep(STEPS[stepIndex - 1]);
    }
  }, [stepIndex, isFirstStep]);

  // ==================== IMAGE HANDLERS ====================

  const addImages = useCallback(
    async (files: File[]) => {
      try {
        // Validate count
        if (images.length + files.length > MAX_IMAGES) {
          toast({
            title: 'Çok fazla dosya',
            description: `En fazla ${MAX_IMAGES} görsel yükleyebilirsiniz`,
            variant: 'destructive',
          });
          return;
        }

        // Validate size
        for (const file of files) {
          if (file.size > MAX_IMAGE_SIZE) {
            toast({
              title: 'Dosya çok büyük',
              description: `${file.name} dosyası çok büyük. Maksimum 10MB olmalıdır.`,
              variant: 'destructive',
            });
            return;
          }
        }

        setIsUploadingImages(true);

        const newImages: JobImage[] = [];

        for (const file of files) {
          // Create preview
          const preview = URL.createObjectURL(file);

          // Upload to Cloudinary
          const uploadResult = await uploadToCloudinary(file, {
            folder: 'marifetbul_jobs',
            transformation: {
              width: 1200,
              height: 800,
              crop: 'limit',
              quality: 'auto',
            },
          });

          newImages.push({
            file,
            url: uploadResult.secure_url,
            name: file.name,
            size: file.size,
            type: file.type,
            cloudinaryId: uploadResult.public_id,
          });

          // Cleanup preview
          URL.revokeObjectURL(preview);
        }

        setImages((prev) => [...prev, ...newImages]);

        toast({
          title: 'Görseller yüklendi',
          description: `${files.length} görsel başarıyla yüklendi`,
        });

        logger.info('[useJobCreate] Images uploaded', {
          count: files.length,
        });
      } catch (err) {
        logger.error('[useJobCreate] Image upload failed', err as Error);
        toast({
          title: 'Yükleme hatası',
          description: 'Görseller yüklenirken bir hata oluştu',
          variant: 'destructive',
        });
      } finally {
        setIsUploadingImages(false);
      }
    },
    [images.length, toast]
  );

  const removeImage = useCallback((index: number) => {
    setImages((prev) => {
      const newImages = [...prev];
      const removed = newImages.splice(index, 1)[0];

      // Cleanup object URL if exists
      if (removed.file) {
        URL.revokeObjectURL(removed.url);
      }

      return newImages;
    });

    logger.debug('[useJobCreate] Image removed', { index });
  }, []);

  // ==================== SKILLS HANDLERS ====================

  const addSkill = useCallback(
    (skill: string) => {
      const trimmed = skill.trim();
      if (!trimmed) return;

      const currentSkills = form.getValues('requiredSkills') || [];

      if (currentSkills.includes(trimmed)) {
        toast({
          title: 'Beceri mevcut',
          description: 'Bu beceri zaten eklenmiş',
          variant: 'destructive',
        });
        return;
      }

      if (currentSkills.length >= 15) {
        toast({
          title: 'Çok fazla beceri',
          description: 'En fazla 15 beceri ekleyebilirsiniz',
          variant: 'destructive',
        });
        return;
      }

      setValue('requiredSkills', [...currentSkills, trimmed], {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [form, setValue, toast]
  );

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

  // ==================== REQUIREMENTS HANDLERS ====================

  const addRequirement = useCallback(
    (requirement: string) => {
      const trimmed = requirement.trim();
      if (!trimmed) return;

      const currentRequirements = form.getValues('requirements') || [];

      if (currentRequirements.length >= 10) {
        toast({
          title: 'Çok fazla gereksinim',
          description: 'En fazla 10 gereksinim ekleyebilirsiniz',
          variant: 'destructive',
        });
        return;
      }

      setValue('requirements', [...currentRequirements, trimmed], {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [form, setValue, toast]
  );

  const removeRequirement = useCallback(
    (index: number) => {
      const currentRequirements = form.getValues('requirements') || [];
      const newRequirements = currentRequirements.filter((_, i) => i !== index);
      setValue('requirements', newRequirements, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [form, setValue]
  );

  // ==================== DRAFT MANAGEMENT ====================

  const saveDraft = useCallback(() => {
    try {
      const formData = form.getValues();
      const draft: JobDraftFormData = {
        ...formData,
        attachments: images.map((img) => ({
          name: img.name,
          url: img.url,
          type: img.type,
          size: img.size,
        })),
      };

      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
      setHasDraft(true);

      logger.debug('[useJobCreate] Draft saved');
    } catch (err) {
      logger.error('[useJobCreate] Failed to save draft', err as Error);
    }
  }, [form, images]);

  const loadDraft = useCallback(() => {
    try {
      const stored = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!stored) {
        setHasDraft(false);
        return;
      }

      const draft: JobDraftFormData = JSON.parse(stored);

      // Validate draft
      const validation = jobDraftSchema.safeParse(draft);
      if (!validation.success) {
        logger.warn('[useJobCreate] Invalid draft, clearing', {
          errors: validation.error.errors,
        });
        clearDraft();
        return;
      }

      // Load form data
      Object.entries(draft).forEach(([key, value]) => {
        if (key !== 'attachments' && value !== undefined) {
          setValue(key as keyof JobPostingFormData, value as never, {
            shouldValidate: false,
            shouldDirty: false,
          });
        }
      });

      // Load images
      if (draft.attachments) {
        setImages(
          draft.attachments.map((att) => ({
            url: att.url,
            name: att.name,
            size: att.size,
            type: att.type,
          }))
        );
      }

      setHasDraft(true);

      toast({
        title: 'Taslak yüklendi',
        description: 'Kaydettiğiniz taslak geri yüklendi',
      });

      logger.info('[useJobCreate] Draft loaded');
    } catch (err) {
      logger.error('[useJobCreate] Failed to load draft', err as Error);
      clearDraft();
    }
  }, [form, setValue, toast]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setHasDraft(false);
    logger.debug('[useJobCreate] Draft cleared');
  }, []);

  // ==================== JOB CREATION ====================

  const createJobHandler = handleSubmit(async (data: JobPostingFormData) => {
    try {
      setIsCreating(true);
      setError(null);

      logger.info('[useJobCreate] Creating job', { title: data.title });

      // Prepare request - map form data to backend format
      const request: CreateJobRequest = {
        title: data.title,
        description: data.description,
        categoryId: data.category, // Will be mapped to actual category ID
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

      // Create job via API
      const response = await createJob(request);

      logger.info('[useJobCreate] Job created successfully', {
        jobId: response.id,
      });

      // Clear draft
      clearDraft();

      // Show success message
      toast({
        title: 'İş ilanı oluşturuldu',
        description: 'İlanınız başarıyla yayınlandı',
      });

      // Callback
      onSuccess?.(response.id);

      // Redirect
      if (redirectPath) {
        router.push(redirectPath);
      } else {
        router.push(`/marketplace/jobs/${response.id}`);
      }
    } catch (err) {
      const error = err as Error;
      logger.error('[useJobCreate] Job creation failed', error);

      setError(error.message || 'İş ilanı oluşturulurken bir hata oluştu');

      toast({
        title: 'Hata',
        description: error.message || 'İş ilanı oluşturulamadı',
        variant: 'destructive',
      });

      onError?.(error);
    } finally {
      setIsCreating(false);
    }
  });

  // ==================== HELPERS ====================

  const setFieldValue = useCallback(
    <K extends keyof JobPostingFormData>(
      field: K,
      value: JobPostingFormData[K]
    ) => {
      setValue(field as never, value as never, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue]
  );

  const reset = useCallback(() => {
    resetForm();
    setImages([]);
    setCurrentStep('basic');
    setError(null);
    clearDraft();
    logger.debug('[useJobCreate] Form reset');
  }, [resetForm, clearDraft]);

  // Compute estimated budget
  const budgetMin = watch('budgetMin');
  const budgetMax = watch('budgetMax');
  const estimatedBudget =
    budgetType === 'FIXED' ? budgetMax || budgetMin || null : null;

  // ==================== RETURN ====================

  return {
    // Form state
    form,
    isDirty,
    isValid,

    // Step management
    currentStep,
    setCurrentStep,
    nextStep,
    previousStep,
    isFirstStep,
    isLastStep,

    // Images
    images,
    isUploadingImages,
    addImages,
    removeImage,

    // Skills
    skills,
    addSkill,
    removeSkill,

    // Requirements
    requirements,
    addRequirement,
    removeRequirement,

    // Draft
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,

    // Actions
    createJob: createJobHandler,
    reset,
    setFieldValue,

    // State
    isCreating,
    error,

    // Computed
    budgetType,
    estimatedBudget,
  };
}
