/**
 * ================================================
 * MODERATOR LAYOUT
 * ================================================
 * Layout for moderator-specific tools and pages
 *
 * Canonical location for all moderation pages:
 * - /moderator/comments - Comment moderation
 * - /moderator/reviews - Review moderation
 * - /moderator/reports - Report handling
 * - /moderator/tickets - Support ticket management
 * - /moderator/performance - Performance metrics
 * - /moderator/activity - Activity logs
 *
 * SPRINT 1 - Story 1.2: Route Consolidation (Production Ready)
 * @version 3.0.0
 * @created 2025-11-08
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { moderatorToolsNavigation } from '@/lib/config/navigation';
import { cn } from '@/lib/utils';
import { Shield } from 'lucide-react';

export default function ModeratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Moderator Tools Navigation Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Title */}
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-xl font-bold text-blue-600 transition-colors hover:text-blue-700"
              >
                <Shield className="h-6 w-6" />
                <span>MarifetBul</span>
              </Link>
              <div className="hidden h-6 w-px bg-gray-300 md:block" />
              <span className="hidden text-sm font-medium text-gray-600 md:block">
                Moderasyon Paneli
              </span>
            </div>

            {/* Navigation Links */}
            <nav className="flex items-center space-x-1">
              {moderatorToolsNavigation.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' &&
                    pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
                    <span className="hidden sm:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto">{children}</main>
    </div>
  );
}
