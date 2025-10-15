/**
 * AdminSidebar Type Definitions
 *
 * Centralized types for sidebar navigation, components, and state management.
 */

import { LucideIcon } from 'lucide-react';

// ============================================================================
// Navigation Types
// ============================================================================

export type NavPermission = 'super_admin' | 'admin' | 'moderator';

export interface NavigationSubItem {
  name: string;
  href: string;
  current?: boolean;
  badge?: string | number | null;
}

export interface NavigationItem {
  name: string;
  href: string;
  icon: LucideIcon;
  current?: boolean;
  badge?: string | number | null;
  permissions?: NavPermission[];
  subItems?: NavigationSubItem[];
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface AdminSidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onClose: () => void;
}

export interface SidebarHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobile?: boolean;
}

export interface SidebarSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isCollapsed: boolean;
}

export interface SidebarUserProfileProps {
  user: {
    name?: string;
    email?: string;
    role?: string;
    avatar?: string;
  } | null;
  isCollapsed: boolean;
}

export interface SidebarNavigationItemProps {
  item: NavigationItem;
  isCollapsed: boolean;
  isExpanded: boolean;
  onToggleExpand: (itemName: string) => void;
  pathname: string;
  onItemClick?: () => void; // For mobile close
}

export interface SidebarSubItemsProps {
  subItems?: NavigationSubItem[];
  pathname: string;
  onItemClick?: () => void;
}

export interface SidebarBottomSectionProps {
  isCollapsed: boolean;
  alertCount: number;
  onLogout: () => void;
}

export interface DesktopSidebarProps {
  isCollapsed: boolean;
  user: {
    name?: string;
    email?: string;
    role?: string;
  } | null;
  navigation: NavigationItem[];
  expandedItems: string[];
  searchQuery: string;
  alertsSummary: {
    unread: number;
  };
  onToggleCollapse: () => void;
  onToggleExpanded: (itemName: string) => void;
  onSearchChange: (query: string) => void;
  onLogout: () => void;
  pathname: string;
}

export interface MobileSidebarProps {
  isOpen: boolean;
  user: {
    name?: string;
    email?: string;
    role?: string;
  } | null;
  navigation: NavigationItem[];
  expandedItems: string[];
  alertsSummary: {
    unread: number;
  };
  onClose: () => void;
  onToggleExpanded: (itemName: string) => void;
  onLogout: () => void;
  pathname: string;
}

// ============================================================================
// State Types
// ============================================================================

export interface SidebarState {
  expandedItems: string[];
  searchQuery: string;
}

// ============================================================================
// Badge Types
// ============================================================================

export type BadgeValue = string | number | null | undefined;
export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'outline'
  | 'success'
  | 'warning'
  | 'destructive';
