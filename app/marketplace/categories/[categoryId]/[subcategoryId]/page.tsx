'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import Link from 'next/link';
import {
  Search,
  Filter,
  Star,
  ChevronRight,
  MapPin,
  Bookmark,
  SortAsc,
  X,
  CheckCircle2,
} from 'lucide-react';
import { MARKETPLACE_CATEGORIES } from '@/lib/domains/marketplace/categories-data';
import { notFound } from 'next/navigation';

interface Freelancer {
  id: string;
  name: string;
  title: string;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  hourlyRate: number;
  location: string;
  avatar: string;
  skills: string[];
  services: string[];
  description: string;
  available: boolean;
}

export default function SubcategoryDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const categorySlug = params.categoryId as string;
  const subcategorySlug = params.subcategoryId as string;

  const selectedServiceFromUrl = searchParams.get('service');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (selectedServiceFromUrl) {
      setSelectedService(selectedServiceFromUrl);
    }
  }, [selectedServiceFromUrl]);

  const { category, subcategory } = useMemo(() => {
    const cat = MARKETPLACE_CATEGORIES.find((c) => c.slug === categorySlug);
    if (!cat) return { category: null, subcategory: null };

    const subcat = cat.subcategories.find((s) => s.slug === subcategorySlug);
    return { category: cat, subcategory: subcat };
  }, [categorySlug, subcategorySlug]);

  useEffect(() => {
    const fetchFreelancers = async () => {
      if (!category || !subcategory) return;

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          categoryId: category.id.toString(),
          subcategoryId: subcategory.id.toString(),
          page: page.toString(),
          limit: '20',
          sortBy,
        });

        if (searchTerm.trim()) {
          params.append('search', searchTerm);
        }

        if (selectedService) {
          params.append('service', selectedService);
        }

        if (selectedFilter === 'available') {
          params.append('available', 'true');
        } else if (selectedFilter === 'top-rated') {
          params.append('minRating', '4.8');
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/marketplace/freelancers?${params}`,
          {
            cache: 'no-cache',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Freelancer listesi yüklenirken bir hata oluştu');
        }

        const data = await response.json();
        setFreelancers(data.data.items || []);
        setTotalPages(data.data.totalPages || 1);
      } catch (err) {
        console.error('Freelancers fetch error:', err);
        setError(err instanceof Error ? err.message : 'Bir hata oluştu');
        setFreelancers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancers();
  }, [
    category,
    subcategory,
    page,
    sortBy,
    searchTerm,
    selectedService,
    selectedFilter,
  ]);

  if (!category || !subcategory) {
    notFound();
  }

  // Clear service filter
  const clearServiceFilter = () => {
    setSelectedService(null);
    // Update URL without service parameter
    const url = new URL(window.location.href);
    url.searchParams.delete('service');
    window.history.replaceState({}, '', url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white py-6">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-sm">
            <Link
              href="/marketplace/categories"
              className="text-blue-600 hover:underline"
            >
              Kategoriler
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <Link
              href={`/marketplace/categories/${categorySlug}`}
              className="text-blue-600 hover:underline"
            >
              {category.title}
            </Link>
            <ChevronRight className="h-4 w-4 text-gray-400" />
            <span className="text-gray-900">{subcategory.name}</span>
          </div>

          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            {subcategory.name} Hizmetleri
          </h1>
          <p className="mb-4 text-gray-600">{subcategory.description}</p>

          {/* Selected Service Badge */}
          {selectedService && (
            <div className="mb-4 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">
                Hizmet: {selectedService}
              </span>
              <button
                onClick={clearServiceFilter}
                className="ml-2 text-blue-600 hover:text-blue-800"
                aria-label="Filtreyi temizle"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Search and Filters */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Hizmet ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="all">Tüm Hizmetler</option>
                  <option value="available">Müsait Olanlar</option>
                  <option value="top-rated">En Yüksek Puanlı</option>
                  <option value="new">Yeni Hizmetler</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <SortAsc className="h-4 w-4 text-gray-500" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="rating">Puana Göre</option>
                  <option value="price-low">Fiyat (Düşük)</option>
                  <option value="price-high">Fiyat (Yüksek)</option>
                  <option value="completed">Tamamlanan İş</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Freelancer List */}
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-gray-600">
                <span className="font-semibold text-gray-900">
                  {freelancers.length}
                </span>{' '}
                hizmet bulundu
                {selectedService && (
                  <span className="ml-1 text-blue-600">
                    &quot;{selectedService}&quot; için
                  </span>
                )}
              </p>
              {selectedService && freelancers.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                  Bu hizmet türü için sonuç bulunamadı. Filtreyi kaldırmayı
                  deneyin.
                </p>
              )}
            </div>

            <Link
              href={`/marketplace/jobs/create?category=${categorySlug}&subcategory=${subcategorySlug}`}
            >
              <Button>
                İş İlanı Ver
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          {loading ? (
            <Card className="p-12 text-center">
              <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
              <p className="text-gray-600">Uzmanlar yükleniyor...</p>
            </Card>
          ) : error ? (
            <Card className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
                <X className="h-8 w-8 text-red-500" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Bir Hata Oluştu
              </h3>
              <p className="mb-6 text-gray-600">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Tekrar Dene
              </Button>
            </Card>
          ) : freelancers.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <Search className="h-8 w-8 text-blue-500" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {selectedService
                  ? 'Bu hizmet türü için uzmanlar arıyoruz'
                  : 'Uygun hizmet bulunamadı'}
              </h3>
              <p className="mb-6 text-gray-600">
                {selectedService
                  ? 'Şu anda bu hizmet türü için uygun uzman bulunmuyor. Sürekli yeni hizmetler ekliyoruz veya iş ilanı vererek uzmanların size ulaşmasını sağlayabilirsiniz.'
                  : 'Arama kriterlerinize uygun hizmet bulunmuyor. Filtreleri değiştirmeyi deneyin veya iş ilanı vererek ihtiyacınız olan hizmeti talep edin.'}
              </p>
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                {selectedService && (
                  <Button variant="outline" onClick={clearServiceFilter}>
                    <Filter className="mr-2 h-4 w-4" />
                    Hizmet Filtresini Kaldır
                  </Button>
                )}
                <Link
                  href={`/marketplace/jobs/create?category=${categorySlug}&subcategory=${subcategorySlug}`}
                >
                  <Button variant={selectedService ? 'primary' : 'outline'}>
                    İş İlanı Ver
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {freelancers.map((freelancer) => (
                <Card
                  key={freelancer.id}
                  className="group overflow-hidden border-gray-200 transition-all duration-300 hover:border-blue-200 hover:bg-blue-50/30"
                >
                  <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">
                    {/* Left Section - Profile Info */}
                    <div className="flex flex-1 gap-4">
                      {/* Avatar */}
                      <Link
                        href={`/profile/${freelancer.id}`}
                        className="shrink-0"
                      >
                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-base font-semibold text-white shadow-sm transition-all duration-300 hover:shadow-md sm:h-16 sm:w-16">
                          {freelancer.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                      </Link>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        {/* Name and Title */}
                        <div className="mb-2">
                          <div className="flex items-start justify-between gap-2">
                            <Link
                              href={`/profile/${freelancer.id}`}
                              className="group/link"
                            >
                              <h3 className="text-lg font-semibold text-gray-900 transition-colors duration-200 group-hover/link:text-blue-600 sm:text-xl">
                                {freelancer.name}
                              </h3>
                            </Link>
                            {freelancer.available && (
                              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/10">
                                <span className="relative flex h-2 w-2">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                                </span>
                                Müsait
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 sm:text-base">
                            {freelancer.title}
                          </p>
                        </div>

                        {/* Stats */}
                        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span className="font-semibold text-gray-900">
                              {freelancer.rating}
                            </span>
                            <span className="text-gray-500">
                              ({freelancer.reviewCount})
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            <span>{freelancer.location}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-gray-400" />
                            <span>
                              {freelancer.completedJobs} tamamlanan iş
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-gray-700">
                          {freelancer.description}
                        </p>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-1.5">
                          {freelancer.skills.slice(0, 4).map((skill, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700 ring-1 ring-gray-200 transition-all duration-200 hover:bg-white hover:shadow-sm hover:ring-gray-300"
                            >
                              {skill}
                            </span>
                          ))}
                          {freelancer.skills.length > 4 && (
                            <span className="inline-flex items-center rounded-md bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-500 ring-1 ring-gray-200">
                              +{freelancer.skills.length - 4}
                            </span>
                          )}
                        </div>

                        {/* Selected Service Badge */}
                        {selectedService &&
                          freelancer.services.some((s) =>
                            s
                              .toLowerCase()
                              .includes(selectedService.toLowerCase())
                          ) && (
                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-1.5 text-sm ring-1 ring-green-600/20">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              <span className="font-medium text-green-700">
                                {selectedService} hizmeti
                              </span>
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Right Section - Price and Actions */}
                    <div className="flex shrink-0 flex-row items-center justify-between gap-3 border-t border-gray-100 pt-4 sm:flex-col sm:items-end sm:justify-between sm:border-t-0 sm:border-l sm:pt-0 sm:pl-6">
                      {/* Price */}
                      <div className="text-left sm:text-right">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-blue-600">
                            ₺{freelancer.hourlyRate}
                          </span>
                          <span className="text-sm text-gray-500">/saat</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 sm:w-full sm:flex-col">
                        <Link
                          href={`/profile/${freelancer.id}`}
                          className="flex-1 sm:w-full"
                        >
                          <Button
                            className="w-full transition-all duration-200 hover:shadow-md"
                            size="sm"
                          >
                            Profil
                          </Button>
                        </Link>

                        <Button
                          variant="outline"
                          size="sm"
                          className="shrink-0 transition-all duration-200 hover:bg-gray-50 sm:w-full"
                        >
                          <Bookmark className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Kaydet</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {freelancers.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
              >
                Önceki
              </Button>
              <span className="flex items-center px-4 text-gray-700">
                Sayfa {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || loading}
              >
                Sonraki
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
