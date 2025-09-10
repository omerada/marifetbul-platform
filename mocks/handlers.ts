import { http, HttpResponse } from 'msw';
import { User, Job, ServicePackage, Freelancer, Employer } from '@/types';

// Mock data
const mockFreelancer: Freelancer = {
  id: 'freelancer_1',
  email: 'freelancer@example.com',
  firstName: 'Ahmet',
  lastName: 'Yılmaz',
  avatar: '/images/avatars/freelancer1.jpg',
  userType: 'freelancer',
  phone: '+90 555 123 4567',
  location: 'İstanbul, Türkiye',
  bio: 'Full-stack web developer with 5+ years experience',
  website: 'https://ahmetyilmaz.dev',
  title: 'Senior Full-Stack Developer',
  skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS'],
  hourlyRate: 150,
  experience: 'expert',
  rating: 4.9,
  totalReviews: 127,
  totalEarnings: 85000,
  completedJobs: 89,
  responseTime: '2 hours',
  availability: 'available',
  portfolio: [],
  createdAt: '2023-01-15T10:00:00Z',
  updatedAt: '2024-09-09T10:00:00Z',
};

const mockEmployer: Employer = {
  id: 'employer_1',
  email: 'employer@example.com',
  firstName: 'Elif',
  lastName: 'Kaya',
  avatar: '/images/avatars/employer1.jpg',
  userType: 'employer',
  phone: '+90 555 987 6543',
  location: 'Ankara, Türkiye',
  bio: 'Tech startup founder looking for talented developers',
  companyName: 'TechStart İnovasyon',
  companySize: '10-50',
  industry: 'Technology',
  totalSpent: 45000,
  activeJobs: 3,
  completedJobs: 15,
  rating: 4.7,
  totalReviews: 23,
  reviewsCount: 23,
  totalJobs: 18,
  createdAt: '2023-03-20T10:00:00Z',
  updatedAt: '2024-09-09T10:00:00Z',
};

const mockJobs: Job[] = [
  {
    id: 'job_1',
    title: 'E-ticaret Sitesi Geliştirilmesi',
    description:
      'Modern bir e-ticaret platformu geliştirmek istiyoruz. React ve Node.js kullanılacak.',
    category: 'web-development',
    subcategory: 'full-stack',
    budget: {
      type: 'fixed',
      amount: 15000,
    },
    timeline: '2-3 ay',
    skills: ['React', 'Node.js', 'MongoDB', 'Payment Integration'],
    experienceLevel: 'expert',
    location: 'Remote',
    isRemote: true,
    status: 'open',
    employerId: 'employer_1',
    employer: mockEmployer,
    proposalsCount: 12,
    createdAt: '2024-09-01T10:00:00Z',
    updatedAt: '2024-09-01T10:00:00Z',
    deadline: '2024-12-01T00:00:00Z',
  },
  {
    id: 'job_2',
    title: 'Mobil Uygulama UI/UX Tasarımı',
    description: 'iOS ve Android için mobil uygulama tasarımı yapılacak.',
    category: 'design',
    subcategory: 'ui-ux',
    budget: {
      type: 'fixed',
      amount: 8000,
    },
    timeline: '4-6 hafta',
    skills: ['Figma', 'Adobe XD', 'Mobile Design', 'Prototyping'],
    experienceLevel: 'intermediate',
    isRemote: true,
    status: 'open',
    employerId: 'employer_1',
    employer: mockEmployer,
    proposalsCount: 8,
    createdAt: '2024-09-05T10:00:00Z',
    updatedAt: '2024-09-05T10:00:00Z',
  },
];

const mockPackages: ServicePackage[] = [
  {
    id: 'package_1',
    title: 'WordPress Website Development',
    description:
      'Professional WordPress website with custom theme and responsive design',
    category: 'web-development',
    subcategory: 'wordpress',
    price: 2500,
    deliveryTime: 14,
    revisions: 3,
    features: [
      'Custom WordPress Theme',
      'Responsive Design',
      'SEO Optimization',
      'Contact Forms',
      'Social Media Integration',
    ],
    images: ['/images/packages/wordpress1.jpg'],
    freelancerId: 'freelancer_1',
    freelancer: mockFreelancer,
    orders: 45,
    rating: 4.8,
    reviews: 32,
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-09-01T10:00:00Z',
  },
];

