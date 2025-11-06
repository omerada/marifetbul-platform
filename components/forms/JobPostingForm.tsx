/**
 * ================================================
 * JOB POSTING FORM COMPONENT
 * ================================================
 * Form for creating and editing job postings
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 6, 2025
 * Sprint: Job Posting & Proposal System - Story 1, Task 1.1
 */

'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MapPin, DollarSign, Briefcase } from 'lucide-react';

import {
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Checkbox,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui';
import { SkillSelector } from '@/components/shared/SkillSelector';
import {
  jobPostingSchema,
  type JobPostingFormData,
} from '@/lib/core/validations/jobs';
import { cn } from '@/lib/utils';

// ================================================
// TYPES
// ================================================

export interface JobPostingFormProps {
  defaultValues?: Partial<JobPostingFormData>;
  onSubmit: (data: JobPostingFormData) => Promise<void>;
  onSaveDraft?: (data: Partial<JobPostingFormData>) => Promise<void>;
  isSubmitting?: boolean;
  submitLabel?: string;
  showDraftButton?: boolean;
  className?: string;
}

// ================================================
// CATEGORIES & OPTIONS
// ================================================

const CATEGORIES = [
  { value: 'web-development', label: 'Web Geliştirme' },
  { value: 'mobile-development', label: 'Mobil Uygulama' },
  { value: 'design', label: 'Tasarım' },
  { value: 'content-writing', label: 'İçerik Yazarlığı' },
  { value: 'digital-marketing', label: 'Dijital Pazarlama' },
  { value: 'video-animation', label: 'Video & Animasyon' },
  { value: 'business', label: 'İş & Yönetim' },
  { value: 'translation', label: 'Çeviri' },
  { value: 'other', label: 'Diğer' },
] as const;

const EXPERIENCE_LEVELS = [
  { value: 'ENTRY', label: 'Başlangıç' },
  { value: 'INTERMEDIATE', label: 'Orta' },
  { value: 'EXPERT', label: 'Uzman' },
] as const;

const BUDGET_TYPES = [
  { value: 'FIXED', label: 'Sabit Fiyat' },
  { value: 'HOURLY', label: 'Saatlik Ücret' },
] as const;

// ================================================
// COMPONENT
// ================================================

export function JobPostingForm({
  defaultValues,
  onSubmit,
  onSaveDraft,
  isSubmitting = false,
  submitLabel = 'İlanı Yayınla',
  showDraftButton = true,
  className,
}: JobPostingFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isDirty },
  } = useForm<JobPostingFormData>({
    resolver: zodResolver(jobPostingSchema),
    defaultValues: {
      budgetType: 'FIXED',
      experienceLevel: 'INTERMEDIATE',
      isRemote: true,
      requiredSkills: [],
      ...defaultValues,
    },
  });

  // Watch budget type to show/hide relevant fields
  const budgetType = watch('budgetType');
  const isRemote = watch('isRemote');

  // ==================== HANDLERS ====================

  const handleFormSubmit = async (data: JobPostingFormData) => {
    await onSubmit(data);
  };

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;

    const formData = watch();
    await onSaveDraft(formData);
  };

  // ==================== RENDER ====================

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className={cn('space-y-6', className)}
    >
      {/* ==================== BASIC INFO SECTION ==================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Temel Bilgiler
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title */}
          <div>
            <Input
              label="İş İlanı Başlığı"
              placeholder="örn: Modern bir e-ticaret sitesi için React developer arıyorum"
              error={errors.title?.message}
              {...register('title')}
              fullWidth
            />
            <p className="text-muted-foreground mt-1 text-sm">
              Açıklayıcı ve ilgi çekici bir başlık yazın (10-100 karakter)
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Kategori <span className="text-destructive">*</span>
            </label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn(errors.category && 'border-destructive')}
                    placeholder="Kategori seçin"
                  />
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && (
              <p className="text-destructive mt-1 text-sm">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              İş Açıklaması <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder="Projenizi detaylı şekilde açıklayın... Ne yapmak istiyorsunuz? Hangi özelliklere ihtiyacınız var?"
              rows={8}
              className={cn(errors.description && 'border-destructive')}
              {...register('description')}
            />
            {errors.description && (
              <p className="text-destructive mt-1 text-sm">
                {errors.description.message}
              </p>
            )}
            <p className="text-muted-foreground mt-1 text-sm">
              Minimum 100, maksimum 5000 karakter
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ==================== SKILLS & REQUIREMENTS SECTION ==================== */}
      <Card>
        <CardHeader>
          <CardTitle>Beceriler & Gereksinimler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Required Skills */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Gerekli Beceriler <span className="text-destructive">*</span>
            </label>
            <Controller
              name="requiredSkills"
              control={control}
              render={({ field }) => (
                <SkillSelector
                  skills={field.value || []}
                  onChange={field.onChange}
                  maxSkills={15}
                  error={errors.requiredSkills?.message}
                />
              )}
            />
          </div>

          {/* Experience Level */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Deneyim Seviyesi <span className="text-destructive">*</span>
            </label>
            <Controller
              name="experienceLevel"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn(
                      errors.experienceLevel && 'border-destructive'
                    )}
                  />
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.experienceLevel && (
              <p className="text-destructive mt-1 text-sm">
                {errors.experienceLevel.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ==================== BUDGET & TIMELINE SECTION ==================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Bütçe & Zaman Çizelgesi
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Budget Type */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Bütçe Tipi <span className="text-destructive">*</span>
            </label>
            <Controller
              name="budgetType"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn(errors.budgetType && 'border-destructive')}
                  />
                  <SelectContent>
                    {BUDGET_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.budgetType && (
              <p className="text-destructive mt-1 text-sm">
                {errors.budgetType.message}
              </p>
            )}
          </div>

          {/* Fixed Budget Fields */}
          {budgetType === 'FIXED' && (
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Minimum Bütçe (TL)"
                type="number"
                placeholder="5000"
                error={errors.budgetMin?.message}
                {...register('budgetMin', { valueAsNumber: true })}
                fullWidth
              />
              <Input
                label="Maksimum Bütçe (TL)"
                type="number"
                placeholder="10000"
                error={errors.budgetMax?.message}
                {...register('budgetMax', { valueAsNumber: true })}
                fullWidth
              />
            </div>
          )}

          {/* Hourly Rate Field */}
          {budgetType === 'HOURLY' && (
            <Input
              label="Saatlik Ücret (TL)"
              type="number"
              placeholder="150"
              error={errors.hourlyRate?.message}
              {...register('hourlyRate', { valueAsNumber: true })}
              fullWidth
            />
          )}

          {/* Duration */}
          <Input
            label="Proje Süresi"
            placeholder="örn: 2-3 hafta, 1 ay, 3-6 ay"
            error={errors.duration?.message}
            {...register('duration')}
            fullWidth
          />

          {/* Deadline */}
          <div>
            <Input
              label="Son Başvuru Tarihi"
              type="date"
              error={errors.deadline?.message}
              {...register('deadline')}
              fullWidth
            />
            <p className="text-muted-foreground mt-1 text-sm">
              Freelancer&apos;ların teklif gönderebileceği son tarih
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ==================== LOCATION SECTION ==================== */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Konum Tercihleri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Remote Work Checkbox */}
          <div className="flex items-start gap-3">
            <Controller
              name="isRemote"
              control={control}
              render={({ field }) => (
                <Checkbox checked={field.value} onChange={field.onChange} />
              )}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Uzaktan Çalışma
              </label>
              <p className="text-muted-foreground text-sm">
                İş tamamen uzaktan yapılabilir
              </p>
            </div>
          </div>

          {/* Location Input (optional if not remote) */}
          {!isRemote && (
            <Input
              label="Konum"
              placeholder="örn: İstanbul, Türkiye"
              error={errors.location?.message}
              {...register('location')}
              fullWidth
            />
          )}
        </CardContent>
      </Card>

      {/* ==================== FORM ACTIONS ==================== */}
      <div className="flex flex-col items-stretch justify-end gap-3 sm:flex-row sm:items-center">
        {showDraftButton && onSaveDraft && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveDraft}
            disabled={isSubmitting || !isDirty}
          >
            Taslak Olarak Kaydet
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="min-w-[200px]">
          {isSubmitting ? 'Kaydediliyor...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default JobPostingForm;
