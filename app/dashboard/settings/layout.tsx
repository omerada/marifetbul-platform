/**
 * ================================================
 * SETTINGS LAYOUT
 * ================================================
 * Layout for settings pages with sidebar navigation
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2
 */

import React from 'react';
import { SettingsNav, MobileSettingsNav } from '@/components/domains/settings';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
          <p className="mt-2 text-gray-600">
            Hesap ve tercih ayarlarınızı yönetin
          </p>
        </div>

        {/* Mobile Navigation - Tabs */}
        <div className="mb-6 lg:hidden">
          <MobileSettingsNav />
        </div>

        {/* Desktop Layout - 2 Column */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Settings Navigation - Left Sidebar (Desktop Only) */}
          <aside className="hidden lg:col-span-1 lg:block">
            <div className="sticky top-8 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <SettingsNav />
            </div>
          </aside>

          {/* Settings Content - Main Area */}
          <main className="lg:col-span-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
