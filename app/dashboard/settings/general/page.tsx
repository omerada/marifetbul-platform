'use client';

import React, { useState, useEffect } from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import {
  ArrowLeft,
  User,
  Globe,
  Phone,
  MapPin,
  Link2,
  Save,
} from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  firstName: string;
  lastName: string;
  bio: string;
  location: string;
  phone: string;
  website: string;
}

export default function GeneralSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    const fetchProfile = async () => {
      try {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const response = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          const user = data.data;
          setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            bio: user.bio || '',
            location: user.location || '',
            phone: user.phone || '',
            website: user.website || '',
          });
        }
      } catch {
        // Silent fail - form will be empty
      }
    };

    fetchProfile();
  }, []);

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
    setError(null);
    setSuccess(false);
    setIsLoading(true);

    try {
      const API_BASE_URL =
        process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Profil güncellenemedi');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Profil güncellenirken hata oluştu'
      );
    } finally {
      setIsLoading(false);
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

        {/* Language & Region (Placeholder) */}
        <Card className="border-gray-200 bg-gray-50 p-6">
          <div className="mb-6 flex items-center space-x-3">
            <div className="rounded-lg bg-purple-100 p-2">
              <Globe className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Dil ve Bölge
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Dil
              </label>
              <select
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500"
              >
                <option>Türkçe (Varsayılan)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Çoklu dil desteği yakında eklenecek
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Saat Dilimi
              </label>
              <select
                disabled
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-gray-500"
              >
                <option>Europe/Istanbul (GMT+3)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                Saat dilimi seçimi yakında eklenecek
              </p>
            </div>
          </div>
        </Card>

        {/* Error/Success Messages */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="rounded-md bg-green-50 p-4">
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
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {isLoading ? (
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
