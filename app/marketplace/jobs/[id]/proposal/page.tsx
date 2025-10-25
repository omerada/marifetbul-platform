'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { ProposalForm } from '@/components/domains/jobs/ProposalForm';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui/Card';
import { useUIStore } from '@/lib/core/store/domains/ui/uiStore';
import { useProposalEligibility } from '@/hooks/business/useProposalEligibility';
import { logger } from '@/lib/shared/utils/logger';

interface Job {
  id: string;
  title: string;
  description: string;
  category?: { name: string };
  location?: string;
  budget?: { min: number; max: number; type: string };
  deliveryTime?: number;
  employer?: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

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

  const [job, setJob] = useState<Job | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  const { addToast } = useUIStore();

  const { eligibility, isLoading: isCheckingEligibility } =
    useProposalEligibility({
      jobId,
      enabled: true,
    });

  // Fetch job details
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`/api/v1/jobs/${jobId}`, {
          credentials: 'include',
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'İş ilanı yüklenemedi');
        }

        setJob(data.data);
        logger.debug('[JobProposalPage] Job fetched:', data.data);
      } catch (error) {
        logger.error('[JobProposalPage] Error fetching job:', error);
        addToast({
          title: 'Hata',
          description:
            error instanceof Error ? error.message : 'İş ilanı yüklenemedi',
          type: 'error',
          duration: 5000,
        });
        router.push(`/marketplace/jobs/${jobId}`);
      } finally {
        setIsLoadingJob(false);
      }
    };

    if (jobId) {
      fetchJob();
    }
  }, [jobId, router, addToast]);

  // Check eligibility and redirect if cannot propose
  useEffect(() => {
    if (!isCheckingEligibility && eligibility && !eligibility.canPropose) {
      addToast({
        title: 'Teklif Gönderilemez',
        description:
          eligibility.reason || 'Bu iş ilanı için teklif gönderemezsiniz',
        type: 'warning',
        duration: 5000,
      });

      // If already proposed, redirect to proposals page
      if (eligibility.hasExistingProposal && eligibility.existingProposalId) {
        router.push(
          `/dashboard/freelancer/proposals?proposalId=${eligibility.existingProposalId}`
        );
      } else {
        router.push(`/marketplace/jobs/${jobId}`);
      }
    }
  }, [eligibility, isCheckingEligibility, jobId, router, addToast]);

  const handleSubmit = async (proposalData: {
    coverLetter: string;
    bidAmount: number;
    deliveryTime: number;
    milestones?: string;
  }) => {
    try {
      const response = await fetch('/api/v1/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          jobId,
          coverLetter: proposalData.coverLetter,
          bidAmount: proposalData.bidAmount,
          deliveryTime: proposalData.deliveryTime,
          milestones: proposalData.milestones,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Teklif gönderilemedi');
      }

      // Success
      addToast({
        title: 'Başarılı!',
        description: 'Teklifiniz başarıyla gönderildi',
        type: 'success',
        duration: 5000,
      });

      logger.info(
        '[JobProposalPage] Proposal submitted successfully:',
        data.data
      );

      // Redirect to freelancer proposals page
      setTimeout(() => {
        router.push('/dashboard/freelancer/proposals');
      }, 1500);
    } catch (error) {
      logger.error('[JobProposalPage] Error submitting proposal:', error);
      addToast({
        title: 'Hata',
        description:
          error instanceof Error ? error.message : 'Teklif gönderilemedi',
        type: 'error',
        duration: 5000,
      });
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
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 rounded bg-gray-200"></div>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="h-6 w-3/4 rounded bg-gray-200"></div>
                <div className="h-4 w-full rounded bg-gray-200"></div>
                <div className="h-4 w-full rounded bg-gray-200"></div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="h-96 rounded bg-gray-200"></div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Job not found
  if (!job) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            İş ilanı bulunamadı
          </h2>
          <Button
            onClick={() => router.push('/marketplace/jobs')}
            className="mt-4"
          >
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
                {job.title}
              </h2>
              {job.employer && (
                <p className="text-sm text-gray-600">
                  {job.employer.firstName} {job.employer.lastName}
                </p>
              )}
            </div>
            {job.category && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                {job.category.name}
              </span>
            )}
          </div>

          <p className="mb-4 line-clamp-3 text-gray-700">{job.description}</p>

          {/* Job Details Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {job.budget && (
              <div className="flex items-center text-sm">
                <DollarSign className="mr-2 h-4 w-4 text-gray-400" />
                <span className="text-gray-600">
                  {job.budget.type === 'FIXED' ? 'Sabit:' : 'Aralık:'}{' '}
                  {job.budget.min?.toLocaleString('tr-TR')}
                  {job.budget.max &&
                    job.budget.max !== job.budget.min &&
                    ` - ${job.budget.max?.toLocaleString('tr-TR')}`}
                  {' TL'}
                </span>
              </div>
            )}

            {job.deliveryTime && (
              <div className="flex items-center text-sm">
                <Clock className="mr-2 h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{job.deliveryTime} gün</span>
              </div>
            )}

            {job.location && (
              <div className="flex items-center text-sm">
                <MapPin className="mr-2 h-4 w-4 text-gray-400" />
                <span className="text-gray-600">{job.location}</span>
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
            onSubmit={handleSubmit}
            onCancel={handleCancel}
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
