'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { ProposalCard } from '@/components/domains/jobs/ProposalCard';
import {
  ProposalDetailModal,
  ProposalComparisonView,
} from '@/components/domains/proposals';
import { useProposal } from '@/hooks/business';
import { Loading } from '@/components/ui';
import {
  FileText,
  Check,
  X,
  Clock,
  Filter,
  ArrowUpDown,
  GitCompare,
} from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import type { Proposal } from '@/types/core/jobs';

type ProposalWithViewStatus = Proposal & { isViewed?: boolean };
type SortOption = 'date' | 'budget-low' | 'budget-high' | 'rating';
type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected';

function EmployerProposalsContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId');

  const [proposals, setProposals] = useState<ProposalWithViewStatus[]>([]);
  const [filteredProposals, setFilteredProposals] = useState<
    ProposalWithViewStatus[]
  >([]);
  const [jobTitle, setJobTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI State
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedProposal, setSelectedProposal] =
    useState<ProposalWithViewStatus | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>(
    []
  );

  const {
    acceptProposal,
    rejectProposal,
    isLoading: isActionLoading,
  } = useProposal({
    onSuccess: () => {
      loadProposals();
      setShowDetailModal(false);
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

      // Fetch job details and proposals in parallel
      const [jobResponse, proposalsResponse] = await Promise.all([
        fetch(`/api/v1/jobs/${jobId}`, {
          credentials: 'include',
        }),
        fetch(`/api/v1/jobs/${jobId}/proposals`, {
          credentials: 'include',
        }),
      ]);

      if (!proposalsResponse.ok) {
        throw new Error('Teklifler yüklenemedi');
      }

      const proposalsData = await proposalsResponse.json();
      setProposals(proposalsData.data?.content || proposalsData.data || []);

      // Set job title if available
      if (jobResponse.ok) {
        const jobData = await jobResponse.json();
        setJobTitle(jobData.data?.title || '');
      }
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

  // Filter and sort proposals
  useEffect(() => {
    let result = [...proposals];

    // Filter by status
    if (filterStatus !== 'all') {
      result = result.filter((p) => p.status === filterStatus);
    }

    // Sort
    switch (sortBy) {
      case 'date':
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'budget-low':
        result.sort(
          (a, b) => (a.proposedBudget || 0) - (b.proposedBudget || 0)
        );
        break;
      case 'budget-high':
        result.sort(
          (a, b) => (b.proposedBudget || 0) - (a.proposedBudget || 0)
        );
        break;
      case 'rating':
        result.sort(
          (a, b) => (b.freelancer.rating || 0) - (a.freelancer.rating || 0)
        );
        break;
    }

    setFilteredProposals(result);
  }, [proposals, filterStatus, sortBy]);

  const handleProposalClick = (proposal: ProposalWithViewStatus) => {
    setSelectedProposal(proposal);
    setShowDetailModal(true);
  };

  const handleComparisonToggle = (proposalId: string) => {
    setSelectedForComparison((prev) => {
      if (prev.includes(proposalId)) {
        return prev.filter((id) => id !== proposalId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      return [...prev, proposalId];
    });
  };

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

  const comparisonProposals = proposals.filter((p) =>
    selectedForComparison.includes(p.id)
  );

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alınan Teklifler</h1>
          <p className="mt-1 text-gray-600">
            {jobId
              ? jobTitle || 'İş ilanınıza gelen teklifleri değerlendirin'
              : 'Bir iş ilanı seçerek teklifleri görüntüleyin'}
          </p>
        </div>
        {proposals.length > 0 && (
          <div className="flex space-x-2">
            <Button
              variant={comparisonMode ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                setComparisonMode(!comparisonMode);
                if (comparisonMode) {
                  setSelectedForComparison([]);
                }
              }}
            >
              <GitCompare className="mr-2 h-4 w-4" />
              Karşılaştır
              {selectedForComparison.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedForComparison.length}
                </Badge>
              )}
            </Button>
          </div>
        )}
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

      {/* Filters & Sort */}
      {proposals.length > 0 && (
        <Card className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Durum:</span>
              <div className="flex space-x-2">
                {(
                  ['all', 'pending', 'accepted', 'rejected'] as FilterStatus[]
                ).map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                  >
                    {status === 'all' && 'Tümü'}
                    {status === 'pending' && 'Bekleyen'}
                    {status === 'accepted' && 'Kabul Edilen'}
                    {status === 'rejected' && 'Reddedilen'}
                  </Button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="ml-auto flex items-center space-x-2">
              <ArrowUpDown className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Sırala:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="date">Tarihe Göre</option>
                <option value="budget-low">
                  Fiyata Göre (Düşükten Yükseğe)
                </option>
                <option value="budget-high">
                  Fiyata Göre (Yüksekten Düşüğe)
                </option>
                <option value="rating">Değerlendirmeye Göre</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Comparison Mode Notice */}
      {comparisonMode && (
        <Card className="border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <GitCompare className="mr-2 h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  Karşılaştırma Modu Aktif
                </p>
                <p className="mt-1 text-xs text-blue-700">
                  Karşılaştırmak için en fazla 3 teklif seçin (
                  {selectedForComparison.length}/3)
                </p>
              </div>
            </div>
            {selectedForComparison.length >= 2 &&
              comparisonProposals.length >= 2 && (
                <ProposalComparisonView
                  proposals={comparisonProposals}
                  onClose={() => {
                    setComparisonMode(false);
                    setSelectedForComparison([]);
                  }}
                  onSelect={(proposalId) => {
                    const proposal = proposals.find((p) => p.id === proposalId);
                    if (proposal) {
                      handleProposalClick(proposal);
                    }
                    setComparisonMode(false);
                    setSelectedForComparison([]);
                  }}
                />
              )}
          </div>
        </Card>
      )}

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
      ) : filteredProposals.length === 0 ? (
        <Card className="p-8 text-center">
          <FileText className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            {filterStatus === 'all' ? 'Henüz teklif yok' : 'Teklif bulunamadı'}
          </h3>
          <p className="mt-2 text-gray-500">
            {filterStatus === 'all'
              ? 'Bu iş ilanına henüz teklif gelmedi.'
              : 'Bu filtreye uygun teklif bulunamadı.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProposals.map((proposal) => (
            <div key={proposal.id} className="relative">
              {comparisonMode && (
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectedForComparison.includes(proposal.id)}
                    onChange={() => handleComparisonToggle(proposal.id)}
                    disabled={
                      !selectedForComparison.includes(proposal.id) &&
                      selectedForComparison.length >= 3
                    }
                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              )}
              <div
                className={`cursor-pointer transition-all ${
                  comparisonMode ? 'pl-12' : ''
                } ${selectedForComparison.includes(proposal.id) ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => !comparisonMode && handleProposalClick(proposal)}
              >
                <ProposalCard
                  proposal={proposal}
                  jobTitle={jobTitle}
                  onAccept={() => handleAccept(proposal.id)}
                  onReject={() => handleReject(proposal.id)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedProposal && (
        <ProposalDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedProposal(null);
          }}
          proposal={selectedProposal}
          jobTitle={jobTitle}
          onAccept={() => handleAccept(selectedProposal.id)}
          onReject={() => handleReject(selectedProposal.id)}
          isLoading={isActionLoading}
        />
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

export default function EmployerProposalsPage() {
  return (
    <Suspense fallback={<Loading size="lg" text="Teklifler yükleniyor..." />}>
      <EmployerProposalsContent />
    </Suspense>
  );
}
