/**
 * My Proposals Page
 * Freelancer's proposal management dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Filter, Loader2, Plus } from 'lucide-react';
import { FreelancerProposalCardV2 } from '@/components/domains/proposals/FreelancerProposalCardV2';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks';
import {
  getMyProposals,
  withdrawProposal,
  type ProposalFilters,
} from '@/lib/api/proposals';
import type {
  ProposalResponse,
  PageResponse,
  ProposalStatus,
} from '@/types/backend-aligned';

export default function MyProposalsPage() {
  const router = useRouter();
  const toast = useToast();

  // State
  const [proposals, setProposals] = useState<ProposalResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<ProposalStatus | 'all'>(
    'all'
  );

  const [filters, setFilters] = useState<ProposalFilters>({
    page: 0,
    size: 20,
    sort: 'createdAt,desc',
  });

  // Load proposals
  const loadProposals = async (newFilters?: ProposalFilters) => {
    try {
      setIsLoading(true);
      const filtersToUse = newFilters || filters;

      const response: PageResponse<ProposalResponse> =
        await getMyProposals(filtersToUse);

      setProposals(response.content);
      setCurrentPage(response.page || 0);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to load my proposals:', error);
      toast.error('Teklifleriniz yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadProposals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle status filter
  const handleStatusFilter = (status: ProposalStatus | 'all') => {
    setSelectedStatus(status);
    const newFilters: ProposalFilters = {
      ...filters,
      status: status === 'all' ? undefined : status,
      page: 0,
    };
    setFilters(newFilters);
    loadProposals(newFilters);
  };

  // Handle withdraw
  const handleWithdraw = async (proposalId: string) => {
    if (!confirm('Bu teklifi geri çekmek istediğinizden emin misiniz?')) return;

    try {
      await withdrawProposal(proposalId);
      toast.success('Teklif geri çekildi');
      loadProposals();
    } catch (error) {
      console.error('Failed to withdraw proposal:', error);
      toast.error('Teklif geri çekilirken bir hata oluştu');
    }
  };

  // Get proposal counts by status
  const getStatusCounts = () => {
    const counts = {
      all: totalElements,
      PENDING: 0,
      SHORTLISTED: 0,
      ACCEPTED: 0,
      REJECTED: 0,
      WITHDRAWN: 0,
    };

    // This would ideally come from an API endpoint
    // For now, we calculate from current page
    proposals.forEach((proposal) => {
      if (counts[proposal.status as keyof typeof counts] !== undefined) {
        counts[proposal.status as keyof typeof counts]++;
      }
    });

    return counts;
  };

  const statusCounts = getStatusCounts();

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
        <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-6">
          <Card
            className={`cursor-pointer p-4 transition-shadow hover:shadow-md ${selectedStatus === 'all' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => handleStatusFilter('all')}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {statusCounts.all}
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
                {statusCounts.PENDING}
              </div>
              <div className="text-sm text-gray-600">Beklemede</div>
            </div>
          </Card>

          <Card
            className={`cursor-pointer p-4 transition-shadow hover:shadow-md ${selectedStatus === 'SHORTLISTED' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => handleStatusFilter('SHORTLISTED')}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">
                {statusCounts.SHORTLISTED}
              </div>
              <div className="text-sm text-gray-600">Ön Seçildi</div>
            </div>
          </Card>

          <Card
            className={`cursor-pointer p-4 transition-shadow hover:shadow-md ${selectedStatus === 'ACCEPTED' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => handleStatusFilter('ACCEPTED')}
          >
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">
                {statusCounts.ACCEPTED}
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
                {statusCounts.REJECTED}
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
                {statusCounts.WITHDRAWN}
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
        {!isLoading && proposals.length > 0 && totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const newFilters = { ...filters, page: currentPage - 1 };
                setFilters(newFilters);
                loadProposals(newFilters);
              }}
              disabled={currentPage === 0}
            >
              Önceki
            </Button>

            <span className="text-sm text-gray-600">
              Sayfa {currentPage + 1} / {totalPages}
            </span>

            <Button
              variant="outline"
              onClick={() => {
                const newFilters = { ...filters, page: currentPage + 1 };
                setFilters(newFilters);
                loadProposals(newFilters);
              }}
              disabled={currentPage >= totalPages - 1}
            >
              Sonraki
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
