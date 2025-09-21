'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home,
  Search,
  ArrowLeft,
  Compass,
  HelpCircle,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { UniversalSearch } from '@/components/shared/features';

export default function NotFound() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (query: string, type?: string) => {
    if (!query.trim()) return;

    const params = new URLSearchParams();
    params.set('q', query);

    if (type === 'packages') {
      params.set('view', 'packages');
    } else if (type === 'jobs') {
      params.set('view', 'jobs');
    }

    router.push(`/marketplace?${params.toString()}`);
  };

  const quickLinks = [
    {
      href: '/',
      icon: Home,
      label: 'Ana Sayfa',
      description: 'Ana sayfaya dön',
    },
    {
      href: '/marketplace',
      icon: Compass,
      label: 'İş & Hizmet',
      description: 'Freelancer hizmetlerini keşfet',
    },
    {
      href: '/info/how-it-works',
      icon: HelpCircle,
      label: 'Nasıl Çalışır?',
      description: 'Platform hakkında bilgi al',
    },
    {
      href: '/contact',
      icon: MessageCircle,
      label: 'İletişim',
      description: 'Bize ulaş',
    },
  ];

  const popularSearches = [
    'Logo tasarım',
    'Web geliştirme',
    'İçerik yazımı',
    'SEO',
    'Mobil uygulama',
    'Grafik tasarım',
  ];

  if (!mounted) {
    return null; // Hydration mismatch'i önlemek için
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-screen flex-col items-center justify-center text-center">
          {/* 404 Illustration */}
          <div className="mb-8">
            <div className="relative">
              {/* Main 404 Text */}
              <div className="text-9xl font-bold text-gray-200 sm:text-[12rem]">
                404
              </div>

              {/* Floating elements for visual appeal */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -top-4 -left-4 h-8 w-8 animate-bounce rounded-full bg-blue-500 opacity-60" />
                  <div className="absolute -top-2 -right-6 h-6 w-6 animate-pulse rounded-full bg-purple-500 opacity-60" />
                  <div className="absolute -bottom-4 left-2 h-4 w-4 animate-ping rounded-full bg-green-500 opacity-60" />
                  <Search className="h-16 w-16 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="mb-8 max-w-2xl">
            <h1 className="mb-4 text-3xl font-bold text-gray-900 sm:text-4xl">
              Sayfa Bulunamadı
            </h1>
            <p className="text-lg text-gray-600 sm:text-xl">
              Aradığınız sayfa mevcut değil veya taşınmış olabilir. Aşağıdaki
              seçeneklerle devam edebilirsiniz.
            </p>
          </div>

          {/* Search Section */}
          <div className="mb-12 w-full max-w-lg">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Arama Yapın
            </h2>
            <UniversalSearch
              onSearch={handleSearch}
              placeholder="Ne arıyorsunuz?"
              className="w-full"
            />
            <div className="mt-4">
              <p className="mb-2 text-sm text-gray-500">Popüler aramalar:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="mb-12 w-full max-w-4xl">
            <h2 className="mb-6 text-lg font-semibold text-gray-900">
              Hızlı Erişim
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  className="group rounded-lg border border-gray-200 bg-white p-6 text-center transition-all hover:border-blue-300 hover:shadow-md"
                >
                  <div className="mb-3 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 transition-colors group-hover:bg-blue-100">
                      <link.icon className="h-6 w-6 text-gray-600 transition-colors group-hover:text-blue-600" />
                    </div>
                  </div>
                  <h3 className="mb-1 font-semibold text-gray-900">
                    {link.label}
                  </h3>
                  <p className="text-sm text-gray-600">{link.description}</p>
                </Link>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Geri Dön
            </Button>
            <Link href="/">
              <Button size="lg" className="w-full sm:w-auto">
                <Home className="mr-2 h-5 w-5" />
                Ana Sayfaya Git
              </Button>
            </Link>
          </div>

          {/* Help Text */}
          <div className="mt-12 max-w-lg text-center">
            <p className="text-sm text-gray-500">
              Sorun devam ederse{' '}
              <Link
                href="/contact"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                destek ekibimizle iletişime geçin
              </Link>
              . Size yardımcı olmaktan memnuniyet duyarız.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
