/**
 * CategoryHeader Component
 *
 * Header section with icon, title, description, and optional expand button
 */

import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui';
import {
  getIconComponent,
  getIconBackgroundStyle,
} from '../utils/categoryCardHelpers';
import { ICON_VARIANTS } from '../utils/categoryCardConstants';
import type { CategoryHeaderProps } from '../types/categoryCardTypes';

export function CategoryHeader({
  category,
  variant,
  isExpandable = false,
  isExpanded = false,
  onToggleExpand,
}: CategoryHeaderProps) {
  const IconComponent = getIconComponent(category.icon);

  // Size mapping per variant
  const sizeClasses = {
    compact: 'h-10 w-10',
    featured: 'h-16 w-16',
    detailed: 'h-14 w-14',
    default: 'h-12 w-12',
  };

  const iconSizes = {
    compact: 'h-5 w-5',
    featured: 'h-8 w-8',
    detailed: 'h-7 w-7',
    default: 'h-6 w-6',
  };

  const titleSizes = {
    compact: 'text-sm',
    featured: 'text-xl',
    detailed: 'text-lg',
    default: 'text-lg',
  };

  const descriptionSizes = {
    compact: 'text-xs',
    featured: 'text-sm',
    detailed: 'text-sm',
    default: 'text-sm',
  };

  return (
    <div className="flex items-start gap-4">
      <motion.div
        variants={ICON_VARIANTS}
        className={`flex ${sizeClasses[variant]} items-center justify-center rounded-xl shadow-sm`}
        style={getIconBackgroundStyle(category.iconColor)}
      >
        <IconComponent className={iconSizes[variant]} />
      </motion.div>

      <div className="min-w-0 flex-1">
        <h3
          className={`mb-1 line-clamp-2 font-semibold text-gray-900 ${titleSizes[variant]}`}
        >
          {category.title}
        </h3>
        <p
          className={`line-clamp-2 text-gray-600 ${descriptionSizes[variant]}`}
        >
          {variant === 'default' && category.shortDescription
            ? category.shortDescription
            : category.description}
        </p>
      </div>

      {isExpandable && onToggleExpand && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleExpand();
          }}
          className="h-8 w-8 p-0 hover:bg-gray-100"
          title={isExpanded ? 'Daralt' : 'Genişlet'}
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      )}
    </div>
  );
}
