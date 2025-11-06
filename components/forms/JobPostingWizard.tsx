/**
 * ================================================
 * JOB POSTING WIZARD COMPONENT
 * ================================================
 * Multi-step wizard for creating job postings
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 6, 2025
 * Sprint: Job Posting & Proposal System - Story 1, Task 1.2
 */

'use client';

import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Check,
  FileText,
  Users,
  DollarSign,
  Eye,
} from 'lucide-react';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@/components/ui';
import { useJobs } from '@/hooks/business/jobs';
import type { JobPostingFormData } from '@/lib/core/validations/jobs';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// ================================================
// TYPES
// ================================================

export interface JobPostingWizardProps {
  onComplete?: (jobId: string) => void;
  onCancel?: () => void;
  defaultValues?: Partial<JobPostingFormData>;
  className?: string;
}

type WizardStep = 1 | 2 | 3 | 4;

// ================================================
// WIZARD STEPS CONFIGURATION
// ================================================

const WIZARD_STEPS = [
  {
    id: 1,
    title: 'Temel Bilgiler',
    description: 'İş ilanı başlığı, kategorisi ve açıklaması',
    icon: FileText,
    fields: ['title', 'category', 'description'] as const,
  },
  {
    id: 2,
    title: 'Beceriler & Gereksinimler',
    description: 'Gerekli beceriler ve deneyim seviyesi',
    icon: Users,
    fields: ['requiredSkills', 'experienceLevel', 'requirements'] as const,
  },
  {
    id: 3,
    title: 'Bütçe & Zaman',
    description: 'Bütçe türü, miktar ve proje süresi',
    icon: DollarSign,
    fields: [
      'budgetType',
      'budgetMin',
      'budgetMax',
      'hourlyRate',
      'duration',
      'deadline',
    ] as const,
  },
  {
    id: 4,
    title: 'İncele & Yayınla',
    description: 'İlan detaylarını gözden geçirin',
    icon: Eye,
    fields: [] as const,
  },
] as const;

// ================================================
// COMPONENT
// ================================================

