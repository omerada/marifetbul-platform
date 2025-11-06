/**
 * ================================================
 * MODERATION SECTION LAYOUT
 * ================================================
 * Layout for unified moderation pages
 * Handles role-based access control and navigation
 *
 * SPRINT 1 - Story 1.2: Page Consolidation
 * @author MarifetBul Development Team
 * @version 1.0.0 - Production Ready
 * @created November 6, 2025
 */

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Moderasyon | MarifetBul',
  description: 'İçerik moderasyon paneli - Admin & Moderatör',
  robots: 'noindex, nofollow', // Don't index moderation pages
};

export default function ModerationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
