'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
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
} from 'lucide-react';
import { MARKETPLACE_CATEGORIES } from '@/lib/domains/marketplace/categories-data';
import { notFound } from 'next/navigation';

// Mock freelancer data - Bu kısım gerçek veri ile değiştirilecek
const mockFreelancers = [
  {
    id: '1',
    name: 'Ahmet Yılmaz',
    title: 'Full Stack Developer',
    rating: 4.9,
    reviewCount: 127,
    completedJobs: 89,
    hourlyRate: 150,
    location: 'İstanbul',
    avatar: '/avatars/avatar-1.jpg',
    skills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
    description:
      '5+ yıl deneyimli full stack developer. Modern web teknolojileri ile profesyonel çözümler.',
    available: true,
  },
  {
    id: '2',
    name: 'Elif Demir',
    title: 'Frontend Developer',
    rating: 4.8,
    reviewCount: 95,
    completedJobs: 64,
    hourlyRate: 120,
    location: 'Ankara',
    avatar: '/avatars/avatar-2.jpg',
    skills: ['Vue.js', 'React', 'CSS', 'JavaScript'],
    description: 'Kullanıcı deneyimi odaklı modern frontend geliştirme uzmanı.',
    available: true,
  },
];

export default function SubcategoryDetailPage() {
  const params = useParams();
  const categorySlug = params.categoryId as string;
  const subcategorySlug = params.subcategoryId as string;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('rating');

  // Find category and subcategory by slug
  const { category, subcategory } = useMemo(() => {
    const cat = MARKETPLACE_CATEGORIES.find((c) => c.slug === categorySlug);
    if (!cat) return { category: null, subcategory: null };

    const subcat = cat.subcategories.find((s) => s.slug === subcategorySlug);
    return { category: cat, subcategory: subcat };
  }, [categorySlug, subcategorySlug]);

  if (!category || !subcategory) {
    notFound();
  }

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
            {subcategory.name} Freelancer&apos;ları
          </h1>
          <p className="mb-6 text-gray-600">{subcategory.description}</p>

          {/* Search and Filters */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Freelancer ara..."
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
                  <option value="all">Tüm Freelancer&apos;lar</option>
                  <option value="available">Müsait Olanlar</option>
                  <option value="top-rated">En Yüksek Puanlı</option>
                  <option value="new">Yeni Üyeler</option>
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
            <p className="text-gray-600">
              {mockFreelancers.length} freelancer bulundu
            </p>

            <Link
              href={`/marketplace/jobs/create?category=${categorySlug}&subcategory=${subcategorySlug}`}
            >
              <Button>
                İş İlanı Ver
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6">
            {mockFreelancers.map((freelancer) => (
              <Card key={freelancer.id} className="p-6">
                <div className="flex flex-col gap-6 lg:flex-row">
                  {/* Profile Info */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-semibold text-white">
                      {freelancer.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>

                    <div className="flex-1">
                      <div className="mb-2 flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            {freelancer.name}
                          </h3>
                          <p className="text-gray-600">{freelancer.title}</p>
                        </div>

                        {freelancer.available && (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            Müsait
                          </span>
                        )}
                      </div>

                      <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {freelancer.rating}
                          </span>
                          <span>({freelancer.reviewCount} değerlendirme)</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{freelancer.location}</span>
                        </div>

                        <div>{freelancer.completedJobs} tamamlanan iş</div>
                      </div>

                      <p className="mb-3 text-gray-700">
                        {freelancer.description}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {freelancer.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price and Actions */}
                  <div className="flex flex-col justify-between lg:min-w-[200px]">
                    <div className="mb-4 text-right">
                      <div className="text-2xl font-bold text-gray-900">
                        ₺{freelancer.hourlyRate}
                      </div>
                      <div className="text-sm text-gray-500">saat başına</div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Link href={`/profile/${freelancer.id}`}>
                        <Button className="w-full" size="sm">
                          Profili Görüntüle
                        </Button>
                      </Link>

                      <Button variant="outline" size="sm" className="w-full">
                        <Bookmark className="mr-2 h-4 w-4" />
                        Kaydet
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg">
              Daha Fazla Freelancer Yükle
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
