import { Metadata } from 'next';
import { SEOConfig, SEOPageData } from '@/types/shared/seo';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://marifetbul.com';

export const seoConfig: SEOConfig = {
  defaultTitle: 'MarifetBul - Freelancer ve İş Buluşma Platformu',
  titleTemplate: '%s | MarifetBul',
  defaultDescription:
    "Türkiye'nin en büyük freelancer platformu. Kaliteli hizmet sağlayıcıları ve işverenler burada buluşuyor. Projeni yayınla, teklif al, güvenle çalış.",
  defaultKeywords: [
    'freelancer',
    'freelance',
    'iş ilanları',
    'proje',
    'freelancer türkiye',
    'serbest çalışan',
    'uzaktan çalışma',
    'web tasarım',
    'yazılım geliştirme',
    'grafik tasarım',
    'dijital pazarlama',
  ],
  defaultOGImage: `${BASE_URL}/images/og-default.jpg`,
  siteUrl: BASE_URL,
  siteName: 'MarifetBul',
  twitterHandle: '@marifetbul',
};

/**
 * Generate SEO metadata for pages
 */
export function generateMetadata(pageData: SEOPageData): Metadata {
  const title = pageData.title
    ? `${pageData.title} | ${seoConfig.siteName}`
    : seoConfig.defaultTitle;

  const description = pageData.description || seoConfig.defaultDescription;
  const keywords = pageData.keywords || seoConfig.defaultKeywords;
  const ogImage = pageData.ogImage || seoConfig.defaultOGImage;
  const canonical = pageData.canonical
    ? `${seoConfig.siteUrl}${pageData.canonical}`
    : undefined;

  return {
    title,
    description,
    keywords: keywords.join(', '),
    robots: pageData.robots || 'index, follow',
    openGraph: {
      title,
      description,
      url: canonical || seoConfig.siteUrl,
      siteName: seoConfig.siteName,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'tr_TR',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      site: seoConfig.twitterHandle,
      images: [ogImage],
    },
    alternates: {
      canonical,
    },
    other: pageData.structuredData
      ? {
          'structured-data': JSON.stringify(pageData.structuredData),
        }
      : undefined,
  };
}

/**
 * SEO metadata for different page types
 */
