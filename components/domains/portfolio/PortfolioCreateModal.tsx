'use client';

/**
 * Portfolio Create Modal
 * Sprint 1: Story 1.1 - Portfolio CRUD UI
 *
 * Form for creating new portfolio items with image upload
 */

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui/Card';
import { toast } from 'sonner';
import { usePortfolio } from '@/hooks/business/portfolio/usePortfolio';
import { uploadImage, isCloudinaryConfigured } from '@/lib/utils/cloudinary';
import logger from '@/lib/infrastructure/monitoring/logger';

// ============================================================================
// VALIDATION SCHEMA
// ============================================================================

const portfolioSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalıdır').max(100),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalıdır'),
  url: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
  completedAt: z.string().min(1, 'Tarih seçiniz'),
  category: z.string().optional(),
  client: z.string().optional(),
  skills: z.array(z.string()).default([]),
  isPublic: z.boolean().default(true),
});

type PortfolioFormData = z.infer<typeof portfolioSchema>;

// ============================================================================
// COMPONENT
// ============================================================================

interface PortfolioCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PortfolioCreateModal({
  isOpen,
  onClose,
  onSuccess,
}: PortfolioCreateModalProps) {
  const { createNewPortfolio, isCreating } = usePortfolio();
  const [skillInput, setSkillInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      isPublic: true,
      skills: [],
    },
  });

  const skills = watch('skills') || [];

  // Handle form submission
  const onSubmit = async (data: PortfolioFormData) => {
    if (images.length === 0) {
      toast.error('En az bir görsel yüklemelisiniz');
      return;
    }

    const result = await createNewPortfolio({
      ...data,
      // Backend expects these fields, map appropriately
      // You may need to adjust based on actual backend expectations
    });

    if (result) {
      reset();
      setImages([]);
      setSkillInput('');
      onSuccess?.();
      onClose();
    }
  };

  // Handle image upload
  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const file = files[0];

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Sadece görsel dosyaları yükleyebilirsiniz');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Görsel boyutu 5MB'dan küçük olmalıdır");
        return;
      }

      // Check Cloudinary configuration
      if (!isCloudinaryConfigured()) {
        toast.error('Cloudinary yapılandırması eksik');
        logger.error('Cloudinary is not configured');
        return;
      }

      // Upload to Cloudinary
      toast.loading('Görsel yükleniyor...', { id: 'upload' });
      const result = await uploadImage(file);

      if (result.success && result.url) {
        setImages((prev) => [...prev, result.url!]);
        toast.success('Görsel başarıyla yüklendi!', { id: 'upload' });
      } else {
        toast.error(result.error || 'Görsel yüklenirken hata oluştu', {
          id: 'upload',
        });
      }
    } catch (error) {
      toast.error('Görsel yüklenirken hata oluştu', { id: 'upload' });
      logger.error('Image upload error:', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setUploadingImage(false);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Add skill
  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setValue('skills', [...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  // Remove skill
  const removeSkill = (skill: string) => {
    setValue(
      'skills',
      skills.filter((s) => s !== skill)
    );
  };

  // Handle modal close
  const handleClose = () => {
    if (isCreating) return;
    reset();
    setImages([]);
    setSkillInput('');
    onClose();
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isCreating) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Trap focus in modal
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, isCreating]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isCreating) {
          handleClose();
        }
      }}
    >
      <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 id="modal-title" className="text-xl font-semibold">
            Yeni Portfolio Ekle
          </h2>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="rounded-full p-1 hover:bg-gray-100"
            aria-label="Modalı kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
          {/* Title */}
          <div>
            <label
              htmlFor="portfolio-title"
              className="mb-1 block text-sm font-medium"
            >
              Başlık <span className="text-red-500">*</span>
            </label>
            <input
              {...register('title')}
              id="portfolio-title"
              type="text"
              className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Proje başlığı"
              aria-required="true"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <p
                id="title-error"
                className="mt-1 text-sm text-red-500"
                role="alert"
              >
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="portfolio-description"
              className="mb-1 block text-sm font-medium"
            >
              Açıklama <span className="text-red-500">*</span>
            </label>
            <textarea
              {...register('description')}
              id="portfolio-description"
              rows={4}
              className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Proje hakkında detaylı bilgi"
              aria-required="true"
              aria-invalid={!!errors.description}
              aria-describedby={
                errors.description ? 'description-error' : undefined
              }
            />
            {errors.description && (
              <p
                id="description-error"
                className="mt-1 text-sm text-red-500"
                role="alert"
              >
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Images */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Görseller <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, index) => (
                <div key={index} className="relative aspect-square">
                  <Image
                    src={img}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="rounded-lg object-cover"
                    sizes="(max-width: 768px) 33vw, 200px"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                    aria-label={`Görsel ${index + 1}'i kaldır`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed hover:bg-gray-50">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
                {uploadingImage ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
                ) : (
                  <>
                    <Upload className="mb-1 h-8 w-8 text-gray-400" />
                    <span className="text-xs text-gray-500">Görsel Ekle</span>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* URL */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Proje URL (opsiyonel)
            </label>
            <input
              {...register('url')}
              type="url"
              className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com"
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-500">{errors.url.message}</p>
            )}
          </div>

          {/* Date & Category Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Tamamlanma Tarihi <span className="text-red-500">*</span>
              </label>
              <input
                {...register('completedAt')}
                type="date"
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
              />
              {errors.completedAt && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.completedAt.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Kategori (opsiyonel)
              </label>
              <input
                {...register('category')}
                type="text"
                className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Web Design"
              />
            </div>
          </div>

          {/* Client */}
          <div>
            <label className="mb-1 block text-sm font-medium">
              Müşteri (opsiyonel)
            </label>
            <input
              {...register('client')}
              type="text"
              className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
              placeholder="Şirket Adı"
            />
          </div>

          {/* Skills */}
          <div>
            <label className="mb-1 block text-sm font-medium">Yetenekler</label>
            <div className="mb-2 flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), addSkill())
                }
                className="flex-1 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Yetenek ekle (Enter ile)"
              />
              <Button type="button" onClick={addSkill} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-blue-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Public Toggle */}
          <div className="flex items-center gap-2">
            <input
              {...register('isPublic')}
              type="checkbox"
              id="isPublic"
              className="rounded"
            />
            <label htmlFor="isPublic" className="text-sm">
              Herkese açık olarak göster
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isCreating}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isCreating || images.length === 0}>
              {isCreating ? 'Oluşturuluyor...' : 'Oluştur'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default PortfolioCreateModal;
