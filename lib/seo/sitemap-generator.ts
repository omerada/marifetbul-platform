import { MetadataRoute } from 'next';
import logger from '@/lib/infrastructure/monitoring/logger';
import type {
  BlogPost,
  Job,
  Package,
  PublicProfile,
  Category,
  HelpArticle,
} from '@/types/seo/sitemap';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://marifetbul.com';

/**
 * Dynamic sitemap generator for content-based pages
 */
export class SitemapGenerator {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || BASE_URL;
  }

  /**
   * Generate sitemap entries for blog posts
   */
  async generateBlogSitemap(): Promise<MetadataRoute.Sitemap> {
    try {
      const blogPosts = await this.fetchBlogPosts();

      return blogPosts.map((post: BlogPost) => ({
        url: `${this.baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    } catch (error) {
      logger.error(
        'Error generating blog sitemap',
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }
  }

  /**
   * Generate sitemap entries for job listings
   */
  async generateJobsSitemap(): Promise<MetadataRoute.Sitemap> {
    try {
      const jobs = await this.fetchActiveJobs();

      return jobs.map((job: Job) => ({
        url: `${this.baseUrl}/marketplace/jobs/${job.id}`,
        lastModified: new Date(job.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    } catch (error) {
      logger.error(
        'Error generating jobs sitemap',
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }
  }

  /**
   * Generate sitemap entries for service packages
   */
  async generatePackagesSitemap(): Promise<MetadataRoute.Sitemap> {
    try {
      const packages = await this.fetchActivePackages();

      return packages.map((pkg: Package) => ({
        url: `${this.baseUrl}/marketplace/packages/${pkg.id}`,
        lastModified: new Date(pkg.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    } catch (error) {
      logger.error(
        'Error generating packages sitemap',
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }
  }

  /**
   * Generate sitemap entries for user profiles (public)
   */
  async generateProfilesSitemap(): Promise<MetadataRoute.Sitemap> {
    try {
      const publicProfiles = await this.fetchPublicProfiles();

      return publicProfiles.map((profile: PublicProfile) => ({
        url: `${this.baseUrl}/profile/${profile.id}`,
        lastModified: new Date(profile.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    } catch (error) {
      logger.error(
        'Error generating profiles sitemap',
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }
  }

  /**
   * Generate sitemap entries for categories
   */
  async generateCategoriesSitemap(): Promise<MetadataRoute.Sitemap> {
    try {
      const categories = await this.fetchCategories();

      return categories.map((category: Category) => ({
        url: `${this.baseUrl}/marketplace/categories/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
    } catch (error) {
      logger.error(
        'Error generating categories sitemap',
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }
  }

  /**
   * Generate sitemap entries for help articles
   */
  async generateHelpSitemap(): Promise<MetadataRoute.Sitemap> {
    try {
      const helpArticles = await this.fetchHelpArticles();

      return helpArticles.map((article: HelpArticle) => ({
        url: `${this.baseUrl}/support/help/articles/${article.slug}`,
        lastModified: new Date(article.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    } catch (error) {
      logger.error(
        'Error generating help sitemap',
        error instanceof Error ? error : new Error(String(error))
      );
      return [];
    }
  }

  /**
   * Combine all dynamic sitemaps
   */
  async generateCompleteSitemap(): Promise<MetadataRoute.Sitemap> {
    const [
      blogSitemap,
      jobsSitemap,
      packagesSitemap,
      profilesSitemap,
      categoriesSitemap,
      helpSitemap,
    ] = await Promise.all([
      this.generateBlogSitemap(),
      this.generateJobsSitemap(),
      this.generatePackagesSitemap(),
      this.generateProfilesSitemap(),
      this.generateCategoriesSitemap(),
      this.generateHelpSitemap(),
    ]);

    return [
      ...blogSitemap,
      ...jobsSitemap,
      ...packagesSitemap,
      ...profilesSitemap,
      ...categoriesSitemap,
      ...helpSitemap,
    ];
  }

  // Production-ready data fetchers - call backend API endpoints
  // If an endpoint is not implemented yet, functions will safely return empty array
  private async fetchBlogPosts() {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || `${this.baseUrl}/api/v1`;
      const res = await fetch(
        `${base}/blog/posts?status=published&limit=1000`,
        { cache: 'no-store' }
      );
      if (!res.ok) return [];
      const json = await res.json();
      // Expecting { success: boolean, data: [...] } or raw array
      const items = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
          ? json
          : [];
      return items.map(
        (p: BlogPost): BlogPost => ({
          slug: p.slug,
          updatedAt: p.updatedAt || p.createdAt,
          createdAt: p.createdAt,
        })
      );
    } catch (e) {
      logger.error(
        'fetchBlogPosts error',
        e instanceof Error ? e : new Error(String(e))
      );
      return [];
    }
  }

  private async fetchActiveJobs() {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || `${this.baseUrl}/api/v1`;
      const res = await fetch(
        `${base}/marketplace/jobs?status=active&limit=1000`,
        { cache: 'no-store' }
      );
      if (!res.ok) return [];
      const json = await res.json();
      const items = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
          ? json
          : [];
      return items.map(
        (j: Job): Job => ({
          id: j.id,
          updatedAt: j.updatedAt || j.modifiedAt || j.createdAt,
          createdAt: j.createdAt || j.updatedAt,
        })
      );
    } catch (e) {
      logger.error(
        'fetchActiveJobs error',
        e instanceof Error ? e : new Error(String(e))
      );
      return [];
    }
  }

  private async fetchActivePackages() {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || `${this.baseUrl}/api/v1`;
      const res = await fetch(
        `${base}/marketplace/packages?status=active&limit=1000`,
        { cache: 'no-store' }
      );
      if (!res.ok) return [];
      const json = await res.json();
      const items = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
          ? json
          : [];
      return items.map(
        (p: Package): Package => ({
          id: p.id,
          updatedAt: p.updatedAt || p.modifiedAt || p.createdAt,
          createdAt: p.createdAt || p.updatedAt,
        })
      );
    } catch (e) {
      logger.error(
        'fetchActivePackages error',
        e instanceof Error ? e : new Error(String(e))
      );
      return [];
    }
  }

  private async fetchPublicProfiles() {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || `${this.baseUrl}/api/v1`;
      // Assumption: backend exposes a public users endpoint; if not, service will return empty list.
      const res = await fetch(`${base}/users/public?limit=1000`, {
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const json = await res.json();
      const items = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
          ? json
          : [];
      return items.map(
        (u: PublicProfile): PublicProfile => ({
          id: u.id,
          updatedAt: u.updatedAt,
        })
      );
    } catch (e) {
      logger.error(
        'fetchPublicProfiles error',
        e instanceof Error ? e : new Error(String(e))
      );
      return [];
    }
  }

  private async fetchCategories() {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || `${this.baseUrl}/api/v1`;
      const res = await fetch(`${base}/marketplace/categories`, {
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const json = await res.json();
      const items = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
          ? json
          : [];
      return items.map(
        (c: Category): Category => ({
          slug: c.slug || c.name || String(c.id),
          name: c.name,
        })
      );
    } catch (e) {
      logger.error(
        'fetchCategories error',
        e instanceof Error ? e : new Error(String(e))
      );
      return [];
    }
  }

  private async fetchHelpArticles() {
    try {
      const base = process.env.NEXT_PUBLIC_API_URL || `${this.baseUrl}/api/v1`;
      // Try common help endpoints; fall back to empty list
      const res = await fetch(`${base}/support/help/articles?limit=1000`, {
        cache: 'no-store',
      });
      if (!res.ok) return [];
      const json = await res.json();
      const items = Array.isArray(json?.data)
        ? json.data
        : Array.isArray(json)
          ? json
          : [];
      return items.map(
        (a: HelpArticle): HelpArticle => ({
          slug: a.slug,
          updatedAt: a.updatedAt || a.modifiedAt || a.createdAt,
          createdAt: a.createdAt || a.updatedAt,
        })
      );
    } catch (e) {
      logger.error(
        'fetchHelpArticles error',
        e instanceof Error ? e : new Error(String(e))
      );
      return [];
    }
  }
}

export const sitemapGenerator = new SitemapGenerator();
