'use client';

import Head from 'next/head';
import { useSEOStore } from '@/lib/store/seo';
import { SEOPageData } from '@/types/seo';
import { useEffect } from 'react';

interface SEOHeadProps {
  pageData?: SEOPageData;
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  structuredData?: Record<string, unknown>;
  canonical?: string;
  robots?: string;
}

export function SEOHead({
  pageData,
  title,
  description,
  keywords,
  ogImage,
  structuredData,
  canonical,
  robots,
}: SEOHeadProps) {
  const { setPageData, metaTags } = useSEOStore();

  useEffect(() => {
    if (pageData) {
      setPageData(pageData);
    } else if (title || description) {
      // Create page data from individual props
      const data: SEOPageData = {
        title: title || '',
        description: description || '',
        keywords,
        ogImage,
        structuredData,
        canonical,
        robots,
      };
      setPageData(data);
    }
  }, [
    pageData,
    title,
    description,
    keywords,
    ogImage,
    structuredData,
    canonical,
    robots,
    setPageData,
  ]);

  if (!metaTags) return null;

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metaTags.title}</title>
      <meta name="description" content={metaTags.description} />
      <meta name="keywords" content={metaTags.keywords.join(', ')} />
      {metaTags.robots && <meta name="robots" content={metaTags.robots} />}
      {metaTags.canonical && <link rel="canonical" href={metaTags.canonical} />}

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={metaTags.openGraph.title} />
      <meta
        property="og:description"
        content={metaTags.openGraph.description}
      />
      <meta property="og:image" content={metaTags.openGraph.image} />
      <meta property="og:url" content={metaTags.openGraph.url} />
      <meta property="og:type" content={metaTags.openGraph.type} />
      {metaTags.openGraph.siteName && (
        <meta property="og:site_name" content={metaTags.openGraph.siteName} />
      )}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={metaTags.twitterCard.card} />
      <meta name="twitter:title" content={metaTags.twitterCard.title} />
      <meta
        name="twitter:description"
        content={metaTags.twitterCard.description}
      />
      <meta name="twitter:image" content={metaTags.twitterCard.image} />
      {metaTags.twitterCard.site && (
        <meta name="twitter:site" content={metaTags.twitterCard.site} />
      )}
      {metaTags.twitterCard.creator && (
        <meta name="twitter:creator" content={metaTags.twitterCard.creator} />
      )}

      {/* Structured Data */}
      {metaTags.structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(metaTags.structuredData),
          }}
        />
      )}

      {/* Additional SEO Meta Tags */}
      <meta name="author" content="Marifet Bul" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Language" content="tr" />
      <meta name="geo.region" content="TR" />
      <meta name="geo.country" content="Turkey" />

      {/* Favicon and Icons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
      <link rel="manifest" href="/manifest.json" />
    </Head>
  );
}

// Predefined SEO data for common pages
export const seoPresets = {
  home: {
    title: '',
    description:
      "Türkiye'nin en büyük freelancer platformunda kaliteli hizmet sağlayıcıları bulun ve projelerinizi hayata geçirin.",
    keywords: ['freelancer', 'iş', 'proje', 'hizmet', 'uzaktan çalışma'],
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Marifet Bul',
      url: 'https://marifetbul.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://marifetbul.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  },
  marketplace: {
    title: 'Freelancer Marketplace',
    description:
      'Binlerce kaliteli freelancer arasından projenize uygun olanı bulun.',
    keywords: ['freelancer marketplace', 'hizmet satın al', 'proje yaptır'],
  },
  jobListing: {
    title: 'İş İlanları',
    description: 'En güncel freelance iş ilanlarını keşfedin ve başvurun.',
    keywords: ['iş ilanları', 'freelance işler', 'uzaktan çalışma'],
  },
} as const;
