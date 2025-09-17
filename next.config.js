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
    ignoreBuildErrors: true,
  },

  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
