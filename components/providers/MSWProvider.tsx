'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Only start MSW if explicitly enabled via environment variable AND in development
    const mswEnabled = process.env.NEXT_PUBLIC_ENABLE_MSW === 'true';
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isDebugMode = process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true';

    // MSW should NEVER run in production
    if (process.env.NODE_ENV === 'production') {
      if (isDebugMode) {
        console.log('✅ Production mode: MSW disabled (as expected)');
      }
      return;
    }

    // In development, only run if explicitly enabled
    if (mswEnabled && isDevelopment && typeof window !== 'undefined') {
      const startMSW = async () => {
        try {
          console.log('🔧 MSW Provider: Starting MSW in development mode...');

          // Add a small delay to ensure proper initialization
          await new Promise((resolve) => setTimeout(resolve, 100));

          const { worker } = await import(
            '../../lib/infrastructure/msw/browser'
          );

          console.log(
            '🔧 MSW Provider: Worker imported, total handlers:',
            worker.listHandlers().length
          );

          // Log first few handlers for debugging
          const handlersList = worker.listHandlers();
          console.log('🔧 MSW Provider: First 5 handlers:');
          handlersList.slice(0, 5).forEach((handler, index) => {
            console.log(`  ${index + 1}:`, handler.toString());
          });

          await worker.start({
            onUnhandledRequest: (req) => {
              console.log('🔍 MSW: Unhandled request:', req.url);

              // Bypass Next.js image optimization and static assets
              if (
                req.url.includes('/_next/') ||
                req.url.includes('/static/') ||
                req.url.includes('/images/') ||
                req.url.includes('/icons/') ||
                req.url.includes('.png') ||
                req.url.includes('.jpg') ||
                req.url.includes('.jpeg') ||
                req.url.includes('.gif') ||
                req.url.includes('.svg') ||
                req.url.includes('.webp') ||
                req.url.includes('.css') ||
                req.url.includes('.js') ||
                req.url.includes('.woff') ||
                req.url.includes('.woff2') ||
                req.url.includes('.ttf') ||
                req.url.includes('.eot')
              ) {
                return 'bypass';
              }
              // Bypass via.placeholder.com URLs since we handle them locally now
              if (req.url.includes('via.placeholder.com')) {
                return 'bypass';
              }
              return 'bypass';
            },
            serviceWorker: {
              url: '/mockServiceWorker.js',
            },
            quiet: false, // Enable MSW logs for debugging
          });

          console.log('🚀 MSW worker started successfully');
          console.log(
            '📋 MSW handlers registered:',
            worker.listHandlers().length
          );
          console.log('⚠️  MSW is active - API calls will be mocked!');
        } catch (error) {
          console.error('❌ Failed to start MSW worker:', error);
        }
      };

      startMSW();
    } else if (!mswEnabled && isDevelopment) {
      console.log('ℹ️  MSW is disabled - API calls will go to real backend');
      console.log(
        '💡 To enable MSW, set NEXT_PUBLIC_ENABLE_MSW=true in .env.local'
      );
    }
  }, []);

  // Prevent hydration issues by not rendering children until mounted
  if (!isMounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
