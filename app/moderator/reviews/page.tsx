/**
 * ================================================
 * UNIFIED REVIEW MODERATION PAGE
 * ================================================
 * Single page for both Admin and Moderator review moderation
 *
 * Route: /moderator/reviews (with role-based access control)
 *
 * SPRINT 1 - Story 1.2: Route Consolidation
 * @author MarifetBul Development Team
 * @version 2.0.0 - Production Ready
 * @created November 8, 2025
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { Shield, UserCheck } from 'lucide-react';
import { UnifiedReviewQueue } from '@/components/domains/moderation/shared';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { UnifiedErrorBoundary } from '@/components/ui/UnifiedErrorBoundary';
import { Loading } from '@/components/ui';

/**
 * Unified Review Moderation Page
 *
 * Features:
 * - Single source of truth for review moderation
 * - Role-based rendering (admin/moderator)
 * - No code duplication
 * - Consistent UX across roles
 * - SEO optimized
 */
export default function ReviewModerationPage() {
  const { user, isLoading } = useAuthStore();
  const searchParams = useSearchParams();

  // Get initial status from URL (default: pending)
  const initialStatus =
    (searchParams?.get('status') as 'pending' | 'flagged' | 'all') || 'pending';

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loading size="lg" text="Yükleniyor..." />
      </div>
    );
  }

  // Check authorization
  const isAdmin = user?.role === 'ADMIN';
  const isModerator = user?.role === 'MODERATOR';

  if (!isAdmin && !isModerator) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900">Yetkisiz Erişim</h2>
          <p className="mt-2 text-gray-600">
            Bu sayfaya erişim yetkiniz bulunmamaktadır.
          </p>
        </div>
      </div>
    );
  }

  // Determine role for component
  const role = isAdmin ? 'admin' : 'moderator';
  const roleColor = isAdmin ? 'blue' : 'purple';
  const RoleIcon = isAdmin ? Shield : UserCheck;

  return (
    <UnifiedErrorBoundary level="page">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto max-w-7xl px-4">
          {/* Page Header */}
          <div className="mb-8 flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${roleColor}-600 text-white`}
              >
                <RoleIcon className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  İnceleme Moderasyonu
                </h1>
                <p className="mt-1 text-gray-600">
                  {isAdmin
                    ? 'İncelemeleri yönetin, onaylayın veya reddedin'
                    : 'İncelemeleri yönetin, onaylayın, reddedin veya yükseltin'}
                </p>
              </div>
            </div>

            {/* Role Badge */}
            <div
              className={`rounded-full bg-${roleColor}-100 px-4 py-2 text-sm font-medium text-${roleColor}-800`}
            >
              {isAdmin ? 'Admin' : 'Moderatör'}
            </div>
          </div>

          {/* Unified Review Queue */}
          <UnifiedReviewQueue
            role={role}
            initialStatus={initialStatus}
            showStats={true}
            enableBulkActions={true}
            viewMode={isAdmin ? 'card' : 'compact'}
          />
        </div>
      </div>
    </UnifiedErrorBoundary>
  );
}
