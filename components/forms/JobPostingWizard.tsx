'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import {
  StepOne,
  StepTwo,
  StepThree,
  StepFour,
  WIZARD_STEPS,
  type JobPostingFormData,
  type WizardStep,
} from './job-posting';
import { useJobs } from '@/hooks';

interface JobPostingWizardProps {
  initialData?: Partial<JobPostingFormData>;
  onComplete?: (jobId: string) => void;
  onCancel?: () => void;
  className?: string;
}

export default function JobPostingWizard({
  initialData,
  onComplete,
  onCancel,
  className,
}: JobPostingWizardProps) {
  const router = useRouter();
  const { createJob, isCreating } = useJobs();
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  const [formData, setFormData] = useState<Partial<JobPostingFormData>>(
    initialData || {}
  );
  const [completedSteps, setCompletedSteps] = useState<Set<WizardStep>>(
    new Set()
  );

  const goToStep = useCallback((step: WizardStep) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goToNextStep = useCallback(() => {
    if (currentStep < 4) setCurrentStep((prev) => (prev + 1) as WizardStep);
  }, [currentStep]);

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) setCurrentStep((prev) => (prev - 1) as WizardStep);
  }, [currentStep]);

  const handleStepSubmit = useCallback(
    (stepData: Partial<JobPostingFormData>) => {
      const combinedData = { ...formData, ...stepData };
      setFormData(combinedData);
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      if (currentStep < 4) goToNextStep();
    },
    [formData, currentStep, goToNextStep]
  );

  const handleSaveDraft = useCallback(
    async (stepData?: Partial<JobPostingFormData>) => {
      try {
        const combinedData = stepData ? { ...formData, ...stepData } : formData;
        const draftData = {
          ...combinedData,
          categoryId: combinedData.category || '',
          status: 'DRAFT',
        } as unknown as Parameters<typeof createJob>[0];
        const result = await createJob(draftData);
        if (result) {
          toast.success('Taslak kaydedildi', {
            description: 'İlanınızı daha sonra düzenleyebilirsiniz.',
          });
          router.push('/dashboard/jobs');
        }
      } catch (error) {
        toast.error('Taslak kaydedilemedi', {
          description: 'Lütfen tekrar deneyin.',
        });
      }
    },
    [formData, createJob, router]
  );

  const handlePublish = useCallback(
    async (finalData: Partial<JobPostingFormData>) => {
      try {
        const combinedData = { ...formData, ...finalData };
        const publishData = {
          ...combinedData,
          categoryId: combinedData.category || '',
          status: 'OPEN',
        } as unknown as Parameters<typeof createJob>[0];
        const result = await createJob(publishData);
        if (result) {
          toast.success('İlan yayınlandı!', {
            description: "Freelancer'lar artık tekliflerini gönderebilir.",
          });
          if (onComplete) onComplete(result.id);
          else router.push(`/dashboard/jobs/${result.id}`);
        }
      } catch (error) {
        toast.error('İlan yayınlanamadı', {
          description: 'Lütfen bilgileri kontrol edip tekrar deneyin.',
        });
      }
    },
    [formData, createJob, onComplete, router]
  );

  const handleEditSection = useCallback(
    (step: WizardStep) => goToStep(step),
    [goToStep]
  );
  const isStepComplete = useCallback(
    (step: WizardStep): boolean =>
      completedSteps.has(step) || step < currentStep,
    [completedSteps, currentStep]
  );
  const currentStepConfig = useMemo(
    () => WIZARD_STEPS.find((step) => step.id === currentStep),
    [currentStep]
  );

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
            data={formData as JobPostingFormData}
            onPublish={handlePublish}
            onBack={goToPreviousStep}
            onEdit={handleEditSection}
            isSubmitting={isCreating}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8',
        className
      )}
    >
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Yeni İş İlanı Oluştur
          </h1>
          <p className="text-gray-600">
            {currentStepConfig?.description || 'İlan bilgilerinizi girin'}
          </p>
        </div>
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {WIZARD_STEPS.map((step, index) => {
              const isActive = step.id === currentStep;
              const isCompleted = isStepComplete(step.id);
              const isAccessible =
                step.id === 1 || isStepComplete((step.id - 1) as WizardStep);
              const StepIcon = step.icon;
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() =>
                      isAccessible && goToStep(step.id as WizardStep)
                    }
                    disabled={!isAccessible}
                    className={cn(
                      'group flex flex-col items-center',
                      isAccessible ? 'cursor-pointer' : 'cursor-not-allowed'
                    )}
                  >
                    <div
                      className={cn(
                        'mb-2 flex h-12 w-12 items-center justify-center rounded-full transition-all',
                        isActive &&
                          'bg-blue-600 text-white ring-4 ring-blue-200',
                        isCompleted && !isActive && 'bg-green-600 text-white',
                        !isActive &&
                          !isCompleted &&
                          isAccessible &&
                          'bg-gray-200 text-gray-600 group-hover:bg-gray-300',
                        !isActive &&
                          !isCompleted &&
                          !isAccessible &&
                          'bg-gray-100 text-gray-400'
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-6 w-6" />
                      )}
                    </div>
                    <p
                      className={cn(
                        'max-w-[100px] text-center text-sm font-medium',
                        isActive && 'text-blue-600',
                        isCompleted && !isActive && 'text-green-600',
                        !isActive && !isCompleted && 'text-gray-600'
                      )}
                    >
                      {step.title}
                    </p>
                    {isCompleted && !isActive && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Tamamlandı
                      </Badge>
                    )}
                  </button>
                  {index < WIZARD_STEPS.length - 1 && (
                    <div
                      className={cn(
                        'mx-2 h-1 flex-1 rounded transition-all',
                        isCompleted ? 'bg-green-600' : 'bg-gray-200'
                      )}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              {currentStepConfig?.title}
            </CardTitle>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>
        <div className="mt-6 flex items-center justify-between">
          {onCancel && (
            <Button variant="ghost" onClick={onCancel} disabled={isCreating}>
              İptal
            </Button>
          )}
          <p className="ml-auto text-sm text-gray-500">
            Adım {currentStep} / {WIZARD_STEPS.length}
          </p>
        </div>
      </div>
    </div>
  );
}
