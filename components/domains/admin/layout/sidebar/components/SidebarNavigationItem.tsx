/**
 * SidebarNavigationItem Component
 *
 * Main navigation item with expand/collapse and active state
 */

import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { formatBadgeValue, getBadgeVariant } from '../utils/sidebarHelpers';
import type { SidebarNavigationItemProps } from '../types/sidebarTypes';
import { SidebarSubItems } from './SidebarSubItems';

export function SidebarNavigationItem({
  item,
  pathname,
  isCollapsed,
  isExpanded,
  onToggleExpand,
}: SidebarNavigationItemProps) {
  const Icon = item.icon;
  const hasSubItems = item.subItems && item.subItems.length > 0;
  const badge = item.badge;
  const isActive = item.current;

  const handleClick = () => {
    if (hasSubItems) {
      onToggleExpand(item.name);
    }
  };

  if (isCollapsed) {
    return (
      <div className="group relative">
        <Link href={item.href}>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'relative h-10 w-full',
              isActive && 'bg-primary/10 text-primary'
            )}
          >
            <Icon className="h-5 w-5" />
            {badge && (
              <span className="bg-destructive absolute top-1 right-1 h-2 w-2 rounded-full" />
            )}
          </Button>
        </Link>

        {/* Tooltip on hover */}
        <div className="bg-popover text-popover-foreground pointer-events-none absolute left-full z-50 ml-2 rounded-md px-2 py-1 text-sm whitespace-nowrap opacity-0 shadow-md transition-opacity group-hover:opacity-100">
          {item.name}
          {badge && ` (${formatBadgeValue(badge)})`}
        </div>
      </div>
    );
  }

  return (
    <div>
      {hasSubItems ? (
        <Button
          variant="ghost"
          onClick={handleClick}
          className={cn(
            'w-full justify-start',
            isActive && 'bg-primary/10 text-primary'
          )}
        >
          <div className="flex w-full items-center">
            <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="flex-1 text-left">{item.name}</span>
            {badge && (
              <Badge variant={getBadgeVariant(badge)} className="mr-2">
                {formatBadgeValue(badge)}
              </Badge>
            )}
            <ChevronDown
              className={cn(
                'h-4 w-4 transition-transform',
                isExpanded && 'rotate-180'
              )}
            />
          </div>
        </Button>
      ) : (
        <Link href={item.href}>
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start',
              isActive && 'bg-primary/10 text-primary'
            )}
          >
            <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
            <span className="flex-1">{item.name}</span>
            {badge && (
              <Badge variant={getBadgeVariant(badge)}>
                {formatBadgeValue(badge)}
              </Badge>
            )}
          </Button>
        </Link>
      )}

      {hasSubItems && isExpanded && !isCollapsed && (
        <SidebarSubItems subItems={item.subItems} pathname={pathname} />
      )}
    </div>
  );
}
