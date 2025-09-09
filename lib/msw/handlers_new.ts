import { http, HttpResponse } from 'msw';
import {
  Job,
  ServicePackage,
  User,
  PaginatedResponse,
  ApiResponse,
  Employer,
  Freelancer,
} from '@/types';

// Mock employer data
const mockEmployer: Employer = {
  id: 'employer-1',
  email: 'isveren@example.com',
  firstName: 'Fatma',
  lastName: 'Kaya',
  userType: 'employer',
  avatar: '/avatars/employer-1.jpg',
  location: 'Ankara, Türkiye',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
  companyName: 'Teknoloji Çözümleri Ltd.',
  industry: 'Teknoloji',
  totalSpent: 15000,
  activeJobs: 3,
  completedJobs: 12,
  rating: 4.7,
  totalReviews: 15,
  reviewsCount: 15,
  totalJobs: 15,
};

// Mock freelancer data
const mockFreelancer: Freelancer = {
  id: 'freelancer-1',
  email: 'freelancer@example.com',
  firstName: 'Ahmet',
  lastName: 'Yılmaz',
  userType: 'freelancer',
  avatar: '/avatars/freelancer-1.jpg',
  location: 'İstanbul, Türkiye',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
  title: 'Full Stack Geliştirici',
  skills: ['React', 'Node.js', 'TypeScript', 'Next.js'],
  hourlyRate: 50,
  experience: 'expert',
  rating: 4.9,
  totalReviews: 127,
  totalEarnings: 45000,
  completedJobs: 89,
  responseTime: '2 saat',
  availability: 'available',
  portfolio: [],
};

// Mock data - İş İlanları (Türkçe)
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'React.js Geliştirici Aranıyor',
    description:
      'Modern bir e-ticaret platformu geliştirmek için deneyimli React geliştirici arıyoruz. Next.js, TypeScript ve Tailwind CSS deneyimi gereklidir. Responsive tasarım ve performans optimizasyonu konularında uzman olan adaylar tercih edilecektir.',
    category: 'Web Geliştirme',
    subcategory: 'Frontend Geliştirme',
    budget: { type: 'fixed', amount: 3500 },
    timeline: '2-3 ay',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    experienceLevel: 'intermediate',
    location: 'Uzaktan',
    isRemote: true,
    status: 'open',
    employerId: 'employer-1',
    employer: mockEmployer,
    proposalsCount: 12,
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
  },
  {
    id: '2',
    title: 'Mobil Uygulama UI/UX Tasarımı',
    description:
      'Yemek sipariş uygulaması için modern ve kullanıcı dostu UI/UX tasarımı yapılacaktır. Figma ve Adobe XD bilgisi gereklidir. Material Design ve iOS Human Interface Guidelines hakkında bilgi sahibi olunmalıdır.',
    category: 'Tasarım',
    subcategory: 'UI/UX Tasarım',
    budget: { type: 'fixed', amount: 2200 },
    timeline: '4-6 hafta',
    skills: ['Figma', 'Adobe XD', 'UI/UX Tasarım', 'Mobil Tasarım'],
    experienceLevel: 'expert',
    location: 'İstanbul, Türkiye',
    isRemote: false,
    status: 'open',
    employerId: 'employer-1',
    employer: mockEmployer,
    proposalsCount: 8,
    createdAt: new Date('2024-01-14').toISOString(),
    updatedAt: new Date('2024-01-14').toISOString(),
  },
  {
    id: '3',
    title: 'Teknoloji Blogu İçerik Yazarı',
    description:
      'En son teknoloji trendleri, yapay zeka ve yazılım geliştirme konularında ilgi çekici makaleler yazacak deneyimli içerik yazarı arıyoruz. SEO bilgisi ve teknik konuları sade dille anlatabilme yeteneği gereklidir.',
    category: 'Yazarlık',
    subcategory: 'İçerik Yazarlığı',
    budget: { type: 'hourly', amount: 25, maxAmount: 40 },
    timeline: '1-2 ay',
    skills: ['İçerik Yazarlığı', 'SEO', 'Teknik Yazarlık', 'Araştırma'],
    experienceLevel: 'intermediate',
    location: 'Uzaktan',
    isRemote: true,
    status: 'open',
    employerId: 'employer-1',
    employer: mockEmployer,
    proposalsCount: 15,
    createdAt: new Date('2024-01-13').toISOString(),
    updatedAt: new Date('2024-01-13').toISOString(),
  },
  {
    id: '4',
    title: 'E-ticaret Sitesi Backend Geliştirme',
    description:
      'Node.js ve MongoDB kullanarak e-ticaret sitesi backend API geliştirme projesi. Ödeme sistemleri entegrasyonu, envanter yönetimi ve kullanıcı yönetimi modülleri geliştirilecektir.',
    category: 'Web Geliştirme',
    subcategory: 'Backend Geliştirme',
    budget: { type: 'fixed', amount: 4800 },
    timeline: '3-4 ay',
    skills: ['Node.js', 'MongoDB', 'Express.js', 'API Geliştirme'],
    experienceLevel: 'expert',
    location: 'Uzaktan',
    isRemote: true,
    status: 'open',
    employerId: 'employer-1',
    employer: mockEmployer,
    proposalsCount: 6,
    createdAt: new Date('2024-01-12').toISOString(),
    updatedAt: new Date('2024-01-12').toISOString(),
  },
  {
    id: '5',
    title: 'WordPress Plugin Geliştirme',
    description:
      'WooCommerce entegreli özel WordPress plugin geliştirme. Plugin, özel ürün filtreleme ve arama özelliklerine sahip olacaktır. PHP ve JavaScript bilgisi gereklidir.',
    category: 'Web Geliştirme',
    subcategory: 'WordPress Geliştirme',
    budget: { type: 'fixed', amount: 1800 },
    timeline: '3-4 hafta',
    skills: ['WordPress', 'PHP', 'WooCommerce', 'JavaScript'],
    experienceLevel: 'intermediate',
    location: 'Uzaktan',
    isRemote: true,
    status: 'open',
    employerId: 'employer-1',
    employer: mockEmployer,
    proposalsCount: 10,
    createdAt: new Date('2024-01-11').toISOString(),
    updatedAt: new Date('2024-01-11').toISOString(),
  },
];