export function JobPostingWizard({
  onComplete,
  onCancel,
  defaultValues,
  className,
}: JobPostingWizardProps) {
  const router = useRouter();
  const { createJob, isCreating } = useJobs();

  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [formData, setFormData] = useState<Partial<JobPostingFormData>>(
    defaultValues || {}
  );

  // ==================== STEP NAVIGATION ====================

  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
    // Scroll to top on step change
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goToNextStep = useCallback(() => {
    if (currentStep < 4) {
      goToStep((currentStep + 1) as WizardStep);
    }
  }, [currentStep, goToStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      goToStep((currentStep - 1) as WizardStep);
    }
  }, [currentStep, goToStep]);

  // ==================== FORM HANDLERS ====================

  const updateFormData = useCallback(
    (stepData: Partial<JobPostingFormData>) => {
      setFormData((prev) => ({ ...prev, ...stepData }));
    },
    []
  );

  const handleStepSubmit = useCallback(
    (stepData: Partial<JobPostingFormData>) => {
      updateFormData(stepData);
      goToNextStep();
    },
    [updateFormData, goToNextStep]
  );

  const handleSaveDraft = useCallback(
    async (stepData: Partial<JobPostingFormData>) => {
      const combinedData = { ...formData, ...stepData };

      // Transform frontend data to backend format
      const draftData = {
        ...combinedData,
        categoryId: combinedData.category || '',
        status: 'DRAFT',
      } as unknown as Parameters<typeof createJob>[0];

      const result = await createJob(draftData);

      if (result) {
        toast.success('Taslak kaydedildi', {
          description: 'İlanınızı daha sonra düzenleyebilirsiniz',
        });
        router.push('/dashboard/jobs');
      }
    },
    [formData, createJob, router]
  );

  const handlePublish = useCallback(
    async (finalData: Partial<JobPostingFormData>) => {
      const combinedData = { ...formData, ...finalData };

      // Transform frontend data to backend format
      const publishData = {
        ...combinedData,
        categoryId: combinedData.category || '',
        status: 'OPEN',
      } as unknown as Parameters<typeof createJob>[0];

      const result = await createJob(publishData);

      if (result) {
        toast.success('İlan yayınlandı!', {
          description: 'Freelancer&apos;lar artık tekliflerini gönderebilir',
        });

        if (onComplete) {
          onComplete(result.id);
        } else {
          router.push(`/dashboard/jobs/${result.id}`);
        }
      }
    },
    [formData, createJob, onComplete, router]
  );

  // ==================== VALIDATION ====================

  const isStepValid = useCallback(
    (step: number): boolean => {
      const stepConfig = WIZARD_STEPS[step - 1];
      if (!stepConfig || stepConfig.fields.length === 0) return true;

      // Check if all required fields for this step are filled
      return stepConfig.fields.every((field) => {
        const value = formData[field as keyof JobPostingFormData];
        if (Array.isArray(value)) {
          return value.length > 0;
        }
        return value !== undefined && value !== null && value !== '';
      });
    },
    [formData]
  );

  const isStepComplete = useCallback(
    (step: number): boolean => {
      return step < currentStep || (step === currentStep && isStepValid(step));
    },
    [currentStep, isStepValid]
  );

  // ==================== RENDER STEPS ====================

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepOne
            data={formData}
            onNext={handleStepSubmit}
            onSaveDraft={handleSaveDraft}
            isSubmitting={isCreating}
          />
        );

      case 2:
        return (
          <StepTwo
            data={formData}
            onNext={handleStepSubmit}
            onBack={goToPreviousStep}
            onSaveDraft={handleSaveDraft}
            isSubmitting={isCreating}
          />
        );

      case 3:
        return (
          <StepThree
            data={formData}
            onNext={handleStepSubmit}
            onBack={goToPreviousStep}
            onSaveDraft={handleSaveDraft}
            isSubmitting={isCreating}
          />
        );

      case 4:
        return (
          <StepFour
            data={formData}
            onPublish={handlePublish}
            onBack={goToPreviousStep}
            onEdit={goToStep}
            isSubmitting={isCreating}
          />
        );

      default:
        return null;
    }
  };

  // ==================== RENDER ====================

  return (
    <div className={cn('mx-auto max-w-4xl', className)}>
      {/* Wizard Progress */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {WIZARD_STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = isStepComplete(step.id);

              return (
                <React.Fragment key={step.id}>
                  {/* Step Button */}
                  <button
                    type="button"
                    onClick={() => goToStep(step.id as WizardStep)}
                    disabled={step.id > currentStep && !isCompleted}
                    className={cn(
                      'flex flex-col items-center gap-2 transition-opacity',
                      'disabled:cursor-not-allowed disabled:opacity-40',
                      !isActive && !isCompleted && 'opacity-60'
                    )}
                  >
                    {/* Icon Circle */}
                    <div
                      className={cn(
                        'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
                        isCompleted && 'bg-green-500 text-white',
                        isActive && !isCompleted && 'bg-blue-500 text-white',
                        !isActive && !isCompleted && 'bg-gray-200 text-gray-500'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>

                    {/* Step Label */}
                    <div className="text-center">
                      <p
                        className={cn(
                          'text-sm font-medium',
                          isActive && 'text-blue-600',
                          isCompleted && 'text-green-600',
                          !isActive && !isCompleted && 'text-gray-500'
                        )}
                      >
                        {step.title}
                      </p>
                      <p className="text-muted-foreground hidden text-xs md:block">
                        {step.description}
                      </p>
                    </div>
                  </button>

                  {/* Connector Line */}
                  {index < WIZARD_STEPS.length - 1 && (
                    <div
                      className={cn(
                        'h-0.5 flex-1 transition-colors',
                        isStepComplete(step.id + 1)
                          ? 'bg-green-500'
                          : 'bg-gray-200'
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {renderStepContent()}

      {/* Cancel Button (Always Visible) */}
      {onCancel && (
        <div className="mt-6 text-center">
          <Button variant="ghost" onClick={onCancel} disabled={isCreating}>
            İptal
          </Button>
        </div>
      )}
    </div>
  );
}

// ================================================
// STEP COMPONENTS
// ================================================

// Step 1: Basic Info
interface StepOneProps {
  data: Partial<JobPostingFormData>;
  onNext: (data: Partial<JobPostingFormData>) => void;
  onSaveDraft: (data: Partial<JobPostingFormData>) => Promise<void>;
  isSubmitting: boolean;
}

function StepOne({ data, onNext, onSaveDraft, isSubmitting }: StepOneProps) {
  const [formData] = useState<Partial<JobPostingFormData>>(data);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temel Bilgiler</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TODO: Add form fields */}
          <p className="text-muted-foreground">
            Step 1 form fields will be implemented...
          </p>

          <div className="flex justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onSaveDraft(formData)}
              disabled={isSubmitting}
            >
              Taslak Kaydet
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              İleri <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Step 2: Skills & Requirements
interface StepTwoProps {
  data: Partial<JobPostingFormData>;
  onNext: (data: Partial<JobPostingFormData>) => void;
  onBack: () => void;
  onSaveDraft: (data: Partial<JobPostingFormData>) => Promise<void>;
  isSubmitting: boolean;
}

function StepTwo({
  data,
  onNext,
  onBack,
  onSaveDraft,
  isSubmitting,
}: StepTwoProps) {
  const [formData] = useState<Partial<JobPostingFormData>>(data);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Beceriler & Gereksinimler</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TODO: Add form fields */}
          <p className="text-muted-foreground">
            Step 2 form fields will be implemented...
          </p>

          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={onBack}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Geri
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onSaveDraft(formData)}
                disabled={isSubmitting}
              >
                Taslak Kaydet
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                İleri <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Step 3: Budget & Timeline
interface StepThreeProps {
  data: Partial<JobPostingFormData>;
  onNext: (data: Partial<JobPostingFormData>) => void;
  onBack: () => void;
  onSaveDraft: (data: Partial<JobPostingFormData>) => Promise<void>;
  isSubmitting: boolean;
}

function StepThree({
  data,
  onNext,
  onBack,
  onSaveDraft,
  isSubmitting,
}: StepThreeProps) {
  const [formData] = useState<Partial<JobPostingFormData>>(data);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bütçe & Zaman Çizelgesi</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TODO: Add form fields */}
          <p className="text-muted-foreground">
            Step 3 form fields will be implemented...
          </p>

          <div className="flex justify-between">
            <Button type="button" variant="secondary" onClick={onBack}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Geri
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onSaveDraft(formData)}
                disabled={isSubmitting}
              >
                Taslak Kaydet
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                İleri <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Step 4: Review & Publish
interface StepFourProps {
  data: Partial<JobPostingFormData>;
  onPublish: (data: Partial<JobPostingFormData>) => Promise<void>;
  onBack: () => void;
  onEdit: (step: WizardStep) => void;
  isSubmitting: boolean;
}

function StepFour({
  data,
  onPublish,
  onBack,
  onEdit,
  isSubmitting,
}: StepFourProps) {
  const handlePublish = () => {
    onPublish(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>İlan Özeti</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info Preview */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">Temel Bilgiler</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(1)}
            >
              Düzenle
            </Button>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <h4 className="mb-2 font-medium">{data.title || 'Başlık yok'}</h4>
            <p className="text-muted-foreground text-sm">
              {data.description || 'Açıklama yok'}
            </p>
          </div>
        </div>

        {/* Skills Preview */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">Beceriler</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(2)}
            >
              Düzenle
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {data.requiredSkills?.map((skill) => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            )) || <p className="text-muted-foreground text-sm">Beceri yok</p>}
          </div>
        </div>

        {/* Budget Preview */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-semibold">Bütçe</h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(3)}
            >
              Düzenle
            </Button>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm">
              <strong>Tip:</strong> {data.budgetType || 'Belirtilmedi'}
            </p>
            {data.budgetType === 'FIXED' && (
              <p className="text-sm">
                <strong>Miktar:</strong> {data.budgetMin} - {data.budgetMax} TL
              </p>
            )}
            {data.budgetType === 'HOURLY' && (
              <p className="text-sm">
                <strong>Saatlik:</strong> {data.hourlyRate} TL/saat
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between border-t pt-6">
          <Button type="button" variant="secondary" onClick={onBack}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Geri
          </Button>
          <Button onClick={handlePublish} disabled={isSubmitting} size="lg">
            {isSubmitting ? 'Yayınlanıyor...' : 'İlanı Yayınla'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default JobPostingWizard;