export const seoMetadata = {
  // Homepage
  home: (): Metadata =>
    generateMetadata({
      title: '',
      description: seoConfig.defaultDescription,
      canonical: '/',
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: seoConfig.siteName,
        url: seoConfig.siteUrl,
        description: seoConfig.defaultDescription,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${seoConfig.siteUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      },
    }),

  // Marketplace
  marketplace: (): Metadata =>
    generateMetadata({
      title: 'İş ve Hizmet Pazarı',
      description:
        'Binlerce freelancer ve hizmet sağlayıcısından istediğin hizmeti bul. Web tasarım, yazılım, grafik tasarım ve daha fazlası.',
      canonical: '/marketplace',
      keywords: [
        'freelancer marketplace',
        'hizmet pazarı',
        'freelance işler',
        'proje marketplace',
      ],
    }),

  // Blog
  blog: (): Metadata =>
    generateMetadata({
      title: 'Blog',
      description:
        'Freelance dünyası, kariyer ipuçları, sektör trendleri ve daha fazlası hakkında güncel içerikler.',
      canonical: '/blog',
      keywords: ['freelance blog', 'kariyer ipuçları', 'serbest çalışma'],
    }),

  // Legal pages
  privacy: (): Metadata =>
    generateMetadata({
      title: 'Gizlilik Politikası',
      description:
        'MarifetBul gizlilik politikası. Kişisel verilerinizi nasıl koruduğumuz ve kullandığımız hakkında bilgi.',
      canonical: '/legal/privacy',
      robots: 'index, nofollow',
    }),

  terms: (): Metadata =>
    generateMetadata({
      title: 'Kullanım Şartları',
      description:
        'MarifetBul kullanım şartları ve hizmet koşulları. Platform kuralları ve kullanıcı sorumlulukları.',
      canonical: '/legal/terms',
      robots: 'index, nofollow',
    }),

  // Support
  support: (): Metadata =>
    generateMetadata({
      title: 'Destek Merkezi',
      description:
        'MarifetBul destek merkezi. Sık sorulan sorular, yardım makaleleri ve destek talebi oluşturma.',
      canonical: '/support',
      keywords: ['destek', 'yardım', 'sss', 'müşteri hizmetleri'],
    }),

  // Help
  help: (): Metadata =>
    generateMetadata({
      title: 'Yardım Merkezi',
      description:
        'MarifetBul kullanım kılavuzu, adım adım rehberler ve sık sorulan sorular.',
      canonical: '/support/help',
      keywords: ['yardım', 'rehber', 'kullanım kılavuzu', 'sss'],
    }),

  // Contact
  contact: (): Metadata =>
    generateMetadata({
      title: 'İletişim',
      description:
        'MarifetBul ile iletişime geçin. Sorularınız, önerileriniz veya işbirliği teklifleriniz için bize ulaşın.',
      canonical: '/info/contact',
      keywords: ['iletişim', 'contact', 'destek', 'müşteri hizmetleri'],
    }),

  // FAQ
  faq: (): Metadata =>
    generateMetadata({
      title: 'Sık Sorulan Sorular',
      description:
        'MarifetBul hakkında merak ettiğiniz her şey. Sık sorulan sorular ve detaylı cevaplar.',
      canonical: '/info/faq',
      keywords: ['sss', 'sık sorulan sorular', 'faq', 'yardım'],
    }),

  // How it works
  howItWorks: (): Metadata =>
    generateMetadata({
      title: 'Nasıl Çalışır',
      description:
        'MarifetBul nasıl çalışır? Platform kullanımı, proje süreci ve ödeme sistemi hakkında detaylı bilgi.',
      canonical: '/info/how-it-works',
      keywords: ['nasıl çalışır', 'platform kullanımı', 'rehber'],
    }),
};

/**
 * Generate dynamic metadata for content pages
 */
export const dynamicSeoMetadata = {
  jobDetail: (job: {
    title: string;
    description: string;
    id: string;
  }): Metadata =>
    generateMetadata({
      title: job.title,
      description: job.description.substring(0, 160),
      canonical: `/marketplace/jobs/${job.id}`,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        description: job.description,
        url: `${seoConfig.siteUrl}/marketplace/jobs/${job.id}`,
        hiringOrganization: {
          '@type': 'Organization',
          name: seoConfig.siteName,
        },
      },
    }),

  packageDetail: (pkg: {
    title: string;
    description: string;
    id: string;
  }): Metadata =>
    generateMetadata({
      title: pkg.title,
      description: pkg.description.substring(0, 160),
      canonical: `/marketplace/packages/${pkg.id}`,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: pkg.title,
        description: pkg.description,
        url: `${seoConfig.siteUrl}/marketplace/packages/${pkg.id}`,
        provider: {
          '@type': 'Organization',
          name: seoConfig.siteName,
        },
      },
    }),

  blogPost: (post: {
    title: string;
    excerpt: string;
    slug: string;
    publishedAt: string;
  }): Metadata =>
    generateMetadata({
      title: post.title,
      description: post.excerpt.substring(0, 160),
      canonical: `/blog/${post.slug}`,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        url: `${seoConfig.siteUrl}/blog/${post.slug}`,
        datePublished: post.publishedAt,
        author: {
          '@type': 'Organization',
          name: seoConfig.siteName,
        },
        publisher: {
          '@type': 'Organization',
          name: seoConfig.siteName,
        },
      },
    }),

  userProfile: (user: { name: string; bio: string; id: string }): Metadata =>
    generateMetadata({
      title: `${user.name} - Freelancer Profili`,
      description: user.bio.substring(0, 160),
      canonical: `/profile/${user.id}`,
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: user.name,
        description: user.bio,
        url: `${seoConfig.siteUrl}/profile/${user.id}`,
      },
    }),
};
