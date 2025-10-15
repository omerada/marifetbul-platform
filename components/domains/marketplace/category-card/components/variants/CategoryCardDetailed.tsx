/**
 * CategoryCardDetailed Variant
 *
 * Detailed card with comprehensive stats, skills, services, and subcategories
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Card, Button } from '@/components/ui';
import { CategoryHeader } from '../CategoryHeader';
import { CategoryStats } from '../CategoryStats';
import { CategoryBadgeList } from '../CategoryBadgeList';
import { CARD_VARIANTS, MAX_ITEMS } from '../../utils/categoryCardConstants';
import { hasSubcategories } from '../../utils/categoryCardHelpers';
import type { CategoryCardProps } from '../../types/categoryCardTypes';

export function CategoryCardDetailed({
  category,
  showStats = true,
  showSubcategories = false,
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
      <Card className="bg-white p-6 transition-all duration-300 hover:shadow-xl">
        <div className="space-y-6">
          {/* Header */}
          <CategoryHeader category={category} variant="detailed" />

          {/* Detailed Stats */}
          <CategoryStats
            category={category}
            variant="detailed"
            showStats={showStats}
          />

          {/* Skills & Services */}
          <div className="space-y-3">
            <CategoryBadgeList
              items={category.topSkills}
              maxItems={MAX_ITEMS.DETAILED_SKILLS}
              title="Popüler Beceriler"
              variant="default"
              className="bg-gray-50"
            />

            <CategoryBadgeList
              items={category.popularServices}
              maxItems={MAX_ITEMS.DETAILED_SERVICES}
              title="Popüler Hizmetler"
              variant="colored"
              color={category.iconColor}
            />
          </div>

          {/* Subcategories */}
          {showSubcategories && hasSubcategories(category.subcategories) && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                Alt Kategoriler
              </h4>
              <div className="space-y-1">
                {category.subcategories
                  .slice(0, MAX_ITEMS.DETAILED_SUBCATEGORIES)
                  .map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-gray-600">{sub.name}</span>
                      <span className="text-gray-400">
                        {sub.serviceCount} hizmet
                      </span>
                    </div>
                  ))}
                {category.subcategories.length >
                  MAX_ITEMS.DETAILED_SUBCATEGORIES && (
                  <div className="text-xs text-gray-500">
                    +
                    {category.subcategories.length -
                      MAX_ITEMS.DETAILED_SUBCATEGORIES}{' '}
                    alt kategori daha...
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <Link
              href={`/marketplace/categories/${category.slug}`}
              className="flex-1"
            >
              <Button variant="outline" size="sm" className="w-full">
                Kategoriyi İncele
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/marketplace/jobs/create">
              <Button size="sm">İş Ver</Button>
            </Link>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
