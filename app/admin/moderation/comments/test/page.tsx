/**
 * ================================================
 * BULK COMMENT MODERATION TEST PAGE
 * ================================================
 * Test page for new bulk action components
 * Sprint 1 - EPIC 2.1: Bulk Comment Actions
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { CommentListWithBulkActions } from '@/components/domains/admin';
import { UnifiedErrorBoundary } from '@/components/ui';
import { apiClient } from '@/lib/api';
import { BLOG_ENDPOINTS } from '@/lib/api/endpoints';
import type { BlogComment } from '@/types/blog';

export default function BulkCommentModerationTestPage() {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch pending comments
  const fetchComments = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: '1',
        size: '20',
        status: 'PENDING',
      });

      const response = await apiClient.get<{
        comments: BlogComment[];
        total: number;
      }>(`${BLOG_ENDPOINTS.GET_COMMENTS_BY_STATUS}?${params.toString()}`);

      setComments(response.comments || []);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
      setError('Yorumlar yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  return (
    <UnifiedErrorBoundary level="page">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Toplu Yorum Moderasyonu - TEST
                </h1>
                <p className="mt-1 text-gray-600">
                  Yeni bulk action component&apos;lerini test edin
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-blue-900">
              Test Bilgisi
            </h3>
            <p className="text-sm text-blue-700">
              Bu sayfa Sprint 1 - EPIC 2.1 kapsamında oluşturulan bulk action
              component&apos;lerini test etmek için tasarlanmıştır. Bekleyen
              yorumları görebilir ve toplu işlem yapabilirsiniz.
            </p>
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
              <button
                onClick={fetchComments}
                className="mt-2 text-sm font-medium text-red-600 hover:text-red-700"
              >
                Tekrar dene
              </button>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Yorumlar yükleniyor...</span>
            </div>
          )}

          {/* Comment List with Bulk Actions */}
          {!loading && !error && (
            <CommentListWithBulkActions
              comments={comments}
              loading={loading}
              onRefresh={fetchComments}
            />
          )}

          {/* Stats */}
          {!loading && !error && (
            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-2 text-sm font-semibold text-gray-900">
                İstatistikler
              </h3>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-gray-600">Toplam Yorum</p>
                  <p className="text-lg font-bold text-gray-900">
                    {comments.length}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Backend Endpoint</p>
                  <p className="font-mono text-xs text-gray-900">
                    {BLOG_ENDPOINTS.GET_COMMENTS_BY_STATUS}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Component</p>
                  <p className="font-mono text-xs text-gray-900">
                    CommentListWithBulkActions
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </UnifiedErrorBoundary>
  );
}
