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
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
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

export default function AdminSidebar({
  isOpen,
  isCollapsed,
  onToggleCollapse,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  // Get user data from auth store
  const currentUser = useMemo(
    () => ({
      name:
        user?.name || (user?.firstName && user?.lastName)
          ? `${user.firstName} ${user.lastName}`
          : 'Admin User',
      email: user?.email || 'admin@marifetbul.com',
      role:
        user?.role === 'ADMIN' || user?.role === 'MODERATOR'
          ? 'Administrator'
          : 'Admin',
      avatar: user?.avatar || '/avatars/admin.jpg',
    }),
    [user]
  );

  // Get alerts - can be extended with real notification system
  const alertsSummary = useMemo(
    () => ({
      unread: 0, // Notification count - Integrate with notification API or WebSocket
      // Future: Use real-time notification count from useNotifications() hook
    }),
    []
  );

  // Get navigation items with active states
  const navigationWithActive = useMemo(() => {
    return NAVIGATION_ITEMS.map((item) => ({
      ...item,
      current:
        isPathActive(pathname, item.href) ||
        isChildPathActive(pathname, item.subItems),
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
    // Get user role from auth
    const userRole = user?.role || 'admin';

    let filtered = filterNavigationByPermissions(
      navigationWithActive,
      userRole
    );
    filtered = filterNavigationBySearch(filtered, searchQuery);

    return filtered.map((item) => ({
      ...item,
      current:
        isPathActive(pathname, item.href) ||
        isChildPathActive(pathname, item.subItems),
    }));
  }, [navigationWithActive, searchQuery, pathname, user?.role]);

  // Logout handler
  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <DesktopSidebar
        isCollapsed={isCollapsed}
        user={currentUser}
        navigation={filteredNavigation}
        expandedItems={expandedItems}
        searchQuery={searchQuery}
        alertsSummary={alertsSummary}
        onToggleCollapse={onToggleCollapse}
        onToggleExpanded={toggleExpanded}
        onSearchChange={setSearchQuery}
        onLogout={handleLogout}
        pathname={pathname}
      />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isOpen}
        user={currentUser}
        navigation={filteredNavigation}
        expandedItems={expandedItems}
        alertsSummary={alertsSummary}
        onClose={onClose}
        onToggleExpanded={toggleExpanded}
        onLogout={handleLogout}
        pathname={pathname}
      />
    </>
  );
}
