import { NextResponse, type NextRequest } from 'next/server';
import logger from './lib/infrastructure/monitoring/logger';
import {
  isProtectedRoute,
  isAdminRoute,
  isModeratorRoute,
  isAdminLoginPage,
  isAuthRoute,
  isPublicRoute,
  isProfileViewRoute,
  getLoginRedirectUrl,
  AUTH_COOKIES,
} from './lib/infrastructure/security/auth-utils';

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
// ROUTE DEFINITIONS (Now imported from auth-utils)
// ============================================================================

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from httpOnly cookies
  const token = request.cookies.get(AUTH_COOKIES.token)?.value;
  const userRole = request.cookies.get(AUTH_COOKIES.role)?.value;

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    logger.debug('[Middleware] Request', {
      pathname,
      hasToken: !!token,
      userRole: userRole || 'none',
    });
  }

  // Allow public profile viewing: /profile/[id] but not /profile/edit
  if (isProfileViewRoute(pathname)) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // ✅ CRITICAL FIX: Check public routes FIRST before protected routes
  // This prevents "/" from being treated as protected
  if (isPublicRoute(pathname)) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Admin route protection
  if (isAdminRoute(pathname)) {
    if (!token) {
      logger.info('[Middleware] No token found, redirecting to admin login');
      const loginUrl = new URL(
        getLoginRedirectUrl(pathname, true),
        request.url
      );
      return NextResponse.redirect(loginUrl);
    }

    if (userRole?.toUpperCase() !== 'ADMIN') {
      logger.info('[Middleware] User is not admin, redirecting to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // SPRINT 2 IMPLEMENTATION: 2FA & Session Checks
    // Note: Full JWT decode implementation would require jose library
    // For now, we rely on backend validation and session cookies
    // Backend already validates 2FA status on protected routes

    // Future Enhancement: Decode JWT to check 2FA status
    // const decoded = await decodeJWT(token);
    // if (!decoded?.twoFactorEnabled) {
    //   logger.warn('[Middleware] Admin without 2FA attempting access');
    //   return NextResponse.redirect(
    //     new URL('/admin/settings/security?require2fa=true', request.url)
    //   );
    // }

    // Session timeout is handled by JWT expiration (30 min for admins)
    // Backend sets appropriate JWT expiry time for admin sessions
    // If JWT expires, user will be redirected to login automatically

    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Moderator route protection (Admin also allowed - super role)
  if (isModeratorRoute(pathname)) {
    if (!token) {
      logger.info('[Middleware] No token found, redirecting to login');
      const loginUrl = new URL(getLoginRedirectUrl(pathname), request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Allow both MODERATOR and ADMIN roles (admin is super role)
    const normalizedRole = userRole?.toUpperCase();
    if (normalizedRole !== 'MODERATOR' && normalizedRole !== 'ADMIN') {
      logger.info(
        '[Middleware] User is not moderator or admin, redirecting to dashboard',
        { userRole }
      );
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // If accessing admin login page with admin token, redirect to admin dashboard
  if (
    isAdminLoginPage(pathname) &&
    token &&
    userRole?.toUpperCase() === 'ADMIN'
  ) {
    logger.info(
      '[Middleware] Admin already logged in, redirecting to admin panel'
    );
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // If accessing admin login page without token, allow access
  if (isAdminLoginPage(pathname)) {
    const response = NextResponse.next();

    // Clear any role cookie if no token to prevent loops
    if (userRole && !token) {
      logger.info(
        '[Middleware] Clearing role cookie on login page (no token found)'
      );
      response.cookies.delete(AUTH_COOKIES.role);
    }

    return addSecurityHeaders(response);
  }

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute(pathname) && !token) {
    const loginUrl = new URL(getLoginRedirectUrl(pathname), request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing auth routes with valid token, redirect to dashboard
  if (isAuthRoute(pathname) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
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
