import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/login
 * User authentication endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    console.log('🔐 Auth API: Login attempt for:', email);

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: 'E-posta ve şifre gereklidir',
        },
        { status: 400 }
      );
    }

    // Mock authentication - replace with real authentication logic
    const validCredentials = [
      {
        email: 'admin@marifetbul.com',
        password: 'admin123',
        user: {
          id: 'admin-1',
          email: 'admin@marifetbul.com',
          firstName: 'Admin',
          lastName: 'User',
          name: 'Admin User',
          role: 'admin',
          userType: 'admin',
          avatar: '',
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'admin-token-12345',
      },
      {
        email: 'demo@example.com',
        password: 'demo123',
        user: {
          id: 'freelancer-1',
          email: 'demo@example.com',
          firstName: 'Demo',
          lastName: 'Freelancer',
          name: 'Demo Freelancer',
          role: 'freelancer',
          userType: 'freelancer',
          avatar: '',
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'freelancer-token-12345',
      },
      {
        email: 'employer@example.com',
        password: 'employer123',
        user: {
          id: 'employer-1',
          email: 'employer@example.com',
          firstName: 'Demo',
          lastName: 'Employer',
          name: 'Demo Employer',
          role: 'employer',
          userType: 'employer',
          avatar: '',
          isVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        token: 'employer-token-12345',
      },
    ];

    const foundUser = validCredentials.find(
      (cred) => cred.email === email && cred.password === password
    );

    if (!foundUser) {
      console.log('❌ Auth API: Invalid credentials for:', email);
      return NextResponse.json(
        {
          success: false,
          error: 'Geçersiz e-posta veya şifre',
        },
        { status: 401 }
      );
    }

    console.log(
      '✅ Auth API: Login successful for:',
      email,
      'Role:',
      foundUser.user.role
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          user: foundUser.user,
          token: foundUser.token,
        },
        message: 'Giriş başarılı',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Auth API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
