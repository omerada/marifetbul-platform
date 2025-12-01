'use client';

import React, { useState } from 'react';
import { usePlatformSettings } from '@/hooks';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Checkbox } from '@/components/ui/Checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/AlertDialog';
import { PlatformSettings } from '@/types';
import logger from '@/lib/infrastructure/monitoring/logger';
import {
  Save,
  RefreshCw,
  Settings,
  Shield,
  DollarSign,
  Bell,
  Database,
  AlertTriangle,
} from 'lucide-react';

interface SystemSettingsProps {
  className?: string;
}

// Form sections for better organization
const SETTINGS_SECTIONS = {
  general: {
    title: 'General Settings',
    icon: Settings,
    fields: [
      'siteName',
      'siteDescription',
      'siteUrl',
      'adminEmail',
      'timezone',
    ],
  },
  security: {
    title: 'Security & Safety',
    icon: Shield,
    fields: [
      'requireEmailVerification',
      'requirePhoneVerification',
      'enableTwoFactor',
      'sessionTimeout',
    ],
  },
  payment: {
    title: 'Payment Settings',
    icon: DollarSign,
    fields: ['commissionRate', 'minimumPayout', 'paymentMethods', 'currency'],
  },
  notifications: {
    title: 'Notification Settings',
    icon: Bell,
    fields: [
      'enableEmailNotifications',
      'enablePushNotifications',
      'enableSmsNotifications',
    ],
  },
  moderation: {
    title: 'Content Moderation',
    icon: Shield,
    fields: [
      'autoModerationEnabled',
      'requireJobApproval',
      'requireServiceApproval',
    ],
  },
  system: {
    title: 'System Configuration',
    icon: Database,
    fields: ['maintenanceMode', 'registrationOpen', 'apiRateLimit'],
  },
};

