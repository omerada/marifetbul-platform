/**
 * CategoryServiceList Component
 *
 * Direct services list when no subcategories exist
 */

import { formatPrice } from '../utils/categoryCardHelpers';
import type { CategoryServiceListProps } from '../types/categoryCardTypes';

export function CategoryServiceList({
  services,
  priceRange,
  totalCount,
  maxHeight = '320px',
}: CategoryServiceListProps) {
  if (!services || services.length === 0) return null;

  return (
    <div className="flex-1">
      <h4 className="mb-3 text-sm font-medium text-gray-900">
        Popüler Hizmetler ({totalCount})
      </h4>
      <div className="space-y-2 overflow-y-auto" style={{ maxHeight }}>
        {services.map((service, index) => (
          <div
            key={index}
            className="group flex cursor-pointer items-center gap-3 rounded-lg border border-gray-100 p-3 text-sm text-gray-700 transition-all hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm"
          >
            <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-500 transition-colors group-hover:bg-blue-600"></span>
            <span className="font-medium transition-colors group-hover:text-blue-700">
              {service}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-gray-100 pt-3">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="font-medium">Toplam: {totalCount} hizmet türü</span>
          <span>
            Fiyat aralığı: {formatPrice(priceRange.min)} -{' '}
            {formatPrice(priceRange.max)}
          </span>
        </div>
      </div>
    </div>
  );
}
