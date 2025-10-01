/**
 * SEO Utilities - Helper functions for SEO optimization
 */

/**
 * Generate SEO-friendly URL slug from text
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Generate meta description from content
 */
export function generateMetaDescription(
  content: string,
  maxLength = 160
): string {
  // Remove HTML tags
  const plainText = content.replace(/<[^>]*>/g, '');

  // Truncate and add ellipsis if needed
  if (plainText.length <= maxLength) {
    return plainText;
  }

  const truncated = plainText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > maxLength * 0.8
    ? truncated.substring(0, lastSpace) + '...'
    : truncated + '...';
}

/**
 * Extract keywords from content
 */
export function extractKeywords(content: string, maxKeywords = 10): string[] {
  // Remove HTML tags and convert to lowercase
  const plainText = content.replace(/<[^>]*>/g, '').toLowerCase();

  // Remove Turkish stop words
  const stopWords = new Set([
    've',
    'ile',
    'bir',
    'bu',
    'şu',
    'o',
    'da',
    'de',
    'ki',
    'mi',
    'mu',
    'mü',
    'için',
    'gibi',
    'kadar',
    'daha',
    'en',
    'çok',
    'az',
    'var',
    'yok',
    'olan',
    'the',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'a',
    'an',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'must',
    'can',
    'shall',
    'this',
    'that',
    'these',
    'those',
  ]);

  // Split into words and filter
  const words = plainText
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zğüşıöçA-ZĞÜŞIİÖÇ]/g, ''))
    .filter((word) => word.length > 2 && !stopWords.has(word));

  // Count word frequency
  const wordCount = new Map<string, number>();
  words.forEach((word) => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1);
  });

  // Sort by frequency and return top keywords
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxKeywords)
    .map(([word]) => word);
}

/**
 * Validate and clean URL
 */
export function validateUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.toString();
  } catch {
    return '';
  }
}

/**
 * Generate canonical URL
 */
export function generateCanonicalUrl(
  baseUrl: string,
  pathname: string
): string {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const cleanPathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${cleanBaseUrl}${cleanPathname}`;
}

/**
 * Generate Open Graph image URL
 */
export function generateOGImageUrl(
  baseUrl: string,
  title: string,
  type = 'default'
): string {
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const encodedTitle = encodeURIComponent(title);
  return `${cleanBaseUrl}/api/og?title=${encodedTitle}&type=${type}`;
}

/**
 * Calculate reading time
 */
export function calculateReadingTime(content: string): number {
  const plainText = content.replace(/<[^>]*>/g, '');
  const words = plainText.split(/\s+/).length;
  const wordsPerMinute = 200; // Average reading speed
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Generate schema markup for article
 */
export function generateArticleSchema(article: {
  title: string;
  description: string;
  author: string;
  publishedAt: string;
  updatedAt?: string;
  image?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    image: article.image,
    url: article.url,
    publisher: {
      '@type': 'Organization',
      name: 'MarifetBul',
      logo: {
        '@type': 'ImageObject',
        url: 'https://marifetbul.com/logo.png',
      },
    },
  };
}

/**
 * Generate breadcrumb schema
 */
export function generateBreadcrumbSchema(
  breadcrumbs: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  };
}

/**
 * Check if content is SEO optimized
 */
export function analyzeSEO(content: {
  title: string;
  description: string;
  content: string;
  keywords?: string[];
}): {
  score: number;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Title analysis
  if (!content.title) {
    issues.push('Başlık eksik');
    score -= 20;
  } else if (content.title.length < 30) {
    suggestions.push('Başlık çok kısa (minimum 30 karakter önerilir)');
    score -= 5;
  } else if (content.title.length > 60) {
    issues.push('Başlık çok uzun (maksimum 60 karakter)');
    score -= 10;
  }

  // Description analysis
  if (!content.description) {
    issues.push('Meta açıklama eksik');
    score -= 15;
  } else if (content.description.length < 120) {
    suggestions.push('Meta açıklama çok kısa (minimum 120 karakter önerilir)');
    score -= 5;
  } else if (content.description.length > 160) {
    issues.push('Meta açıklama çok uzun (maksimum 160 karakter)');
    score -= 10;
  }

  // Content analysis
  if (content.content.length < 300) {
    suggestions.push('İçerik çok kısa (minimum 300 kelime önerilir)');
    score -= 10;
  }

  // Keywords analysis
  if (!content.keywords || content.keywords.length === 0) {
    suggestions.push('Anahtar kelime ekleyin');
    score -= 5;
  }

  return {
    score: Math.max(0, score),
    issues,
    suggestions,
  };
}

/**
 * Generate sitemap entry
 */
export function generateSitemapEntry(
  url: string,
  lastModified?: string,
  changeFreq:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never' = 'weekly',
  priority = 0.5
) {
  return {
    url,
    lastModified: lastModified || new Date().toISOString(),
    changeFrequency: changeFreq,
    priority,
  };
}