export function SystemSettings({ className }: SystemSettingsProps) {
  const {
    settings,
    isLoading,
    error,
    isSaving,
    hasUnsavedChanges,
    updateSettings,
    resetSettings,
  } = usePlatformSettings();

  const [formData, setFormData] = useState(settings || {});
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('general');

  // Update form data when settings change
  React.useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleInputChange = (field: string, value: unknown) => {
    setFormData((prev: PlatformSettings) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await updateSettings(formData as Partial<PlatformSettings>);
    } catch (error) {
      logger.error(
        'Failed to save settings:',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };

  const handleReset = async () => {
    try {
      await resetSettings();
      setShowResetDialog(false);
    } catch (error) {
      logger.error(
        'Failed to reset settings:',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };

  const renderField = (field: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (formData as any)?.[field];

    switch (field) {
      case 'siteName':
        return (
          <div key={field} className="space-y-2">
            <label className="text-sm font-medium">Site Name</label>
            <Input
              value={value || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder="Your platform name"
            />
          </div>
        );

      case 'siteDescription':
        return (
          <div key={field} className="space-y-2">
            <label className="text-sm font-medium">Site Description</label>
            <textarea
              className="min-h-[80px] w-full resize-none rounded-md border border-gray-300 p-3"
              value={value || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder="Brief description of your platform"
            />
          </div>
        );

      case 'siteUrl':
        return (
          <div key={field} className="space-y-2">
            <label className="text-sm font-medium">Site URL</label>
            <Input
              type="url"
              value={value || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder="https://yoursite.com"
            />
          </div>
        );

      case 'adminEmail':
        return (
          <div key={field} className="space-y-2">
            <label className="text-sm font-medium">Admin Email</label>
            <Input
              type="email"
              value={value || ''}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder="admin@yoursite.com"
            />
          </div>
        );

      case 'timezone':
        return (
          <div key={field} className="space-y-2">
            <label className="text-sm font-medium">Timezone</label>
            <select
              className="w-full rounded-md border border-gray-300 p-3"
              value={value || 'UTC'}
              onChange={(e) => handleInputChange(field, e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="Europe/Istanbul">Europe/Istanbul</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="Europe/London">Europe/London</option>
            </select>
          </div>
        );

      case 'commissionRate':
        return (
          <div key={field} className="space-y-2">
            <label className="text-sm font-medium">Commission Rate (%)</label>
            <Input
              type="number"
              min="0"
              max="50"
              step="0.1"
              value={value || 0}
              onChange={(e) =>
                handleInputChange(field, parseFloat(e.target.value))
              }
            />
          </div>
        );

      case 'minimumPayout':
        return (
          <div key={field} className="space-y-2">
            <label className="text-sm font-medium">Minimum Payout (?)</label>
            <Input
              type="number"
              min="0"
              value={value || 0}
              onChange={(e) =>
                handleInputChange(field, parseFloat(e.target.value))
              }
            />
          </div>
        );

      case 'currency':
        return (
          <div key={field} className="space-y-2">
            <label className="text-sm font-medium">Currency</label>
            <select
              className="w-full rounded-md border border-gray-300 p-3"
              value={value || 'TRY'}
              onChange={(e) => handleInputChange(field, e.target.value)}
            >
              <option value="TRY">Turkish Lira (?)</option>
              <option value="USD">US Dollar ($)</option>
              <option value="EUR">Euro (�)</option>
            </select>
          </div>
        );

      case 'sessionTimeout':
        return (
          <div key={field} className="space-y-2">
            <label className="text-sm font-medium">
              Session Timeout (minutes)
            </label>
            <Input
              type="number"
              min="15"
              max="1440"
              value={value || 60}
              onChange={(e) =>
                handleInputChange(field, parseInt(e.target.value))
              }
            />
          </div>
        );

      case 'apiRateLimit':
        return (
          <div key={field} className="space-y-2">
            <label className="text-sm font-medium">
              API Rate Limit (requests/minute)
            </label>
            <Input
              type="number"
              min="10"
              max="1000"
              value={value || 100}
              onChange={(e) =>
                handleInputChange(field, parseInt(e.target.value))
              }
            />
          </div>
        );

      // Boolean fields
      case 'requireEmailVerification':
      case 'requirePhoneVerification':
      case 'enableTwoFactor':
      case 'enableEmailNotifications':
      case 'enablePushNotifications':
      case 'enableSmsNotifications':
      case 'autoModerationEnabled':
      case 'requireJobApproval':
      case 'requireServiceApproval':
      case 'maintenanceMode':
      case 'registrationOpen':
        return (
          <div key={field} className="flex items-center space-x-3">
            <Checkbox
              checked={value || false}
              onChange={(e) => handleInputChange(field, e.target.checked)}
            />
            <label className="text-sm font-medium">
              {field
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())}
            </label>
          </div>
        );

      case 'paymentMethods':
        const methods = value || [];
        return (
          <div key={field} className="space-y-2">
            <label className="text-sm font-medium">Payment Methods</label>
            <div className="space-y-2">
              {['credit_card', 'bank_transfer', 'digital_wallet'].map(
                (method) => (
                  <div key={method} className="flex items-center space-x-3">
                    <Checkbox
                      checked={methods.includes(method)}
                      onChange={(e) => {
                        const newMethods = e.target.checked
                          ? [...methods, method]
                          : methods.filter((m: string) => m !== method);
                        handleInputChange(field, newMethods);
                      }}
                    />
                    <label className="text-sm">
                      {method
                        .replace('_', ' ')
                        .replace(/^./, (str) => str.toUpperCase())}
                    </label>
                  </div>
                )
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            Error loading settings:{' '}
            {typeof error === 'string' ? error : 'Unknown error'}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>System Settings</span>
            </div>
            <div className="flex items-center space-x-2">
              {hasUnsavedChanges && (
                <span className="flex items-center text-sm text-orange-600">
                  <AlertTriangle className="mr-1 h-4 w-4" />
                  Unsaved changes
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetDialog(true)}
                disabled={isSaving}
              >
                Reset to Defaults
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                className="min-w-[120px]"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {Object.entries(SETTINGS_SECTIONS).map(([key, section]) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveSection(key)}
                      className={`flex w-full items-center space-x-3 rounded-lg p-3 text-left transition-colors ${
                        activeSection === key
                          ? 'border border-blue-200 bg-blue-50 text-blue-700'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {section.title}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {React.createElement(
                  SETTINGS_SECTIONS[
                    activeSection as keyof typeof SETTINGS_SECTIONS
                  ]?.icon || Settings,
                  { className: 'h-5 w-5' }
                )}
                <span>
                  {
                    SETTINGS_SECTIONS[
                      activeSection as keyof typeof SETTINGS_SECTIONS
                    ]?.title
                  }
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="mr-2 h-6 w-6 animate-spin" />
                  <span>Loading settings...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {SETTINGS_SECTIONS[
                    activeSection as keyof typeof SETTINGS_SECTIONS
                  ]?.fields.map((field: string) => renderField(field))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Settings to Defaults</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset all settings to their default
              values? This action cannot be undone and will override all current
              configurations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-red-600 hover:bg-red-700"
            >
              Reset All Settings
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default SystemSettings;
