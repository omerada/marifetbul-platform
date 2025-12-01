'use client';

/**
 * ================================================
 * MODERATION FILTERS PANEL COMPONENT
 * ================================================
 * Collapsible filter panel for moderation queue
 *
 * Features:
 * - Content type filter (Comment, Review, Report, User, Package)
 * - Priority filter (Low, Medium, High, Urgent)
 * - Status filter (Pending, Approved, Rejected, Spam)
 * - Escalation filter
 * - Flagged items filter
 * - Date range filter
 * - Clear all filters
 * - Responsive collapse on mobile
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2 Story 2.4
 */

import { memo, useState } from 'react';
import {
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Star,
  Flag,
  User,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';

// ============================================================================
// TYPES
// ============================================================================

export type ContentType = 'comment' | 'review' | 'report' | 'user' | 'package';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'pending' | 'approved' | 'rejected' | 'spam';

export interface ModerationFilters {
  types: ContentType[];
  priorities: Priority[];
  statuses: Status[];
  escalatedOnly: boolean;
  flaggedOnly: boolean;
}

export interface ModerationFiltersPanelProps {
  /** Current active filters */
  filters: ModerationFilters;
  /** Filter change handler */
  onFiltersChange: (filters: ModerationFilters) => void;
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Custom className */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CONTENT_TYPES: {
  value: ContentType;
  label: string;
  icon: typeof MessageSquare;
}[] = [
  { value: 'comment', label: 'Yorumlar', icon: MessageSquare },
  { value: 'review', label: 'Değerlendirmeler', icon: Star },
  { value: 'report', label: 'Raporlar', icon: Flag },
  { value: 'user', label: 'Kullanıcılar', icon: User },
  { value: 'package', label: 'Paketler', icon: Package },
];

const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  {
    value: 'low',
    label: 'Düşük',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  {
    value: 'medium',
    label: 'Orta',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  {
    value: 'high',
    label: 'Yüksek',
    color:
      'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  },
  {
    value: 'urgent',
    label: 'Acil',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
];

const STATUSES: { value: Status; label: string; icon: typeof Clock }[] = [
  { value: 'pending', label: 'Bekliyor', icon: Clock },
  { value: 'approved', label: 'Onaylandı', icon: CheckCircle },
  { value: 'rejected', label: 'Reddedildi', icon: XCircle },
  { value: 'spam', label: 'Spam', icon: AlertTriangle },
];

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ModerationFiltersPanel Component
 *
 * Collapsible filter panel for moderation queue with multiple filter options
 *
 * @example
 * ```tsx
 * <ModerationFiltersPanel
 *   filters={currentFilters}
 *   onFiltersChange={handleFiltersChange}
 *   defaultCollapsed={false}
 * />
 * ```
 */
export const ModerationFiltersPanel = memo<ModerationFiltersPanelProps>(
  ({ filters, onFiltersChange, defaultCollapsed = false, className = '' }) => {
    const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

    /**
     * Toggle content type filter
     */
    const toggleType = (type: ContentType) => {
      const newTypes = filters.types.includes(type)
        ? filters.types.filter((t) => t !== type)
        : [...filters.types, type];
      onFiltersChange({ ...filters, types: newTypes });
    };

    /**
     * Toggle priority filter
     */
    const togglePriority = (priority: Priority) => {
      const newPriorities = filters.priorities.includes(priority)
        ? filters.priorities.filter((p) => p !== priority)
        : [...filters.priorities, priority];
      onFiltersChange({ ...filters, priorities: newPriorities });
    };

    /**
     * Toggle status filter
     */
    const toggleStatus = (status: Status) => {
      const newStatuses = filters.statuses.includes(status)
        ? filters.statuses.filter((s) => s !== status)
        : [...filters.statuses, status];
      onFiltersChange({ ...filters, statuses: newStatuses });
    };

    /**
     * Clear all filters
     */
    const clearFilters = () => {
      onFiltersChange({
        types: [],
        priorities: [],
        statuses: [],
        escalatedOnly: false,
        flaggedOnly: false,
      });
    };

    /**
     * Count active filters
     */
    const activeFiltersCount =
      filters.types.length +
      filters.priorities.length +
      filters.statuses.length +
      (filters.escalatedOnly ? 1 : 0) +
      (filters.flaggedOnly ? 1 : 0);

    return (
      <div className={`bg-card rounded-lg border ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <h3 className="font-semibold">Filtreler</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="default" className="ml-2">
                {activeFiltersCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={clearFilters}
                className="flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Temizle
              </Button>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label={isCollapsed ? 'Expand filters' : 'Collapse filters'}
            >
              {isCollapsed ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronUp className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Filter Content */}
        {!isCollapsed && (
          <div className="space-y-4 p-4">
            {/* Content Type Filter */}
            <div>
              <h4 className="text-muted-foreground mb-2 text-sm font-medium">
                İçerik Tipi
              </h4>
              <div className="flex flex-wrap gap-2">
                {CONTENT_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isActive = filters.types.includes(type.value);
                  return (
                    <button
                      key={type.value}
                      onClick={() => toggleType(type.value)}
                      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-all ${
                        isActive
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <h4 className="text-muted-foreground mb-2 text-sm font-medium">
                Öncelik
              </h4>
              <div className="flex flex-wrap gap-2">
                {PRIORITIES.map((priority) => {
                  const isActive = filters.priorities.includes(priority.value);
                  return (
                    <button
                      key={priority.value}
                      onClick={() => togglePriority(priority.value)}
                      className={`rounded-md border px-3 py-1.5 text-sm font-medium transition-all ${
                        isActive
                          ? `${priority.color} border-transparent`
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      {priority.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <h4 className="text-muted-foreground mb-2 text-sm font-medium">
                Durum
              </h4>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((status) => {
                  const Icon = status.icon;
                  const isActive = filters.statuses.includes(status.value);
                  return (
                    <button
                      key={status.value}
                      onClick={() => toggleStatus(status.value)}
                      className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-all ${
                        isActive
                          ? 'border-primary bg-primary/10 text-primary font-medium'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {status.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Special Filters */}
            <div className="border-t pt-4">
              <h4 className="text-muted-foreground mb-2 text-sm font-medium">
                Özel Filtreler
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      escalatedOnly: !filters.escalatedOnly,
                    })
                  }
                  className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-all ${
                    filters.escalatedOnly
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <AlertTriangle className="h-4 w-4" />
                  Sadece Yönetilmiş
                </button>
                <button
                  onClick={() =>
                    onFiltersChange({
                      ...filters,
                      flaggedOnly: !filters.flaggedOnly,
                    })
                  }
                  className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-all ${
                    filters.flaggedOnly
                      ? 'border-primary bg-primary/10 text-primary font-medium'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Flag className="h-4 w-4" />
                  Sadece İşaretlenmiş
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

ModerationFiltersPanel.displayName = 'ModerationFiltersPanel';

export default ModerationFiltersPanel;
