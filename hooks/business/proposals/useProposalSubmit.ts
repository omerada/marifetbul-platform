'use client';

/**
 * ================================================
 * USE PROPOSAL SUBMIT HOOK
 * ================================================
 * Advanced hook for proposal submission with file uploads and drafts
 *
 * Features:
 * - Cloudinary file upload (multiple attachments)
 * - Draft save/load to localStorage
 * - Auto-save with debounce
 * - Form validation
 * - API integration
 * - Upload progress tracking
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 25, 2025
 * Sprint 1: Job Posting & Proposal System - Task 2.3
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { uploadImage, type UploadResult } from '@/lib/utils/cloudinary';
import * as proposalsAPI from '@/lib/api/proposals';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { ProposalFormData } from '@/lib/core/validations/proposals';

// ================================================
// TYPES
// ================================================

export interface ProposalAttachment {
  id: string;
  file?: File;
  url?: string;
  filename: string;
  size: number;
  type: string;
  uploadProgress?: number;
}

export interface ProposalMilestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  deliveryTime: number;
  order: number;
}

export interface ProposalDraftData {
  jobId: string;
  coverLetter: string;
  bidAmount: number;
  deliveryTime: number;
  milestones: ProposalMilestone[];
  attachments: ProposalAttachment[];
  lastSaved: string;
}

export interface UseProposalSubmitOptions {
  jobId: string;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export interface UseProposalSubmitReturn {
  // Form State
  formData: Partial<ProposalFormData>;
  attachments: ProposalAttachment[];
  milestones: ProposalMilestone[];

  // Loading States
  isSubmitting: boolean;
  isUploading: boolean;
  isSavingDraft: boolean;
  isLoadingDraft: boolean;

  // Progress
  uploadProgress: Record<string, number>;

  // Actions
  updateFormData: (data: Partial<ProposalFormData>) => void;
  addAttachment: (file: File) => Promise<ProposalAttachment | null>;
  removeAttachment: (id: string) => void;
  addMilestone: (milestone: Omit<ProposalMilestone, 'id' | 'order'>) => void;
  updateMilestone: (id: string, data: Partial<ProposalMilestone>) => void;
  removeMilestone: (id: string) => void;
  reorderMilestones: (milestones: ProposalMilestone[]) => void;

  // Draft Management
  saveDraft: () => Promise<void>;
  loadDraft: () => Promise<void>;
  clearDraft: () => void;
  hasDraft: boolean;

  // Submission
  submitProposal: () => Promise<boolean>;

  // Validation
  canSubmit: boolean;
  errors: Record<string, string>;
}

// ================================================
// HOOK
// ================================================

export function useProposalSubmit({
  jobId,
  autoSave = true,
  autoSaveDelay = 3000,
}: UseProposalSubmitOptions): UseProposalSubmitReturn {
  // ==================== STATE ====================

  const [formData, setFormData] = useState<Partial<ProposalFormData>>({
    jobId,
    coverLetter: '',
    bidAmount: 0,
    deliveryTime: 7,
  });

  const [attachments, setAttachments] = useState<ProposalAttachment[]>([]);
  const [milestones, setMilestones] = useState<ProposalMilestone[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    {}
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-save timer ref
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== DRAFT MANAGEMENT ====================

  const getDraftKey = useCallback(() => `proposal_draft_${jobId}`, [jobId]);

  const saveDraft = useCallback(async () => {
    try {
      setIsSavingDraft(true);

      const draftData: ProposalDraftData = {
        jobId,
        coverLetter: formData.coverLetter || '',
        bidAmount: formData.bidAmount || 0,
        deliveryTime: formData.deliveryTime || 7,
        milestones,
        attachments: attachments.map((a) => ({
          id: a.id,
          url: a.url,
          filename: a.filename,
          size: a.size,
          type: a.type,
        })),
        lastSaved: new Date().toISOString(),
      };

      localStorage.setItem(getDraftKey(), JSON.stringify(draftData));
      setHasDraft(true);

      logger.debug('[useProposalSubmit] Draft saved', { jobId });
    } catch (error) {
      logger.error('[useProposalSubmit] Failed to save draft', error as Error);
    } finally {
      setIsSavingDraft(false);
    }
  }, [jobId, formData, milestones, attachments, getDraftKey]);

  const loadDraft = useCallback(async () => {
    try {
      setIsLoadingDraft(true);

      const draftJson = localStorage.getItem(getDraftKey());
      if (!draftJson) {
        setHasDraft(false);
        return;
      }

      const draft: ProposalDraftData = JSON.parse(draftJson);

      setFormData({
        jobId,
        coverLetter: draft.coverLetter,
        bidAmount: draft.bidAmount,
        deliveryTime: draft.deliveryTime,
      });

      setMilestones(draft.milestones || []);
      setAttachments(draft.attachments || []);
      setHasDraft(true);

      logger.info('[useProposalSubmit] Draft loaded', {
        jobId,
        lastSaved: draft.lastSaved,
      });

      toast.success('Taslak yüklendi', {
        description: `Son kayıt: ${new Date(draft.lastSaved).toLocaleString('tr-TR')}`,
      });
    } catch (error) {
      logger.error('[useProposalSubmit] Failed to load draft', error as Error);
      setHasDraft(false);
    } finally {
      setIsLoadingDraft(false);
    }
  }, [jobId, getDraftKey]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(getDraftKey());
    setHasDraft(false);
    logger.debug('[useProposalSubmit] Draft cleared', { jobId });
  }, [jobId, getDraftKey]);

  // ==================== AUTO-SAVE ====================

  useEffect(() => {
    if (!autoSave) return;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer
    autoSaveTimerRef.current = setTimeout(() => {
      saveDraft();
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData, milestones, attachments, autoSave, autoSaveDelay, saveDraft]);

  // ==================== FORM DATA MANAGEMENT ====================

  const updateFormData = useCallback((data: Partial<ProposalFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  // ==================== ATTACHMENT MANAGEMENT ====================

  const addAttachment = useCallback(
    async (file: File): Promise<ProposalAttachment | null> => {
      try {
        setIsUploading(true);

        const attachmentId = `attachment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          toast.error('Dosya çok büyük', {
            description: 'Maksimum dosya boyutu 10MB',
          });
          return null;
        }

        // Validate file type
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'image/jpeg',
          'image/png',
        ];

        if (!allowedTypes.includes(file.type)) {
          toast.error('Desteklenmeyen dosya türü', {
            description: 'PDF, DOC, DOCX, TXT, JPG veya PNG yükleyebilirsiniz',
          });
          return null;
        }

        // Upload to Cloudinary
        logger.debug('[useProposalSubmit] Uploading attachment', {
          filename: file.name,
          size: file.size,
          type: file.type,
        });

        const uploadResult: UploadResult = await uploadImage(file);

        // Simulate 100% progress on success
        setUploadProgress((prev) => ({
          ...prev,
          [attachmentId]: 100,
        }));

        if (!uploadResult.success || !uploadResult.url) {
          throw new Error(uploadResult.error || 'Upload failed');
        }

        const attachment: ProposalAttachment = {
          id: attachmentId,
          file,
          url: uploadResult.url,
          filename: file.name,
          size: file.size,
          type: file.type,
          uploadProgress: 100,
        };

        setAttachments((prev) => [...prev, attachment]);

        logger.info('[useProposalSubmit] Attachment uploaded', {
          id: attachmentId,
          url: uploadResult.url,
        });

        toast.success('Dosya yüklendi', {
          description: file.name,
        });

        return attachment;
      } catch (error) {
        logger.error(
          '[useProposalSubmit] Failed to upload attachment',
          error as Error
        );
        toast.error('Dosya yüklenemedi', {
          description:
            error instanceof Error ? error.message : 'Lütfen tekrar deneyin',
        });
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const removeAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
    setUploadProgress((prev) => {
      const newProgress = { ...prev };
      delete newProgress[id];
      return newProgress;
    });

    logger.debug('[useProposalSubmit] Attachment removed', { id });
  }, []);

  // ==================== MILESTONE MANAGEMENT ====================

  const addMilestone = useCallback(
    (milestone: Omit<ProposalMilestone, 'id' | 'order'>) => {
      const newMilestone: ProposalMilestone = {
        ...milestone,
        id: `milestone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        order: milestones.length,
      };

      setMilestones((prev) => [...prev, newMilestone]);

      logger.debug('[useProposalSubmit] Milestone added', {
        id: newMilestone.id,
      });
    },
    [milestones.length]
  );

  const updateMilestone = useCallback(
    (id: string, data: Partial<ProposalMilestone>) => {
      setMilestones((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...data } : m))
      );

      logger.debug('[useProposalSubmit] Milestone updated', { id });
    },
    []
  );

  const removeMilestone = useCallback((id: string) => {
    setMilestones((prev) => {
      const filtered = prev.filter((m) => m.id !== id);
      // Reorder
      return filtered.map((m, index) => ({ ...m, order: index }));
    });

    logger.debug('[useProposalSubmit] Milestone removed', { id });
  }, []);

  const reorderMilestones = useCallback(
    (newMilestones: ProposalMilestone[]) => {
      const reordered = newMilestones.map((m, index) => ({
        ...m,
        order: index,
      }));
      setMilestones(reordered);

      logger.debug('[useProposalSubmit] Milestones reordered');
    },
    []
  );

  // ==================== VALIDATION ====================

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.coverLetter || formData.coverLetter.trim().length < 50) {
      newErrors.coverLetter = 'Kapak mektubu en az 50 karakter olmalıdır';
    }

    if (!formData.bidAmount || formData.bidAmount <= 0) {
      newErrors.bidAmount = 'Teklif tutarı geçerli olmalıdır';
    }

    if (!formData.deliveryTime || formData.deliveryTime <= 0) {
      newErrors.deliveryTime = 'Teslimat süresi geçerli olmalıdır';
    }

    // Validate milestones if provided
    if (milestones.length > 0) {
      const totalMilestoneAmount = milestones.reduce(
        (sum, m) => sum + m.amount,
        0
      );
      if (totalMilestoneAmount !== formData.bidAmount) {
        newErrors.milestones =
          'Aşama tutarları toplamı teklif tutarına eşit olmalıdır';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, milestones]);

  const canSubmit =
    Object.keys(errors).length === 0 &&
    !!formData.coverLetter &&
    !!formData.bidAmount &&
    !!formData.deliveryTime &&
    !isSubmitting &&
    !isUploading;

  // ==================== SUBMISSION ====================

  const submitProposal = useCallback(async (): Promise<boolean> => {
    try {
      if (!validateForm()) {
        toast.error('Form eksik veya hatalı', {
          description: 'Lütfen tüm alanları kontrol edin',
        });
        return false;
      }

      setIsSubmitting(true);

      logger.info('[useProposalSubmit] Submitting proposal', {
        jobId,
        bidAmount: formData.bidAmount,
        deliveryTime: formData.deliveryTime,
        attachmentsCount: attachments.length,
        milestonesCount: milestones.length,
      });

      const proposalData: proposalsAPI.CreateProposalRequest = {
        jobId,
        coverLetter: formData.coverLetter!,
        bidAmount: formData.bidAmount!,
        deliveryTime: formData.deliveryTime!,
        attachments: attachments.filter((a) => a.url).map((a) => a.url!),
      };

      // Add milestones if provided
      if (milestones.length > 0) {
        proposalData.milestones = milestones.map((m) => ({
          title: m.title,
          description: m.description,
          amount: m.amount,
          deliveryTime: m.deliveryTime,
          dueDate: new Date(
            Date.now() + m.deliveryTime * 24 * 60 * 60 * 1000
          ).toISOString(),
        }));
      }

      await proposalsAPI.createProposal(proposalData);

      logger.info('[useProposalSubmit] Proposal submitted successfully');

      toast.success('Teklif gönderildi', {
        description: 'İşveren teklifinizi inceleyecektir',
      });

      // Clear draft after successful submission
      clearDraft();

      return true;
    } catch (error) {
      logger.error(
        '[useProposalSubmit] Failed to submit proposal',
        error as Error
      );
      toast.error('Teklif gönderilemedi', {
        description:
          error instanceof Error ? error.message : 'Lütfen tekrar deneyin',
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [jobId, formData, attachments, milestones, validateForm, clearDraft]);

  // ==================== INITIAL DRAFT LOAD ====================

  useEffect(() => {
    const checkDraft = localStorage.getItem(getDraftKey());
    setHasDraft(!!checkDraft);
  }, [jobId, getDraftKey]);

  // ==================== RETURN ====================

  return {
    // Form State
    formData,
    attachments,
    milestones,

    // Loading States
    isSubmitting,
    isUploading,
    isSavingDraft,
    isLoadingDraft,

    // Progress
    uploadProgress,

    // Actions
    updateFormData,
    addAttachment,
    removeAttachment,
    addMilestone,
    updateMilestone,
    removeMilestone,
    reorderMilestones,

    // Draft Management
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,

    // Submission
    submitProposal,

    // Validation
    canSubmit,
    errors,
  };
}
