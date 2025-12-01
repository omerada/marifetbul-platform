/**
 * CategoryExpandedContent Component
 *
 * Additional content shown when card is expanded
 */

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui';
import { formatCurrency } from '@/lib/shared/formatters';
import type { CategoryExpandedContentProps } from '../types/categoryCardTypes';

export function CategoryExpandedContent({
  category,
  isExpanded,
}: CategoryExpandedContentProps) {
  if (!isExpanded) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden"
    >
      <div className="space-y-4 border-t border-gray-100 pt-4">
        {/* All Subcategories */}
        {category.subcategories && category.subcategories.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-900">
              Alt Kategoriler ({category.subcategories.length})
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {category.subcategories.map((subcategory) => (
                <div
                  key={subcategory.id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-2 hover:bg-gray-50"
                >
                  <span className="text-sm text-gray-700">
                    {subcategory.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {subcategory.serviceCount} hizmet
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Skills */}
        {category.topSkills && category.topSkills.length > 0 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-900">
              Popüler Yetenekler
            </h4>
            <div className="flex flex-wrap gap-1">
              {category.topSkills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* All Popular Services */}
        {category.popularServices && category.popularServices.length > 3 && (
          <div>
            <h4 className="mb-2 text-sm font-medium text-gray-900">
              Tüm Popüler Hizmetler
            </h4>
            <div className="flex flex-wrap gap-1">
              {category.popularServices.map((service, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {service}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Price Range */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-900">
            Fiyat Aralığı
          </h4>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium text-gray-900">
              {formatCurrency(category.priceRange.min)}
            </span>
            <span>-</span>
            <span className="font-medium text-gray-900">
              {formatCurrency(category.priceRange.max)}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
