/**
 * ModerationFilters Component
 *
 * Filter controls for search, status, priority, and type
 */

import { Search, Filter, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import type { ModerationFiltersProps } from '../types/moderationTypes';

export function ModerationFilters({
  filters,
  onFilterChange,
}: ModerationFiltersProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="İçerik ara..."
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Durum{' '}
                {filters.status.length > 0 && `(${filters.status.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onFilterChange('status', [])}>
                Tümü
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onFilterChange('status', ['pending'])}
              >
                Bekleyen
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onFilterChange('status', ['approved'])}
              >
                Onaylandı
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onFilterChange('status', ['rejected'])}
              >
                Reddedildi
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Priority Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <AlertTriangle className="mr-2 h-4 w-4" />
                Öncelik{' '}
                {filters.priority.length > 0 && `(${filters.priority.length})`}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onFilterChange('priority', [])}>
                Tümü
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onFilterChange('priority', ['critical'])}
              >
                Kritik
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onFilterChange('priority', ['high'])}
              >
                Yüksek
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onFilterChange('priority', ['medium'])}
              >
                Orta
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onFilterChange('priority', ['low'])}
              >
                Düşük
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
