import { Metadata } from 'next';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  Code,
  Smartphone,
  Palette,
  PenTool,
  TrendingUp,
  Database,
  Camera,
  Music,
  Globe,
  BookOpen,
  Calculator,
  Megaphone,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Kategoriler - MarifetBul',
  description: 'MarifetBul platformundaki tüm hizmet kategorileri.',
};

export default function CategoriesPage() {
  const categories = [
    {
      title: 'Web Geliştirme',
      icon: Code,
      count: '1,234',
      description: 'Website, web uygulaması ve e-ticaret projeleri',
      color: 'bg-blue-100 text-blue-600',
      hoverColor: 'hover:bg-blue-50',
    },
    {
      title: 'Mobil Uygulama',
      icon: Smartphone,
      count: '567',
      description: 'iOS, Android ve cross-platform uygulamalar',
      color: 'bg-green-100 text-green-600',
      hoverColor: 'hover:bg-green-50',
    },
    {
      title: 'Grafik Tasarım',
      icon: Palette,
      count: '890',
      description: 'Logo, poster, broşür ve görsel tasarım hizmetleri',
      color: 'bg-purple-100 text-purple-600',
      hoverColor: 'hover:bg-purple-50',
    },
    {
      title: 'Metin Yazımı',
      icon: PenTool,
      count: '445',
      description: 'Blog yazıları, makale yazımı ve içerik üretimi',
      color: 'bg-orange-100 text-orange-600',
      hoverColor: 'hover:bg-orange-50',
    },
    {
      title: 'Dijital Pazarlama',
      icon: TrendingUp,
      count: '678',
      description: 'SEO, sosyal medya ve online reklam yönetimi',
      color: 'bg-red-100 text-red-600',
      hoverColor: 'hover:bg-red-50',
    },
    {
      title: 'Veri Girişi',
      icon: Database,
      count: '234',
      description: 'Excel, CRM ve veri tabanı işlemleri',
      color: 'bg-indigo-100 text-indigo-600',
      hoverColor: 'hover:bg-indigo-50',
    },
    {
      title: 'Fotoğrafçılık',
      icon: Camera,
      count: '156',
      description: 'Ürün, etkinlik ve portre fotoğrafçılığı',
      color: 'bg-pink-100 text-pink-600',
      hoverColor: 'hover:bg-pink-50',
    },
    {
      title: 'Ses & Müzik',
      icon: Music,
      count: '98',
      description: 'Ses kaydı, müzik prodüksiyonu ve seslendirme',
      color: 'bg-yellow-100 text-yellow-600',
      hoverColor: 'hover:bg-yellow-50',
    },
    {
      title: 'Video Prodüksiyon',
      icon: Globe,
      count: '187',
      description: 'Video montaj, animasyon ve video prodüksiyonu',
      color: 'bg-teal-100 text-teal-600',
      hoverColor: 'hover:bg-teal-50',
    },
    {
      title: 'Çeviri',
      icon: BookOpen,
      count: '276',
      description: 'Belge çevirisi ve lokalizasyon hizmetleri',
      color: 'bg-cyan-100 text-cyan-600',
      hoverColor: 'hover:bg-cyan-50',
    },
    {
      title: 'Muhasebe',
      icon: Calculator,
      count: '145',
      description: 'Mali müşavirlik ve muhasebe hizmetleri',
      color: 'bg-emerald-100 text-emerald-600',
      hoverColor: 'hover:bg-emerald-50',
    },
    {
      title: 'PR & İletişim',
      icon: Megaphone,
      count: '89',
      description: 'Halkla ilişkiler ve kurumsal iletişim',
      color: 'bg-rose-100 text-rose-600',
      hoverColor: 'hover:bg-rose-50',
    },
  ];

  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Kategoriler
            </h1>
            <p className="mb-12 text-xl text-gray-600">
              İhtiyacınız olan hizmeti bulun veya uzmanlık alanınızda projeler
              keşfedin.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Card
                  key={index}
                  className={`group cursor-pointer p-6 transition-all duration-300 hover:shadow-lg ${category.hoverColor}`}
                >
                  <div className="flex items-start space-x-4">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-lg ${category.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-blue-600">
                        {category.title}
                      </h3>
                      <p className="mb-4 text-gray-600">
                        {category.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          {category.count} aktif proje
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          Keşfet →
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="mt-20 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center text-white">
            <h2 className="mb-4 text-3xl font-bold">
              Aradığınız kategoriyi bulamadınız mı?
            </h2>
            <p className="mb-8 text-xl opacity-90">
              Platformumuzda 100&apos;den fazla alt kategori bulunmaktadır.
              Marketplace&apos;te detaylı arama yapabilirsiniz.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="bg-white text-gray-900 hover:bg-gray-100"
            >
              Tüm Hizmetleri Görüntüle
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
