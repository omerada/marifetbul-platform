'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import AdminFooter from './AdminFooter';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminLayout({ children, className }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="animate-fade-in fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <AdminSidebar
        isOpen={sidebarOpen}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div
        className={cn(
          'ease-out-quart transition-all duration-300',
          sidebarOpen && !sidebarCollapsed && 'lg:ml-64',
          sidebarOpen && sidebarCollapsed && 'lg:ml-16'
        )}
      >
        {/* Header */}
        <AdminHeader
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Page content */}
        <main
          className={cn(
            'px-4 py-6 sm:px-6 lg:px-8',
            'min-h-[calc(100vh-4rem)]', // Subtract header height
            className
          )}
        >
          <div className="mx-auto max-w-screen-2xl">{children}</div>
        </main>

        {/* Footer */}
        <AdminFooter />
      </div>
    </div>
  );
}

export default AdminLayout;
