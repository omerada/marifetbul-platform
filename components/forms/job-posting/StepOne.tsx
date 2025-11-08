/**
 * ================================================
 * JOB POSTING WIZARD - STEP 1: BASIC INFO
 * ================================================
 * Form for job title, description, category, location
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Production Ready
 * @created November 8, 2025
 *
 * Sprint: Job Posting Wizard Implementation
 * Task: T1.3 - Step 1 Form Implementation
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight } from 'lucide-react';
import { z } from 'zod';

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui';

import type { StepOneProps } from './types';
import { CATEGORY_OPTIONS } from './types';
import type { JobPostingFormData } from '@/lib/core/validations/jobs';

// ================================================
// VALIDATION SCHEMA FOR STEP 1
// ================================================

const stepOneSchema = z.object({
  title: z
    .string()
    .min(10, 'Başlık en az 10 karakter olmalıdır')
    .max(100, 'Başlık en fazla 100 karakter olabilir'),

  description: z
    .string()
    .min(100, 'Açıklama en az 100 karakter olmalıdır')
    .max(5000, 'Açıklama en fazla 5000 karakter olabilir'),

  category: z.string().min(1, 'Kategori seçilmelidir'),

  location: z
    .string()
    .min(2, 'Konum en az 2 karakter olmalıdır')
    .max(100, 'Konum çok uzun')
    .optional(),

  isRemote: z.boolean().default(true),
});

type StepOneFormData = z.infer<typeof stepOneSchema>;

// ================================================
// COMPONENT
// ================================================

export function StepOne({
  data,
  onNext,
  onSaveDraft,
  isSubmitting,
}: StepOneProps) {
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
  } = useForm<StepOneFormData>({
    resolver: zodResolver(stepOneSchema),
    mode: 'onChange',
    defaultValues: {
      title: data.title || '',
      description: data.description || '',
      category: data.category || '',
      location: data.location || '',
      isRemote: data.isRemote ?? true,
    },
  });

  const description = watch('description');
  const isRemote = watch('isRemote');
  const descriptionLength = description?.length || 0;

  // ==================== HANDLERS ====================

  const onSubmit = (formData: StepOneFormData) => {
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

  // ==================== RENDER ====================

  return (
    <Card>
      <CardHeader>
        <CardTitle>Temel Bilgiler</CardTitle>
        <p className="text-muted-foreground text-sm">
          İşinizin başlığını, açıklamasını ve kategorisini belirtin
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Job Title */}
          <div className="space-y-2">
            <Label htmlFor="title" required>
              İş Başlığı
            </Label>
            <Input
              id="title"
              placeholder="Örn: React ile Modern Web Uygulaması Geliştirilmesi"
              {...register('title')}
              error={errors.title?.message}
            />
            <p className="text-muted-foreground text-xs">
              Açık ve net bir başlık, daha fazla freelancer&apos;ın dikkatini
              çeker
            </p>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category" required>
              Kategori
            </Label>
            <Select
              value={watch('category')}
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger placeholder="Bir kategori seçin" />
              <SelectContent>
                {CATEGORY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-destructive text-sm">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" required>
              İş Açıklaması
            </Label>
            <Textarea
              id="description"
              rows={8}
              placeholder="İşinizin detaylarını açıklayın:&#10;• Ne yapılmasını istiyorsunuz?&#10;• Projenin kapsamı nedir?&#10;• Özel gereksinimler var mı?&#10;• Başarı kriterleri nelerdir?"
              {...register('description')}
              className="resize-none"
            />
            <div className="flex items-center justify-between text-xs">
              {errors.description ? (
                <p className="text-destructive">{errors.description.message}</p>
              ) : (
                <p className="text-muted-foreground">
                  Detaylı açıklama, kaliteli teklifler almanızı sağlar
                </p>
              )}
              <p
                className={
                  descriptionLength < 100
                    ? 'text-destructive'
                    : descriptionLength > 4500
                      ? 'text-orange-500'
                      : 'text-muted-foreground'
                }
              >
                {descriptionLength} / 5000
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">
              Konum {!isRemote && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="location"
              placeholder="Örn: İstanbul, Türkiye"
              {...register('location')}
              disabled={isRemote}
              error={!isRemote ? errors.location?.message : undefined}
            />
            <p className="text-muted-foreground text-xs">
              {isRemote
                ? 'Uzaktan çalışma seçildiğinde konum opsiyoneldir'
                : 'Konum zorunludur'}
            </p>
          </div>

          {/* Remote Work Checkbox */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="isRemote"
              {...register('isRemote')}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex-1">
              <Label htmlFor="isRemote" className="cursor-pointer font-normal">
                Uzaktan çalışma kabul ediliyor
              </Label>
              <p className="text-muted-foreground text-xs">
                Freelancer&apos;lar bulunduğu yerden çalışabilir
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-between border-t pt-6">
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
        </form>
      </CardContent>
    </Card>
  );
}

export default StepOne;
