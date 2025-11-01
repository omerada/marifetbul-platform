/**
 * User Portfolio Management Page
 * Sprint 17: Portfolio Management System
 *
 * Complete portfolio management interface for freelancers
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Plus, Grid3x3, List, ArrowUpDown, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { usePortfolio } from '@/hooks/business/portfolio';
import {
  PortfolioCreateModal,
  PortfolioEditModal,
  PortfolioDeleteModal,
  PortfolioCardSkeleton,
  PortfolioListSkeleton,
} from '@/components/domains/portfolio';
import type { PortfolioResponse } from '@/lib/api/portfolio';

export const dynamic = 'force-dynamic';

type ViewMode = 'grid' | 'list';

export default function PortfolioManagementPage() {
  const router = useRouter();
  const { portfolios, isLoading, refreshPortfolios } = usePortfolio();

  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPortfolio, setSelectedPortfolio] =
    useState<PortfolioResponse | null>(null);

  // Stats
  const totalItems = portfolios.length;
  const publicItems = portfolios.filter((p) => p.isPublic).length;
  const privateItems = totalItems - publicItems;
  const totalViews = portfolios.reduce((sum, p) => sum + p.viewCount, 0);

  // Handlers
  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleEdit = (portfolio: PortfolioResponse) => {
    setSelectedPortfolio(portfolio);
    setShowEditModal(true);
  };

  const handleDelete = (portfolio: PortfolioResponse) => {
    setSelectedPortfolio(portfolio);
    setShowDeleteModal(true);
  };

  const handleReorder = () => {
    router.push('/dashboard/portfolio/reorder');
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    refreshPortfolios();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedPortfolio(null);
    refreshPortfolios();
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    setSelectedPortfolio(null);
    refreshPortfolios();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Portfolyo Yönetimi
            </h1>
            <p className="mt-2 text-gray-600">
              Çalışmalarınızı sergileyin ve potansiyel müşterilere gösterin
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={handleReorder}
              disabled={totalItems < 2}
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sırala
            </Button>
            <Button variant="primary" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Portfolyo
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Toplam Öğe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalItems}</div>
            <p className="text-xs text-gray-500">
              {publicItems} herkese açık, {privateItems} özel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Herkese Açık
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {publicItems}
            </div>
            <p className="text-xs text-gray-500">
              {totalItems > 0
                ? Math.round((publicItems / totalItems) * 100)
                : 0}
              % portfolyonuz görünür
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Özel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {privateItems}
            </div>
            <p className="text-xs text-gray-500">Sadece sizin görebildiğiniz</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Toplam Görüntülenme
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalViews}</div>
            <p className="text-xs text-gray-500">
              {totalItems > 0 ? Math.round(totalViews / totalItems) : 0} ort.
              görüntülenme
            </p>
          </CardContent>
        </Card>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">
          Portfolyo Öğeleri
        </h2>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3x3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Portfolio Grid/List */}
      {isLoading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <PortfolioCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <PortfolioListSkeleton />
        )
      ) : portfolios.length === 0 ? (
        <Card className="p-12">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <Grid3x3 className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="mb-2 text-xl font-semibold text-gray-900">
              Henüz portfolyo öğeniz yok
            </h3>
            <p className="mb-6 text-gray-600">
              İlk portfolyo öğenizi oluşturun ve çalışmalarınızı sergileyin
            </p>
            <Button variant="primary" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              İlk Portfolyo Öğenizi Oluşturun
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {portfolios.map((portfolio) => (
            <Card key={portfolio.id} className="overflow-hidden">
              <div className="relative aspect-video bg-gray-100">
                {portfolio.images && portfolio.images.length > 0 ? (
                  <Image
                    src={
                      portfolio.images[0].thumbnailUrl ||
                      portfolio.images[0].imageUrl
                    }
                    alt={portfolio.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Grid3x3 className="h-12 w-12 text-gray-400" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <h3 className="mb-2 font-semibold text-gray-900">
                  {portfolio.title}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                  {portfolio.description}
                </p>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium ${portfolio.isPublic ? 'text-green-600' : 'text-orange-600'}`}
                  >
                    {portfolio.isPublic ? '🌍 Herkese Açık' : '🔒 Özel'}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(portfolio)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(portfolio)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <PortfolioCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {showEditModal && selectedPortfolio && (
        <PortfolioEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedPortfolio(null);
          }}
          portfolio={selectedPortfolio}
          onSuccess={handleEditSuccess}
        />
      )}

      {showDeleteModal && selectedPortfolio && (
        <PortfolioDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedPortfolio(null);
          }}
          portfolio={selectedPortfolio}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </div>
  );
}
