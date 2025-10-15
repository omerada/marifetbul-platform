/**
 * MobileSidebar Component
 *
 * Mobile sidebar drawer using shared components
 */

'use client';

import type { MobileSidebarProps } from '../types/sidebarTypes';
import { SidebarHeader } from './SidebarHeader';
import { SidebarUserProfile } from './SidebarUserProfile';
import { SidebarNavigationItem } from './SidebarNavigationItem';
import { SidebarBottomSection } from './SidebarBottomSection';

export function MobileSidebar({
  isOpen,
  user,
  navigation,
  expandedItems,
  alertsSummary,
  onClose,
  onToggleExpanded,
  onLogout,
  pathname,
}: MobileSidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="bg-card fixed inset-y-0 left-0 z-50 w-72 shadow-xl lg:hidden">
        <div className="flex h-full flex-col">
          {/* Header with close button */}
          <div className="flex items-center justify-between border-b p-4">
            <SidebarHeader
              isCollapsed={false}
              onToggleCollapse={onClose}
              isMobile
            />
          </div>

          {/* User Profile */}
          <SidebarUserProfile user={user} isCollapsed={false} />

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
            {navigation.map((item) => (
              <SidebarNavigationItem
                key={item.name}
                item={item}
                pathname={pathname}
                isCollapsed={false}
                isExpanded={expandedItems.includes(item.name)}
                onToggleExpand={onToggleExpanded}
                onItemClick={onClose}
              />
            ))}
          </nav>

          {/* Bottom Section */}
          <SidebarBottomSection
            isCollapsed={false}
            alertCount={alertsSummary.unread}
            onLogout={onLogout}
          />
        </div>
      </div>
    </>
  );
}
