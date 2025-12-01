import { MetadataRoute } from 'next';
import { sitemapGenerator } from '@/lib/seo/sitemap-generator';

// Dynamic sitemap - requires runtime API calls
export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return await sitemapGenerator.generateBlogSitemap();
}
