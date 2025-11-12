import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { MonitoringProvider } from '@/components/providers/MonitoringProvider';
import { OrderNotificationProvider } from '@/components/providers/OrderNotificationProvider';
import { NotificationProvider } from '@/components/providers/NotificationProvider';
import { PushPermissionModal } from '@/components/notifications';
import NotificationsBell from '@/components/shared/NotificationsBell';
import { ToastManager } from '@/components/shared/ToastManager';
import { SEOHead } from '@/components/shared/seo/SEOHead';
import { SkipToContent } from '@/components/shared/accessibility';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: {
    default: "MarifetBul - Türkiye'nin Freelance Platformu",
    template: '%s | MarifetBul',
  },
  description:
    "Türkiye'nin en güvenilir freelance platformu. Profesyonel freelancer'lar ve kaliteli hizmetler ile projelerinizi hayata geçirin.",
  keywords: [
    'freelance',
    'iş',
    'hizmet',
    'proje',
    'freelancer',
    'işveren',
    'Türkiye',
  ],
  authors: [{ name: 'MarifetBul' }],
  creator: 'MarifetBul',
  publisher: 'MarifetBul',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
        <SkipToContent />
        <MonitoringProvider>
          <ThemeProvider>
            <AuthProvider>
              <SessionProvider>
                <ToastProvider>
                  <NotificationProvider
                    verbose={process.env.NODE_ENV === 'development'}
                  >
                    <OrderNotificationProvider />
                    <PushPermissionModal />
                    <ToastManager />
                    <div className="fixed top-4 right-4 z-50">
                      <NotificationsBell />
                    </div>
                    {children}
                  </NotificationProvider>
                </ToastProvider>
              </SessionProvider>
            </AuthProvider>
          </ThemeProvider>
        </MonitoringProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
