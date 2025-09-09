'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [mswReady, setMswReady] = useState(
    process.env.NODE_ENV !== 'development'
  );

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const startMSW = async () => {
        try {
          // Add a small delay to ensure proper initialization
          await new Promise((resolve) => setTimeout(resolve, 100));
          
          const { worker } = await import('../../lib/msw/browser');
          
          await worker.start({
            onUnhandledRequest: 'bypass',
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
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 mx-auto"></div>
          <p className="text-gray-600 text-sm">MSW başlatılıyor...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
