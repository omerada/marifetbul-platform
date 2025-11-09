'use client';

/**
 * ================================================
 * JOB CREATE FORM COMPONENT
 * ================================================
 * Comprehensive form for creating job postings
 *
 * Features:
 * - Category & subcategory selection
 * - Budget type (fixed/hourly/range)
 * - Deadline picker
 * - Skills selection
 * - Attachment upload
 * - Real-time validation
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1: Job System
 */

'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import {
  Briefcase,
  DollarSign,
  Calendar,
  FileText,
  Tag,
  Upload,
  X,
  AlertCircle,
} from 'lucide-react';
import {
  jobPostingSchema,
  type JobPostingFormData,
} from '@/lib/core/validations/jobs';
import { logger } from '@/lib/infrastructure/monitoring/logger';
import { toast } from 'sonner';

// ================================================
// TYPES
// ================================================

interface JobCreateFormProps {
  onSubmit: (data: JobPostingFormData) => void | Promise<void>;
  onCancel?: () => void;
  defaultValues?: Partial<JobPostingFormData>;
  isSubmitting?: boolean;
}

// ================================================
// COMPONENT
// ================================================

export function JobCreateForm({
  onSubmit,
  onCancel,
  defaultValues,
  isSubmitting = false,
}: JobCreateFormProps) {
  // ==================== STATE ====================

  const [isLoadingCategories] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  // ==================== FORM ====================

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
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

  const budgetType = watch('budgetType');
  const title = watch('title');
  const description = watch('description');

  // ==================== EFFECTS ====================

  // Categories are now hardcoded in select options
  // Future: Load from API dynamically

  // ==================== HANDLERS ====================

  const handleFormSubmit = async (data: JobPostingFormData) => {
    try {
      logger.info('Submitting job form', { title: data.title });
      await onSubmit(data);
    } catch (error) {
      logger.error('Job form submission failed', error as Error);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validate file sizes (max 10MB each)
    const validFiles = files.filter((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} dosyası çok büyük (max 10MB)`);
        return false;
      }
      return true;
    });

    setAttachments((prev) => [...prev, ...validFiles]);
    toast.success(`${validFiles.length} dosya eklendi`);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // ==================== RENDER ====================

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Title */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Briefcase className="text-primary h-5 w-5" />
          <h3 className="text-lg font-semibold">İş Detayları</h3>
        </div>

        <div className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              İş Başlığı <span className="text-red-500">*</span>
            </label>
            <Input
              {...register('title')}
              placeholder="Örn: React Developer aranıyor"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-3 w-3" />
                {errors.title.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {title?.length || 0}/100 karakter
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              İş Açıklaması <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              rows={6}
              placeholder="İş detaylarını, gereksinimlerinizi ve beklentilerinizi açıklayın..."
              className={`focus:ring-primary w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-3 w-3" />
                {errors.description.message}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {description?.length || 0}/2000 karakter
            </p>
          </div>
        </div>
      </Card>

      {/* Category & Skills */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Tag className="text-primary h-5 w-5" />
          <h3 className="text-lg font-semibold">Kategori & Yetenekler</h3>
        </div>

        <div className="space-y-4">
          {/* Category Select */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              {...register('category')}
              disabled={isLoadingCategories}
              className={`focus:ring-primary w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">
                {isLoadingCategories ? 'Yükleniyor...' : 'Kategori seçin'}
              </option>
              <option value="web-development">Web Geliştirme</option>
              <option value="mobile-development">Mobil Uygulama</option>
              <option value="design">Tasarım</option>
              <option value="content-writing">İçerik Yazarlığı</option>
              <option value="digital-marketing">Dijital Pazarlama</option>
              <option value="video-animation">Video & Animasyon</option>
              <option value="business">İş & Yönetim</option>
              <option value="translation">Çeviri</option>
              <option value="other">Diğer</option>
            </select>
            {errors.category && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-3 w-3" />
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Required Skills */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Gerekli Yetenekler
            </label>
            <Input
              {...register('requiredSkills')}
              placeholder="React, TypeScript, Node.js (virgülle ayırın)"
            />
            <p className="mt-1 text-xs text-gray-500">
              İşin gerektirdiği yetenekleri virgülle ayırarak yazın
            </p>
          </div>

          {/* Experience Level */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Deneyim Seviyesi <span className="text-red-500">*</span>
            </label>
            <select
              {...register('experienceLevel')}
              className="focus:ring-primary w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2"
            >
              <option value="ENTRY">Başlangıç</option>
              <option value="INTERMEDIATE">Orta</option>
              <option value="EXPERT">Uzman</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Budget */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <DollarSign className="text-primary h-5 w-5" />
          <h3 className="text-lg font-semibold">Bütçe</h3>
        </div>

        <div className="space-y-4">
          {/* Budget Type */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Bütçe Tipi <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-3">
              <label className="hover:border-primary flex cursor-pointer items-center justify-center rounded-lg border px-4 py-3 transition-colors">
                <input
                  type="radio"
                  {...register('budgetType')}
                  value="FIXED"
                  className="mr-2"
                />
                <span className="text-sm font-medium">Sabit Fiyat</span>
              </label>
              <label className="hover:border-primary flex cursor-pointer items-center justify-center rounded-lg border px-4 py-3 transition-colors">
                <input
                  type="radio"
                  {...register('budgetType')}
                  value="HOURLY"
                  className="mr-2"
                />
                <span className="text-sm font-medium">Saatlik</span>
              </label>
              <label className="hover:border-primary flex cursor-pointer items-center justify-center rounded-lg border px-4 py-3 transition-colors">
                <input
                  type="radio"
                  {...register('budgetType')}
                  value="RANGE"
                  className="mr-2"
                />
                <span className="text-sm font-medium">Aralık</span>
              </label>
            </div>
          </div>

          {/* Budget Amount(s) */}
          {budgetType === 'FIXED' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Min Bütçe (TL) <span className="text-red-500">*</span>
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('budgetMin', { valueAsNumber: true })}
                  placeholder="3000"
                  className={errors.budgetMin ? 'border-red-500' : ''}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Max Bütçe (TL)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  {...register('budgetMax', { valueAsNumber: true })}
                  placeholder="5000"
                />
              </div>
            </div>
          )}

          {budgetType === 'HOURLY' && (
            <div>
              <label className="mb-2 block text-sm font-medium">
                Saatlik Ücret (TL) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                step="0.01"
                {...register('hourlyRate', { valueAsNumber: true })}
                placeholder="150"
                className={errors.hourlyRate ? 'border-red-500' : ''}
              />
              {errors.hourlyRate && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                  <AlertCircle className="h-3 w-3" />
                  {errors.hourlyRate.message}
                </p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Timeline */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="text-primary h-5 w-5" />
          <h3 className="text-lg font-semibold">Zaman Çizelgesi</h3>
        </div>

        <div className="space-y-4">
          {/* Deadline */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Son Başvuru Tarihi <span className="text-red-500">*</span>
            </label>
            <Input
              type="date"
              {...register('deadline')}
              min={new Date().toISOString().split('T')[0]}
              className={errors.deadline ? 'border-red-500' : ''}
            />
            {errors.deadline && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-500">
                <AlertCircle className="h-3 w-3" />
                {errors.deadline.message}
              </p>
            )}
          </div>

          {/* Expected Duration */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Tahmini Teslim Süresi
            </label>
            <Input {...register('duration')} placeholder="30 gün" />
            <p className="mt-1 text-xs text-gray-500">
              İşin tamamlanması için tahmin edilen süre
            </p>
          </div>
        </div>
      </Card>

      {/* Attachments */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <FileText className="text-primary h-5 w-5" />
          <h3 className="text-lg font-semibold">Ek Dosyalar</h3>
        </div>

        <div className="space-y-4">
          {/* Upload Button */}
          <div>
            <label className="hover:border-primary inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 transition-colors">
              <Upload className="h-4 w-4" />
              <span className="text-sm font-medium">Dosya Ekle</span>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
              />
            </label>
            <p className="mt-1 text-xs text-gray-500">
              PDF, DOC, JPG, PNG (Max 10MB)
            </p>
          </div>

          {/* Attachments List */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            disabled={isSubmitting}
          >
            İptal
          </Button>
        )}
        <Button type="submit" loading={isSubmitting}>
          <Briefcase className="mr-2 h-4 w-4" />
          İş İlanı Oluştur
        </Button>
      </div>
    </form>
  );
}

// ================================================
// EXPORT
// ================================================

export default JobCreateForm;
