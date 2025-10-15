/**
 * SidebarHeader Component
 *
 * Logo and collapse toggle button
 */

import Link from 'next/link';
import { ChevronLeft, Menu } from 'lucide-react';
import { Button } from '@/components/ui';
import type { SidebarHeaderProps } from '../types/sidebarTypes';

export function SidebarHeader({
  isCollapsed,
  onToggleCollapse,
  isMobile = false,
}: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b p-4">
      <Link href="/admin" className="flex items-center space-x-2">
        <div className="bg-primary flex h-8 w-8 items-center justify-center rounded-lg">
          <span className="text-primary-foreground text-lg font-bold">M</span>
        </div>
        {!isCollapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-semibold">Marifetbul</span>
            <span className="text-muted-foreground text-xs">Admin Panel</span>
          </div>
        )}
      </Link>

      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleCollapse}
        className="h-8 w-8"
      >
        {isMobile ? (
          <Menu className="h-4 w-4" />
        ) : (
          <ChevronLeft
            className={`h-4 w-4 transition-transform ${
              isCollapsed ? 'rotate-180' : ''
            }`}
          />
        )}
      </Button>
    </div>
  );
}