// Mock data - Hizmet Paketleri (Türkçe)
const mockPackages: ServicePackage[] = [
  {
    id: '1',
    title: 'Profesyonel Web Sitesi Geliştirme',
    description:
      'React ve Next.js kullanarak modern, responsive web sitesi oluşturacağım. İşletmenizin online varlığını güçlendirmek için mükemmel çözüm.',
    category: 'Web Geliştirme',
    subcategory: 'Frontend Geliştirme',
    price: 1500,
    deliveryTime: 14,
    revisions: 3,
    features: [
      'Responsive Tasarım',
      'SEO Optimizasyonu',
      'Yönetim Paneli',
      'İletişim Formları',
      'Performans Optimizasyonu',
    ],
    freelancerId: 'freelancer-1',
    freelancer: mockFreelancer,
    orders: 89,
    rating: 4.9,
    reviews: 127,
    isActive: true,
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString(),
    images: ['/images/web-dev-1.jpg', '/images/web-dev-2.jpg'],
  },
  {
    id: '2',
    title: 'Logo Tasarım & Marka Kimliği',
    description:
      'İşletmeniz için benzersiz logo ve eksiksiz marka kimliği tasarlayacağım. Öne çıkan profesyonel görünüm elde edin.',
    category: 'Tasarım',
    subcategory: 'Logo Tasarım',
    price: 300,
    deliveryTime: 5,
    revisions: 5,
    features: [
      'Logo Tasarımı',
      'Marka Rehberi',
      'Kartvizit Tasarımı',
      'Antetli Kağıt Tasarımı',
      'Sosyal Medya Kiti',
    ],
    freelancerId: 'freelancer-1',
    freelancer: mockFreelancer,
    orders: 156,
    rating: 4.8,
    reviews: 203,
    isActive: true,
    createdAt: new Date('2024-01-08').toISOString(),
    updatedAt: new Date('2024-01-14').toISOString(),
    images: ['/images/logo-design-1.jpg', '/images/logo-design-2.jpg'],
  },
  {
    id: '3',
    title: 'SEO Optimizeli Makale Yazımı',
    description:
      "Google'da yüksek sıralamada yer alan SEO optimizeli makaleler yazacağım. Blog, web sitesi ve içerik pazarlama için mükemmel.",
    category: 'Yazarlık',
    subcategory: 'SEO Yazarlık',
    price: 50,
    deliveryTime: 3,
    revisions: 2,
    features: [
      '1000 Kelime',
      'Anahtar Kelime Araştırması',
      'Meta Açıklama',
      'SEO Optimizasyonu',
      'Özgün İçerik',
    ],
    freelancerId: 'freelancer-1',
    freelancer: mockFreelancer,
    orders: 234,
    rating: 4.7,
    reviews: 89,
    isActive: true,
    createdAt: new Date('2024-01-05').toISOString(),
    updatedAt: new Date('2024-01-12').toISOString(),
    images: ['/images/seo-writing-1.jpg'],
  },
  {
    id: '4',
    title: 'Mobil Uygulama Tasarımı',
    description:
      "iOS ve Android için modern ve kullanıcı dostu mobil uygulama arayüzü tasarlayacağım. Figma'da hazır prototipler dahil.",
    category: 'Tasarım',
    subcategory: 'Mobil Tasarım',
    price: 800,
    deliveryTime: 10,
    revisions: 3,
    features: [
      'iOS ve Android Tasarım',
      'Figma Prototipleri',
      'Kullanıcı Deneyimi',
      'Material Design',
      'Animasyon Rehberi',
    ],
    freelancerId: 'freelancer-1',
    freelancer: mockFreelancer,
    orders: 67,
    rating: 4.9,
    reviews: 45,
    isActive: true,
    createdAt: new Date('2024-01-03').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString(),
    images: ['/images/mobile-design-1.jpg', '/images/mobile-design-2.jpg'],
  },
];

