'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { logger } from '@/lib/shared/utils/logger';
import { createTicketSchema } from '@/lib/core/validations/support';
import { z } from 'zod';

// Extend ticket schema to include subcategory
const ticketFormSchema = createTicketSchema.extend({
  subcategory: z.string().min(1, 'Alt kategori seçimi gereklidir'),
});

interface TicketFormProps {
  onBack?: () => void;
  onSuccess?: (ticketId: string) => void;
  className?: string;
}

type TicketFormData = z.infer<typeof ticketFormSchema>;

export const TicketForm: React.FC<TicketFormProps> = ({
  onBack,
  onSuccess,
  className,
}) => {
  const router = useRouter();
  const { createTicket } = useSupport();

  // React Hook Form setup with Zod validation
  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: {
      subject: '',
      description: '',
      category: 'general', // Default category
      subcategory: '',
      priority: 'medium',
      attachments: [],
    },
    mode: 'onBlur',
  });

  const {
    register,
    handleSubmit: handleFormSubmit,
    watch,
    setValue,
    formState: { errors: formErrors, isSubmitting },
    setError,
  } = form;

  const [attachmentFiles, setAttachmentFiles] = React.useState<File[]>([]);
  const [dragActive, setDragActive] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Watch category changes to reset subcategory
  const selectedCategoryValue = watch('category');
  React.useEffect(() => {
    setValue('subcategory', '');
  }, [selectedCategoryValue, setValue]);

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

  const handleFileUpload = (files: FileList | null) => {
    if (!files) return;

    const currentAttachments = watch('attachments') || [];
    const newFiles = Array.from(files);

    // Validate file size (max 10MB)
    const validFiles: typeof currentAttachments = [];
    const fileObjects = [...attachmentFiles];

    for (const file of newFiles) {
      if (file.size > 10 * 1024 * 1024) {
        setError('attachments', {
          type: 'manual',
          message: "Dosya boyutu 10MB'tan küçük olmalıdır",
        });
        continue;
      }

      validFiles.push({
        name: file.name,
        url: '', // Will be set after upload
        size: file.size,
        type: file.type,
      });
      fileObjects.push(file);
    }

    // Max 5 files
    const totalAttachments = [...currentAttachments, ...validFiles].slice(0, 5);
    const totalFiles = [...attachmentFiles, ...fileObjects].slice(0, 5);

    setValue('attachments', totalAttachments);
    setAttachmentFiles(totalFiles);
  };

  const removeAttachment = (index: number) => {
    const currentAttachments = watch('attachments') || [];
    setValue(
      'attachments',
      currentAttachments.filter((_, i) => i !== index)
    );
    setAttachmentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      // eslint-disable-next-line jsx-a11y/alt-text
      return <Image className="h-4 w-4" />;
    } else if (file.type.includes('pdf') || file.type.includes('document')) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  const onSubmit = async (data: TicketFormData) => {
    setSubmitError(null);

    try {
      const response = await createTicket(data);

      if (onSuccess && response?.ticketId) {
        onSuccess(response.ticketId);
      } else {
        router.push('/dashboard/support');
      }
    } catch (error) {
      logger.error(
        'Ticket creation failed',
        error instanceof Error ? error : new Error(String(error))
      );
      setSubmitError(
        'Destek talebi oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.'
      );
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
    (cat) => cat.id === selectedCategoryValue
  );

  const descriptionValue = watch('description');

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
        <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6 p-6">
          {/* Subject */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Konu <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('subject')}
              placeholder="Sorununuzu kısaca özetleyin"
              className={cn(
                'w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500',
                formErrors.subject ? 'border-red-300' : 'border-gray-300'
              )}
              maxLength={200}
            />
            {formErrors.subject && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {formErrors.subject.message}
              </p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              {...register('category')}
              className={cn(
                'w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500',
                formErrors.category ? 'border-red-300' : 'border-gray-300'
              )}
            >
              <option value="">Kategori seçin</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {formErrors.category && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {formErrors.category.message}
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
                {...register('subcategory')}
                className={cn(
                  'w-full rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500',
                  formErrors.subcategory ? 'border-red-300' : 'border-gray-300'
                )}
              >
                <option value="">Alt kategori seçin</option>
                {selectedCategory.subcategories.map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
              {formErrors.subcategory && (
                <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {formErrors.subcategory.message}
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
              {...register('priority')}
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
              {...register('description')}
              placeholder="Sorununuzu detaylı bir şekilde açıklayın. Hata mesajları, yapmaya çalıştığınız işlem ve beklediğiniz sonucu belirtin."
              rows={6}
              className={cn(
                'w-full resize-none rounded-lg border px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500',
                formErrors.description ? 'border-red-300' : 'border-gray-300'
              )}
              maxLength={2000}
            />
            <div className="mt-1 flex items-center justify-between">
              {formErrors.description ? (
                <p className="flex items-center gap-1 text-sm text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  {formErrors.description.message}
                </p>
              ) : (
                <div />
              )}
              <span className="text-sm text-gray-500">
                {descriptionValue?.length || 0}/2000
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
            {attachmentFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {attachmentFiles.map((file, index) => (
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

            {formErrors.attachments && (
              <p className="mt-1 flex items-center gap-1 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {formErrors.attachments.message}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {submitError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                {submitError}
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
