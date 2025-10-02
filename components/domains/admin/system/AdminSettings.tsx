'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
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
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';

interface PlatformSettings {
  general: {
    siteName: string;
    siteDescription: string;
    supportEmail: string;
    maxFileUploadSize: number;
    allowedFileTypes: string[];
    defaultLanguage: string;
    supportedLanguages: string[];
    timezone: string;
    currency: string;
    supportedCurrencies: string[];
    termsOfServiceUrl: string;
    privacyPolicyUrl: string;
    cookiePolicyUrl: string;
  };
  payment: {
    platformFee: number;
    minimumWithdrawal: number;
    withdrawalFee: number;
    escrowPeriod: number;
    automaticRelease: boolean;
    supportedPaymentMethods: string[];
    taxCalculation: boolean;
    invoiceGeneration: boolean;
    refundPolicy: {
      allowRefunds: boolean;
      refundPeriod: number;
      partialRefunds: boolean;
      automaticRefunds: boolean;
      refundFee: number;
    };
  };
  security: {
    twoFactorAuth: boolean;
    passwordRequirements: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      preventCommonPasswords: boolean;
    };
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    ipWhitelist: string[];
    ipBlacklist: string[];
    enableCaptcha: boolean;
    dataRetentionPeriod: number;
  };
  email: {
    smtpHost: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    fromEmail: string;
    fromName: string;
    enableEmailVerification: boolean;
    emailTemplates: Array<{
      id: string;
      name: string;
      subject: string;
      template: string;
      variables: string[];
      isActive: boolean;
    }>;
  };
  features: {
    userRegistration: boolean;
    emailVerificationRequired: boolean;
    profileVerification: boolean;
    servicePackages: boolean;
    jobPosting: boolean;
    directMessaging: boolean;
    videoChat: boolean;
    mobileApp: boolean;
    apiAccess: boolean;
    affiliateProgram: boolean;
    loyaltyProgram: boolean;
    multiLanguage: boolean;
    notificationSystem: boolean;
    searchEngine: boolean;
    analyticsTracking: boolean;
  };
  content: {
    moderationEnabled: boolean;
    autoModeration: boolean;
    userGeneratedContent: boolean;
    allowUserProfiles: boolean;
    allowPortfolio: boolean;
    allowCustomCategories: boolean;
    contentFiltering: boolean;
    spamDetection: boolean;
    duplicateDetection: boolean;
    imageModeration: boolean;
    textAnalysis: boolean;
  };
  api: {
    enablePublicApi: boolean;
    enableWebhooks: boolean;
    rateLimiting: {
      requestsPerMinute: number;
      requestsPerHour: number;
      requestsPerDay: number;
      burst: number;
    };
    apiVersioning: boolean;
    apiDocumentation: boolean;
    apiKeys: string[];
  };
  maintenance: {
    isMaintenanceMode: boolean;
    maintenanceMessage: string;
    scheduledMaintenance: Array<{
      id: string;
      title: string;
      description: string;
      scheduledAt: string;
      estimatedDuration: number;
      status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    }>;
    allowedIps: string[];
    allowedRoles: string[];
  };
}

