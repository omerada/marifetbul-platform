'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Send, X, Upload, FileText } from 'lucide-react';

const proposalSchema = z.object({
  coverLetter: z
    .string()
    .min(50, 'Kapak mektubu en az 50 karakter olmalıdır')
    .max(1000, 'Kapak mektubu en fazla 1000 karakter olabilir'),
  bidAmount: z
    .number()
    .min(1, "Teklif tutarı 1 TL'den az olamaz")
    .max(1000000, 'Teklif tutarı çok yüksek'),
  deliveryTime: z
    .number()
    .min(1, 'Teslimat süresi en az 1 gün olmalıdır')
    .max(365, 'Teslimat süresi en fazla 365 gün olabilir'),
  milestones: z.string().optional(),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

interface ProposalFormProps {
  jobId: string;
  onSubmit: (data: ProposalFormData) => void;
  onCancel: () => void;
}

export function ProposalForm({ jobId, onSubmit, onCancel }: ProposalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      deliveryTime: 7,
    },
  });

  const coverLetter = watch('coverLetter');

  const handleFormSubmit = async (data: ProposalFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log('Proposal submitted:', {
        jobId,
        ...data,
        attachments: attachments.map((f) => f.name),
      });

      onSubmit(data);
    } catch (error) {
      console.error('Error submitting proposal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Cover Letter */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Kapak Mektubu *
        </label>
        <textarea
          {...register('coverLetter')}
          rows={6}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Kendinizi tanıtın, neden bu proje için uygun olduğunuzu açıklayın ve yaklaşımınızı belirtin..."
        />
        <div className="mt-1 flex justify-between text-sm">
          {errors.coverLetter && (
            <span className="text-red-600">{errors.coverLetter.message}</span>
          )}
          <span className="ml-auto text-gray-500">
            {coverLetter?.length || 0}/1000
          </span>
        </div>
      </div>

      {/* Bid Amount and Delivery Time */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Teklif Tutarı (₺) *
          </label>
          <Input
            type="number"
            {...register('bidAmount', { valueAsNumber: true })}
            placeholder="0"
            error={errors.bidAmount?.message}
          />
          <p className="mt-1 text-xs text-gray-500">Platform komisyonu: %5</p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Teslimat Süresi (Gün) *
          </label>
          <Input
            type="number"
            {...register('deliveryTime', { valueAsNumber: true })}
            placeholder="7"
            error={errors.deliveryTime?.message}
          />
        </div>
      </div>

      {/* Milestones */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Proje Aşamaları
        </label>
        <textarea
          {...register('milestones')}
          rows={3}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          placeholder="Projeyi nasıl aşamalara böleceğinizi açıklayın (opsiyonel)"
        />
      </div>

      {/* File Attachments */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Ek Dosyalar
        </label>
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-4">
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex cursor-pointer flex-col items-center justify-center text-center"
          >
            <Upload className="mb-2 h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-600">
              Dosya yüklemek için tıklayın
            </span>
            <span className="mt-1 text-xs text-gray-400">
              PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)
            </span>
          </label>
        </div>

        {/* Attached Files */}
        {attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-2"
              >
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-400">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Proposal Summary */}
      <Card className="border-blue-200 bg-blue-50 p-4">
        <h4 className="mb-2 font-medium text-blue-900">Teklif Özeti</h4>
        <div className="space-y-1 text-sm text-blue-800">
          <div className="flex justify-between">
            <span>Teklif Tutarı:</span>
            <span className="font-medium">
              ₺{watch('bidAmount')?.toLocaleString('tr-TR') || '0'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Platform Komisyonu (%5):</span>
            <span className="font-medium">
              ₺{((watch('bidAmount') || 0) * 0.05).toLocaleString('tr-TR')}
            </span>
          </div>
          <div className="flex justify-between border-t border-blue-200 pt-1">
            <span>Alacağınız Tutar:</span>
            <span className="font-medium">
              ₺{((watch('bidAmount') || 0) * 0.95).toLocaleString('tr-TR')}
            </span>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
              Gönderiliyor...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Teklif Gönder
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          İptal
        </Button>
      </div>
    </form>
  );
}
