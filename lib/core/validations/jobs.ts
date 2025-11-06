/**
 * ================================================
 * JOB POSTING VALIDATION SCHEMAS
 * ================================================
 * Validation schemas for job posting forms
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 6, 2025
 * Sprint: Job Posting & Proposal System - Story 1
 */

import { z } from 'zod';
import { baseSchemas } from './base';

// ================================================
// JOB POSTING SCHEMA
// ================================================

/**
 * Job Budget Type
 */
export const jobBudgetTypeEnum = z.enum(['FIXED', 'HOURLY']);

/**
 * Job Experience Level
 */
export const jobExperienceLevelEnum = z.enum([
  'ENTRY',
  'INTERMEDIATE',
  'EXPERT',
]);

/**
 * Job Category
 */
export const jobCategoryEnum = z.enum([
  'web-development',
  'mobile-development',
  'design',
  'content-writing',
  'digital-marketing',
  'video-animation',
  'business',
  'translation',
  'other',
]);

/**
 * Main Job Posting Schema
 */
export const jobPostingSchema = z
  .object({
    // Basic Info
    title: baseSchemas.title
      .min(10, 'Başlık en az 10 karakter olmalıdır')
      .max(100, 'Başlık en fazla 100 karakter olabilir'),

    description: baseSchemas.description
      .min(100, 'Açıklama en az 100 karakter olmalıdır')
      .max(5000, 'Açıklama en fazla 5000 karakter olabilir'),

    category: jobCategoryEnum,

    // Skills & Requirements
    requiredSkills: z
      .array(z.string().min(2, 'Beceri en az 2 karakter olmalıdır'))
      .min(1, 'En az 1 beceri eklemelisiniz')
      .max(15, 'En fazla 15 beceri ekleyebilirsiniz'),

    experienceLevel: jobExperienceLevelEnum,

    requirements: z
      .array(z.string().min(5, 'Gereksinim en az 5 karakter olmalıdır'))
      .min(1, 'En az 1 gereksinim eklemelisiniz')
      .max(10, 'En fazla 10 gereksinim ekleyebilirsiniz')
      .optional(),

    // Budget & Timeline
    budgetType: jobBudgetTypeEnum,

    budgetMin: baseSchemas.price
      .min(50, 'Minimum bütçe en az 50 TL olmalıdır')
      .optional(),

    budgetMax: baseSchemas.price
      .max(1000000, 'Maksimum bütçe çok yüksek')
      .optional(),

    hourlyRate: baseSchemas.price
      .min(50, 'Saatlik ücret en az 50 TL olmalıdır')
      .max(5000, 'Saatlik ücret çok yüksek')
      .optional(),

    deadline: z
      .string()
      .refine(
        (date) => {
          if (!date) return true; // Optional
          const deadlineDate = new Date(date);
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          return deadlineDate >= tomorrow;
        },
        {
          message: 'Son başvuru tarihi en az 1 gün sonra olmalıdır',
        }
      )
      .optional(),

    duration: z
      .string()
      .min(1, 'Proje süresi belirtilmelidir')
      .max(100, 'Proje süresi çok uzun')
      .optional(),

    // Location
    location: z
      .string()
      .min(2, 'Konum en az 2 karakter olmalıdır')
      .max(100, 'Konum çok uzun')
      .optional(),

    isRemote: z.boolean().default(true),

    // Attachments
    attachments: z
      .array(
        z.object({
          name: z.string(),
          url: z.string().url("Geçersiz dosya URL'si"),
          type: z.string(),
          size: z.number(),
        })
      )
      .max(5, 'En fazla 5 dosya ekleyebilirsiniz')
      .optional(),
  })
  .refine(
    (data) => {
      // Fixed budget must have min or max
      if (data.budgetType === 'FIXED') {
        return data.budgetMin !== undefined || data.budgetMax !== undefined;
      }
      return true;
    },
    {
      message: 'Sabit bütçe için minimum veya maksimum tutar belirtilmelidir',
      path: ['budgetMin'],
    }
  )
  .refine(
    (data) => {
      // Hourly budget must have hourly rate
      if (data.budgetType === 'HOURLY') {
        return data.hourlyRate !== undefined && data.hourlyRate > 0;
      }
      return true;
    },
    {
      message: 'Saatlik ücret için saat başı ücret belirtilmelidir',
      path: ['hourlyRate'],
    }
  )
  .refine(
    (data) => {
      // If both min and max provided, max must be greater
      if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
        return data.budgetMax > data.budgetMin;
      }
      return true;
    },
    {
      message: 'Maksimum bütçe minimum bütçeden büyük olmalıdır',
      path: ['budgetMax'],
    }
  );

