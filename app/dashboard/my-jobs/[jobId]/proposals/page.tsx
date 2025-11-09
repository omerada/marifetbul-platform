/**
 * ================================================
 * JOB PROPOSALS PAGE (CANONICAL)
 * ================================================
 * Display and manage all proposals for a specific job (Employer view)
 *
 * Features:
 * - Job details header with summary stats
 * - Comprehensive proposal statistics dashboard
 * - Advanced filtering and sorting
 * - Proposal comparison (up to 3 proposals)
 * - Accept/reject proposal actions
 * - Integration with useJobs and useProposals hooks
 *
 * @author MarifetBul Development Team
 * @version 3.0.0 - Sprint: Dashboard Route Consolidation
 * @updated 2025-11-09 - Migrated from employer/jobs/proposals
 *
 * ROUTE CONSOLIDATION:
 * This is the canonical route for job proposals.
 * Old route: /dashboard/employer/jobs/[jobId]/proposals (DEPRECATED)
 * New route: /dashboard/my-jobs/[jobId]/proposals (CANONICAL)
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Users,
  DollarSign,
  Clock,
  FileText,
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { ProposalListItem } from '@/components/domains/jobs/ProposalListItem';
import {
  ProposalStatistics,
  ProposalFilters,
  type SortOption,
  type FilterStatus,
} from '@/components/domains/proposals';
import { useJobs } from '@/hooks/business/useJobs';
import { useProposals } from '@/hooks/business/proposals';
import { useProposal } from '@/hooks/business/useProposal';
import { useProposalComparison } from '@/hooks/business/proposals';
import { formatCurrency } from '@/lib/shared/formatters';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

export default function JobProposalsPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.jobId as string;

  // State
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  // Hooks
  const { currentJob, fetchJobById, isLoading: jobLoading } = useJobs();
  const {
    proposals,
    isLoading: proposalsLoading,
    refresh: refreshProposals,
    setFilters,
  } = useProposals({
    jobId,
    sortBy: 'newest',
  });

  const {
    acceptProposal,
    rejectProposal,
    isLoading: actionLoading,
  } = useProposal({
    onSuccess: () => {
      toast.success('İşlem başarılı');
      refreshProposals();
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Bir hata oluştu';
      toast.error('Hata', { description: message });
    },
  });

  const { selectedProposals, toggleSelect, startComparison, clearSelection } =
    useProposalComparison();

  // Load job details
  useEffect(() => {
    if (jobId) {
      fetchJobById(jobId);
    }
  }, [jobId, fetchJobById]);

  // Update filters when sort/filter changes
  useEffect(() => {
    setFilters({
      jobId,
      status: filterStatus === 'all' ? undefined : filterStatus,
      sortBy: sortBy === 'oldest' ? 'newest' : sortBy,
    });
  }, [jobId, sortBy, filterStatus, setFilters]);

  // Filter proposals based on status
  const filteredProposals =
    proposals?.filter((proposal) => {
      if (filterStatus === 'all') return true;
      return proposal.status === filterStatus;
    }) || [];

  // Calculate statistics
  const stats = {
    total: proposals?.length || 0,
    pending: proposals?.filter((p) => p.status === 'PENDING').length || 0,
    accepted: proposals?.filter((p) => p.status === 'ACCEPTED').length || 0,
    rejected: proposals?.filter((p) => p.status === 'REJECTED').length || 0,
    avgBidAmount: proposals?.length
      ? proposals.reduce((sum, p) => sum + p.proposedBudget, 0) /
        proposals.length
      : 0,
    minBidAmount: proposals?.length
      ? Math.min(...proposals.map((p) => p.proposedBudget))
      : 0,
    maxBidAmount: proposals?.length
      ? Math.max(...proposals.map((p) => p.proposedBudget))
      : 0,
  };

  // Handle proposal actions
  const handleAccept = useCallback(
    async (proposalId: string) => {
      if (
        !window.confirm('Bu teklifi kabul etmek istediğinize emin misiniz?')
      ) {
        return;
      }
      await acceptProposal(proposalId);
    },
    [acceptProposal]
  );

  const handleReject = useCallback(
    async (proposalId: string) => {
      if (!window.confirm('Bu teklifi reddetmek istediğinize emin misiniz?')) {
        return;
      }
      await rejectProposal(proposalId);
    },
    [rejectProposal]
  );

  // Loading state
  if (jobLoading || proposalsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center gap-3 py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Job not found
  if (!currentJob) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-2xl font-bold text-gray-900">
            İş ilanı bulunamadı
          </h2>
          <Button onClick={() => router.push('/dashboard/my-jobs')}>
            İş İlanlarıma Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Geri Dön
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold text-gray-900">
                Gelen Teklifler
              </h1>
              <p className="text-gray-600">{currentJob.title}</p>
            </div>
            <Badge
              variant={currentJob.status === 'OPEN' ? 'success' : 'secondary'}
            >
              {currentJob.status}
            </Badge>
          </div>
        </div>

        {/* Job Summary Card */}
        <Card className="mb-6 p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                <DollarSign className="h-4 w-4" />
                Bütçe
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {currentJob.budgetMin && currentJob.budgetMax
                  ? `${formatCurrency(currentJob.budgetMin)} - ${formatCurrency(currentJob.budgetMax)}`
                  : formatCurrency(currentJob.budgetMin || 0)}
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                Toplam Teklif
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {stats.total}
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                Süre
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {currentJob.duration || '-'}
              </div>
            </div>
            <div>
              <div className="mb-1 flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                Yayınlanma
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {formatDistanceToNow(new Date(currentJob.postedAt), {
                  addSuffix: true,
                  locale: tr,
                })}
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics Cards */}
        <ProposalStatistics stats={stats} />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <ProposalFilters
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            sortBy={sortBy}
            setSortBy={setSortBy}
            stats={stats}
            selectedProposals={selectedProposals}
            onCompare={startComparison}
            onClearSelection={clearSelection}
          />

          {/* Proposals List */}
          <div className="lg:col-span-3">
            {/* Empty State */}
            {filteredProposals.length === 0 && (
              <Card className="p-12 text-center">
                <Users className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  Teklif bulunamadı
                </h3>
                <p className="text-gray-600">
                  {filterStatus === 'all'
                    ? "Henüz teklif gelmedi. Freelancer'lar ilanınızı görüntülediğinde teklifler burada görünecek."
                    : 'Bu durumda teklif bulunmuyor.'}
                </p>
              </Card>
            )}

            {/* Proposals Grid */}
            <div className="space-y-4">
              {filteredProposals.map((proposal) => (
                <div key={proposal.id} className="relative">
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedProposals.includes(proposal.id)}
                      onChange={() => toggleSelect(proposal.id)}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </div>

                  <ProposalListItem
                    proposal={proposal}
                    onAccept={() => handleAccept(proposal.id)}
                    onReject={() => handleReject(proposal.id)}
                    showActions={proposal.status === 'PENDING'}
                    isLoading={actionLoading}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
