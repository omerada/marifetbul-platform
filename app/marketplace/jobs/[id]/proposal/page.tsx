/**
 * ================================================
 * JOB PROPOSAL SUBMISSION PAGE
 * ================================================
 * Freelancer proposal submission form with job summary
 *
 * Features:
 * - Job details display
 * - Proposal form with validation
 * - Eligibility checking
 * - Integration with useJobs and useProposals hooks
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 2: Refactored with hooks
 */

'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { ProposalForm } from '@/components/domains/jobs/ProposalForm';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui/Card';
import { useJobs } from '@/hooks/business/jobs/useJobs';
import { useProposals } from '@/hooks/business/proposals';
import { useProposalEligibility } from '@/hooks/business/useProposalEligibility';
import logger from '@/lib/infrastructure/monitoring/logger';
import { toast } from 'sonner';

/**
 * Job Proposal Submission Page
 *
 * Allows freelancers to submit proposals for a specific job.
 * Shows job summary and proposal form.
 */
export default function JobProposalPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  // Hooks
  const {
    currentJob,
    isLoading: isLoadingJob,
    error: jobError,
    fetchJobById,
  } = useJobs();
  const { createProposal, isLoading: isSubmitting } = useProposals();

  const { eligibility, isLoading: isCheckingEligibility } =
    useProposalEligibility({
      jobId,
      enabled: true,
    });

  // Fetch job details
  useEffect(() => {
    if (jobId) {
      fetchJobById(jobId);
    }
  }, [jobId, fetchJobById]);

  // Check eligibility and redirect if cannot propose
  useEffect(() => {
    if (!isCheckingEligibility && eligibility && !eligibility.canPropose) {
      toast.warning(
        eligibility.reason || 'Bu iş ilanı için teklif gönderemezsiniz',
        {
          description: 'Teklif Gönderilemez',
        }
      );

      // If already proposed, redirect to proposals page
      if (eligibility.hasExistingProposal && eligibility.existingProposalId) {
        router.push(
          `/dashboard/my-proposals?highlight=${eligibility.existingProposalId}`
        );
      } else {
        router.push(`/marketplace/jobs/${jobId}`);
      }
    }
  }, [eligibility, isCheckingEligibility, jobId, router]);

  const handleSubmit = async (proposalData: {
    coverLetter: string;
    bidAmount: number;
    deliveryTime: number;
    milestones?: string;
  }) => {
    try {
      await createProposal({
        jobId,
        coverLetter: proposalData.coverLetter,
        bidAmount: proposalData.bidAmount,
        deliveryTime: proposalData.deliveryTime,
        milestones: proposalData.milestones
          ? JSON.parse(proposalData.milestones)
          : undefined,
      });

      // Success - toast handled by hook
      logger.info('[JobProposalPage] Proposal submitted successfully');

      // Redirect to freelancer proposals page
      setTimeout(() => {
        router.push('/dashboard/my-proposals');
      }, 1500);
    } catch (error) {
      logger.error(
        '[JobProposalPage] Error submitting proposal:',
        error instanceof Error ? error : new Error(String(error))
      );
      // Error toast handled by hook
    }
  };

  const handleCancel = () => {
    router.push(`/marketplace/jobs/${jobId}`);
  };

  // Loading state
  if (isLoadingJob || isCheckingEligibility) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-3 py-12">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <p className="text-sm text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Job not found or error
  if (jobError || !currentJob) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            İş ilanı bulunamadı
          </h2>
          <p className="mb-4 text-gray-600">
            {jobError
              ? typeof jobError === 'string'
                ? jobError
                : jobError.message || String(jobError)
              : 'Bir hata oluştu'}
          </p>
          <Button onClick={() => router.push('/marketplace/jobs')}>
            İş İlanlarına Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri Dön
        </Button>

        {/* Page Title */}
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Teklif Gönder</h1>

        {/* Job Summary Card */}
        <Card className="mb-6 p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                {currentJob.title}
              </h2>
              {currentJob.employerName && (
                <p className="text-sm text-gray-600">
                  {currentJob.employerName}
                </p>
              )}
            </div>
            {currentJob.category && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                {currentJob.category.name}
              </span>
            )}
          </div>

          <p className="mb-4 line-clamp-3 text-gray-700">
            {currentJob.description}
          </p>

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {currentJob.budgetType && (
              <div className="flex items-center text-sm">
                <DollarSign className="mr-2 h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {currentJob.budgetType === 'FIXED' ? 'Sabit: ' : 'Aralık: '}
                  {currentJob.budgetMin?.toLocaleString('tr-TR')}
                  {currentJob.budgetMax &&
                    currentJob.budgetMax !== currentJob.budgetMin &&
                    ` - ${currentJob.budgetMax?.toLocaleString('tr-TR')}`}
                  {' TL'}
                </span>
              </div>
            )}

            {currentJob.duration && (
              <div className="flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{currentJob.duration}</span>
              </div>
            )}

            {currentJob.location && (
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{currentJob.location}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Proposal Form */}
        <Card className="p-6">
          <h3 className="mb-6 text-lg font-semibold text-gray-900">
            Teklif Detayları
          </h3>
          <ProposalForm
            jobId={jobId}
            onSubmit={handleSubmit as (data: unknown) => void}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        </Card>

        {/* Tips Card */}
        <Card className="mt-6 border-blue-200 bg-blue-50 p-6">
          <h4 className="mb-3 flex items-center font-semibold text-blue-900">
            <CheckCircle2 className="mr-2 h-5 w-5" />
            Başarılı Bir Teklif İçin İpuçları
          </h4>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Kendinizi ve yeteneklerinizi net bir şekilde tanıtın</li>
            <li>• İşverenin ihtiyaçlarını anladığınızı gösterin</li>
            <li>• Projeye nasıl yaklaşacağınızı açıklayın</li>
            <li>• Gerçekçi bir bütçe ve teslimat süresi belirtin</li>
            <li>• Portföyünüzden ilgili örnekler ekleyin</li>
            <li>• Profesyonel ve samimi bir dil kullanın</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
