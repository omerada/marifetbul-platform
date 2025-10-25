'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  FileText,
  Send,
  Clock,
  CheckCircle2,
  XCircle,
  Ban,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useFreelancerProposals } from '@/hooks/business/useFreelancerProposals';
import { FreelancerProposalCard } from '@/components/domains/proposals/FreelancerProposalCard';
import type { ProposalStatus } from '@/hooks/business/useFreelancerProposals';

export default function FreelancerProposalsPage() {
  const [activeTab, setActiveTab] = useState<ProposalStatus>(null);

  const {
    proposals,
    stats,
    isLoading,
    error,
    pagination,
    setPage,
    setStatus,
    withdrawProposal,
  } = useFreelancerProposals({ status: activeTab });

  const handleTabChange = (status: ProposalStatus) => {
    setActiveTab(status);
    setStatus(status);
  };

  const handleWithdraw = async (proposalId: string) => {
    if (window.confirm('Bu teklifi geri çekmek istediğinizden emin misiniz?')) {
      try {
        await withdrawProposal(proposalId);
      } catch {
        // Error handled in hook
      }
    }
  };

  const tabs = [
    {
      id: null,
      label: 'Tümü',
      count: stats?.total || 0,
      icon: FileText,
    },
    {
      id: 'PENDING' as const,
      label: 'Beklemede',
      count: stats?.pending || 0,
      icon: Clock,
      color: 'text-yellow-600',
    },
    {
      id: 'ACCEPTED' as const,
      label: 'Kabul Edildi',
      count: stats?.accepted || 0,
      icon: CheckCircle2,
      color: 'text-green-600',
    },
    {
      id: 'REJECTED' as const,
      label: 'Reddedildi',
      count: stats?.rejected || 0,
      icon: XCircle,
      color: 'text-red-600',
    },
    {
      id: 'WITHDRAWN' as const,
      label: 'Geri Çekildi',
      count: stats?.withdrawn || 0,
      icon: Ban,
      color: 'text-gray-600',
    },
  ];

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tekliflerim</h1>
          <p className="mt-1 text-gray-600">
            Gönderdiğiniz teklifleri takip edin
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Proposals */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Toplam Teklif</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats?.total || 0}
              </p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3">
              <Send className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Pending */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Beklemede</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats?.pending || 0}
              </p>
            </div>
            <div className="rounded-lg bg-yellow-100 p-3">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        {/* Accepted */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kabul Edildi</p>
              <p className="text-2xl font-bold text-green-600">
                {stats?.accepted || 0}
              </p>
            </div>
            <div className="rounded-lg bg-green-100 p-3">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        {/* Acceptance Rate */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Kabul Oranı</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats?.acceptanceRate || 0}%
              </p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3">
              <FileText className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Card className="p-1">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id || 'all'}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                } `}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? 'text-blue-600' : tab.color || 'text-gray-500'}`}
                />
                <span>{tab.label}</span>
                <span
                  className={`ml-1 rounded-full px-2 py-0.5 text-xs font-semibold ${isActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'} `}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50 p-6">
          <div className="flex items-center text-red-800">
            <AlertCircle className="mr-3 h-5 w-5" />
            <div>
              <h3 className="font-semibold">Bir hata oluştu</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Teklifler yükleniyor...</span>
        </div>
      )}

      {/* Proposals List */}
      {!isLoading && !error && (
        <>
          {proposals.length > 0 ? (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <FreelancerProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  onWithdraw={handleWithdraw}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {activeTab
                  ? 'Bu kategoride teklif yok'
                  : 'Henüz teklifiniz yok'}
              </h3>
              <p className="mt-2 text-gray-500">
                {activeTab
                  ? 'Farklı bir kategori seçerek tekliflerinizi görüntüleyebilirsiniz'
                  : 'İş ilanlarına teklif göndererek işe başlayın'}
              </p>
              {!activeTab && (
                <Link href="/marketplace/jobs">
                  <Button className="mt-4">İş İlanlarına Göz At</Button>
                </Link>
              )}
            </Card>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Sayfa {pagination.page + 1} / {pagination.totalPages}
                  {' • '}
                  Toplam {pagination.totalElements} teklif
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(pagination.page - 1)}
                    disabled={pagination.page === 0}
                  >
                    Önceki
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages - 1}
                  >
                    Sonraki
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
