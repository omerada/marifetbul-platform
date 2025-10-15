/**
 * CategoryBadgeList Component
 *
 * Reusable badge list with truncation and remaining count
 */

import { Badge } from '@/components/ui';
import { getTruncatedList, getBadgeStyle } from '../utils/categoryCardHelpers';
import type { CategoryBadgeListProps } from '../types/categoryCardTypes';

export function CategoryBadgeList({
  items,
  maxItems,
  variant = 'default',
  color,
  title,
  className = '',
}: CategoryBadgeListProps) {
  if (!items || items.length === 0) return null;

  const { displayed, remaining } = maxItems
    ? getTruncatedList(items, maxItems)
    : { displayed: items, remaining: 0 };

  return (
    <div className={className}>
      {title && (
        <h4 className="mb-2 text-sm font-medium text-gray-700">{title}</h4>
      )}
      <div className="flex flex-wrap gap-1">
        {displayed.map((item, index) => {
          const badgeVariant =
            variant === 'colored'
              ? 'outline'
              : (variant as 'default' | 'outline');
          const style =
            variant === 'colored' && color ? getBadgeStyle(color) : undefined;

          return (
            <Badge
              key={index}
              variant={badgeVariant}
              className="text-xs"
              style={style}
            >
              {item}
            </Badge>
          );
        })}
        {remaining > 0 && (
          <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-1 text-xs text-gray-500">
            +{remaining}
          </span>
        )}
      </div>
    </div>
  );
}