export function AdminSettings() {
  const { token } = useAuthStore();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [hasChanges, setHasChanges] = useState(false);

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch('/api/v1/admin/settings', {
        headers,
      });

      if (!response.ok) {
        throw new Error('Ayarlar alınamadı');
      }

      const data = await response.json();
      setSettings(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    if (!settings) return;

    setIsSaving(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch('/api/v1/admin/settings', {
        method: 'PUT',
        headers,
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Ayarlar kaydedilemedi');
      }

      setHasChanges(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (
    section: keyof PlatformSettings,
    field: string,
    value: string | number | boolean | string[]
  ) => {
    if (!settings) return;

    setSettings((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
    });
    setHasChanges(true);
  };

  const handleNestedInputChange = (
    section: keyof PlatformSettings,
    nestedField: string,
    field: string,
    value: string | number | boolean
  ) => {
    if (!settings) return;

    setSettings((prev) => {
      if (!prev) return null;

      return {
        ...prev,
        [section]: {
          ...prev[section],
          [nestedField]: {
            ...((prev[section] as Record<string, unknown>)[
              nestedField
            ] as object),
            [field]: value,
          },
        },
      };
    });
    setHasChanges(true);
  };

  const tabs = [
    { id: 'general', name: 'Genel', icon: Settings },
    { id: 'payment', name: 'Ödeme', icon: CreditCard },
    { id: 'security', name: 'Güvenlik', icon: Shield },
    { id: 'email', name: 'E-posta', icon: Mail },
    { id: 'features', name: 'Özellikler', icon: Zap },
    { id: 'content', name: 'İçerik', icon: Globe },
    { id: 'maintenance', name: 'Bakım', icon: AlertTriangle },
  ];

  if (isLoading && !settings) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Platform Ayarları
          </h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-12 rounded-lg bg-gray-200" />
          <div className="h-64 rounded-lg bg-gray-200" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Platform Ayarları
          </h1>
          <Button onClick={fetchSettings} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Yeniden Dene
          </Button>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-center text-red-800">Error: {error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Platform Ayarları
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Platform konfigürasyon ve ayarları
          </p>
        </div>
        <div className="mt-4 flex space-x-3 sm:mt-0">
          <Button
            onClick={fetchSettings}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
            Yenile
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            variant="primary"
            size="sm"
          >
            <Save
              className={`mr-2 h-4 w-4 ${isSaving ? 'animate-spin' : ''}`}
            />
            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>

      {/* Changes Indicator */}
      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="text-orange-800">
                Kaydedilmemiş değişiklikler var. Kaydetmeyi unutmayın!
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                {(() => {
                  const tab = tabs.find((t) => t.id === activeTab);
                  if (tab) {
                    const Icon = tab.icon;
                    return (
                      <>
                        <Icon className="h-5 w-5" />
                        <span>{tab.name} Ayarları</span>
                      </>
                    );
                  }
                  return null;
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* General Settings */}
              {activeTab === 'general' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Site Adı
                      </label>
                      <Input
                        value={settings.general.siteName}
                        onChange={(e) =>
                          handleInputChange(
                            'general',
                            'siteName',
                            e.target.value
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Destek E-postası
                      </label>
                      <Input
                        type="email"
                        value={settings.general.supportEmail}
                        onChange={(e) =>
                          handleInputChange(
                            'general',
                            'supportEmail',
                            e.target.value
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Site Açıklaması
                    </label>
                    <textarea
                      value={settings.general.siteDescription}
                      onChange={(e) =>
                        handleInputChange(
                          'general',
                          'siteDescription',
                          e.target.value
                        )
                      }
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Varsayılan Dil
                      </label>
                      <select
                        value={settings.general.defaultLanguage}
                        onChange={(e) =>
                          handleInputChange(
                            'general',
                            'defaultLanguage',
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Para Birimi
                      </label>
                      <select
                        value={settings.general.currency}
                        onChange={(e) =>
                          handleInputChange(
                            'general',
                            'currency',
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="TRY">₺ TRY</option>
                        <option value="USD">$ USD</option>
                        <option value="EUR">€ EUR</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Zaman Dilimi
                      </label>
                      <select
                        value={settings.general.timezone}
                        onChange={(e) =>
                          handleInputChange(
                            'general',
                            'timezone',
                            e.target.value
                          )
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      >
                        <option value="Europe/Istanbul">Europe/Istanbul</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === 'payment' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Platform Komisyonu (%)
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={settings.payment.platformFee * 100}
                        onChange={(e) =>
                          handleInputChange(
                            'payment',
                            'platformFee',
                            parseFloat(e.target.value) / 100
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Minimum Çekim (₺)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={settings.payment.minimumWithdrawal}
                        onChange={(e) =>
                          handleInputChange(
                            'payment',
                            'minimumWithdrawal',
                            parseInt(e.target.value)
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Çekim Ücreti (₺)
                      </label>
                      <Input
                        type="number"
                        min="0"
                        value={settings.payment.withdrawalFee}
                        onChange={(e) =>
                          handleInputChange(
                            'payment',
                            'withdrawalFee',
                            parseInt(e.target.value)
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Escrow Süresi (Gün)
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={settings.payment.escrowPeriod}
                        onChange={(e) =>
                          handleInputChange(
                            'payment',
                            'escrowPeriod',
                            parseInt(e.target.value)
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-center space-x-3 pt-6">
                      <input
                        type="checkbox"
                        id="automaticRelease"
                        checked={settings.payment.automaticRelease}
                        onChange={(e) =>
                          handleInputChange(
                            'payment',
                            'automaticRelease',
                            e.target.checked
                          )
                        }
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label
                        htmlFor="automaticRelease"
                        className="text-sm font-medium text-gray-700"
                      >
                        Otomatik Ödeme Serbest Bırakma
                      </label>
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 text-sm font-medium text-gray-700">
                      İade Politikası
                    </h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="allowRefunds"
                          checked={settings.payment.refundPolicy.allowRefunds}
                          onChange={(e) =>
                            handleNestedInputChange(
                              'payment',
                              'refundPolicy',
                              'allowRefunds',
                              e.target.checked
                            )
                          }
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label
                          htmlFor="allowRefunds"
                          className="text-sm font-medium text-gray-700"
                        >
                          İade İzni Ver
                        </label>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          İade Süresi (Gün)
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={settings.payment.refundPolicy.refundPeriod}
                          onChange={(e) =>
                            handleNestedInputChange(
                              'payment',
                              'refundPolicy',
                              'refundPeriod',
                              parseInt(e.target.value)
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="twoFactorAuth"
                      checked={settings.security.twoFactorAuth}
                      onChange={(e) =>
                        handleInputChange(
                          'security',
                          'twoFactorAuth',
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="twoFactorAuth"
                      className="text-sm font-medium text-gray-700"
                    >
                      İki Faktörlü Kimlik Doğrulama
                    </label>
                  </div>

                  <div>
                    <h4 className="mb-3 text-sm font-medium text-gray-700">
                      Şifre Gereksinimleri
                    </h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Minimum Uzunluk
                        </label>
                        <Input
                          type="number"
                          min="4"
                          max="50"
                          value={
                            settings.security.passwordRequirements.minLength
                          }
                          onChange={(e) =>
                            handleNestedInputChange(
                              'security',
                              'passwordRequirements',
                              'minLength',
                              parseInt(e.target.value)
                            )
                          }
                          className="mt-1"
                        />
                      </div>
                      <div className="space-y-2 pt-6">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="requireUppercase"
                            checked={
                              settings.security.passwordRequirements
                                .requireUppercase
                            }
                            onChange={(e) =>
                              handleNestedInputChange(
                                'security',
                                'passwordRequirements',
                                'requireUppercase',
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor="requireUppercase"
                            className="text-sm text-gray-700"
                          >
                            Büyük harf gerekli
                          </label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="requireNumbers"
                            checked={
                              settings.security.passwordRequirements
                                .requireNumbers
                            }
                            onChange={(e) =>
                              handleNestedInputChange(
                                'security',
                                'passwordRequirements',
                                'requireNumbers',
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor="requireNumbers"
                            className="text-sm text-gray-700"
                          >
                            Rakam gerekli
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Oturum Zaman Aşımı (dk)
                      </label>
                      <Input
                        type="number"
                        min="15"
                        value={settings.security.sessionTimeout}
                        onChange={(e) =>
                          handleInputChange(
                            'security',
                            'sessionTimeout',
                            parseInt(e.target.value)
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Max Giriş Denemesi
                      </label>
                      <Input
                        type="number"
                        min="3"
                        max="10"
                        value={settings.security.maxLoginAttempts}
                        onChange={(e) =>
                          handleInputChange(
                            'security',
                            'maxLoginAttempts',
                            parseInt(e.target.value)
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Kilitleme Süresi (dk)
                      </label>
                      <Input
                        type="number"
                        min="5"
                        value={settings.security.lockoutDuration}
                        onChange={(e) =>
                          handleInputChange(
                            'security',
                            'lockoutDuration',
                            parseInt(e.target.value)
                          )
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Features Settings */}
              {activeTab === 'features' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-3 text-sm font-medium text-gray-700">
                      Kullanıcı Özellikleri
                    </h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[
                        { key: 'userRegistration', label: 'Kullanıcı Kayıt' },
                        {
                          key: 'emailVerificationRequired',
                          label: 'E-posta Doğrulama Zorunlu',
                        },
                        {
                          key: 'profileVerification',
                          label: 'Profil Doğrulama',
                        },
                        { key: 'directMessaging', label: 'Direkt Mesajlaşma' },
                      ].map((feature) => (
                        <div
                          key={feature.key}
                          className="flex items-center space-x-3"
                        >
                          <input
                            type="checkbox"
                            id={feature.key}
                            checked={
                              settings.features[
                                feature.key as keyof typeof settings.features
                              ] as boolean
                            }
                            onChange={(e) =>
                              handleInputChange(
                                'features',
                                feature.key,
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={feature.key}
                            className="text-sm text-gray-700"
                          >
                            {feature.label}
                          </label>
                          {settings.features[
                            feature.key as keyof typeof settings.features
                          ] && (
                            <Badge variant="success" size="sm">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Aktif
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 text-sm font-medium text-gray-700">
                      Platform Özellikleri
                    </h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[
                        { key: 'servicePackages', label: 'Hizmet Paketleri' },
                        { key: 'jobPosting', label: 'İş İlanları' },
                        { key: 'videoChat', label: 'Video Görüşme' },
                        { key: 'mobileApp', label: 'Mobil Uygulama' },
                        { key: 'apiAccess', label: 'API Erişimi' },
                        {
                          key: 'affiliateProgram',
                          label: 'Affiliate Programı',
                        },
                        { key: 'loyaltyProgram', label: 'Sadakat Programı' },
                        { key: 'multiLanguage', label: 'Çoklu Dil' },
                      ].map((feature) => (
                        <div
                          key={feature.key}
                          className="flex items-center space-x-3"
                        >
                          <input
                            type="checkbox"
                            id={feature.key}
                            checked={
                              settings.features[
                                feature.key as keyof typeof settings.features
                              ] as boolean
                            }
                            onChange={(e) =>
                              handleInputChange(
                                'features',
                                feature.key,
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={feature.key}
                            className="text-sm text-gray-700"
                          >
                            {feature.label}
                          </label>
                          {settings.features[
                            feature.key as keyof typeof settings.features
                          ] && (
                            <Badge variant="success" size="sm">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Aktif
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Content Settings */}
              {activeTab === 'content' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="mb-3 text-sm font-medium text-gray-700">
                      Moderasyon Ayarları
                    </h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[
                        { key: 'moderationEnabled', label: 'Moderasyon Etkin' },
                        { key: 'autoModeration', label: 'Otomatik Moderasyon' },
                        { key: 'contentFiltering', label: 'İçerik Filtreleme' },
                        { key: 'spamDetection', label: 'Spam Algılama' },
                        {
                          key: 'duplicateDetection',
                          label: 'Kopya İçerik Algılama',
                        },
                        { key: 'imageModeration', label: 'Görsel Moderasyonu' },
                        { key: 'textAnalysis', label: 'Metin Analizi' },
                      ].map((feature) => (
                        <div
                          key={feature.key}
                          className="flex items-center space-x-3"
                        >
                          <input
                            type="checkbox"
                            id={feature.key}
                            checked={
                              settings.content[
                                feature.key as keyof typeof settings.content
                              ] as boolean
                            }
                            onChange={(e) =>
                              handleInputChange(
                                'content',
                                feature.key,
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={feature.key}
                            className="text-sm text-gray-700"
                          >
                            {feature.label}
                          </label>
                          {settings.content[
                            feature.key as keyof typeof settings.content
                          ] && (
                            <Badge variant="success" size="sm">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Aktif
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="mb-3 text-sm font-medium text-gray-700">
                      Kullanıcı İçeriği
                    </h4>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {[
                        {
                          key: 'userGeneratedContent',
                          label: 'Kullanıcı İçeriği İzni',
                        },
                        {
                          key: 'allowUserProfiles',
                          label: 'Kullanıcı Profilleri',
                        },
                        { key: 'allowPortfolio', label: 'Portfolyo İzni' },
                        {
                          key: 'allowCustomCategories',
                          label: 'Özel Kategoriler',
                        },
                      ].map((feature) => (
                        <div
                          key={feature.key}
                          className="flex items-center space-x-3"
                        >
                          <input
                            type="checkbox"
                            id={feature.key}
                            checked={
                              settings.content[
                                feature.key as keyof typeof settings.content
                              ] as boolean
                            }
                            onChange={(e) =>
                              handleInputChange(
                                'content',
                                feature.key,
                                e.target.checked
                              )
                            }
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={feature.key}
                            className="text-sm text-gray-700"
                          >
                            {feature.label}
                          </label>
                          {settings.content[
                            feature.key as keyof typeof settings.content
                          ] && (
                            <Badge variant="success" size="sm">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Aktif
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Maintenance Settings */}
              {activeTab === 'maintenance' && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isMaintenanceMode"
                      checked={settings.maintenance.isMaintenanceMode}
                      onChange={(e) =>
                        handleInputChange(
                          'maintenance',
                          'isMaintenanceMode',
                          e.target.checked
                        )
                      }
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="isMaintenanceMode"
                      className="text-sm font-medium text-gray-700"
                    >
                      Bakım Modu Etkin
                    </label>
                    {settings.maintenance.isMaintenanceMode && (
                      <Badge variant="warning">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Bakım Modu Aktif
                      </Badge>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Bakım Mesajı
                    </label>
                    <textarea
                      value={settings.maintenance.maintenanceMessage}
                      onChange={(e) =>
                        handleInputChange(
                          'maintenance',
                          'maintenanceMessage',
                          e.target.value
                        )
                      }
                      className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      rows={3}
                      placeholder="Kullanıcılara gösterilecek bakım mesajı..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      İzin Verilen IP Adresleri (virgülle ayırın)
                    </label>
                    <Input
                      value={settings.maintenance.allowedIps.join(', ')}
                      onChange={(e) =>
                        handleInputChange(
                          'maintenance',
                          'allowedIps',
                          e.target.value.split(',').map((ip) => ip.trim())
                        )
                      }
                      className="mt-1"
                      placeholder="192.168.1.1, 10.0.0.1"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminSettings;
