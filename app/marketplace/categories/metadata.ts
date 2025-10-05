import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Hizmet Kategorileri | MarifetBul - Türkiye'nin Freelance Platformu",
  description:
    'Teknolojiden tasarıma, ev hizmetlerinden eğitime kadar 800+ hizmet kategorisinde uzman freelancerlar bulun. 16 ana kategori, binlerce başarılı proje.',
  keywords: [
    'freelance kategoriler',
    'hizmet kategorileri',
    'uzman freelancerlar',
    'teknoloji hizmetleri',
    'tasarım hizmetleri',
    'pazarlama hizmetleri',
    'ev hizmetleri',
    'eğitim hizmetleri',
    'web tasarım',
    'mobil uygulama',
    'logo tasarımı',
    'seo hizmetleri',
    'temizlik hizmetleri',
    'özel ders',
    'MarifetBul',
    'freelance platform',
    'iş ilanları',
  ],
  openGraph: {
    title: 'Hizmet Kategorileri | MarifetBul',
    description:
      'Teknolojiden tasarıma, ev hizmetlerinden eğitime kadar 800+ hizmet kategorisinde uzman freelancerlar bulun.',
    type: 'website',
    url: 'https://marifetbul.com/marketplace/categories',
    siteName: 'MarifetBul',
    images: [
      {
        url: '/images/og/categories.jpg',
        width: 1200,
        height: 630,
        alt: 'MarifetBul Hizmet Kategorileri',
      },
    ],
    locale: 'tr_TR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hizmet Kategorileri | MarifetBul',
    description:
      'Teknolojiden tasarıma, ev hizmetlerinden eğitime kadar 800+ hizmet kategorisinde uzman freelancerlar bulun.',
    images: ['/images/og/categories.jpg'],
    creator: '@marifetbul',
    site: '@marifetbul',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://marifetbul.com/marketplace/categories',
    languages: {
      'tr-TR': 'https://marifetbul.com/marketplace/categories',
      'en-US': 'https://marifetbul.com/en/marketplace/categories',
    },
  },
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
  },
};
