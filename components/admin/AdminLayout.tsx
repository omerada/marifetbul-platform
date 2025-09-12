'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AdminFooter } from './AdminFooter';

interface AdminLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminLayout({ children, className }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
          'transition-all duration-300 ease-in-out',
          sidebarOpen && !sidebarCollapsed && 'lg:ml-64',
          sidebarOpen && sidebarCollapsed && 'lg:ml-16'
        )}
      >
        {/* Header */}
        <AdminHeader onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content */}
        <main
          className={cn(
            'px-4 py-6 sm:px-6 lg:px-8',
            'min-h-[calc(100vh-4rem)]', // Subtract header height
            className
          )}
        >
          {children}
        </main>

        {/* Footer */}
        <AdminFooter />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="bg-opacity-75 fixed inset-0 z-40 bg-gray-600 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default AdminLayout;
