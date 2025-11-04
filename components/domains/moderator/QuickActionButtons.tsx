/**
 * ================================================
 * QUICK ACTION BUTTONS COMPONENT
 * ================================================
 * Quick navigation buttons to moderator queues with action counters
 *
 * Features:
 * - Navigation to pending queues
 * - Real-time action counters
 * - Keyboard shortcuts
 * - Visual priority indicators
 *
 * Sprint 2 - Task 2.4: Quick Action Buttons
 * Sprint 3 - Task 3.1: Performance Optimization
 *
 * @author MarifetBul Development Team
 * @version 2.0.0
 * @updated November 4, 2025
 *
 * Changes (v2.0.0 - Sprint 3):
 * - Added React.memo for component memoization
 * - Implemented useCallback for event handlers
 * - Memoized QUICK_ACTIONS with useMemo
 * - Optimized keyboard shortcut handlers
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useCallback, memo } from 'react';
import {
  MessageSquare,
  Star,
  Flag,
  Headphones,
  ChevronRight,
  Keyboard,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useModerationStats } from '@/hooks/business/useModeration';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

interface QuickActionButton {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
  countKey: keyof ModerationStatsCounters;
  color: string;
  bgColor: string;
  borderColor: string;
  shortcut: string;
}

interface ModerationStatsCounters {
  pendingComments: number;
  pendingReviews: number;
  pendingReports: number;
  pendingSupportTickets: number;
}

export interface QuickActionButtonsProps {
  /**
   * Auto-refresh interval in milliseconds (default: 30000 = 30s)
   */
  refreshInterval?: number;
  /**
   * Show keyboard shortcuts (default: true)
   */
  showShortcuts?: boolean;
  /**
   * Additional CSS classes
   */
  className?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const QUICK_ACTIONS: QuickActionButton[] = [
  {
    id: 'comments',
    label: 'Yorumlar',
    description: 'Bekleyen yorumları incele',
    icon: MessageSquare,
    route: '/moderator/comments',
    countKey: 'pendingComments',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50 hover:bg-blue-100',
    borderColor: 'border-blue-200 hover:border-blue-300',
    shortcut: 'C',
  },
  {
    id: 'reviews',
    label: 'Değerlendirmeler',
    description: 'Bekleyen değerlendirmeleri incele',
    icon: Star,
    route: '/moderator/reviews',
    countKey: 'pendingReviews',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50 hover:bg-yellow-100',
    borderColor: 'border-yellow-200 hover:border-yellow-300',
    shortcut: 'R',
  },
  {
    id: 'reports',
    label: 'Şikayetler',
    description: 'Kullanıcı şikayetlerini incele',
    icon: Flag,
    route: '/moderator/reports',
    countKey: 'pendingReports',
    color: 'text-red-700',
    bgColor: 'bg-red-50 hover:bg-red-100',
    borderColor: 'border-red-200 hover:border-red-300',
    shortcut: 'S',
  },
  {
    id: 'tickets',
    label: 'Destek Talepleri',
    description: 'Açık destek taleplerini incele',
    icon: Headphones,
    route: '/moderator/tickets',
    countKey: 'pendingSupportTickets',
    color: 'text-green-700',
    bgColor: 'bg-green-50 hover:bg-green-100',
    borderColor: 'border-green-200 hover:border-green-300',
    shortcut: 'T',
  },
];

// ============================================================================
// MAIN COMPONENT (Memoized with optimizations)
// ============================================================================

