'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  MessageCircle,
  FileText,
  TrendingUp,
  Book,
  Users,
  Settings,
  Shield,
  DollarSign,
  ArrowRight,
  Star,
  Eye,
  Clock,
} from 'lucide-react';
import { useHelpCenter } from '@/hooks/useHelpCenter';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function HelpCenterMain() {
  const router = useRouter();
  const {
    categories,
    featuredArticles,
    popularArticles,
    fetchCategories,
    fetchFeaturedArticles,
    searchArticles,
  } = useHelpCenter();

  const [searchQuery, setSearchQuery] = React.useState('');

  useEffect(() => {
    fetchCategories();
    fetchFeaturedArticles();
  }, [fetchCategories, fetchFeaturedArticles]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      await searchArticles(searchQuery);
      router.push(`/help/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getCategoryIcon = (iconName?: string) => {
    if (!iconName) return Book; // Default icon

    const icons: Record<string, React.ElementType> = {
      rocket: TrendingUp,
      user: Users,
      briefcase: FileText,
      building: Settings,
      'credit-card': DollarSign,
      wrench: Settings,
      shield: Shield,
      book: Book,
    };
    return icons[iconName] || Book;
  };

  const mainCategories = categories.filter((cat) => !cat.parentId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-blue-600 to-blue-700 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">
              Yardım Merkezi
            </h1>
            <p className="mb-8 text-xl opacity-90">
              Marifeto platformunu kullanırken ihtiyacınız olan tüm yardım
              burada. Hızlıca cevap bulun veya destek ekibimizle iletişime
              geçin.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mx-auto max-w-2xl">
              <div className="relative">
                <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Neyle ilgili yardıma ihtiyacınız var?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-14 rounded-xl border-0 pr-20 pl-12 text-lg shadow-lg"
                />
                <Button
                  type="submit"
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded-lg bg-blue-600 px-6 hover:bg-blue-700"
                >
                  Ara
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-4">
          {/* Quick Actions */}
          <div className="mb-16">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Hızlı İşlemler
              </h2>
              <p className="text-gray-600">
                İhtiyacınıza uygun desteği hemen alın
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <Card className="p-6 text-center transition-all hover:shadow-lg">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <MessageCircle className="h-8 w-8 text-blue-600" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Canlı Destek
                </h3>
                <p className="mb-4 text-gray-600">
                  Anında yardım alın. Destek ekibimizle canlı chat başlatın.
                </p>
                <Button
                  onClick={() => router.push('/help/chat')}
                  className="w-full"
                >
                  Chat Başlat
                </Button>
              </Card>

              <Card className="p-6 text-center transition-all hover:shadow-lg">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                    <FileText className="h-8 w-8 text-green-600" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Destek Talebi
                </h3>
                <p className="mb-4 text-gray-600">
                  Detaylı destek için ticket oluşturun ve takip edin.
                </p>
                <Button
                  onClick={() => router.push('/support/create')}
                  variant="outline"
                  className="w-full"
                >
                  Talep Oluştur
                </Button>
              </Card>

              <Card className="p-6 text-center transition-all hover:shadow-lg">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                    <Book className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  Rehber Kitaplığı
                </h3>
                <p className="mb-4 text-gray-600">
                  Kapsamlı rehberler ve adım adım kılavuzlar.
                </p>
                <Button
                  onClick={() => router.push('/help/categories')}
                  variant="outline"
                  className="w-full"
                >
                  Rehberleri Gör
                </Button>
              </Card>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="mb-16">
            <div className="mb-8 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">
                Yardım Kategorileri
              </h2>
              <p className="text-gray-600">
                İhtiyaç duyduğunuz konuya göre rehberleri keşfedin
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mainCategories.map((category) => {
                const Icon = getCategoryIcon(category.icon);
                return (
                  <Card
                    key={category.id}
                    className="group cursor-pointer p-6 transition-all hover:shadow-lg"
                    onClick={() =>
                      router.push(`/help/categories/${category.slug}`)
                    }
                  >
                    <div className="mb-4 flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-blue-100">
                        <Icon className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {category.name}
                        </h3>
                        <div className="text-sm text-gray-500">
                          {category.articleCount} makale
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-gray-400 transition-transform group-hover:translate-x-1" />
                    </div>
                    <p className="text-gray-600">{category.description}</p>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Featured Articles */}
          {featuredArticles.length > 0 && (
            <div className="mb-16">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="mb-2 text-3xl font-bold text-gray-900">
                    Öne Çıkan Makaleler
                  </h2>
                  <p className="text-gray-600">
                    En çok ihtiyaç duyulan rehberler
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/help/articles')}
                  variant="outline"
                >
                  Tümünü Gör
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredArticles.slice(0, 6).map((article) => (
                  <Card
                    key={article.id}
                    className="group cursor-pointer p-6 transition-all hover:shadow-lg"
                    onClick={() =>
                      router.push(`/help/articles/${article.slug}`)
                    }
                  >
                    <div className="mb-3 flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm font-medium text-blue-600">
                        Öne Çıkan
                      </span>
                    </div>

                    <h3 className="mb-2 text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                      {article.title}
                    </h3>

                    <p className="mb-4 line-clamp-2 text-sm text-gray-600">
                      {article.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{article.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{article.estimatedReadTime} dk</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-400" />
                        <span>{article.rating}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Popular Articles */}
          {popularArticles.length > 0 && (
            <div className="mb-16">
              <div className="mb-8">
                <h2 className="mb-2 text-3xl font-bold text-gray-900">
                  Popüler Makaleler
                </h2>
                <p className="text-gray-600">
                  En çok okunan ve beğenilen içerikler
                </p>
              </div>

              <div className="space-y-4">
                {popularArticles.slice(0, 5).map((article, index) => (
                  <Card
                    key={article.id}
                    className="group cursor-pointer p-4 transition-all hover:shadow-md"
                    onClick={() =>
                      router.push(`/help/articles/${article.slug}`)
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
                        {index + 1}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="truncate font-semibold text-gray-900 group-hover:text-blue-600">
                          {article.title}
                        </h4>
                        <p className="truncate text-sm text-gray-600">
                          {article.excerpt}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{article.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400" />
                          <span>{article.rating}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Contact CTA */}
          <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-12 text-center text-white">
            <h2 className="mb-4 text-3xl font-bold">
              Aradığınızı bulamadınız mı?
            </h2>
            <p className="mb-8 text-xl opacity-90">
              7/24 destek ekibimiz size yardımcı olmaya hazır
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button
                onClick={() => router.push('/help/chat')}
                className="bg-white text-gray-900 hover:bg-gray-100"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Canlı Destek
              </Button>
              <Button
                onClick={() => router.push('/support/create')}
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-gray-900"
              >
                <FileText className="mr-2 h-4 w-4" />
                Destek Talebi
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
