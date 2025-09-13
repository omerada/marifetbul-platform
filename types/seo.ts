export interface SEOMetaTags {
  title: string;
  description: string;
  keywords: string[];
  openGraph: {
    title: string;
    description: string;
    image: string;
    url: string;
    type: string;
    siteName?: string;
  };
  twitterCard: {
    card: string;
    title: string;
    description: string;
    image: string;
    site?: string;
    creator?: string;
  };
  structuredData?: Record<string, unknown>;
  canonical?: string;
  robots?: string;
}

export interface SEOMetaResponse {
  data: SEOMetaTags;
}

export interface SEOPageData {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  structuredData?: Record<string, unknown>;
  canonical?: string;
  robots?: string;
}

export interface SEOConfig {
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  defaultKeywords: string[];
  defaultOGImage: string;
  siteUrl: string;
  siteName: string;
  twitterHandle: string;
}

export interface SitemapEntry {
  url: string;
  lastModified: string;
  changeFrequency:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority: number;
}

export interface SEOAnalytics {
  pageViews: number;
  organicClicks: number;
  impressions: number;
  averagePosition: number;
  clickThroughRate: number;
}
