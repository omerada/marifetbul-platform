/**
 * Tab Navigation Component
 *
 * Navigation tabs for switching between analytics views.
 */

import {
  BarChart3,
  UserCheck,
  Zap,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import type { TabType } from '../types/moderationAnalytics';

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const TABS = [
  { id: 'overview' as TabType, label: 'Genel Bakış', Icon: BarChart3 },
  { id: 'moderators' as TabType, label: 'Moderatörler', Icon: UserCheck },
  { id: 'automation' as TabType, label: 'Otomasyon', Icon: Zap },
  { id: 'risk' as TabType, label: 'Risk Analizi', Icon: AlertTriangle },
  { id: 'reports' as TabType, label: 'Raporlar', Icon: FileText },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="border-b">
      <div className="flex">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
              activeTab === id
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
