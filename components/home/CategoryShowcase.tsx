'use client';

import {
  ArrowRight,
  Palette,
  Code,
  Megaphone,
  BarChart3,
  Camera,
  Pen,
  Globe,
  Smartphone,
} from 'lucide-react';
import { Button } from '@/components/ui';
import Link from 'next/link';

const categories = [
  {
    icon: Code,
    name: 'Yazılım & Teknoloji',
    description: 'Web, mobil, desktop uygulama geliştirme',
    projectCount: '15,400+',
    avgPrice: '₺2,500-₺15,000',
    color: 'blue',
    trending: true,
  },
  {
    icon: Palette,
    name: 'Tasarım & Sanat',
    description: 'Logo, web tasarım, görsel kimlik',
    projectCount: '12,800+',
    avgPrice: '₺500-₺5,000',
    color: 'purple',
    trending: false,
  },
  {
    icon: Megaphone,
    name: 'Pazarlama & Reklam',
    description: 'Dijital pazarlama, SEO, sosyal medya',
    projectCount: '9,600+',
    avgPrice: '₺800-₺8,000',
    color: 'green',
    trending: true,
  },
  {
    icon: Pen,
    name: 'Yazı & Çeviri',
    description: 'İçerik yazımı, makale, çeviri hizmetleri',
    projectCount: '8,200+',
    avgPrice: '₺300-₺3,000',
    color: 'orange',
    trending: false,
  },
  {
    icon: BarChart3,
    name: 'İş & Finans',
    description: 'Muhasebe, danışmanlık, analiz',
    projectCount: '6,100+',
    avgPrice: '₺1,000-₺10,000',
    color: 'indigo',
    trending: false,
  },
  {
    icon: Camera,
    name: 'Video & Fotoğraf',
    description: 'Video editimi, fotoğraf çekimi',
    projectCount: '4,800+',
    avgPrice: '₺600-₺6,000',
    color: 'red',
    trending: true,
  },
  {
    icon: Globe,
    name: 'E-ticaret',
    description: 'Mağaza kurulumu, ürün yönetimi',
    projectCount: '3,400+',
    avgPrice: '₺1,500-₺12,000',
    color: 'teal',
    trending: true,
  },
  {
    icon: Smartphone,
    name: 'Mobil Uygulamalar',
    description: 'iOS, Android uygulama geliştirme',
    projectCount: '2,900+',
    avgPrice: '₺3,000-₺20,000',
    color: 'pink',
    trending: true,
  },
];

const colorVariants = {
  blue: 'from-blue-400 to-blue-600',
  purple: 'from-purple-400 to-purple-600',
  green: 'from-green-400 to-green-600',
  orange: 'from-orange-400 to-orange-600',
  indigo: 'from-indigo-400 to-indigo-600',
  red: 'from-red-400 to-red-600',
  teal: 'from-teal-400 to-teal-600',
  pink: 'from-pink-400 to-pink-600',
};

export function CategoryShowcase() {
  return (
    <section className="bg-gray-50 py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
            Popüler Kategoriler
          </h2>
          <p className="mx-auto max-w-2xl text-xl text-gray-600">
            Her alanda uzman freelancerlar sizi bekliyor. Projenize uygun
            kategoriyi seçin.
          </p>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => {
            const gradientColor =
              colorVariants[category.color as keyof typeof colorVariants];
            return (
              <div
                key={index}
                className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-gray-200 hover:shadow-lg"
              >
                {/* Trending Badge */}
                {category.trending && (
                  <div className="absolute top-4 right-4 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                    Trend
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${gradientColor} mb-4 transition-transform duration-300 group-hover:scale-110`}
                >
                  <category.icon className="h-6 w-6 text-white" />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-gray-900 transition-colors group-hover:text-blue-600">
                    {category.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-600">
                    {category.description}
                  </p>

                  {/* Stats */}
                  <div className="space-y-2 border-t border-gray-100 pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Aktif Proje:</span>
                      <span className="font-semibold text-gray-900">
                        {category.projectCount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Fiyat Aralığı:</span>
                      <span className="font-semibold text-gray-900">
                        {category.avgPrice}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hover Arrow */}
                <div className="absolute right-4 bottom-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <ArrowRight className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/marketplace/categories">
            <Button size="lg" className="inline-flex items-center gap-2">
              Tüm Kategorileri Görüntüle
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
