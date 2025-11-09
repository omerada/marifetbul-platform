'use client';

/**
 * Portfolio Reorder List Component
 * Sprint 1: Story 2 - Portfolio Reordering with DnD
 *
 * Drag-and-drop sortable list for reordering portfolio items
 */

'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X, Save } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui/Card';
import { usePortfolioReorder } from '@/hooks/business/portfolio/usePortfolioReorder';
import type { PortfolioResponse } from '@/lib/api/portfolio';

// ============================================================================
// SORTABLE ITEM COMPONENT
// ============================================================================

interface SortableItemProps {
  portfolio: PortfolioResponse;
}

function SortableItem({ portfolio }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: portfolio.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border bg-white p-3 ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500' : 'shadow-sm'
      }`}
    >
      {/* Drag Handle */}
      <button
        className="cursor-grab touch-none text-gray-400 hover:text-gray-600 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Portfolio Thumbnail */}
      {portfolio.images && portfolio.images.length > 0 && (
        <div className="relative h-12 w-12 overflow-hidden rounded">
          <Image
            src={
              portfolio.images[0].thumbnailUrl || portfolio.images[0].imageUrl
            }
            alt={portfolio.title}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      )}

      {/* Portfolio Info */}
      <div className="min-w-0 flex-1">
        <h4 className="truncate font-medium text-gray-900">
          {portfolio.title}
        </h4>
        <p className="truncate text-sm text-gray-500">
          {portfolio.description}
        </p>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        {portfolio.images && portfolio.images.length > 0 && (
          <span>{portfolio.images.length} görsel</span>
        )}
        {portfolio.viewCount > 0 && (
          <>
            <span>•</span>
            <span>{portfolio.viewCount} görüntülenme</span>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface PortfolioReorderListProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  portfolios: PortfolioResponse[];
}

export function PortfolioReorderList({
  isOpen,
  onClose,
  onSuccess,
  portfolios,
}: PortfolioReorderListProps) {
  const {
    orderedItems,
    reorderItems,
    saveOrder,
    resetOrder,
    hasChanges,
    isSaving,
  } = usePortfolioReorder(portfolios);

  // Update internal state when portfolios prop changes
  useEffect(() => {
    reorderItems(portfolios);
  }, [portfolios, reorderItems]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = orderedItems.findIndex((item) => item.id === active.id);
      const newIndex = orderedItems.findIndex((item) => item.id === over.id);

      const newOrder = arrayMove(orderedItems, oldIndex, newIndex);
      reorderItems(newOrder);
    }
  };

  // Handle save
  const handleSave = async () => {
    const success = await saveOrder();
    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (hasChanges) {
      resetOrder();
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <h2 className="text-xl font-semibold">Portfolio Sıralaması</h2>
            <p className="mt-1 text-sm text-gray-500">
              Sürükle-bırak ile portfolyolarınızı sıralayın
            </p>
          </div>
          <button
            onClick={handleCancel}
            disabled={isSaving}
            className="rounded-full p-1 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {orderedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-gray-500">Portfolio bulunamadı</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={orderedItems.map((item) => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {orderedItems.map((portfolio) => (
                    <SortableItem key={portfolio.id} portfolio={portfolio} />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t bg-gray-50 p-4">
          <div className="text-sm text-gray-600">
            {hasChanges ? (
              <span className="font-medium text-orange-600">
                ⚠️ Kaydedilmemiş değişiklikler var
              </span>
            ) : (
              <span>Toplam {orderedItems.length} portfolio</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isSaving}
            >
              İptal
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || isSaving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Sıralamayı Kaydet
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default PortfolioReorderList;
