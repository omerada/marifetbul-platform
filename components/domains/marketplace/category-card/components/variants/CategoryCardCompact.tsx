/**
 * CategoryCardCompact Variant
 *
 * Minimal compact card with icon, title, and service count
 */

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui';
import { CategoryHeader } from '../CategoryHeader';
import { CARD_VARIANTS } from '../../utils/categoryCardConstants'; 
import type { CategoryCardProps } from '../../types/categoryCardTypes';
import { formatNumber } from '@/lib/utils';

export function CategoryCardCompact({
  category,
  onClick,
  className = '',
}: CategoryCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(category.id);
    }
  };

  return (
    <motion.div
      variants={CARD_VARIANTS as any}
      initial="hidden"
      animate="visible"
      className={`group cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <Card className="border-0 bg-white/80 p-4 backdrop-blur-sm transition-all duration-200 hover:shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <CategoryHeader category={category} variant="compact" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">
              {formatNumber(category.serviceCount)} hizmet
            </span>
            <ChevronRight className="h-4 w-4 text-gray-400 transition-colors group-hover:text-gray-600" />
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
