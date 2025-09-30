'use client';

// ================================================
// ENHANCED SEO SYSTEM
// ================================================
// Production-ready SEO optimization with performance monitoring

import { useEffect, useState } from 'react';
import Head from 'next/head';

// ================================
// TYPES
// ================================

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  openGraph?: {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'profile';
    siteName?: string;
  };
  twitter?: {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player';
    site?: string;
    creator?: string;
    title?: string;
    description?: string;
    image?: string;
  };
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  alternates?: {
    hreflang: string;
    href: string;
  }[];
  robots?: {
    index?: boolean;
    follow?: boolean;
    noarchive?: boolean;
    nosnippet?: boolean;
    noimageindex?: boolean;
  };
}

export interface PagePerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  totalBlockingTime: number;
}

// ================================
// SEO COMPONENT
// ================================

interface EnhancedSEOProps {
  data: SEOData;
  noindex?: boolean;
  nofollow?: boolean;
}

export function EnhancedSEO({
  data,
  noindex = false,
  nofollow = false,
}: EnhancedSEOProps) {
  const {
    title,
    description,
    keywords = [],
    canonical,
    openGraph,
    twitter,
    jsonLd,
    alternates = [],
    robots,
  } = data;

  // Generate robots content
  const robotsContent = [
    robots?.index !== false && !noindex ? 'index' : 'noindex',
    robots?.follow !== false && !nofollow ? 'follow' : 'nofollow',
    robots?.noarchive ? 'noarchive' : '',
    robots?.nosnippet ? 'nosnippet' : '',
    robots?.noimageindex ? 'noimageindex' : '',
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      <meta name="robots" content={robotsContent} />

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph */}
      {openGraph && (
        <>
          <meta property="og:title" content={openGraph.title || title} />
          <meta
            property="og:description"
            content={openGraph.description || description}
          />
          <meta property="og:type" content={openGraph.type || 'website'} />
          {openGraph.image && (
            <meta property="og:image" content={openGraph.image} />
          )}
          {openGraph.url && <meta property="og:url" content={openGraph.url} />}
          {openGraph.siteName && (
            <meta property="og:site_name" content={openGraph.siteName} />
          )}
        </>
      )}

      {/* Twitter Card */}
      {twitter && (
        <>
          <meta name="twitter:card" content={twitter.card || 'summary'} />
          {twitter.site && <meta name="twitter:site" content={twitter.site} />}
          {twitter.creator && (
            <meta name="twitter:creator" content={twitter.creator} />
          )}
          <meta name="twitter:title" content={twitter.title || title} />
          <meta
            name="twitter:description"
            content={twitter.description || description}
          />
          {twitter.image && (
            <meta name="twitter:image" content={twitter.image} />
          )}
        </>
      )}

      {/* Alternate Language */}
      {alternates.map((alternate, index) => (
        <link
          key={index}
          rel="alternate"
          hrefLang={alternate.hreflang}
          href={alternate.href}
        />
      ))}

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd]),
          }}
        />
      )}
    </Head>
  );
}

// ================================
// PERFORMANCE MONITOR
// ================================

