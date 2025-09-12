'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(
    process.env.NODE_ENV !== 'development'
  );

  useEffect(() => {
    // Only start MSW in development environment
    if (process.env.NODE_ENV === 'development') {
      const startMSW = async () => {
        try {
          // Add a small delay to ensure proper initialization
          await new Promise((resolve) => setTimeout(resolve, 100));

          const { worker } = await import('../../lib/msw/browser');

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
          });

          console.log('🚀 MSW worker started successfully');
          setMswReady(true);
        } catch (error) {
          console.error('❌ Failed to start MSW worker:', error);
          setMswReady(true); // Still render even if MSW fails
        }
      };

      // Set a timeout in case MSW takes too long
      const timeout = setTimeout(() => {
        console.warn('⚠️ MSW timeout - continuing without MSW');
        setMswReady(true);
      }, 3000);

      startMSW().finally(() => {
        clearTimeout(timeout);
      });
    }
  }, []);

  // In development, wait for MSW to start before rendering
  if (process.env.NODE_ENV === 'development' && !mswReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
          <p className="text-sm text-gray-600">Mock API başlatılıyor...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
