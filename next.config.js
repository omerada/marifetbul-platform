/** @type {import('next').NextConfig} */
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
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'marifet.vercel.app',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    unoptimized: process.env.NODE_ENV === 'development',
  },

  // ================================================
  // PERFORMANCE OPTIMIZATIONS
  // ================================================
  experimental: {
    optimizeCss: true,
  },

  // ================================================
  // REDIRECTS FOR VERCEL DEPLOYMENT
  // ================================================
  async redirects() {
    return [
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
    ];
  },

  // ================================================
  // API PROXY CONFIGURATION
  // ================================================
  async rewrites() {
    // Only proxy in development, in production use direct API URL
    if (process.env.NODE_ENV === 'development') {
      return [
        {
          source: '/api/v1/:path*',
          destination: 'http://localhost:8080/api/v1/:path*',
        },
      ];
    }
    return [];
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

  eslint: {
    ignoreDuringBuilds: false,
  },

  // ================================================
  // WEBPACK CONFIGURATION
  // ================================================
  webpack: (config, { isServer, dev }) => {
    // Exclude MSW from production builds
    if (!dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Replace MSW with empty module in production
        'msw/node': false,
        'msw/browser': false,
        msw: false,
      };

      // Ignore MSW-related imports in production
      config.externals = config.externals || [];
      if (!isServer) {
        config.externals.push({
          msw: 'msw',
          'msw/node': 'msw/node',
          'msw/browser': 'msw/browser',
        });
      }
    }

    return config;
  },
};

module.exports = nextConfig;
