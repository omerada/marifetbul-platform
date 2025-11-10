/** @type {import('next').NextConfig} */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-require-imports */
const { withSentryConfig } = require('@sentry/nextjs');

// ================================================
// PRODUCTION SAFETY VALIDATION
// ================================================
// Validate production environment configuration during build
if (process.env.NODE_ENV === 'production') {
  console.log('🔒 Running production safety checks...');

  // Critical validations
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
  const debugEnabled = process.env.NEXT_PUBLIC_ENABLE_DEBUG;

  const errors = [];

  if (appEnv !== 'production') {
    errors.push(
      `NEXT_PUBLIC_APP_ENV must be 'production', got: ${appEnv || 'not set'}`
    );
  }

  if (debugEnabled === 'true') {
    errors.push(
      'Debug mode is ENABLED in production (NEXT_PUBLIC_ENABLE_DEBUG=true)'
    );
  }

  if (!apiUrl) {
    errors.push('API URL is not configured (NEXT_PUBLIC_API_URL is required)');
  } else if (apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
    errors.push(`API URL points to localhost: ${apiUrl}`);
  } else if (!apiUrl.startsWith('https://')) {
    errors.push(`API URL must use HTTPS in production: ${apiUrl}`);
  }

  if (errors.length > 0) {
    console.error('\n❌❌❌ PRODUCTION BUILD FAILED ❌❌❌\n');
    errors.forEach((err) => console.error(`  ❌ ${err}`));
    console.error(
      '\nFix configuration errors before deploying to production.\n'
    );
    process.exit(1);
  }

  console.log('✅ Production safety checks passed\n');
}

