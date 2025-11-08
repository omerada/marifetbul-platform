/**
 * ================================================
 * EMPLOYER JOB PROPOSALS PAGE
 * ================================================
 * Manage proposals for a specific job posting
 *
 * Features:
 * - View all proposals for a job
 * - Compare proposals side-by-side
 * - Accept/reject proposals
 * - Shortlist proposals
 * - Filter and sort proposals
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * Sprint 1: Job/Proposal System
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Users,
  Filter,
  CheckCircle2,
  Star,
  FileText,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { ProposalListItem } from '@/components/domains/jobs/ProposalListItem';
import { useJobs } from '@/hooks/business/useJobs';
import { useProposals } from '@/hooks/business/proposals';
import { useProposal } from '@/hooks/business/useProposal';
import { formatCurrency } from '@/lib/shared/formatters';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';

type SortOption =
  | 'newest'
  | 'oldest'
  | 'amount_low'
  | 'amount_high'
  | 'delivery';
type FilterStatus = 'all' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export default function EmployerJobProposalsPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;

  // State
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedProposals, setSelectedProposals] = useState<string[]>([]);

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

  // Fetch job details
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

  const handleToggleSelect = useCallback((proposalId: string) => {
    setSelectedProposals((prev) =>
      prev.includes(proposalId)
        ? prev.filter((id) => id !== proposalId)
        : [...prev, proposalId]
    );
  }, []);

  const handleCompare = useCallback(() => {
    if (selectedProposals.length < 2) {
      toast.error('En az 2 teklif seçmelisiniz');
      return;
    }
    if (selectedProposals.length > 3) {
      toast.error('En fazla 3 teklif karşılaştırabilirsiniz');
      return;
    }
    // TODO: Implement comparison view
    toast.info('Karşılaştırma özelliği yakında eklenecek');
  }, [selectedProposals]);

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
          <Button onClick={() => router.push('/dashboard/jobs')}>
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
        {stats.total > 0 && (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Bekleyen</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.pending}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
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
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ortalama Teklif</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.avgBidAmount)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-600" />
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En Düşük Teklif</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats.minBidAmount)}
                  </p>
                </div>
                <TrendingDown className="h-8 w-8 text-blue-600" />
              </div>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 p-4">
              <div className="mb-4 flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Filtreler</h3>
              </div>

              {/* Status Filter */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Durum
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value as FilterStatus)
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="all">Tümü ({stats.total})</option>
                  <option value="PENDING">Bekleyen ({stats.pending})</option>
                  <option value="ACCEPTED">
                    Kabul Edilen ({stats.accepted})
                  </option>
                  <option value="REJECTED">
                    Reddedilen ({stats.rejected})
                  </option>
                  <option value="WITHDRAWN">Geri Çekilen</option>
                </select>
              </div>

              {/* Sort */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Sıralama
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="newest">En Yeni</option>
                  <option value="oldest">En Eski</option>
                  <option value="amount_low">En Düşük Fiyat</option>
                  <option value="amount_high">En Yüksek Fiyat</option>
                  <option value="delivery">En Kısa Süre</option>
                </select>
              </div>

              {/* Compare Mode */}
              {selectedProposals.length > 0 && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                  <p className="mb-2 text-sm font-medium text-blue-900">
                    {selectedProposals.length} teklif seçildi
                  </p>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={handleCompare}
                    disabled={selectedProposals.length < 2}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Karşılaştır
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 w-full"
                    onClick={() => setSelectedProposals([])}
                  >
                    Seçimi Temizle
                  </Button>
                </div>
              )}
            </Card>
          </div>

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
                      onChange={() => handleToggleSelect(proposal.id)}
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
