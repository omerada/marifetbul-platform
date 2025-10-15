/**
 * CategoryCardDefault Variant
 *
 * Default card with expandable sections, subcategories, and full features
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, Button } from '@/components/ui';
import { CategoryHeader } from '../CategoryHeader';
import { CategoryStats } from '../CategoryStats';
import { CategorySubcategoryList } from '../CategorySubcategoryList';
import { CategoryServiceList } from '../CategoryServiceList';
import { CategoryExpandedContent } from '../CategoryExpandedContent';
import { useCategoryExpansion } from '../../hooks/useCategoryExpansion';
import { CARD_VARIANTS, MAX_ITEMS } from '../../utils/categoryCardConstants';
import {
  hasSubcategories,
  hasServices,
  hasSkills,
} from '../../utils/categoryCardHelpers';
import type { CategoryCardProps } from '../../types/categoryCardTypes';

export function CategoryCardDefault({
  category,
  showStats = true,
  showSubcategories = false,
  isExpandable = false,
  isExpanded: controlledExpanded,
  onToggleExpand,
  onClick,
  className = '',
}: CategoryCardProps) {
  const {
    isCardExpanded,
    expandedSubcategories,
    toggleCard,
    toggleSubcategory,
    setCardExpanded,
  } = useCategoryExpansion(controlledExpanded || false);

  // Use controlled or internal expansion
  const isExpanded = onToggleExpand ? controlledExpanded : isCardExpanded;
  const handleToggle = onToggleExpand
    ? () => onToggleExpand(category.id)
    : toggleCard;

  // Sync internal state with controlled prop
  if (onToggleExpand && controlledExpanded !== isCardExpanded) {
    setCardExpanded(controlledExpanded || false);
  }

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
      className={`group h-full cursor-pointer ${className}`}
      onClick={handleClick}
    >
      <Card className="flex h-full flex-col bg-white p-6 transition-all duration-300 hover:shadow-lg">
        <div className="flex h-full flex-col space-y-4">
          {/* Header */}
          <CategoryHeader
            category={category}
            variant="default"
            isExpandable={isExpandable}
            isExpanded={isExpanded}
            onToggleExpand={handleToggle}
          />

          {/* Stats */}
          <CategoryStats
            category={category}
            variant="default"
            showStats={showStats}
          />

          {/* Subcategories - Always shown when available */}
          {showSubcategories && hasSubcategories(category.subcategories) && (
            <CategorySubcategoryList
              subcategories={category.subcategories}
              expandedIds={expandedSubcategories}
              onToggle={toggleSubcategory}
              maxItems={MAX_ITEMS.DEFAULT_SUBCATEGORIES}
            />
          )}

          {/* Direct Services - Shown when no subcategories */}
          {showSubcategories &&
            !hasSubcategories(category.subcategories) &&
            hasServices(category.popularServices) && (
              <CategoryServiceList
                services={category.popularServices}
                priceRange={category.priceRange}
                totalCount={category.popularServices.length}
              />
            )}

          {/* Top Skills - Additional info when available */}
          {showSubcategories &&
            hasSkills(category.topSkills) &&
            !hasSubcategories(category.subcategories) && (
              <div className="border-t border-gray-100 pt-3">
                <h5 className="mb-2 text-xs font-medium tracking-wide text-gray-700 uppercase">
                  Aranan Yetenekler
                </h5>
                <div className="flex flex-wrap gap-1">
                  {category.topSkills
                    .slice(0, MAX_ITEMS.DEFAULT_SKILLS)
                    .map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700"
                      >
                        {skill}
                      </span>
                    ))}
                  {category.topSkills.length > MAX_ITEMS.DEFAULT_SKILLS && (
                    <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs text-gray-500">
                      +{category.topSkills.length - MAX_ITEMS.DEFAULT_SKILLS}
                    </span>
                  )}
                </div>
              </div>
            )}

          {/* Expanded Content */}
          <CategoryExpandedContent
            category={category}
            isExpanded={isExpanded || false}
          />

          {/* Actions - Always at bottom */}
          <div className="mt-auto flex gap-2 pt-4">
            <Link
              href={`/marketplace/categories/${category.slug}`}
              className="flex-1"
            >
              <Button variant="outline" size="sm" className="w-full">
                Hizmetleri Görüntüle
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
