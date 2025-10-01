'use client';

interface StructuredDataProps {
  data: Record<string, unknown>;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data),
      }}
    />
  );
}

// Common structured data schemas
export const structuredDataSchemas = {
  organization: {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'MarifetBul',
    url: 'https://marifetbul.com',
    logo: 'https://marifetbul.com/logo.png',
    description: "Türkiye'nin en büyük freelancer ve işveren buluşma platformu",
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+90-XXX-XXX-XXXX',
      contactType: 'customer service',
      availableLanguage: 'Turkish',
    },
    sameAs: [
      'https://twitter.com/marifetbul',
      'https://www.linkedin.com/company/marifetbul',
      'https://www.instagram.com/marifetbul',
    ],
  },

  website: {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'MarifetBul',
    url: 'https://marifetbul.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://marifetbul.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  },

  breadcrumbList: (breadcrumbs: Array<{ name: string; url: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url,
    })),
  }),

  faqPage: (faqs: Array<{ question: string; answer: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }),

  howTo: (title: string, steps: Array<{ name: string; text: string }>) => ({
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: title,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
    })),
  }),

  service: (service: {
    name: string;
    description: string;
    provider: string;
    areaServed: string;
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: service.provider,
    },
    areaServed: {
      '@type': 'Country',
      name: service.areaServed,
    },
  }),

  jobPosting: (job: {
    title: string;
    description: string;
    datePosted: string;
    hiringOrganization: string;
    jobLocation: string;
    baseSalary?: {
      currency: string;
      value: number;
    };
  }) => ({
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    datePosted: job.datePosted,
    hiringOrganization: {
      '@type': 'Organization',
      name: job.hiringOrganization,
    },
    jobLocation: {
      '@type': 'Place',
      name: job.jobLocation,
    },
    baseSalary: job.baseSalary
      ? {
          '@type': 'MonetaryAmount',
          currency: job.baseSalary.currency,
          value: {
            '@type': 'QuantitativeValue',
            value: job.baseSalary.value,
          },
        }
      : undefined,
  }),
};
