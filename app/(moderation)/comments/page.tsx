/**
 * ================================================
 * UNIFIED COMMENT MODERATION PAGE
 * ================================================
 * Single page for both Admin and Moderator comment moderation
 * Replaces:
 * - app/admin/moderation/comments/page.tsx
 * - app/moderator/comments/page.tsx
 *
 * Route: /comments (with role-based access control)
 *
 * SPRINT 1 - Story 1.2: Page Consolidation
 * @author MarifetBul Development Team
 * @version 1.0.0 - Production Ready
 * @created November 6, 2025
 */

'use client';

import { useSearchParams } from 'next/navigation';
import { MessageSquare, Shield, UserCheck } from 'lucide-react';
import { UnifiedCommentQueue } from '@/components/domains/moderation/shared';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { UnifiedErrorBoundary } from '@/components/ui/UnifiedErrorBoundary';
import { Loading } from '@/components/ui';

/**
 * Unified Comment Moderation Page
 *
 * Features:
 * - Single source of truth for comment moderation
 * - Role-based rendering (admin/moderator)
 * - No code duplication
 * - Consistent UX across roles
 * - SEO optimized
 */
export default function CommentModerationPage() {
  const { user, isLoading } = useAuthStore();
  const searchParams = useSearchParams();

  // Get initial status from URL (default: PENDING)
  const initialStatus =
    (searchParams?.get('status') as
      | 'PENDING'
      | 'APPROVED'
      | 'REJECTED'
      | 'SPAM') || 'PENDING';

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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-6 py-6">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${roleColor}-600 text-white`}
                >
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-3">
                    <h1 className="text-3xl font-bold text-gray-900">
                      Yorum Moderasyonu
                    </h1>
                    <RoleIcon className={`h-5 w-5 text-${roleColor}-600`} />
                  </div>
                  <p className="mt-1 text-gray-600">
                    Blog yorumlarını inceleyin, onaylayın veya reddedin
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
          </div>
        </div>

        {/* Content - Unified Comment Queue */}
        <div className="mx-auto max-w-7xl px-6 py-8">
          <UnifiedCommentQueue
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
