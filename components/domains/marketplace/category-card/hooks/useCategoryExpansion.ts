/**
 * useCategoryExpansion Hook
 *
 * Manages expansion state for category cards and subcategories
 */

'use client';

import { useState, useCallback } from 'react';
import type { UseCategoryExpansionReturn } from '../types/categoryCardTypes';

export function useCategoryExpansion(
  initialExpanded: boolean = false
): UseCategoryExpansionReturn {
  const [isCardExpanded, setIsCardExpanded] = useState(initialExpanded);
  const [expandedSubcategories, setExpandedSubcategories] = useState<
    Set<string>
  >(new Set());

  const toggleCard = useCallback(() => {
    setIsCardExpanded((prev) => !prev);
  }, []);

  const setCardExpanded = useCallback((expanded: boolean) => {
    setIsCardExpanded(expanded);
  }, []);

  const toggleSubcategory = useCallback(
    (subcategoryId: string, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setExpandedSubcategories((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(subcategoryId)) {
          newSet.delete(subcategoryId);
        } else {
          newSet.add(subcategoryId);
        }
        return newSet;
      });
    },
    []
  );

  return {
    isCardExpanded,
    expandedSubcategories,
    toggleCard,
    toggleSubcategory,
    setCardExpanded,
  };
}
