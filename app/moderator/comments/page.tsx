/**
 * ================================================
 * MODERATOR COMMENT MODERATION PAGE
 * ================================================
 * Page for moderators to review and moderate blog comments
 * Uses UnifiedCommentQueue for zero duplication
 *
 * Sprint 1 - EPIC 1.1: Component Deduplication (Comments)
 * @author MarifetBul Development Team
 * @version 5.0.0 - Unified Components
 * @updated November 6, 2025
 */

'use client';

import { MessageSquare } from 'lucide-react';
import { UnifiedErrorBoundary } from '@/components/ui/UnifiedErrorBoundary';
import { UnifiedCommentQueue } from '@/components/domains/moderation/shared';

export default function ModeratorCommentModerationPage() {
  return (
    <UnifiedErrorBoundary level="page">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center space-x-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-600 text-white">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Yorum Moderasyonu
                </h1>
                <p className="mt-1 text-gray-600">
                  Blog yorumlarını inceleyin, onaylayın veya reddedin
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content - Unified Comment Queue (Moderator Role) */}
        <div className="mx-auto max-w-7xl px-6 py-8">
          <UnifiedCommentQueue
            role="moderator"
            initialStatus="PENDING"
            showStats={true}
            enableBulkActions={true}
            viewMode="compact"
          />
        </div>
      </div>
    </UnifiedErrorBoundary>
  );
}
