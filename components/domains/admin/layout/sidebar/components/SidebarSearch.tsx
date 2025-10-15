/**
 * SidebarSearch Component
 *
 * Search input for filtering navigation items
 */

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import type { SidebarSearchProps } from '../types/sidebarTypes';

export function SidebarSearch({
  searchQuery,
  onSearchChange,
  isCollapsed,
}: SidebarSearchProps) {
  if (isCollapsed) return null;

  return (
    <div className="p-4">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
        <Input
          type="text"
          placeholder="Menüde ara..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9 pl-9"
        />
      </div>
    </div>
  );
}
