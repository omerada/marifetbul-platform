'use client';

/**
 * ================================================
 * PACKAGE CREATION WIZARD
 * ================================================
 * Multi-step wizard for creating service packages
 *
 * Steps:
 * 1. Basic Info (title, description, category)
 * 2. Tier Pricing (Basic, Standard, Premium)
 * 3. Features (highlights, deliverables, requirements)
 * 4. Media (images, video)
 * 5. Review & Publish
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  DollarSign,
  Star,
  Image as ImageIcon,
  CheckCircle,
  Save,
} from 'lucide-react';

import { Button, Card } from '@/components/ui';
import { packageApi } from '@/lib/api/packages';
import {
  createPackageSchema,
  type CreatePackageFormData,
} from '@/lib/validation/package';
import type { CreatePackageRequest } from '@/types/business/features/package';
import logger from '@/lib/infrastructure/monitoring/logger';

// Import step components (to be created)
import { PackageBasicInfoStep } from './PackageBasicInfoStep';
import { PackageTierPricingStep } from './PackageTierPricingStep';
import { PackageFeaturesStep } from './PackageFeaturesStep';
import { PackageMediaStep } from './PackageMediaStep';
import { PackageReviewStep } from './PackageReviewStep';

// ================================================
// STEP CONFIGURATION
// ================================================

const STEPS = [
  {
    id: 'basic-info',
    title: 'Temel Bilgiler',
    description: 'Paket başlığı, açıklama ve kategori',
    icon: FileText,
  },
  {
    id: 'tier-pricing',
    title: 'Fiyatlandırma',
    description: 'Paket seviyeleri ve fiyatları',
    icon: DollarSign,
  },
  {
    id: 'features',
    title: 'Özellikler',
    description: 'Öne çıkan özellikler ve çıktılar',
    icon: Star,
  },
  {
    id: 'media',
    title: 'Görseller',
    description: 'Paket görselleri ve video',
    icon: ImageIcon,
  },
  {
    id: 'review',
    title: 'İnceleme',
    description: 'Son kontrol ve yayınlama',
    icon: CheckCircle,
  },
] as const;

// ================================================
// TYPES
// ================================================

interface PackageCreationWizardProps {
  initialData?: Partial<CreatePackageFormData>;
  isEditing?: boolean;
  packageId?: string;
}

// ================================================
// MAIN COMPONENT
// ================================================

export function PackageCreationWizard({
  initialData,
  isEditing = false,
  packageId,
}: PackageCreationWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form setup with react-hook-form
  const methods = useForm<CreatePackageFormData>({
    resolver: zodResolver(createPackageSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      categoryId: '',
      keywords: [],
      basicTier: {
        price: 0,
        deliveryDays: 7,
        revisionCount: 2,
        features: [],
      },
      standardTier: null,
      premiumTier: null,
      highlights: [],
      deliverables: [],
      requirements: [],
      images: [],
      videoUrl: null,
      metaDescription: null,
    },
    mode: 'onChange',
  });

  const {
    handleSubmit,
    trigger,
    formState: { isValid },
  } = methods;

  // ================================================
  // STEP NAVIGATION
  // ================================================

  const handleNext = useCallback(async () => {
    // Validate current step before proceeding
    let fieldsToValidate: string[] = [];

    switch (currentStep) {
      case 0: // Basic Info
        fieldsToValidate = ['title', 'description', 'categoryId', 'keywords'];
        break;
      case 1: // Tier Pricing
        fieldsToValidate = ['basicTier', 'standardTier', 'premiumTier'];
        break;
      case 2: // Features
        fieldsToValidate = ['highlights', 'deliverables', 'requirements'];
        break;
      case 3: // Media
        fieldsToValidate = ['images', 'videoUrl'];
        break;
      case 4: // Review
        // Final validation happens in onSubmit
        break;
    }

    const isStepValid = await trigger(fieldsToValidate as any);

    if (isStepValid && currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep, trigger]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const handleStepClick = useCallback(
    async (stepIndex: number) => {
      // Allow going back without validation
      if (stepIndex < currentStep) {
        setCurrentStep(stepIndex);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      // For forward navigation, validate all previous steps
      const isValid = await trigger();
      if (isValid || stepIndex <= currentStep) {
        setCurrentStep(stepIndex);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [currentStep, trigger]
  );

  // ================================================
  // FORM SUBMISSION
  // ================================================

  const onSubmit = async (data: CreatePackageFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Transform form data to API request format
      const requestData: CreatePackageRequest = {
        title: data.title,
        description: data.description,
        categoryId: data.categoryId,
        basicTier: {
          price: data.basicTier.price,
          deliveryDays: data.basicTier.deliveryDays,
          revisionCount: data.basicTier.revisionCount,
          features: data.basicTier.features,
        },
        standardTier: data.standardTier
          ? {
              price: data.standardTier.price,
              deliveryDays: data.standardTier.deliveryDays,
              revisionCount: data.standardTier.revisionCount,
              features: data.standardTier.features,
            }
          : null,
        premiumTier: data.premiumTier
          ? {
              price: data.premiumTier.price,
              deliveryDays: data.premiumTier.deliveryDays,
              revisionCount: data.premiumTier.revisionCount,
              features: data.premiumTier.features,
            }
          : null,
        highlights: data.highlights,
        deliverables: data.deliverables,
        requirements: data.requirements || [],
        images: data.images,
        videoUrl: data.videoUrl || null,
        metaDescription: data.metaDescription || null,
        keywords: data.keywords,
      };

      // Call API
      if (isEditing && packageId) {
        await packageApi.updatePackage(packageId, requestData);
      } else {
        await packageApi.createPackage(requestData);
      }

      // Redirect to packages list
      router.push('/marketplace/packages?success=true');
    } catch (error) {
      logger.error('Package creation error', error as Error, {
        component: 'PackageCreationWizard',
        packageId,
      });
      setSubmitError(
        error instanceof Error
          ? error.message
          : 'Paket oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    const formData = methods.getValues();

    try {
      setIsSubmitting(true);

      // Save as draft (status: DRAFT)
      const requestData: CreatePackageRequest = {
        title: formData.title || 'Taslak Paket',
        description: formData.description || 'Taslak açıklama',
        categoryId: formData.categoryId || '',
        basicTier: formData.basicTier,
        standardTier: formData.standardTier,
        premiumTier: formData.premiumTier,
        highlights: formData.highlights || [],
        deliverables: formData.deliverables || [],
        requirements: formData.requirements || [],
        images: formData.images || [],
        videoUrl: formData.videoUrl,
        metaDescription: formData.metaDescription,
        keywords: formData.keywords || [],
      };

      await packageApi.createPackage(requestData);
      router.push('/marketplace/packages?draft=true');
    } catch (error) {
      logger.error('Draft save error', error as Error, {
        component: 'PackageCreationWizard',
      });
      setSubmitError('Taslak kaydedilirken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================================================
  // RENDER CURRENT STEP
  // ================================================

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <PackageBasicInfoStep />;
      case 1:
        return <PackageTierPricingStep />;
      case 2:
        return <PackageFeaturesStep />;
      case 3:
        return <PackageMediaStep />;
      case 4:
        return <PackageReviewStep />;
      default:
        return null;
    }
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-4xl">
        {/* Progress Indicator */}
        <Card padding="md" className="mb-6">
          <div className="space-y-4">
            {/* Step Progress Bar */}
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <div key={step.id} className="flex flex-1 items-center">
                    <button
                      type="button"
                      onClick={() => handleStepClick(index)}
                      className={`flex items-center space-x-2 transition-all ${
                        isActive
                          ? 'text-blue-600'
                          : isCompleted
                            ? 'text-green-600 hover:text-green-700'
                            : 'text-gray-400 hover:text-gray-500'
                      }`}
                      disabled={isSubmitting}
                    >
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                          isActive
                            ? 'border-blue-600 bg-blue-50'
                            : isCompleted
                              ? 'border-green-600 bg-green-50'
                              : 'border-gray-300 bg-white'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <Icon className="h-5 w-5" />
                        )}
                      </div>
                      <div className="hidden text-left md:block">
                        <div className="text-sm font-semibold">
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {step.description}
                        </div>
                      </div>
                    </button>

                    {/* Connector Line */}
                    {index < STEPS.length - 1 && (
                      <div
                        className={`mx-2 h-0.5 flex-1 transition-all ${
                          index < currentStep ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Step Info */}
            <div className="text-center md:hidden">
              <div className="text-sm font-semibold text-gray-900">
                {STEPS[currentStep].title}
              </div>
              <div className="text-xs text-gray-500">
                Adım {currentStep + 1} / {STEPS.length}
              </div>
            </div>
          </div>
        </Card>

        {/* Step Content */}
        <Card padding="lg" className="mb-6">
          {renderStep()}
        </Card>

        {/* Error Message */}
        {submitError && (
          <Card padding="md" className="mb-6 border-red-200 bg-red-50">
            <div className="text-sm text-red-600">{submitError}</div>
          </Card>
        )}

        {/* Navigation Buttons */}
        <Card padding="md">
          <div className="flex items-center justify-between">
            <div className="flex space-x-2">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={isSubmitting}
                  leftIcon={<ChevronLeft className="h-4 w-4" />}
                >
                  Geri
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Taslak Kaydet
              </Button>
            </div>

            <div>
              {currentStep < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting}
                  rightIcon={<ChevronRight className="h-4 w-4" />}
                >
                  İleri
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  loading={isSubmitting}
                  rightIcon={<CheckCircle className="h-4 w-4" />}
                >
                  {isEditing ? 'Güncelle' : 'Yayınla'}
                </Button>
              )}
            </div>
          </div>
        </Card>
      </form>
    </FormProvider>
  );
}
