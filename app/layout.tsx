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
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
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
