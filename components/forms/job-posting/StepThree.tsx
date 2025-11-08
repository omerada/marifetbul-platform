/**
 * ================================================
 * JOB POSTING WIZARD - STEP 3: BUDGET & TIMELINE
 * ================================================
 * Form for budget type, amount, duration, and deadline
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Production Ready
 * @created November 8, 2025
 *
 * Sprint: Job Posting Wizard Implementation
 * Task: T1.5 - Step 3 Form Implementation
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight, Calendar, Info } from 'lucide-react';
import { z } from 'zod';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui';

import type { StepThreeProps } from './types';
import { BUDGET_TYPE_OPTIONS } from './types';
import type { JobPostingFormData } from '@/lib/core/validations/jobs';

// ================================================
// VALIDATION SCHEMA FOR STEP 3
// ================================================

const stepThreeSchema = z
  .object({
    budgetType: z.enum(['FIXED', 'HOURLY']),

    budgetMin: z
      .number()
      .min(50, 'Minimum bütçe en az 50 TL olmalıdır')
      .optional(),

    budgetMax: z.number().max(1000000, 'Maksimum bütçe çok yüksek').optional(),

    hourlyRate: z
      .number()
      .min(50, 'Saatlik ücret en az 50 TL olmalıdır')
      .max(5000, 'Saatlik ücret çok yüksek')
      .optional(),

    duration: z
      .string()
      .min(1, 'Proje süresi belirtilmelidir')
      .max(100, 'Proje süresi çok uzun')
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
        { message: 'Son başvuru tarihi en az 1 gün sonra olmalıdır' }
      )
      .optional(),
  })
  .refine(
    (data) => {
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
      if (
        data.budgetMin !== undefined &&
        data.budgetMax !== undefined &&
        data.budgetType === 'FIXED'
      ) {
        return data.budgetMax > data.budgetMin;
      }
      return true;
    },
    {
      message: 'Maksimum bütçe minimum bütçeden büyük olmalıdır',
      path: ['budgetMax'],
    }
  );

type StepThreeFormData = z.infer<typeof stepThreeSchema>;

// ================================================
// COMPONENT
// ================================================

export function StepThree({
  data,
  onNext,
  onBack,
  onSaveDraft,
  isSubmitting,
}: StepThreeProps) {
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    register,
  } = useForm<StepThreeFormData>({
    resolver: zodResolver(stepThreeSchema),
    mode: 'onChange',
    defaultValues: {
      budgetType: data.budgetType || 'FIXED',
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
      hourlyRate: data.hourlyRate,
      duration: data.duration || '',
      deadline: data.deadline || '',
    },
  });

  const budgetType = watch('budgetType');
  const budgetMin = watch('budgetMin');
  const budgetMax = watch('budgetMax');

  // Reset budget fields when type changes
  useEffect(() => {
    if (budgetType === 'HOURLY') {
      setValue('budgetMin', undefined);
      setValue('budgetMax', undefined);
    } else {
      setValue('hourlyRate', undefined);
    }
  }, [budgetType, setValue]);

  // ==================== FORM HANDLERS ====================

  const onSubmit = (formData: StepThreeFormData) => {
    onNext(formData as Partial<JobPostingFormData>);
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      const currentValues = watch();
      await onSaveDraft(currentValues as Partial<JobPostingFormData>);
    } finally {
      setIsSavingDraft(false);
    }
  };

  // Get minimum date for deadline (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // ==================== RENDER ====================

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bütçe & Zaman Çizelgesi</CardTitle>
        <p className="text-muted-foreground text-sm">
          İşin bütçesini ve zaman çerçevesini belirleyin
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Budget Type */}
          <div className="space-y-2">
            <Label htmlFor="budgetType" required>
              Bütçe Türü
            </Label>
            <Controller
              name="budgetType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger placeholder="Bütçe türünü seçin" />
                  <SelectContent>
                    {BUDGET_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-muted-foreground text-xs">
              {budgetType === 'FIXED'
                ? 'Proje için toplam sabit bir ücret belirleyin'
                : 'Freelancer için saat başına ücret belirleyin'}
            </p>
          </div>

          {/* Fixed Budget Fields */}
          {budgetType === 'FIXED' && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Minimum Budget */}
                <div className="space-y-2">
                  <Label htmlFor="budgetMin">
                    Minimum Bütçe (TL){' '}
                    <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                    name="budgetMin"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="budgetMin"
                        type="number"
                        min={50}
                        step={50}
                        placeholder="5000"
                        value={field.value || ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        error={errors.budgetMin?.message}
                      />
                    )}
                  />
                </div>

                {/* Maximum Budget */}
                <div className="space-y-2">
                  <Label htmlFor="budgetMax">
                    Maksimum Bütçe (TL){' '}
                    <span className="text-muted-foreground">
                      (İsteğe bağlı)
                    </span>
                  </Label>
                  <Controller
                    name="budgetMax"
                    control={control}
                    render={({ field }) => (
                      <Input
                        id="budgetMax"
                        type="number"
                        min={budgetMin || 50}
                        step={50}
                        placeholder="10000"
                        value={field.value || ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        error={errors.budgetMax?.message}
                      />
                    )}
                  />
                </div>
              </div>

              {budgetMin !== undefined && budgetMax !== undefined && (
                <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                  <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <p>
                    Bütçe aralığı:{' '}
                    <strong>
                      {budgetMin} - {budgetMax} TL
                    </strong>{' '}
                    (Ortalama: {Math.round((budgetMin + budgetMax) / 2)} TL)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Hourly Rate Field */}
          {budgetType === 'HOURLY' && (
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">
                Saatlik Ücret (TL) <span className="text-destructive">*</span>
              </Label>
              <Controller
                name="hourlyRate"
                control={control}
                render={({ field }) => (
                  <Input
                    id="hourlyRate"
                    type="number"
                    min={50}
                    max={5000}
                    step={10}
                    placeholder="150"
                    value={field.value || ''}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
                    error={errors.hourlyRate?.message}
                  />
                )}
              />
              <p className="text-muted-foreground text-xs">
                Freelancer&apos;a saat başına ödenecek ücret
              </p>
            </div>
          )}

          {/* Project Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration">
              Proje Süresi{' '}
              <span className="text-muted-foreground">(İsteğe bağlı)</span>
            </Label>
            <Input
              id="duration"
              placeholder="Örn: 2 hafta, 1 ay, 3-4 ay"
              {...register('duration')}
              error={errors.duration?.message}
              maxLength={100}
            />
            <p className="text-muted-foreground text-xs">
              Projenin tamamlanması için beklenen süre
            </p>
          </div>

          {/* Deadline */}
          <div className="space-y-2">
            <Label htmlFor="deadline">
              Son Başvuru Tarihi{' '}
              <span className="text-muted-foreground">(İsteğe bağlı)</span>
            </Label>
            <div className="relative">
              <Input
                id="deadline"
                type="date"
                min={minDate}
                {...register('deadline')}
                error={errors.deadline?.message}
                className="pr-10"
              />
              <Calendar className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2" />
            </div>
            <p className="text-muted-foreground text-xs">
              Freelancer&apos;ların teklif gönderebilecekleri son tarih
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between border-t pt-6">
            <Button type="button" variant="outline" onClick={onBack}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Geri
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveDraft}
                disabled={isSubmitting || isSavingDraft}
              >
                {isSavingDraft ? 'Kaydediliyor...' : 'Taslak Kaydet'}
              </Button>

              <Button type="submit" disabled={isSubmitting || !isValid}>
                İleri <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default StepThree;
