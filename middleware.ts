import { NextResponse, type NextRequest } from 'next/server';

// Define protected routes
const protectedRoutes = [
  '/dashboard',
  '/profile',
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
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from the cookies (localStorage is not accessible in middleware)
  // Note: We'll need to sync localStorage auth with cookies in the auth store
  const token = request.cookies.get('marifeto-auth-token')?.value;

  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if the current route is an admin route
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  // Check if the current route is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  // If accessing admin routes, allow for development (TODO: Add role-based auth)
  if (isAdminRoute) {
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
