'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Only start MSW in development environment and in browser
    if (
      process.env.NODE_ENV === 'development' &&
      typeof window !== 'undefined'
    ) {
      const startMSW = async () => {
        try {
          // Add a small delay to ensure proper initialization
          await new Promise((resolve) => setTimeout(resolve, 100));

          const { worker } = await import(
            '../../lib/infrastructure/msw/browser'
          );

          console.log(
            '🔧 MSW Provider: Worker imported, total handlers:',
            worker.listHandlers().length
          );

          await worker.start({
            onUnhandledRequest: (req) => {
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
        } catch (error) {
          console.error('❌ Failed to start MSW worker:', error);
        }
      };

      startMSW();
    }
  }, []);

  // Prevent hydration issues by not rendering children until mounted
  if (!isMounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
