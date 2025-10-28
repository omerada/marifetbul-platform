/**
 * DisputeForm Component
 * Sprint 1: Order Dispute System
 *
 * Form component for raising disputes with validation
 */

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  DisputeReason,
  disputeReasonLabels,
  type DisputeRequest,
} from '@/types/dispute';
import {
  Button,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  Input,
} from '@/components/ui';
import { Upload, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/Alert';

// Validation schema
const disputeFormSchema = z.object({
  reason: z.nativeEnum(DisputeReason).refine((val) => val !== undefined, {
    message: 'Lütfen bir itiraz nedeni seçin',
  }),
  description: z
    .string()
    .min(20, 'Açıklama en az 20 karakter olmalıdır')
    .max(2000, 'Açıklama en fazla 2000 karakter olabilir'),
  evidenceUrls: z
    .array(z.string().url('Geçerli bir URL giriniz'))
    .max(10, 'En fazla 10 kanıt dosyası ekleyebilirsiniz')
    .optional(),
});

type DisputeFormData = z.infer<typeof disputeFormSchema>;

interface DisputeFormProps {
  orderId: string;
  onSubmit: (data: DisputeRequest) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export default function DisputeForm({
  orderId,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: DisputeFormProps) {
  const [evidenceFiles, setEvidenceFiles] = useState<string[]>([]);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<DisputeFormData>({
    resolver: zodResolver(disputeFormSchema),
    defaultValues: {
      description: '',
      evidenceUrls: [],
    },
  });

  const onFormSubmit = async (data: DisputeFormData) => {
    const disputeRequest: DisputeRequest = {
      orderId,
      reason: data.reason,
      description: data.description,
      evidenceUrls: evidenceFiles,
    };

    await onSubmit(disputeRequest);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setFileUploadError(null);

    // Check file count limit
    if (evidenceFiles.length + files.length > 10) {
      setFileUploadError('En fazla 10 kanıt dosyası ekleyebilirsiniz');
      return;
    }

    // In a real application, you would upload these files to a storage service
    // and get back URLs. For now, we'll simulate this with file names.
    const newFiles = Array.from(files).map((file) => {
      // TODO: Implement actual file upload to storage service
      // For now, return a placeholder URL
      return `https://storage.marifetbul.com/disputes/${orderId}/${file.name}`;
    });

    setEvidenceFiles([...evidenceFiles, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setEvidenceFiles(evidenceFiles.filter((_, i) => i !== index));
  };

  const characterCount = watch('description')?.length || 0;

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Reason Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">İtiraz Nedeni *</label>
        <Select
          onValueChange={(value) =>
            setValue('reason', value as DisputeReason, { shouldValidate: true })
          }
        >
          <SelectTrigger
            className="w-full"
            placeholder="İtiraz nedenini seçin"
          />
          <SelectContent>
            {Object.entries(disputeReasonLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-sm">
          İtirazınızın nedenini en iyi açıklayan seçeneği seçin
        </p>
        {errors.reason && (
          <p className="text-sm text-red-500">{errors.reason.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Açıklama *</label>
        <Textarea
          {...register('description')}
          placeholder="İtirazınızı detaylı olarak açıklayın..."
          className="min-h-[150px] resize-none"
          maxLength={2000}
        />
        <div className="text-muted-foreground flex justify-between text-sm">
          <span>Durumunuzu açık ve detaylı bir şekilde açıklayın</span>
          <span
            className={
              characterCount < 20
                ? 'text-red-500'
                : characterCount > 1900
                  ? 'text-yellow-500'
                  : ''
            }
          >
            {characterCount} / 2000
          </span>
        </div>
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Evidence Files */}
      <div className="space-y-3">
        <label className="text-sm font-medium">
          Kanıt Dosyaları (Opsiyonel)
        </label>
        <p className="text-muted-foreground text-sm">
          İtirazınızı destekleyecek ekran görüntüleri, belgeler veya diğer
          dosyaları ekleyebilirsiniz (Maksimum 10 dosya)
        </p>

        {/* File Upload Button */}
        <div className="flex items-center gap-3">
          <label htmlFor="evidence-upload">
            <div className="border-input bg-background hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium">
              <Upload className="h-4 w-4" />
              <span>Dosya Ekle</span>
            </div>
            <Input
              id="evidence-upload"
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileUpload}
              disabled={evidenceFiles.length >= 10}
            />
          </label>
          <span className="text-muted-foreground text-sm">
            {evidenceFiles.length} / 10 dosya
          </span>
        </div>

        {/* File Upload Error */}
        {fileUploadError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{fileUploadError}</AlertDescription>
          </Alert>
        )}

        {/* Uploaded Files List */}
        {evidenceFiles.length > 0 && (
          <div className="space-y-2">
            {evidenceFiles.map((file, index) => (
              <div
                key={index}
                className="bg-muted/50 flex items-center justify-between rounded-md border p-3"
              >
                <span className="truncate text-sm">
                  {file.split('/').pop()}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          İtirazınız gönderildikten sonra, müşteri destek ekibimiz durumunuzu
          inceleyecek ve 2-3 iş günü içinde size geri dönüş yapacaktır.
        </AlertDescription>
      </Alert>

      {/* Form Actions */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            İptal
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Gönderiliyor...' : 'İtirazı Gönder'}
        </Button>
      </div>
    </form>
  );
}
