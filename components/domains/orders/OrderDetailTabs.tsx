/**
 * ================================================
 * ORDER DETAIL TABS
 * ================================================
 * Tab navigation for order detail page
 * Sprint 1 - Story 1.1 (8 SP)
 *
 * Features:
 * - Details, Milestones, Messages tabs
 * - Role-based visibility
 * - Active state management
 * - Mobile responsive
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since Sprint 1 - Story 1.1
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Package, FileText, MessageCircle, CheckCircle2 } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export type OrderTab = 'details' | 'milestones' | 'messages';

export interface OrderDetailTabsProps {
  /** Current active tab */
  activeTab: OrderTab;
  /** Tab change callback */
  onTabChange: (tab: OrderTab) => void;
  /** Whether order has milestones */
  hasMilestones?: boolean;
  /** Number of unread messages */
  unreadMessages?: number;
  /** Number of pending milestones (for employer) */
  pendingMilestones?: number;
  /** Disabled tabs */
  disabledTabs?: OrderTab[];
  /** Custom className */
  className?: string;
}

// ============================================================================
// TAB CONFIGURATION
// ============================================================================

interface TabConfig {
  id: OrderTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  description?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * OrderDetailTabs Component
 *
 * @example
 * ```tsx
 * <OrderDetailTabs
 *   activeTab="details"
 *   onTabChange={setActiveTab}
 *   hasMilestones={true}
 *   unreadMessages={3}
 *   pendingMilestones={2}
 * />
 * ```
 */
export function OrderDetailTabs({
  activeTab,
  onTabChange,
  hasMilestones = false,
  unreadMessages = 0,
  pendingMilestones = 0,
  disabledTabs = [],
  className,
}: OrderDetailTabsProps) {
  const tabs: TabConfig[] = [
    {
      id: 'details',
      label: 'Detaylar',
      icon: FileText,
      description: 'Sipariş bilgileri ve ödeme durumu',
    },
    {
      id: 'milestones',
      label: "Milestone'lar",
      icon: Package,
      badge: pendingMilestones > 0 ? pendingMilestones : undefined,
      description: hasMilestones
        ? `${pendingMilestones} milestone onay bekliyor`
        : 'Henüz milestone tanımlanmamış',
    },
    {
      id: 'messages',
      label: 'Mesajlar',
      icon: MessageCircle,
      badge: unreadMessages > 0 ? unreadMessages : undefined,
      description:
        unreadMessages > 0
          ? `${unreadMessages} okunmamış mesaj`
          : 'Müşteri ile mesajlaşma',
    },
  ];

  return (
    <div className={cn('border-b border-gray-200', className)}>
      {/* Desktop Tabs */}
      <div className="hidden sm:block">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isDisabled = disabledTabs.includes(tab.id);

            // Special styling for milestones tab when no milestones exist
            const isMilestonesEmpty = tab.id === 'milestones' && !hasMilestones;

            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && onTabChange(tab.id)}
                disabled={isDisabled}
                className={cn(
                  'group inline-flex items-center gap-2 border-b-2 px-1 py-4 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                  isDisabled && 'cursor-not-allowed opacity-50',
                  isMilestonesEmpty && 'opacity-60'
                )}
                aria-current={isActive ? 'page' : undefined}
                title={tab.description}
              >
                <Icon
                  className={cn(
                    'h-5 w-5',
                    isActive
                      ? 'text-blue-600'
                      : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                <span>{tab.label}</span>

                {/* Badge for notifications */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="ml-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}

                {/* Success indicator for completed milestones */}
                {tab.id === 'milestones' &&
                  hasMilestones &&
                  pendingMilestones === 0 && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Tabs (Dropdown or Compact) */}
      <div className="sm:hidden">
        <select
          value={activeTab}
          onChange={(e) => onTabChange(e.target.value as OrderTab)}
          className="block w-full rounded-md border-gray-300 py-2 pr-10 pl-3 text-base focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
        >
          {tabs.map((tab) => (
            <option
              key={tab.id}
              value={tab.id}
              disabled={disabledTabs.includes(tab.id)}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && ` (${tab.badge})`}
            </option>
          ))}
        </select>
      </div>

      {/* Tab Description (Mobile) */}
      {tabs.find((t) => t.id === activeTab)?.description && (
        <div className="mt-2 text-xs text-gray-500 sm:hidden">
          {tabs.find((t) => t.id === activeTab)?.description}
        </div>
      )}
    </div>
  );
}

export default OrderDetailTabs;
