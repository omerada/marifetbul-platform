/**
 * Admin Settings Component
 *
 * Main coordinator for platform settings management.
 * Refactored: 1,133 lines → 189 lines (-83.3%)
 *
 * Architecture:
 * - Uses useAdminSettings custom hook for state management
 * - Renders 7 specialized panel components based on active tab
 * - Centralized save/reset functionality
 * - Type-safe settings updates
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import {
  Save,
  RefreshCw,
  Settings,
  Shield,
  Mail,
  CreditCard,
  Globe,
  Zap,
  AlertTriangle,
  CheckCircle,
  FileText,
  Wrench,
} from 'lucide-react';
import { useState } from 'react';
import {
  useAdminSettings,
  type PlatformSettings,
} from './hooks/useAdminSettings';
import {
  GeneralSettingsPanel,
  PaymentSettingsPanel,
  SecuritySettingsPanel,
  EmailSettingsPanel,
  FeaturesSettingsPanel,
  ContentSettingsPanel,
  MaintenanceSettingsPanel,
} from './settings-panels';

type SettingsTab =
  | 'general'
  | 'payment'
  | 'security'
  | 'email'
  | 'features'
  | 'content'
  | 'maintenance';

const tabs: Array<{
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  {
    id: 'general',
    label: 'Genel',
    icon: Globe,
    description: 'Site ayarları ve yapılandırması',
  },
  {
    id: 'payment',
    label: 'Ödeme',
    icon: CreditCard,
    description: 'Ödeme sistemi ve komisyon ayarları',
  },
  {
    id: 'security',
    label: 'Güvenlik',
    icon: Shield,
    description: 'Güvenlik politikaları ve kimlik doğrulama',
  },
  {
    id: 'email',
    label: 'E-posta',
    icon: Mail,
    description: 'SMTP ve e-posta şablonları',
  },
  {
    id: 'features',
    label: 'Özellikler',
    icon: Zap,
    description: 'Platform özellik anahtarları',
  },
  {
    id: 'content',
    label: 'İçerik',
    icon: FileText,
    description: 'İçerik moderasyonu ve yönetimi',
  },
  {
    id: 'maintenance',
    label: 'Bakım',
    icon: Wrench,
    description: 'Bakım modu ve zamanlanmış bakım',
  },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const {
    settings,
    isLoading,
    isSaving,
    error,
    hasChanges,
    fetchSettings,
    saveSettings,
    updateSetting,
    updateNestedSetting,
    resetChanges,
  } = useAdminSettings();

  // Generic update handler for panel components
  const handleUpdate = <S extends keyof PlatformSettings>(
    section: S,
    field: keyof PlatformSettings[S],
    value: any
  ) => {
    updateSetting(section, field, value);
  };

  // Generic nested update handler for panel components
  const handleNestedUpdate = <S extends keyof PlatformSettings>(
    section: S,
    nestedField: keyof PlatformSettings[S],
    field: string,
    value: string | number | boolean
  ) => {
    updateNestedSetting(section, nestedField, field, value);
  };

  // Render active panel
  const renderPanel = () => {
    if (!settings) return null;

    switch (activeTab) {
      case 'general':
        return (
          <GeneralSettingsPanel
            settings={settings.general}
            onUpdate={(field, value) => handleUpdate('general', field, value)}
          />
        );
      case 'payment':
        return (
          <PaymentSettingsPanel
            settings={settings.payment}
            onUpdate={(field, value) => handleUpdate('payment', field, value)}
            onUpdateNested={(nestedField, field, value) =>
              handleNestedUpdate('payment', nestedField, field, value)
            }
          />
        );
      case 'security':
        return (
          <SecuritySettingsPanel
            settings={settings.security}
            onUpdate={(field, value) => handleUpdate('security', field, value)}
            onUpdateNested={(nestedField, field, value) =>
              handleNestedUpdate('security', nestedField, field, value)
            }
          />
        );
      case 'email':
        return (
          <EmailSettingsPanel
            settings={settings.email}
            onUpdate={(field, value) => handleUpdate('email', field, value)}
          />
        );
      case 'features':
        return (
          <FeaturesSettingsPanel
            settings={settings.features}
            onUpdate={(field, value) => handleUpdate('features', field, value)}
          />
        );
      case 'content':
        return (
          <ContentSettingsPanel
            settings={settings.content}
            onUpdate={(field, value) => handleUpdate('content', field, value)}
          />
        );
      case 'maintenance':
        return (
          <MaintenanceSettingsPanel
            settings={settings.maintenance}
            onUpdate={(field, value) =>
              handleUpdate('maintenance', field, value)
            }
            onUpdateNested={(nestedField, field, value) =>
              handleNestedUpdate('maintenance', nestedField, field, value)
            }
          />
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="mx-auto h-12 w-12 animate-spin text-gray-400" />
            <p className="mt-4 text-sm text-gray-500">Ayarlar yükleniyor...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Bir Hata Oluştu
            </h3>
            <p className="mt-2 text-sm text-gray-500">{error}</p>
            <Button onClick={fetchSettings} variant="outline" className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Tekrar Dene
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Platform Ayarları
              </CardTitle>
              <p className="mt-1 text-sm text-gray-500">
                Platform genelinde geçerli olan ayarları yönetin
              </p>
            </div>
            <div className="flex items-center gap-2">
              {hasChanges && (
                <Badge variant="warning" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Kaydedilmemiş Değişiklikler
                </Badge>
              )}
              {isSaving && (
                <Badge variant="info" className="flex items-center gap-1">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Kaydediliyor...
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {/* Sidebar Tabs */}
            <div className="border-r border-gray-200 p-4 md:col-span-1">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                        isActive
                          ? 'border-l-4 border-blue-700 bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon
                        className={`mt-0.5 h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-700' : 'text-gray-400'}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium ${isActive ? 'text-blue-700' : 'text-gray-900'}`}
                        >
                          {tab.label}
                        </p>
                        <p className="line-clamp-2 text-xs text-gray-500">
                          {tab.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Panel Content */}
            <div className="p-6 md:col-span-3">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {tabs.find((t) => t.id === activeTab)?.label} Ayarları
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {tabs.find((t) => t.id === activeTab)?.description}
                </p>
              </div>

              {/* Render Active Panel */}
              <div>{renderPanel()}</div>

              {/* Action Buttons */}
              <div className="mt-8 flex items-center justify-between border-t border-gray-200 pt-6">
                <Button
                  onClick={resetChanges}
                  variant="outline"
                  disabled={!hasChanges || isSaving}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Değişiklikleri Geri Al
                </Button>
                <Button
                  onClick={saveSettings}
                  disabled={!hasChanges || isSaving}
                  className="flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Değişiklikleri Kaydet
                    </>
                  )}
                </Button>
              </div>

              {/* Success Message */}
              {!isSaving && !hasChanges && settings && (
                <div className="mt-4 flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  Tüm değişiklikler kaydedildi
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
