/**
 * ================================================
 * ADMIN REVIEW MODERATION PAGE - DEPRECATED
 * ================================================
 * 🚨 DEPRECATED: This page is replaced by unified moderation page
 *
 * New location: app/(moderation)/reviews/page.tsx
 *
 * This file redirects to the new unified page for backward compatibility.
 * Will be removed in future release.
 *
 * SPRINT 1 - Story 1.2: Page Consolidation
 * @deprecated Use app/(moderation)/reviews/page.tsx instead
 * @author MarifetBul Development Team
 * @version 4.0.0 - Redirect Only
 * @updated November 6, 2025
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loading } from '@/components/ui';

/**
 * Redirect to unified moderation page
 */
export default function AdminReviewModerationPageDeprecated() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new unified page
    router.replace('/reviews');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Loading size="lg" text="Yönlendiriliyor..." />
    </div>
  );
}
