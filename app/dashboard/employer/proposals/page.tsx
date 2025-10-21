'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { ProposalCard } from '@/components/domains/jobs/ProposalCard';
import { useProposal } from '@/hooks/business';
import { Loading } from '@/components/ui';
import { FileText, Check, X, Clock } from 'lucide-react';
import type { Proposal } from '@/types/core/jobs';

export default function EmployerProposalsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const {
    acceptProposal,
    rejectProposal,
    isLoading: isActionLoading,
  } = useProposal({
    onSuccess: () => {
      // Refresh proposals after action
      loadProposals();
    },
  });

  const loadProposals = async () => {
    if (!jobId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/jobs/${jobId}/proposals`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Teklifler yüklenemedi');
      }

      const data = await response.json();
      setProposals(data.data?.content || data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleAccept = async (proposalId: string) => {
    try {
      await acceptProposal(proposalId);
    } catch {
      // Error is already handled in the hook
    }
  };

  const handleReject = async (proposalId: string) => {
    try {
      await rejectProposal(proposalId);
    } catch {
      // Error is already handled in the hook
    }
  };

  const handleMessage = (freelancerId: string) => {
    router.push(`/messages?userId=${freelancerId}`);
  };

  // Calculate stats
  const stats = {
    total: proposals.length,
    pending: proposals.filter((p) => p.status === 'pending').length,
    accepted: proposals.filter((p) => p.status === 'accepted').length,
    rejected: proposals.filter((p) => p.status === 'rejected').length,
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center p-4">
        <Loading size="lg" text="Teklifler yükleniyor..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alınan Teklifler</h1>
        <p className="mt-1 text-gray-600">
          {jobId
            ? 'İş ilanınıza gelen teklifleri değerlendirin'
            : 'Bir iş ilanı seçerek teklifleri görüntüleyin'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Bekleyen</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.pending}
              </p>
            </div>
            <div className="rounded-lg bg-yellow-100 p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kabul Edilen</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.accepted}
              </p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <Check className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Reddedilen</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.rejected}
              </p>
            </div>
            <div className="rounded-lg bg-red-100 p-3">
              <X className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-4">
          <p className="text-red-800">{error}</p>
        </Card>
      )}

      {/* Proposals List */}
      {!jobId ? (
        <Card className="p-8 text-center">
          <FileText className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            İş İlanı Seçin
          </h3>
          <p className="mt-2 text-gray-500">
            Teklifleri görüntülemek için önce bir iş ilanı seçmelisiniz
          </p>
        </Card>
      ) : proposals.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Henüz teklif yok
          </h3>
          <p className="mt-2 text-gray-500">
            Bu iş ilanına henüz teklif gelmedi. Freelancer&apos;lar tekliflerini
            gönderdiğinde burada görünecekler.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              onAccept={() => handleAccept(proposal.id)}
              onReject={() => handleReject(proposal.id)}
              onMessage={() => handleMessage(proposal.freelancer?.id || '')}
            />
          ))}
        </div>
      )}

      {/* Loading Overlay */}
      {isActionLoading && (
        <div className="bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <Loading size="lg" text="İşleminiz gerçekleştiriliyor..." />
          </div>
        </div>
      )}
    </div>
  );
}
