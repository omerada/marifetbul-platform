/**
 * CategoryCardNew Component
 * 
 * Main coordinator for category cards with variant support
 * Refactored from 774 lines to ~80 lines (-90%)
 */

'use client';

import React from 'react';
import {
  CategoryCardCompact,
  CategoryCardFeatured,
  CategoryCardDetailed,
  CategoryCardDefault,
} from './category-card/components';
import type { CategoryCardProps } from './category-card/types/categoryCardTypes';

const CategoryCardNew: React.FC<CategoryCardProps> = ({
  category,
  variant = 'default',
  showStats = true,
  showSubcategories = false,
  onClick,
  className = '',
  isExpandable = false,
  isExpanded = false,
  onToggleExpand,
  searchTerm = '',
}) => {
  // Select variant component
  const variantComponents = {
    compact: CategoryCardCompact,
    featured: CategoryCardFeatured,
    detailed: CategoryCardDetailed,
    default: CategoryCardDefault,
  };

  const VariantComponent = variantComponents[variant] || CategoryCardDefault;

  // Pass all props to variant component
  return (
    <VariantComponent
      category={category}
      variant={variant}
      showStats={showStats}
      showSubcategories={showSubcategories}
      onClick={onClick}
      className={className}
      isExpandable={isExpandable}
      isExpanded={isExpanded}
      onToggleExpand={onToggleExpand}
      searchTerm={searchTerm}
    />
  );
};

export default CategoryCardNew;
