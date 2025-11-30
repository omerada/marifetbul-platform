/**
 * CategoryStats Component
 *
 * Statistics display for category (service count, price, rating, response time)
 */

import { Clock } from 'lucide-react'; 
import type { CategoryStatsProps } from '../types/categoryCardTypes';
import { formatPrice } from '@/lib/shared/utils/payment';
import { formatNumber } from '@/lib/utils';

export function CategoryStats({
  category,
  variant,
  showStats,
}: CategoryStatsProps) {
  if (!showStats) return null;

  // Compact variant - inline display
  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        <div className="text-xs text-gray-600">
          <span className="font-medium text-gray-900">
            {formatNumber(category.serviceCount)}
          </span>{' '}
          hizmet
        </div>
      </div>
    );
  }

  // Featured variant - 2 column grid
  if (variant === 'featured') {
    return (
      <div className="grid grid-cols-2 gap-4 border-y border-gray-100 py-3">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(category.serviceCount)}
          </div>
          <div className="text-xs text-gray-500">Hizmet</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">
            {formatPrice(category.averagePrice)}
          </div>
          <div className="text-xs text-gray-500">Ort. Fiyat</div>
        </div>
      </div>
    );
  }

  // Detailed variant - 4 column grid
  if (variant === 'detailed') {
    return (
      <div className="grid grid-cols-4 gap-4 border-y border-gray-100 py-4">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {formatNumber(category.serviceCount)}
          </div>
          <div className="text-xs text-gray-500">Hizmet</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-900">
            {formatPrice(category.averagePrice)}
          </div>
          <div className="text-xs text-gray-500">Ort. Fiyat</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">
            {category.stats.averageRating.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500">Rating</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-lg font-bold text-blue-600">
            <Clock className="h-3 w-3" />
            {category.stats.responseTime}s
          </div>
          <div className="text-xs text-gray-500">Yanıt</div>
        </div>
      </div>
    );
  }

  // Default variant - 2 item inline display
  return (
    <div className="flex items-center justify-between border-t border-gray-100 py-3">
      <div className="text-sm text-gray-600">
        <span className="font-medium text-gray-900">
          {formatNumber(category.serviceCount)}
        </span>{' '}
        hizmet
      </div>
      <div className="text-sm text-gray-600">
        <span className="font-medium text-gray-900">
          {formatPrice(category.averagePrice)}
        </span>{' '}
        ort.
      </div>
    </div>
  );
}
