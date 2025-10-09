'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import Link from 'next/link';
import { Search, ChevronRight, Users, ExternalLink } from 'lucide-react';
import { MARKETPLACE_CATEGORIES } from '@/lib/domains/marketplace/categories-data';

export default function CategoryDetailPage() {
  const params = useParams();
  const categorySlug = params.categoryId as string;
  const [searchTerm, setSearchTerm] = useState('');

  // Find category by slug
  const categoryData = useMemo(() => {
    return MARKETPLACE_CATEGORIES.find((cat) => cat.slug === categorySlug);
  }, [categorySlug]);

  // Filter subcategories based on search
  const filteredSubcategories = useMemo(() => {
    if (!categoryData?.subcategories) return [];

    if (!searchTerm.trim()) {
      return categoryData.subcategories;
    }

    const searchLower = searchTerm.toLowerCase();
    return categoryData.subcategories.filter(
      (sub) =>
        sub.name.toLowerCase().includes(searchLower) ||
        sub.description.toLowerCase().includes(searchLower) ||
        sub.popularServices.some((service) =>
          service.toLowerCase().includes(searchLower)
        )
    );
  }, [categoryData, searchTerm]);

  if (!categoryData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold text-gray-900">
            Kategori Bulunamadı
          </h1>
          <p className="mb-6 text-gray-600">
            Aradığınız kategori mevcut değil veya kaldırılmış olabilir.
          </p>
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
      <div className="border-b bg-white py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center gap-3 text-sm">
            <Link
              href="/marketplace/categories"
              className="text-gray-600 hover:text-gray-900"
            >
              Kategoriler
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="font-medium text-gray-900">
              {categoryData.title}
            </span>
          </div>

          <div className="mb-6">
            <h1 className="mb-3 text-4xl font-bold text-gray-900">
              {categoryData.title}
            </h1>
            <p className="text-lg text-gray-600">{categoryData.description}</p>
          </div>

          {/* Stats */}
          <div className="mb-6 flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-gray-500" />
              <span className="text-sm text-gray-600">
                <strong className="font-semibold text-gray-900">
                  {categoryData.stats.totalFreelancers.toLocaleString('tr-TR')}
                </strong>{' '}
                Freelancer
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 items-center justify-center">
                <span className="text-amber-500">★</span>
              </div>
              <span className="text-sm text-gray-600">
                <strong className="font-semibold text-gray-900">
                  {categoryData.stats.averageRating}
                </strong>{' '}
                Ortalama Puan
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 text-gray-500">
                <svg
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <span className="text-sm text-gray-600">
                <strong className="font-semibold text-gray-900">
                  {categoryData.stats.completedProjects.toLocaleString('tr-TR')}
                </strong>{' '}
                Tamamlanan Proje
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Alt kategori veya hizmet ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="py-6 pl-12 text-base"
            />
          </div>
        </div>
      </div>

      {/* Subcategories */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Alt Kategoriler
            </h2>
            <p className="text-gray-600">
              {filteredSubcategories.length} alt kategori bulundu
            </p>
          </div>

          {filteredSubcategories.length === 0 ? (
            <div className="rounded-lg bg-white p-12 text-center">
              <p className="text-gray-600">
                Arama kriterlerinize uygun alt kategori bulunamadı.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSearchTerm('')}
              >
                Aramayı Temizle
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredSubcategories.map((subcategory) => (
                <Card key={subcategory.id} className="overflow-hidden">
                  {/* Subcategory Header */}
                  <div className="border-b bg-gradient-to-r from-gray-50 to-white p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-3">
                          <h3 className="text-xl font-bold text-gray-900">
                            {subcategory.name}
                          </h3>
                          {subcategory.trending && (
                            <span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                              <svg
                                className="h-3 w-3"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                />
                              </svg>
                              Trend
                            </span>
                          )}
                        </div>
                        <p className="mb-3 text-sm text-gray-600">
                          {subcategory.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Users className="h-4 w-4" />
                            <span className="font-medium">
                              {subcategory.serviceCount} hizmet
                            </span>
                          </div>
                          <div className="text-gray-600">
                            <span className="font-semibold text-gray-900">
                              {new Intl.NumberFormat('tr-TR', {
                                style: 'currency',
                                currency: 'TRY',
                                minimumFractionDigits: 0,
                              }).format(subcategory.averagePrice)}
                            </span>{' '}
                            ortalama fiyat
                          </div>
                        </div>
                      </div>
                      <Link
                        href={`/marketplace/categories/${categorySlug}/${subcategory.slug}`}
                        className="group ml-4 flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600"
                      >
                        Tümünü Gör
                        <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Services Grid */}
                  <div className="p-6">
                    <h4 className="mb-4 text-sm font-semibold text-gray-700">
                      Popüler Hizmetler ({subcategory.popularServices.length})
                    </h4>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {subcategory.popularServices.map((service, idx) => (
                        <Link
                          key={idx}
                          href={`/marketplace/categories/${categorySlug}/${subcategory.slug}?service=${encodeURIComponent(service)}`}
                          className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 transition-all hover:border-blue-400 hover:bg-blue-50 hover:shadow-md"
                        >
                          <span className="text-sm font-medium text-gray-700 transition-colors group-hover:text-blue-700">
                            {service}
                          </span>
                          <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400 transition-colors group-hover:text-blue-600" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t bg-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Kendi Projenizi Yayınlayın
          </h2>
          <p className="mb-6 text-gray-600">
            Binlerce uzman freelancer teklifleriyle sizi bekliyor
          </p>
          <Link href="/marketplace/jobs/create">
            <Button size="lg" className="px-8">
              Proje İlanı Ver
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
