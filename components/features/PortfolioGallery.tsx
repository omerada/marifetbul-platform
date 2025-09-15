'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { useProfile } from '@/hooks';
import { Freelancer, PortfolioItem } from '@/types';
import { PortfolioModal } from './PortfolioModal';
import {
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  Image as ImageIcon,
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
    profile,
    addPortfolioItem,
    updatePortfolioItem,
    removePortfolioItem,
  } = useProfile();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);

  const portfolioItems =
    freelancer?.portfolio || (profile as Freelancer)?.portfolio || [];

  const handleAddItem = () => {
    setEditingItem(null);
    setShowAddModal(true);
  };

  const handleEditItem = (item: PortfolioItem) => {
    setEditingItem(item);
    setShowAddModal(true);
  };

  const handleDeleteItem = async (itemId: string) => {
    if (confirm('Bu portfolyo öğesini silmek istediğinizden emin misiniz?')) {
      try {
        await removePortfolioItem(itemId);
      } catch (error) {
        console.error('Portfolyo öğesi silinirken hata:', error);
      }
    }
  };

  if (!isOwnProfile && portfolioItems.length === 0) {
    return (
      <Card className="p-8 text-center">
        <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-medium text-gray-900">
          Henüz Portfolyo Yok
        </h3>
        <p className="text-gray-600">
          Bu freelancer henüz portfolyo öğesi eklememiş.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Portfolyo</h2>
          <p className="text-gray-600">Çalışmalarımın örnekleri</p>
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

      {/* Portfolio Grid */}
      {portfolioItems.length === 0 ? (
        <Card className="p-8 text-center">
          <ImageIcon className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="mb-2 text-lg font-medium text-gray-900">
            Portfolyo Boş
          </h3>
          <p className="mb-4 text-gray-600">
            Yeteneklerinizi sergilemek için projelerinizi ekleyin.
          </p>
          {isOwnProfile && (
            <Button onClick={handleAddItem} variant="outline">
              İlk Projenizi Ekleyin
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
              onEdit={() => handleEditItem(item)}
              onDelete={() => handleDeleteItem(item.id)}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <PortfolioModal
          item={editingItem}
          onClose={() => setShowAddModal(false)}
          onSave={async (data) => {
            try {
              if (editingItem) {
                await updatePortfolioItem(editingItem.id, data);
              } else {
                await addPortfolioItem(data);
              }
              setShowAddModal(false);
            } catch (error) {
              console.error('Portfolyo kaydedilirken hata:', error);
            }
          }}
        />
      )}
    </div>
  );
}

// Portfolio Card Component
interface PortfolioCardProps {
  item: PortfolioItem;
  isOwnProfile: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function PortfolioCard({
  item,
  isOwnProfile,
  onEdit,
  onDelete,
}: PortfolioCardProps) {
  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-lg">
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

        {/* Links */}
        <div className="flex space-x-2">
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
    </Card>
  );
}
