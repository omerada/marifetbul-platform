/**
 * AdminSidebar Component (Refactored)
 * 
 * Main orchestrator for admin navigation sidebar.
 * Handles state management and delegates rendering to specialized components.
 * 
 * Reduction: 808 lines → ~100 lines (-87.6%)
 * Components: 13 modular files
 * Config: Extracted to navigationConfig.ts (reusable)
 * Helpers: 9 utility functions in sidebarHelpers.ts
 */

'use client';

import { useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { NAVIGATION_ITEMS } from './sidebar/config/navigationConfig';
import {
  filterNavigationByPermissions,
  filterNavigationBySearch,
  isPathActive,
  isChildPathActive,
} from './sidebar/utils/sidebarHelpers';
import { useSidebarState } from './sidebar/hooks/useSidebarState';
import { DesktopSidebar } from './sidebar/components/DesktopSidebar';
import { MobileSidebar } from './sidebar/components/MobileSidebar';
import type { AdminSidebarProps } from './sidebar/types/sidebarTypes';

// Mock user - replace with actual auth data
const MOCK_USER = {
  name: 'Admin User',
  email: 'admin@marifetbul.com',
  role: 'Super Admin',
  avatar: '/avatars/admin.jpg',
};

// Mock alerts - replace with actual data
const MOCK_ALERTS = {
  unread: 23,
};

export default function AdminSidebar({
  isOpen,
  isCollapsed,
  onToggleCollapse,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Get navigation items with active states
  const navigationWithActive = useMemo(() => {
    return NAVIGATION_ITEMS.map((item) => ({
      ...item,
      current: isPathActive(pathname, item.href) || isChildPathActive(pathname, item.subItems),
      subItems: item.subItems?.map((subItem) => ({
        ...subItem,
        current: isPathActive(pathname, subItem.href),
      })),
    }));
  }, [pathname]);

  // Initialize sidebar state
  const { expandedItems, searchQuery, setSearchQuery, toggleExpanded } =
    useSidebarState(pathname, navigationWithActive);

  // Apply filters (permissions & search)
  const filteredNavigation = useMemo(() => {
    // TODO: Get actual user role from auth
    const userRole = 'super_admin';
    
    let filtered = filterNavigationByPermissions(navigationWithActive, userRole);
    filtered = filterNavigationBySearch(filtered, searchQuery);
    
    return filtered.map((item) => ({
      ...item,
      current: isPathActive(pathname, item.href) || isChildPathActive(pathname, item.subItems),
    }));
  }, [navigationWithActive, searchQuery, pathname]);

  // Logout handler
  const handleLogout = () => {
    // TODO: Implement actual logout logic
    router.push('/admin/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <DesktopSidebar
        isCollapsed={isCollapsed}
        user={MOCK_USER}
        navigation={filteredNavigation}
        expandedItems={expandedItems}
        searchQuery={searchQuery}
        alertsSummary={MOCK_ALERTS}
        onToggleCollapse={onToggleCollapse}
        onToggleExpanded={toggleExpanded}
        onSearchChange={setSearchQuery}
        onLogout={handleLogout}
        pathname={pathname}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isOpen}
        user={MOCK_USER}
        navigation={filteredNavigation}
        expandedItems={expandedItems}
        alertsSummary={MOCK_ALERTS}
        onClose={onClose}
        onToggleExpanded={toggleExpanded}
        onLogout={handleLogout}
        pathname={pathname}
      />
    </>
  );
}
