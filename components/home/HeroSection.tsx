'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Search,
  ArrowRight,
  Briefcase,
  Package,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui';

type UserType = 'freelancer' | 'employer';

const contentByUserType = {
  freelancer: {
    title: 'Yeteneğini Keşfet',
    subtitle:
      'Freelancer olarak özgür çalış, kendi fiyatını belirle ve işleri bul',
    searchPlaceholder: 'Hangi alanda uzmanlaşmak istiyorsun?',
    ctaPrimary: 'Hemen Başla',
    ctaSecondary: 'Projeleri Keşfet',
    ctaPrimaryHref: '/register?type=freelancer',
    ctaSecondaryHref: '/marketplace?view=jobs',
    benefits: [
      'Kendi fiyatını belirle',
      'Esnek çalışma saatleri',
      'Güvenli ödeme garantisi',
      'Global müşteri ağı',
    ],
  },
  employer: {
    title: 'Hayalini Gerçekleştir',
    subtitle: 'Doğru yetenekleri bul ve büyük projeleri tamamla',
    searchPlaceholder: 'Hangi hizmeti arıyorsun?',
    ctaPrimary: 'Proje Başlat',
    ctaSecondary: 'Uzmanları Gör',
    ctaPrimaryHref: '/register?type=employer',
    ctaSecondaryHref: '/marketplace?view=services',
    benefits: [
      'Geniş yetenek havuzu',
      'Hızlı eşleştirme',
      'Kalite garantisi',
      'Bütçe kontrolü',
    ],
  },
};

export function HeroSection() {
  const [activeUserType, setActiveUserType] = useState<UserType>('freelancer');
  const currentContent = contentByUserType[activeUserType];

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/80">
      {/* Background Decoration */}
      <div className="bg-grid-pattern absolute inset-0 opacity-5"></div>
      <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-blue-100/20 to-indigo-100/20 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-gradient-to-tr from-purple-100/20 to-pink-100/20 blur-3xl"></div>

      <div className="relative z-10 container mx-auto px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        {/* User Type Toggle - Soft Design */}
        <div className="mb-12 flex justify-center">
          <div className="shadow-soft flex items-center rounded-2xl border border-white/40 bg-white/60 p-1.5 backdrop-blur-sm">
            <button
              onClick={() => setActiveUserType('freelancer')}
              className={`flex items-center rounded-xl px-8 py-4 text-sm font-medium transition-all duration-300 ${
                activeUserType === 'freelancer'
                  ? 'shadow-medium scale-105 border border-blue-100/50 bg-white text-gray-700'
                  : 'text-gray-600 hover:bg-white/50 hover:text-gray-700'
              }`}
            >
              <Briefcase className="mr-3 h-4 w-4" />
              Freelancer
            </button>
            <button
              onClick={() => setActiveUserType('employer')}
              className={`flex items-center rounded-xl px-8 py-4 text-sm font-medium transition-all duration-300 ${
                activeUserType === 'employer'
                  ? 'shadow-medium scale-105 border border-blue-100/50 bg-white text-gray-700'
                  : 'text-gray-600 hover:bg-white/50 hover:text-gray-700'
              }`}
            >
              <Package className="mr-3 h-4 w-4" />
              İşveren
            </button>
          </div>
        </div>

        <div className="mx-auto max-w-4xl">
          <div className="space-y-10">
            {/* Dynamic Content - Enhanced Typography */}
            <div className="hero-content space-y-6 text-center">
              <h1 className="text-5xl leading-tight font-bold text-gray-900 lg:text-7xl">
                <span className="block bg-gradient-to-r from-gray-900 via-blue-800 to-blue-600 bg-clip-text text-transparent">
                  {currentContent.title}
                </span>
                <span className="mt-2 block text-3xl font-medium text-gray-600 lg:text-4xl">
                  MarifetBul ile
                </span>
              </h1>
              <p className="mx-auto max-w-2xl text-xl leading-relaxed text-gray-600">
                {currentContent.subtitle}
              </p>
            </div>

            {/* Search Bar - Modern Design */}
            <div className="hero-search mx-auto max-w-2xl">
              <div className="shadow-medium rounded-2xl border border-white/60 bg-white/80 p-3 backdrop-blur-sm">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
                    <input
                      type="text"
                      placeholder={currentContent.searchPlaceholder}
                      className="w-full rounded-xl border border-gray-200/50 bg-gray-50/50 py-4 pr-4 pl-12 text-gray-700 transition-all duration-200 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/30 focus:outline-none"
                    />
                  </div>
                  <Button
                    size="lg"
                    className="interactive-scale shadow-medium bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 hover:from-blue-700 hover:to-blue-800"
                  >
                    Keşfet
                  </Button>
                </div>
              </div>
            </div>

            {/* Action Buttons - Soft Style */}
            <div className="hero-buttons flex flex-col justify-center gap-4 sm:flex-row">
              <Link href={currentContent.ctaPrimaryHref}>
                <Button
                  size="lg"
                  className="interactive-scale shadow-medium h-14 w-full bg-gradient-to-r from-blue-600 to-blue-700 px-8 text-lg hover:from-blue-700 hover:to-blue-800 sm:w-auto"
                >
                  {currentContent.ctaPrimary}
                  <ArrowRight className="ml-3 h-5 w-5" />
                </Button>
              </Link>
              <Link href={currentContent.ctaSecondaryHref}>
                <Button
                  variant="outline"
                  size="lg"
                  className="interactive-scale shadow-soft h-14 w-full border-2 border-gray-200 px-8 text-lg text-gray-700 hover:border-gray-300 hover:bg-gray-50 sm:w-auto"
                >
                  {currentContent.ctaSecondary}
                </Button>
              </Link>
            </div>

            {/* Benefits List - Refined Design */}
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
              {currentContent.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="staggered-fade-in shadow-soft flex items-center rounded-xl border border-white/50 bg-white/50 p-4 text-gray-600"
                >
                  <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
                  <span className="font-medium">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
