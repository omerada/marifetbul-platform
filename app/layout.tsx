import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { MSWProvider } from '@/components/providers/MSWProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { UnifiedErrorBoundary as ErrorBoundary } from '@/components/ui';
import { SEOHead } from '@/components/shared/seo/SEOHead';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'MarifetBul - Freelancer & İşveren Platformu',
  description:
    "Türkiye'nin en büyük freelancer ve işveren buluşma platformu. Projeleriniz için en uygun uzmanları bulun veya yeteneklerinizi sergileyerek gelir elde edin.",
  keywords: 'freelancer, işveren, proje, hizmet, uzman, bionluk, armut',
  authors: [{ name: 'MarifetBul Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'MarifetBul',
    startupImage: [
      '/icons/apple-splash-1125x2436.png',
      '/icons/apple-splash-750x1334.png',
    ],
  },
  icons: {
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon.png', sizes: '64x64', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      {
        url: '/icons/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
    shortcut: '/favicon.ico',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'msapplication-TileColor': '#2563eb',
    'msapplication-config': '/browserconfig.xml',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#2563eb',
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full" data-scroll-behavior="smooth">
      <SEOHead />
      <body
        className={`${inter.variable} h-full bg-gray-50 font-sans antialiased`}
      >
        <ErrorBoundary>
          <MSWProvider>
            <AuthProvider>
              <ToastProvider>{children}</ToastProvider>
            </AuthProvider>
          </MSWProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
