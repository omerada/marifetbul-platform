'use client';

import React, { useState } from 'react';
import { X, FileText, Upload, Plus, Minus } from 'lucide-react';
import { JobDetail } from '@/types';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import logger from '@/lib/infrastructure/monitoring/logger';
import { isJobBudgetObject } from '@/lib/shared/utils/typeGuards';

interface ProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  job: JobDetail;
}

interface Milestone {
  title: string;
  description: string;
  amount: number;
  dueDate: string;
}

interface ProposalData {
  coverLetter: string;
  proposedBudget: number;
  proposedTimeline: string;
  milestones: Milestone[];
  attachments: string[];
}

export function ProposalModal({
  isOpen,
  onClose,
  jobId,
  job,
}: ProposalModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Log jobId for debugging - will be used for API calls
  logger.debug('Creating proposal for job:', jobId);

  const [formData, setFormData] = useState<ProposalData>({
    coverLetter: '',
    proposedBudget: 0,
    proposedTimeline: '',
    milestones: [
      {
        title: '',
        description: '',
        amount: 0,
        dueDate: '',
      },
    ],
    attachments: [],
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  if (!isOpen) return null;

  const updateFormData = (
    field: keyof ProposalData,
    value: string | number | Milestone[] | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const addMilestone = () => {
    updateFormData('milestones', [
      ...formData.milestones,
      {
        title: '',
        description: '',
        amount: 0,
        dueDate: '',
      },
    ]);
  };

  const removeMilestone = (index: number) => {
    if (formData.milestones.length > 1) {
      const updated = formData.milestones.filter((_, i) => i !== index);
      updateFormData('milestones', updated);
    }
  };

  const updateMilestone = (
    index: number,
    field: keyof Milestone,
    value: string | number
  ) => {
    const updated = [...formData.milestones];
    updated[index] = { ...updated[index], [field]: value };
    updateFormData('milestones', updated);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setUploadedFiles([...uploadedFiles, ...files]);
      // Simulate file upload URLs
      const fileUrls = files.map((file) => `/uploads/${file.name}`);
      updateFormData('attachments', [...formData.attachments, ...fileUrls]);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    const updatedUrls = formData.attachments.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);
    updateFormData('attachments', updatedUrls);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.coverLetter || formData.coverLetter.length < 50) {
        newErrors.coverLetter = 'Kapak mektubu en az 50 karakter olmalıdır';
      }
      if (!formData.proposedBudget || formData.proposedBudget <= 0) {
        newErrors.proposedBudget = 'Geçerli bir bütçe giriniz';
      }
      if (!formData.proposedTimeline) {
        newErrors.proposedTimeline = 'Teslim süresi gereklidir';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async () => {
    if (!validateStep(1)) return;

    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));
      logger.debug('Submitting proposal:', formData);
      onClose();
    } catch (error) {
      logger.error('Proposal submission error:', error instanceof Error ? error : new Error(String(error)));
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep(1)) return;
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const totalMilestoneAmount = formData.milestones.reduce(
    (sum, milestone) => sum + (milestone.amount || 0),
    0
  );

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Teklif Gönder</h2>
            <p className="mt-1 text-gray-600">{job.title}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Step Indicator */}
        <div className="border-b bg-gray-50 px-6 py-4">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                <span
                  className={`ml-2 text-sm ${
                    step <= currentStep
                      ? 'font-medium text-blue-600'
                      : 'text-gray-500'
                  }`}
                >
                  {step === 1 && 'Temel Bilgiler'}
                  {step === 2 && 'Kilometre Taşları'}
                  {step === 3 && 'Ekler & Gönder'}
                </span>
                {step < 3 && <div className="ml-4 h-px w-8 bg-gray-300" />}
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Teklif Detayları</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Budget */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Teklif Edilen Bütçe (₺)
                        </label>
                        <Input
                          type="number"
                          placeholder="5000"
                          value={formData.proposedBudget || ''}
                          onChange={(e) =>
                            updateFormData(
                              'proposedBudget',
                              Number(e.target.value)
                            )
                          }
                        />
                        {errors.proposedBudget && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.proposedBudget}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          Teslim Süresi
                        </label>
                        <Input
                          placeholder="15 gün"
                          value={formData.proposedTimeline}
                          onChange={(e) =>
                            updateFormData('proposedTimeline', e.target.value)
                          }
                        />
                        {errors.proposedTimeline && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.proposedTimeline}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Budget Comparison */}
                    {job.budget && (
                      <div className="rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-600">
                              İşverenin Bütçesi
                            </div>
                            <div className="font-semibold">
                              ₺
                              {isJobBudgetObject(job.budget)
                                ? job.budget.amount.toLocaleString('tr-TR')
                                : job.budget.toLocaleString('tr-TR')}
                              {isJobBudgetObject(job.budget) &&
                                job.budget.maxAmount &&
                                ` - ₺${job.budget.maxAmount.toLocaleString('tr-TR')}`}
                              {isJobBudgetObject(job.budget) &&
                                job.budget.type === 'hourly' &&
                                '/saat'}
                            </div>
                          </div>
                          {formData.proposedBudget && (
                            <div className="text-right">
                              <div className="text-sm text-gray-600">
                                Sizin Teklifiniz
                              </div>
                              <div className="font-semibold">
                                ₺
                                {formData.proposedBudget.toLocaleString(
                                  'tr-TR'
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cover Letter */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        Kapak Mektubu
                      </label>
                      <Textarea
                        rows={6}
                        placeholder="Neden bu proje için uygun olduğunuzu ve nasıl yaklaşacağınızı açıklayın..."
                        value={formData.coverLetter}
                        onChange={(e) =>
                          updateFormData('coverLetter', e.target.value)
                        }
                      />
                      {errors.coverLetter && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.coverLetter}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-gray-500">
                        {formData.coverLetter.length}/50 minimum karakter
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 2: Milestones */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Kilometre Taşları (İsteğe Bağlı)</CardTitle>
                    <p className="text-sm text-gray-600">
                      Projeyi aşamalara bölerek müşteriye daha net bir çalışma
                      planı sunabilirsiniz.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {formData.milestones.map((milestone, index) => (
                      <div key={index} className="rounded-lg border p-4">
                        <div className="mb-4 flex items-center justify-between">
                          <h4 className="font-medium">
                            Kilometre Taşı {index + 1}
                          </h4>
                          {formData.milestones.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMilestone(index)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                              Başlık
                            </label>
                            <Input
                              placeholder="Tasarım aşaması"
                              value={milestone.title}
                              onChange={(e) =>
                                updateMilestone(index, 'title', e.target.value)
                              }
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                              Açıklama
                            </label>
                            <Textarea
                              rows={3}
                              placeholder="Bu aşamada yapılacak işleri açıklayın..."
                              value={milestone.description}
                              onChange={(e) =>
                                updateMilestone(
                                  index,
                                  'description',
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                              Tutar (₺)
                            </label>
                            <Input
                              type="number"
                              placeholder="1500"
                              value={milestone.amount || ''}
                              onChange={(e) =>
                                updateMilestone(
                                  index,
                                  'amount',
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                              Teslim Tarihi
                            </label>
                            <Input
                              type="date"
                              value={milestone.dueDate}
                              onChange={(e) =>
                                updateMilestone(
                                  index,
                                  'dueDate',
                                  e.target.value
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      onClick={addMilestone}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Kilometre Taşı Ekle
                    </Button>

                    {/* Milestone Summary */}
                    {totalMilestoneAmount > 0 && (
                      <div className="rounded-lg bg-blue-50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-blue-800">
                            Toplam Kilometre Taşı Tutarı:
                          </span>
                          <span className="text-lg font-bold text-blue-800">
                            ₺{totalMilestoneAmount.toLocaleString('tr-TR')}
                          </span>
                        </div>
                        {formData.proposedBudget &&
                          formData.proposedBudget !== totalMilestoneAmount && (
                            <p className="mt-2 text-sm text-blue-600">
                              Toplam bütçe ile kilometre taşı tutarları
                              eşleşmiyor.
                            </p>
                          )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 3: Attachments & Submit */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ekler (İsteğe Bağlı)</CardTitle>
                    <p className="text-sm text-gray-600">
                      Portföy örnekleri, referanslar veya diğer dökümanlarınızı
                      ekleyebilirsiniz.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                        <p className="text-gray-600">
                          Dosyaları buraya sürükleyin veya seçmek için tıklayın
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                          PDF, DOC, JPG, PNG (Maks. 10MB)
                        </p>
                      </label>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {uploadedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border p-2"
                          >
                            <div className="flex items-center">
                              <FileText className="mr-2 h-4 w-4 text-gray-400" />
                              <span className="text-sm">{file.name}</span>
                              <span className="ml-2 text-xs text-gray-500">
                                ({(file.size / 1024 / 1024).toFixed(1)} MB)
                              </span>
                            </div>
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
                  </CardContent>
                </Card>

                {/* Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle>Teklif Özeti</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Teklif Edilen Bütçe:
                        </span>
                        <span className="font-medium">
                          {formData.proposedBudget
                            ? `₺${formData.proposedBudget.toLocaleString('tr-TR')}`
                            : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Teslim Süresi:</span>
                        <span className="font-medium">
                          {formData.proposedTimeline || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Kilometre Taşı Sayısı:
                        </span>
                        <span className="font-medium">
                          {
                            formData.milestones.filter(
                              (m) => m.title && m.amount
                            ).length
                          }
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Ek Dosya Sayısı:</span>
                        <span className="font-medium">
                          {uploadedFiles.length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t bg-gray-50 p-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Geri
          </Button>

          <div className="flex space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            {currentStep < 3 ? (
              <Button type="button" onClick={nextStep}>
                İleri
              </Button>
            ) : (
              <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Gönderiliyor...' : 'Teklifi Gönder'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
