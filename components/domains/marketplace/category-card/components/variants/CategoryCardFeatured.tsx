/**
 * CategoryCardFeatured Variant
 *
 * Featured card with full stats, popular services, and action buttons
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { CategoryHeader } from '../CategoryHeader';
import { CategoryStats } from '../CategoryStats';
import { CategoryBadgeList } from '../CategoryBadgeList';
import { CARD_VARIANTS, MAX_ITEMS } from '../../utils/categoryCardConstants';
import type { CategoryCardProps } from '../../types/categoryCardTypes';

export function CategoryCardFeatured({
  category,
  showStats = true,
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
      <Card className="relative h-full overflow-hidden border-2 border-transparent bg-gradient-to-br from-white to-gray-50 p-6 transition-all duration-300 hover:border-blue-100 hover:shadow-xl">
        <div className="flex h-full flex-col space-y-4">
          {/* Header */}
          <CategoryHeader category={category} variant="featured" />

          {/* Stats */}
          <CategoryStats
            category={category}
            variant="featured"
            showStats={showStats}
          />

          {/* Popular Services */}
          <CategoryBadgeList
            items={category.popularServices}
            maxItems={MAX_ITEMS.FEATURED_SERVICES}
            title="Popüler Hizmetler"
            variant="outlined"
          />

          {/* Actions */}
          <div className="mt-auto flex gap-2 pt-2">
            <Link
              href={`/marketplace/categories/${category.slug}`}
              className="flex-1"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full group-hover:border-blue-300"
              >
                Hizmetleri Gör
                <ArrowUpRight className="ml-1 h-3 w-3" />
              </Button>
            </Link>
            <Link href="/marketplace/jobs/create" className="flex-1">
              <Button size="sm" className="w-full">
                İş Ver
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
