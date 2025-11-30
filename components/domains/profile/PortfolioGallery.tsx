'use client';

import React, { useEffect } from 'react';
import { Card } from '@/components/ui';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Freelancer, PortfolioItem } from '@/types';
import { PortfolioModal } from './PortfolioModal';
import { PortfolioAnalytics } from './PortfolioAnalytics';
import { PortfolioShare } from './PortfolioShare';
import { usePortfolioStore } from '@/stores/portfolioStore';
import logger from '@/lib/infrastructure/monitoring/logger';
import {
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  Image as ImageIcon,
  Loader2,
  Eye,
} from 'lucide-react';

interface PortfolioGalleryProps {
  freelancer?: Freelancer;
  isOwnProfile?: boolean;
}

export function PortfolioGallery({
  freelancer,
  isOwnProfile = false,
}: PortfolioGalleryProps) {
  const {
    myPortfolios,
    portfolios,
    ui,
    fetchMyPortfolios,
    fetchUserPortfolios,
    deletePortfolio,
    reorderPortfolios,
    setCreateModalOpen,
    setEditModalOpen,
    setDeleteConfirmOpen,
  } = usePortfolioStore();
  const userId = freelancer?.id;
  const [draggedItemId, setDraggedItemId] = React.useState<string | null>(null);

  useEffect(() => {
    if (isOwnProfile) {
      fetchMyPortfolios().catch((error) =>
        logger.error('Failed to fetch my portfolios', error instanceof Error ? error : new Error(String(error)))
      );
    } else if (userId) {
      fetchUserPortfolios(userId).catch((error) =>
        logger.error('Failed to fetch user portfolios', error instanceof Error ? error : new Error(String(error)))
      );
    }
  }, [isOwnProfile, userId, fetchMyPortfolios, fetchUserPortfolios]);

  const portfolioItems = isOwnProfile ? myPortfolios : portfolios;

  if (ui.isLoading && portfolioItems.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-blue-600" />
        <p className="text-gray-600">Portf?y y?kleniyor...</p>
      </Card>
    );
  }

  if (ui.error) {
    return (
      <Card className="border-red-200 bg-red-50 p-8 text-center">
        <p className="text-red-600">{ui.error}</p>
        <Button
          variant="outline"
          onClick={() =>
            isOwnProfile
              ? fetchMyPortfolios()
              : userId && fetchUserPortfolios(userId)
          }
          className="mt-4"
        >
          Tekrar Dene
        </Button>
      </Card>
    );
  }

  if (!isOwnProfile && portfolioItems.length === 0) {
    return (
      <Card className="p-8 text-center">
        <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Henüz Portfolyo Yok
        </h3>
        <p className="text-gray-600">
          Bu freelancer henüz portfolyo öðesi eklememiþ.
        </p>
      </Card>
    );
  }

  const handleAddItem = () => {
    setEditModalOpen(false, null);
    setCreateModalOpen(true);
  };

  const handleEditItem = (item: PortfolioItem) => {
    setEditModalOpen(true, item);
  };

  const handleDeleteItem = (itemId: string) => {
    setDeleteConfirmOpen(true, itemId);
  };

  const confirmDelete = async () => {
    if (ui.portfolioToDelete) {
      try {
        await deletePortfolio(ui.portfolioToDelete);
      } catch (error) {
        logger.error(
          'Portfolio deletion failed', error instanceof Error ? error : new Error(String(error)));
      }
    }
  };

  // Drag & Drop Handlers for Portfolio Grid
  const handlePortfolioDragStart = (itemId: string) => {
    setDraggedItemId(itemId);
  };

  const handlePortfolioDragOver = async (
    e: React.DragEvent,
    targetItemId: string
  ) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === targetItemId || !isOwnProfile)
      return;

    const currentIndex = portfolioItems.findIndex(
      (item) => item.id === draggedItemId
    );
    const targetIndex = portfolioItems.findIndex(
      (item) => item.id === targetItemId
    );

    if (currentIndex === -1 || targetIndex === -1) return;

    // Create new order array
    const reorderedItems = [...portfolioItems];
    const [draggedItem] = reorderedItems.splice(currentIndex, 1);
    reorderedItems.splice(targetIndex, 0, draggedItem);

    // Extract IDs in new order
    const newOrderIds = reorderedItems.map((item) => item.id);

    try {
      await reorderPortfolios(newOrderIds);
      setDraggedItemId(targetItemId); // Update dragged position
    } catch (error) {
      logger.error('Portfolio reorder failed', error instanceof Error ? error : new Error(String(error)));
    }
  };

  const handlePortfolioDragEnd = () => {
    setDraggedItemId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Portfolyo</h2>
          <p className="text-gray-600">Çalýþmalarýmýn örnekleri</p>
        </div>
        {isOwnProfile && (
          <Button
            onClick={handleAddItem}
            className="flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Proje Ekle</span>
          </Button>
        )}
      </div>

      {/* Analytics Dashboard - Only for own profile with portfolios */}
      {isOwnProfile && portfolioItems.length > 0 && (
        <PortfolioAnalytics portfolios={portfolioItems} />
      )}

      {/* Portfolio Grid */}
      {portfolioItems.length === 0 ? (
        <Card className="p-8 text-center">
          <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Portfolyo Boþ
          </h3>
          <p className="mb-4 text-gray-600">
            Yeteneklerinizi sergilemek için projelerinizi ekleyin.
          </p>
          {isOwnProfile && (
            <Button onClick={handleAddItem} variant="outline">
              Ýlk Projenizi Ekleyin
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {portfolioItems.map((item) => (
            <PortfolioCard
              key={item.id}
              item={item}
              isOwnProfile={isOwnProfile}
              userId={userId}
              onEdit={() => handleEditItem(item)}
              onDelete={() => handleDeleteItem(item.id)}
              isDraggable={isOwnProfile}
              isDragging={draggedItemId === item.id}
              onDragStart={() => handlePortfolioDragStart(item.id)}
              onDragOver={(e) => handlePortfolioDragOver(e, item.id)}
              onDragEnd={handlePortfolioDragEnd}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {(ui.createModalOpen || ui.editModalOpen) && (
        <PortfolioModal
          item={ui.selectedPortfolio}
          onClose={() => {
            setCreateModalOpen(false);
            setEditModalOpen(false, null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {ui.deleteConfirmOpen && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <Card className="mx-4 w-full max-w-md p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">
              Portföy Öðesini Sil
            </h3>
            <p className="mb-6 text-gray-600">
              Bu portföy öðesini silmek istediðinizden emin misiniz? Bu iþlem
              geri alýnamaz.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false, null)}
                disabled={ui.isSubmitting}
              >
                Ýptal
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={ui.isSubmitting}
              >
                {ui.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Siliniyor...
                  </>
                ) : (
                  'Sil'
                )}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// Portfolio Card Component
interface PortfolioCardProps {
  item: PortfolioItem;
  isOwnProfile: boolean;
  userId?: string;
  onEdit: () => void;
  onDelete: () => void;
  isDraggable?: boolean;
  isDragging?: boolean;
  onDragStart?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnd?: () => void;
}

function PortfolioCard({
  item,
  isOwnProfile,
  userId,
  onEdit,
  onDelete,
  isDraggable = false,
  isDragging = false,
  onDragStart,
  onDragOver,
  onDragEnd,
}: PortfolioCardProps) {
  return (
    <Card
      className={`overflow-hidden transition-all ${
        isDraggable ? 'cursor-move' : ''
      } ${
        isDragging
          ? 'scale-95 opacity-50'
          : 'hover:scale-[1.02] hover:shadow-lg'
      }`}
      draggable={isDraggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      {/* Drag Indicator */}
      {isDraggable && !isDragging && (
        <div className="absolute top-2 left-2 z-10 rounded-lg bg-gray-800/70 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          ?? Sürükle
        </div>
      )}

      {/* Image */}
      <div className="group relative aspect-video bg-gray-200">
        {item.images && item.images.length > 0 ? (
          <div
            className="h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${item.images[0]})` }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Hover Actions */}
        {isOwnProfile && (
          <div className="absolute top-2 right-2 flex space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={onEdit}
              className="rounded-full bg-blue-600 p-2 text-white transition-colors hover:bg-blue-700"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={onDelete}
              className="rounded-full bg-red-600 p-2 text-white transition-colors hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900">
          {item.title}
        </h3>
        <p className="mb-3 line-clamp-3 text-sm text-gray-600">
          {item.description}
        </p>

        {/* Technologies */}
        {item.skills && item.skills.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {item.skills.slice(0, 3).map((skill: string, index: number) => (
              <span
                key={index}
                className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800"
              >
                {skill}
              </span>
            ))}
            {item.skills.length > 3 && (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                +{item.skills.length - 3} daha
              </span>
            )}
          </div>
        )}

        {/* Stats, Share & Links */}
        <div className="flex items-center justify-between">
          {/* View Count - only show if available and > 0 */}
          {item.viewCount !== undefined && item.viewCount > 0 && (
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Eye className="h-4 w-4" />
              <span>{item.viewCount}</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Share Button */}
            <PortfolioShare portfolio={item} userId={userId} />

            {/* External Link */}
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Proje</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
