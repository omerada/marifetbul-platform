import { MetadataRoute } from 'next';
import { sitemapGenerator } from '@/lib/seo/sitemap-generator';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return await sitemapGenerator.generateBlogSitemap();
}
