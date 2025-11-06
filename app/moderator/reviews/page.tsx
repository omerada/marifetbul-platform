/**
 * ================================================
 * MODERATOR REVIEW MODERATION PAGE - DEPRECATED
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
 * @version 7.0.0 - Redirect Only
 * @updated November 6, 2025
 */

'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loading } from '@/components/ui';

/**
 * Redirect to unified moderation page
 */
export default function ModeratorReviewsPageDeprecated() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Preserve query parameters
    const status = searchParams?.get('status');
    const url = status ? `/reviews?status=${status}` : '/reviews';

    // Redirect to new unified page
    router.replace(url);
  }, [router, searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Loading size="lg" text="Yönlendiriliyor..." />
    </div>
  );
}
