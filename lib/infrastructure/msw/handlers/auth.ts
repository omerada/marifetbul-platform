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
];
