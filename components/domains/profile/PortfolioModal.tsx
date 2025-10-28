'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PortfolioItem } from '@/types';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks';
import { usePortfolioStore } from '@/stores/portfolioStore';
import {
  X,
  Plus,
  Upload,
  Link as LinkIcon,
  Calendar,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';
import { logger } from '@/lib/shared/utils/logger';

const portfolioSchema = z.object({
  title: z.string().min(3, 'Proje başlığı en az 3 karakter olmalı'),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalı'),
  url: z.string().url('Geçerli bir URL giriniz').optional().or(z.literal('')),
  completedAt: z.string().min(1, 'Tamamlanma tarihi gerekli'),
});

type PortfolioFormData = z.infer<typeof portfolioSchema>;

interface PortfolioModalProps {
  item: PortfolioItem | null;
  onClose: () => void;
}

export function PortfolioModal({ item, onClose }: PortfolioModalProps) {
  const { error: showError, success } = useToast();
  const { createPortfolio, updatePortfolio, uploadImage, ui } =
    usePortfolioStore();
  const [skills, setSkills] = useState<string[]>(item?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [images, setImages] = useState<string[]>(item?.images || []);
  const [uploadedImages, setUploadedImages] = useState<
    Array<{
      file: File;
      preview: string;
    }>
  >([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [isDragging, setIsDragging] = useState(false);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(
    null
  );
  const [draggedExistingIndex, setDraggedExistingIndex] = useState<
    number | null
  >(null);

  // Unsaved changes warning
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (isDirty) {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue =
          'Kaydedilmemiş değişiklikler var. Çıkmak istediğinize emin misiniz?';
      };
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    }
  }, [isDirty]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    // setValue, // For future use
  } = useForm<PortfolioFormData>({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      title: item?.title || '',
      description: item?.description || '',
      url: item?.url || '',
      completedAt: item?.completedAt ? item.completedAt.split('T')[0] : '',
    },
  });

  const onSubmit = async (data: PortfolioFormData) => {
    try {
      let portfolioId: string;

      // Create or update portfolio
      if (item) {
        // Update existing
        await updatePortfolio(item.id, {
          title: data.title,
          description: data.description,
          url: data.url || undefined,
          skills,
          completedAt: new Date(data.completedAt).toISOString(),
        });
        portfolioId = item.id;
        success('Başarılı', 'Portfolyo güncellendi!');
      } else {
        // Create new
        const newPortfolio = await createPortfolio({
          title: data.title,
          description: data.description,
          url: data.url || undefined,
          skills,
          completedAt: new Date(data.completedAt).toISOString(),
        });
        portfolioId = newPortfolio.id;
        success('Başarılı', 'Portfolyo oluşturuldu!');
      }

      // Upload new images
      if (uploadedImages.length > 0) {
        for (let i = 0; i < uploadedImages.length; i++) {
          const { file } = uploadedImages[i];
          try {
            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: 0,
            }));

            await uploadImage(portfolioId, file, i === 0); // First image is primary

            setUploadProgress((prev) => ({
              ...prev,
              [file.name]: 100,
            }));
          } catch (err) {
            logger.error(
              'Image upload failed',
              err instanceof Error ? err : new Error(String(err))
            );
            showError('Uyarı', `${file.name} yüklenemedi`);
          }
        }
      }

      setIsDirty(false);
      onClose();
    } catch (err) {
      logger.error(
        'Portfolio save error',
        err instanceof Error ? err : new Error(String(err))
      );
      showError('Hata', 'Kaydetme sırasında bir hata oluştu');
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  // File upload handlers
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      // Validate and add files
      const maxFiles = 10;
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
      ];

      const totalImages = images.length + uploadedImages.length;
      if (totalImages + files.length > maxFiles) {
        showError('Hata', `Maksimum ${maxFiles} görsel ekleyebilirsiniz`);
        return;
      }

      Array.from(files).forEach((file) => {
        // Validate file type
        if (!allowedTypes.includes(file.type)) {
          showError(
            'Hata',
            `Geçersiz dosya tipi: ${file.name}. Sadece JPG, PNG, WebP desteklenir.`
          );
          return;
        }

        // Validate file size
        if (file.size > maxSize) {
          showError('Hata', `Dosya çok büyük: ${file.name}. Maksimum 5MB`);
          return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadedImages((prev) => [
            ...prev,
            {
              file,
              preview: reader.result as string,
            },
          ]);
          setIsDirty(true);
        };
        reader.readAsDataURL(file);
      });
    },
    [images.length, uploadedImages.length, showError]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const removeUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeImage = (imageToRemove: string) => {
    setImages(images.filter((image) => image !== imageToRemove));
    setIsDirty(true);
  };

  // Image reordering handlers
  const handleImageDragStart = (index: number) => {
    setDraggedImageIndex(index);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedImageIndex === null || draggedImageIndex === index) return;

    const newImages = [...uploadedImages];
    const draggedItem = newImages[draggedImageIndex];
    newImages.splice(draggedImageIndex, 1);
    newImages.splice(index, 0, draggedItem);

    setUploadedImages(newImages);
    setDraggedImageIndex(index);
    setIsDirty(true);
  };

  const handleImageDragEnd = () => {
    setDraggedImageIndex(null);
  };

  // Existing image reordering handlers
  const handleExistingImageDragStart = (index: number) => {
    setDraggedExistingIndex(index);
  };

  const handleExistingImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedExistingIndex === null || draggedExistingIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedExistingIndex];
    newImages.splice(draggedExistingIndex, 1);
    newImages.splice(index, 0, draggedItem);

    setImages(newImages);
    setDraggedExistingIndex(index);
    setIsDirty(true);
  };

  const handleExistingImageDragEnd = () => {
    setDraggedExistingIndex(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <Card className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {item ? 'Projeyi Düzenle' : 'Yeni Proje Ekle'}
            </h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Proje Başlığı *
                </label>
                <Input
                  {...register('title')}
                  placeholder="ör. E-ticaret Web Sitesi"
                  error={errors.title?.message}
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  <Calendar className="mr-1 inline h-4 w-4" />
                  Tamamlanma Tarihi *
                </label>
                <Input
                  {...register('completedAt')}
                  type="date"
                  error={errors.completedAt?.message}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Proje Açıklaması *
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className="w-full rounded-md border border-gray-300 p-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Projenizi detaylı olarak açıklayın..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Project URL */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <LinkIcon className="mr-1 inline h-4 w-4" />
                Proje URL&apos;si
              </label>
              <Input
                {...register('url')}
                placeholder="https://example.com"
                error={errors.url?.message}
              />
            </div>

            {/* Skills */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Kullanılan Teknolojiler
              </label>

              <div className="mb-3">
                <div className="flex space-x-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Teknoloji ekleyin (ör. React)"
                    onKeyPress={(e) => handleKeyPress(e, addSkill)}
                  />
                  <Button
                    type="button"
                    onClick={addSkill}
                    variant="outline"
                    disabled={!newSkill.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex cursor-pointer items-center space-x-1 hover:bg-red-100"
                    onClick={() => removeSkill(skill)}
                  >
                    <span>{skill}</span>
                    <X className="h-3 w-3" />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                <ImageIcon className="mr-1 inline h-4 w-4" />
                Proje Görselleri (Maks. 10)
              </label>

              {/* File Upload Area with Drag & Drop */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative mt-2 rounded-lg border-2 border-dashed p-8 text-center transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="file"
                  id="portfolio-images"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                />
                <Upload className="mx-auto mb-3 h-12 w-12 text-gray-400" />
                <p className="mb-2 text-sm font-medium text-gray-700">
                  Görselleri sürükleyip bırakın veya
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById('portfolio-images')?.click()
                  }
                >
                  Dosya Seçin
                </Button>
                <p className="mt-2 text-xs text-gray-500">
                  JPG, PNG veya WebP (Maks. 5MB)
                </p>
              </div>

              {/* Uploaded Images Preview */}
              {uploadedImages.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Yüklenecek Görseller ({uploadedImages.length})
                  </p>
                  <p className="mb-3 text-xs text-gray-500">
                    💡 Görselleri sürükleyerek sırasını değiştirebilirsiniz. İlk
                    görsel kapak resmi olacaktır.
                  </p>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {uploadedImages.map((image, index) => (
                      <div
                        key={index}
                        draggable
                        onDragStart={() => handleImageDragStart(index)}
                        onDragOver={(e) => handleImageDragOver(e, index)}
                        onDragEnd={handleImageDragEnd}
                        className={`group relative cursor-move transition-all ${
                          draggedImageIndex === index
                            ? 'scale-95 opacity-50'
                            : 'hover:scale-105'
                        }`}
                      >
                        {/* Primary badge for first image */}
                        {index === 0 && (
                          <div className="absolute top-2 left-2 z-10 rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                            Kapak
                          </div>
                        )}

                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.preview}
                          alt={`Upload preview ${index + 1}`}
                          className="h-32 w-full rounded-md object-cover"
                        />

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(index)}
                          className="absolute top-2 right-2 rounded-full bg-red-600 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>

                        {/* Upload progress */}
                        {uploadProgress[image.file.name] !== undefined &&
                          uploadProgress[image.file.name] < 100 && (
                            <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center rounded-md bg-black">
                              <div className="text-center">
                                <Loader2 className="mx-auto h-6 w-6 animate-spin text-white" />
                                <p className="mt-1 text-xs text-white">
                                  {uploadProgress[image.file.name]}%
                                </p>
                              </div>
                            </div>
                          )}

                        {/* Drag indicator */}
                        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-blue-600 opacity-0 transition-opacity group-hover:opacity-10"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Existing Images (for edit mode) */}
              {images.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    Mevcut Görseller ({images.length})
                  </p>
                  <p className="mb-3 text-xs text-gray-500">
                    💡 Görselleri sürükleyerek sırasını değiştirebilirsiniz.
                  </p>
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {images.map((image, index) => (
                      <div
                        key={index}
                        draggable
                        onDragStart={() => handleExistingImageDragStart(index)}
                        onDragOver={(e) =>
                          handleExistingImageDragOver(e, index)
                        }
                        onDragEnd={handleExistingImageDragEnd}
                        className={`group relative cursor-move transition-all ${
                          draggedExistingIndex === index
                            ? 'scale-95 opacity-50'
                            : 'hover:scale-105'
                        }`}
                      >
                        {/* Primary badge for first image */}
                        {index === 0 && (
                          <div className="absolute top-2 left-2 z-10 rounded-full bg-green-600 px-2 py-1 text-xs font-semibold text-white">
                            Kapak
                          </div>
                        )}

                        <Image
                          src={image}
                          alt={`Proje görseli ${index + 1}`}
                          width={128}
                          height={128}
                          className="h-32 w-full rounded-md object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              '/images/placeholder.png';
                          }}
                        />

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => removeImage(image)}
                          className="absolute top-2 right-2 rounded-full bg-red-600 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>

                        {/* Drag indicator */}
                        <div className="absolute inset-0 flex items-center justify-center rounded-md bg-green-600 opacity-0 transition-opacity group-hover:opacity-10"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={ui.isSubmitting}
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={ui.isSubmitting}
                className="min-w-[120px]"
              >
                {ui.isSubmitting ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </div>
                ) : item ? (
                  'Güncelle'
                ) : (
                  'Kaydet'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
