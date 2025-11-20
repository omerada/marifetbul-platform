/**
 * Admin Portfolio Moderation Page
 * Sprint 17: Portfolio Management System
 *
 * Admin interface for moderating user portfolios
 */

'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  Eye,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Filter,
  Image as ImageIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { usePortfolio } from '@/hooks/business/portfolio';
import { PortfolioModal } from '@/components/domains/portfolio';
import { PortfolioApprovalPanel } from '@/components/domains/admin';
import type { PortfolioResponse } from '@/lib/api/portfolio';

export const dynamic = 'force-dynamic';

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

export default function AdminPortfolioPage() {
  const { portfolios, isLoading, refreshPortfolios } = usePortfolio();

  // UI State
  const [selectedStatus, setSelectedStatus] = useState<FilterStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPortfolio, setSelectedPortfolio] =
    useState<PortfolioResponse | null>(null);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);

  // Filter portfolios
  const filteredPortfolios = useMemo(() => {
    let filtered = portfolios;

    // Status filter
    if (selectedStatus === 'PENDING') {
      filtered = filtered.filter((p) => p.status === 'PENDING');
    } else if (selectedStatus === 'APPROVED') {
      filtered = filtered.filter((p) => p.status === 'APPROVED');
    } else if (selectedStatus === 'REJECTED') {
      filtered = filtered.filter((p) => p.status === 'REJECTED');
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.userId.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [portfolios, selectedStatus, searchQuery]);

  // Stats
  const totalItems = portfolios.length;
  const pendingItems = portfolios.filter((p) => p.status === 'PENDING').length;
  const approvedItems = portfolios.filter(
    (p) => p.status === 'APPROVED'
  ).length;
  const rejectedItems = portfolios.filter(
    (p) => p.status === 'REJECTED'
  ).length;
  const totalViews = portfolios.reduce((sum, p) => sum + p.viewCount, 0);

  // Handlers
  const handleViewPortfolio = (portfolio: PortfolioResponse) => {
    setSelectedPortfolio(portfolio);
    setShowPortfolioModal(true);
  };

  const handleCloseModal = () => {
    setShowPortfolioModal(false);
    setSelectedPortfolio(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Portfolyo Moderasyonu
            </h1>
            <p className="mt-2 text-gray-600">
              Kullanıcı portfolyolarını görüntüleyin ve yönetin
            </p>
          </div>

          <Button
            variant="outline"
            onClick={refreshPortfolios}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Yenile
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Toplam Portfolyo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalItems}</div>
            <p className="text-xs text-gray-500">Sistemdeki tüm portfolyolar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Onay Bekliyor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {pendingItems}
            </div>
            <p className="text-xs text-gray-500">
              İncelenmesi gereken portfolyolar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Onaylandı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {approvedItems}
            </div>
            <p className="text-xs text-gray-500">
              {totalItems > 0
                ? Math.round((approvedItems / totalItems) * 100)
                : 0}
              % onay oranı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Reddedildi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {rejectedItems}
            </div>
            <p className="text-xs text-gray-500">Onaylanmayan portfolyolar</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6 p-6">
        <div className="space-y-4">
          {/* Status Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    selectedStatus === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'ALL'
                    ? 'Tümü'
                    : status === 'PENDING'
                      ? 'Onay Bekliyor'
                      : status === 'APPROVED'
                        ? 'Onaylandı'
                        : 'Reddedildi'}{' '}
                  (
                  {status === 'ALL'
                    ? totalItems
                    : status === 'PENDING'
                      ? pendingItems
                      : status === 'APPROVED'
                        ? approvedItems
                        : rejectedItems}
                  )
                </button>
              )
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Başlık, açıklama veya kullanıcı ID ile ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            />
          </div>
        </div>
      </Card>

      {/* Portfolio Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Görsel
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Başlık
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Kullanıcı
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Durum
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Görüntülenme
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  Tarih
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <RefreshCw className="mr-2 h-5 w-5 animate-spin text-gray-400" />
                      <span className="text-gray-600">Yükleniyor...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPortfolios.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Filter className="h-12 w-12 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          Portfolyo Bulunamadı
                        </p>
                        <p className="text-sm text-gray-600">
                          {searchQuery
                            ? 'Arama kriterlerinize uygun portfolyo bulunamadı'
                            : 'Bu durumda henüz portfolyo yok'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPortfolios.map((portfolio) => (
                  <tr
                    key={portfolio.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    {/* Image */}
                    <td className="px-4 py-4">
                      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                        {portfolio.images && portfolio.images.length > 0 ? (
                          <Image
                            src={
                              portfolio.images[0].thumbnailUrl ||
                              portfolio.images[0].imageUrl
                            }
                            alt={portfolio.title}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-gray-400" />
                        )}
                      </div>
                    </td>

                    {/* Title */}
                    <td className="px-4 py-4">
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-900">
                          {portfolio.title}
                        </p>
                        <p className="truncate text-sm text-gray-600">
                          {portfolio.description}
                        </p>
                      </div>
                    </td>

                    {/* User ID */}
                    <td className="px-4 py-4">
                      <span className="font-mono text-sm text-gray-600">
                        {portfolio.userId.slice(0, 8)}...
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      {portfolio.status === 'APPROVED' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                          <CheckCircle className="h-3 w-3" />
                          Onaylandı
                        </span>
                      ) : portfolio.status === 'REJECTED' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800">
                          <XCircle className="h-3 w-3" />
                          Reddedildi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-800">
                          <RefreshCw className="h-3 w-3" />
                          Onay Bekliyor
                        </span>
                      )}
                    </td>

                    {/* View Count */}
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900">
                        {portfolio.viewCount}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">
                        {formatDistanceToNow(new Date(portfolio.createdAt), {
                          addSuffix: true,
                          locale: tr,
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewPortfolio(portfolio)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Portfolio Detail Modal with Approval Panel */}
      {showPortfolioModal && selectedPortfolio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Portfolyo Detayı
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <PortfolioModal
                item={{
                  id: selectedPortfolio.id,
                  title: selectedPortfolio.title,
                  description: selectedPortfolio.description,
                  images: selectedPortfolio.images.map((img) => img.imageUrl),
                  skills: [],
                  url: selectedPortfolio.url,
                  completedAt: selectedPortfolio.completedAt,
                  viewCount: selectedPortfolio.viewCount,
                  createdAt: selectedPortfolio.createdAt,
                }}
                onClose={handleCloseModal}
              />

              {/* Admin Approval Panel */}
              <PortfolioApprovalPanel
                portfolioId={selectedPortfolio.id}
                onApproved={() => {
                  refreshPortfolios();
                  handleCloseModal();
                }}
                onRejected={() => {
                  refreshPortfolios();
                  handleCloseModal();
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
