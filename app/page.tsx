'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Search,
  Star,
  Users,
  Shield,
  Zap,
  ArrowRight,
  Briefcase,
  Package,
} from 'lucide-react';
import { AppLayout } from '@/components/layout';
import { Button } from '@/components/ui';

type UserType = 'freelancer' | 'employer';

export default function HomePage() {
  const [activeUserType, setActiveUserType] = useState<UserType>('freelancer');

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

  const currentContent = contentByUserType[activeUserType];

  return (
    <AppLayout>
      {/* Hero Section with Smart Toggle */}
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

      {/* Features Section - Value Propositions Comparison */}
      <section className="bg-white py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
              Neden Marifeto?
            </h2>
            <p className="mx-auto max-w-2xl text-xl text-gray-600">
              Freelancer ve işverenler için optimize edilmiş platform
            </p>
          </div>

          {/* Side-by-Side Value Proposition */}
          <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Freelancer Benefits */}
            <div className="rounded-2xl border-2 border-blue-100 bg-blue-50 p-8">
              <div className="mb-6 flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Freelancer Olarak
                </h3>
              </div>
              <p className="mb-6 text-gray-700">
                Yeteneklerini sergileyip kazanmaya başla
              </p>
              <ul className="mb-6 space-y-3">
                {contentByUserType.freelancer.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <div className="mr-3 h-2 w-2 rounded-full bg-blue-600"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link href="/register?type=freelancer">
                <Button className="w-full">
                  Freelancer Ol
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Employer Benefits */}
            <div className="rounded-2xl border-2 border-green-100 bg-green-50 p-8">
              <div className="mb-6 flex items-center">
                <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-600">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  İşveren Olarak
                </h3>
              </div>
              <p className="mb-6 text-gray-700">
                Doğru yetenekleri bul, projeni tamamla
              </p>
              <ul className="mb-6 space-y-3">
                {contentByUserType.employer.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <div className="mr-3 h-2 w-2 rounded-full bg-green-600"></div>
                    {benefit}
                  </li>
                ))}
              </ul>
              <Link href="/register?type=employer">
                <Button variant="secondary" className="w-full">
                  İş Ver
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Güvenli Ödeme
              </h3>
              <p className="text-gray-600">
                Escrow sistemi ile güvenli ödeme garantisi
              </p>
            </div>

            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Kaliteli Uzmanlar
              </h3>
              <p className="text-gray-600">
                Doğrulanmış ve deneyimli freelancer&apos;lar
              </p>
            </div>

            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                <Zap className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Hızlı Eşleşme
              </h3>
              <p className="text-gray-600">
                AI destekli akıllı eşleştirme sistemi
              </p>
            </div>

            <div className="p-6 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                <Star className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                Kalite Garantisi
              </h3>
              <p className="text-gray-600">%100 memnuniyet garantisi</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
              Nasıl Çalışır?
            </h2>
            <p className="text-xl text-gray-600">
              3 basit adımda projenizi başlatın
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Projenizi Tanımlayın
              </h3>
              <p className="text-gray-600">
                İhtiyacınızı detaylandırın, bütçenizi belirleyin ve uzmanlardan
                teklif alın.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Uzmanı Seçin
              </h3>
              <p className="text-gray-600">
                Gelen teklifleri inceleyin, uzman profillerini değerlendirin ve
                seçiminizi yapın.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-4 text-xl font-semibold text-gray-900">
                Projeyi Tamamlayın
              </h3>
              <p className="text-gray-600">
                Çalışma sürecini takip edin, güvenli ödeme yapın ve sonuçtan
                memnun kalın.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16 text-white lg:py-24">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold lg:text-4xl">
            Hemen Başlayın
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-blue-100">
            Projenizi paylaşın veya freelancer olarak yeteneklerinizi
            sergileyin. Ücretsiz üyelik ile hemen başlayın.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/register?type=employer">
              <Button
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                İşveren Olarak Başla
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/register?type=freelancer">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-white text-white hover:bg-white hover:text-blue-600 sm:w-auto"
              >
                Freelancer Olarak Başla
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
