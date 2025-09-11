import { NextRequest, NextResponse } from 'next/server';
import type { Job, PaginatedResponse } from '@/types';

// Mock data - Production'da bu veriler database'den gelecek
const mockJobs: Job[] = [
  {
    id: 'job-1',
    title: 'React Native Mobil Uygulama Geliştirme',
    description:
      'iOS ve Android için React Native kullanarak modern bir sosyal medya uygulaması geliştirilmesi. Clean code ve best practices uygulanması gerekiyor.',
    budget: { type: 'fixed', amount: 20000, maxAmount: 25000 },
    location: 'İstanbul',
    isRemote: false,
    skills: ['React Native', 'TypeScript', 'Redux', 'REST API'],
    category: 'mobile-development',
    subcategory: 'mobile-apps',
    timeline: '6-8 hafta',
    duration: '2 ay',
    experienceLevel: 'expert',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    deadline: '2024-02-15T23:59:59Z',
    proposalsCount: 7,
    status: 'open',
    employerId: 'emp-1',
    employer: {
      id: 'emp-1',
      email: 'info@techstart.com',
      firstName: 'TechStart',
      lastName: 'Şirketi',
      avatar: '/avatars/company-1.jpg',
      userType: 'employer',
      companyName: 'TechStart Şirketi',
      industry: 'Teknoloji',
      totalSpent: 250000,
      activeJobs: 3,
      completedJobs: 12,
      rating: 4.8,
      totalReviews: 24,
      reviewsCount: 24,
      totalJobs: 15,
      createdAt: '2023-06-01T00:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
    },
  },
  {
    id: 'job-2',
    title: 'E-Ticaret Web Sitesi Frontend',
    description:
      'Next.js ve TypeScript kullanarak modern bir e-ticaret sitesinin frontend kısmının geliştirilmesi. Responsive tasarım ve SEO optimizasyonu önemli.',
    budget: { type: 'fixed', amount: 10000, maxAmount: 12000 },
    location: 'Uzaktan',
    isRemote: true,
    skills: ['Next.js', 'TypeScript', 'Tailwind CSS', 'SEO'],
    category: 'web-development',
    subcategory: 'frontend',
    timeline: '4-6 hafta',
    duration: '1.5 ay',
    experienceLevel: 'intermediate',
    createdAt: '2024-01-14T14:30:00Z',
    updatedAt: '2024-01-14T14:30:00Z',
    deadline: '2024-02-20T23:59:59Z',
    proposalsCount: 12,
    status: 'open',
    employerId: 'emp-2',
    employer: {
      id: 'emp-2',
      email: 'info@digitalmedya.com',
      firstName: 'Digital',
      lastName: 'Medya Ajansı',
      avatar: '/avatars/company-2.jpg',
      userType: 'employer',
      companyName: 'Digital Medya Ajansı',
      industry: 'Pazarlama',
      totalSpent: 150000,
      activeJobs: 2,
      completedJobs: 8,
      rating: 4.5,
      totalReviews: 18,
      reviewsCount: 18,
      totalJobs: 10,
      createdAt: '2023-08-15T00:00:00Z',
      updatedAt: '2024-01-14T14:30:00Z',
    },
  },
  {
    id: 'job-3',
    title: 'Logo ve Kurumsal Kimlik Tasarımı',
    description:
      "Yeni kurulan teknoloji startup'ı için logo ve kurumsal kimlik tasarımı. Modern, minimalist ve teknolojik görünüm bekleniyor.",
    budget: { type: 'fixed', amount: 4000, maxAmount: 5000 },
    location: 'Ankara',
    isRemote: false,
    skills: ['Adobe Illustrator', 'Photoshop', 'Branding', 'Logo Tasarım'],
    category: 'design',
    subcategory: 'graphic-design',
    timeline: '2-3 hafta',
    duration: '3 hafta',
    experienceLevel: 'intermediate',
    createdAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-13T09:15:00Z',
    deadline: '2024-01-30T23:59:59Z',
    proposalsCount: 23,
    status: 'open',
    employerId: 'emp-3',
    employer: {
      id: 'emp-3',
      email: 'founder@startupco.com',
      firstName: 'StartupCo',
      lastName: 'Kurucusu',
      avatar: '/avatars/company-3.jpg',
      userType: 'employer',
      companyName: 'StartupCo',
      industry: 'Teknoloji',
      totalSpent: 35000,
      activeJobs: 1,
      completedJobs: 2,
      rating: 4.9,
      totalReviews: 8,
      reviewsCount: 8,
      totalJobs: 3,
      createdAt: '2023-12-01T00:00:00Z',
      updatedAt: '2024-01-13T09:15:00Z',
    },
  },
  {
    id: 'job-4',
    title: 'Python Veri Analizi Projesi',
    description:
      'Büyük veri seti üzerinde Python kullanarak veri analizi ve görselleştirme. Pandas, NumPy ve Matplotlib/Seaborn kullanımı gerekli.',
    budget: { type: 'fixed', amount: 8000, maxAmount: 10000 },
    location: 'İzmir',
    isRemote: true,
    skills: ['Python', 'Pandas', 'NumPy', 'Data Analysis', 'Matplotlib'],
    category: 'data-science',
    subcategory: 'data-analysis',
    timeline: '3-4 hafta',
    duration: '1 ay',
    experienceLevel: 'expert',
    createdAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    deadline: '2024-02-10T23:59:59Z',
    proposalsCount: 15,
    status: 'open',
    employerId: 'emp-4',
    employer: {
      id: 'emp-4',
      email: 'arastirma@enstitu.edu.tr',
      firstName: 'Araştırma',
      lastName: 'Enstitüsü',
      avatar: '/avatars/company-4.jpg',
      userType: 'employer',
      companyName: 'Araştırma Enstitüsü',
      industry: 'Eğitim',
      totalSpent: 180000,
      activeJobs: 4,
      completedJobs: 18,
      rating: 4.7,
      totalReviews: 32,
      reviewsCount: 32,
      totalJobs: 22,
      createdAt: '2023-03-01T00:00:00Z',
      updatedAt: '2024-01-12T16:45:00Z',
    },
  },
  {
    id: 'job-5',
    title: 'WordPress Plugin Geliştirme',
    description:
      "WordPress için özel e-ticaret plugin'i geliştirme. WooCommerce entegrasyonu ve ödeme sistemleri bağlantısı gerekli.",
    budget: { type: 'fixed', amount: 5500, maxAmount: 7000 },
    location: 'Uzaktan',
    isRemote: true,
    skills: ['WordPress', 'PHP', 'MySQL', 'WooCommerce', 'Payment APIs'],
    category: 'web-development',
    subcategory: 'backend',
    timeline: '4-5 hafta',
    duration: '1.5 ay',
    experienceLevel: 'intermediate',
    createdAt: '2024-01-11T11:20:00Z',
    updatedAt: '2024-01-11T11:20:00Z',
    deadline: '2024-02-05T23:59:59Z',
    proposalsCount: 9,
    status: 'open',
    employerId: 'emp-5',
    employer: {
      id: 'emp-5',
      email: 'info@eticaret.com',
      firstName: 'E-Ticaret',
      lastName: 'Çözümleri Ltd.',
      avatar: '/avatars/company-5.jpg',
      userType: 'employer',
      companyName: 'E-Ticaret Çözümleri Ltd.',
      industry: 'E-Ticaret',
      totalSpent: 95000,
      activeJobs: 2,
      completedJobs: 7,
      rating: 4.6,
      totalReviews: 15,
      reviewsCount: 15,
      totalJobs: 9,
      createdAt: '2023-09-01T00:00:00Z',
      updatedAt: '2024-01-11T11:20:00Z',
    },
  },
  {
    id: 'job-6',
    title: 'SEO ve İçerik Optimizasyonu',
    description:
      'Mevcut kurumsal web sitesi için SEO analizi ve içerik optimizasyonu. Google Analytics ve Search Console deneyimi gerekli.',
    budget: { type: 'fixed', amount: 3250, maxAmount: 4000 },
    location: 'Bursa',
    isRemote: true,
    skills: ['SEO', 'Google Analytics', 'Content Writing', 'Keyword Research'],
    category: 'marketing',
    subcategory: 'seo',
    timeline: '2-3 hafta',
    duration: '3 hafta',
    experienceLevel: 'intermediate',
    createdAt: '2024-01-10T13:00:00Z',
    updatedAt: '2024-01-10T13:00:00Z',
    deadline: '2024-01-28T23:59:59Z',
    proposalsCount: 18,
    status: 'open',
    employerId: 'emp-6',
    employer: {
      id: 'emp-6',
      email: 'info@dijitalpazarlama.com',
      firstName: 'Dijital',
      lastName: 'Pazarlama Ajansı',
      avatar: '/avatars/company-6.jpg',
      userType: 'employer',
      companyName: 'Dijital Pazarlama Ajansı',
      industry: 'Pazarlama',
      totalSpent: 75000,
      activeJobs: 3,
      completedJobs: 11,
      rating: 4.4,
      totalReviews: 22,
      reviewsCount: 22,
      totalJobs: 14,
      createdAt: '2023-07-01T00:00:00Z',
      updatedAt: '2024-01-10T13:00:00Z',
    },
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
    const location = searchParams.get('location') || '';
    const minBudget = searchParams.get('minBudget');
    const maxBudget = searchParams.get('maxBudget');
    const skills = searchParams.get('skills')?.split(',').filter(Boolean) || [];
    const sortBy = searchParams.get('sortBy') || 'newest';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Filter jobs
    let filteredJobs = [...mockJobs];

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchLower) ||
          job.description.toLowerCase().includes(searchLower) ||
          job.skills.some((skill) => skill.toLowerCase().includes(searchLower))
      );
    }

    // Category filter
    if (category) {
      filteredJobs = filteredJobs.filter((job) => job.category === category);
    }

    // Location filter
    if (location) {
      if (location === 'remote') {
        filteredJobs = filteredJobs.filter((job) => job.isRemote === true);
      } else {
        filteredJobs = filteredJobs.filter(
          (job) =>
            job.location &&
            job.location.toLowerCase().includes(location.toLowerCase())
        );
      }
    }

    // Budget filter
    if (minBudget || maxBudget) {
      filteredJobs = filteredJobs.filter((job) => {
        const jobMinBudget = job.budget.amount;
        const jobMaxBudget = job.budget.maxAmount || job.budget.amount;

        if (minBudget && maxBudget) {
          return (
            jobMaxBudget >= parseInt(minBudget) &&
            jobMinBudget <= parseInt(maxBudget)
          );
        } else if (minBudget) {
          return jobMaxBudget >= parseInt(minBudget);
        } else if (maxBudget) {
          return jobMinBudget <= parseInt(maxBudget);
        }
        return true;
      });
    }

    // Skills filter
    if (skills.length > 0) {
      filteredJobs = filteredJobs.filter((job) =>
        skills.some((skill) =>
          job.skills.some((jobSkill) =>
            jobSkill.toLowerCase().includes(skill.toLowerCase())
          )
        )
      );
    }

    // Sort jobs
    filteredJobs.sort((a, b) => {
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
        case 'budget':
          comparison =
            (b.budget.maxAmount || b.budget.amount) -
            (a.budget.maxAmount || a.budget.amount);
          break;
        case 'proposals':
          comparison = b.proposalsCount - a.proposalsCount;
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'desc' ? comparison : -comparison;
    });

    // Pagination
    const total = filteredJobs.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedJobs = filteredJobs.slice(offset, offset + limit);

    const response: { data: PaginatedResponse<Job> } = {
      data: {
        data: paginatedJobs,
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
    console.error('Jobs API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
