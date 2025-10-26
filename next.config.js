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
    // Proxy API requests to backend server
    // This prevents CORS issues and allows cookies to work properly
    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    console.log('[Next.js] API proxy configured:', backendUrl);

    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
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
};

module.exports = nextConfig;
