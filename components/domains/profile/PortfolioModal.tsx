'use client';

import React, { useState } from 'react';
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
import {
  X,
  Plus,
  Upload,
  Link as LinkIcon,
  Calendar,
  Image as ImageIcon,
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
  onSave: (data: Omit<PortfolioItem, 'id'>) => Promise<void>;
}

export function PortfolioModal({ item, onClose, onSave }: PortfolioModalProps) {
  const { error, success } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skills, setSkills] = useState<string[]>(item?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [images, setImages] = useState<string[]>(item?.images || []);
  const [newImageUrl, setNewImageUrl] = useState('');

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
    setIsSubmitting(true);
    try {
      const portfolioData: Omit<PortfolioItem, 'id'> = {
        title: data.title,
        description: data.description,
        imageUrl: images[0] || '',
        url: data.url || undefined,
        skills,
        images,
        completedAt: new Date(data.completedAt).toISOString(),
        tags: skills, // Use skills as tags for compatibility
        createdAt: new Date().toISOString(),
      };

      await onSave(portfolioData);
      success('Başarılı', 'Portfolyo öğesi kaydedildi!');
      onClose();
    } catch (err) {
      logger.error(
        'Portfolio save error',
        err instanceof Error ? err : new Error(String(err))
      );
      error('Hata', 'Kaydetme sırasında bir hata oluştu');
    } finally {
      setIsSubmitting(false);
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

  const addImage = () => {
    if (newImageUrl.trim() && !images.includes(newImageUrl.trim())) {
      setImages([...images, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const removeImage = (imageToRemove: string) => {
    setImages(images.filter((image) => image !== imageToRemove));
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
                Proje Görselleri
              </label>

              <div className="mb-3">
                <div className="flex space-x-2">
                  <Input
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Görsel URL'si ekleyin"
                    onKeyPress={(e) => handleKeyPress(e, addImage)}
                  />
                  <Button
                    type="button"
                    onClick={addImage}
                    variant="outline"
                    disabled={!newImageUrl.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {images.map((image, index) => (
                    <div key={index} className="group relative">
                      <Image
                        src={image}
                        alt={`Proje görseli ${index + 1}`}
                        width={96}
                        height={96}
                        className="h-24 w-full rounded-md object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            '/images/placeholder.png';
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(image)}
                        className="absolute top-1 right-1 rounded-full bg-red-600 p-1 text-white opacity-0 transition-colors group-hover:opacity-100 hover:bg-red-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* File Upload Area */}
              <div className="mt-4 rounded-lg border-2 border-dashed border-gray-300 p-6 text-center transition-colors hover:border-gray-400">
                <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                <p className="mb-1 text-sm text-gray-600">
                  Dosya yükleme özelliği yakında eklenecek
                </p>
                <p className="text-xs text-gray-500">
                  Şimdilik URL ile görsel ekleyebilirsiniz
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
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
