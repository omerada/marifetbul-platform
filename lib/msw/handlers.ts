import { http, HttpResponse } from 'msw';
import {
  Job,
  ServicePackage,
  User,
  PaginatedResponse,
  ApiResponse,
  Employer,
  Freelancer,
  Message,
  Conversation,
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
    duration: '2-3 ay',
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
    duration: '1-2 ay',
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
  {
    id: 'employer-2',
    email: 'zeynep@example.com',
    firstName: 'Zeynep',
    lastName: 'Demir',
    userType: 'employer',
    avatar: '/avatars/employer-2.jpg',
    location: 'İzmir, Türkiye',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'employer-3',
    email: 'mehmet@example.com',
    firstName: 'Mehmet',
    lastName: 'Özkan',
    userType: 'employer',
    avatar: '/avatars/employer-3.jpg',
    location: 'Ankara, Türkiye',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
];

// Mock Messages & Conversations Data
const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    participants: [mockUsers[0], mockUsers[1]], // freelancer-1, employer-1
    lastMessage: {
      id: 'msg-5',
      conversationId: 'conv-1',
      senderId: 'employer-1',
      sender: mockUsers[1],
      content:
        'Mükemmel! Hemen başlayabilirsiniz. Hangi bilgilere ihtiyacınız var?',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    },
    unreadCount: 2,
    jobId: '1',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'conv-2',
    participants: [mockUsers[0], mockUsers[2]], // freelancer-1, employer-2
    lastMessage: {
      id: 'msg-8',
      conversationId: 'conv-2',
      senderId: 'freelancer-1',
      sender: mockUsers[0],
      content: 'Tasarım revizelerini tamamladım. İnceleyebilirsiniz.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    },
    unreadCount: 0,
    packageId: '2',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'conv-3',
    participants: [mockUsers[0], mockUsers[3]], // freelancer-1, employer-3
    lastMessage: {
      id: 'msg-12',
      conversationId: 'conv-3',
      senderId: 'employer-3',
      sender: mockUsers[3],
      content: 'Teşekkürler, proje harika oldu!',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    },
    unreadCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  },
];

