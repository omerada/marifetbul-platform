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
    trending: true,
  },
  {
    icon: Palette,
    name: 'Tasarım & Sanat',
    description: 'Logo, web tasarım, görsel kimlik',
    projectCount: '12,800+',
    avgPrice: '₺500-₺5,000',
    trending: false,
  },
  {
    icon: Megaphone,
    name: 'Pazarlama & Reklam',
    description: 'Dijital pazarlama, SEO, sosyal medya',
    projectCount: '9,600+',
    avgPrice: '₺800-₺8,000',
    trending: true,
  },
  {
    icon: Pen,
    name: 'Yazı & Çeviri',
    description: 'İçerik yazımı, makale, çeviri hizmetleri',
    projectCount: '8,200+',
    avgPrice: '₺300-₺3,000',
    trending: false,
  },
  {
    icon: BarChart3,
    name: 'İş & Finans',
    description: 'Muhasebe, danışmanlık, analiz',
    projectCount: '6,100+',
    avgPrice: '₺1,000-₺10,000',
    trending: false,
  },
  {
    icon: Camera,
    name: 'Video & Fotoğraf',
    description: 'Video editimi, fotoğraf çekimi',
    projectCount: '4,800+',
    avgPrice: '₺600-₺6,000',
    trending: true,
  },
  {
    icon: Globe,
    name: 'E-ticaret',
    description: 'Mağaza kurulumu, ürün yönetimi',
    projectCount: '3,400+',
    avgPrice: '₺1,500-₺12,000',
    trending: true,
  },
  {
    icon: Smartphone,
    name: 'Mobil Uygulamalar',
    description: 'iOS, Android uygulama geliştirme',
    projectCount: '2,900+',
    avgPrice: '₺3,000-₺20,000',
    trending: true,
  },
];

export function CategoryShowcase() {
  return (
    <section className="bg-gradient-to-b from-white to-gray-50/50 py-16 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">
            Popüler Kategoriler
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Her alanda uzman freelancerlar sizi bekliyor. Projenize uygun
            kategoriyi seçin.
          </p>
        </div>

        <div className="mb-12 grid auto-rows-fr gap-6 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category, index) => (
            <Link
              key={index}
              href="/marketplace/categories"
              className="group relative overflow-hidden rounded-2xl bg-white p-6 pb-14 shadow-sm ring-1 ring-gray-200/60 transition-all duration-300 hover:shadow-lg hover:ring-blue-200"
            >
              {/* Trending Badge */}
              {category.trending && (
                <div className="absolute top-4 right-4 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  Trend
                </div>
              )}

              {/* Icon - Clean minimal style */}
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-slate-50 text-slate-600 ring-1 ring-slate-200/60 transition-all duration-300 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:ring-blue-200">
                <category.icon className="h-7 w-7" strokeWidth={1.5} />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                  {category.name}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {category.description}
                </p>

                {/* Stats */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Aktif Proje</span>
                    <span className="font-semibold text-slate-900">
                      {category.projectCount}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Fiyat Aralığı</span>
                    <span className="font-semibold text-slate-900">
                      {category.avgPrice}
                    </span>
                  </div>
                </div>
              </div>

              {/* Hover Arrow - Fixed position at bottom center */}
              <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
                  <span>Keşfet</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link href="/marketplace/categories">
            <Button
              size="lg"
              className="inline-flex items-center gap-2 shadow-sm transition-shadow hover:shadow-md"
            >
              Tüm Kategorileri Görüntüle
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
