import { Metadata } from 'next';
import { SitemapEntry } from '@/types/shared/seo';

export const generateMarketplaceMetadata = (
  mode: 'jobs' | 'packages',
  searchQuery?: string,
  category?: string
): Metadata => {
  const baseTitle = mode === 'jobs' ? 'İş İlanları' : 'Hizmet Paketleri';
  const baseDescription =
    mode === 'jobs'
      ? "Türkiye'nin en büyük freelance iş platformunda yeteneklerinize uygun işleri keşfedin. Uzaktan çalışma, part-time ve full-time iş fırsatları."
      : 'Profesyonel freelancerların hazırladığı kaliteli hizmet paketlerini keşfedin. Hızlı teslimat, uygun fiyat, güvenli ödeme.';

  let title = baseTitle;
  let description = baseDescription;

  if (searchQuery) {
    title = `${searchQuery} - ${baseTitle}`;
    description = `${searchQuery} ile ilgili ${mode === 'jobs' ? 'iş ilanları' : 'hizmet paketleri'} Marifeto'da. ${baseDescription}`;
  }

  if (category) {
    title = `${category} ${baseTitle}`;
    description = `${category} kategorisindeki ${mode === 'jobs' ? 'iş ilanları' : 'hizmet paketleri'}. ${baseDescription}`;
  }

  return {
    title: `${title} | Marifeto`,
    description,
    keywords: [
      mode === 'jobs' ? 'iş ilanları' : 'hizmet paketleri',
      'freelance',
      'uzaktan çalışma',
      'part-time',
      'türkiye',
      'marifeto',
      ...(searchQuery ? [searchQuery] : []),
      ...(category ? [category] : []),
    ].join(', '),
    openGraph: {
      title: `${title} | Marifeto`,
      description,
      type: 'website',
      locale: 'tr_TR',
      siteName: 'Marifeto',
      images: [
        {
          url: '/images/og-marketplace.jpg',
          width: 1200,
          height: 630,
          alt: `Marifeto ${baseTitle}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Marifeto`,
      description,
      images: ['/images/og-marketplace.jpg'],
    },
    alternates: {
      canonical: `/marketplace?mode=${mode}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ''}${category ? `&category=${encodeURIComponent(category)}` : ''}`,
    },
  };
};

export class SEOUtils {
  /**
   * Generate SEO-friendly URL slug
   */
  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[türkçe karakterler]/g, (char) => {
        const map: Record<string, string> = {
          ğ: 'g',
          ü: 'u',
          ş: 's',
          ı: 'i',
          ö: 'o',
          ç: 'c',
          Ğ: 'G',
          Ü: 'U',
          Ş: 'S',
          İ: 'I',
          Ö: 'O',
          Ç: 'C',
        };
        return map[char] || char;
      })
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  /**
   * Generate structured data for job posting
   */
  static generateJobPostingStructuredData(job: {
    title: string;
    description: string;
    company: string;
    location: string;
    salary?: { min: number; max: number; currency: string };
    datePosted: string;
    validThrough: string;
    employmentType: string;
  }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      description: job.description,
      hiringOrganization: {
        '@type': 'Organization',
        name: job.company,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: job.location,
          addressCountry: 'TR',
        },
      },
      baseSalary: job.salary
        ? {
            '@type': 'MonetaryAmount',
            currency: job.salary.currency,
            value: {
              '@type': 'QuantitativeValue',
              minValue: job.salary.min,
              maxValue: job.salary.max,
              unitText: 'MONTH',
            },
          }
        : undefined,
      datePosted: job.datePosted,
      validThrough: job.validThrough,
      employmentType: job.employmentType,
    };
  }

  /**
   * Generate structured data for service/product
   */
  static generateServiceStructuredData(service: {
    name: string;
    description: string;
    provider: string;
    price?: { amount: number; currency: string };
    rating?: { value: number; count: number };
    category: string;
  }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: service.name,
      description: service.description,
      provider: {
        '@type': 'Organization',
        name: service.provider,
      },
      offers: service.price
        ? {
            '@type': 'Offer',
            price: service.price.amount,
            priceCurrency: service.price.currency,
          }
        : undefined,
      aggregateRating: service.rating
        ? {
            '@type': 'AggregateRating',
            ratingValue: service.rating.value,
            reviewCount: service.rating.count,
          }
        : undefined,
      serviceType: service.category,
    };
  }

  /**
   * Generate structured data for person/freelancer profile
   */
  static generatePersonStructuredData(person: {
    name: string;
    description: string;
    image?: string;
    jobTitle: string;
    skills: string[];
    location: string;
    url?: string;
  }) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: person.name,
      description: person.description,
      image: person.image,
      jobTitle: person.jobTitle,
      knowsAbout: person.skills,
      address: {
        '@type': 'PostalAddress',
        addressLocality: person.location,
        addressCountry: 'TR',
      },
      url: person.url,
    };
  }

  /**
   * Validate meta description length
   */
  static validateMetaDescription(description: string): {
    isValid: boolean;
    length: number;
    recommendation: string;
  } {
    const length = description.length;
    const isValid = length >= 120 && length <= 160;

    let recommendation = '';
    if (length < 120) {
      recommendation = 'Meta description çok kısa. En az 120 karakter olmalı.';
    } else if (length > 160) {
      recommendation =
        'Meta description çok uzun. En fazla 160 karakter olmalı.';
    } else {
      recommendation = 'Meta description uzunluğu ideal.';
    }

    return { isValid, length, recommendation };
  }

  /**
   * Validate title length
   */
  static validateTitle(title: string): {
    isValid: boolean;
    length: number;
    recommendation: string;
  } {
    const length = title.length;
    const isValid = length >= 30 && length <= 60;

    let recommendation = '';
    if (length < 30) {
      recommendation = 'Title çok kısa. En az 30 karakter olmalı.';
    } else if (length > 60) {
      recommendation = 'Title çok uzun. En fazla 60 karakter olmalı.';
    } else {
      recommendation = 'Title uzunluğu ideal.';
    }

    return { isValid, length, recommendation };
  }

  /**
   * Generate breadcrumb structured data
   */
  static generateBreadcrumbStructuredData(
    breadcrumbs: Array<{
      name: string;
      url: string;
    }>
  ) {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url,
      })),
    };
  }
}