export function usePagePerformance() {
  const [metrics, setMetrics] = useState<Partial<PagePerformanceMetrics>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined' || !('performance' in window)) {
      setIsLoading(false);
      return;
    }

    const measurePerformance = () => {
      try {
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');

        const newMetrics: Partial<PagePerformanceMetrics> = {
          loadTime: navigation.loadEventEnd - navigation.loadEventStart,
        };

        // First Contentful Paint
        const fcp = paint.find(
          (entry) => entry.name === 'first-contentful-paint'
        );
        if (fcp) {
          newMetrics.firstContentfulPaint = fcp.startTime;
        }

        // Use Performance Observer for LCP, CLS, FID
        if ('PerformanceObserver' in window) {
          // Largest Contentful Paint
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            setMetrics((prev) => ({
              ...prev,
              largestContentfulPaint: lastEntry.startTime,
            }));
          });

          try {
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          } catch (e) {
            // LCP not supported
          }

          // Cumulative Layout Shift
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            setMetrics((prev) => ({
              ...prev,
              cumulativeLayoutShift: clsValue,
            }));
          });

          try {
            clsObserver.observe({ entryTypes: ['layout-shift'] });
          } catch (e) {
            // CLS not supported
          }

          // First Input Delay
          const fidObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              setMetrics((prev) => ({
                ...prev,
                firstInputDelay:
                  (entry as any).processingStart - entry.startTime,
              }));
            }
          });

          try {
            fidObserver.observe({ entryTypes: ['first-input'] });
          } catch (e) {
            // FID not supported
          }

          // Cleanup observers
          setTimeout(() => {
            lcpObserver.disconnect();
            clsObserver.disconnect();
            fidObserver.disconnect();
          }, 10000); // Clean up after 10 seconds
        }

        setMetrics(newMetrics);
        setIsLoading(false);
      } catch (error) {
        console.warn('Performance measurement failed:', error);
        setIsLoading(false);
      }
    };

    // Measure after page load
    if (document.readyState === 'complete') {
      measurePerformance();
    } else {
      window.addEventListener('load', measurePerformance);
      return () => window.removeEventListener('load', measurePerformance);
    }
  }, []);

  return { metrics, isLoading };
}

// ================================
// SEO UTILITIES
// ================================

export function generatePageSEO(pageType: string, data: any): SEOData {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://marifetbul.com';

  switch (pageType) {
    case 'home':
      return {
        title: 'MarifetBul - Freelancer & İşveren Platformu',
        description:
          "Türkiye'nin en büyük freelancer ve işveren buluşma platformu. Projeleriniz için en uygun uzmanları bulun veya yeteneklerinizi sergileyerek gelir elde edin.",
        keywords: [
          'freelancer',
          'işveren',
          'proje',
          'hizmet',
          'uzman',
          'marketplace',
        ],
        canonical: baseUrl,
        openGraph: {
          title: 'MarifetBul - Freelancer & İşveren Platformu',
          description: "Türkiye'nin en büyük freelancer marketplace'i",
          image: `${baseUrl}/images/og-home.jpg`,
          url: baseUrl,
          type: 'website',
          siteName: 'MarifetBul',
        },
        twitter: {
          card: 'summary_large_image',
          site: '@marifetbul',
          title: 'MarifetBul - Freelancer & İşveren Platformu',
          description: "Türkiye'nin en büyük freelancer marketplace'i",
          image: `${baseUrl}/images/twitter-home.jpg`,
        },
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'MarifetBul',
          url: baseUrl,
          description:
            "Türkiye'nin en büyük freelancer ve işveren buluşma platformu",
          potentialAction: {
            '@type': 'SearchAction',
            target: `${baseUrl}/search?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        },
      };

    case 'profile':
      return {
        title: `${data.name} - Freelancer Profili | MarifetBul`,
        description:
          data.bio ||
          `${data.name} adlı freelancer'ın profiline göz atın. MarifetBul'da kaliteli hizmet alın.`,
        keywords: [...(data.skills || []), 'freelancer', 'profil', 'hizmet'],
        canonical: `${baseUrl}/profile/${data.id}`,
        openGraph: {
          title: `${data.name} - Freelancer Profili`,
          description: data.bio || `${data.name} adlı freelancer'ın profili`,
          image: data.avatar || `${baseUrl}/images/default-avatar.jpg`,
          url: `${baseUrl}/profile/${data.id}`,
          type: 'profile',
          siteName: 'MarifetBul',
        },
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: data.name,
          description: data.bio,
          image: data.avatar,
          url: `${baseUrl}/profile/${data.id}`,
          knowsAbout: data.skills,
          worksFor: {
            '@type': 'Organization',
            name: 'MarifetBul',
          },
        },
      };

    case 'job':
      return {
        title: `${data.title} - İş İlanı | MarifetBul`,
        description: data.description.substring(0, 160),
        keywords: [...(data.skills || []), 'iş ilanı', 'proje'],
        canonical: `${baseUrl}/jobs/${data.id}`,
        openGraph: {
          title: data.title,
          description: data.description.substring(0, 160),
          url: `${baseUrl}/jobs/${data.id}`,
          type: 'article',
          siteName: 'MarifetBul',
        },
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'JobPosting',
          title: data.title,
          description: data.description,
          datePosted: data.createdAt,
          validThrough: data.deadline,
          employmentType: data.type === 'hourly' ? 'CONTRACTOR' : 'TEMPORARY',
          hiringOrganization: {
            '@type': 'Organization',
            name: 'MarifetBul',
            sameAs: baseUrl,
          },
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: 'TRY',
            value: {
              '@type': 'QuantitativeValue',
              value: data.budget,
            },
          },
        },
      };

    case 'package':
      return {
        title: `${data.title} - Hizmet Paketi | MarifetBul`,
        description: data.description.substring(0, 160),
        keywords: [...(data.tags || []), 'hizmet paketi', 'freelancer'],
        canonical: `${baseUrl}/packages/${data.id}`,
        openGraph: {
          title: data.title,
          description: data.description.substring(0, 160),
          image: data.image || `${baseUrl}/images/default-package.jpg`,
          url: `${baseUrl}/packages/${data.id}`,
          type: 'article',
          siteName: 'MarifetBul',
        },
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: data.title,
          description: data.description,
          provider: {
            '@type': 'Person',
            name: data.freelancer?.name,
          },
          offers: {
            '@type': 'Offer',
            price: data.price,
            priceCurrency: 'TRY',
            availability: 'InStock',
          },
        },
      };

    default:
      return {
        title: 'MarifetBul - Freelancer & İşveren Platformu',
        description: "Türkiye'nin en büyük freelancer marketplace'i",
        canonical: baseUrl,
      };
  }
}

