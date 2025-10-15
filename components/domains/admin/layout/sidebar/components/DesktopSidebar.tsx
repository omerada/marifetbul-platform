/**
 * DesktopSidebar Component
 *
 * Desktop sidebar orchestrator using shared components
 */

'use client';

import { cn } from '@/lib/utils';
import type { DesktopSidebarProps } from '../types/sidebarTypes';
import { SidebarHeader } from './SidebarHeader';
import { SidebarSearch } from './SidebarSearch';
import { SidebarUserProfile } from './SidebarUserProfile';
import { SidebarNavigationItem } from './SidebarNavigationItem';
import { SidebarBottomSection } from './SidebarBottomSection';

export function DesktopSidebar({
  isCollapsed,
  user,
  navigation,
  expandedItems,
  searchQuery,
  alertsSummary,
  onToggleCollapse,
  onToggleExpanded,
  onSearchChange,
  onLogout,
  pathname,
}: DesktopSidebarProps) {
  return (
    <div
      className={cn(
        'z-50 hidden transition-all duration-300 lg:fixed lg:inset-y-0 lg:flex lg:flex-col',
        isCollapsed ? 'lg:w-20' : 'lg:w-72'
      )}
    >
      <div className="bg-card flex flex-1 flex-col border-r">
        {/* Header */}
        <SidebarHeader
          isCollapsed={isCollapsed}
          onToggleCollapse={onToggleCollapse}
        />

        {/* User Profile */}
        <SidebarUserProfile user={user} isCollapsed={isCollapsed} />

        {/* Search */}
        <SidebarSearch
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          isCollapsed={isCollapsed}
        />

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
          {navigation.map((item) => (
            <SidebarNavigationItem
              key={item.name}
              item={item}
              pathname={pathname}
              isCollapsed={isCollapsed}
              isExpanded={expandedItems.includes(item.name)}
              onToggleExpand={onToggleExpanded}
            />
          ))}
        </nav>

        {/* Bottom Section */}
        <SidebarBottomSection
          isCollapsed={isCollapsed}
          alertCount={alertsSummary.unread}
          onLogout={onLogout}
        />
      </div>
    </div>
  );
}