export const QuickActionButtons = memo(function QuickActionButtons({
  refreshInterval = 30000,
  showShortcuts = true,
  className,
}: QuickActionButtonsProps) {
  const router = useRouter();
  const { stats, isLoading } = useModerationStats(refreshInterval);

  // Memoize count getter for performance
  const getCount = useCallback(
    (countKey: keyof ModerationStatsCounters): number => {
      if (!stats) return 0;
      return stats[countKey] || 0;
    },
    [stats]
  );

  // Memoize high priority check
  const isHighPriority = useCallback((count: number): boolean => {
    return count > 10;
  }, []);

  // Handle action click with useCallback
  const handleActionClick = useCallback(
    (route: string) => {
      router.push(route);
    },
    [router]
  );

  // Handle keyboard shortcuts with useCallback
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Only trigger if Ctrl/Cmd + Shift is pressed
      if (!((event.ctrlKey || event.metaKey) && event.shiftKey)) return;

      const key = event.key.toUpperCase();
      const action = QUICK_ACTIONS.find((a) => a.shortcut === key);

      if (action) {
        event.preventDefault();
        router.push(action.route);
      }
    },
    [router]
  );

  // Set up keyboard shortcuts
  useEffect(() => {
    if (!showShortcuts) return;

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showShortcuts, handleKeyPress]);

  return (
    <div
      className={cn('space-y-4', className)}
      role="region"
      aria-labelledby="quick-actions-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3
            id="quick-actions-heading"
            className="text-lg font-semibold text-gray-900"
          >
            Hızlı İşlemler
          </h3>
          <p className="text-sm text-gray-600">
            Bekleyen işlemlere hızlıca ulaşın
          </p>
        </div>
        {showShortcuts && (
          <div
            className="flex items-center gap-2 text-xs text-gray-500"
            role="status"
          >
            <Keyboard className="h-4 w-4" aria-hidden="true" />
            <span>Ctrl+Shift+Tuş</span>
          </div>
        )}
      </div>

      {/* Action Buttons Grid */}
      <div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        role="list"
        aria-label="Hızlı işlem butonları"
      >
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          const count = getCount(action.countKey);
          const isHigh = isHighPriority(count);

          return (
            <Card
              key={action.id}
              role="article"
              tabIndex={0}
              aria-labelledby={`action-${action.id}-label`}
              aria-describedby={`action-${action.id}-desc`}
              className={cn(
                'group relative cursor-pointer border-2 transition-all',
                action.borderColor,
                action.bgColor,
                isHigh && 'ring-2 ring-red-400 ring-offset-2'
              )}
              onClick={() => handleActionClick(action.route)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleActionClick(action.route);
                }
              }}
            >
              <div className="p-4">
                {/* Header with Icon and Count */}
                <div className="mb-3 flex items-start justify-between">
                  <div
                    className={cn(
                      'rounded-lg p-2',
                      action.bgColor.replace('hover:', '')
                    )}
                    aria-hidden="true"
                  >
                    <Icon className={cn('h-6 w-6', action.color)} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {isLoading ? (
                      <div
                        className="h-8 w-12 animate-pulse rounded bg-gray-200"
                        role="status"
                        aria-label="Yükleniyor"
                      />
                    ) : (
                      <span
                        className={cn(
                          'text-2xl font-bold',
                          action.color,
                          isHigh && 'animate-pulse text-red-600'
                        )}
                        aria-label={`${count} bekleyen ${action.label.toLowerCase()}`}
                      >
                        {count}
                      </span>
                    )}
                    {showShortcuts && (
                      <Badge
                        variant="outline"
                        className="font-mono text-xs opacity-60 group-hover:opacity-100"
                        aria-label={`Klavye kısayolu: Ctrl Shift ${action.shortcut}`}
                      >
                        ⌘⇧{action.shortcut}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Label and Description */}
                <div className="mb-2">
                  <h4
                    id={`action-${action.id}-label`}
                    className={cn('font-semibold', action.color)}
                  >
                    {action.label}
                  </h4>
                  <p
                    id={`action-${action.id}-desc`}
                    className="text-xs text-gray-600"
                  >
                    {action.description}
                  </p>
                </div>

                {/* Priority Badge */}
                {isHigh && (
                  <Badge
                    variant="destructive"
                    className="mb-2 text-xs"
                    role="status"
                    aria-live="polite"
                  >
                    Yüksek Öncelik
                  </Badge>
                )}

                {/* Go Arrow */}
                <div className="mt-2 flex items-center justify-end text-xs font-medium text-gray-600 group-hover:text-gray-900">
                  <span>Görüntüle</span>
                  <ChevronRight
                    className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Keyboard Shortcuts Help */}
      {showShortcuts && (
        <Card
          className="bg-gray-50 p-4"
          role="complementary"
          aria-labelledby="shortcuts-heading"
        >
          <div className="flex items-start gap-3">
            <Keyboard className="h-5 w-5 text-gray-600" aria-hidden="true" />
            <div className="flex-1">
              <h4
                id="shortcuts-heading"
                className="mb-2 text-sm font-semibold text-gray-900"
              >
                Klavye Kısayolları
              </h4>
              <div
                className="grid grid-cols-2 gap-2 text-xs text-gray-600 md:grid-cols-4"
                role="list"
              >
                {QUICK_ACTIONS.map((action) => (
                  <div
                    key={action.id}
                    className="flex items-center gap-2"
                    role="listitem"
                  >
                    <kbd
                      className="rounded border border-gray-300 bg-white px-2 py-1 font-mono"
                      aria-label={`Ctrl Shift ${action.shortcut}`}
                    >
                      ⌘⇧{action.shortcut}
                    </kbd>
                    <span>{action.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
});

// Display name for debugging
QuickActionButtons.displayName = 'QuickActionButtons';

export default QuickActionButtons;
