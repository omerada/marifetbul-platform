import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ================================================
  // PRODUCTION OPTIMIZATIONS
  // ================================================
  output: 'standalone',
  poweredByHeader: false,
  generateEtags: false,
  compress: true,

  // ================================================
  // IMAGE OPTIMIZATION - ENHANCED
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
    // Enhanced image optimization settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // ================================================
  // PERFORMANCE OPTIMIZATIONS - ENHANCED
  // ================================================
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
      'lodash-es',
      '@hookform/resolvers',
      'zod',
      'zustand',
      'immer',
      'swr',
      'react-hook-form',
      'clsx',
      'tailwind-merge',
    ],
    optimizeCss: true,
    // Enable webpack build worker for faster builds
    webpackBuildWorker: true,
  },

  // ================================================
  // WEBPACK OPTIMIZATIONS - ENHANCED
  // ================================================
  webpack: (config, { dev, isServer }) => {
    // Enable webpack cache for faster builds
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [__filename],
      },
    };

    // Tree shaking and performance optimizations
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        sideEffects: false,
        usedExports: true,
        concatenateModules: true,
        // Enhanced chunk splitting strategy
        splitChunks: {
          chunks: 'all',
          minSize: 20000,
          maxSize: 244000,
          cacheGroups: {
            default: {
              minChunks: 2,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: -10,
              chunks: 'all',
            },
            // React chunk
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: 'react',
              priority: 20,
              chunks: 'all',
            },
            // UI library chunk
            ui: {
              test: /[\\/]node_modules[\\/](lucide-react|@radix-ui)[\\/]/,
              name: 'ui-lib',
              priority: 15,
              chunks: 'all',
            },
            // Form libraries chunk
            forms: {
              test: /[\\/]node_modules[\\/](react-hook-form|@hookform|zod)[\\/]/,
              name: 'forms',
              priority: 10,
              chunks: 'all',
            },
            // Utilities chunk
            utils: {
              test: /[\\/]node_modules[\\/](date-fns|lodash-es|clsx|tailwind-merge)[\\/]/,
              name: 'utils',
              priority: 8,
              chunks: 'all',
            },
            // State management chunk
            state: {
              test: /[\\/]node_modules[\\/](zustand|immer|swr)[\\/]/,
              name: 'state',
              priority: 12,
              chunks: 'all',
            },
            // Application chunks
            stores: {
              test: /[\\/]lib[\\/]store[\\/]/,
              name: 'app-stores',
              priority: 25,
              chunks: 'all',
            },
            components: {
              test: /[\\/]components[\\/]/,
              name: 'app-components',
              priority: 20,
              chunks: 'all',
            },
            hooks: {
              test: /[\\/]hooks[\\/]/,
              name: 'app-hooks',
              priority: 15,
              chunks: 'all',
            },
            validations: {
              test: /[\\/]lib[\\/]validations[\\/]/,
              name: 'app-validations',
              priority: 10,
              chunks: 'all',
            },
          },
        },
      };
    }

    // Reduce bundle size with better aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      // Use ES modules for better tree shaking
      lodash: 'lodash-es',
    };

    return config;
  },

  // ================================================
  // ENHANCED SECURITY HEADERS
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
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
      {
        // Enhanced caching for static assets
        source:
          '/(.*)\\.(js|css|woff|woff2|eot|ttf|otf|png|jpg|jpeg|gif|svg|ico|webp|avif)$',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache API responses for a shorter time
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600',
          },
        ],
      },
    ];
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // ================================================
  // COMPILER OPTIONS
  // ================================================

  // TypeScript strict mode
  typescript: {
    ignoreBuildErrors: false,
  },

  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
