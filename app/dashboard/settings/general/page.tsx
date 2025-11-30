/**
 * ================================================
 * GENERAL SETTINGS PAGE
 * ================================================
 * User profile settings management
 *
 * Features:
 * - Profile information updates
 * - Real-time form validation
 * - Loading states
 * - Success/Error notifications
 *
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint 4: Settings System Refactor
 */

'use client';

import React, { useState, useEffect } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import {
  ArrowLeft,
  User,
  Globe,
  Phone,
  MapPin,
  Link2,
  Save,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
import { useSettings } from '@/hooks/business/useSettings';
import { useUserPreferences } from '@/hooks/business/useUserPreferences';
import {
  LANGUAGES,
  COMMON_TIMEZONES,
  type SupportedLanguage,
} from '@/lib/api/user-preferences';

interface UserProfile {
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  phone: string;
  website: string;
}

export default function GeneralSettingsPage() {
  const { user } = useAuthStore();
  const { updateProfile, isUpdatingProfile, profileError, clearErrors } =
    useSettings();

  const {
    preferences,
    updateLanguage,
    updateTimezone,
    fetchPreferences,
    detectAndApplyBrowserSettings,
    isLoading: isPreferencesLoading,
    browserSettings,
    isUsingBrowserSettings,
  } = useUserPreferences();

  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    phone: '',
    website: '',
  });

  // Load current user profile
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        location: user.location || '',
        phone: user.phone || '',
        website: user.website || '',
      });
    }
  }, [user]);

  // Load user preferences
  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    setSuccess(false);

    const success = await updateProfile(formData);

    if (success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    }
  };

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/settings">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Geri
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <User className="h-6 w-6 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Genel Ayarlar
              </h1>
            </div>
            <p className="mt-1 text-gray-600">
              Profil bilgilerinizi ve kişisel tercihlerinizi yönetin
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card className="p-6">
          <div className="mb-6 flex items-center space-x-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <User className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Kişisel Bilgiler
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Ad
              </label>
              <Input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Adınız"
                minLength={2}
                maxLength={50}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Soyad
              </label>
              <Input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Soyadınız"
                minLength={2}
                maxLength={50}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Biyografi
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                maxLength={500}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.bio.length}/500 karakter
              </p>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6">
          <div className="mb-6 flex items-center space-x-3">
            <div className="rounded-lg bg-green-100 p-2">
              <Phone className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              İletişim Bilgileri
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                <MapPin className="mr-1 inline h-4 w-4" />
                Konum
              </label>
              <Input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Şehir, Ülke"
                maxLength={100}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                <Phone className="mr-1 inline h-4 w-4" />
                Telefon
              </label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+90 5XX XXX XX XX"
                maxLength={20}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                <Link2 className="mr-1 inline h-4 w-4" />
                Website / Portfolio
              </label>
              <Input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://example.com"
                maxLength={200}
              />
            </div>
          </div>
        </Card>

        {/* Language & Region */}
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-purple-100 p-2">
                <Globe className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Dil ve Bölge
                </h2>
                {browserSettings && !isUsingBrowserSettings && (
                  <p className="text-xs text-gray-500">
                    Tarayıcı: {browserSettings.language.toUpperCase()} •{' '}
                    {browserSettings.timezone}
                  </p>
                )}
              </div>
            </div>
            {browserSettings && !isUsingBrowserSettings && (
              <Button
                variant="outline"
                size="sm"
                onClick={detectAndApplyBrowserSettings}
                disabled={isPreferencesLoading}
              >
                <Globe className="mr-2 h-4 w-4" />
                Tarayıcı Ayarlarını Kullan
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Dil
              </label>
              <select
                value={preferences?.language || 'tr'}
                onChange={(e) =>
                  updateLanguage(e.target.value as SupportedLanguage)
                }
                disabled={isPreferencesLoading}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag} {lang.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Arayüz dili tercihiniz
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Saat Dilimi
              </label>
              <select
                value={preferences?.timezone || 'Europe/Istanbul'}
                onChange={(e) => updateTimezone(e.target.value)}
                disabled={isPreferencesLoading}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:outline-none disabled:bg-gray-100 disabled:text-gray-500"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Tarih ve saat görünümü için kullanılır
              </p>
            </div>
          </div>

          {isUsingBrowserSettings && (
            <div className="mt-4 rounded-lg bg-green-50 p-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-800">
                  Tarayıcı ayarlarınız kullanılıyor
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Error/Success Messages */}
        {profileError && (
          <div className="flex items-center gap-2 rounded-md bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-800">{profileError}</p>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 rounded-md bg-green-50 p-4">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-800">
              Ayarlarınız başarıyla kaydedildi
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3">
          <Link href="/dashboard/settings">
            <Button variant="outline">İptal</Button>
          </Link>
          <Button
            type="submit"
            disabled={isUpdatingProfile}
            className="min-w-[120px]"
          >
            {isUpdatingProfile ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Kaydet
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
