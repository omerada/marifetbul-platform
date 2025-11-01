/**
 * ================================================
 * MODERATION QUEUE COMPONENT
 * ================================================
 * Displays pending moderation items in a filterable queue
 *
 * Sprint: Moderator System Completion - Day 1
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @updated November 1, 2025
 */

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  AlertCircle,
  Clock,
  Filter,
  Search,
  ExternalLink,
  Flag,
  MessageSquare,
  Star,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Loading } from '@/components/ui/loading';
import type {
  PendingItem,
  PendingItemType,
  Priority,
} from '@/types/business/moderation';
import { logger } from '@/lib/shared/utils/logger';

// ============================================================================
// TYPES
// ============================================================================

interface ModerationQueueProps {
  items: PendingItem[];
  isLoading?: boolean;
  selectedItems?: string[];
  onItemSelect?: (itemId: string) => void;
  onSelectAll?: () => void;
  onApprove?: (itemId: string) => Promise<void>;
  onReject?: (itemId: string) => Promise<void>;
  onBulkAction?: (
    action: 'approve' | 'reject' | 'spam',
    itemIds: string[]
  ) => Promise<void>;
  className?: string;
}

interface FilterState {
  search: string;
  type: PendingItemType | 'ALL';
  priority: Priority | 'ALL';
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getItemTypeIcon = (type: PendingItemType) => {
  switch (type) {
    case 'COMMENT':
      return <MessageSquare className="h-4 w-4" />;
    case 'REVIEW':
      return <Star className="h-4 w-4" />;
    case 'REPORT':
      return <Flag className="h-4 w-4" />;
    case 'SUPPORT_TICKET':
      return <AlertCircle className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getItemTypeLabel = (type: PendingItemType): string => {
  const labels: Record<PendingItemType, string> = {
    COMMENT: 'Yorum',
    REVIEW: 'Değerlendirme',
    REPORT: 'Şikayet',
    SUPPORT_TICKET: 'Destek Talebi',
    PACKAGE_APPROVAL: 'Paket Onayı',
    USER_VERIFICATION: 'Kullanıcı Doğrulama',
  };
  return labels[type] || type;
};

const getPriorityColor = (priority: Priority): string => {
  const colors: Record<Priority, string> = {
    HIGH: 'bg-red-100 text-red-700 border-red-200',
    MEDIUM: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    LOW: 'bg-gray-100 text-gray-700 border-gray-200',
  };
  return colors[priority] || colors.LOW;
};

const getPriorityLabel = (priority: Priority): string => {
  const labels: Record<Priority, string> = {
    HIGH: 'Yüksek',
    MEDIUM: 'Orta',
    LOW: 'Düşük',
  };
  return labels[priority] || priority;
};

// ============================================================================
// COMPONENT
// ============================================================================

export function ModerationQueue({
  items,
  isLoading = false,
  selectedItems = [],
  onItemSelect,
  onSelectAll,
  onApprove,
  onReject,
  onBulkAction,
  className = '',
}: ModerationQueueProps) {
  // State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    type: 'ALL',
    priority: 'ALL',
  });
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {}
  );

  // Filtered items
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.content.toLowerCase().includes(searchLower) ||
          item.authorName.toLowerCase().includes(searchLower) ||
          item.relatedEntity.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (filters.type !== 'ALL') {
      result = result.filter((item) => item.itemType === filters.type);
    }

    // Priority filter
    if (filters.priority !== 'ALL') {
      result = result.filter((item) => item.priority === filters.priority);
    }

