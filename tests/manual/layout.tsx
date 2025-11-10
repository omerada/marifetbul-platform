/**
 * ================================================
 * TEST PAGES LAYOUT
 * ================================================
 * Layout for development/testing pages
 * Only accessible in development mode
 *
 * SPRINT 1 - Story 1.3: Test Pages Environment Control
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @created November 8, 2025
 */

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Test Pages - MarifetBul',
  description: 'Development and testing pages',
  robots: 'noindex, nofollow',
};

export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Redirect to home in production
  if (process.env.NODE_ENV === 'production') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Development-only warning banner */}
      <div className="bg-yellow-500 px-4 py-2 text-center text-sm font-medium text-yellow-900">
        ⚠️ DEVELOPMENT MODE - Test pages are only available in development
      </div>
      {children}
    </div>
  );
}
