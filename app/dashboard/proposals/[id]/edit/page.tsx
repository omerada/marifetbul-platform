/**
 * ================================================
 * PROPOSAL EDIT PAGE
 * ================================================
 * Freelancer proposal editing page (PENDING status only)
 *
 * Features:
 * - Load existing proposal data
 * - Edit cover letter, bid amount, delivery time, milestones
 * - Validate only PENDING proposals can be edited
 * - Integration with useProposals hook
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2: Freelancer Dashboard
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  FileText,
  DollarSign,
  Clock,
} from 'lucide-react';
import { ProposalForm } from '@/components/domains/jobs/ProposalForm';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useProposals } from '@/hooks/business/proposals';
import { getProposalById } from '@/lib/api/proposals';
import type { ProposalResponse } from '@/types/backend-aligned';
import logger from '@/lib/infrastructure/monitoring/logger';
import { toast } from 'sonner';

export default function ProposalEditPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;

  const [proposal, setProposal] = useState<ProposalResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { updateProposal, isUpdating } = useProposals();

  // Load proposal details
  useEffect(() => {
    const loadProposal = async () => {
      try {
        setIsLoading(true);
        setError(null);
        logger.info('[ProposalEditPage] Loading proposal', { proposalId });

        const data = await getProposalById(proposalId);

        // Type assertion - API returns validated proposal
        const proposalData = data as unknown as ProposalResponse;

        // Check if proposal can be edited
        if (proposalData.status !== 'PENDING') {
          setError('Sadece beklemedeki teklifler düzenlenebilir');
          toast.error('Bu teklif düzenlenemez', {
            description: 'Sadece beklemedeki teklifler düzenlenebilir',
          });
          setTimeout(() => {
            router.push(`/dashboard/proposals/${proposalId}`);
          }, 2000);
          return;
        }

        setProposal(proposalData);
        logger.info('[ProposalEditPage] Proposal loaded successfully');
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : 'Teklif yüklenemedi';
        setError(errorMsg);
        logger.error(
          '[ProposalEditPage] Failed to load proposal',
          err as Error
        );
        toast.error('Teklif yüklenemedi', {
          description: errorMsg,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (proposalId) {
      loadProposal();
    }
  }, [proposalId, router]);

  const handleSubmit = async (formData: {
    coverLetter: string;
    bidAmount: number;
    deliveryTime: number;
    milestones?: string;
  }) => {
    try {
      logger.info('[ProposalEditPage] Updating proposal', { proposalId });

      const result = await updateProposal(proposalId, {
        coverLetter: formData.coverLetter,
        bidAmount: formData.bidAmount,
        deliveryTime: formData.deliveryTime,
        milestones: formData.milestones
          ? JSON.parse(formData.milestones)
          : undefined,
      });

      if (result) {
        logger.info('[ProposalEditPage] Proposal updated successfully');

        // Redirect to proposal detail page
        setTimeout(() => {
          router.push(`/dashboard/proposals/${proposalId}`);
        }, 1500);
      }
    } catch (err) {
      logger.error(
        '[ProposalEditPage] Failed to update proposal',
        err as Error
      );
      // Error toast handled by hook
    }
  };

  const handleCancel = () => {
    router.push(`/dashboard/proposals/${proposalId}`);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-center gap-3 py-12">
            <Loader2 className="text-primary h-8 w-8 animate-spin" />
            <p className="text-sm text-gray-600">Teklif yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error || !proposal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            {error || 'Teklif bulunamadı'}
          </h2>
          <p className="mb-4 text-gray-600">
            Teklif yüklenirken bir hata oluştu veya teklif bulunamadı.
          </p>
          <Button onClick={() => router.push('/dashboard/my-proposals')}>
            Tekliflerime Dön
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
        <h1 className="mb-2 text-3xl font-bold text-gray-900">
          Teklifi Düzenle
        </h1>
        <p className="mb-6 text-gray-600">
          Teklifinizi güncelleyin ve değişikliklerinizi kaydedin
        </p>

        {/* Job Summary Card */}
        <Card className="mb-6 p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex-1">
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                {proposal.jobTitle}
              </h2>
              <Badge variant="secondary" className="mb-2">
                {proposal.status}
              </Badge>
            </div>
          </div>

          {/* Current Proposal Info */}
          <div className="grid grid-cols-1 gap-4 rounded-lg bg-gray-50 p-4 md:grid-cols-3">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">Mevcut Teklif</p>
                <p className="font-semibold text-gray-900">
                  {proposal.proposedBudget.toLocaleString('tr-TR')} TL
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">Teslimat Süresi</p>
                <p className="font-semibold text-gray-900">
                  {proposal.deliveryDays} gün
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-600">Durum</p>
                <p className="font-semibold text-gray-900">Beklemede</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Edit Form */}
        <Card className="p-6">
          <h3 className="mb-6 text-lg font-semibold text-gray-900">
            Teklif Bilgilerini Güncelle
          </h3>
          <ProposalForm
            jobId={proposal.jobId}
            onSubmit={handleSubmit as (data: unknown) => void}
            onCancel={handleCancel}
            isSubmitting={isUpdating}
            defaultValues={{
              jobId: proposal.jobId,
              coverLetter: proposal.coverLetter,
              bidAmount: proposal.proposedBudget,
              deliveryTime: proposal.deliveryDays,
              // Milestones: Backend uses dueDate, form uses durationDays - needs transformation
              milestones: proposal.milestones as any,
            }}
          />
        </Card>

        {/* Warning Card */}
        <Card className="mt-6 border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600" />
            <div className="text-sm text-amber-800">
              <p className="mb-1 font-semibold">Önemli Notlar:</p>
              <ul className="ml-4 list-disc space-y-1">
                <li>Sadece beklemedeki teklifler düzenlenebilir</li>
                <li>Değişiklikleriniz işveren tarafından görüntülenecektir</li>
                <li>Teklif güncellemesi sonrası durum değişmeyecektir</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