    return result;
  }, [items, filters]);

  // All selected check
  const allSelected =
    filteredItems.length > 0 &&
    filteredItems.every((item) => selectedItems.includes(item.itemId));

  // Handle quick action
  const handleQuickAction = async (
    action: 'approve' | 'reject',
    itemId: string
  ) => {
    if (actionLoading[itemId]) return;

    try {
      setActionLoading((prev) => ({ ...prev, [itemId]: true }));

      if (action === 'approve' && onApprove) {
        await onApprove(itemId);
      } else if (action === 'reject' && onReject) {
        await onReject(itemId);
      }

      logger.info(`Quick ${action} successful for item: ${itemId}`);
    } catch (error) {
      logger.error(`Quick ${action} failed for item: ${itemId}`, error);
    } finally {
      setActionLoading((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="py-12">
          <Loading variant="spinner" size="lg" text="İçerikler yükleniyor..." />
        </CardContent>
      </Card>
    );
  }

  // Render empty state
  if (items.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <p className="mt-4 text-lg font-medium text-gray-900">
            Tüm moderasyon görevleri tamamlandı!
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Bekleyen içerik bulunmuyor.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Moderasyon Kuyruğu
            <Badge variant="secondary">{filteredItems.length} İçerik</Badge>
          </CardTitle>

          {/* Bulk Actions */}
          {selectedItems.length > 0 && onBulkAction && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {selectedItems.length} seçili
              </span>
              <Button
                size="sm"
                variant="success"
                onClick={() => onBulkAction('approve', selectedItems)}
              >
                <CheckCircle className="mr-1 h-4 w-4" />
                Toplu Onayla
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onBulkAction('reject', selectedItems)}
              >
                <XCircle className="mr-1 h-4 w-4" />
                Toplu Reddet
              </Button>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="İçerik, yazar veya ilgili alan ara..."
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <Select
            value={filters.type}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                type: value as PendingItemType | 'ALL',
              }))
            }
          >
            <SelectTrigger placeholder="İçerik Türü" />
            <SelectContent>
              <SelectItem value="ALL">Tümü</SelectItem>
              <SelectItem value="COMMENT">Yorumlar</SelectItem>
              <SelectItem value="REVIEW">Değerlendirmeler</SelectItem>
              <SelectItem value="REPORT">Şikayetler</SelectItem>
              <SelectItem value="SUPPORT_TICKET">Destek Talepleri</SelectItem>
            </SelectContent>
          </Select>

          {/* Priority Filter */}
          <Select
            value={filters.priority}
            onValueChange={(value) =>
              setFilters((prev) => ({
                ...prev,
                priority: value as Priority | 'ALL',
              }))
            }
          >
            <SelectTrigger placeholder="Öncelik" />
            <SelectContent>
              <SelectItem value="ALL">Tümü</SelectItem>
              <SelectItem value="HIGH">Yüksek</SelectItem>
              <SelectItem value="MEDIUM">Orta</SelectItem>
              <SelectItem value="LOW">Düşük</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {/* Select All */}
        {onSelectAll && (
          <div className="mb-4 flex items-center gap-2 border-b border-gray-200 pb-3">
            <Checkbox
              checked={allSelected}
              onChange={onSelectAll}
              id="select-all"
              label="Tümünü Seç"
            />
            <span className="text-sm text-gray-600">
              ({filteredItems.length})
            </span>
          </div>
        )}

        {/* Queue Items */}
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.itemId}
              className="group relative rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                {onItemSelect && (
                  <Checkbox
                    checked={selectedItems.includes(item.itemId)}
                    onChange={() => onItemSelect(item.itemId)}
                    className="mt-1"
                  />
                )}

                {/* Content */}
                <div className="min-w-0 flex-1">
                  {/* Header */}
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      {getItemTypeIcon(item.itemType)}
                      <span className="text-xs font-medium">
                        {getItemTypeLabel(item.itemType)}
                      </span>
                    </div>
                    <Badge className={getPriorityColor(item.priority)}>
                      {getPriorityLabel(item.priority)}
                    </Badge>
                    {item.flagCount && item.flagCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="flex items-center gap-1"
                      >
                        <Flag className="h-3 w-3" />
                        {item.flagCount} İşaretleme
                      </Badge>
                    )}
                    <div className="ml-auto flex items-center gap-1.5 text-xs text-gray-500">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                        locale: tr,
                      })}
                    </div>
                  </div>

                  {/* Content Preview */}
                  <p className="mb-2 line-clamp-2 text-sm text-gray-900">
                    {item.content}
                  </p>

                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>
                      <strong>Yazar:</strong> {item.authorName}
                    </span>
                    <span>
                      <strong>İlgili:</strong> {item.relatedEntity}
                    </span>
                    {item.flagReasons && item.flagReasons.length > 0 && (
                      <span className="text-red-600">
                        <strong>Sebepler:</strong> {item.flagReasons.join(', ')}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <Link href={item.reviewUrl} target="_blank">
                    <Button size="sm" variant="outline" className="w-full">
                      <ExternalLink className="mr-1 h-4 w-4" />
                      Görüntüle
                    </Button>
                  </Link>
                  {onApprove && (
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleQuickAction('approve', item.itemId)}
                      disabled={actionLoading[item.itemId]}
                      className="w-full"
                    >
                      {actionLoading[item.itemId] ? (
                        <Loading variant="spinner" size="sm" />
                      ) : (
                        <>
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Onayla
                        </>
                      )}
                    </Button>
                  )}
                  {onReject && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleQuickAction('reject', item.itemId)}
                      disabled={actionLoading[item.itemId]}
                      className="w-full"
                    >
                      {actionLoading[item.itemId] ? (
                        <Loading variant="spinner" size="sm" />
                      ) : (
                        <>
                          <XCircle className="mr-1 h-4 w-4" />
                          Reddet
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredItems.length === 0 && items.length > 0 && (
          <div className="py-12 text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-lg font-medium text-gray-900">
              Filtre sonucu bulunamadı
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Farklı filtreler deneyin veya aramayı temizleyin.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() =>
                setFilters({ search: '', type: 'ALL', priority: 'ALL' })
              }
            >
              Filtreleri Temizle
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ModerationQueue;
