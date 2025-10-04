import { Metadata } from 'next';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Kategoriler - MarifetBul',
  description: 'MarifetBul platformundaki tüm hizmet kategorileri.',
};

export default function CategoriesPage() {
  const categories = [
    {
      title: 'Web Geliştirme',
      count: '1,234',
      description: 'Website, web uygulaması ve e-ticaret projeleri',
    },
    {
      title: 'Mobil Uygulama',
      count: '567',
      description: 'iOS, Android ve cross-platform uygulamalar',
    },
    {
      title: 'Grafik Tasarım',
      count: '890',
      description: 'Logo, poster, broşür ve görsel tasarım hizmetleri',
    },
    {
      title: 'Metin Yazımı',
      count: '445',
      description: 'Blog yazıları, makale yazımı ve içerik üretimi',
    },
    {
      title: 'Dijital Pazarlama',
      count: '678',
      description: 'SEO, sosyal medya ve online reklam yönetimi',
    },
    {
      title: 'Veri Girişi',
      count: '234',
      description: 'Excel, CRM ve veri tabanı işlemleri',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
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

      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((category, index) => (
              <Card
                key={index}
                className="p-6 transition-shadow hover:shadow-lg"
              >
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  {category.title}
                </h3>
                <p className="mb-4 text-gray-600">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {category.count} aktif proje
                  </span>
                  <button className="text-blue-600 hover:text-blue-700">
                    Keşfet →
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
