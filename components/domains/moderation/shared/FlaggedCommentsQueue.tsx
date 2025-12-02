'use client';

/**
 * ================================================
 * FLAGGED COMMENTS QUEUE
 * ================================================
 * Dashboard for viewing and managing flagged comments
 * Admin/Moderator interface for content moderation
 *
 * Sprint 1: Comment Moderation UI Completion
 * Backend API: GET /api/v1/blog/admin/flagged-comments
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since December 2, 2025
 */

import React, { useState, useEffect } from 'react';
import {
  Flag,
  AlertTriangle,
  CheckCircle,
  Filter,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  getFlaggedComments,
  dismissFlag,
  FlagCategory,
  FlagStatus,
  type CommentFlag,
  type FlagFilters,
} from '@/lib/api/comment-flagging';
import { ResolveFlagModal } from './ResolveFlagModal';
import { FlaggedCommentCard } from './FlaggedCommentCard';
import { Badge } from '@/components/ui';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { PaginatedResponse } from '@/types/infrastructure/api';

// ================================================
// TYPES
// ================================================

export interface FlaggedCommentsQueueProps {
  role?: 'admin' | 'moderator';
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds
}

// ================================================
// CONSTANTS
// ================================================

const STATUS_OPTIONS: Array<{ value: FlagStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Tümü' },
  { value: FlagStatus.PENDING, label: 'Beklemede' },
  { value: FlagStatus.INVESTIGATING, label: 'İnceleniyor' },
  { value: FlagStatus.RESOLVED, label: 'Çözüldü' },
  { value: FlagStatus.DISMISSED, label: 'Reddedildi' },
];

const CATEGORY_OPTIONS: Array<{
  value: FlagCategory | 'ALL';
  label: string;
}> = [
  { value: 'ALL', label: 'Tüm Kategoriler' },
  { value: FlagCategory.SPAM, label: 'Spam' },
  { value: FlagCategory.OFFENSIVE, label: 'Saldırgan' },
  { value: FlagCategory.INAPPROPRIATE, label: 'Uygunsuz' },
  { value: FlagCategory.MISINFORMATION, label: 'Yanlış Bilgi' },
  { value: FlagCategory.HARASSMENT, label: 'Taciz' },
  { value: FlagCategory.OFF_TOPIC, label: 'Konu Dışı' },
  { value: FlagCategory.COPYRIGHT, label: 'Telif Hakkı' },
  { value: FlagCategory.OTHER, label: 'Diğer' },
];

// ================================================
// COMPONENT
// ================================================

export function FlaggedCommentsQueue({
  role = 'admin',
  autoRefresh = false,
  refreshInterval = 30000,
}: FlaggedCommentsQueueProps) {
  // ================================================
  // STATE
  // ================================================

  const [flags, setFlags] = useState<CommentFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(20);

  // Filters
  const [statusFilter, setStatusFilter] = useState<FlagStatus | 'ALL'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<FlagCategory | 'ALL'>(
    'ALL'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedFlag, setSelectedFlag] = useState<CommentFlag | null>(null);
  const [showResolveModal, setShowResolveModal] = useState(false);

  // ================================================
  // EFFECTS
  // ================================================

  // Load flagged comments
  useEffect(() => {
    void loadFlaggedComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, categoryFilter, searchQuery]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      void loadFlaggedComments(true); // Silent refresh
    }, refreshInterval);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRefresh, refreshInterval, page, statusFilter, categoryFilter]);

  // ================================================
  // HANDLERS
  // ================================================

  const loadFlaggedComments = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);

      const filters: FlagFilters = {};
      if (statusFilter !== 'ALL') filters.status = statusFilter;
      if (categoryFilter !== 'ALL') filters.category = categoryFilter;

      const response: PaginatedResponse<CommentFlag> = await getFlaggedComments(
        filters,
        page,
        pageSize
      );

      setFlags(response.data || []);
      setTotalPages(response.pagination.totalPages || 0);
      setTotalElements(response.pagination.total || 0);

      logger.info('Loaded flagged comments', {
        page,
        total: response.pagination.total,
        status: statusFilter,
        category: categoryFilter,
      });
    } catch (err) {
      setError('Flagged yorumlar yüklenemedi');
      logger.error(
        'Failed to load flagged comments',
        err instanceof Error ? err : new Error(String(err))
      );
      toast.error('Flagged yorumlar yüklenemedi');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleResolve = (flag: CommentFlag) => {
    setSelectedFlag(flag);
    setShowResolveModal(true);
  };

  const handleDismiss = async (flag: CommentFlag) => {
    try {
      await dismissFlag(flag.id, 'Geçersiz veya hatalı rapor');

      toast.success('Flag reddedildi');
      logger.info('Flag dismissed', { flagId: flag.id });

      // Reload
      loadFlaggedComments();
    } catch (err) {
      logger.error(
        'Failed to dismiss flag',
        err instanceof Error ? err : new Error(String(err)),
        { flagId: flag.id }
      );
      toast.error('Flag reddedilemedi');
    }
  };

  const handleResolved = () => {
    setShowResolveModal(false);
    setSelectedFlag(null);
    loadFlaggedComments();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(0); // Reset to first page
  };

  // ================================================
  // RENDER
  // ================================================

  // Filter summary
  const activeFiltersCount =
    (statusFilter !== 'ALL' ? 1 : 0) + (categoryFilter !== 'ALL' ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Flagged Yorumlar</h2>
          <p className="mt-1 text-sm text-gray-500">
            Kullanıcılar tarafından raporlanan yorumları inceleyin ve yönetin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="warning">
            <Flag className="mr-1 h-3 w-3" />
            {totalElements} Toplam
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="min-w-[200px] flex-1">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Yorum ara..."
                className="w-full rounded-lg border border-gray-300 py-2 pr-3 pl-10 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="min-w-[150px]">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as FlagStatus | 'ALL');
                setPage(0);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="min-w-[150px]">
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as FlagCategory | 'ALL');
                setPage(0);
              }}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Active Filters Badge */}
          {activeFiltersCount > 0 && (
            <Badge variant="default">
              <Filter className="mr-1 h-3 w-3" />
              {activeFiltersCount} Filtre
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-600" />
          <p className="mt-2 text-sm text-red-800">{error}</p>
          <button
            onClick={() => loadFlaggedComments()}
            className="mt-4 text-sm text-red-600 underline hover:text-red-700"
          >
            Tekrar Dene
          </button>
        </div>
      ) : flags.length === 0 ? (
        <div className="rounded-lg border bg-gray-50 p-12 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
          <p className="mt-2 text-sm text-gray-600">
            {activeFiltersCount > 0
              ? 'Bu filtrelere uyan flag bulunamadı'
              : 'Harika! Hiç flagged yorum yok'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {flags.map((flag) => (
            <FlaggedCommentCard
              key={flag.id}
              flag={flag}
              onResolve={() => handleResolve(flag)}
              onDismiss={() => handleDismiss(flag)}
              role={role}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border bg-white p-4">
          <div className="text-sm text-gray-600">
            Sayfa {page + 1} / {totalPages} ({totalElements} toplam)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 0}
              className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Önceki
            </button>

            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sonraki
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Resolve Flag Modal */}
      {selectedFlag && (
        <ResolveFlagModal
          flag={selectedFlag}
          isOpen={showResolveModal}
          onClose={() => {
            setShowResolveModal(false);
            setSelectedFlag(null);
          }}
          onSuccess={handleResolved}
        />
      )}
    </div>
  );
}

export default FlaggedCommentsQueue;
