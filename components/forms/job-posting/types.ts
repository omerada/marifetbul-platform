/**
 * ================================================
 * JOB POSTING WIZARD - TYPES
 * ================================================
 * Consolidated type definitions for job posting wizard
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Production Ready
 * @created November 8, 2025
 *
 * Sprint: Job Posting Wizard Implementation
 * Task: T1.2 - Type System Consolidation
 */

import type {
  JobPostingFormData,
  JobBudgetType,
  JobExperienceLevel,
  JobCategory,
} from '@/lib/core/validations/jobs';
import type { LucideIcon } from 'lucide-react';

// Re-export validation types
export type {
  JobPostingFormData,
  JobBudgetType,
  JobExperienceLevel,
  JobCategory,
};

// ================================================
// WIZARD-SPECIFIC TYPES
// ================================================

export type WizardStep = 1 | 2 | 3 | 4;

export interface JobPostingWizardProps {
  onComplete?: (jobId: string) => void;
  onCancel?: () => void;
  defaultValues?: Partial<JobPostingFormData>;
  className?: string;
}

// ================================================
// STEP COMPONENT PROPS
// ================================================

export interface StepOneProps {
  data: Partial<JobPostingFormData>;
  onNext: (data: Partial<JobPostingFormData>) => void;
  onSaveDraft: (data: Partial<JobPostingFormData>) => Promise<void>;
  isSubmitting: boolean;
}

export interface StepTwoProps {
  data: Partial<JobPostingFormData>;
  onNext: (data: Partial<JobPostingFormData>) => void;
  onBack: () => void;
  onSaveDraft: (data: Partial<JobPostingFormData>) => Promise<void>;
  isSubmitting: boolean;
}

export interface StepThreeProps {
  data: Partial<JobPostingFormData>;
  onNext: (data: Partial<JobPostingFormData>) => void;
  onBack: () => void;
  onSaveDraft: (data: Partial<JobPostingFormData>) => Promise<void>;
  isSubmitting: boolean;
}

export interface StepFourProps {
  data: Partial<JobPostingFormData>;
  onPublish: (data: Partial<JobPostingFormData>) => Promise<void>;
  onBack: () => void;
  onEdit: (step: WizardStep) => void;
  isSubmitting: boolean;
}

// ================================================
// MILESTONE TYPE
// ================================================

export interface JobMilestone {
  id?: string;
  title: string;
  description: string;
  amount: number;
  dueDate?: string;
  order: number;
}

// ================================================
// FORM CONSTANTS
// ================================================

export const BUDGET_TYPE_OPTIONS: Array<{
  value: JobBudgetType;
  label: string;
}> = [
  { value: 'FIXED', label: 'Sabit Fiyat' },
  { value: 'HOURLY', label: 'Saatlik Ücret' },
];

export const EXPERIENCE_LEVEL_OPTIONS: Array<{
  value: JobExperienceLevel;
  label: string;
}> = [
  { value: 'ENTRY', label: 'Başlangıç' },
  { value: 'INTERMEDIATE', label: 'Orta Seviye' },
  { value: 'EXPERT', label: 'Uzman' },
];

export const CATEGORY_OPTIONS: Array<{ value: JobCategory; label: string }> = [
  { value: 'web-development', label: 'Web Geliştirme' },
  { value: 'mobile-development', label: 'Mobil Uygulama' },
  { value: 'design', label: 'Tasarım' },
  { value: 'content-writing', label: 'İçerik Yazarlığı' },
  { value: 'digital-marketing', label: 'Dijital Pazarlama' },
  { value: 'video-animation', label: 'Video & Animasyon' },
  { value: 'business', label: 'İş & Yönetim' },
  { value: 'translation', label: 'Çeviri' },
  { value: 'other', label: 'Diğer' },
];

// ================================================
// WIZARD CONFIGURATION
// ================================================

import { FileText, Users, DollarSign, Eye } from 'lucide-react';

export const WIZARD_STEPS = [
  {
    id: 1 as const,
    title: 'Temel Bilgiler',
    description: 'İş ilanı başlığı, kategorisi ve açıklaması',
    fields: ['title', 'category', 'description'] as const,
    icon: FileText,
  },
  {
    id: 2 as const,
    title: 'Beceriler & Gereksinimler',
    description: 'Gerekli beceriler ve deneyim seviyesi',
    fields: ['requiredSkills', 'experienceLevel'] as const,
    icon: Users,
  },
  {
    id: 3 as const,
    title: 'Bütçe & Zaman',
    description: 'Bütçe türü, miktar ve proje süresi',
    fields: [
      'budgetType',
      'budgetMin',
      'budgetMax',
      'hourlyRate',
      'duration',
      'deadline',
    ] as const,
    icon: DollarSign,
  },
  {
    id: 4 as const,
    title: 'İncele & Yayınla',
    description: 'İlan detaylarını gözden geçirin',
    fields: [] as const,
    icon: Eye,
  },
] as const;
