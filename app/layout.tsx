import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { MSWProvider } from '@/components/providers/MSWProvider';
import { AuthProvider } from '@/components/providers/AuthProvider';
import { ToastContainer } from '@/components/ui/Toast';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Marifeto - Freelancer & İşveren Platformu',
  description:
    "Türkiye'nin en büyük freelancer ve işveren buluşma platformu. Projeleriniz için en uygun uzmanları bulun veya yeteneklerinizi sergileyerek gelir elde edin.",
  keywords: 'freelancer, işveren, proje, hizmet, uzman, bionluk, armut',
  authors: [{ name: 'Marifeto Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Marifeto',
    startupImage: [
      '/icons/apple-splash-1125x2436.png',
      '/icons/apple-splash-750x1334.png',
    ],
  },
  icons: {
    icon: [
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
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
    <html lang="tr" className="h-full">
      <body
        className={`${inter.variable} h-full bg-gray-50 font-sans antialiased`}
      >
        <MSWProvider>
          <AuthProvider>
            {children}
            <ToastContainer />
          </AuthProvider>
        </MSWProvider>
      </body>
    </html>
  );
}
