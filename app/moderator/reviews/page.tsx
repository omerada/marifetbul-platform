/**
 * ================================================
 * MODERATOR REVIEW MODERATION PAGE
 * ================================================
 * Dedicated moderator review management interface
 * No duplicate admin components - clean separation of concerns
 *
 * Sprint 1 - Story 1.1: Review Moderation System
 * @author MarifetBul Development Team
 * @version 5.0.0 - Dedicated Moderator Components
 * @created November 3, 2025
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { ModeratorReviewQueue } from '@/components/domains/moderator/ModeratorReviewQueue';

/**
 * Moderator Review Moderation Page
 *
 * Clean, dedicated moderator interface:
 * - Uses specialized ModeratorReviewQueue component
 * - No admin component dependencies
 * - Focused on moderator-specific workflows
 * - Optimistic UI updates
 * - Bulk moderation support
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
            İncelemeleri yönetin, onaylayın veya reddedin
          </p>
        </div>

        {/* Main Content */}
        <ModeratorReviewQueue initialStatus={initialStatus} />
      </div>
    </div>
  );
}
