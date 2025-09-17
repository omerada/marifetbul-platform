'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search, Star, ArrowRight, Briefcase, Package } from 'lucide-react';
import { Button } from '@/components/ui';

type UserType = 'freelancer' | 'employer';

const contentByUserType = {
  freelancer: {
    title: 'Yetenek Kazan',
    subtitle: 'Freelancer olarak projeler bul, para kazan, özgür çalış',
    searchPlaceholder: 'Hangi alanda çalışmak istiyorsun?',
    ctaPrimary: 'Freelancer Ol',
    ctaSecondary: 'İş İlanlarını Gör',
    ctaPrimaryHref: '/register?type=freelancer',
    ctaSecondaryHref: '/marketplace?view=jobs',
    benefits: [
      'Kendi fiyatını belirle',
      'Esnek çalışma saatleri',
      'Global müşteri ağı',
      'Güvenli ödeme sistemi',
    ],
  },
  employer: {
    title: 'Proje Başlat',
    subtitle: 'İşveren olarak uzman freelancerları bul, projeleri tamamla',
    searchPlaceholder: 'Hangi hizmeti arıyorsun?',
    ctaPrimary: 'İş Ver',
    ctaSecondary: 'Hizmetleri Gör',
    ctaPrimaryHref: '/register?type=employer',
    ctaSecondaryHref: '/marketplace?view=services',
    benefits: [
      'Geniş yetenek havuzu',
      'Hızlı teklif alma',
      'Kaliteli sonuçlar',
      'Bütçe kontrolü',
    ],
  },
};

export function HeroSection() {
  const [activeUserType, setActiveUserType] = useState<UserType>('freelancer');
  const currentContent = contentByUserType[activeUserType];

  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {/* User Type Toggle */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center rounded-lg bg-white/10 p-1 backdrop-blur-sm">
            <button
              onClick={() => setActiveUserType('freelancer')}
              className={`flex items-center rounded-md px-6 py-3 text-sm font-medium transition-all duration-300 ${
                activeUserType === 'freelancer'
                  ? 'scale-105 transform bg-white text-blue-600 shadow-lg'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <Briefcase className="mr-2 h-4 w-4" />
              İş Arıyorum
            </button>
            <button
              onClick={() => setActiveUserType('employer')}
              className={`flex items-center rounded-md px-6 py-3 text-sm font-medium transition-all duration-300 ${
                activeUserType === 'employer'
                  ? 'scale-105 transform bg-white text-blue-600 shadow-lg'
                  : 'text-white hover:bg-white/20'
              }`}
            >
              <Package className="mr-2 h-4 w-4" />
              İş Veriyorum
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            {/* Dynamic Content */}
            <div className="hero-content">
              <h1 className="text-4xl leading-tight font-bold lg:text-6xl">
                <span className="block whitespace-nowrap">
                  {currentContent.title}
                </span>
                <span className="block whitespace-nowrap text-blue-200">
                  Marifeto ile
                </span>
              </h1>
              <p className="mt-4 text-xl leading-relaxed text-blue-100">
                {currentContent.subtitle}
              </p>
            </div>

            {/* Search Bar */}
            <div className="hero-search">
              <div className="rounded-lg bg-white p-2 shadow-xl">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="text"
                      placeholder={currentContent.searchPlaceholder}
                      className="glow-focus w-full rounded-md py-3 pr-4 pl-10 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <Button size="lg" className="interactive-scale px-8">
                    Ara
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="hero-buttons flex flex-col gap-4 sm:flex-row">
              <Link href={currentContent.ctaPrimaryHref}>
                <Button
                  variant="secondary"
                  size="lg"
                  className="interactive-scale w-full sm:w-auto"
                >
                  {currentContent.ctaPrimary}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href={currentContent.ctaSecondaryHref}>
                <Button
                  variant="outline"
                  size="lg"
                  className="interactive-scale w-full border-white bg-transparent text-white hover:bg-white hover:text-blue-600 sm:w-auto"
                >
                  {currentContent.ctaSecondary}
                </Button>
              </Link>
            </div>

            {/* Benefits List */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {currentContent.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="staggered-fade-in flex items-center text-blue-100"
                >
                  <div className="mr-2 h-2 w-2 rounded-full bg-blue-300"></div>
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image/Stats */}
          <div className="relative">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-8 shadow-lg backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white drop-shadow-sm">
                    50K+
                  </div>
                  <div className="font-medium text-blue-100">Aktif Uzman</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white drop-shadow-sm">
                    25K+
                  </div>
                  <div className="font-medium text-blue-100">
                    Tamamlanan Proje
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white drop-shadow-sm">
                    4.9
                  </div>
                  <div className="flex items-center justify-center font-medium text-blue-100">
                    <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                    Ortalama Puan
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white drop-shadow-sm">
                    99%
                  </div>
                  <div className="font-medium text-blue-100">
                    Müşteri Memnuniyeti
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
