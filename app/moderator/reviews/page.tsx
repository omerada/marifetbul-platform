/**
 * ================================================
 * MODERATOR REVIEW MODERATION PAGE
 * ================================================
 * Unified moderator review management interface
 * Uses shared components - NO DUPLICATION
 *
 * Sprint 1 - EPIC 1.1: Component Deduplication
 * @author MarifetBul Development Team
 * @version 6.0.0 - Unified Components
 * @updated November 6, 2025
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { UnifiedReviewQueue } from '@/components/domains/moderation/shared';

/**
 * Moderator Review Moderation Page
 *
 * Clean, unified interface:
 * - Uses shared UnifiedReviewQueue component
 * - Role-based rendering (moderator)
 * - No code duplication with admin
 * - Consistent UX across all moderation interfaces
 */
export default function ModeratorReviewsPage() {
  const searchParams = useSearchParams();

  // Get initial status from URL (default: pending)
  const initialStatus =
    (searchParams?.get('status') as 'pending' | 'flagged' | 'all') || 'pending';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            İnceleme Moderasyonu
          </h1>
          <p className="mt-2 text-gray-600">
            İncelemeleri yönetin, onaylayın, reddedin veya yükseltin
          </p>
        </div>

        {/* Unified Review Queue - Moderator Role */}
        <UnifiedReviewQueue
          role="moderator"
          initialStatus={initialStatus}
          showStats
          enableBulkActions
          viewMode="compact"
        />
      </div>
    </div>
  );
}
