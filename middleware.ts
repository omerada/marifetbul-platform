import { NextResponse, type NextRequest } from 'next/server';
import { logger } from './lib/shared/utils/logger';

// ============================================================================
// SECURITY HEADERS
// ============================================================================

/**
 * Add security headers to response
 */
function addSecurityHeaders(response: NextResponse): NextResponse {
  const headers = response.headers;

  // Content Security Policy (CSP)
  // Allows inline scripts/styles for development, stricter in production
  const isDev = process.env.NODE_ENV === 'development';

  if (!isDev) {
    // Production CSP - strict policy
    headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https: blob:",
        "font-src 'self' https://fonts.gstatic.com data:",
        "connect-src 'self' https://www.google-analytics.com https://analytics.google.com",
        "media-src 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        'upgrade-insecure-requests',
      ].join('; ')
    );
  }

  // HTTP Strict Transport Security (HSTS)
  // Force HTTPS for 1 year, including subdomains
  headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );

  // X-Frame-Options - prevent clickjacking
  headers.set('X-Frame-Options', 'DENY');

  // X-Content-Type-Options - prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff');

  // X-XSS-Protection - enable XSS filtering (legacy browsers)
  headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer-Policy - control referrer information
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions-Policy - control browser features
  headers.set(
    'Permissions-Policy',
    [
      'accelerometer=()',
      'camera=()',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'payment=()',
      'usb=()',
    ].join(', ')
  );

  // Remove X-Powered-By header (information disclosure)
  headers.delete('X-Powered-By');

  return response;
}

// ============================================================================
// ROUTE DEFINITIONS
// ============================================================================

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

  // Get the token from httpOnly cookies (set by backend)
  // Backend sets cookie name as "marifetbul_token" (httpOnly, secure)
  const token = request.cookies.get('marifetbul_token')?.value;

  // User role might be stored in a separate non-httpOnly cookie for middleware access
  // Or we can verify role via API call (but that adds latency)
  const userRole = request.cookies.get('marifetbul-user-role')?.value;

  // Debug: Log all requests in development
  if (process.env.NODE_ENV === 'development') {
    logger.debug('[Middleware] Request', {
      pathname,
      hasToken: !!token,
      userRole: userRole || 'none',
      allCookies: request.cookies
        .getAll()
        .map((c) => ({ name: c.name, hasValue: !!c.value })),
    });
  }

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
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Admin route protection
  if (isAdminRoute) {
    logger.debug('[Middleware] Admin route check', {
      pathname,
      hasToken: !!token,
      tokenValue: token ? 'exists' : 'missing',
      userRole,
      cookies: {
        marifetbul_token: token ? 'SET' : 'NOT SET',
        'marifetbul-user-role': userRole || 'NOT SET',
      },
    });

    if (!token) {
      logger.info('[Middleware] No token found, redirecting to admin login');
      const adminLoginUrl = new URL(adminLoginRoute, request.url);
      adminLoginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(adminLoginUrl);
    }

    if (userRole?.toUpperCase() !== 'ADMIN') {
      logger.info('[Middleware] User is not admin, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    logger.debug('[Middleware] Admin access granted');
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // If accessing admin login page with admin token, redirect to admin dashboard
  if (isAdminLoginPage && token && userRole?.toUpperCase() === 'ADMIN') {
    logger.info(
      '[Middleware] Admin already logged in, redirecting to admin panel'
    );
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // If accessing admin login page without token, allow access
  // Clear any role cookie to prevent redirect loops
  if (isAdminLoginPage) {
    const response = NextResponse.next();

    // If there's a role cookie but no token, clear it to prevent loops
    if (userRole && !token) {
      logger.info(
        '[Middleware] Clearing role cookie on login page (no token found)'
      );
      response.cookies.delete('marifetbul-user-role');
    }

    return addSecurityHeaders(response);
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
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // For any other route, continue
  const response = NextResponse.next();

  // Add security headers to all responses
  return addSecurityHeaders(response);
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
