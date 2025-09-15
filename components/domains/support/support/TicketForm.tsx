'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  AlertCircle,
  X,
  Upload,
  FileText,
  Image,
  File,
} from 'lucide-react';
import { useSupport } from '@/hooks';
import { cn } from '@/lib/utils';

import type { CreateTicketFormData } from '@/lib/core/validations/support';

interface TicketFormProps {
  onBack?: () => void;
  onSuccess?: (ticketId: string) => void;
  onSubmit?: (data: CreateTicketFormData) => Promise<void>;
  isLoading?: boolean;
  className?: string;
}

interface TicketFormData {
  subject: string;
  description: string;
  category: string;
  subcategory: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  attachments: File[];
}

export const TicketForm: React.FC<TicketFormProps> = ({
  onBack,
  onSuccess,
  onSubmit,
  isLoading = false,
  className,
}) => {
  const router = useRouter();
  const { createTicket } = useSupport();

  const [formData, setFormData] = React.useState<TicketFormData>({
    subject: '',
    description: '',
    category: '',
    subcategory: '',
    priority: 'medium',
    attachments: [],
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [dragActive, setDragActive] = React.useState(false);

  const categories = [
    {
      id: 'technical',
      name: 'Teknik Sorun',
      subcategories: [
        { id: 'login_issue', name: 'Giriş Sorunu' },
        { id: 'performance', name: 'Performans Sorunu' },
        { id: 'feature_not_working', name: 'Özellik Çalışmıyor' },
        { id: 'mobile_app', name: 'Mobil Uygulama' },
        { id: 'other_technical', name: 'Diğer Teknik' },
      ],
    },
    {
      id: 'billing',
      name: 'Faturalama',
      subcategories: [
        { id: 'payment_issue', name: 'Ödeme Sorunu' },
        { id: 'refund_request', name: 'İade Talebi' },
        { id: 'subscription', name: 'Abonelik' },
        { id: 'invoice', name: 'Fatura' },
        { id: 'pricing', name: 'Fiyatlandırma' },
      ],
    },
    {
      id: 'account',
      name: 'Hesap',
      subcategories: [
        { id: 'profile_update', name: 'Profil Güncelleme' },
        { id: 'verification', name: 'Doğrulama' },
        { id: 'security', name: 'Güvenlik' },
        { id: 'delete_account', name: 'Hesap Silme' },
        { id: 'other_account', name: 'Diğer Hesap' },
      ],
    },
    {
      id: 'general',
      name: 'Genel',
      subcategories: [
        { id: 'how_to', name: 'Nasıl Yapılır' },
        { id: 'feedback', name: 'Geri Bildirim' },
        { id: 'suggestion', name: 'Öneri' },
        { id: 'other_general', name: 'Diğer' },
      ],
    },
    {
      id: 'report_user',
      name: 'Kullanıcı Şikayeti',
      subcategories: [
        { id: 'inappropriate_behavior', name: 'Uygunsuz Davranış' },
        { id: 'fake_profile', name: 'Sahte Profil' },
        { id: 'scam', name: 'Dolandırıcılık' },
        { id: 'harassment', name: 'Taciz' },
        { id: 'other_report', name: 'Diğer Şikayet' },
      ],
    },
    {
      id: 'feature_request',
      name: 'Özellik İsteği',
      subcategories: [
        { id: 'new_feature', name: 'Yeni Özellik' },
        { id: 'improvement', name: 'İyileştirme' },
        { id: 'integration', name: 'Entegrasyon' },
      ],
    },
    {
      id: 'bug_report',
      name: 'Hata Raporu',
      subcategories: [
        { id: 'ui_bug', name: 'Arayüz Hatası' },
        { id: 'functionality_bug', name: 'İşlevsellik Hatası' },
        { id: 'data_bug', name: 'Veri Hatası' },
      ],
    },
  ];

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.push('/dashboard/support');
    }
  };

  const handleInputChange = (
    field: keyof TicketFormData,
    value: string | File[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files).filter((file) => {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          attachments: "Dosya boyutu 10MB'tan küçük olmalıdır",
        }));
        return false;
      }
      return true;
    });

    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...newFiles].slice(0, 5), // Max 5 files
    }));
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <Image className="h-4 w-4" />;
    } else if (file.type.includes('pdf') || file.type.includes('document')) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject.trim()) {
      newErrors.subject = 'Konu alanı gereklidir';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Açıklama alanı gereklidir';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Açıklama en az 10 karakter olmalıdır';
    }

    if (!formData.category) {
      newErrors.category = 'Kategori seçimi gereklidir';
    }

    if (!formData.subcategory) {
      newErrors.subcategory = 'Alt kategori seçimi gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const ticketData = {
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        category: formData.category as
          | 'technical'
          | 'billing'
          | 'account'
          | 'general'
          | 'report_user'
          | 'feature_request'
          | 'bug_report',
        subcategory: formData.subcategory,
        priority: formData.priority,
        attachments: formData.attachments.map((file) => ({
          name: file.name,
          url: '', // This would be set by the backend after upload
          size: file.size,
          type: file.type,
        })),
      };

      const response = await createTicket(ticketData);

      if (onSuccess && response?.ticketId) {
        onSuccess(response.ticketId);
      } else {
        router.push('/dashboard/support');
      }
    } catch (error) {
      console.error('Ticket creation failed:', error);
      setErrors({
        submit:
          'Destek talebi oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const selectedCategory = categories.find(
    (cat) => cat.id === formData.category
  );

  return (
    <div className={cn('mx-auto max-w-2xl', className)}>
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="mb-4 flex items-center gap-4">
            <button
              onClick={handleBack}
              className="inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </button>
          </div>

          <h1 className="text-xl font-semibold text-gray-900">
            Yeni Destek Talebi Oluştur
          </h1>
          <p className="mt-1 text-gray-600">
            Sorununuzu detaylı bir şekilde açıklayın, size en kısa sürede
            yardımcı olalım.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          {/* Subject */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Konu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              placeholder="Sorununuzu kısaca özetleyin"
              className={cn(
                'w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500',
                errors.subject ? 'border-red-300' : 'border-gray-300'
              )}
              maxLength={100}
            />
            {errors.subject && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.subject}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => {
                handleInputChange('category', e.target.value);
                handleInputChange('subcategory', ''); // Reset subcategory
              }}
              className={cn(
                'w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500',
                errors.category ? 'border-red-300' : 'border-gray-300'
              )}
            >
              <option value="">Kategori seçin</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.category}
              </p>
            )}
          </div>

          {/* Subcategory */}
          {selectedCategory && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Alt Kategori <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.subcategory}
                onChange={(e) =>
                  handleInputChange('subcategory', e.target.value)
                }
                className={cn(
                  'w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500',
                  errors.subcategory ? 'border-red-300' : 'border-gray-300'
                )}
              >
                <option value="">Alt kategori seçin</option>
                {selectedCategory.subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
              {errors.subcategory && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.subcategory}
                </p>
              )}
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Öncelik
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                handleInputChange(
                  'priority',
                  e.target.value as 'low' | 'medium' | 'high' | 'urgent'
                )
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Düşük</option>
              <option value="medium">Orta</option>
              <option value="high">Yüksek</option>
              <option value="urgent">Acil</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Açıklama <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Sorununuzu detaylı bir şekilde açıklayın. Hata mesajları, yapmaya çalıştığınız işlem ve beklediğiniz sonucu belirtin."
              rows={6}
              className={cn(
                'w-full resize-none rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500',
                errors.description ? 'border-red-300' : 'border-gray-300'
              )}
              maxLength={2000}
            />
            <div className="mt-1 flex items-center justify-between">
              {errors.description ? (
                <p className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {errors.description}
                </p>
              ) : (
                <div />
              )}
              <span className="text-sm text-gray-500">
                {formData.description.length}/2000
              </span>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Ek Dosyalar
            </label>
            <div
              className={cn(
                'rounded-lg border-2 border-dashed p-6 text-center transition-colors',
                dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300',
                'hover:border-gray-400'
              )}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="mb-2 text-gray-600">
                Dosyaları buraya sürükleyin veya
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
                  onChange={(e) => handleFileUpload(e.target.files)}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="ml-1 cursor-pointer text-blue-600 hover:text-blue-700"
                >
                  dosya seçin
                </label>
              </p>
              <p className="text-sm text-gray-500">
                Maksimum 5 dosya, her biri 10MB&apos;tan küçük olmalıdır
              </p>
            </div>

            {/* Uploaded Files */}
            {formData.attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border bg-gray-50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      {getFileIcon(file)}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAttachment(index)}
                      className="p-1 text-gray-400 transition-colors hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {errors.attachments && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.attachments}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {errors.submit}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Gönderiliyor...
                </div>
              ) : (
                'Destek Talebi Oluştur'
              )}
            </button>
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 text-gray-600 transition-colors hover:text-gray-900"
            >
              İptal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TicketForm;
