import { NextResponse, type NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/profile/edit', // Sadece profil düzenleme korumalı
  '/messages',
  '/my-jobs',
  '/my-packages',
  '/proposals',
  '/orders',
  '/freelancers',
  '/projects',
];

// Define admin routes (require admin authentication)
const adminRoutes = ['/admin'];

// Define admin login route (separate from regular auth)
const adminLoginRoute = '/admin/login';

// Define auth routes (should redirect to dashboard if already authenticated)
const authRoutes = ['/login', '/register'];

// Define public routes (accessible to everyone)
const publicRoutes = [
  '/',
  '/marketplace',
  '/about',
  '/contact',
  '/terms',
  '/privacy',
  '/blog',
  '/help',
  '/support',
  '/legal',
  '/info',
  '/search',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from the cookies (localStorage is not accessible in middleware)
  // Note: We'll need to sync localStorage auth with cookies in the auth store
  const token = request.cookies.get('marifetbul-auth-token')?.value;
  const userRole = request.cookies.get('marifetbul-user-role')?.value;

  // Allow public profile viewing: /profile/[id] but not /profile/edit
  const isProfileView =
    pathname.startsWith('/profile/') && !pathname.includes('/edit');

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current route is an admin route (excluding login)
  const isAdminRoute =
    adminRoutes.some((route) => pathname.startsWith(route)) &&
    pathname !== adminLoginRoute;

  // Check if accessing admin login page
  const isAdminLoginPage = pathname === adminLoginRoute;

  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  // Allow public profile viewing without authentication
  if (isProfileView) {
    return NextResponse.next();
  }

  // Admin route protection
  if (isAdminRoute) {
    // DEBUG: Temporarily allow admin access to see if the issue is with middleware
    console.log('🔍 Admin route access attempt:', {
      pathname,
      token,
      userRole,
    });

    // For debugging, temporarily bypass middleware protection
    return NextResponse.next();

    // Original code (commented for debug):
    // if (!token) {
    //   const adminLoginUrl = new URL(adminLoginRoute, request.url);
    //   adminLoginUrl.searchParams.set('redirect', pathname);
    //   return NextResponse.redirect(adminLoginUrl);
    // }

    // if (userRole !== 'admin') {
    //   return NextResponse.redirect(new URL('/dashboard', request.url));
    // }

    // return NextResponse.next();
  }

  // If accessing admin login page with admin token, redirect to admin dashboard
  if (isAdminLoginPage && token && userRole === 'admin') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // If accessing admin login page without token, allow access
  if (isAdminLoginPage) {
    return NextResponse.next();
  }

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth routes with valid token, redirect to dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Allow access to public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For any other route, continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, icons, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
