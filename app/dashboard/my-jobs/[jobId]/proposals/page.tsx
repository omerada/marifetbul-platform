/**
 * Job Proposals Page
 * Display all proposals for a specific job (Employer view)
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Users, Filter, Loader2, FileText } from 'lucide-react';
import { ProposalCard } from '@/components/domains/proposals/ProposalCard';
import { AcceptProposalModal } from '@/components/domains/proposals/AcceptProposalModal';
import { RejectProposalModal } from '@/components/domains/proposals/RejectProposalModal';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/hooks';
import {
  getProposalsByJob,
  shortlistProposal,
  acceptProposal,
  rejectProposal,
  type ProposalFilters,
} from '@/lib/api/proposals';
import { getJobById } from '@/lib/api/jobs';
import type {
  ProposalResponse,
  PageResponse,
  ProposalStatus,
  JobResponse,
} from '@/types/backend-aligned';

export default function JobProposalsPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const jobId = params?.jobId as string;

  // State
  const [job, setJob] = useState<JobResponse | null>(null);
  const [proposals, setProposals] = useState<ProposalResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<ProposalStatus | 'all'>(
    'all'
  );

  // Modal state
  const [acceptModalOpen, setAcceptModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] =
    useState<ProposalResponse | null>(null);

  const [filters, setFilters] = useState<ProposalFilters>({
    page: 0,
    size: 20,
    sort: 'createdAt,desc',
  });

  // Load job details
  useEffect(() => {
    const loadJob = async () => {
      try {
        const jobData = await getJobById(jobId);
        setJob(jobData);
      } catch (error) {
        console.error('Failed to load job:', error);
        toast.error('İş yüklenirken bir hata oluştu');
      }
    };

    if (jobId) {
      loadJob();
    }
  }, [jobId, toast]);

  // Load proposals
  const loadProposals = async (newFilters?: ProposalFilters) => {
    try {
      setIsLoading(true);
      const filtersToUse = newFilters || filters;

      const response: PageResponse<ProposalResponse> = await getProposalsByJob(
        jobId,
        filtersToUse
      );

      setProposals(response.content);
      setCurrentPage(response.page || 0);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to load proposals:', error);
      toast.error('Teklifler yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (jobId) {
      loadProposals();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

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

  // Handle shortlist
  const handleShortlist = async (proposalId: string) => {
    try {
      await shortlistProposal(proposalId);
      toast.success('Teklif ön seçime alındı');
      loadProposals();
    } catch (error) {
      console.error('Failed to shortlist proposal:', error);
      toast.error('Teklif ön seçime alınırken bir hata oluştu');
    }
  };

  // Handle accept
  const handleAcceptClick = (proposal: ProposalResponse) => {
    setSelectedProposal(proposal);
    setAcceptModalOpen(true);
  };

  const handleAccept = async (message?: string) => {
    if (!selectedProposal) return;

    try {
      await acceptProposal(selectedProposal.id, { message });
      toast.success('Teklif kabul edildi');
      loadProposals();
    } catch (error) {
      console.error('Failed to accept proposal:', error);
      toast.error('Teklif kabul edilirken bir hata oluştu');
      throw error;
    }
  };

  // Handle reject
  const handleRejectClick = (proposal: ProposalResponse) => {
    setSelectedProposal(proposal);
    setRejectModalOpen(true);
  };

  const handleReject = async (reason?: string, message?: string) => {
    if (!selectedProposal) return;

    try {
      await rejectProposal(selectedProposal.id, { reason, message });
      toast.success('Teklif reddedildi');
      loadProposals();
    } catch (error) {
      console.error('Failed to reject proposal:', error);
      toast.error('Teklif reddedilirken bir hata oluştu');
      throw error;
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
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard/my-jobs')}
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            İşlerime Dön
          </Button>

          {job && (
            <div className="mb-4 rounded-lg border bg-white p-6">
              <h1 className="mb-2 text-2xl font-bold text-gray-900">
                {job.title}
              </h1>
              <p className="line-clamp-2 text-gray-600">{job.description}</p>
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{totalElements} teklif</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Teklifler</h2>
              <p className="text-gray-600">
                Bu iş için gönderilen teklifleri görüntüleyin ve yönetin
              </p>
            </div>
          </div>
        </div>

        {/* Status Filter Cards */}
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
                ? 'Henüz teklif yok'
                : 'Bu statüde teklif bulunamadı'}
            </h3>
            <p className="mb-6 max-w-md text-gray-600">
              {selectedStatus === 'all'
                ? 'Freelancerlar ilanınıza teklif göndermeye başladığında burada görünecek.'
                : 'Farklı bir filtre seçmeyi deneyin.'}
            </p>
            {selectedStatus !== 'all' && (
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
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                onView={(id) => router.push(`/dashboard/proposals/${id}`)}
                onShortlist={handleShortlist}
                onAccept={() => handleAcceptClick(proposal)}
                onReject={() => handleRejectClick(proposal)}
                showActions={true}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        {selectedProposal && (
          <>
            <AcceptProposalModal
              isOpen={acceptModalOpen}
              onClose={() => {
                setAcceptModalOpen(false);
                setSelectedProposal(null);
              }}
              onAccept={handleAccept}
              proposal={selectedProposal}
            />
            <RejectProposalModal
              isOpen={rejectModalOpen}
              onClose={() => {
                setRejectModalOpen(false);
                setSelectedProposal(null);
              }}
              onReject={handleReject}
              proposal={selectedProposal}
            />
          </>
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
