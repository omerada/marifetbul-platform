import React from 'react';
import { DashboardSidebar } from '@/components/domains/dashboard';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar - Desktop */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
