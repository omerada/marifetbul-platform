/**
 * ================================================
 * MY PROPOSALS PAGE
 * ================================================
 * Freelancer's proposal management dashboard
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @updated November 6, 2025
 * Sprint: Job Posting & Proposal System - Story 2
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Filter, Loader2, Plus } from 'lucide-react';
import { FreelancerProposalCardV2 } from '@/components/domains/proposals/FreelancerProposalCardV2';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui';
import { useProposals } from '@/hooks/business/proposals';
import type { ProposalStatus } from '@/lib/core/validations/proposals';

export default function MyProposalsPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<ProposalStatus | 'all'>(
    'all'
  );

  // Use the new useProposals hook
  const {
    proposals,
    stats,
    isLoading,
    pagination,
    withdrawProposal: withdrawProposalMutation,
    setFilters,
  } = useProposals({
    status: selectedStatus === 'all' ? undefined : selectedStatus,
  });

  // Handler functions
  const handleStatusFilter = (status: ProposalStatus | 'all') => {
    setSelectedStatus(status);
    setFilters({
      status: status === 'all' ? undefined : status,
      page: 0,
    });
  };

  const handleWithdraw = async (proposalId: string) => {
    if (!confirm('Bu teklifi geri çekmek istediğinizden emin misiniz?')) return;
    await withdrawProposalMutation(proposalId);
  };

  const handlePageChange = (newPage: number) => {
    setFilters({ page: newPage });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-gray-900">
              Tekliflerim
            </h1>
            <p className="text-gray-600">
              Gönderdiğiniz teklifleri görüntüleyin ve yönetin
            </p>
          </div>
          <Button
            onClick={() => router.push('/marketplace/jobs')}
            className="flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            İş Ara
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          <Card
            className={`cursor-pointer p-4 transition-shadow hover:shadow-md ${selectedStatus === 'all' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => handleStatusFilter('all')}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {stats?.totalProposals || 0}
              </div>
              <div className="text-sm text-gray-600">Tümü</div>
            </div>
          </Card>

          <Card
            className={`cursor-pointer p-4 transition-shadow hover:shadow-md ${selectedStatus === 'PENDING' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => handleStatusFilter('PENDING')}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-700">
                {stats?.pendingProposals || 0}
              </div>
              <div className="text-sm text-gray-600">Beklemede</div>
            </div>
          </Card>

          <Card
            className={`cursor-pointer p-4 transition-shadow hover:shadow-md ${selectedStatus === 'ACCEPTED' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => handleStatusFilter('ACCEPTED')}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {stats?.acceptedProposals || 0}
              </div>
              <div className="text-sm text-gray-600">Kabul Edildi</div>
            </div>
          </Card>

          <Card
            className={`cursor-pointer p-4 transition-shadow hover:shadow-md ${selectedStatus === 'REJECTED' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => handleStatusFilter('REJECTED')}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-red-700">
                {stats?.rejectedProposals || 0}
              </div>
              <div className="text-sm text-gray-600">Reddedildi</div>
            </div>
          </Card>

          <Card
            className={`cursor-pointer p-4 transition-shadow hover:shadow-md ${selectedStatus === 'WITHDRAWN' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => handleStatusFilter('WITHDRAWN')}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700">
                {stats?.withdrawnProposals || 0}
              </div>
              <div className="text-sm text-gray-600">Geri Çekildi</div>
            </div>
          </Card>
        </div>

        {/* Filter Info */}
        {selectedStatus !== 'all' && (
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm text-gray-600">
              Filtreleniyor: <Badge variant="secondary">{selectedStatus}</Badge>
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleStatusFilter('all')}
            >
              Temizle
            </Button>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && proposals.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white py-16 text-center">
            <FileText className="mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              {selectedStatus === 'all'
                ? 'Henüz teklif göndermediniz'
                : 'Bu statüde teklif bulunamadı'}
            </h3>
            <p className="mb-6 max-w-md text-gray-600">
              {selectedStatus === 'all'
                ? 'İlk teklifinizi göndererek başlayın.'
                : 'Farklı bir filtre seçmeyi deneyin.'}
            </p>
            {selectedStatus === 'all' ? (
              <Button
                onClick={() => router.push('/marketplace/jobs')}
                className="flex items-center gap-2"
              >
                <Plus className="h-5 w-5" />
                İş İlanlarını Keşfet
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => handleStatusFilter('all')}
              >
                Tüm Teklifleri Göster
              </Button>
            )}
          </div>
        )}

        {/* Proposals List */}
        {!isLoading && proposals.length > 0 && (
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <FreelancerProposalCardV2
                key={proposal.id}
                proposal={proposal}
                onView={(id) => router.push(`/dashboard/proposals/${id}`)}
                onEdit={(id) => router.push(`/dashboard/proposals/${id}/edit`)}
                onWithdraw={handleWithdraw}
                onViewJob={(jobId) => router.push(`/marketplace/jobs/${jobId}`)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!isLoading &&
          proposals.length > 0 &&
          pagination &&
          pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevious}
              >
                Önceki
              </Button>

              <span className="text-sm text-gray-600">
                Sayfa {pagination.page + 1} / {pagination.totalPages}
              </span>

              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.hasNext}
              >
                Sonraki
              </Button>
            </div>
          )}
      </div>
    </div>
  );
}
