/**
 * useSidebarState Hook
 *
 * Custom hook for managing sidebar state (expanded items, search query).
 * Handles auto-expansion of active sections on mount.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { NavigationItem } from '../types/sidebarTypes';
import {
  getAutoExpandedItems,
  toggleItemInArray,
} from '../utils/sidebarHelpers';

export function useSidebarState(
  pathname: string,
  navigationItems: NavigationItem[]
) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-expand sections with active pages on mount
  useEffect(() => {
    const autoExpanded = getAutoExpandedItems(pathname, navigationItems);
    setExpandedItems((prev) => {
      const newItems = [...new Set([...prev, ...autoExpanded])];
      return newItems;
    });
  }, [pathname, navigationItems]);

  const toggleExpanded = useCallback((itemName: string) => {
    setExpandedItems((prev) => toggleItemInArray(prev, itemName));
  }, []);

  return {
    expandedItems,
    searchQuery,
    setSearchQuery,
    toggleExpanded,
  };
}
