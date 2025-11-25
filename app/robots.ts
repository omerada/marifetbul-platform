import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://marifetbul.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/*',
          '/profile/edit',
          '/messages/*',
          '/support/tickets/*',
          '/support/ticket/*',
          '/_next/',
          '/private/',
          '/temp/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/*',
          '/profile/edit',
          '/messages/*',
          '/support/tickets/*',
          '/support/ticket/*',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/*',
          '/profile/edit',
          '/messages/*',
          '/support/tickets/*',
          '/support/ticket/*',
        ],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      `${baseUrl}/blog/sitemap.xml`,
      `${baseUrl}/marketplace/sitemap.xml`,
    ],
  };
}
