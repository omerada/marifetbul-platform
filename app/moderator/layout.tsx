/**
 * ================================================
 * MODERATOR LAYOUT
 * ================================================
 * Layout for moderator-specific tools and pages
 *
 * Note: Main moderator dashboard is at /dashboard (via UnifiedDashboard)
 * This layout is for moderator-specific tools:
 * - /moderator/comments - Comment moderation
 * - /moderator/reviews - Review moderation
 * - /moderator/reports - Report handling
 * - /moderator/tickets - Support ticket management
 * - /moderator/performance - Performance metrics
 * - /moderator/activity - Activity logs
 *
 * Sprint: Dashboard Consolidation
 * @version 2.0.0
 * @refactored 2025-11-04
 */

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { moderatorToolsNavigation } from '@/lib/config/navigation';

export const metadata: Metadata = {
  title: 'Moderasyon Araçları - MarifetBul',
  description: 'İçerik moderasyonu ve kullanıcı yönetimi araçları',
};

export default function ModeratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Moderator Tools Navigation Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-blue-600">
                MarifetBul
              </Link>
              <span className="text-sm text-gray-500">Moderasyon Araçları</span>
            </div>

            <nav className="flex items-center space-x-6">
              {moderatorToolsNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
