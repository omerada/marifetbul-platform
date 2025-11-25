'use client';

/**
 * Privacy Settings Widget Component
 * Sprint 1 - Story 1.4: Privacy Settings
 *
 * Compact privacy settings overview and quick access widget
 *
 * @version 1.0.0
 * @since 2025-11-25
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield,
  Eye,
  EyeOff,
  Globe,
  Search,
  ChevronRight,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PrivacySettings } from '@/lib/api/privacy-settings';

export interface PrivacySettingsWidgetProps {
  /** Privacy settings data */
  settings?: PrivacySettings;

  /** Loading state */
  loading?: boolean;

  /** Click handler to open full settings */
  onOpenSettings?: () => void;

  /** Custom className */
  className?: string;

  /** Show compact version */
  compact?: boolean;
}

/**
 * Calculate privacy score (0-100)
 */
function calculatePrivacyScore(settings: PrivacySettings): number {
  const restrictiveSettings = [
    !settings.profileVisible,
    !settings.showEmail,
    !settings.showPhone,
    !settings.searchable,
    !settings.showInRecommendations,
    !settings.showOnlineStatus,
    !settings.showLastActive,
    !settings.shareAnalytics,
    !settings.shareActivity,
    !settings.allowMessagesFromAnyone,
    !settings.publicProfileEnabled,
    !settings.indexedBySearchEngines,
  ];

  const restrictiveCount = restrictiveSettings.filter(Boolean).length;
  return Math.round((restrictiveCount / restrictiveSettings.length) * 100);
}

/**
 * Get privacy level based on score
 */
function getPrivacyLevel(score: number): {
  label: string;
  color: string;
  icon: typeof Shield;
  description: string;
} {
  if (score >= 70) {
    return {
      label: 'Yüksek Gizlilik',
      color: 'text-green-600',
      icon: Lock,
      description: 'Profiliniz çok iyi korunuyor',
    };
  }

  if (score >= 40) {
    return {
      label: 'Dengeli',
      color: 'text-blue-600',
      icon: Shield,
      description: 'Gizlilik ve görünürlük dengeli',
    };
  }

  return {
    label: 'Açık Profil',
    color: 'text-yellow-600',
    icon: AlertTriangle,
    description: 'Profiliniz herkese açık',
  };
}

/**
 * Privacy Settings Widget Component
 */
export function PrivacySettingsWidget({
  settings,
  loading = false,
  onOpenSettings,
  className = '',
  compact = false,
}: PrivacySettingsWidgetProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (loading) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg border border-gray-200 bg-white p-6',
          className
        )}
      >
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div
        className={cn(
          'rounded-lg border border-yellow-200 bg-yellow-50 p-6',
          className
        )}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-900">
              Gizlilik Ayarları Yok
            </h3>
            <p className="mt-1 text-sm text-yellow-700">
              Gizlilik ayarlarınızı yapılandırmak için tıklayın
            </p>
          </div>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="text-sm font-medium text-yellow-600 hover:text-yellow-700"
            >
              Ayarla
            </button>
          )}
        </div>
      </div>
    );
  }

  const privacyScore = calculatePrivacyScore(settings);
  const privacyLevel = getPrivacyLevel(privacyScore);
  const LevelIcon = privacyLevel.icon;

  if (compact) {
    return (
      <button
        onClick={onOpenSettings}
        className={cn(
          'group flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white p-4 text-left transition-all hover:border-blue-500 hover:shadow-sm',
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-100 p-2">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Gizlilik</h3>
            <p className={cn('text-sm font-medium', privacyLevel.color)}>
              {privacyLevel.label}
            </p>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white shadow-sm',
        className
      )}
    >
      {/* Header */}
      <div className="border-b border-gray-100 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Gizlilik Ayarları
              </h3>
              <p className="text-sm text-gray-600">
                Profil görünürlüğünüzü kontrol edin
              </p>
            </div>
          </div>
          {onOpenSettings && (
            <button
              onClick={onOpenSettings}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Düzenle
            </button>
          )}
        </div>
      </div>

      {/* Privacy Score */}
      <div className="p-6">
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Gizlilik Skoru
            </span>
            <span className={cn('text-lg font-bold', privacyLevel.color)}>
              {privacyScore}%
            </span>
          </div>

          <div className="h-3 overflow-hidden rounded-full bg-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${privacyScore}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn(
                'h-full rounded-full',
                privacyScore >= 70 && 'bg-green-500',
                privacyScore >= 40 && privacyScore < 70 && 'bg-blue-500',
                privacyScore < 40 && 'bg-yellow-500'
              )}
            />
          </div>
        </div>

        <div className="mb-6 flex items-start gap-3 rounded-lg bg-gray-50 p-4">
          <LevelIcon className={cn('mt-0.5 h-5 w-5', privacyLevel.color)} />
          <div>
            <p className={cn('font-semibold', privacyLevel.color)}>
              {privacyLevel.label}
            </p>
            <p className="mt-1 text-sm text-gray-600">
              {privacyLevel.description}
            </p>
          </div>
        </div>

        {/* Quick Overview */}
        <div className="space-y-3">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex w-full items-center justify-between text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <span>Ayar Özeti</span>
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform',
                showDetails && 'rotate-90'
              )}
            />
          </button>

          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <SettingItem
                icon={settings.profileVisible ? Eye : EyeOff}
                label="Profil Görünürlüğü"
                value={settings.profileVisible ? 'Görünür' : 'Gizli'}
                enabled={settings.profileVisible}
              />

              <SettingItem
                icon={Search}
                label="Aranabilirlik"
                value={settings.searchable ? 'Etkin' : 'Devre Dışı'}
                enabled={settings.searchable}
              />

              <SettingItem
                icon={Globe}
                label="Genel Profil"
                value={settings.publicProfileEnabled ? 'Etkin' : 'Devre Dışı'}
                enabled={settings.publicProfileEnabled}
              />

              <SettingItem
                icon={CheckCircle2}
                label="Arama Motorları"
                value={
                  settings.indexedBySearchEngines ? 'İzinli' : 'Engellenmiş'
                }
                enabled={settings.indexedBySearchEngines}
              />
            </motion.div>
          )}
        </div>
      </div>

      {/* Footer */}
      {onOpenSettings && (
        <div className="border-t border-gray-100 p-4">
          <button
            onClick={onOpenSettings}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            <Shield className="h-4 w-4" />
            Tüm Gizlilik Ayarları
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Setting Item Component
 */
interface SettingItemProps {
  icon: typeof Eye;
  label: string;
  value: string;
  enabled: boolean;
}

function SettingItem({ icon: Icon, label, value, enabled }: SettingItemProps) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white p-3">
      <div className="flex items-center gap-2">
        <Icon
          className={cn('h-4 w-4', enabled ? 'text-blue-600' : 'text-gray-400')}
        />
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <span
        className={cn(
          'text-sm font-medium',
          enabled ? 'text-green-600' : 'text-gray-500'
        )}
      >
        {value}
      </span>
    </div>
  );
}

export default PrivacySettingsWidget;
