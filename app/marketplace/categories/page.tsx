'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui';
import { Input } from '@/components/ui';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronRight,
  Users,
  TrendingUp,
  Star,
  DollarSign,
  Eye,
  Grid,
  List,
  Code,
  Palette,
  Megaphone,
  Home,
  Car,
  GraduationCap,
  Heart,
  Calculator,
} from 'lucide-react';

// Comprehensive categories with subcategories based on Armut/Bionluk analysis
const categoryData = [
  {
    id: 'teknoloji-yazilim',
    title: 'Teknoloji & Yazılım',
    icon: Code,
    color: 'bg-blue-500',
    description: 'Web, mobil ve yazılım geliştirme hizmetleri',
    count: '12,450',
    trending: true,
    subcategories: [
      {
        id: 'web-gelistirme',
        title: 'Web Geliştirme',
        services: [
          'WordPress Web Sitesi',
          'E-ticaret Sitesi',
          'Kurumsal Web Sitesi',
          'Landing Page',
          'Web Uygulaması',
          'Frontend Geliştirme',
          'Backend Geliştirme',
          'Full Stack Geliştirme',
        ],
        priceRange: '₺500 - ₺15,000',
        averageRating: 4.8,
        count: '3,200',
      },
      {
        id: 'mobil-uygulama',
        title: 'Mobil Uygulama',
        services: [
          'iOS App Geliştirme',
          'Android App Geliştirme',
          'React Native App',
          'Flutter App',
          'Hybrid App',
          'App Store Optimizasyonu',
          'App Test & Debug',
        ],
        priceRange: '₺1,000 - ₺25,000',
        averageRating: 4.7,
        count: '1,850',
      },
      {
        id: 'yazilim-gelistirme',
        title: 'Yazılım Geliştirme',
        services: [
          'Desktop Uygulama',
          'API Geliştirme',
          'Database Tasarımı',
          'Mikroservis Mimarisi',
          'DevOps & CI/CD',
          'Cloud Solutions',
          'Blockchain Geliştirme',
        ],
        priceRange: '₺1,500 - ₺50,000',
        averageRating: 4.9,
        count: '2,100',
      },
      {
        id: 'siber-guvenlik',
        title: 'Siber Güvenlik',
        services: [
          'Güvenlik Testi',
          'Penetrasyon Testi',
          'Güvenlik Danışmanlığı',
          'SSL Sertifikası',
          'Veri Koruma',
        ],
        priceRange: '₺800 - ₺12,000',
        averageRating: 4.8,
        count: '420',
      },
    ],
  },
  {
    id: 'tasarim-kreatif',
    title: 'Tasarım & Kreatif',
    icon: Palette,
    color: 'bg-purple-500',
    description: 'Grafik tasarım, logo ve kreatif çözümler',
    count: '8,750',
    trending: true,
    subcategories: [
      {
        id: 'grafik-tasarim',
        title: 'Grafik Tasarım',
        services: [
          'Logo Tasarımı',
          'Kurumsal Kimlik',
          'Broşür Tasarımı',
          'Poster Tasarımı',
          'Kartvizit Tasarımı',
          'Ambalaj Tasarımı',
          'İllüstrasyon',
        ],
        priceRange: '₺150 - ₺3,000',
        averageRating: 4.6,
        count: '4,200',
      },
      {
        id: 'web-tasarim',
        title: 'Web Tasarımı',
        services: [
          'UI/UX Tasarım',
          'Web Site Tasarımı',
          'Mobil App Tasarımı',
          'Wireframe & Mockup',
          'Prototype Tasarımı',
          'Kullanıcı Deneyimi',
        ],
        priceRange: '₺300 - ₺8,000',
        averageRating: 4.7,
        count: '2,100',
      },
      {
        id: 'video-animasyon',
        title: 'Video & Animasyon',
        services: [
          'Animasyon Video',
          'Explainer Video',
          'Logo Animasyonu',
          '2D/3D Animasyon',
          'Video Editing',
          'Motion Graphics',
        ],
        priceRange: '₺500 - ₺12,000',
        averageRating: 4.5,
        count: '1,650',
      },
      {
        id: 'fotograf-video',
        title: 'Fotoğraf & Video',
        services: [
          'Ürün Fotoğrafçılığı',
          'Etkinlik Fotoğrafçılığı',
          'Video Çekimi',
          'Fotoğraf Retüşü',
          'Drone Çekimi',
        ],
        priceRange: '₺200 - ₺5,000',
        averageRating: 4.4,
        count: '800',
      },
    ],
  },
  {
    id: 'pazarlama-reklam',
    title: 'Pazarlama & Reklam',
    icon: Megaphone,
    color: 'bg-green-500',
    description: 'Dijital pazarlama ve reklam çözümleri',
    count: '6,320',
    trending: true,
    subcategories: [
      {
        id: 'dijital-pazarlama',
        title: 'Dijital Pazarlama',
        services: [
          'SEO Optimizasyonu',
          'Google Ads Yönetimi',
          'Facebook Ads',
          'Instagram Pazarlama',
          'Content Marketing',
          'E-mail Marketing',
          'Affiliate Marketing',
        ],
        priceRange: '₺300 - ₺10,000',
        averageRating: 4.6,
        count: '3,100',
      },
      {
        id: 'sosyal-medya',
        title: 'Sosyal Medya',
        services: [
          'Sosyal Medya Yönetimi',
          'İçerik Üretimi',
          'Influencer Marketing',
          'Community Management',
          'Social Media Ads',
        ],
        priceRange: '₺500 - ₺8,000',
        averageRating: 4.5,
        count: '2,200',
      },
      {
        id: 'metin-icerik',
        title: 'Metin & İçerik',
        services: [
          'Blog Yazarlığı',
          'SEO Makale',
          'Ürün Açıklaması',
          'Proje Teklifi',
          'Çeviri Hizmetleri',
          'Editörlük',
        ],
        priceRange: '₺50 - ₺2,000',
        averageRating: 4.4,
        count: '1,020',
      },
    ],
  },
  {
    id: 'ev-yasam',
    title: 'Ev & Yaşam',
    icon: Home,
    color: 'bg-orange-500',
    description: 'Ev tadilatı, temizlik ve yaşam hizmetleri',
    count: '15,680',
    trending: false,
    subcategories: [
      {
        id: 'tadilat-dekorasyon',
        title: 'Tadilat & Dekorasyon',
        services: [
          'Boyacı',
          'Elektrikçi',
          'Tesisatçı',
          'Parke Döşeme',
          'Mutfak Tadilat',
          'Banyo Tadilat',
          'İç Mimar',
          'Dekoratör',
        ],
        priceRange: '₺200 - ₺25,000',
        averageRating: 4.3,
        count: '8,500',
      },
      {
        id: 'temizlik',
        title: 'Temizlik',
        services: [
          'Ev Temizliği',
          'Ofis Temizliği',
          'Post Construction',
          'Halı Yıkama',
          'Cam Silme',
          'Dezenfeksiyon',
        ],
        priceRange: '₺80 - ₺1,500',
        averageRating: 4.2,
        count: '4,200',
      },
      {
        id: 'nakliye-tasima',
        title: 'Nakliye & Taşıma',
        services: [
          'Evden Eve Nakliye',
          'Ofis Taşıma',
          'Eşya Taşıma',
          'Piano Taşıma',
          'Kurye Hizmetleri',
        ],
        priceRange: '₺150 - ₺5,000',
        averageRating: 4.1,
        count: '2,980',
      },
    ],
  },
  {
    id: 'egitim-danismanlik',
    title: 'Eğitim & Danışmanlık',
    icon: GraduationCap,
    color: 'bg-indigo-500',
    description: 'Özel ders, kurs ve danışmanlık hizmetleri',
    count: '4,560',
    trending: false,
    subcategories: [
      {
        id: 'ozel-ders',
        title: 'Özel Ders',
        services: [
          'Matematik Dersi',
          'İngilizce Dersi',
          'Fen Bilgisi',
          'Türkçe Dersi',
          'Müzik Dersi',
          'Resim Dersi',
          'Programlama Dersi',
        ],
        priceRange: '₺50 - ₺300',
        averageRating: 4.7,
        count: '2,100',
      },
      {
        id: 'is-danismanligi',
        title: 'İş Danışmanlığı',
        services: [
          'CV Hazırlama',
          'İş Görüşmesi Koçluğu',
          'Kariyer Danışmanlığı',
          'LinkedIn Optimizasyonu',
          'İş Planı Hazırlama',
        ],
        priceRange: '₺200 - ₺3,000',
        averageRating: 4.5,
        count: '1,200',
      },
      {
        id: 'hukuki-danismanlik',
        title: 'Hukuki Danışmanlık',
        services: [
          'Hukuki Müşavirlik',
          'Sözleşme Hazırlama',
          'Dava Takibi',
          'Miras Hukuku',
          'İş Hukuku',
        ],
        priceRange: '₺300 - ₺10,000',
        averageRating: 4.8,
        count: '1,260',
      },
    ],
  },
  {
    id: 'saglik-kisisel-bakim',
    title: 'Sağlık & Kişisel Bakım',
    icon: Heart,
    color: 'bg-pink-500',
    description: 'Güzellik, sağlık ve kişisel bakım hizmetleri',
    count: '3,240',
    trending: false,
    subcategories: [
      {
        id: 'guzellik-bakim',
        title: 'Güzellik & Bakım',
        services: [
          'Kuaförlük',
          'Makyaj',
          'Nail Art',
          'Cilt Bakımı',
          'Masaj',
          'Epilasyon',
        ],
        priceRange: '₺50 - ₺1,000',
        averageRating: 4.4,
        count: '2,100',
      },
      {
        id: 'fitness-saglik',
        title: 'Fitness & Sağlık',
        services: [
          'Personal Trainer',
          'Yoga Eğitmeni',
          'Beslenme Koçluğu',
          'Fizyoterapi',
          'Masaj Terapisi',
        ],
        priceRange: '₺100 - ₺2,000',
        averageRating: 4.6,
        count: '1,140',
      },
    ],
  },
  {
    id: 'otomotiv',
    title: 'Otomotiv',
    icon: Car,
    color: 'bg-gray-600',
    description: 'Araç bakım, onarım ve hizmetleri',
    count: '2,180',
    trending: false,
    subcategories: [
      {
        id: 'arac-bakim',
        title: 'Araç Bakım',
        services: [
          'Araç Yıkama',
          'Detailing',
          'Lastik Değişimi',
          'Fren Bakımı',
          'Motor Bakımı',
          'Klima Bakımı',
        ],
        priceRange: '₺50 - ₺3,000',
        averageRating: 4.2,
        count: '1,500',
      },
      {
        id: 'arac-kiralama',
        title: 'Araç Kiralama',
        services: [
          'Günlük Araç Kiralama',
          'Aylık Araç Kiralama',
          'Lüks Araç Kiralama',
          'Minibüs Kiralama',
        ],
        priceRange: '₺100 - ₺5,000',
        averageRating: 4.0,
        count: '680',
      },
    ],
  },
  {
    id: 'finans-muhasebe',
    title: 'Finans & Muhasebe',
    icon: Calculator,
    color: 'bg-emerald-600',
    description: 'Mali müşavirlik ve muhasebe hizmetleri',
    count: '1,890',
    trending: false,
    subcategories: [
      {
        id: 'muhasebe',
        title: 'Muhasebe',
        services: [
          'Defter Tutma',
          'Vergi Beyannamesi',
          'SGK İşlemleri',
          'Bordro Hazırlama',
          'Mali Müşavirlik',
        ],
        priceRange: '₺200 - ₺5,000',
        averageRating: 4.7,
        count: '1,200',
      },
      {
        id: 'yatirim-danismanligi',
        title: 'Yatırım Danışmanlığı',
        services: [
          'Portföy Yönetimi',
          'Borsa Analizi',
          'Kripto Para',
          'Emlak Yatırımı',
          'Emeklilik Planı',
        ],
        priceRange: '₺500 - ₺15,000',
        averageRating: 4.5,
        count: '690',
      },
    ],
  },
];

