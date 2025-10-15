/**
 * Sitemap Type Definitions
 * Eliminates 'any' type usage in sitemap-generator.ts
 */

export interface BlogPost {
  slug: string;
  updatedAt: string;
  createdAt: string;
  title?: string;
  status?: string;
}

export interface Job {
  id: string;
  updatedAt: string;
  createdAt: string;
  modifiedAt?: string;
  title?: string;
  status?: string;
}

export interface Package {
  id: string;
  updatedAt: string;
  createdAt: string;
  modifiedAt?: string;
  title?: string;
  status?: string;
}

export interface PublicProfile {
  id: string;
  updatedAt: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface Category {
  id?: string;
  slug: string;
  name: string;
  updatedAt?: string;
}

export interface HelpArticle {
  slug: string;
  updatedAt: string;
  createdAt: string;
  modifiedAt?: string;
  title?: string;
}

export interface SitemapFetchResponse<T> {
  success: boolean;
  data: T[];
}