/**
 * Job Draft Schema (less strict for saving drafts)
 */
export const jobDraftSchema = jobPostingSchema.partial();

/**
 * Job Update Schema
 */
export const jobUpdateSchema = jobPostingSchema.partial().extend({
  id: baseSchemas.id,
});

/**
 * Job Search Schema
 */
export const jobSearchSchema = z.object({
  query: z.string().min(2, 'Arama en az 2 karakter olmalıdır').optional(),
  category: jobCategoryEnum.optional(),
  budgetMin: baseSchemas.price.optional(),
  budgetMax: baseSchemas.price.optional(),
  budgetType: jobBudgetTypeEnum.optional(),
  experienceLevel: z.array(jobExperienceLevelEnum).optional(),
  skills: z.array(z.string()).optional(),
  isRemote: z.boolean().optional(),
  location: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(50).default(20),
  sortBy: z
    .enum(['newest', 'budget', 'deadline', 'proposals'])
    .default('newest'),
});

// ================================================
// TYPE EXPORTS
// ================================================

export type JobPostingFormData = z.infer<typeof jobPostingSchema>;
export type JobDraftFormData = z.infer<typeof jobDraftSchema>;
export type JobUpdateFormData = z.infer<typeof jobUpdateSchema>;
export type JobSearchFormData = z.infer<typeof jobSearchSchema>;
export type JobBudgetType = z.infer<typeof jobBudgetTypeEnum>;
export type JobExperienceLevel = z.infer<typeof jobExperienceLevelEnum>;
export type JobCategory = z.infer<typeof jobCategoryEnum>;

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Get budget display text
 */
export function getBudgetDisplayText(
  budgetType: JobBudgetType,
  budgetMin?: number,
  budgetMax?: number,
  hourlyRate?: number
): string {
  if (budgetType === 'HOURLY' && hourlyRate) {
    return `${hourlyRate} TL/saat`;
  }

  if (budgetMin && budgetMax) {
    return `${budgetMin} - ${budgetMax} TL`;
  }

  if (budgetMin) {
    return `${budgetMin}+ TL`;
  }

  if (budgetMax) {
    return `${budgetMax} TL'ye kadar`;
  }

  return 'Belirtilmedi';
}

/**
 * Get experience level display text
 */
export function getExperienceLevelDisplayText(
  level: JobExperienceLevel
): string {
  const labels: Record<JobExperienceLevel, string> = {
    ENTRY: 'Başlangıç',
    INTERMEDIATE: 'Orta',
    EXPERT: 'Uzman',
  };
  return labels[level];
}

/**
 * Get category display text
 */
export function getCategoryDisplayText(category: JobCategory): string {
  const labels: Record<JobCategory, string> = {
    'web-development': 'Web Geliştirme',
    'mobile-development': 'Mobil Uygulama',
    design: 'Tasarım',
    'content-writing': 'İçerik Yazarlığı',
    'digital-marketing': 'Dijital Pazarlama',
    'video-animation': 'Video & Animasyon',
    business: 'İş & Yönetim',
    translation: 'Çeviri',
    other: 'Diğer',
  };
  return labels[category];
}

/**
 * Validate job posting data
 */
export function validateJobPosting(data: unknown) {
  return jobPostingSchema.safeParse(data);
}

/**
 * Validate job draft data
 */
export function validateJobDraft(data: unknown) {
  return jobDraftSchema.safeParse(data);
}
