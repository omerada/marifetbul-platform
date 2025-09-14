import { http, HttpResponse } from 'msw';
import type { User } from '@/types';

// Mock Users Database
const mockUsers: User[] = [
  {
    id: 'admin-001',
    email: 'admin@marifeto.com',
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
  { email: 'admin@marifeto.com', password: 'admin123' },
  { email: 'demo@example.com', password: 'demo123' },
  { email: 'employer@example.com', password: 'employer123' },
];

export const authHandlers = [
  // Login endpoint
  http.post('/api/auth/login', async ({ request }) => {
    try {
      const body = (await request.json()) as {
        email: string;
        password: string;
        rememberMe?: boolean;
      };
      const { email, password } = body;

      // Find matching credentials
      const credential = mockCredentials.find(
        (cred) => cred.email === email && cred.password === password
      );

      if (!credential) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Geçersiz e-posta veya şifre',
          },
          { status: 401 }
        );
      }

      // Find user
      const user = mockUsers.find((u) => u.email === email);
      if (!user) {
        return HttpResponse.json(
          {
            success: false,
            error: 'Kullanıcı bulunamadı',
          },
          { status: 404 }
        );
      }

      // Update last login
      user.lastLoginAt = new Date().toISOString();

      // Generate mock token
      const token = `mock-token-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      return HttpResponse.json({
        success: true,
        data: {
          user,
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
];