const mockMessages: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      senderId: 'employer-1',
      sender: mockUsers[1],
      content: 'Merhaba Ahmet! React projesi için teklifinizi inceledim.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      senderId: 'freelancer-1',
      sender: mockUsers[0],
      content: 'Merhaba Fatma Hanım! Teklifimi incelediğiniz için teşekkürler.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      senderId: 'freelancer-1',
      sender: mockUsers[0],
      content:
        'Projeyi 2 hafta içinde teslim edebilirim. Responsive tasarım ve performans optimizasyonu dahil.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
    },
    {
      id: 'msg-4',
      conversationId: 'conv-1',
      senderId: 'employer-1',
      sender: mockUsers[1],
      content: 'Süre uygun. SEO optimizasyonu da ekleyebilir misiniz?',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    },
    {
      id: 'msg-5',
      conversationId: 'conv-1',
      senderId: 'employer-1',
      sender: mockUsers[1],
      content:
        'Mükemmel! Hemen başlayabilirsiniz. Hangi bilgilere ihtiyacınız var?',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
  ],
  'conv-2': [
    {
      id: 'msg-6',
      conversationId: 'conv-2',
      senderId: 'employer-2',
      sender: mockUsers[2],
      content: 'Logo tasarımlarını gördüm, çok beğendim!',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
      id: 'msg-7',
      conversationId: 'conv-2',
      senderId: 'freelancer-1',
      sender: mockUsers[0],
      content: 'Teşekkürler! Küçük bir revizyon istediğinizi belirtmiştiniz.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: 'msg-8',
      conversationId: 'conv-2',
      senderId: 'freelancer-1',
      sender: mockUsers[0],
      content: 'Tasarım revizelerini tamamladım. İnceleyebilirsiniz.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
  ],
  'conv-3': [
    {
      id: 'msg-9',
      conversationId: 'conv-3',
      senderId: 'employer-3',
      sender: mockUsers[3],
      content: 'Mobil uygulamanın son halini test ettim.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    },
    {
      id: 'msg-10',
      conversationId: 'conv-3',
      senderId: 'freelancer-1',
      sender: mockUsers[0],
      content: 'Nasıl buldunuz? Herhangi bir sorun var mı?',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    },
    {
      id: 'msg-11',
      conversationId: 'conv-3',
      senderId: 'employer-3',
      sender: mockUsers[3],
      content: 'Her şey mükemmel çalışıyor. Performans da harika.',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    },
    {
      id: 'msg-12',
      conversationId: 'conv-3',
      senderId: 'employer-3',
      sender: mockUsers[3],
      content: 'Teşekkürler, proje harika oldu!',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    },
  ],
};

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
    const { email, password, rememberMe } = (await request.json()) as {
      email: string;
      password: string;
      rememberMe?: boolean;
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
    const expiresAt = new Date(
      Date.now() + (rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000
    ).toISOString();

    return HttpResponse.json(
      createApiResponse({
        user,
        token,
        expiresAt,
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

  http.get('/api/users/me', ({ request }) => {
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

    return HttpResponse.json(createApiResponse(user));
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
      createApiResponse(null as null, 'Başarıyla çıkış yapıldı')
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

  // Dashboard endpoints
  http.get('/api/dashboard/freelancer', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockFreelancerDashboard = {
      stats: {
        totalEarnings: 125000,
        currentMonthEarnings: 8500,
        activeOrders: 3,
        completedJobs: 89,
        responseRate: 96,
        rating: 4.9,
        profileViews: 247,
      },
      recentOrders: [
        {
          id: 'order-1',
          title: 'E-ticaret Web Sitesi',
          amount: 3500,
          status: 'in_progress',
          deadline: '2024-02-15',
          client: 'TechCorp Solutions',
        },
        {
          id: 'order-2',
          title: 'Logo Tasarımı',
          amount: 750,
          status: 'revision',
          deadline: '2024-02-10',
          client: 'StartupXYZ',
        },
      ],
      recentProposals: [
        {
          id: 'prop-1',
          jobTitle: 'React Developer',
          proposedAmount: 4200,
          status: 'pending',
          submittedAt: '2024-01-20',
        },
        {
          id: 'prop-2',
          jobTitle: 'Mobile App UI',
          proposedAmount: 2800,
          status: 'accepted',
          submittedAt: '2024-01-18',
        },
      ],
      notifications: [
        {
          id: 'notif-1',
          type: 'order_update',
          title: 'Sipariş Güncellendi',
          message: 'E-ticaret projesi için yeni gereksinimler eklendi',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
      ],
      quickStats: {
        pendingProposals: 5,
        messagesWaiting: 2,
        reviewsPending: 1,
      },
    };

    return HttpResponse.json({
      success: true,
      data: mockFreelancerDashboard,
    });
  }),

  http.get('/api/dashboard/employer', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockEmployerDashboard = {
      stats: {
        totalSpent: 45000,
        currentMonthSpending: 5200,
        activeJobs: 3,
        completedJobs: 15,
        avgProjectCost: 3000,
        savedFreelancers: 8,
      },
      activeJobs: [
        {
          id: 'job-1',
          title: 'React Developer Needed',
          proposalsCount: 12,
          budget: 3500,
          deadline: '2024-02-20',
          status: 'open',
        },
        {
          id: 'job-2',
          title: 'UI/UX Designer',
          proposalsCount: 8,
          budget: 2200,
          deadline: '2024-02-25',
          status: 'open',
        },
      ],
      recentHires: [
        {
          freelancerId: 'freelancer-1',
          jobTitle: 'Web Development',
          amount: 4500,
          startDate: '2024-01-15',
        },
        {
          freelancerId: 'freelancer-2',
          jobTitle: 'Logo Design',
          amount: 800,
          startDate: '2024-01-10',
        },
      ],
      notifications: [
        {
          id: 'notif-1',
          type: 'proposal_received',
          title: 'Yeni Teklif',
          message: 'React Developer pozisyonu için yeni teklif aldınız',
          isRead: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
      ],
      quickStats: {
        proposalsReceived: 23,
        messagesWaiting: 4,
        jobsExpiringSoon: 1,
      },
    };

    return HttpResponse.json({
      success: true,
      data: mockEmployerDashboard,
    });
  }),

  // Enhanced profile endpoints
  http.post('/api/users/avatar', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    // Future: Could use cropData for image processing
    // const cropData = formData.get('cropData') as string;

    if (!file) {
      return HttpResponse.json(
        { success: false, error: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return HttpResponse.json(
        {
          success: false,
          error:
            'Geçersiz dosya formatı. Sadece JPEG, PNG ve WebP desteklenir.',
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return HttpResponse.json(
        { success: false, error: "Dosya boyutu 5MB'dan büyük olamaz" },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate random failures (2% chance)
    if (Math.random() < 0.02) {
      return HttpResponse.json(
        { success: false, error: 'Avatar yüklenirken bir hata oluştu' },
        { status: 500 }
      );
    }

    const timestamp = Date.now();
    const avatarUrl = `/uploads/avatars/${userId}/${timestamp}-avatar.jpg`;

    return HttpResponse.json({
      success: true,
      data: {
        url: avatarUrl,
        thumbnailUrl: `/uploads/avatars/${userId}/${timestamp}-thumb.jpg`,
        originalUrl: `/uploads/avatars/${userId}/${timestamp}-original.jpg`,
      },
      message: 'Avatar başarıyla yüklendi',
    });
  }),
  http.get('/api/users/:id', async ({ params }) => {
    const { id } = params;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const user = mockUsers.find((u) => u.id === id);

    if (!user) {
      return HttpResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return HttpResponse.json(createApiResponse(user));
  }),

  http.put('/api/users/:id', async ({ params, request }) => {
    const { id } = params;
    const updateData = (await request.json()) as Partial<User>;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const userIndex = mockUsers.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      return HttpResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Update user data
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json(createApiResponse(mockUsers[userIndex]));
  }),

  // MESSAGING SYSTEM ENDPOINTS

  // Get all conversations for current user
  http.get('/api/conversations', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = token.replace('mock-token-', '');

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Filter conversations where user is a participant
    const userConversations = mockConversations
      .filter((conv) => conv.participants.some((p: User) => p.id === userId))
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

    return HttpResponse.json(createApiResponse(userConversations));
  }),

  // Get specific conversation
  http.get('/api/conversations/:id', async ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = token.replace('mock-token-', '');
    const conversationId = params.id as string;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    const conversation = mockConversations.find(
      (conv) =>
        conv.id === conversationId &&
        conv.participants.some((p: User) => p.id === userId)
    );

    if (!conversation) {
      return HttpResponse.json(
        { success: false, error: 'Konuşma bulunamadı' },
        { status: 404 }
      );
    }

    return HttpResponse.json(createApiResponse(conversation));
  }),

  // Get messages for a conversation
  http.get('/api/conversations/:id/messages', async ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = token.replace('mock-token-', '');
    const conversationId = params.id as string;

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Check if user has access to this conversation
    const conversation = mockConversations.find(
      (conv) =>
        conv.id === conversationId &&
        conv.participants.some((p: User) => p.id === userId)
    );

    if (!conversation) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }

    const messages = mockMessages[conversationId] || [];

    // Sort messages by creation date
    const sortedMessages = messages.sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return HttpResponse.json(createApiResponse(sortedMessages));
  }),

  // Send a new message
  http.post('/api/conversations/:id/messages', async ({ params, request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = token.replace('mock-token-', '');
    const conversationId = params.id as string;

    const { content } = (await request.json()) as {
      content: string;
    };

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Check if user has access to this conversation
    const conversation = mockConversations.find(
      (conv) =>
        conv.id === conversationId &&
        conv.participants.some((p: User) => p.id === userId)
    );

    if (!conversation) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 403 }
      );
    }

    const sender = mockUsers.find((u) => u.id === userId);
    if (!sender) {
      return HttpResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Create new message
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: userId,
      sender,
      content: content.trim(),
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // Add message to mock data
    if (!mockMessages[conversationId]) {
      mockMessages[conversationId] = [];
    }
    mockMessages[conversationId].push(newMessage);

    // Update conversation's last message and timestamp
    const convIndex = mockConversations.findIndex(
      (c) => c.id === conversationId
    );
    if (convIndex !== -1) {
      mockConversations[convIndex].lastMessage = newMessage;
      mockConversations[convIndex].updatedAt = new Date().toISOString();

      // Update unread count for other participants
      const otherParticipant = conversation.participants.find(
        (p: User) => p.id !== userId
      );
      if (otherParticipant) {
        mockConversations[convIndex].unreadCount += 1;
      }
    }

    return HttpResponse.json(createApiResponse(newMessage));
  }),

  // Create new conversation
  http.post('/api/conversations', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const userId = token.replace('mock-token-', '');

    const { participantId, jobId, packageId, initialMessage } =
      (await request.json()) as {
        participantId: string;
        jobId?: string;
        packageId?: string;
        initialMessage?: string;
      };

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const currentUser = mockUsers.find((u) => u.id === userId);
    const participant = mockUsers.find((u) => u.id === participantId);

    if (!currentUser || !participant) {
      return HttpResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Check if conversation already exists between these users
    const existingConversation = mockConversations.find(
      (conv) =>
        conv.participants.length === 2 &&
        conv.participants.some((p: User) => p.id === userId) &&
        conv.participants.some((p: User) => p.id === participantId) &&
        (!jobId || conv.jobId === jobId) &&
        (!packageId || conv.packageId === packageId)
    );

    if (existingConversation) {
      return HttpResponse.json(createApiResponse(existingConversation));
    }

    // Create new conversation
    const newConversation: Conversation = {
      id: `conv-${Date.now()}`,
      participants: [currentUser, participant],
      unreadCount: 0,
      jobId,
      packageId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If initial message provided, create it
    if (initialMessage?.trim()) {
      const firstMessage: Message = {
        id: `msg-${Date.now()}`,
        conversationId: newConversation.id,
        senderId: userId,
        sender: currentUser,
        content: initialMessage.trim(),
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      mockMessages[newConversation.id] = [firstMessage];
      newConversation.lastMessage = firstMessage;
      newConversation.unreadCount = 1;
    }

    mockConversations.unshift(newConversation);

    return HttpResponse.json(createApiResponse(newConversation));
  }),

  // Mark messages as read
  http.patch(
    '/api/conversations/:id/mark-read',
    async ({ params, request }) => {
      const authHeader = request.headers.get('Authorization');

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          { success: false, error: 'Yetkisiz erişim' },
          { status: 401 }
        );
      }

      const token = authHeader.replace('Bearer ', '');
      const userId = token.replace('mock-token-', '');
      const conversationId = params.id as string;

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Check if user has access to this conversation
      const convIndex = mockConversations.findIndex(
        (conv) =>
          conv.id === conversationId &&
          conv.participants.some((p: User) => p.id === userId)
      );

      if (convIndex === -1) {
        return HttpResponse.json(
          { success: false, error: 'Yetkisiz erişim' },
          { status: 403 }
        );
      }

      // Mark all messages as read for this user
      const messages = mockMessages[conversationId] || [];
      messages.forEach((message) => {
        if (message.senderId !== userId) {
          message.isRead = true;
        }
      });

      // Reset unread count for this user
      mockConversations[convIndex].unreadCount = 0;

      return HttpResponse.json(createApiResponse({ success: true }));
    }
  ),

  // Error handler for unmatched routes
  http.all('*', () => {
    return HttpResponse.json(
      { success: false, message: 'API endpoint bulunamadı' },
      { status: 404 }
    );
  }),

  // Avatar upload endpoints
  http.post('/api/upload/avatar', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return HttpResponse.json(
        { success: false, message: 'Dosya bulunamadı' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return HttpResponse.json(
        {
          success: false,
          message:
            'Geçersiz dosya formatı. Sadece JPEG, PNG ve WebP desteklenir.',
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return HttpResponse.json(
        { success: false, message: "Dosya boyutu 5MB'dan büyük olamaz" },
        { status: 400 }
      );
    }

    // Simulate processing delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    );

    // Simulate random failures (5% chance)
    if (Math.random() < 0.05) {
      return HttpResponse.json(
        { success: false, message: 'Yükleme sırasında bir hata oluştu' },
        { status: 500 }
      );
    }

    // Generate mock avatar URL
    const timestamp = Date.now();
    const avatarUrl = `/uploads/avatars/${userId}/${timestamp}-${file.name}`;

    return HttpResponse.json({
      success: true,
      url: avatarUrl,
      filename: file.name,
      size: file.size,
      type: file.type,
    });
  }),

  http.delete('/api/upload/avatar/:userId', async () => {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return HttpResponse.json({
      success: true,
      message: 'Avatar başarıyla silindi',
    });
  }),

  // User update endpoint
  http.patch('/api/users/:userId', async ({ params, request }) => {
    const { userId } = params;
    const updateData = (await request.json()) as Record<string, unknown>;

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate random failures (2% chance)
    if (Math.random() < 0.02) {
      return HttpResponse.json(
        { success: false, message: 'Güncelleme sırasında bir hata oluştu' },
        { status: 500 }
      );
    }

    // Return updated user data
    const updatedUser = {
      id: userId,
      ...updateData,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      user: updatedUser,
      message: 'Profil başarıyla güncellendi',
    });
  }),

  // Push notification handlers
  http.post('/api/push/subscribe', async ({ request }) => {
    const subscription = (await request.json()) as unknown;

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Simulate random failures (1% chance)
    if (Math.random() < 0.01) {
      return HttpResponse.json(
        { success: false, message: 'Abonelik sırasında bir hata oluştu' },
        { status: 500 }
      );
    }

    console.log('Push subscription:', subscription);

    return HttpResponse.json({
      success: true,
      message: 'Push bildirim aboneliği başarılı',
      subscriptionId: `sub-${Date.now()}`,
    });
  }),

  http.delete('/api/push/unsubscribe', async ({ request }) => {
    const body = (await request.json()) as { subscriptionId?: string };
    const { subscriptionId } = body;

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    return HttpResponse.json({
      success: true,
      message: 'Push bildirim aboneliğinden çıkıldı',
      subscriptionId,
    });
  }),

  http.post('/api/push/send', async ({ request }) => {
    const notificationData = (await request.json()) as unknown;

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate random failures (2% chance)
    if (Math.random() < 0.02) {
      return HttpResponse.json(
        { success: false, message: 'Bildirim gönderimi başarısız' },
        { status: 500 }
      );
    }

    console.log('Sending notification:', notificationData);

    return HttpResponse.json({
      success: true,
      message: 'Bildirim başarıyla gönderildi',
      notificationId: `notif-${Date.now()}`,
      sentAt: new Date().toISOString(),
    });
  }),

  http.get('/api/notifications', async ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const type = url.searchParams.get('type');

    // Mock notifications data
    const mockNotifications = [
      {
        id: 'notif-1',
        type: 'job_application',
        title: 'Yeni İş Başvurusu',
        message: 'Web sitesi geliştirme projenize yeni bir başvuru var',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
        actionUrl: '/jobs/1',
        metadata: { jobId: '1', applicantId: 'freelancer-1' },
      },
      {
        id: 'notif-2',
        type: 'payment_received',
        title: 'Ödeme Alındı',
        message: '2,500 TL tutarında ödeme hesabınıza yatırıldı',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
        actionUrl: '/dashboard/payments',
        metadata: { amount: 2500, paymentId: 'pay-123' },
      },
      {
        id: 'notif-3',
        type: 'order_update',
        title: 'Sipariş Güncellendi',
        message: 'Logo tasarım siparişiniz revizyon aşamasında',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
        actionUrl: '/orders/ord-456',
        metadata: { orderId: 'ord-456', status: 'revision' },
      },
      {
        id: 'notif-4',
        type: 'system_announcement',
        title: 'Sistem Duyurusu',
        message: 'Platformda yeni özellikler eklendi. Hemen keşfedin!',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        actionUrl: '/announcements',
        metadata: { announcementId: 'ann-789' },
      },
      {
        id: 'notif-5',
        type: 'message_received',
        title: 'Yeni Mesaj',
        message: 'Proje detayları hakkında size mesaj gönderildi',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
        actionUrl: '/messages/conv-123',
        metadata: { conversationId: 'conv-123', senderId: 'user-456' },
      },
    ];

    // Filter by type if provided
    const filteredNotifications = type
      ? mockNotifications.filter((n) => n.type === type)
      : mockNotifications;

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = filteredNotifications.slice(
      startIndex,
      endIndex
    );

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return HttpResponse.json({
      success: true,
      data: {
        notifications: paginatedNotifications,
        pagination: {
          page,
          limit,
          total: filteredNotifications.length,
          totalPages: Math.ceil(filteredNotifications.length / limit),
          hasNext: endIndex < filteredNotifications.length,
          hasPrevious: page > 1,
        },
      },
    });
  }),

  http.patch('/api/notifications/:notificationId/read', async ({ params }) => {
    const { notificationId } = params;

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    return HttpResponse.json({
      success: true,
      message: 'Bildirim okundu olarak işaretlendi',
      notificationId,
    });
  }),

  http.post(
    '/api/notifications/:notificationId/clicked',
    async ({ params, request }) => {
      const { notificationId } = params;
      const body = (await request.json()) as {
        action?: string;
        timestamp?: number;
      };
      const { action, timestamp } = body;

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      return HttpResponse.json({
        success: true,
        message: 'Bildirim tıklanması kaydedildi',
        notificationId,
        action,
        timestamp,
      });
    }
  ),

  http.post(
    '/api/notifications/:notificationId/dismissed',
    async ({ params, request }) => {
      const { notificationId } = params;
      const body = (await request.json()) as { timestamp?: number };
      const { timestamp } = body;

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 100));

      return HttpResponse.json({
        success: true,
        message: 'Bildirim kapatılması kaydedildi',
        notificationId,
        timestamp,
      });
    }
  ),

  http.get('/api/notifications/sync', async () => {
    // Mock offline notifications that need to be synced
    const offlineNotifications = [
      {
        id: 'offline-notif-1',
        title: 'Çevrimdışı Bildirim',
        message: 'İnternet bağlantınız kesildiğinde gelen bildirim',
        icon: '/icons/notification-icon.png',
        url: '/dashboard',
        tag: 'offline-sync',
      },
    ];

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 400));

    return HttpResponse.json({
      success: true,
      notifications: offlineNotifications,
    });
  }),

  http.get('/api/notifications/settings', async () => {
    // Mock notification settings
    const mockSettings = {
      browser: {
        enabled: true,
        jobApplications: true,
        messages: true,
        payments: true,
        orderUpdates: true,
        systemAnnouncements: false,
      },
      email: {
        enabled: true,
        jobApplications: true,
        messages: false,
        payments: true,
        orderUpdates: true,
        systemAnnouncements: true,
      },
      sms: {
        enabled: false,
        jobApplications: false,
        messages: false,
        payments: true,
        orderUpdates: false,
        systemAnnouncements: false,
      },
      quietHours: {
        enabled: true,
        startTime: '22:00',
        endTime: '08:00',
      },
    };

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    return HttpResponse.json({
      success: true,
      settings: mockSettings,
    });
  }),

  http.patch('/api/notifications/settings', async ({ request }) => {
    const updatedSettings = await request.json();

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Simulate random failures (1% chance)
    if (Math.random() < 0.01) {
      return HttpResponse.json(
        { success: false, message: 'Ayarlar güncellenemedi' },
        { status: 500 }
      );
    }

    return HttpResponse.json({
      success: true,
      message: 'Bildirim ayarları güncellendi',
      settings: updatedSettings,
    });
  }),

  // Location and Map API handlers
  http.get('/api/location/search', ({ request }) => {
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');
    const radius = parseFloat(url.searchParams.get('radius') || '10');
    const type = url.searchParams.get('type');
    const category = url.searchParams.get('category');
    const query = url.searchParams.get('q') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    // Mock location-based search results
    const mockResults = [
      {
        id: '1',
        type: 'job',
        title: 'Web Geliştirici',
        description:
          'Modern web uygulamaları geliştirmek için deneyimli React geliştiricisi arıyoruz.',
        budget: { min: 5000, max: 8000, currency: 'TRY' },
        deadline: '2024-12-30',
        skills: ['React', 'TypeScript', 'Node.js'],
        location: {
          id: 'loc-1',
          name: 'Çankaya',
          address: 'Çankaya, Ankara',
          city: 'Ankara',
          state: 'Ankara',
          country: 'Türkiye',
          coordinates: { latitude: 39.9208, longitude: 32.8541 },
          type: 'district' as const,
        },
        coordinates: { latitude: 39.9208, longitude: 32.8541 },
        distance: 2.5,
        employer: {
          id: 'emp-1',
          name: 'TechCorp',
          rating: 4.8,
          avatar: '/avatars/company-1.jpg',
        },
      },
      {
        id: '2',
        type: 'service',
        title: 'Logo Tasarımı',
        description:
          'Profesyonel logo tasarım hizmeti. Markanıza özel yaratıcı çözümler.',
        price: { amount: 500, currency: 'TRY' },
        rating: 4.9,
        reviewCount: 45,
        category: 'Grafik Tasarım',
        location: {
          id: 'loc-2',
          name: 'Kızılay',
          address: 'Kızılay, Çankaya, Ankara',
          city: 'Ankara',
          state: 'Ankara',
          country: 'Türkiye',
          coordinates: { latitude: 39.9199, longitude: 32.8543 },
          type: 'neighborhood' as const,
        },
        coordinates: { latitude: 39.9199, longitude: 32.8543 },
        distance: 1.8,
        freelancer: {
          id: 'free-1',
          name: 'Ahmet Yılmaz',
          rating: 4.9,
          avatar: '/avatars/freelancer-1.jpg',
        },
      },
      {
        id: '3',
        type: 'freelancer',
        name: 'Zeynep Demir',
        title: 'UI/UX Tasarımcı',
        description: 'Kullanıcı deneyimi odaklı modern tasarımlar yapıyorum.',
        skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
        hourlyRate: { amount: 150, currency: 'TRY' },
        rating: 4.7,
        reviewCount: 32,
        location: {
          id: 'loc-3',
          name: 'Bahçelievler',
          address: 'Bahçelievler, Ankara',
          city: 'Ankara',
          state: 'Ankara',
          country: 'Türkiye',
          coordinates: { latitude: 39.94, longitude: 32.82 },
          type: 'district' as const,
        },
        coordinates: { latitude: 39.94, longitude: 32.82 },
        distance: 3.2,
        avatar: '/avatars/freelancer-2.jpg',
        completedJobs: 28,
        responseTime: '2 saat',
      },
      {
        id: '4',
        type: 'job',
        title: 'Mobil Uygulama Geliştirme',
        description:
          'iOS ve Android platformları için cross-platform mobil uygulama geliştirme.',
        budget: { min: 15000, max: 25000, currency: 'TRY' },
        deadline: '2025-02-15',
        skills: ['React Native', 'Flutter', 'Firebase'],
        location: {
          id: 'loc-4',
          name: 'Bilkent',
          address: 'Bilkent, Çankaya, Ankara',
          city: 'Ankara',
          state: 'Ankara',
          country: 'Türkiye',
          coordinates: { latitude: 39.8681, longitude: 32.7489 },
          type: 'neighborhood' as const,
        },
        coordinates: { latitude: 39.8681, longitude: 32.7489 },
        distance: 8.5,
        employer: {
          id: 'emp-2',
          name: 'Innovation Labs',
          rating: 4.6,
          avatar: '/avatars/company-2.jpg',
        },
      },
    ];

    // Filter by type if specified
    let filteredResults = mockResults;
    if (type) {
      filteredResults = filteredResults.filter(
        (result) => result.type === type
      );
    }

    // Filter by category if specified
    if (category) {
      filteredResults = filteredResults.filter(
        (result) =>
          result.type === 'service' &&
          (result as { category?: string }).category === category
      );
    }

    // Filter by query if specified
    if (query) {
      const queryLower = query.toLowerCase();
      filteredResults = filteredResults.filter(
        (result) =>
          result.title.toLowerCase().includes(queryLower) ||
          result.description.toLowerCase().includes(queryLower)
      );
    }

    // Sort by distance if coordinates provided
    if (lat && lng) {
      filteredResults = filteredResults.sort((a, b) => {
        const distanceA = Math.sqrt(
          Math.pow(a.coordinates.latitude - lat, 2) +
            Math.pow(a.coordinates.longitude - lng, 2)
        );
        const distanceB = Math.sqrt(
          Math.pow(b.coordinates.latitude - lat, 2) +
            Math.pow(b.coordinates.longitude - lng, 2)
        );
        return distanceA - distanceB;
      });

      // Update distance calculations
      filteredResults = filteredResults.map((result) => ({
        ...result,
        distance:
          Math.sqrt(
            Math.pow(result.coordinates.latitude - lat, 2) +
              Math.pow(result.coordinates.longitude - lng, 2)
          ) * 111, // Rough km conversion
      }));

      // Filter by radius if specified
      if (radius) {
        filteredResults = filteredResults.filter(
          (result) => result.distance <= radius
        );
      }
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = filteredResults.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      results: paginatedResults,
      total: filteredResults.length,
      page,
      limit,
      hasMore: endIndex < filteredResults.length,
      bounds: {
        north:
          Math.max(...paginatedResults.map((r) => r.coordinates.latitude)) +
          0.01,
        south:
          Math.min(...paginatedResults.map((r) => r.coordinates.latitude)) -
          0.01,
        east:
          Math.max(...paginatedResults.map((r) => r.coordinates.longitude)) +
          0.01,
        west:
          Math.min(...paginatedResults.map((r) => r.coordinates.longitude)) -
          0.01,
      },
    });
  }),

  http.get('/api/location/geocode', ({ request }) => {
    const url = new URL(request.url);
    const address = url.searchParams.get('address');

    if (!address) {
      return HttpResponse.json(
        { success: false, error: 'Address parameter required' },
        { status: 400 }
      );
    }

    // Mock geocoding responses
    const mockGeocode: Record<
      string,
      {
        success: boolean;
        results: Array<{
          coordinates: { latitude: number; longitude: number };
          formattedAddress: string;
          components: { city: string; state?: string; country: string };
        }>;
      }
    > = {
      ankara: {
        success: true,
        results: [
          {
            coordinates: { latitude: 39.9334, longitude: 32.8597 },
            formattedAddress: 'Ankara, Türkiye',
            components: {
              city: 'Ankara',
              state: 'Ankara',
              country: 'Türkiye',
            },
          },
        ],
      },
      istanbul: {
        success: true,
        results: [
          {
            coordinates: { latitude: 41.0082, longitude: 28.9784 },
            formattedAddress: 'İstanbul, Türkiye',
            components: {
              city: 'İstanbul',
              state: 'İstanbul',
              country: 'Türkiye',
            },
          },
        ],
      },
      izmir: {
        success: true,
        results: [
          {
            coordinates: { latitude: 38.4192, longitude: 27.1287 },
            formattedAddress: 'İzmir, Türkiye',
            components: {
              city: 'İzmir',
              state: 'İzmir',
              country: 'Türkiye',
            },
          },
        ],
      },
    };

    const searchKey = address.toLowerCase().trim();
    const result = mockGeocode[searchKey];

    if (result) {
      return HttpResponse.json(result);
    }

    return HttpResponse.json({
      success: true,
      results: [],
    });
  }),

  http.get('/api/location/reverse-geocode', ({ request }) => {
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');

    if (!lat || !lng) {
      return HttpResponse.json(
        { success: false, error: 'Latitude and longitude parameters required' },
        { status: 400 }
      );
    }

    // Mock reverse geocoding
    const cities = [
      { name: 'Ankara', lat: 39.9334, lng: 32.8597 },
      { name: 'İstanbul', lat: 41.0082, lng: 28.9784 },
      { name: 'İzmir', lat: 38.4192, lng: 27.1287 },
      { name: 'Bursa', lat: 40.1826, lng: 29.0665 },
      { name: 'Antalya', lat: 36.8969, lng: 30.7133 },
    ];

    let closestCity = cities[0];
    let minDistance = Math.sqrt(
      Math.pow(lat - closestCity.lat, 2) + Math.pow(lng - closestCity.lng, 2)
    );

    cities.forEach((city) => {
      const distance = Math.sqrt(
        Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    });

    return HttpResponse.json({
      success: true,
      result: {
        formattedAddress: `${closestCity.name}, Türkiye`,
        components: {
          city: closestCity.name,
          country: 'Türkiye',
        },
        coordinates: { latitude: lat, longitude: lng },
      },
    });
  }),

  http.get('/api/location/nearby', ({ request }) => {
    const url = new URL(request.url);
    const lat = parseFloat(url.searchParams.get('lat') || '0');
    const lng = parseFloat(url.searchParams.get('lng') || '0');
    const radius = parseFloat(url.searchParams.get('radius') || '5');
    const type = url.searchParams.get('type') || 'all';

    // Mock nearby locations
    const nearbyLocations = [
      {
        id: 'poi-1',
        name: 'Kızılay Metro İstasyonu',
        type: 'transit',
        coordinates: { latitude: 39.9199, longitude: 32.8543 },
        distance: 0.5,
        address: 'Kızılay, Çankaya, Ankara',
      },
      {
        id: 'poi-2',
        name: 'Armada AVM',
        type: 'shopping',
        coordinates: { latitude: 39.9, longitude: 32.85 },
        distance: 1.2,
        address: 'Söğütözü, Çankaya, Ankara',
      },
      {
        id: 'poi-3',
        name: 'Bilkent Üniversitesi',
        type: 'education',
        coordinates: { latitude: 39.8681, longitude: 32.7489 },
        distance: 8.5,
        address: 'Bilkent, Çankaya, Ankara',
      },
    ];

    // Filter by distance
    const filtered = nearbyLocations.filter(
      (location) => location.distance <= radius
    );

    // Filter by type if specified
    const typeFiltered =
      type === 'all'
        ? filtered
        : filtered.filter((location) => location.type === type);

    return HttpResponse.json({
      success: true,
      results: typeFiltered,
      center: { latitude: lat, longitude: lng },
      radius,
    });
  }),
];
