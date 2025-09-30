import { MetadataRoute } from 'next';
import { SitemapEntry } from '@/types/shared/seo';

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
      // In production, this would fetch from your database
      // For now, return empty array or mock data
      const blogPosts = await this.fetchBlogPosts();

      return blogPosts.map((post) => ({
        url: `${this.baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }));
    } catch (error) {
      console.error('Error generating blog sitemap:', error);
      return [];
    }
  }

  /**
   * Generate sitemap entries for job listings
   */
  async generateJobsSitemap(): Promise<MetadataRoute.Sitemap> {
    try {
      const jobs = await this.fetchActiveJobs();

      return jobs.map((job) => ({
        url: `${this.baseUrl}/marketplace/jobs/${job.id}`,
        lastModified: new Date(job.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    } catch (error) {
      console.error('Error generating jobs sitemap:', error);
      return [];
    }
  }

  /**
   * Generate sitemap entries for service packages
   */
  async generatePackagesSitemap(): Promise<MetadataRoute.Sitemap> {
    try {
      const packages = await this.fetchActivePackages();

      return packages.map((pkg) => ({
        url: `${this.baseUrl}/marketplace/packages/${pkg.id}`,
        lastModified: new Date(pkg.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }));
    } catch (error) {
      console.error('Error generating packages sitemap:', error);
      return [];
    }
  }

  /**
   * Generate sitemap entries for user profiles (public)
   */
  async generateProfilesSitemap(): Promise<MetadataRoute.Sitemap> {
    try {
      const publicProfiles = await this.fetchPublicProfiles();

      return publicProfiles.map((profile) => ({
        url: `${this.baseUrl}/profile/${profile.id}`,
        lastModified: new Date(profile.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    } catch (error) {
      console.error('Error generating profiles sitemap:', error);
      return [];
    }
  }

  /**
   * Generate sitemap entries for categories
   */
  async generateCategoriesSitemap(): Promise<MetadataRoute.Sitemap> {
    try {
      const categories = await this.fetchCategories();

      return categories.map((category) => ({
        url: `${this.baseUrl}/marketplace/categories/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }));
    } catch (error) {
      console.error('Error generating categories sitemap:', error);
      return [];
    }
  }

  /**
   * Generate sitemap entries for help articles
   */
  async generateHelpSitemap(): Promise<MetadataRoute.Sitemap> {
    try {
      const helpArticles = await this.fetchHelpArticles();

      return helpArticles.map((article) => ({
        url: `${this.baseUrl}/support/help/articles/${article.slug}`,
        lastModified: new Date(article.updatedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }));
    } catch (error) {
      console.error('Error generating help sitemap:', error);
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

  // Mock data fetchers - Replace with actual database calls
  private async fetchBlogPosts() {
    // TODO: Implement actual database fetch
    return [
      {
        slug: 'freelancing-tips-2025',
        updatedAt: '2024-12-01T00:00:00Z',
      },
      {
        slug: 'how-to-price-your-services',
        updatedAt: '2024-11-28T00:00:00Z',
      },
    ];
  }

  private async fetchActiveJobs() {
    // TODO: Implement actual database fetch
    return [
      {
        id: 'job-1',
        updatedAt: '2024-12-01T00:00:00Z',
      },
    ];
  }

  private async fetchActivePackages() {
    // TODO: Implement actual database fetch
    return [
      {
        id: 'package-1',
        updatedAt: '2024-12-01T00:00:00Z',
      },
    ];
  }

  private async fetchPublicProfiles() {
    // TODO: Implement actual database fetch
    return [
      {
        id: 'user-1',
        updatedAt: '2024-12-01T00:00:00Z',
      },
    ];
  }

  private async fetchCategories() {
    // TODO: Implement actual database fetch
    return [
      {
        slug: 'web-development',
      },
      {
        slug: 'graphic-design',
      },
      {
        slug: 'digital-marketing',
      },
    ];
  }

  private async fetchHelpArticles() {
    // TODO: Implement actual database fetch
    return [
      {
        slug: 'getting-started',
        updatedAt: '2024-12-01T00:00:00Z',
      },
      {
        slug: 'payment-methods',
        updatedAt: '2024-11-15T00:00:00Z',
      },
    ];
  }
}

export const sitemapGenerator = new SitemapGenerator();