// Mock data - Kullanıcılar
const mockUsers: User[] = [
  {
    id: 'freelancer-1',
    email: 'freelancer@example.com',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    userType: 'freelancer',
    avatar: '/avatars/freelancer-1.jpg',
    location: 'İstanbul, Türkiye',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'employer-1',
    email: 'isveren@example.com',
    firstName: 'Fatma',
    lastName: 'Kaya',
    userType: 'employer',
    avatar: '/avatars/employer-1.jpg',
    location: 'Ankara, Türkiye',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
];

// Helper function to create paginated response
function createPaginatedResponse<
  T extends {
    category?: string;
    title?: string;
    description?: string;
    location?: string;
    skills?: string[];
  },
>(
  items: T[],
  page: number,
  limit: number,
  filters?: Record<string, string>
): PaginatedResponse<T> {
  let filteredItems = [...items];

  // Apply filters
  if (filters) {
    if (filters.category) {
      filteredItems = filteredItems.filter((item: T) =>
        item.category?.toLowerCase().includes(filters.category.toLowerCase())
      );
    }
    if (filters.search) {
      filteredItems = filteredItems.filter(
        (item: T) =>
          item.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
          item.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.location) {
      filteredItems = filteredItems.filter((item: T) =>
        item.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.skills) {
      filteredItems = filteredItems.filter((item: T) =>
        item.skills?.some((skill: string) =>
          skill.toLowerCase().includes(filters.skills!.toLowerCase())
        )
      );
    }
  }

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedItems = filteredItems.slice(startIndex, endIndex);

  return {
    data: paginatedItems,
    pagination: {
      page,
      limit,
      total: filteredItems.length,
      totalPages: Math.ceil(filteredItems.length / limit),
    },
  };
}

// Helper function to create API response
function createApiResponse<T>(data: T, message = 'Başarılı'): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

// API Handlers
export const handlers = [
  // Auth handlers
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = (await request.json()) as {
      email: string;
      password: string;
    };

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user = mockUsers.find((u) => u.email === email);

    if (!user || password !== 'password123') {
      return HttpResponse.json(
        { success: false, error: 'E-posta veya şifre hatalı' },
        { status: 401 }
      );
    }

    const token = `mock-token-${user.id}`;

    return HttpResponse.json(
      createApiResponse({
        user,
        token,
      })
    );
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const { email, firstName, lastName, userType } = (await request.json()) as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      userType: 'freelancer' | 'employer';
    };

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Check if user already exists
    const existingUser = mockUsers.find((u) => u.email === email);
    if (existingUser) {
      return HttpResponse.json(
        { success: false, error: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Create new user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      firstName,
      lastName,
      userType,
      avatar: `/avatars/default-${userType}.jpg`,
      location: 'Türkiye',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to mock users array
    mockUsers.push(newUser);

    const token = `mock-token-${newUser.id}`;

    return HttpResponse.json(
      createApiResponse({
        user: newUser,
        token,
      })
    );
  }),

  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = token.replace('mock-token-', '');

    const user = mockUsers.find((u) => u.id === userId);

    if (!user) {
      return HttpResponse.json(
        { success: false, error: 'Geçersiz token' },
        { status: 401 }
      );
    }

    return HttpResponse.json(createApiResponse({ user }));
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json(
      createApiResponse(null, 'Başarıyla çıkış yapıldı')
    );
  }),

  // Jobs handlers
  http.get('/api/jobs', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const category = url.searchParams.get('category') || '';
    const search = url.searchParams.get('search') || '';
    const location = url.searchParams.get('location') || '';
    const skills = url.searchParams.get('skills') || '';

    const filters = { category, search, location, skills };
    const result = createPaginatedResponse(mockJobs, page, limit, filters);

    return HttpResponse.json(createApiResponse(result));
  }),

  http.get('/api/jobs/:id', ({ params }) => {
    const job = mockJobs.find((j) => j.id === params.id);

    if (!job) {
      return HttpResponse.json(
        { success: false, message: 'İş ilanı bulunamadı' },
        { status: 404 }
      );
    }

    return HttpResponse.json(createApiResponse(job));
  }),

  http.post('/api/jobs', async ({ request }) => {
    const jobData = (await request.json()) as Partial<Job>;

    const newJob: Job = {
      id: Date.now().toString(),
      title: jobData.title || '',
      description: jobData.description || '',
      category: jobData.category || '',
      subcategory: jobData.subcategory || '',
      budget: jobData.budget || { type: 'fixed', amount: 0 },
      timeline: jobData.timeline || '',
      skills: jobData.skills || [],
      experienceLevel: jobData.experienceLevel || 'beginner',
      location: jobData.location || '',
      isRemote: jobData.isRemote || false,
      status: 'open',
      employerId: 'employer-1',
      employer: mockEmployer,
      proposalsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockJobs.unshift(newJob);
    return HttpResponse.json(createApiResponse(newJob));
  }),

  // Packages handlers
  http.get('/api/packages', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const category = url.searchParams.get('category') || '';
    const search = url.searchParams.get('search') || '';

    const filters = { category, search };
    const result = createPaginatedResponse(mockPackages, page, limit, filters);

    return HttpResponse.json(createApiResponse(result));
  }),

  http.get('/api/packages/:id', ({ params }) => {
    const package_ = mockPackages.find((p) => p.id === params.id);

    if (!package_) {
      return HttpResponse.json(
        { success: false, message: 'Hizmet paketi bulunamadı' },
        { status: 404 }
      );
    }

    return HttpResponse.json(createApiResponse(package_));
  }),

  http.get('/api/packages/my', () => {
    const userPackages = mockPackages.filter(
      (p) => p.freelancerId === 'freelancer-1'
    );
    return HttpResponse.json(createApiResponse(userPackages));
  }),

  http.post('/api/packages', async ({ request }) => {
    const packageData = (await request.json()) as Partial<ServicePackage>;

    const newPackage: ServicePackage = {
      id: Date.now().toString(),
      title: packageData.title || '',
      description: packageData.description || '',
      category: packageData.category || '',
      subcategory: packageData.subcategory || '',
      price: packageData.price || 0,
      deliveryTime: packageData.deliveryTime || 1,
      revisions: packageData.revisions || 1,
      features: packageData.features || [],
      images: packageData.images || [],
      freelancerId: 'freelancer-1',
      freelancer: mockFreelancer,
      orders: 0,
      rating: 0,
      reviews: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPackages.unshift(newPackage);
    return HttpResponse.json(createApiResponse(newPackage));
  }),

  // Error handler for unmatched routes
  http.all('*', () => {
    return HttpResponse.json(
      { success: false, message: 'API endpoint bulunamadı' },
      { status: 404 }
    );
  }),
];
