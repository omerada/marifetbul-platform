import { NextRequest, NextResponse } from 'next/server';
import type { ServicePackage, PaginatedResponse } from '@/types';

// Mock data - Production'da bu veriler database'den gelecek
const mockPackages: ServicePackage[] = [
  {
    id: 'pkg-1',
    title: 'Kurumsal Web Sitesi Paketi',
    description:
      'Modern ve responsive kurumsal web sitesi tasarımı ve geliştirmesi. SEO optimizasyonu ve admin paneli dahil.',
    category: 'web-development',
    subcategory: 'website',
    price: 8000,
    deliveryTime: 7,
    revisions: 3,
    features: [
      'Responsive Tasarım',
      'SEO Optimizasyonu',
      'Admin Panel',
      '1 Yıl Destek',
    ],
    images: ['/packages/web-1-1.jpg', '/packages/web-1-2.jpg'],
    freelancerId: 'freelancer-1',
    freelancer: {
      id: 'freelancer-1',
      email: 'ayse@email.com',
      firstName: 'Ayşe',
      lastName: 'Demir',
      avatar: '/avatars/freelancer-1.jpg',
      userType: 'freelancer',
      title: 'Full Stack Developer',
      skills: ['React', 'Next.js', 'Node.js', 'TypeScript'],
      hourlyRate: 150,
      experience: 'expert',
      rating: 4.8,
      totalReviews: 46,
      reviewCount: 46,
      completedJobs: 23,
      completedProjects: 23,
      responseTime: '2 saatte',

      portfolio: [],
      languages: ['Türkçe', 'İngilizce'],
      isOnline: true,
      createdAt: '2023-01-15T00:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
    orders: 12,
    rating: 4.8,
    reviews: 12,
    isActive: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'pkg-2',
    title: 'Logo Tasarım Paketi',
    description:
      'Profesyonel logo tasarımı ve kurumsal kimlik çalışması. 3 farklı konsept ve sınırsız revizyon.',
    category: 'design',
    subcategory: 'logo',
    price: 1500,
    deliveryTime: 3,
    revisions: -1, // Sınırsız
    features: [
      '3 Farklı Konsept',
      'Sınırsız Revizyon',
      'Vektörel Dosyalar',
      'Kullanım Kılavuzu',
    ],
    images: ['/packages/logo-1-1.jpg', '/packages/logo-1-2.jpg'],
    freelancerId: 'freelancer-2',
    freelancer: {
      id: 'freelancer-2',
      email: 'mehmet@email.com',
      firstName: 'Mehmet',
      lastName: 'Yılmaz',
      avatar: '/avatars/freelancer-2.jpg',
      userType: 'freelancer',
      title: 'Grafik Tasarımcı',
      skills: ['Adobe Illustrator', 'Photoshop', 'Branding', 'UI/UX'],
      hourlyRate: 100,
      experience: 'intermediate',
      rating: 4.9,
      totalReviews: 38,
      reviewCount: 38,

      completedJobs: 31,
      completedProjects: 31,
      responseTime: '1 saatte',

      portfolio: [],
      languages: ['Türkçe'],
      isOnline: false,
      createdAt: '2023-03-20T00:00:00Z',
      updatedAt: '2024-01-14T16:00:00Z',
    },
    orders: 8,
    rating: 4.9,
    reviews: 8,
    isActive: true,
    createdAt: '2024-01-08T14:00:00Z',
    updatedAt: '2024-01-14T16:00:00Z',
  },
  {
    id: 'pkg-3',
    title: 'Mobil Uygulama UI/UX Paketi',
    description:
      'iOS ve Android için modern ve kullanıcı dostu mobil uygulama tasarımı. Prototip ve style guide dahil.',
    category: 'design',
    subcategory: 'mobile-ui',
    price: 5000,
    deliveryTime: 10,
    revisions: 5,
    features: ['iOS & Android Tasarım', 'Prototip', 'Style Guide', 'Icon Seti'],
    images: ['/packages/mobile-1-1.jpg', '/packages/mobile-1-2.jpg'],
    freelancerId: 'freelancer-3',
    freelancer: {
      id: 'freelancer-3',
      email: 'zeynep@email.com',
      firstName: 'Zeynep',
      lastName: 'Kaya',
      avatar: '/avatars/freelancer-3.jpg',
      userType: 'freelancer',
      title: 'UI/UX Designer',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'Mobile UI'],
      hourlyRate: 120,
      experience: 'expert',
      rating: 4.7,
      totalReviews: 29,
      reviewCount: 29,

      completedJobs: 18,
      completedProjects: 18,
      responseTime: '3 saatte',

      portfolio: [],
      languages: ['Türkçe', 'İngilizce'],
      isOnline: true,
      createdAt: '2023-05-10T00:00:00Z',
      updatedAt: '2024-01-13T12:00:00Z',
    },
    orders: 6,
    rating: 4.7,
    reviews: 6,
    isActive: true,
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-13T12:00:00Z',
  },
  {
    id: 'pkg-4',
    title: 'SEO Optimizasyon Paketi',
    description:
      'Kapsamlı SEO analizi ve optimizasyonu. Anahtar kelime araştırması, teknik SEO ve içerik stratejisi.',
    category: 'marketing',
    subcategory: 'seo',
    price: 2500,
    deliveryTime: 14,
    revisions: 2,
    features: [
      'SEO Analizi',
      'Anahtar Kelime Araştırması',
      'Teknik SEO',
      'İçerik Stratejisi',
    ],
    images: ['/packages/seo-1-1.jpg'],
    freelancerId: 'freelancer-4',
    freelancer: {
      id: 'freelancer-4',
      email: 'ahmet@email.com',
      firstName: 'Ahmet',
      lastName: 'Çelik',
      avatar: '/avatars/freelancer-4.jpg',
      userType: 'freelancer',
      title: 'SEO Uzmanı',
      skills: ['SEO', 'Google Analytics', 'Content Marketing', 'SEM'],
      hourlyRate: 80,
      experience: 'intermediate',
      rating: 4.6,
      totalReviews: 24,
      reviewCount: 24,

      completedJobs: 19,
      completedProjects: 19,
      responseTime: '4 saatte',

      portfolio: [],
      languages: ['Türkçe', 'İngilizce'],
      isOnline: false,
      createdAt: '2023-08-05T00:00:00Z',
      updatedAt: '2024-01-12T14:00:00Z',
    },
    orders: 9,
    rating: 4.6,
    reviews: 9,
    isActive: true,
    createdAt: '2024-01-03T11:00:00Z',
    updatedAt: '2024-01-12T14:00:00Z',
  },
  {
    id: 'pkg-5',
    title: 'WordPress E-Ticaret Paketi',
    description:
      'WooCommerce ile tam özellikli e-ticaret sitesi. Ödeme entegrasyonu ve admin eğitimi dahil.',
    category: 'web-development',
    subcategory: 'ecommerce',
    price: 6500,
    deliveryTime: 21,
    revisions: 3,
    features: [
      'WooCommerce Kurulum',
      'Ödeme Entegrasyonu',
      'Admin Eğitimi',
      '6 Ay Destek',
    ],
    images: ['/packages/ecommerce-1-1.jpg', '/packages/ecommerce-1-2.jpg'],
    freelancerId: 'freelancer-5',
    freelancer: {
      id: 'freelancer-5',
      email: 'fatma@email.com',
      firstName: 'Fatma',
      lastName: 'Özkan',
      avatar: '/avatars/freelancer-5.jpg',
      userType: 'freelancer',
      title: 'WordPress Developer',
      skills: ['WordPress', 'PHP', 'WooCommerce', 'MySQL'],
      hourlyRate: 90,
      experience: 'intermediate',
      rating: 4.8,
      totalReviews: 31,
      reviewCount: 31,

      completedJobs: 22,
      completedProjects: 22,
      responseTime: '2 saatte',

      portfolio: [],
      languages: ['Türkçe'],
      isOnline: true,
      createdAt: '2023-04-12T00:00:00Z',
      updatedAt: '2024-01-11T15:00:00Z',
    },
    orders: 11,
    rating: 4.8,
    reviews: 11,
    isActive: true,
    createdAt: '2024-01-01T08:00:00Z',
    updatedAt: '2024-01-11T15:00:00Z',
  },
  {
    id: 'pkg-6',
    title: 'Sosyal Medya İçerik Paketi',
    description:
      'Aylık sosyal medya içerik üretimi. Instagram, Facebook ve LinkedIn için özel tasarımlar.',
    category: 'marketing',
    subcategory: 'social-media',
    price: 1200,
    deliveryTime: 7,
    revisions: 2,
    features: [
      '30 Post Tasarımı',
      '3 Platform',
      'Hashtag Stratejisi',
      'İçerik Takvimi',
    ],
    images: ['/packages/social-1-1.jpg', '/packages/social-1-2.jpg'],
    freelancerId: 'freelancer-6',
    freelancer: {
      id: 'freelancer-6',
      email: 'cem@email.com',
      firstName: 'Cem',
      lastName: 'Arslan',
      avatar: '/avatars/freelancer-6.jpg',
      userType: 'freelancer',
      title: 'Sosyal Medya Uzmanı',
      skills: [
        'Social Media Marketing',
        'Content Creation',
        'Canva',
        'Analytics',
      ],
      hourlyRate: 60,
      experience: 'beginner',
      rating: 4.4,
      totalReviews: 16,
      reviewCount: 16,

      completedJobs: 14,
      completedProjects: 14,
      responseTime: '6 saatte',

      portfolio: [],
      languages: ['Türkçe'],
      isOnline: false,
      createdAt: '2023-09-20T00:00:00Z',
      updatedAt: '2024-01-10T13:00:00Z',
    },
    orders: 5,
    rating: 4.4,
    reviews: 5,
    isActive: true,
    createdAt: '2023-12-28T16:00:00Z',
    updatedAt: '2024-01-10T13:00:00Z',
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const deliveryTime = searchParams.get('deliveryTime');
    const rating = searchParams.get('rating');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Filter packages
    let filteredPackages = [...mockPackages];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPackages = filteredPackages.filter(
        (pkg) =>
          pkg.title.toLowerCase().includes(searchLower) ||
          pkg.description.toLowerCase().includes(searchLower) ||
          (pkg.freelancer?.skills &&
            pkg.freelancer.skills.some((skill) =>
              skill.toLowerCase().includes(searchLower)
            )) ||
          (pkg.features &&
            pkg.features.some((feature) =>
              feature.toLowerCase().includes(searchLower)
            ))
      );
    }

    // Category filter
    if (category) {
      filteredPackages = filteredPackages.filter(
        (pkg) => pkg.category === category
      );
    }

    // Price filter
    if (minPrice || maxPrice) {
      filteredPackages = filteredPackages.filter((pkg) => {
        if (minPrice && maxPrice) {
          return (
            pkg.price >= parseInt(minPrice) && pkg.price <= parseInt(maxPrice)
          );
        } else if (minPrice) {
          return pkg.price >= parseInt(minPrice);
        } else if (maxPrice) {
          return pkg.price <= parseInt(maxPrice);
        }
        return true;
      });
    }

    // Delivery time filter
    if (deliveryTime) {
      const maxDeliveryTime = parseInt(deliveryTime);
      filteredPackages = filteredPackages.filter(
        (pkg) => pkg.deliveryTime <= maxDeliveryTime
      );
    }

    // Rating filter
    if (rating) {
      const minRating = parseFloat(rating);
      filteredPackages = filteredPackages.filter(
        (pkg) => (pkg.rating ?? 0) >= minRating
      );
    }

    // Sort packages
    filteredPackages.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'newest':
          comparison =
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'oldest':
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'price':
          comparison = b.price - a.price;
          break;
        case 'rating':
          comparison = (b.rating ?? 0) - (a.rating ?? 0);
          break;
        case 'delivery':
          comparison = a.deliveryTime - b.deliveryTime;
          break;
        case 'popular':
          comparison = (b.reviews ?? 0) - (a.reviews ?? 0);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? comparison : -comparison;
    });

    // Pagination
    const total = filteredPackages.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedPackages = filteredPackages.slice(offset, offset + limit);

    const response: { data: PaginatedResponse<ServicePackage> } = {
      data: {
        data: paginatedPackages,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Packages API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
