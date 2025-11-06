/**
 * ================================================
 * ADMIN COMMENT MODERATION PAGE - DEPRECATED
 * ================================================
 * 🚨 DEPRECATED: This page is replaced by unified moderation page
 *
 * New location: app/(moderation)/comments/page.tsx
 *
 * This file redirects to the new unified page for backward compatibility.
 * Will be removed in future release.
 *
 * SPRINT 1 - Story 1.2: Page Consolidation
 * @deprecated Use app/(moderation)/comments/page.tsx instead
 * @author MarifetBul Development Team
 * @version 3.0.0 - Redirect Only
 * @updated November 6, 2025
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui';

/**
 * Redirect to unified moderation page
 */
export default function AdminCommentModerationPageDeprecated() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new unified page
    router.replace('/comments');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Loading size="lg" text="Yönlendiriliyor..." />
    </div>
  );
}
