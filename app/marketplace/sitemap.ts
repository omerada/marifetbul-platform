import { MetadataRoute } from 'next';
import { sitemapGenerator } from '@/lib/seo/sitemap-generator';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [jobsSitemap, packagesSitemap, categoriesSitemap] = await Promise.all([
    sitemapGenerator.generateJobsSitemap(),
    sitemapGenerator.generatePackagesSitemap(),
    sitemapGenerator.generateCategoriesSitemap(),
  ]);

  return [...jobsSitemap, ...packagesSitemap, ...categoriesSitemap];
}
