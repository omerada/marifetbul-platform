// ================================================
// UNIFIED FORM COMPONENT
// ================================================
// Demonstration of the unified validation system with
// consistent error handling and Turkish error messages

'use client';

import React, { useState, useCallback } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  validateWithDetails,
  createFormValidator,
  createEmailSchema,
  createTextSchema,
  createPhoneSchema,
  createEnumSchema,
  createBooleanSchema,
  CommonSchemas,
  ERROR_MESSAGES,
  type ValidationResult,
  type ValidationErrorDetail,
} from '@/lib/validations';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { useToast } from '@/hooks/useToast';

// ================================================
// UNIFIED FORM SCHEMA EXAMPLE
// ================================================

const userRegistrationSchema = z
  .object({
    // Personal Information
    firstName: createTextSchema(2, 50),
    lastName: createTextSchema(2, 50),
    email: createEmailSchema(),
    phone: createPhoneSchema(),

    // Account Details
    password: CommonSchemas.strongPassword,
    userType: createEnumSchema(['freelancer', 'employer']),

    // Profile Information
    bio: createTextSchema(50, 500),
    city: createTextSchema(2, 100),

    // Agreements
    termsAccepted: createBooleanSchema(true),
    marketingAccepted: createBooleanSchema(false),
  })
  .refine(
    (data) =>
      data.userType === 'freelancer' ? (data.bio?.length || 0) >= 100 : true,
    {
      message:
        'Freelancer profilleri için biyografi en az 100 karakter olmalıdır',
      path: ['bio'],
    }
  );

type UserRegistrationFormData = z.infer<typeof userRegistrationSchema>;

// ================================================
// FORM VALIDATION HOOKS
// ================================================

function useUnifiedValidation<T>(schema: z.ZodSchema<T>) {
  const [validationErrors, setValidationErrors] = useState<
    ValidationErrorDetail[]
  >([]);
  const [isValidating, setIsValidating] = useState(false);

  const validator = createFormValidator(schema);

  const validateData = useCallback(
    async (data: unknown): Promise<ValidationResult<T>> => {
      setIsValidating(true);
      try {
        const result = validateWithDetails(schema, data);
        setValidationErrors(result.errors || []);
        return result;
      } finally {
        setIsValidating(false);
      }
    },
    [schema]
  );

  const validateField = useCallback(
    (fieldName: string, value: unknown) => {
      return validator.validateField(fieldName, value);
    },
    [validator]
  );

  const getFieldErrors = useCallback(
    (fieldName: string) => {
      return validator.getFieldErrors(validationErrors, fieldName);
    },
    [validationErrors, validator]
  );

  const hasFieldError = useCallback(
    (fieldName: string) => {
      return validator.hasFieldError(validationErrors, fieldName);
    },
    [validationErrors, validator]
  );

  const clearErrors = useCallback(() => {
    setValidationErrors([]);
  }, []);

  return {
    validationErrors,
    isValidating,
    validateData,
    validateField,
    getFieldErrors,
    hasFieldError,
    clearErrors,
  };
}

// ================================================
// UNIFIED FORM COMPONENT
// ================================================

