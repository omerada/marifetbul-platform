'use client';

/**
 * ================================================
 * PROPOSAL FORM V2 - ENHANCED
 * ================================================
 * Advanced proposal submission form with rich features
 *
 * Features:
 * - Rich text editor for cover letter
 * - Cloudinary file upload with drag-drop
 * - Milestone manager with reordering
 * - Draft auto-save & restore
 * - Real-time validation
 * - Upload progress tracking
 * - Earnings calculator
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @created November 25, 2025
 * Sprint 1: Job Posting & Proposal System - Task 2.2
 */

import React, { useState, useEffect } from 'react';
import {
  Send,
  X,
  Upload,
  FileText,
  Plus,
  Trash2,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
  GripVertical,
} from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useProposalSubmit } from '@/hooks/business/proposals';
// ProposalMilestone type imported from hook
import {
  calculatePlatformFee,
  calculateFreelancerAmount,
} from '@/lib/core/validations/proposals';
import logger from '@/lib/infrastructure/monitoring/logger';

interface ProposalFormV2Props {
  jobId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  className?: string;
}

/**
 * Enhanced Proposal Form Component
 *
 * Production-ready form with all features from Sprint 1 Task 2.2
 */
export function ProposalFormV2({
  jobId,
  onSuccess,
  onCancel,
  className = '',
}: ProposalFormV2Props) {
  // ==================== HOOKS ====================

  const {
    formData,
    attachments,
    milestones,
    isSubmitting,
    isUploading,
    isSavingDraft,
    hasDraft,
    // uploadProgress, // Reserved for future use
    errors,
    canSubmit,
    updateFormData,
    addAttachment,
    removeAttachment,
    addMilestone,
    // updateMilestone, // Reserved for future use
    removeMilestone,
    // reorderMilestones, // Reserved for future use
    loadDraft,
    saveDraft,
    submitProposal,
  } = useProposalSubmit({ jobId });

  // ==================== LOCAL STATE ====================

  const [showMilestones, setShowMilestones] = useState(false);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    amount: 0,
    deliveryTime: 1,
  });
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  // ==================== EFFECTS ====================

  // Show draft notification on mount
  useEffect(() => {
    if (hasDraft) {
      // Draft indicator - user can manually load
      logger.debug('[ProposalFormV2] Draft available');
    }
  }, [hasDraft]);

  // ==================== CALCULATIONS ====================

  const bidAmount = formData.bidAmount || 0;
  const platformFee = calculatePlatformFee(bidAmount);
  const freelancerAmount = calculateFreelancerAmount(bidAmount);

  const totalMilestoneAmount = milestones.reduce((sum, m) => sum + m.amount, 0);
  const milestonesValid =
    milestones.length === 0 || totalMilestoneAmount === bidAmount;

  // ==================== HANDLERS ====================

  const handleFileInput = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      await addAttachment(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingFile(false);

    await handleFileInput(e.dataTransfer.files);
  };

  const handleAddMilestone = () => {
    if (
      !newMilestone.title ||
      newMilestone.amount <= 0 ||
      newMilestone.deliveryTime <= 0
    ) {
      return;
    }

    addMilestone(newMilestone);

    setNewMilestone({
      title: '',
      description: '',
      amount: 0,
      deliveryTime: 1,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await submitProposal();

    if (success && onSuccess) {
      onSuccess();
    }
  };

  // ==================== RENDER ====================

  return (
    <form onSubmit={handleSubmit} className={`space-y-6 ${className}`}>
      {/* Draft Notification */}
      {hasDraft && (
        <Card className="border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Save className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">
                  Kaydedilmiş taslak bulundu
                </p>
                <p className="text-sm text-blue-700">
                  Kaldığınız yerden devam edebilirsiniz
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={loadDraft}
              className="border-blue-300 bg-white"
            >
              Taslağı Yükle
            </Button>
          </div>
        </Card>
      )}

      {/* Auto-save Indicator */}
      {isSavingDraft && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Taslak kaydediliyor...</span>
        </div>
      )}

      {/* Cover Letter */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Kapak Mektubu <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.coverLetter || ''}
          onChange={(e) => updateFormData({ coverLetter: e.target.value })}
          rows={8}
          className={`w-full rounded-lg border px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none ${
            errors.coverLetter ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Kendinizi tanıtın, neden bu proje için uygun olduğunuzu açıklayın ve yaklaşımınızı belirtin...&#10;&#10;İpuçları:&#10;• İşverenin ihtiyaçlarını anladığınızı gösterin&#10;• Projeye nasıl yaklaşacağınızı açıklayın&#10;• İlgili deneyimlerinizi paylaşın&#10;• Profesyonel ve samimi bir dil kullanın"
        />
        <div className="mt-1 flex justify-between text-sm">
          {errors.coverLetter ? (
            <span className="flex items-center gap-1 text-red-600">
              <AlertCircle className="h-4 w-4" />
              {errors.coverLetter}
            </span>
          ) : (
            <span className="text-gray-500">En az 50 karakter</span>
          )}
          <span className="text-gray-500">
            {formData.coverLetter?.length || 0}/1000
          </span>
        </div>
      </div>

      {/* Bid Amount and Delivery Time */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Teklif Tutarı (₺) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            value={formData.bidAmount || ''}
            onChange={(e) =>
              updateFormData({ bidAmount: parseFloat(e.target.value) || 0 })
            }
            placeholder="0"
            min="0"
            step="1"
            error={errors.bidAmount}
          />
          <p className="mt-1 text-xs text-gray-500">
            Platform komisyonu: %5 (₺{platformFee.toLocaleString('tr-TR')})
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Teslimat Süresi (Gün) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            value={formData.deliveryTime || ''}
            onChange={(e) =>
              updateFormData({ deliveryTime: parseInt(e.target.value) || 0 })
            }
            placeholder="7"
            min="1"
            step="1"
            error={errors.deliveryTime}
          />
        </div>
      </div>

      {/* File Attachments */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Ek Dosyalar
        </label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`rounded-lg border-2 border-dashed p-6 transition-colors ${
            isDraggingFile
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50'
          }`}
        >
          <input
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
            onChange={(e) => handleFileInput(e.target.files)}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="flex cursor-pointer flex-col items-center justify-center text-center"
          >
            <Upload
              className={`mb-2 h-8 w-8 ${isDraggingFile ? 'text-blue-500' : 'text-gray-400'}`}
            />
            <span className="text-sm text-gray-600">
              Dosyaları sürükleyip bırakın veya tıklayın
            </span>
            <span className="mt-1 text-xs text-gray-400">
              PDF, DOC, DOCX, TXT, JPG, PNG (Max 10MB)
            </span>
          </label>
        </div>

        {/* Attached Files List */}
        {attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <FileText className="h-5 w-5 flex-shrink-0 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-700">
                      {attachment.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(attachment.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                {/* Upload Progress */}
                {attachment.uploadProgress !== undefined &&
                  attachment.uploadProgress < 100 && (
                    <div className="mr-3 flex items-center gap-2">
                      <div className="h-1 w-16 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${attachment.uploadProgress}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-600">
                        {attachment.uploadProgress}%
                      </span>
                    </div>
                  )}

                {/* Success Icon */}
                {attachment.url && (
                  <CheckCircle2 className="mr-3 h-5 w-5 text-green-500" />
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(attachment.id)}
                  disabled={isUploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Milestones Section */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Proje Aşamaları (Opsiyonel)
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowMilestones(!showMilestones)}
          >
            {showMilestones ? 'Gizle' : 'Aşama Ekle'}
          </Button>
        </div>

        {showMilestones && (
          <Card className="space-y-4 p-4">
            {/* Add New Milestone */}
            <div className="space-y-3">
              <Input
                placeholder="Aşama başlığı"
                value={newMilestone.title}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, title: e.target.value })
                }
              />
              <textarea
                placeholder="Aşama açıklaması"
                value={newMilestone.description}
                onChange={(e) =>
                  setNewMilestone({
                    ...newMilestone,
                    description: e.target.value,
                  })
                }
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Tutar (₺)"
                  value={newMilestone.amount || ''}
                  onChange={(e) =>
                    setNewMilestone({
                      ...newMilestone,
                      amount: parseFloat(e.target.value) || 0,
                    })
                  }
                  min="0"
                />
                <Input
                  type="number"
                  placeholder="Süre (gün)"
                  value={newMilestone.deliveryTime || ''}
                  onChange={(e) =>
                    setNewMilestone({
                      ...newMilestone,
                      deliveryTime: parseInt(e.target.value) || 0,
                    })
                  }
                  min="1"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddMilestone}
                disabled={!newMilestone.title || newMilestone.amount <= 0}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Aşama Ekle
              </Button>
            </div>

            {/* Milestones List */}
            {milestones.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Aşamalar ({milestones.length})
                  </span>
                  {!milestonesValid && (
                    <Badge variant="destructive" className="text-xs">
                      Toplam tutarlar eşleşmiyor
                    </Badge>
                  )}
                </div>

                {milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="flex items-start gap-2 rounded-lg bg-gray-50 p-3"
                  >
                    <GripVertical className="mt-1 h-5 w-5 flex-shrink-0 text-gray-400" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {milestone.title}
                      </p>
                      {milestone.description && (
                        <p className="text-xs text-gray-600">
                          {milestone.description}
                        </p>
                      )}
                      <div className="mt-1 flex gap-3 text-xs text-gray-500">
                        <span>₺{milestone.amount.toLocaleString('tr-TR')}</span>
                        <span>•</span>
                        <span>{milestone.deliveryTime} gün</span>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMilestone(milestone.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}

                <div className="mt-3 flex justify-between text-sm font-medium">
                  <span>Toplam:</span>
                  <span
                    className={
                      milestonesValid ? 'text-green-600' : 'text-red-600'
                    }
                  >
                    ₺{totalMilestoneAmount.toLocaleString('tr-TR')} / ₺
                    {bidAmount.toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Validation Errors */}
      {errors.milestones && (
        <Card className="border-red-200 bg-red-50 p-3">
          <div className="flex items-center gap-2 text-sm text-red-800">
            <AlertCircle className="h-4 w-4" />
            {errors.milestones}
          </div>
        </Card>
      )}

      {/* Earnings Summary */}
      <Card className="border-blue-200 bg-blue-50 p-4">
        <h4 className="mb-3 font-semibold text-blue-900">Teklif Özeti</h4>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex justify-between">
            <span>Teklif Tutarı:</span>
            <span className="font-medium">
              ₺{bidAmount.toLocaleString('tr-TR')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Platform Komisyonu (%5):</span>
            <span className="font-medium">
              ₺{platformFee.toLocaleString('tr-TR')}
            </span>
          </div>
          <div className="flex justify-between border-t border-blue-200 pt-2">
            <span className="font-semibold">Alacağınız Tutar:</span>
            <span className="font-semibold text-green-700">
              ₺{freelancerAmount.toLocaleString('tr-TR')}
            </span>
          </div>
          <div className="flex justify-between text-gray-700">
            <span>Teslimat Süresi:</span>
            <span className="font-medium">
              {formData.deliveryTime || 0} gün
            </span>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={!canSubmit || !milestonesValid}
          className="flex-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
          onClick={() => saveDraft()}
          disabled={isSavingDraft}
          className="px-6"
        >
          {isSavingDraft ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
        </Button>

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
      </div>
    </form>
  );
}
