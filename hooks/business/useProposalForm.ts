import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useJobDetailStore } from '@/lib/core/store';
import { ProposalFormData, proposalSchema } from '@/lib/core/validations/details';
import logger from '@/lib/infrastructure/monitoring/logger';

interface FileUploadProgress {
  [fileName: string]: number;
}

export function useProposalForm(jobId: string) {
  const { submitProposal, isSubmittingProposal, error } = useJobDetailStore();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<FileUploadProgress>({});

  const form = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      jobId,
      budget: {
        type: 'fixed',
        amount: 0,
      },
      timeline: {
        value: 1,
        unit: 'days',
      },
      coverLetter: '',
      milestones: [],
      questions: [],
      attachments: [],
    },
  });

  const handleFileUpload = useCallback(
    async (newFiles: File[]) => {
      setUploadedFiles((prev) => [...prev, ...newFiles]);

      // Simulate upload progress for each file
      for (const file of newFiles) {
        const fileKey = `${file.name}_${file.size}`;

        // Start upload simulation
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress((prev) => ({ ...prev, [fileKey]: progress }));
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Simulate successful upload
        const uploadResponse = await uploadFile(file);
        if (uploadResponse.success) {
          const currentAttachments = form.getValues('attachments') || [];
          form.setValue('attachments', [
            ...currentAttachments,
            {
              name: file.name,
              url: uploadResponse.url,
              type: file.type,
            },
          ]);
        }

        // Remove progress tracking
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[fileKey];
          return newProgress;
        });
      }
    },
    [form]
  );

  const uploadFile = async (
    file: File
  ): Promise<{ success: boolean; url: string }> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/v1/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      return {
        success: data.success,
        url: data.success ? data.data.url : '',
      };
    } catch (error) {
      logger.error('File upload error:', error instanceof Error ? error : new Error(String(error)));
      return { success: false, url: '' };
    }
  };

  const removeFile = useCallback(
    (index: number) => {
      setUploadedFiles((prev) => prev.filter((_, i) => i !== index));

      const currentAttachments = form.getValues('attachments') || [];
      const newAttachments = currentAttachments.filter((_, i) => i !== index);
      form.setValue('attachments', newAttachments);
    },
    [form]
  );

  const addMilestone = useCallback(() => {
    const currentMilestones = form.getValues('milestones') || [];
    form.setValue('milestones', [
      ...currentMilestones,
      {
        title: '',
        description: '',
        amount: 0,
        dueDate: '',
      },
    ]);
  }, [form]);

  const removeMilestone = useCallback(
    (index: number) => {
      const currentMilestones = form.getValues('milestones') || [];
      const newMilestones = currentMilestones.filter((_, i) => i !== index);
      form.setValue('milestones', newMilestones);
    },
    [form]
  );

  const addQuestion = useCallback(() => {
    const currentQuestions = form.getValues('questions') || [];
    form.setValue('questions', [
      ...currentQuestions,
      {
        question: '',
        answer: '',
      },
    ]);
  }, [form]);

  const removeQuestion = useCallback(
    (index: number) => {
      const currentQuestions = form.getValues('questions') || [];
      const newQuestions = currentQuestions.filter((_, i) => i !== index);
      form.setValue('questions', newQuestions);
    },
    [form]
  );

  const onSubmit = async (data: ProposalFormData) => {
    try {
      await submitProposal(data);

      // Reset form on success
      form.reset();
      setUploadedFiles([]);
      setUploadProgress({});
    } catch (error) {
      logger.error('Proposal submission error:', error instanceof Error ? error : new Error(String(error)));
    }
  };

  // Calculate total budget from milestones
  const calculateTotalFromMilestones = useCallback(() => {
    const milestones = form.watch('milestones') || [];
    return milestones.reduce(
      (total, milestone) => total + (milestone.amount || 0),
      0
    );
  }, [form]);

  return {
    // Form state
    form,
    isSubmitting: isSubmittingProposal,
    error,

    // File upload state
    uploadedFiles,
    uploadProgress,

    // Form data
    budget: form.watch('budget'),
    timeline: form.watch('timeline'),
    milestones: form.watch('milestones'),
    questions: form.watch('questions'),

    // Actions
    handleSubmit: form.handleSubmit(onSubmit),
    handleFileUpload,
    removeFile,
    addMilestone,
    removeMilestone,
    addQuestion,
    removeQuestion,
    calculateTotalFromMilestones,

    // Form controls
    register: form.register,
    setValue: form.setValue,
    getValues: form.getValues,
    watch: form.watch,
    formState: form.formState,
  };
}
