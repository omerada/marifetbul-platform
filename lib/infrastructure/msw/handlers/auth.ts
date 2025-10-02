import { http, HttpResponse } from 'msw';
import type { User } from '@/types';

// Mock Users Database
const mockUsers: User[] = [
  {
    id: 'admin-001',
    email: 'admin@marifetbul.com',
    firstName: 'Admin',
    lastName: 'User',
    userType: 'admin',
    role: 'admin',
    avatar: '/images/admin-avatar.png',
    accountStatus: 'active',
    verificationStatus: 'verified',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    permissions: [
      'users.read',
      'users.write',
      'users.delete',
      'content.moderate',
      'analytics.read',
      'settings.write',
      'system.admin',
    ],
  },
  {
    id: 'user-001',
    email: 'demo@example.com',
    firstName: 'Demo',
    lastName: 'User',
    userType: 'freelancer',
    role: 'user',
    avatar: '/images/user-avatar.png',
    accountStatus: 'active',
    verificationStatus: 'verified',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: 'user-002',
    email: 'employer@example.com',
    firstName: 'Demo',
    lastName: 'Employer',
    userType: 'employer',
    role: 'user',
    avatar: '/images/employer-avatar.png',
    accountStatus: 'active',
    verificationStatus: 'verified',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  },
];

// Mock credentials for demo accounts
const mockCredentials = [
  { email: 'admin@marifetbul.com', password: 'admin123' },
  { email: 'demo@example.com', password: 'demo123' },
  { email: 'employer@example.com', password: 'employer123' },
];

