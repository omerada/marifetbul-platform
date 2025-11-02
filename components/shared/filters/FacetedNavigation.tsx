'use client';

import { useState, useCallback } from 'react';
import { Badge } from '@/components/ui/Badge';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  ChevronDown,
  ChevronRight,
  Hash,
  MapPin,
  Briefcase,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * FacetedNavigation Component - Sprint 4 Day 2
 *
 * Displays filterable facets with result counts:
 * - Categories with counts
 * - Skills/tags with counts
 * - Locations with counts
 *
 * Features:
 * - Collapsible sections
 * - Show more/less (default 5 items)
 * - Active facet highlighting
 * - Real-time count updates
 * - Multi-select support
 */

export interface Facet {
  value: string;
  label: string;
  count: number;
}

export interface FacetGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  facets: Facet[];
}

export interface FacetedNavigationProps {
  /** Facet groups to display */
  facetGroups: FacetGroup[];
  /** Currently selected facets by group */
  selectedFacets: Record<string, string[]>;
  /** Callback when facet is toggled */
  onFacetToggle: (groupId: string, facetValue: string) => void;
  /** Number of items to show initially per group */
  initialShowCount?: number;
  /** Loading state */
  isLoading?: boolean;
  /** Custom className */
  className?: string;
  /** Show facet counts */
  showCounts?: boolean;
  /** Allow multiple selections per group */
  multiSelect?: boolean;
}

const DEFAULT_SHOW_COUNT = 5;

export function FacetedNavigation({
  facetGroups,
  selectedFacets,
  onFacetToggle,
  initialShowCount = DEFAULT_SHOW_COUNT,
  isLoading = false,
  className,
  showCounts = true,
  multiSelect = true,
}: FacetedNavigationProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(facetGroups.map((g) => g.id))
  );
  const [showMoreGroups, setShowMoreGroups] = useState<Set<string>>(new Set());

  // Toggle group expansion
  const toggleGroupExpansion = useCallback((groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  // Toggle show more/less
  const toggleShowMore = useCallback((groupId: string) => {
    setShowMoreGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  // Check if facet is selected
  const isFacetSelected = useCallback(
    (groupId: string, facetValue: string) => {
      return selectedFacets[groupId]?.includes(facetValue) ?? false;
    },
    [selectedFacets]
  );

  // Calculate total selected count per group
  const getSelectedCount = useCallback(
    (groupId: string) => {
      return selectedFacets[groupId]?.length ?? 0;
    },
    [selectedFacets]
  );

  // Get visible facets for a group
  const getVisibleFacets = useCallback(
    (group: FacetGroup) => {
      const showMore = showMoreGroups.has(group.id);
      const facets = group.facets.slice(
        0,
        showMore ? undefined : initialShowCount
      );
      return facets;
    },
    [showMoreGroups, initialShowCount]
  );

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-3">
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((j) => (
                <div
                  key={j}
                  className="flex items-center justify-between gap-2"
                >
                  <div className="h-4 flex-1 animate-pulse rounded bg-gray-100" />
                  <div className="h-4 w-8 animate-pulse rounded bg-gray-100" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (facetGroups.length === 0) {
    return (
      <div className={cn('py-8 text-center', className)}>
        <p className="text-sm text-gray-500">Filtre seçeneği bulunamadı</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {facetGroups.map((group) => {
        const isExpanded = expandedGroups.has(group.id);
        const showMore = showMoreGroups.has(group.id);
        const visibleFacets = getVisibleFacets(group);
        const hasMore = group.facets.length > initialShowCount;
        const selectedCount = getSelectedCount(group.id);
        const Icon = group.icon;

        return (
          <div key={group.id} className="space-y-3">
            {/* Group Header */}
            <button
              onClick={() => toggleGroupExpansion(group.id)}
              className="flex w-full items-center justify-between gap-2 text-left transition-colors hover:text-blue-600"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-gray-600" />
                <span className="font-medium text-gray-900">{group.label}</span>
                {selectedCount > 0 && (
                  <Badge
                    variant="default"
                    className="h-5 min-w-[20px] bg-blue-600 px-1.5 text-xs font-semibold text-white"
                  >
                    {selectedCount}
                  </Badge>
                )}
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-gray-400 transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )}
              />
            </button>

            {/* Facets List */}
            {isExpanded && (
              <div className="space-y-1.5 pl-6">
                {visibleFacets.map((facet) => {
                  const isSelected = isFacetSelected(group.id, facet.value);

                  return (
                    <button
                      key={facet.value}
                      onClick={() => onFacetToggle(group.id, facet.value)}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-all duration-200',
                        isSelected
                          ? 'bg-blue-50 font-medium text-blue-700 ring-1 ring-blue-200'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      )}
                    >
                      <div className="flex flex-1 items-center gap-2">
                        {isSelected && multiSelect && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-blue-600" />
                        )}
                        <span className="truncate">{facet.label}</span>
                      </div>

                      {showCounts && (
                        <Badge
                          variant="outline"
                          className={cn(
                            'h-5 min-w-[28px] shrink-0 justify-center px-1.5 text-xs font-medium',
                            isSelected
                              ? 'border-blue-300 bg-blue-100 text-blue-700'
                              : 'border-gray-300 bg-gray-50 text-gray-600'
                          )}
                        >
                          {facet.count}
                        </Badge>
                      )}
                    </button>
                  );
                })}

                {/* Show More/Less Button */}
                {hasMore && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleShowMore(group.id)}
                    className="mt-2 w-full justify-center text-xs text-blue-600 hover:text-blue-700"
                  >
                    {showMore ? (
                      <>
                        <ChevronDown className="mr-1 h-3 w-3" />
                        Daha Az Göster
                      </>
                    ) : (
                      <>
                        <ChevronRight className="mr-1 h-3 w-3" />
                        {group.facets.length - initialShowCount} Daha Fazla
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Default facet groups for marketplace/search
 */
export const DEFAULT_FACET_GROUPS: FacetGroup[] = [
  {
    id: 'categories',
    label: 'Kategoriler',
    icon: Briefcase,
    facets: [],
  },
  {
    id: 'skills',
    label: 'Beceriler',
    icon: Hash,
    facets: [],
  },
  {
    id: 'locations',
    label: 'Konumlar',
    icon: MapPin,
    facets: [],
  },
];
