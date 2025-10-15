/**
 * SidebarSubItems Component
 *
 * Sub-navigation items (nested menu)
 */

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import {
  isPathActive,
  formatBadgeValue,
  getBadgeVariant,
} from '../utils/sidebarHelpers';
import type { SidebarSubItemsProps } from '../types/sidebarTypes';

export function SidebarSubItems({ subItems, pathname }: SidebarSubItemsProps) {
  return (
    <div className="border-border mt-1 ml-6 space-y-1 border-l-2 pl-4">
      {subItems?.map((subItem) => {
        const isActive = isPathActive(pathname, subItem.href);

        return (
          <Link
            key={subItem.href}
            href={subItem.href}
            className={cn(
              'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-primary/10 text-primary font-medium'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            )}
          >
            <span>{subItem.name}</span>
            {subItem.badge && (
              <Badge variant={getBadgeVariant(subItem.badge)} className="ml-2">
                {formatBadgeValue(subItem.badge)}
              </Badge>
            )}
          </Link>
        );
      })}
    </div>
  );
}
