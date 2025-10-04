'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import Link from 'next/link';
import { Search, ChevronRight, Users, ArrowLeft } from 'lucide-react';

// Mock data - in real app this would come from API
const getCategoryData = (categoryId: string) => {
  const categories = {
    'teknoloji-yazilim': {
      title: 'Teknoloji & Yazılım',
      description: 'Web, mobil ve yazılım geliştirme hizmetleri',
      subcategories: [
        {
          id: 'web-gelistirme',
          title: 'Web Geliştirme',
          count: '3,200',
          services: ['WordPress', 'E-ticaret', 'Landing Page', 'Web App'],
        },
        {
          id: 'mobil-uygulama',
          title: 'Mobil Uygulama',
          count: '1,850',
          services: ['iOS App', 'Android App', 'React Native', 'Flutter'],
        },
      ],
    },
    // Add other categories as needed
  };

  return categories[categoryId as keyof typeof categories] || null;
};

export default function CategoryDetailPage() {
  const params = useParams();
  const categoryId = params.categoryId as string;
  const [searchTerm, setSearchTerm] = useState('');

  const categoryData = getCategoryData(categoryId);

  if (!categoryData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Kategori Bulunamadı
          </h1>
          <Link href="/marketplace/categories">
            <Button>Kategorilere Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white py-6">
        <div className="container mx-auto px-4">
          <div className="mb-4 flex items-center gap-4">
            <Link href="/marketplace/categories">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kategoriler
              </Button>
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900">
              {categoryData.title}
            </span>
          </div>

          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {categoryData.title}
          </h1>
          <p className="mb-6 text-gray-600">{categoryData.description}</p>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Alt kategori ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Subcategories */}
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categoryData.subcategories.map((subcategory) => (
              <Link
                key={subcategory.id}
                href={`/marketplace/categories/${categoryId}/${subcategory.id}`}
              >
                <Card className="h-full p-6 transition-shadow hover:shadow-lg">
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    {subcategory.title}
                  </h3>

                  <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
                    <Users className="h-4 w-4" />
                    <span>{subcategory.count} aktif freelancer</span>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-1">
                    {subcategory.services.map((service, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600"
                      >
                        {service}
                      </span>
                    ))}
                  </div>

                  <Button className="w-full" size="sm">
                    Freelancer&apos;ları Gör
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
