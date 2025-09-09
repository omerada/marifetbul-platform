import { http, HttpResponse } from 'msw';
import {
  Job,
  ServicePackage,
  User,
  PaginatedResponse,
  ApiResponse,
  Employer,
} from '@/types';

// Mock employer data
const mockEmployer: Employer = {
  id: 'employer-1',
  email: 'employer@example.com',
  firstName: 'Fatma',
  lastName: 'Kaya',
  userType: 'employer',
  avatar: '/avatars/employer-1.jpg',
  location: 'Ankara, Turkey',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
  companyName: 'Tech Solutions Ltd.',
  industry: 'Technology',
  totalSpent: 15000,
  activeJobs: 3,
  completedJobs: 12,
  rating: 4.7,
  totalReviews: 15,
};

// Mock data - Jobs
const mockJobs: Job[] = [
  {
    id: '1',
    title: 'React.js Developer Wanted',
    description:
      'Looking for an experienced React developer to build a modern e-commerce platform. Must have experience with Next.js, TypeScript, and Tailwind CSS.',
    category: 'Web Development',
    subcategory: 'Frontend Development',
    budget: { type: 'fixed', amount: 3500 },
    timeline: '2-3 months',
    skills: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS'],
    experienceLevel: 'intermediate',
    location: 'Remote',
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
    title: 'Mobile App UI/UX Design',
    description:
      'Need a talented designer to create stunning UI/UX for our mobile application. The app is for food delivery service.',
    category: 'Design',
    subcategory: 'UI/UX Design',
    budget: { type: 'fixed', amount: 2200 },
    timeline: '4-6 weeks',
    skills: ['Figma', 'Adobe XD', 'UI/UX Design', 'Mobile Design'],
    experienceLevel: 'expert',
    location: 'Istanbul, Turkey',
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
    title: 'Content Writer for Tech Blog',
    description:
      'Seeking a skilled content writer to create engaging articles about latest technology trends, AI, and software development.',
    category: 'Writing',
    subcategory: 'Content Writing',
    budget: { type: 'hourly', amount: 25, maxAmount: 40 },
    timeline: '1-2 months',
    skills: ['Content Writing', 'SEO', 'Tech Writing', 'Research'],
    experienceLevel: 'intermediate',
    location: 'Remote',
    isRemote: true,
    status: 'open',
    employerId: 'employer-1',
    employer: mockEmployer,
    proposalsCount: 15,
    createdAt: new Date('2024-01-13').toISOString(),
    updatedAt: new Date('2024-01-13').toISOString(),
  },
];

// Mock freelancer data
const mockFreelancer = {
  id: 'freelancer-1',
  email: 'freelancer@example.com',
  firstName: 'Ahmet',
  lastName: 'Yılmaz',
  userType: 'freelancer' as const,
  avatar: '/avatars/freelancer-1.jpg',
  location: 'Istanbul, Turkey',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
  title: 'Full Stack Developer',
  skills: ['React', 'Node.js', 'TypeScript', 'Next.js'],
  hourlyRate: 50,
  experience: 'expert' as const,
  rating: 4.9,
  totalReviews: 127,
  totalEarnings: 45000,
  completedJobs: 89,
  responseTime: '2 hours',
  availability: 'available' as const,
  portfolio: [],
};

// Mock data - Service Packages
const mockPackages: ServicePackage[] = [
  {
    id: '1',
    title: 'Professional Website Development',
    description:
      'I will create a modern, responsive website using React and Next.js. Perfect for businesses looking to establish their online presence.',
    category: 'Web Development',
    subcategory: 'Frontend Development',
    price: 1500,
    deliveryTime: 14,
    revisions: 3,
    features: [
      'Responsive Design',
      'SEO Optimization',
      'Admin Panel',
      'Contact Forms',
      'Performance Optimization',
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
    title: 'Logo Design & Brand Identity',
    description:
      'I will design a unique logo and complete brand identity for your business. Get a professional look that stands out.',
    category: 'Design',
    subcategory: 'Logo Design',
    price: 300,
    deliveryTime: 5,
    revisions: 5,
    features: [
      'Logo Design',
      'Brand Guidelines',
      'Business Card Design',
      'Letterhead Design',
      'Social Media Kit',
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
    title: 'SEO Article Writing',
    description:
      'I will write SEO-optimized articles that rank high on Google. Perfect for blogs, websites, and content marketing.',
    category: 'Writing',
    subcategory: 'SEO Writing',
    price: 50,
    deliveryTime: 3,
    revisions: 2,
    features: [
      '1000 Words',
      'Keyword Research',
      'Meta Description',
      'SEO Optimization',
      'Plagiarism Free',
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
];

// Mock data - Users
const mockUsers: User[] = [
  {
    id: 'freelancer-1',
    email: 'freelancer@example.com',
    firstName: 'Ahmet',
    lastName: 'Yılmaz',
    userType: 'freelancer',
    avatar: '/avatars/freelancer-1.jpg',
    location: 'Istanbul, Turkey',
    createdAt: new Date('2024-01-01').toISOString(),
    updatedAt: new Date('2024-01-01').toISOString(),
  },
  {
    id: 'employer-1',
    email: 'employer@example.com',
    firstName: 'Fatma',
    lastName: 'Kaya',
    userType: 'employer',
    avatar: '/avatars/employer-1.jpg',
    location: 'Ankara, Turkey',
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
function createApiResponse<T>(data: T, message = 'Success'): ApiResponse<T> {
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

    const user = mockUsers.find((u) => u.email === email);

    if (!user || password !== 'password') {
      return HttpResponse.json(
        { success: false, message: 'Invalid credentials' },
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
        { success: false, message: 'Job not found' },
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
        { success: false, message: 'Package not found' },
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
      { success: false, message: 'API endpoint not found' },
      { status: 404 }
    );
  }),
];