export const authHandlers = [
  // Login endpoint
  http.post('/api/auth/login', async ({ request }) => {
    console.log('🎯 MSW AUTH: Login request intercepted');

    try {
      const body = (await request.json()) as {
        email: string;
        password: string;
        rememberMe?: boolean;
      };
      const { email, password } = body;

      console.log('🔍 MSW AUTH: Login attempt for email:', email);
      console.log('🔍 MSW AUTH: Password provided:', password);
      console.log('🔍 MSW AUTH: Available credentials:', mockCredentials);

      // Find matching credentials
      const credential = mockCredentials.find(
        (cred) => cred.email === email && cred.password === password
      );

      if (!credential) {
        console.log('❌ MSW AUTH: Invalid credentials');
        console.log('❌ MSW AUTH: Expected credentials:', mockCredentials);
        return HttpResponse.json(
          {
            success: false,
            error: 'Geçersiz e-posta veya şifre',
          },
          { status: 401 }
        );
      }

      console.log('✅ MSW AUTH: Credentials match!');

      // Find user
      const user = mockUsers.find((u) => u.email === email);
      if (!user) {
        console.log('❌ MSW AUTH: User not found in database');
        console.log(
          '❌ MSW AUTH: Available users:',
          mockUsers.map((u) => ({ id: u.id, email: u.email, role: u.role }))
        );
        return HttpResponse.json(
          {
            success: false,
            error: 'Kullanıcı bulunamadı',
          },
          { status: 404 }
        );
      }

      console.log('✅ MSW AUTH: Login successful for user:', {
        id: user.id,
        email: user.email,
        role: user.role,
        userType: user.userType,
      });

      // Update last login
      user.lastLoginAt = new Date().toISOString();

      // Generate mock token
      const token = `mock-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const response = {
        success: true,
        data: {
          user,
          token,
        },
      };

      console.log('📤 MSW AUTH: Sending response:', response);

      return HttpResponse.json(response);
    } catch (error) {
      console.error('💥 MSW AUTH: Login error:', error);
      return HttpResponse.json(
        {
          success: false,
          error: 'Server error',
        },
        { status: 500 }
      );
    }
  }),

  // Register endpoint
  http.post('/api/auth/register', async ({ request }) => {
    try {
      const body = (await request.json()) as {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        userType: 'freelancer' | 'employer';
      };

      const { firstName, lastName, email, password, userType } = body;

      // Check if user already exists
      const existingUser = mockUsers.find((u) => u.email === email);
      if (existingUser) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Bu e-posta adresi zaten kullanımda',
          },
          { status: 409 }
        );
      }

      // Create new user
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        firstName,
        lastName,
        userType,
        role: 'user',
        avatar: `/images/default-${userType}.png`,
        accountStatus: 'active',
        verificationStatus: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      // Add to mock database
      mockUsers.push(newUser);
      mockCredentials.push({ email, password });

      // Generate mock token
      const token = `mock-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return HttpResponse.json({
        success: true,
        data: {
          user: newUser,
          token,
        },
      });
    } catch {
      return HttpResponse.json(
        {
          success: false,
          error: 'Server error',
        },
        { status: 500 }
      );
    }
  }),

  // Get current user endpoint
  http.get('/api/users/me', async ({ request }) => {
    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Unauthorized',
          },
          { status: 401 }
        );
      }

      // For demo purposes, return admin user for any valid token
      const token = authHeader.substring(7);
      if (token.startsWith('mock-')) {
        const adminUser = mockUsers.find((u) => u.userType === 'admin');
        if (adminUser) {
          return HttpResponse.json({
            success: true,
            data: adminUser,
          });
        }
      }

      return HttpResponse.json(
        {
          success: false,
          error: 'Invalid token',
        },
        { status: 401 }
      );
    } catch {
      return HttpResponse.json(
        {
          success: false,
          error: 'Server error',
        },
        { status: 500 }
      );
    }
  }),

  // Logout endpoint
  http.post('/api/auth/logout', async () => {
    return HttpResponse.json({
      success: true,
      message: 'Başarıyla çıkış yapıldı',
    });
  }),

  // Admin Dashboard endpoint
  http.get('/api/v1/admin/dashboard', async ({ request }) => {
    console.log('🎯 MSW AUTH: Admin dashboard request intercepted');

    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ MSW AUTH: No valid authorization header');
        return HttpResponse.json(
          {
            success: false,
            error: 'Unauthorized',
          },
          { status: 401 }
        );
      }

      const token = authHeader.substring(7);
      if (!token.startsWith('mock-')) {
        console.log('❌ MSW AUTH: Invalid token format');
        return HttpResponse.json(
          {
            success: false,
            error: 'Invalid token',
          },
          { status: 401 }
        );
      }

      console.log('✅ MSW AUTH: Admin dashboard data request successful');

      // Mock admin dashboard data
      const adminDashboardData = {
        stats: {
          totalUsers: 1247,
          activeUsers: 892,
          totalJobs: 567,
          activeJobs: 234,
          totalRevenue: 125640.5,
          pendingPayouts: 12340.25,
          newUsersToday: 15,
          monthlyRevenue: 34890.75,
          revenueGrowth: 12.5,
          pendingOrders: 23,
          completedOrders: 156,
          conversionRate: 8.2,
          userRetentionRate: 74.3,
        },
        alerts: [
          {
            id: 'alert-001',
            type: 'security' as const,
            severity: 'medium' as const,
            priority: 'medium' as const,
            title: 'Unusual Login Activity',
            description:
              'Multiple failed login attempts detected from IP: 192.168.1.100',
            message:
              'Multiple failed login attempts detected from IP: 192.168.1.100',
            isResolved: false,
            isRead: false,
            createdAt: new Date().toISOString(),
            actionRequired: true,
            actionUrl: '/admin/security/activity',
            actionText: 'View Details',
            dismissible: true,
            isDismissed: false,
          },
          {
            id: 'alert-002',
            type: 'account' as const,
            severity: 'low' as const,
            priority: 'low' as const,
            title: 'Database Backup Completed',
            description: 'Daily database backup completed successfully',
            message: 'Daily database backup completed successfully',
            isResolved: true,
            isRead: false,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            actionRequired: false,
            dismissible: true,
            isDismissed: false,
          },
        ],
        recentActivity: [
          {
            id: 'activity-001',
            type: 'account' as const,
            severity: 'low' as const,
            priority: 'low' as const,
            title: 'New User Registration',
            description: 'A new freelancer account was created',
            message: 'A new freelancer account was created',
            isResolved: true,
            isRead: true,
            createdAt: new Date(Date.now() - 1800000).toISOString(),
            actionRequired: false,
            dismissible: true,
            isDismissed: false,
          },
          {
            id: 'activity-002',
            type: 'security' as const,
            severity: 'medium' as const,
            priority: 'medium' as const,
            title: 'Content Report',
            description: 'A job posting was reported for review',
            message: 'A job posting was reported for review',
            isResolved: false,
            isRead: true,
            createdAt: new Date(Date.now() - 7200000).toISOString(),
            actionRequired: true,
            actionUrl: '/admin/moderation/reports',
            actionText: 'Review Report',
            dismissible: true,
            isDismissed: false,
          },
        ],
        systemHealth: {
          status: 'healthy' as const,
          uptime: 99.8,
          lastChecked: new Date().toISOString(),
          issues: [],
        },
        charts: {
          userGrowth: [
            { date: '2024-09-01', users: 1100 },
            { date: '2024-09-15', users: 1180 },
            { date: '2024-10-01', users: 1247 },
          ],
          revenue: [
            { date: '2024-09-01', amount: 98450.25 },
            { date: '2024-09-15', amount: 112840.75 },
            { date: '2024-10-01', amount: 125640.5 },
          ],
        },
      };

      console.log('📤 MSW AUTH: Sending admin dashboard response');

      return HttpResponse.json({
        success: true,
        data: adminDashboardData,
      });
    } catch (error) {
      console.error('💥 MSW AUTH: Admin dashboard error:', error);
      return HttpResponse.json(
        {
          success: false,
          error: 'Server error',
        },
        { status: 500 }
      );
    }
  }),

  // Performance metrics endpoint
  http.get('/api/v1/performance/metrics', async () => {
    console.log('📊 MSW: Performance metrics request intercepted');

    const mockMetrics = {
      coreWebVitals: {
        lcp: 1500 + Math.random() * 1000, // 1.5-2.5s
        fid: 50 + Math.random() * 50, // 50-100ms
        cls: Math.random() * 0.1, // 0-0.1
        fcp: 1000 + Math.random() * 800, // 1-1.8s
        ttfb: 200 + Math.random() * 300, // 200-500ms
      },
      loadTimes: {
        domContentLoaded: 800 + Math.random() * 400,
        firstByte: 200 + Math.random() * 300,
        totalPageLoad: 2000 + Math.random() * 1000,
      },
      resourceCounts: {
        total: 25 + Math.floor(Math.random() * 20),
        scripts: 8 + Math.floor(Math.random() * 5),
        stylesheets: 3 + Math.floor(Math.random() * 3),
        images: 10 + Math.floor(Math.random() * 10),
        fonts: 2 + Math.floor(Math.random() * 3),
      },
      memoryUsage: {
        used: 50 + Math.random() * 30, // 50-80MB
        total: 100 + Math.random() * 50, // 100-150MB
        percentage: 40 + Math.random() * 40, // 40-80%
      },
      bundleSize: {
        total: 800000 + Math.random() * 400000, // 800KB-1.2MB
        gzipped: 200000 + Math.random() * 100000, // 200-300KB
        assets: Math.floor(15 + Math.random() * 10), // 15-25 assets
      },
      timestamp: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      data: mockMetrics,
    });
  }),

  // Test endpoint - authorization header yok
  http.get('/api/v1/admin/test', async () => {
    console.log('🧪 MSW: Test endpoint intercepted');
    return HttpResponse.json({
      success: true,
      message: 'MSW test endpoint working!',
      timestamp: new Date().toISOString(),
    });
  }),

  // Admin Users Management Endpoints
  // Get users list with filters and pagination
  http.get('/api/v1/admin/users', async ({ request }) => {
    console.log('👥 MSW: Admin users list request intercepted');

    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('❌ MSW: No valid authorization header');
        return HttpResponse.json(
          {
            success: false,
            error: 'Unauthorized',
          },
          { status: 401 }
        );
      }

      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const search = url.searchParams.get('search') || '';
      const userType = url.searchParams.get('userType') || 'all';
      const accountStatus = url.searchParams.get('accountStatus') || 'all';
      const verificationStatus =
        url.searchParams.get('verificationStatus') || 'all';
      const sortBy = url.searchParams.get('sortBy') || 'createdAt';
      const sortOrder =
        (url.searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

      console.log('📊 MSW: Users list params:', {
        page,
        limit,
        search,
        userType,
        accountStatus,
      });

      // Generate mock users data
      const generateMockUsers = (count: number) => {
        const userTypes = ['freelancer', 'employer'] as const;
        const accountStatuses = ['active', 'suspended', 'banned'] as const;
        const verificationStatuses = [
          'verified',
          'pending',
          'unverified',
        ] as const;
        const locations = [
          'İstanbul, Türkiye',
          'Ankara, Türkiye',
          'İzmir, Türkiye',
          'Bursa, Türkiye',
          'Antalya, Türkiye',
        ];

        const firstNames = [
          'Ahmet',
          'Mehmet',
          'Ali',
          'Ayşe',
          'Fatma',
          'Zeynep',
          'Burak',
          'Elif',
          'Emre',
          'Seda',
        ];
        const lastNames = [
          'Yılmaz',
          'Kaya',
          'Demir',
          'Şahin',
          'Çelik',
          'Özkan',
          'Aydın',
          'Özdemir',
          'Arslan',
          'Doğan',
        ];

        return Array.from({ length: count }, (_, index) => {
          const firstName =
            firstNames[Math.floor(Math.random() * firstNames.length)];
          const lastName =
            lastNames[Math.floor(Math.random() * lastNames.length)];
          const userTypeSelected =
            userTypes[Math.floor(Math.random() * userTypes.length)];
          const joinDate = new Date(
            Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
          ).toISOString();
          const lastActiveAt = new Date(
            Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
          ).toISOString();

          return {
            id: `user_${index + 1}`,
            email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index}@gmail.com`,
            name: `${firstName} ${lastName}`,
            firstName,
            lastName,
            userType: userTypeSelected,
            profileCompletion: Math.floor(Math.random() * 40) + 60, // 60-99%
            avatar: `https://images.unsplash.com/photo-${1500000000000 + index}?w=150&h=150&fit=crop&crop=face`,
            location: locations[Math.floor(Math.random() * locations.length)],
            createdAt: joinDate,
            updatedAt: lastActiveAt,
            accountStatus:
              accountStatuses[
                Math.floor(Math.random() * accountStatuses.length)
              ],
            verificationStatus:
              verificationStatuses[
                Math.floor(Math.random() * verificationStatuses.length)
              ],
            verificationBadges: [
              'email',
              ...(Math.random() > 0.3 ? ['phone'] : []),
            ],
            joinDate,
            lastActiveAt,
            lastLoginAt: new Date(
              Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
            loginCount: Math.floor(Math.random() * 500) + 10,
            totalOrders: Math.floor(Math.random() * 50),
            totalEarnings:
              userTypeSelected === 'freelancer'
                ? Math.floor(Math.random() * 100000)
                : 0,
            totalSpent:
              userTypeSelected === 'employer'
                ? Math.floor(Math.random() * 50000)
                : 0,
            successRate: Math.floor(Math.random() * 40) + 60, // 60-100%
            disputeCount: Math.floor(Math.random() * 5),
            warningCount: Math.floor(Math.random() * 3),
            reputationScore: Math.floor(Math.random() * 40) + 60, // 60-100
            riskScore: Math.floor(Math.random() * 50), // 0-50
            suspensionHistory: [],
            statistics: {
              actionsPerformed: Math.floor(Math.random() * 200) + 50,
              usersModerated: Math.floor(Math.random() * 20),
              ticketsResolved: Math.floor(Math.random() * 15),
            },
          };
        });
      };

      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      let allUsers = generateMockUsers(150);

      // Apply filters
      if (search) {
        const searchTerm = search.toLowerCase();
        allUsers = allUsers.filter(
          (user) =>
            user.firstName.toLowerCase().includes(searchTerm) ||
            user.lastName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
      }

      if (userType && userType !== 'all') {
        allUsers = allUsers.filter((user) => user.userType === userType);
      }

      if (accountStatus && accountStatus !== 'all') {
        allUsers = allUsers.filter(
          (user) => user.accountStatus === accountStatus
        );
      }

      if (verificationStatus && verificationStatus !== 'all') {
        allUsers = allUsers.filter(
          (user) => user.verificationStatus === verificationStatus
        );
      }

      // Apply sorting
      allUsers.sort((a, b) => {
        let aValue: string | number, bValue: string | number;

        switch (sortBy) {
          case 'name':
            aValue = `${a.firstName} ${a.lastName}`.toLowerCase();
            bValue = `${b.firstName} ${b.lastName}`.toLowerCase();
            break;
          case 'email':
            aValue = a.email.toLowerCase();
            bValue = b.email.toLowerCase();
            break;
          case 'joinDate':
            aValue = new Date(a.joinDate).getTime();
            bValue = new Date(b.joinDate).getTime();
            break;
          case 'lastActiveAt':
            aValue = new Date(a.lastActiveAt).getTime();
            bValue = new Date(b.lastActiveAt).getTime();
            break;
          default:
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
        }

        if (sortOrder === 'asc') {
          return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
        } else {
          return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
        }
      });

      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedUsers = allUsers.slice(startIndex, endIndex);

      const response = {
        success: true,
        data: paginatedUsers,
        pagination: {
          page,
          limit,
          total: allUsers.length,
          totalPages: Math.ceil(allUsers.length / limit),
        },
        message: 'Users retrieved successfully',
      };

      console.log('✅ MSW: Users list response ready', {
        total: allUsers.length,
        pageSize: paginatedUsers.length,
      });

      return HttpResponse.json(response);
    } catch (error) {
      console.error('💥 MSW: Users list error:', error);
      return HttpResponse.json(
        {
          success: false,
          error: 'Server error',
        },
        { status: 500 }
      );
    }
  }),

  // Get single user details
  http.get('/api/v1/admin/users/:id', async ({ params, request }) => {
    console.log(
      '👤 MSW: Single user details request intercepted for ID:',
      params.id
    );

    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Unauthorized',
          },
          { status: 401 }
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      // Generate mock user data for the specific ID
      const mockUser = {
        id: params.id,
        email: `user.${params.id}@example.com`,
        name: 'Demo User',
        firstName: 'Demo',
        lastName: 'User',
        userType: 'freelancer' as const,
        profileCompletion: 85,
        avatar:
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        location: 'İstanbul, Türkiye',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        accountStatus: 'active' as const,
        verificationStatus: 'verified' as const,
        verificationBadges: ['email', 'phone'],
        joinDate: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        loginCount: 145,
        totalOrders: 23,
        totalEarnings: 45000,
        totalSpent: 0,
        successRate: 92,
        disputeCount: 1,
        warningCount: 0,
        reputationScore: 88,
        riskScore: 15,
        suspensionHistory: [],
        statistics: {
          actionsPerformed: 156,
          usersModerated: 0,
          ticketsResolved: 0,
        },
      };

      return HttpResponse.json({
        success: true,
        data: mockUser,
        message: 'User details retrieved successfully',
      });
    } catch (error) {
      console.error('💥 MSW: Single user error:', error);
      return HttpResponse.json(
        {
          success: false,
          error: 'Server error',
        },
        { status: 500 }
      );
    }
  }),

  // Update user
  http.put('/api/v1/admin/users/:id', async ({ params, request }) => {
    console.log('✏️ MSW: Update user request for ID:', params.id);

    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Unauthorized',
          },
          { status: 401 }
        );
      }

      const updates = (await request.json()) as Record<string, unknown>;
      await new Promise((resolve) => setTimeout(resolve, 800));

      console.log('📝 MSW: User update data:', updates);

      return HttpResponse.json({
        success: true,
        data: {
          id: params.id,
          ...updates,
          updatedAt: new Date().toISOString(),
        },
        message: 'User updated successfully',
      });
    } catch (error) {
      console.error('💥 MSW: Update user error:', error);
      return HttpResponse.json(
        {
          success: false,
          error: 'Server error',
        },
        { status: 500 }
      );
    }
  }),

  // User statistics
  http.get('/api/v1/admin/users/stats', async ({ request }) => {
    console.log('📊 MSW: User statistics request intercepted');

    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Unauthorized',
          },
          { status: 401 }
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 400));

      const stats = {
        totalUsers: 1247,
        activeUsers: 892,
        suspendedUsers: 23,
        bannedUsers: 12,
        pendingVerification: 45,
        verifiedUsers: 1156,
        freelancers: 742,
        employers: 505,
        highRiskUsers: 18,
        newUsersThisMonth: 67,
        activeUsersThisWeek: 234,
        userGrowthRate: '5.4',
        verificationRate: '92.7',
      };

      return HttpResponse.json({
        success: true,
        data: stats,
        message: 'User statistics retrieved successfully',
      });
    } catch (error) {
      console.error('💥 MSW: User stats error:', error);
      return HttpResponse.json(
        {
          success: false,
          error: 'Server error',
        },
        { status: 500 }
      );
    }
  }),

  // User action endpoint
  http.post('/api/v1/admin/users/:id/action', async ({ params, request }) => {
    console.log('🔧 MSW: User action request for ID:', params.id);

    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Unauthorized',
          },
          { status: 401 }
        );
      }

      const actionData = (await request.json()) as Record<string, unknown>;
      await new Promise((resolve) => setTimeout(resolve, 800));

      console.log('🔧 MSW: User action data:', actionData);

      return HttpResponse.json({
        success: true,
        data: {
          user: {
            id: params.id,
            ...actionData,
            updatedAt: new Date().toISOString(),
          },
        },
        message: 'User action completed successfully',
      });
    } catch (error) {
      console.error('💥 MSW: User action error:', error);
      return HttpResponse.json(
        {
          success: false,
          error: 'Server error',
        },
        { status: 500 }
      );
    }
  }),

  // Bulk action endpoint
  http.post('/api/v1/admin/users/bulk-action', async ({ request }) => {
    console.log('🔨 MSW: Bulk action request intercepted');

    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Unauthorized',
          },
          { status: 401 }
        );
      }

      const bulkActionData = (await request.json()) as Record<string, unknown>;
      await new Promise((resolve) => setTimeout(resolve, 1200));

      console.log('🔨 MSW: Bulk action data:', bulkActionData);

      return HttpResponse.json({
        success: true,
        data: {
          affectedCount: Array.isArray(bulkActionData.userIds)
            ? bulkActionData.userIds.length
            : 0,
          action: bulkActionData.action,
        },
        message: 'Bulk action completed successfully',
      });
    } catch (error) {
      console.error('💥 MSW: Bulk action error:', error);
      return HttpResponse.json(
        {
          success: false,
          error: 'Server error',
        },
        { status: 500 }
      );
    }
  }),

  // Admin Analytics Endpoints
  http.get('/api/v1/admin/analytics/users', async ({ request }) => {
    console.log('📊 MSW: Admin user analytics request intercepted');

    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Unauthorized',
          },
          { status: 401 }
        );
      }

      const url = new URL(request.url);
      const period = url.searchParams.get('period') || '30d';

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Generate mock user analytics data
      const generateUserStats = (days: number) => {
        const now = new Date();
        const stats = [];

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          stats.push({
            date: date.toISOString().split('T')[0],
            newUsers: Math.floor(Math.random() * 50) + 10,
            activeUsers: Math.floor(Math.random() * 200) + 50,
            verifiedUsers: Math.floor(Math.random() * 30) + 5,
            deletedUsers: Math.floor(Math.random() * 5),
          });
        }
        return stats;
      };

      const periodDays =
        period === '7d'
          ? 7
          : period === '30d'
            ? 30
            : period === '90d'
              ? 90
              : 30;
      const dailyStats = generateUserStats(periodDays);

      const totalUsers =
        mockUsers.length + Math.floor(Math.random() * 1000) + 500;
      const activeUsers = Math.floor(totalUsers * 0.7);
      const verifiedUsers = Math.floor(totalUsers * 0.8);
      const newUsersThisPeriod = dailyStats.reduce(
        (sum, day) => sum + day.newUsers,
        0
      );

      const analytics = {
        totalUsers,
        newUsers: newUsersThisPeriod,
        activeUsers,
        churnRate: (Math.random() * 10 + 2).toFixed(1),
        growthRate: ((newUsersThisPeriod / totalUsers) * 100).toFixed(1),
        usersByType: {
          freelancer: Math.floor(totalUsers * 0.6),
          employer: Math.floor(totalUsers * 0.35),
        },
        usersByStatus: {
          active: activeUsers,
          suspended: Math.floor(totalUsers * 0.02),
          banned: Math.floor(totalUsers * 0.01),
          pending: Math.floor(totalUsers * 0.05),
        },
        demographics: {
          freelancers: Math.floor(totalUsers * 0.6),
          employers: Math.floor(totalUsers * 0.35),
          admins: Math.floor(totalUsers * 0.05),
        },
        activity: {
          dailyActiveUsers: Math.floor(activeUsers * 0.3),
          weeklyActiveUsers: Math.floor(activeUsers * 0.6),
          monthlyActiveUsers: activeUsers,
        },
        registration: {
          dailyStats,
          conversionRate: (Math.random() * 30 + 60).toFixed(1) + '%',
        },
        verification: {
          pendingVerifications: Math.floor(Math.random() * 50) + 10,
          verificationRate:
            ((verifiedUsers / totalUsers) * 100).toFixed(1) + '%',
        },
      };

      console.log('📊 MSW User Analytics Response:', {
        success: true,
        hasUsersByType: !!analytics.usersByType,
        hasUsersByStatus: !!analytics.usersByStatus,
        usersByType: analytics.usersByType,
        usersByStatus: analytics.usersByStatus,
      });

      return HttpResponse.json({
        success: true,
        data: analytics,
        period,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('💥 MSW: User analytics error:', error);
      return HttpResponse.json(
        {
          success: false,
          error: 'Server error',
        },
        { status: 500 }
      );
    }
  }),

  http.get('/api/v1/admin/analytics/revenue', async ({ request }) => {
    console.log('💰 MSW: Admin revenue analytics request intercepted');

    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Unauthorized',
          },
          { status: 401 }
        );
      }

      const url = new URL(request.url);
      const period = url.searchParams.get('period') || '30d';

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Generate mock revenue analytics data
      const generateRevenueStats = (days: number) => {
        const now = new Date();
        const stats = [];

        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
          stats.push({
            date: date.toISOString().split('T')[0],
            revenue: Math.floor(Math.random() * 5000) + 1000,
            transactions: Math.floor(Math.random() * 50) + 10,
            commissions: Math.floor(Math.random() * 800) + 200,
            refunds: Math.floor(Math.random() * 300),
          });
        }
        return stats;
      };

      const periodDays =
        period === '7d'
          ? 7
          : period === '30d'
            ? 30
            : period === '90d'
              ? 90
              : 30;
      const dailyStats = generateRevenueStats(periodDays);

      const totalRevenue = dailyStats.reduce(
        (sum, day) => sum + day.revenue,
        0
      );
      const totalTransactions = dailyStats.reduce(
        (sum, day) => sum + day.transactions,
        0
      );
      const totalCommissions = dailyStats.reduce(
        (sum, day) => sum + day.commissions,
        0
      );
      const totalRefunds = dailyStats.reduce(
        (sum, day) => sum + day.refunds,
        0
      );

      const analytics = {
        totalRevenue,
        monthlyRevenue: Math.floor(totalRevenue * (30 / periodDays)),
        growth: ((Math.random() - 0.5) * 20).toFixed(1),
        averageOrderValue: Math.floor(totalRevenue / totalTransactions),
        topCategories: [
          {
            category: 'Web Development',
            revenue: Math.floor(totalRevenue * 0.3),
            percentage: 30,
          },
          {
            category: 'Graphic Design',
            revenue: Math.floor(totalRevenue * 0.25),
            percentage: 25,
          },
          {
            category: 'Content Writing',
            revenue: Math.floor(totalRevenue * 0.2),
            percentage: 20,
          },
          {
            category: 'Digital Marketing',
            revenue: Math.floor(totalRevenue * 0.15),
            percentage: 15,
          },
          {
            category: 'Other',
            revenue: Math.floor(totalRevenue * 0.1),
            percentage: 10,
          },
        ],
        overview: {
          totalRevenue,
          totalTransactions,
          totalCommissions,
          totalRefunds,
          averageTransactionValue: Math.floor(totalRevenue / totalTransactions),
          commissionRate:
            ((totalCommissions / totalRevenue) * 100).toFixed(1) + '%',
        },
        breakdown: {
          serviceCommissions: Math.floor(totalCommissions * 0.7),
          subscriptionFees: Math.floor(totalCommissions * 0.2),
          processingFees: Math.floor(totalCommissions * 0.1),
        },
        trends: {
          dailyStats,
          growthRate: ((Math.random() - 0.5) * 20).toFixed(1) + '%',
          projectedMonthly: Math.floor(totalRevenue * (30 / periodDays)),
        },
        payouts: {
          pendingPayouts: Math.floor(Math.random() * 50000) + 10000,
          completedPayouts: Math.floor(Math.random() * 200000) + 50000,
          processingTime: Math.floor(Math.random() * 3) + 1 + ' days',
        },
      };

      console.log('💰 MSW Revenue Analytics Response:', {
        success: true,
        hasTopCategories: !!analytics.topCategories,
        topCategoriesLength: analytics.topCategories?.length,
        hasOverview: !!analytics.overview,
      });

      return HttpResponse.json({
        success: true,
        data: analytics,
        period,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('💥 MSW: Revenue analytics error:', error);
      return HttpResponse.json(
        {
          success: false,
          error: 'Server error',
        },
        { status: 500 }
      );
    }
  }),

  // Admin Moderation Endpoints
  http.get('/api/v1/admin/moderation/queue', async ({ request }) => {
    console.log('🛡️ MSW: Admin moderation queue request intercepted');

    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Unauthorized',
          },
          { status: 401 }
        );
      }

      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const status = url.searchParams.getAll('status[]');
      const priority = url.searchParams.getAll('priority[]');
      const type = url.searchParams.getAll('type[]');
      const search = url.searchParams.get('search') || '';

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Generate mock moderation queue data
      const generateModerationItem = (id: number) => ({
        id: `mod-${id}`,
        contentId: `content-${id}`,
        type: ['job_post', 'service_package', 'profile', 'review', 'message'][
          Math.floor(Math.random() * 5)
        ],
        content: {
          title: [
            'Şüpheli İş İlanı Raporu',
            'Uygunsuz Profil İçeriği',
            'Spam Mesaj Şikayeti',
            'Yanlış Bilgi Raporu',
            'Hakaret İçeren Yorum',
          ][Math.floor(Math.random() * 5)],
          description:
            'Bu içerik topluluk kurallarına aykırı olarak raporlandı ve daha detaylı inceleme gerektiriyor. İçerik topluluk standartlarına uygun olmayabilir.',
        },
        reportedBy: `user-${Math.floor(Math.random() * 1000)}`,
        reporterInfo: {
          id: `user-${Math.floor(Math.random() * 1000)}`,
          firstName: ['Ahmet', 'Fatma', 'Mehmet', 'Ayşe'][
            Math.floor(Math.random() * 4)
          ],
          lastName: ['Yılmaz', 'Demir', 'Öz', 'Kara'][
            Math.floor(Math.random() * 4)
          ],
          userType: ['freelancer', 'employer'][
            Math.floor(Math.random() * 2)
          ] as 'freelancer' | 'employer',
        },
        reason: [
          'spam_content',
          'inappropriate_language',
          'fake_profile',
          'fraudulent_activity',
          'copyright_violation',
        ][Math.floor(Math.random() * 5)],
        status: ['pending', 'approved', 'rejected', 'escalated'][
          Math.floor(Math.random() * 4)
        ],
        priority: ['low', 'medium', 'high', 'critical'][
          Math.floor(Math.random() * 4)
        ],
        category: ['spam', 'inappropriate', 'harassment', 'fraud', 'other'][
          Math.floor(Math.random() * 5)
        ],
        reportReason: [
          'Spam içerik',
          'Uygunsuz dil',
          'Sahte profil',
          'Dolandırıcılık',
          'Telif hakkı ihlali',
        ][Math.floor(Math.random() * 5)],
        severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        assignedModerator:
          Math.random() > 0.5
            ? {
                id: `mod-${Math.floor(Math.random() * 10)}`,
                name: ['Moderatör Ali', 'Moderatör Veli', 'Moderatör Ayşe'][
                  Math.floor(Math.random() * 3)
                ],
              }
            : null,
        automaticFlags: null,
        automatedFlags: [
          {
            id: `flag-${id}`,
            type: 'keyword_filter',
            severity: ['low', 'medium', 'high'][
              Math.floor(Math.random() * 3)
            ] as 'low' | 'medium' | 'high',
            confidence: Math.random() * 100,
            details: 'Şüpheli kelimeler tespit edildi',
            flaggedAt: new Date(
              Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        ],
        reviewHistory: [],
        moderatorNotes:
          Math.random() > 0.7
            ? 'Bu içerik daha detaylı inceleme gerektiriyor'
            : undefined,
        createdAt: new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: new Date(
          Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        resolvedAt:
          Math.random() > 0.6
            ? new Date(
                Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000
              ).toISOString()
            : undefined,
      });

      // Generate items
      const allItems = Array.from({ length: 150 }, (_, i) =>
        generateModerationItem(i + 1)
      );

      // Apply filters
      let filteredItems = allItems;

      if (status.length > 0) {
        filteredItems = filteredItems.filter((item) =>
          status.includes(item.status)
        );
      }

      if (priority.length > 0) {
        filteredItems = filteredItems.filter((item) =>
          priority.includes(item.priority)
        );
      }

      if (type.length > 0) {
        filteredItems = filteredItems.filter((item) =>
          type.includes(item.type)
        );
      }

      if (search) {
        filteredItems = filteredItems.filter(
          (item) =>
            item.content.title.toLowerCase().includes(search.toLowerCase()) ||
            item.content.description
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            `${item.reporterInfo.firstName} ${item.reporterInfo.lastName}`
              .toLowerCase()
              .includes(search.toLowerCase())
        );
      }

      // Pagination
      const total = filteredItems.length;
      const totalPages = Math.ceil(total / limit);
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = filteredItems.slice(startIndex, endIndex);

      console.log('🛡️ MSW: Moderation queue response prepared:', {
        total,
        page,
        totalPages,
        itemsCount: paginatedItems.length,
      });

      return HttpResponse.json({
        success: true,
        data: {
          items: paginatedItems,
          pagination: {
            page,
            limit,
            total,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
          },
        },
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('💥 MSW: Moderation queue error:', error);
      return HttpResponse.json(
        {
          success: false,
          error: 'Server error',
        },
        { status: 500 }
      );
    }
  }),

  http.get('/api/v1/admin/moderation/stats', async ({ request }) => {
    console.log('📊 MSW: Admin moderation stats request intercepted');

    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Unauthorized',
          },
          { status: 401 }
        );
      }

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 600));

      const stats = {
        totalItems: 1247,
        pendingItems: 89,
        approvedItems: 856,
        rejectedItems: 234,
        escalatedItems: 68,
        averageReviewTime: 4.2, // hours
        automatedFlagAccuracy: 87.5, // percentage
        topModerationReasons: [
          { reason: 'Spam içerik', count: 156 },
          { reason: 'Uygunsuz dil', count: 134 },
          { reason: 'Sahte profil', count: 98 },
          { reason: 'Dolandırıcılık', count: 76 },
          { reason: 'Telif hakkı ihlali', count: 45 },
        ],
        moderatorWorkload: {
          totalModerators: 8,
          activeModerators: 6,
          averageItemsPerModerator: 15,
        },
        responseTime: {
          average: 2.3, // hours
          p95: 8.1, // hours
          p99: 24.5, // hours
        },
        contentBreakdown: {
          jobPosts: 425,
          servicePackages: 289,
          profiles: 234,
          reviews: 178,
          messages: 121,
        },
        priorityDistribution: {
          critical: 12,
          high: 45,
          medium: 234,
          low: 956,
        },
      };

      console.log('📊 MSW: Moderation stats response prepared:', stats);

      return HttpResponse.json({
        success: true,
        data: stats,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('💥 MSW: Moderation stats error:', error);
      return HttpResponse.json(
        {
          success: false,
          error: 'Server error',
        },
        { status: 500 }
      );
    }
  }),

  // Admin Platform Settings Endpoints
  http.get('/api/v1/admin/settings', async ({ request }) => {
    console.log('⚙️ MSW: Admin platform settings request intercepted');

    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Unauthorized',
          },
          { status: 401 }
        );
      }

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Mock platform settings data matching PlatformSettings interface
      const platformSettings = {
        general: {
          siteName: 'Marifet Platform',
          siteDescription:
            "Türkiye'nin en büyük freelancer ve hizmet platformu",
          contactEmail: 'contact@marifetbul.com',
          supportEmail: 'support@marifetbul.com',
          logoUrl: '/images/logo.png',
          faviconUrl: '/images/favicon.ico',
          defaultLanguage: 'tr',
          defaultTimezone: 'Europe/Istanbul',
          allowUserRegistration: true,
          requireEmailVerification: true,
          maintenanceMode: false,
          maintenanceMessage:
            'Platform geçici olarak bakımda. Lütfen daha sonra tekrar deneyin.',
          maxFileUploadSize: 10, // MB
          allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
          socialMediaLinks: {
            facebook: 'https://facebook.com/marifetbul',
            twitter: 'https://twitter.com/marifetbul',
            instagram: 'https://instagram.com/marifetbul',
            linkedin: 'https://linkedin.com/company/marifetbul',
            youtube: 'https://youtube.com/c/marifetbul',
          },
          analytics: {
            googleAnalyticsId: 'GA-XXXXXXX-X',
            googleTagManagerId: 'GTM-XXXXXXX',
            facebookPixelId: '1234567890',
            enableAnalytics: true,
          },
        },
        payment: {
          platformFee: 5.0, // percentage
          minimumWithdrawal: 100, // TRY
          processingFee: 2.5, // percentage
          currencies: ['TRY', 'USD', 'EUR'],
          defaultCurrency: 'TRY',
          enabledPaymentMethods: ['credit_card', 'bank_transfer', 'paypal'],
          escrowEnabled: true,
          autoReleaseEscrow: true,
          escrowReleaseDelay: 72, // hours
          refundPolicy: 'partial', // full, partial, none
          taxRate: 18, // percentage for Turkey
          invoicePrefix: 'MRF',
        },
        security: {
          twoFactorAuth: false,
          enforceStrongPasswords: true,
          passwordRequirements: {
            minLength: 8,
            requireNumbers: true,
            requireSymbols: true,
            requireUppercase: true,
            requireLowercase: true,
          },
          sessionTimeout: 24, // hours
          maxLoginAttempts: 5,
          lockoutDuration: 30, // minutes
          enableCaptcha: true,
          enableEmailVerification: true,
          enablePhoneVerification: false,
          allowedCountries: [], // empty means all countries allowed
          blockedCountries: [],
          ipWhitelist: [],
          ipBlacklist: [],
        },
        email: {
          provider: 'smtp',
          fromName: 'Marifet Platform',
          fromEmail: 'noreply@marifetbul.com',
          replyToEmail: 'support@marifetbul.com',
          enableEmailNotifications: true,
          enableWelcomeEmail: true,
          enableOrderConfirmations: true,
          enablePaymentNotifications: true,
          smtpSettings: {
            host: 'smtp.gmail.com',
            port: 587,
            username: 'noreply@marifetbul.com',
            encryption: 'tls',
          },
          templates: {
            welcome: 'welcome-template',
            orderConfirmation: 'order-confirmation-template',
            paymentReceived: 'payment-received-template',
            passwordReset: 'password-reset-template',
          },
        },
        features: {
          enableJobPosting: true,
          enableServicePackages: true,
          enableEscrow: true,
          enableDirectPayments: true,
          enableReviews: true,
          enableMessaging: true,
          enableVideoCall: false,
          enableFileSharing: true,
          enablePortfolio: true,
          enableSkillTests: false,
          enableCertifications: false,
          enableSubscriptions: false,
          enableMemberships: false,
          enableReferrals: true,
          enableAffiliateProgram: false,
          enableAPI: true,
          enableWebhooks: false,
          enableMobileApp: true,
          enablePWA: true,
          enableNotifications: true,
          enableSocialLogin: true,
          enableGuestCheckout: false,
          enableMultiLanguage: false,
          enableGeoLocation: true,
          enableAdvancedSearch: true,
          enableCategories: true,
          enableTags: true,
          emailVerificationRequired: true,
          phoneVerificationRequired: false,
          userRegistration: true,
          profileVerification: true,
          mobileApp: true,
          apiAccess: true,
          affiliateProgram: false,
          loyaltyProgram: false,
          multiLanguage: false,
          notificationSystem: true,
          searchEngine: true,
          analyticsTracking: true,
        },
        content: {
          moderationEnabled: true,
          autoModeration: true,
          requireContentApproval: false,
          allowUserGeneratedContent: true,
          allowComments: true,
          allowRatings: true,
          allowPortfolioUploads: true,
          maxImageSize: 5, // MB
          maxVideoSize: 50, // MB
          maxPortfolioItems: 10,
          contentFilters: ['spam', 'profanity', 'inappropriate'],
          bannedWords: ['spam', 'scam', 'fraud'],
          autoDeleteSpam: false,
          flagThreshold: 3, // number of reports before auto-flagging
          userGeneratedContent: true,
          allowUserProfiles: true,
          allowPortfolio: true,
          allowCustomCategories: false,
          contentFiltering: true,
          spamDetection: true,
          duplicateDetection: true,
          imageModeration: true,
          textAnalysis: true,
        },
        api: {
          enablePublicApi: true,
          enableWebhooks: false,
          apiVersioning: true,
          apiDocumentation: true,
          rateLimiting: {
            requestsPerMinute: 60,
            requestsPerHour: 1000,
            requestsPerDay: 10000,
            burst: 10,
          },
          allowedOrigins: [
            'https://marifetbul.com',
            'https://app.marifetbul.com',
          ],
          apiKeys: [],
          webhookUrls: [],
          enableCors: true,
          enableCompression: true,
          enableCaching: true,
          cacheTimeout: 300, // seconds
        },
        maintenance: {
          isMaintenanceMode: false,
          maintenanceMessage:
            'Platform geçici olarak bakımda. Lütfen daha sonra tekrar deneyin.',
          scheduledMaintenance: [],
          allowedIps: ['127.0.0.1'],
          allowedRoles: ['admin'],
          estimatedDowntime: 0, // minutes
          showCountdown: false,
          countdownEndTime: null,
          notifyUsers: true,
          redirectUrl: '/maintenance',
        },
        integrations: {
          payment: {
            stripe: {
              enabled: false,
              publishableKey: '',
              webhookSecret: '',
            },
            paypal: {
              enabled: false,
              clientId: '',
              clientSecret: '',
            },
            iyzico: {
              enabled: true,
              apiKey: '',
              secretKey: '',
              baseUrl: 'https://sandbox-api.iyzipay.com',
            },
          },
          communication: {
            twilio: {
              enabled: false,
              accountSid: '',
              authToken: '',
              fromPhoneNumber: '',
            },
            sendgrid: {
              enabled: false,
              apiKey: '',
              fromEmail: '',
            },
          },
          analytics: {
            googleAnalytics: {
              enabled: true,
              trackingId: 'GA-XXXXXXX-X',
            },
            mixpanel: {
              enabled: false,
              projectToken: '',
            },
            hotjar: {
              enabled: false,
              siteId: '',
            },
          },
          storage: {
            aws: {
              enabled: false,
              accessKeyId: '',
              secretAccessKey: '',
              region: 'eu-west-1',
              bucket: '',
            },
            cloudinary: {
              enabled: true,
              cloudName: '',
              apiKey: '',
              apiSecret: '',
            },
          },
        },
      };

      console.log('⚙️ MSW: Platform settings response prepared');

      return HttpResponse.json({
        success: true,
        data: platformSettings,
        generatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('💥 MSW: Platform settings error:', error);
      return HttpResponse.json(
        {
          success: false,
          error: 'Server error',
        },
        { status: 500 }
      );
    }
  }),

  http.put('/api/v1/admin/settings', async ({ request }) => {
    console.log('⚙️ MSW: Update platform settings request intercepted');

    try {
      const authHeader = request.headers.get('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Unauthorized',
          },
          { status: 401 }
        );
      }

      const settingsUpdate = (await request.json()) as Record<string, unknown>;

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      console.log('⚙️ MSW: Settings update data:', settingsUpdate);

      // For demo purposes, just return the updated settings
      // In a real implementation, you would merge the updates with existing settings
      return HttpResponse.json({
        success: true,
        data: {
          ...settingsUpdate,
          updatedAt: new Date().toISOString(),
        },
        message: 'Platform ayarları başarıyla güncellendi',
      });
    } catch (error) {
      console.error('💥 MSW: Update platform settings error:', error);
      return HttpResponse.json(
        {
          success: false,
          error: 'Server error',
        },
        { status: 500 }
      );
    }
  }),
];