const filterOptions = [
  { value: 'all', label: 'Tüm Kategoriler' },
  { value: 'trending', label: 'Trend Kategoriler' },
  { value: 'most-popular', label: 'En Popüler' },
  { value: 'newest', label: 'En Yeni' },
];

const sortOptions = [
  { value: 'default', label: 'Varsayılan' },
  { value: 'name', label: 'İsim (A-Z)' },
  { value: 'count', label: 'Proje Sayısı' },
  { value: 'rating', label: 'Değerlendirme' },
];

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedSort, setSelectedSort] = useState('default');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const filteredCategories = useMemo(() => {
    let filtered = categoryData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (category) =>
          category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          category.subcategories.some(
            (sub) =>
              sub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              sub.services.some((service) =>
                service.toLowerCase().includes(searchTerm.toLowerCase())
              )
          )
      );
    }

    // Category filter
    if (selectedFilter === 'trending') {
      filtered = filtered.filter((category) => category.trending);
    }

    // Sort
    if (selectedSort === 'name') {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    } else if (selectedSort === 'count') {
      filtered = [...filtered].sort(
        (a, b) =>
          parseInt(b.count.replace(/,/g, '')) -
          parseInt(a.count.replace(/,/g, ''))
      );
    }

    return filtered;
  }, [searchTerm, selectedFilter, selectedSort]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center text-white">
            <h1 className="mb-6 text-5xl font-bold md:text-6xl">
              Hizmet Kategorileri
            </h1>
            <p className="mb-8 text-xl leading-relaxed opacity-90">
              Türkiye&apos;nin en kapsamlı freelance platform kategorileri.
              İhtiyacınız olan hizmeti bulun veya uzmanlık alanınızda projeler
              keşfedin.
            </p>

            {/* Search Bar */}
            <div className="relative mx-auto max-w-2xl">
              <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Kategori, hizmet veya beceri arayın..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-14 pr-4 pl-12 text-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Controls */}
      <div className="border-b bg-white py-6 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <select
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  {filterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {filteredCategories.length} kategori bulundu
              </span>

              <div className="flex rounded-lg border border-gray-300 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`rounded p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                >
                  <Grid className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`rounded p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div
            className={`grid gap-8 ${viewMode === 'grid' ? 'lg:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
          >
            {filteredCategories.map((category) => (
              <Card
                key={category.id}
                className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl ${
                  viewMode === 'list' ? 'p-0' : 'p-6'
                }`}
              >
                {/* Category Header */}
                <div className={`${viewMode === 'list' ? 'p-6' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${category.color} text-white`}
                      >
                        <category.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-xl font-bold text-gray-900">
                            {category.title}
                          </h2>
                          {category.trending && (
                            <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2 py-1 text-xs font-medium text-orange-600">
                              <TrendingUp className="h-3 w-3" />
                              Trend
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setExpandedCategory(
                          expandedCategory === category.id ? null : category.id
                        )
                      }
                      className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
                    >
                      <Users className="h-4 w-4" />
                      {category.count}
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          expandedCategory === category.id ? 'rotate-90' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Expanded Subcategories */}
                {expandedCategory === category.id && (
                  <div className="border-t bg-gray-50 p-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      {category.subcategories.map((subcategory) => (
                        <Link
                          key={subcategory.id}
                          href={`/marketplace/categories/${category.id}/${subcategory.id}`}
                          className="group/sub"
                        >
                          <Card className="p-4 transition-all hover:border-blue-300 hover:shadow-md">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 group-hover/sub:text-blue-600">
                                  {subcategory.title}
                                </h3>
                                <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    {subcategory.priceRange}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                    {subcategory.averageRating}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    {subcategory.count}
                                  </span>
                                </div>

                                {/* Popular Services */}
                                <div className="mt-3">
                                  <div className="flex flex-wrap gap-1">
                                    {subcategory.services
                                      .slice(0, 4)
                                      .map((service, idx) => (
                                        <span
                                          key={idx}
                                          className="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-600"
                                        >
                                          {service}
                                        </span>
                                      ))}
                                    {subcategory.services.length > 4 && (
                                      <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                        +{subcategory.services.length - 4} daha
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <ChevronRight className="h-4 w-4 text-gray-400 transition-colors group-hover/sub:text-blue-600" />
                            </div>
                          </Card>
                        </Link>
                      ))}
                    </div>

                    <div className="mt-4 flex justify-center">
                      <Link href={`/marketplace/categories/${category.id}`}>
                        <Button variant="outline" size="sm">
                          Tüm {category.title} Hizmetlerini Gör
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Quick Action Buttons */}
                {expandedCategory !== category.id && (
                  <div
                    className={`flex gap-2 ${viewMode === 'list' ? 'p-6 pt-0' : 'mt-4'}`}
                  >
                    <Link
                      href={`/marketplace/categories/${category.id}`}
                      className="flex-1"
                    >
                      <Button variant="outline" size="sm" className="w-full">
                        Hizmetleri Görüntüle
                      </Button>
                    </Link>
                    <Link
                      href={`/marketplace/jobs/create?category=${category.id}`}
                      className="flex-1"
                    >
                      <Button size="sm" className="w-full">
                        İş İlanı Ver
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            ))}
          </div>

          {/* No results */}
          {filteredCategories.length === 0 && (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                Aradığınız kategori bulunamadı
              </h3>
              <p className="text-gray-600">
                Lütfen arama teriminizi değiştirip tekrar deneyin.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Popular Categories CTA */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Aradığınız hizmeti bulamadınız mı?
          </h2>
          <p className="mb-8 text-lg text-gray-600">
            Özel ihtiyaçlarınız için doğrudan iş ilanı verin, sizin için en
            uygun freelancer&apos;ları bulalım.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/marketplace/jobs/create">
              <Button size="lg" className="w-full sm:w-auto">
                İş İlanı Ver
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Destek Al
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