export const handlers = [
  // Authentication endpoints
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    if (
      body.email === 'freelancer@example.com' &&
      body.password === 'password'
    ) {
      return HttpResponse.json({
        success: true,
        data: {
          user: mockFreelancer,
          token: 'mock_jwt_token_freelancer',
        },
      });
    } else if (
      body.email === 'employer@example.com' &&
      body.password === 'password'
    ) {
      return HttpResponse.json({
        success: true,
        data: {
          user: mockEmployer,
          token: 'mock_jwt_token_employer',
        },
      });
    } else {
      return HttpResponse.json(
        {
          success: false,
          error: 'Invalid credentials',
        },
        { status: 401 }
      );
    }
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      userType: 'freelancer' | 'employer';
    };

    if (
      !body ||
      !body.email ||
      !body.firstName ||
      !body.lastName ||
      !body.userType
    ) {
      return HttpResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      userType: body.userType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      data: {
        user: newUser,
        token: `mock_jwt_token_${newUser.id}`,
      },
    });
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({
      success: true,
      message: 'Logged out successfully',
    });
  }),

  // Jobs endpoints
  http.get('/api/jobs', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');

    let filteredJobs = [...mockJobs];

    if (search) {
      filteredJobs = filteredJobs.filter(
        (job) =>
          job.title.toLowerCase().includes(search.toLowerCase()) ||
          job.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      filteredJobs = filteredJobs.filter((job) => job.category === category);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedJobs = filteredJobs.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: paginatedJobs,
      pagination: {
        page,
        limit,
        total: filteredJobs.length,
        totalPages: Math.ceil(filteredJobs.length / limit),
      },
    });
  }),

  http.get('/api/jobs/:id', ({ params }) => {
    const job = mockJobs.find((j) => j.id === params.id);

    if (!job) {
      return HttpResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: job,
    });
  }),

  // Packages endpoints
  http.get('/api/packages', ({ request }) => {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const search = url.searchParams.get('search');
    const category = url.searchParams.get('category');

    let filteredPackages = [...mockPackages];

    if (search) {
      filteredPackages = filteredPackages.filter(
        (pkg) =>
          pkg.title.toLowerCase().includes(search.toLowerCase()) ||
          pkg.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      filteredPackages = filteredPackages.filter(
        (pkg) => pkg.category === category
      );
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPackages = filteredPackages.slice(startIndex, endIndex);

    return HttpResponse.json({
      success: true,
      data: paginatedPackages,
      pagination: {
        page,
        limit,
        total: filteredPackages.length,
        totalPages: Math.ceil(filteredPackages.length / limit),
      },
    });
  }),

  http.get('/api/packages/:id', ({ params }) => {
    const pkg = mockPackages.find((p) => p.id === params.id);

    if (!pkg) {
      return HttpResponse.json(
        { success: false, error: 'Package not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      data: pkg,
    });
  }),

  // User endpoints
  http.get('/api/users/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Mock user based on token
    if (authHeader.includes('freelancer')) {
      return HttpResponse.json({
        success: true,
        data: mockFreelancer,
      });
    } else {
      return HttpResponse.json({
        success: true,
        data: mockEmployer,
      });
    }
  }),

  // Categories endpoint
  http.get('/api/categories', () => {
    const categories = [
      {
        id: 'web-development',
        name: 'Web Development',
        slug: 'web-development',
        description: 'Website and web application development',
        icon: 'Code',
        subcategories: [
          {
            id: 'frontend',
            name: 'Frontend Development',
            slug: 'frontend',
            categoryId: 'web-development',
          },
          {
            id: 'backend',
            name: 'Backend Development',
            slug: 'backend',
            categoryId: 'web-development',
          },
          {
            id: 'full-stack',
            name: 'Full Stack Development',
            slug: 'full-stack',
            categoryId: 'web-development',
          },
          {
            id: 'wordpress',
            name: 'WordPress',
            slug: 'wordpress',
            categoryId: 'web-development',
          },
        ],
      },
      {
        id: 'design',
        name: 'Design',
        slug: 'design',
        description: 'Graphic design and user interface design',
        icon: 'Palette',
        subcategories: [
          {
            id: 'ui-ux',
            name: 'UI/UX Design',
            slug: 'ui-ux',
            categoryId: 'design',
          },
          {
            id: 'graphic-design',
            name: 'Graphic Design',
            slug: 'graphic-design',
            categoryId: 'design',
          },
          {
            id: 'logo-design',
            name: 'Logo Design',
            slug: 'logo-design',
            categoryId: 'design',
          },
        ],
      },
      {
        id: 'mobile-app',
        name: 'Mobile App Development',
        slug: 'mobile-app',
        description: 'iOS and Android mobile applications',
        icon: 'Smartphone',
        subcategories: [
          {
            id: 'ios',
            name: 'iOS Development',
            slug: 'ios',
            categoryId: 'mobile-app',
          },
          {
            id: 'android',
            name: 'Android Development',
            slug: 'android',
            categoryId: 'mobile-app',
          },
          {
            id: 'react-native',
            name: 'React Native',
            slug: 'react-native',
            categoryId: 'mobile-app',
          },
        ],
      },
    ];

    return HttpResponse.json({
      success: true,
      data: categories,
    });
  }),
];
