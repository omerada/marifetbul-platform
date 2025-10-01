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
  // SECURITY HEADERS
  // ================================================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
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
};

module.exports = nextConfig;