// ================================
// PERFORMANCE SCORING
// ================================

export function calculatePerformanceScore(metrics: PagePerformanceMetrics): {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  recommendations: string[];
} {
  const recommendations: string[] = [];
  let totalScore = 0;
  let criteriaCount = 0;

  // LCP Score (0-40 points)
  if (metrics.largestContentfulPaint !== undefined) {
    if (metrics.largestContentfulPaint <= 2500) {
      totalScore += 40;
    } else if (metrics.largestContentfulPaint <= 4000) {
      totalScore += 20;
      recommendations.push(
        'Largest Contentful Paint yavaş. Görsel optimizasyonu gerekli.'
      );
    } else {
      recommendations.push(
        'Largest Contentful Paint çok yavaş. Kritik kaynak optimizasyonu gerekli.'
      );
    }
    criteriaCount++;
  }

  // FID Score (0-25 points)
  if (metrics.firstInputDelay !== undefined) {
    if (metrics.firstInputDelay <= 100) {
      totalScore += 25;
    } else if (metrics.firstInputDelay <= 300) {
      totalScore += 15;
      recommendations.push(
        'First Input Delay yavaş. JavaScript optimizasyonu gerekli.'
      );
    } else {
      recommendations.push(
        'First Input Delay çok yavaş. Ana thread blocking süresi azaltılmalı.'
      );
    }
    criteriaCount++;
  }

  // CLS Score (0-25 points)
  if (metrics.cumulativeLayoutShift !== undefined) {
    if (metrics.cumulativeLayoutShift <= 0.1) {
      totalScore += 25;
    } else if (metrics.cumulativeLayoutShift <= 0.25) {
      totalScore += 15;
      recommendations.push(
        'Layout Shift sorunu var. Element boyutları tanımlanmalı.'
      );
    } else {
      recommendations.push(
        'Ciddi Layout Shift sorunu. Görsel stabilite iyileştirilmeli.'
      );
    }
    criteriaCount++;
  }

  // FCP Score (0-10 points)
  if (metrics.firstContentfulPaint !== undefined) {
    if (metrics.firstContentfulPaint <= 1800) {
      totalScore += 10;
    } else if (metrics.firstContentfulPaint <= 3000) {
      totalScore += 5;
      recommendations.push('First Contentful Paint yavaş.');
    } else {
      recommendations.push('First Contentful Paint çok yavaş.');
    }
    criteriaCount++;
  }

  const score = criteriaCount > 0 ? Math.round(totalScore / criteriaCount) : 0;

  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  return { score, grade, recommendations };
}

// ================================
// EXPORTS
// ================================

export default {
  EnhancedSEO,
  usePagePerformance,
  generatePageSEO,
  calculatePerformanceScore,
};