const nextConfig = {
  // ================================================
  // PRODUCTION OPTIMIZATIONS
  // ================================================
  poweredByHeader: false,
  generateEtags: false,
  compress: true,

  // ================================================
  // IMAGE OPTIMIZATION
  // ================================================
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'marifetbul.com',
      },
      {
        protocol: 'https',
        hostname: '*.marifetbul.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Cloudinary image hosting
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: false,
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // ================================================
  // PERFORMANCE OPTIMIZATIONS
  // ================================================
  reactStrictMode: true,
  // swcMinify is now default in Next.js 15 and deprecated
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },

  // ================================================
  // REDIRECTS FOR VERCEL DEPLOYMENT
  // ================================================
  async redirects() {
    return [
      // Wallet redirects - cleanup duplicate routes (Sprint 1 - Day 1)
      {
        source: '/wallet',
        destination: '/dashboard/wallet',
        permanent: true,
      },
      {
        source: '/admin/wallet/:path*',
        destination: '/admin/wallets/:path*',
        permanent: true,
      },
      // Deprecated dashboard routes - redirect to unified dashboard
      {
        source: '/dashboard/employer',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/dashboard/freelancer',
        destination: '/dashboard',
        permanent: true,
      },
      {
        source: '/dashboard/employer/orders',
        destination: '/dashboard/orders',
        permanent: true,
      },
      {
        source: '/dashboard/freelancer/orders',
        destination: '/dashboard/orders',
        permanent: true,
      },
      {
        source: '/dashboard/employer/orders/:id',
        destination: '/dashboard/orders/:id',
        permanent: true,
      },
      {
        source: '/dashboard/freelancer/orders/:id',
        destination: '/dashboard/orders/:id',
        permanent: true,
      },
      // Job Proposals Route Consolidation - Sprint: Dashboard Route Consolidation (Nov 9, 2025)
      // Redirect old employer-specific proposals route to canonical my-jobs route
      {
        source: '/dashboard/employer/jobs/:jobId/proposals',
        destination: '/dashboard/my-jobs/:jobId/proposals',
        permanent: true,
      },
      // Moderation page redirects - Sprint 1: Route Consolidation (Nov 8, 2025)
      // Old route group format redirects to new canonical moderator routes
      {
        source: '/reviews',
        destination: '/moderator/reviews',
        permanent: true,
      },
      {
        source: '/comments',
        destination: '/moderator/comments',
        permanent: true,
      },
      // Admin moderation pages redirect to moderator routes (role-based access inside)
      {
        source: '/admin/moderation/reviews',
        destination: '/moderator/reviews',
        permanent: true,
      },
      {
        source: '/admin/moderation/comments',
        destination: '/moderator/comments',
        permanent: true,
      },
      // Info & Support redirects
      {
        source: '/help',
        destination: '/support/help',
        permanent: true,
      },
      {
        source: '/contact',
        destination: '/info/contact',
        permanent: true,
      },
      {
        source: '/how-it-works',
        destination: '/info/how-it-works',
        permanent: true,
      },
      {
        source: '/faq',
        destination: '/info/faq',
        permanent: true,
      },
      {
        source: '/safety',
        destination: '/legal/safety',
        permanent: true,
      },
      {
        source: '/terms',
        destination: '/legal/terms',
        permanent: true,
      },
      {
        source: '/privacy',
        destination: '/legal/privacy',
        permanent: true,
      },
      {
        source: '/cookies',
        destination: '/legal/cookies',
        permanent: true,
      },
      // Package route redirects (backward compatibility)
      // Old packages-detail route
      {
        source: '/marketplace/packages-detail/:id',
        destination: '/api/redirect-to-slug?type=package&id=:id',
        permanent: false, // 302 - may change
      },
      // Old packages/[id] route with UUID pattern
      {
        source:
          '/marketplace/packages/:id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})',
        destination: '/api/redirect-to-slug?type=package&id=:id',
        permanent: false, // 302 - may change
      },
    ];
  },

  // ================================================
  // API PROXY & TEST ROUTE CONFIGURATION
  // ================================================
  async rewrites() {
    // Proxy API requests to backend server
    // This prevents CORS issues and allows cookies to work properly
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    console.log('[Next.js] API proxy configured:', backendUrl);

    const rewrites = [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];

    // Development-only: Enable test routes
    // PRODUCTION: Test routes are EXCLUDED from build
    if (process.env.NODE_ENV === 'development') {
      console.log('[Next.js] 🧪 Test routes ENABLED (development mode)');
      rewrites.push({
        source: '/test/:path*',
        destination: '/tests/manual/:path*',
      });
    } else {
      console.log('[Next.js] 🔒 Test routes EXCLUDED (production mode)');
    }

    return rewrites;
  },

  // ================================================
  // SECURITY HEADERS
  // ================================================
  async headers() {
    const isProduction = process.env.NODE_ENV === 'production';

    return [
      {
        source: '/(.*)',
        headers: [
          // Content Security Policy (CSP)
          ...(isProduction
            ? [
                {
                  key: 'Content-Security-Policy',
                  value: [
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
                  ].join('; '),
                },
              ]
            : []),
          // HTTP Strict Transport Security (HSTS)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // X-Frame-Options - prevent clickjacking
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // X-Content-Type-Options - prevent MIME sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // X-XSS-Protection - XSS filtering (legacy browsers)
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Referrer-Policy - control referrer information
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Permissions-Policy - control browser features
          {
            key: 'Permissions-Policy',
            value: [
              'accelerometer=()',
              'camera=()',
              'geolocation=()',
              'gyroscope=()',
              'magnetometer=()',
              'microphone=()',
              'payment=()',
              'usb=()',
            ].join(', '),
          },
        ],
      },
    ];
  },

  // ================================================
  // COMPILER OPTIONS
  // ================================================
  typescript: {
    ignoreBuildErrors: false,
  },

  // ================================================
  // TURBOPACK CONFIGURATION (Next.js 16+)
  // ================================================
  turbopack: {},

  // ================================================
  // WEBPACK CONFIGURATION (Production Optimization)
  // ================================================
  webpack: (config, { isServer }) => {
    // Bundle analyzer configuration
    if (process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')();
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: isServer
            ? '../analyze/server.html'
            : './analyze/client.html',
          openAnalyzer: false,
        })
      );
    }

    // PRODUCTION OPTIMIZATION: Exclude test files and directories
    if (process.env.NODE_ENV === 'production') {
      // Exclude test files
      if (!isServer) {
        config.module.rules.push({
          test: /\.(test|spec)\.(ts|tsx|js|jsx)$/,
          loader: 'ignore-loader',
        });
      }

      // Exclude test directories from bundle
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push({
          './tests/manual/**': 'commonjs ./tests/manual/**',
          './app/test/**': 'commonjs ./app/test/**',
          './__tests__/**': 'commonjs ./__tests__/**',
        });
      }

      console.log('[Next.js] 🗜️  Production bundle optimization: Test files excluded');
    }

    return config;
  },
};

// ================================================
// SENTRY CONFIGURATION
// ================================================
const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,

  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Upload source maps only in production
  dryRun: process.env.NODE_ENV !== 'production',
};

// Make sure adding Sentry options is the last code to run before exporting
module.exports =
  process.env.NEXT_PUBLIC_ENABLE_SENTRY === 'true'
    ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
    : nextConfig;
