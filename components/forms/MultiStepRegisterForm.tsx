'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight, Check, User, Building } from 'lucide-react';

import { Button, Input, Card, Checkbox } from '@/components/ui';
import useAuthStore from '@/lib/store/auth';
import { registerSchema, type RegisterFormData } from '@/lib/validations/auth';
import Link from 'next/link';

// Steps configuration
const STEPS = [
  {
    id: 'personal',
    title: 'Kişisel Bilgiler',
    description: 'Ad, soyad ve iletişim bilgilerinizi girin',
    icon: User,
  },
  {
    id: 'role',
    title: 'Rol Seçimi',
    description: 'Hesap türünüzü belirleyin',
    icon: Building,
  },
  {
    id: 'credentials',
    title: 'Hesap Bilgileri',
    description: 'E-posta ve şifre oluşturun',
    icon: User, // User icon for credentials step
  },
] as const;

interface RoleSelectionCardProps {
  type: 'freelancer' | 'employer';
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  selected: boolean;
  onClick: () => void;
}

function RoleSelectionCard({
  type,
  title,
  description,
  icon: Icon,
  selected,
  onClick,
}: RoleSelectionCardProps) {
  return (
    <Card
      padding="md"
      className={`cursor-pointer border-2 transition-all duration-200 ${
        selected
          ? 'border-blue-500 bg-blue-50 shadow-md'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={onClick}
    >
      <div className="text-center">
        <Icon
          className={`mx-auto mb-4 h-12 w-12 ${
            selected ? 'text-blue-600' : 'text-gray-400'
          }`}
        />
        <h3
          className={`mb-2 text-lg font-semibold ${
            selected ? 'text-blue-900' : 'text-gray-900'
          }`}
        >
          {title}
        </h3>
        <p className="text-sm text-gray-600">{description}</p>

        {/* Benefits list */}
        <div className="mt-4 space-y-2">
          {type === 'freelancer' ? (
            <>
              <div className="flex items-center justify-center text-xs text-gray-600">
                <Check className="mr-1 h-3 w-3 text-green-500" />
                Hizmet paketi oluştur
              </div>
              <div className="flex items-center justify-center text-xs text-gray-600">
                <Check className="mr-1 h-3 w-3 text-green-500" />
                İş tekliflerine başvur
              </div>
              <div className="flex items-center justify-center text-xs text-gray-600">
                <Check className="mr-1 h-3 w-3 text-green-500" />
                Portfolyo oluştur
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center text-xs text-gray-600">
                <Check className="mr-1 h-3 w-3 text-green-500" />
                İş ilanı yayınla
              </div>
              <div className="flex items-center justify-center text-xs text-gray-600">
                <Check className="mr-1 h-3 w-3 text-green-500" />
                Freelancer ara
              </div>
              <div className="flex items-center justify-center text-xs text-gray-600">
                <Check className="mr-1 h-3 w-3 text-green-500" />
                Proje yönet
              </div>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

export function MultiStepRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerUser,
    isLoading,
    error,
    clearError,
  } = useAuthStore();

  const defaultUserType = searchParams.get('type') as
    | 'freelancer'
    | 'employer'
    | null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    getValues,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: defaultUserType || 'freelancer',
      agreeToTerms: false,
    },
    mode: 'onChange',
  });

  const watchedValues = watch();

  // Get current step validation fields
  const getStepFields = (step: number) => {
    switch (step) {
      case 0:
        return ['firstName', 'lastName'] as const;
      case 1:
        return ['userType'] as const;
      case 2:
        return [
          'email',
          'password',
          'confirmPassword',
          'agreeToTerms',
        ] as const;
      default:
        return [];
    }
  };

  // Validate current step
  const validateCurrentStep = async () => {
    const fields = getStepFields(currentStep);
    const isValid = await trigger(fields);
    return isValid;
  };

  // Go to next step
  const nextStep = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Go to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit form
  const onSubmit = async (data: RegisterFormData) => {
    try {
      clearError();
      await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        userType: data.userType,
      });

      // Redirect to dashboard on successful registration
      router.push('/dashboard');
    } catch {
      // Error handled by store
    }
  };

  // Step progress calculation
  const progressPercentage = ((currentStep + 1) / STEPS.length) * 100;

  // Check if current step is valid
  const isCurrentStepValid = () => {
    const fields = getStepFields(currentStep);
    return fields.every((field) => {
      const value = getValues(field);
      return value && !errors[field];
    });
  };

  return (
    <div className="mx-auto w-full max-w-lg">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Ücretsiz Hesap Oluştur
        </h1>
        <p className="text-gray-600">
          Marifeto&apos;ya katılarak hemen başlayın
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                    isCompleted
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : isActive
                        ? 'border-blue-600 bg-white text-blue-600'
                        : 'border-gray-300 bg-white text-gray-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-xs font-medium ${
                      isActive || isCompleted
                        ? 'text-blue-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress line */}
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-blue-600 transition-all duration-300 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Step 1: Personal Information */}
        {currentStep === 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Kişisel Bilgileriniz
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Profilinizi oluşturmak için ad ve soyad bilgilerinizi girin
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ad"
                placeholder="Adınız"
                error={errors.firstName?.message}
                {...register('firstName')}
                fullWidth
                autoFocus
              />
              <Input
                label="Soyad"
                placeholder="Soyadınız"
                error={errors.lastName?.message}
                {...register('lastName')}
                fullWidth
              />
            </div>
          </div>
        )}

        {/* Step 2: Role Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Hesap Türünüzü Seçin
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                İhtiyaçlarınıza en uygun hesap türünü belirleyin
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <RoleSelectionCard
                type="freelancer"
                title="Freelancer"
                description="Hizmet satmak için"
                icon={User}
                selected={watchedValues.userType === 'freelancer'}
                onClick={() => setValue('userType', 'freelancer')}
              />

              <RoleSelectionCard
                type="employer"
                title="İşveren"
                description="Hizmet almak için"
                icon={Building}
                selected={watchedValues.userType === 'employer'}
                onClick={() => setValue('userType', 'employer')}
              />
            </div>

            <input type="hidden" {...register('userType')} />
            {errors.userType && (
              <p className="text-center text-sm text-red-600">
                {errors.userType.message}
              </p>
            )}
          </div>
        )}

        {/* Step 3: Credentials */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Hesap Bilgileriniz
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                Giriş yapmak için e-posta ve şifre oluşturun
              </p>
            </div>

            {/* Email */}
            <Input
              label="E-posta Adresi"
              type="email"
              placeholder="ornek@email.com"
              error={errors.email?.message}
              {...register('email')}
              fullWidth
              autoFocus
            />

            {/* Password */}
            <Input
              label="Şifre"
              type={showPassword ? 'text' : 'password'}
              placeholder="En az 6 karakter"
              error={errors.password?.message}
              {...register('password')}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              }
              fullWidth
            />

            {/* Confirm Password */}
            <Input
              label="Şifre Onayı"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Şifrenizi tekrar giriniz"
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              }
              fullWidth
            />

            {/* Terms Checkbox */}
            <Checkbox
              {...register('agreeToTerms')}
              label={
                <span>
                  <Link
                    href="/terms"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Kullanım Şartları
                  </Link>
                  &apos;nı ve{' '}
                  <Link
                    href="/privacy"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    Gizlilik Politikası
                  </Link>
                  &apos;nı okudum, kabul ediyorum.
                </span>
              }
              error={errors.agreeToTerms?.message}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Geri
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={!isCurrentStepValid()}
              className="flex items-center"
            >
              İleri
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="submit"
              loading={isLoading}
              disabled={!isCurrentStepValid()}
              className="flex items-center"
            >
              <Check className="mr-1 h-4 w-4" />
              Hesap Oluştur
            </Button>
          )}
        </div>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-600">
            Zaten hesabın var mı?{' '}
            <Link
              href="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Giriş Yap
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