export default function UnifiedForm() {
  const { showToast } = useToast();
  const {
    validationErrors,
    isValidating,
    validateData,
    getFieldErrors,
    hasFieldError,
    clearErrors,
  } = useUnifiedValidation(userRegistrationSchema);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<UserRegistrationFormData>({
    resolver: zodResolver(userRegistrationSchema),
    mode: 'onChange',
  });

  const userType = watch('userType');

  const onSubmit = async (data: UserRegistrationFormData) => {
    clearErrors();

    // Demonstrate unified validation
    const validationResult = await validateData(data);

    if (!validationResult.success) {
      showToast(
        `${validationResult.errors?.length || 0} hata bulundu. Lütfen formu kontrol edin.`,
        'error'
      );
      return;
    }

    // Simulate API call
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      showToast('Kullanıcı kaydı başarıyla oluşturuldu.', 'success');

      console.log('Validated form data:', validationResult.data);
    } catch {
      showToast('Kayıt işlemi sırasında bir hata oluştu.', 'error');
    }
  };

  // ================================================
  // FIELD ERROR COMPONENT
  // ================================================

  const FieldError: React.FC<{ fieldName: string }> = ({ fieldName }) => {
    const errors = getFieldErrors(fieldName);

    if (errors.length === 0) return null;

    return (
      <div className="mt-1 text-sm text-red-600">
        {errors.map((error, index) => (
          <div key={index}>{error}</div>
        ))}
      </div>
    );
  };

  // ================================================
  // VALIDATION SUMMARY COMPONENT
  // ================================================

  const ValidationSummary: React.FC = () => {
    if (validationErrors.length === 0) return null;

    return (
      <Alert variant="destructive" className="mb-6">
        <AlertDescription>
          <div className="mb-2 font-semibold">
            {validationErrors.length} doğrulama hatası bulundu:
          </div>
          <ul className="list-inside list-disc space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index} className="text-sm">
                <span className="font-medium">{error.field}:</span>{' '}
                {error.message}
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    );
  };

  // ================================================
  // RENDER
  // ================================================

  return (
    <div className="mx-auto max-w-2xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>Unified Validation System Demo</CardTitle>
          <p className="text-muted-foreground text-sm">
            Bu form, unified validation sistemini göstermektedir. Tutarlı hata
            mesajları, Türkçe doğrulama mesajları ve yeniden kullanılabilir
            validation kuralları içerir.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <ValidationSummary />

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Kişisel Bilgiler</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Ad *</Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    className={
                      hasFieldError('firstName') ? 'border-red-500' : ''
                    }
                  />
                  <FieldError fieldName="firstName" />
                </div>

                <div>
                  <Label htmlFor="lastName">Soyad *</Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    className={
                      hasFieldError('lastName') ? 'border-red-500' : ''
                    }
                  />
                  <FieldError fieldName="lastName" />
                </div>
              </div>

              <div>
                <Label htmlFor="email">E-posta *</Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className={hasFieldError('email') ? 'border-red-500' : ''}
                />
                <FieldError fieldName="email" />
              </div>

              <div>
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0555 123 45 67"
                  {...register('phone')}
                  className={hasFieldError('phone') ? 'border-red-500' : ''}
                />
                <FieldError fieldName="phone" />
              </div>
            </div>

            {/* Account Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Hesap Bilgileri</h3>

              <div>
                <Label htmlFor="password">Şifre *</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password')}
                  className={hasFieldError('password') ? 'border-red-500' : ''}
                />
                <div className="text-muted-foreground mt-1 text-xs">
                  En az 8 karakter, büyük harf, küçük harf, rakam ve özel
                  karakter içermelidir
                </div>
                <FieldError fieldName="password" />
              </div>

              <div>
                <Label htmlFor="userType">Kullanıcı Tipi *</Label>
                <Select
                  onValueChange={(value) =>
                    setValue('userType', value as 'freelancer' | 'employer')
                  }
                >
                  <SelectTrigger
                    className={
                      hasFieldError('userType') ? 'border-red-500' : ''
                    }
                  >
                    <SelectValue placeholder="Kullanıcı tipini seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="employer">İşveren</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError fieldName="userType" />
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Profil Bilgileri</h3>

              <div>
                <Label htmlFor="bio">
                  Biyografi *
                  {userType === 'freelancer' && (
                    <span className="text-muted-foreground ml-1 text-sm">
                      (Freelancer için en az 100 karakter)
                    </span>
                  )}
                </Label>
                <Textarea
                  id="bio"
                  rows={4}
                  placeholder="Kendinizden bahsedin..."
                  {...register('bio')}
                  className={hasFieldError('bio') ? 'border-red-500' : ''}
                />
                <FieldError fieldName="bio" />
              </div>

              <div>
                <Label htmlFor="city">Şehir *</Label>
                <Input
                  id="city"
                  {...register('city')}
                  className={hasFieldError('city') ? 'border-red-500' : ''}
                />
                <FieldError fieldName="city" />
              </div>
            </div>

            {/* Agreements */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Sözleşmeler</h3>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="termsAccepted"
                  {...register('termsAccepted')}
                  className={
                    hasFieldError('termsAccepted') ? 'border-red-500' : ''
                  }
                />
                <Label htmlFor="termsAccepted" className="text-sm">
                  Kullanım şartlarını ve gizlilik politikasını kabul ediyorum *
                </Label>
              </div>
              <FieldError fieldName="termsAccepted" />

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="marketingAccepted"
                  {...register('marketingAccepted')}
                />
                <Label htmlFor="marketingAccepted" className="text-sm">
                  Pazarlama e-postalarını almayı kabul ediyorum
                </Label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || isValidating}
              >
                {isSubmitting ? 'Kaydediliyor...' : 'Kayıt Ol'}
              </Button>
            </div>
          </form>

          {/* Debug Information */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-8 rounded-lg bg-gray-50 p-4">
              <h4 className="mb-2 font-medium">Debug Information</h4>
              <div className="space-y-2 text-xs">
                <div>
                  <strong>Validation Errors:</strong> {validationErrors.length}
                </div>
                <div>
                  <strong>Error Messages Available:</strong>{' '}
                  {Object.keys(ERROR_MESSAGES).length}
                </div>
                <div>
                  <strong>Common Schemas:</strong>{' '}
                  {Object.keys(CommonSchemas).length}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
