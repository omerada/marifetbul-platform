'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Target,
  CheckCircle,
  ArrowRight,
  Star,
  Clock,
  Award,
} from 'lucide-react';
import { Card, Badge, Button, Loading } from '@/components/ui';
import CategoryCard from '@/components/domains/marketplace/CategoryCard';
import AllCategoriesCard from '@/components/domains/marketplace/AllCategoriesCard';
import CategorySearch from '@/components/domains/marketplace/CategorySearch';
import {
import { logger } from '@/lib/shared/utils/logger';
  useCategories,
  useCategorySearch,
  useFeaturedCategories,
} from '@/lib/domains/marketplace/categories-store';

const CategoriesPageClient: React.FC = () => {
  const {
    categories,
    loading: categoriesLoading,
    fetchCategories,
  } = useCategories();
  const { searchTerm, searchCategories } = useCategorySearch();
  const { featuredCategories, fetchFeaturedCategories } =
    useFeaturedCategories();

  // Generate search suggestions based on categories and search term
  const generateSuggestions = (term: string) => {
    if (!term.trim()) return [];

    const searchLower = term.toLowerCase();
    const suggestions: string[] = [];

    // Search in category titles
    categories.forEach((category) => {
      if (category.title.toLowerCase().includes(searchLower)) {
        suggestions.push(category.title);
      }

      // Search in top skills
      category.topSkills?.forEach((skill) => {
        if (
          skill.toLowerCase().includes(searchLower) &&
          !suggestions.includes(skill)
        ) {
          suggestions.push(skill);
        }
      });

      // Search in popular services
      category.popularServices?.forEach((service) => {
        if (
          service.toLowerCase().includes(searchLower) &&
          !suggestions.includes(service)
        ) {
          suggestions.push(service);
        }
      });
    });

    return suggestions.slice(0, 8); // Max 8 suggestions
  };

  // Fetch data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([fetchCategories(), fetchFeaturedCategories()]);
      } catch (error) {
        logger.error('Error loading categories data:', error);
      }
    };

    loadData();
  }, [fetchCategories, fetchFeaturedCategories]);

  const handleSearchChange = (term: string) => {
    searchCategories(term);
  };

  const handleSearch = (term: string) => {
    searchCategories(term);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-br from-slate-800/20 to-slate-900/20"></div>

        <div className="relative container mx-auto px-4 py-16 lg:py-24">
          <div className="mx-auto max-w-4xl text-center text-white">
            <div className="mb-6">
              <Badge
                variant="secondary"
                className="mb-4 border-white/30 bg-white/20 text-white"
              >
                <Star className="mr-1 h-3 w-3" />
                Türkiye&apos;nin Freelance Platformu
              </Badge>
              <h1 className="mb-6 text-4xl leading-tight font-bold md:text-5xl lg:text-6xl">
                Hayalinizdeki{' '}
                <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                  Projenizi
                </span>{' '}
                Gerçeğe Dönüştürün
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-100 md:text-xl">
                16 ana kategoride 800+ hizmet türünde uzman freelancerlar ile
                tanışın. Projelerinizi kaliteli, hızlı ve uygun fiyatlarla
                hayata geçirin.
              </p>
            </div>

            {/* Search Bar */}
            <div
              className="relative z-[9998] mb-8"
              style={{ position: 'relative', zIndex: 9998 }}
            >
              <div className="mx-auto max-w-2xl">
                <CategorySearch
                  searchTerm={searchTerm || ''}
                  onSearchChange={handleSearchChange}
                  onSearch={handleSearch}
                  suggestions={generateSuggestions(searchTerm || '')}
                  placeholder="Hangi hizmeti arıyorsunuz? (örn: logo tasarımı, web sitesi)"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 z-10 w-full overflow-hidden leading-none">
          <svg
            className="relative block h-12 w-full"
            data-name="Layer 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-gray-50"
            ></path>
          </svg>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              En Çok Tercih Edilen Hizmet Kategorileri
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              İhtiyacınıza uygun kategorilerde uzman freelancerlar ile çalışın.
            </p>
          </div>

          <div className="grid auto-rows-fr gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredCategories.slice(0, 4).map((category) => (
              <div key={category.id}>
                <CategoryCard
                  category={category}
                  variant="featured"
                  showStats={true}
                  showSubcategories={false}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Categories Grid */}
      <section className="bg-slate-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge
              variant="outline"
              className="mb-4 border-slate-300 text-slate-700"
            >
              <Award className="mr-1 h-3 w-3" />
              Tüm Kategoriler
            </Badge>
            <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
              Tüm Hizmet Kategorileri
            </h2>
            <p className="mx-auto max-w-3xl text-lg text-slate-600">
              16 ana kategoride 800+ farklı hizmet türünde uzman freelancerlar
              ile tanışın. İhtiyacınıza uygun kategoriyi seçin ve projenizi
              başlatın. Her kategoriye tıklayarak alt kategorileri ve tüm hizmet
              türlerini görebilirsiniz.
            </p>
            <div className="mt-6 text-sm text-slate-500">
              💡 <strong>İpucu:</strong> Kategori kartlarındaki sayılara
              tıklayarak o kategorideki tüm hizmetleri görüntüleyebilirsiniz.
            </div>
          </div>

          {/* All Categories Grid */}
          {categoriesLoading ? (
            <div className="flex justify-center py-12">
              <Loading size="lg" />
            </div>
          ) : (
            <div className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {/* Use all categories with new AllCategoriesCard component */}
              {categories.map((category) => (
                <AllCategoriesCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-4">
              <Award className="mr-1 h-3 w-3" />
              Neden MarifetBul?
            </Badge>
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Projeleriniz İçin En İyi Platform
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Güvenli ödeme sistemi, kaliteli freelancerlar ve 7/24 müşteri
              desteği ile projelerinizi güvenle yönetin.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <Card className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Güvenli Ödeme</h3>
                <p className="text-gray-600">
                  Projeleriniz tamamlanana kadar ödemeleriniz güvende. Memnun
                  kalmadığınız durumda iade garantisi.
                </p>
              </Card>
            </div>

            <div>
              <Card className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">
                  Doğrulanmış Freelancerlar
                </h3>
                <p className="text-gray-600">
                  Tüm freelancerlarımız kimlik doğrulaması geçmiş, referansları
                  onaylanmış uzmanlar.
                </p>
              </Card>
            </div>

            <div>
              <Card className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">7/24 Destek</h3>
                <p className="text-gray-600">
                  Projelerinizde yaşadığınız her türlü sorun için 7/24 müşteri
                  desteğimiz yanınızda.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 py-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-br from-slate-800/20 to-slate-900/20"></div>

        <div className="relative container mx-auto px-4">
          <div className="text-center text-white">
            <Badge
              variant="secondary"
              className="mb-6 border-white/30 bg-white/20 text-white"
            >
              <Star className="mr-1 h-3 w-3" />
              Hemen Başlayın
            </Badge>
            <h2 className="mb-6 text-4xl font-bold md:text-5xl">
              Projenizi{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Başlatın
              </span>
            </h2>
            <p className="mx-auto mb-10 max-w-3xl text-lg text-slate-200 md:text-xl">
              Binlerce uzman freelancer projenizi bekliyor. Ücretsiz üyelik ile
              hemen başlayın, sadece başarılı projeler için ödeme yapın.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/marketplace/jobs/create">
                <Button
                  size="lg"
                  className="min-w-[220px] bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg transition-all duration-300 hover:from-amber-600 hover:to-orange-600 hover:shadow-xl"
                >
                  <Target className="mr-2 h-5 w-5" />
                  Proje İlanı Ver
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="lg"
                  variant="outline"
                  className="min-w-[220px] border-2 border-white/30 bg-white/10 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-slate-900"
                >
                  <ArrowRight className="mr-2 h-5 w-5" />
                  Freelancer Ol
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CategoriesPageClient;
