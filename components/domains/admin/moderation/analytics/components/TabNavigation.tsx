/**
 * Tab Navigation Component
 *
 * Simple tab navigation for moderation analytics dashboard.
 */

import { BarChart3, Users, Zap, AlertTriangle, FileText } from 'lucide-react';
import type { TabType } from '../types/moderationAnalytics';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const tabs: Array<{ value: TabType; label: string; icon: typeof BarChart3 }> = [
  { value: 'overview', label: 'Genel Bakış', icon: BarChart3 },
  { value: 'moderators', label: 'Moderatörler', icon: Users },
  { value: 'automation', label: 'Otomasyon', icon: Zap },
  { value: 'risk', label: 'Risk Analizi', icon: AlertTriangle },
  { value: 'reports', label: 'Raporlar', icon: FileText },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={`group inline-flex items-center border-b-2 px-1 py-4 text-sm font-medium ${
                isActive
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } `}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={`mr-2 -ml-0.5 h-5 w-5 ${isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'} `}
                aria-hidden="true"
              />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
