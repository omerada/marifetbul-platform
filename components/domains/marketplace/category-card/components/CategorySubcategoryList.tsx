/**
 * CategorySubcategoryList Component
 *
 * Expandable list of subcategories with nested services
 */

import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { formatPrice } from '../utils/categoryCardHelpers';
import type { CategorySubcategoryListProps } from '../types/categoryCardTypes';

export function CategorySubcategoryList({
  subcategories,
  expandedIds,
  onToggle,
  maxItems = 6,
}: CategorySubcategoryListProps) {
  const displayedSubcategories = subcategories.slice(0, maxItems);
  const remaining = subcategories.length - maxItems;

  return (
    <div className="flex-1">
      <h4 className="mb-3 text-sm font-medium text-gray-900">
        Alt Kategoriler
      </h4>
      <div className="space-y-2">
        {displayedSubcategories.map((subcategory) => (
          <div key={subcategory.id} className="space-y-2">
            {/* Subcategory Header */}
            <div
              className="group flex cursor-pointer items-center justify-between rounded-lg border border-gray-100 p-3 transition-all hover:border-gray-200 hover:bg-gray-50 hover:shadow-sm"
              onClick={(e) => onToggle(subcategory.id, e)}
            >
              <div className="flex flex-1 items-center gap-2">
                <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-gray-900">
                  {subcategory.name}
                </span>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500 transition-colors group-hover:bg-gray-200">
                  {subcategory.serviceCount}
                </span>
              </div>
              {subcategory.popularServices &&
                subcategory.popularServices.length > 0 && (
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-all group-hover:text-gray-600 ${
                      expandedIds.has(subcategory.id) ? 'rotate-180' : ''
                    }`}
                  />
                )}
            </div>

            {/* Expanded Services */}
            {expandedIds.has(subcategory.id) && subcategory.popularServices && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="ml-4 space-y-1 overflow-hidden"
              >
                <div className="mb-2 text-xs font-medium text-gray-600">
                  {subcategory.serviceCount} Hizmet Türü:
                </div>
                <div className="grid max-h-96 grid-cols-1 gap-1 overflow-y-auto">
                  {subcategory.popularServices.map(
                    (service: string, index: number) => (
                      <div
                        key={index}
                        className="group flex cursor-pointer items-center gap-2 rounded-r border-l-2 border-blue-100 p-2 pl-3 text-sm text-gray-700 transition-colors hover:border-blue-200 hover:bg-blue-50"
                      >
                        <span className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-400 transition-colors group-hover:bg-blue-500"></span>
                        <span className="transition-colors group-hover:text-blue-700">
                          {service}
                        </span>
                      </div>
                    )
                  )}
                </div>
                {subcategory.popularServices.length > 0 && (
                  <div className="mt-2 border-t border-blue-100 p-1 pt-2 pl-3 text-xs text-blue-600">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        Toplam: {subcategory.popularServices.length} hizmet türü
                      </span>
                      <span className="text-gray-500">
                        Ort. fiyat: {formatPrice(subcategory.averagePrice)}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        ))}

        {remaining > 0 && (
          <div className="pt-2 text-center text-xs text-gray-500">
            +{remaining} alt kategori daha
          </div>
        )}
      </div>
    </div>
  );
}
