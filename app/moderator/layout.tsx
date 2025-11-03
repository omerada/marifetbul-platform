/**
 * ================================================
 * MODERATOR LAYOUT
 * ================================================
 * Layout for moderator pages with navigation sidebar
 *
 * Sprint 1.2: MODERATOR Role Frontend Integration
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 */

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Moderasyon Paneli - MarifetBul',
  description: 'İçerik moderasyonu ve kullanıcı yönetimi',
};

export default function ModeratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Moderator Navigation Header */}
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-blue-600">
                MarifetBul
              </Link>
              <span className="text-sm text-gray-500">Moderasyon</span>
            </div>

            <nav className="flex items-center space-x-6">
              <Link
                href="/moderator"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
              >
                Dashboard
              </Link>
              <Link
                href="/moderator/comments"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
              >
                Yorumlar
              </Link>
              <Link
                href="/moderator/reviews"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
              >
                Değerlendirmeler
              </Link>
              <Link
                href="/moderator/reports"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
              >
                Raporlar
              </Link>
              <Link
                href="/moderator/tickets"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
              >
                Destek
              </Link>
              <Link
                href="/moderator/performance"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
              >
                Performans
              </Link>
              <Link
                href="/moderator/activity"
                className="text-sm font-medium text-gray-700 transition-colors hover:text-blue-600"
              >
                Aktivite
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <Link
                href="/dashboard"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Dashboard&apos;a Dön
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>
    </div>
  );
}
