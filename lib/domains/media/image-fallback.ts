/**
 * Image fallback utility for handling placeholder images and broken image links
 * Provides local fallback when external services are unavailable
 */

import { logger } from '@/lib/shared/utils/logger';

export interface PlaceholderConfig {
  width?: number;
  height?: number;
  backgroundColor?: string;
  textColor?: string;
  text?: string;
  fontSize?: number;
}

/**
 * Generates a data URL for SVG placeholder image
 */
export function generatePlaceholderDataUrl({
  width = 800,
  height = 450,
  backgroundColor = '#f3f4f6',
  textColor = '#6b7280',
  text = 'Görsel',
  fontSize = 24,
}: PlaceholderConfig = {}): string {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <text x="50%" y="50%" font-family="system-ui, -apple-system, sans-serif" 
            font-size="${fontSize}" font-weight="500" fill="${textColor}" 
            text-anchor="middle" dy="0.3em">
        ${text}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}

/**
 * Color palette for different categories
 */
const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  'web-development': { bg: '#3b82f6', text: '#ffffff' },
  'logo-design': { bg: '#f59e0b', text: '#ffffff' },
  'content-writing': { bg: '#8b5cf6', text: '#ffffff' },
  marketing: { bg: '#ef4444', text: '#ffffff' },
  'seo-optimization': { bg: '#10b981', text: '#ffffff' },
  'mobile-app': { bg: '#6366f1', text: '#ffffff' },
  'content-management': { bg: '#06b6d4', text: '#ffffff' },
  'data-analysis': { bg: '#059669', text: '#ffffff' },
  default: { bg: '#f3f4f6', text: '#6b7280' },
};

/**
 * Converts via.placeholder.com URL to local placeholder data URL
 */
export function convertPlaceholderUrl(url: string): string {
  try {
    const urlObj = new URL(url);

    // Parse via.placeholder.com URL format
    if (urlObj.hostname === 'via.placeholder.com') {
      const pathMatch = urlObj.pathname.match(
        /^\/(\d+)x(\d+)(?:\/([^\/]+))?(?:\/([^\/]+))?$/
      );
      const searchParams = urlObj.searchParams;

      if (pathMatch) {
        const [, width, height, bgColor, textColor] = pathMatch;
        const text = searchParams.get('text') || 'Görsel';

        const config: PlaceholderConfig = {
          width: parseInt(width, 10),
          height: parseInt(height, 10),
          backgroundColor: bgColor ? `#${bgColor}` : '#f3f4f6',
          textColor: textColor ? `#${textColor}` : '#6b7280',
          text: decodeURIComponent(text.replace(/\+/g, ' ')),
          fontSize: Math.max(12, Math.min(48, parseInt(width, 10) / 20)),
        };

        return generatePlaceholderDataUrl(config);
      }
    }

    // Return original URL if not a placeholder
    return url;
  } catch (error) {
    logger.warn('Failed to convert placeholder URL', {
      error: error instanceof Error ? error.message : String(error),
    });
    return generatePlaceholderDataUrl({ text: 'Görsel Yüklenemedi' });
  }
}

/**
 * Generates category-specific placeholder image
 */
export function generateCategoryPlaceholder(
  category: string,
  title: string,
  config: Partial<PlaceholderConfig> = {}
): string {
  const categoryKey = category.toLowerCase().replace(/\s+/g, '-');
  const colors = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.default;

  return generatePlaceholderDataUrl({
    width: 800,
    height: 450,
    backgroundColor: colors.bg,
    textColor: colors.text,
    text: title.length > 30 ? title.substring(0, 30) + '...' : title,
    fontSize: 18,
    ...config,
  });
}

/**
 * Image error handler for React components
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement>,
  fallbackConfig?: PlaceholderConfig
): void {
  const img = event.currentTarget;
  const originalSrc = img.src;

  // Avoid infinite loop by checking if already using fallback
  if (originalSrc.startsWith('data:image/svg+xml')) {
    return;
  }

  // Try to extract text from original URL or use alt text
  let fallbackText = img.alt || 'Görsel';

  // Extract text from via.placeholder.com URLs
  try {
    const url = new URL(originalSrc);
    if (url.hostname === 'via.placeholder.com') {
      const textParam = url.searchParams.get('text');
      if (textParam) {
        fallbackText = decodeURIComponent(textParam.replace(/\+/g, ' '));
      }
    }
  } catch {
    // Ignore URL parsing errors
  }

  // Generate fallback image
  img.src = generatePlaceholderDataUrl({
    text: fallbackText,
    ...fallbackConfig,
  });

  // Add error class for styling
  img.classList.add('image-fallback');
}

/**
 * Custom hook for image fallback handling
 */
export function useImageFallback(fallbackConfig?: PlaceholderConfig) {
  return (event: React.SyntheticEvent<HTMLImageElement>) => {
    handleImageError(event, fallbackConfig);
  };
}

/**
 * Preload images with fallback support
 */
export function preloadImage(src: string): Promise<string> {
  return new Promise((resolve) => {
    // If it's already a data URL, resolve immediately
    if (src.startsWith('data:')) {
      resolve(src);
      return;
    }

    const img = new Image();

    img.onload = () => {
      resolve(src);
    };

    img.onerror = () => {
      // Try to convert via.placeholder.com URLs
      if (src.includes('via.placeholder.com')) {
        const fallbackSrc = convertPlaceholderUrl(src);
        resolve(fallbackSrc);
      } else {
        // Generate generic fallback
        const fallbackSrc = generatePlaceholderDataUrl({
          text: 'Görsel Yüklenemedi',
        });
        resolve(fallbackSrc);
      }
    };

    // Set timeout for network issues
    setTimeout(() => {
      if (!img.complete) {
        img.onerror = null;
        img.onload = null;
        const fallbackSrc = src.includes('via.placeholder.com')
          ? convertPlaceholderUrl(src)
          : generatePlaceholderDataUrl({ text: 'Zaman Aşımı' });
        resolve(fallbackSrc);
      }
    }, 5000);

    img.src = src;
  });
}

/**
 * Batch convert placeholder URLs in array of objects
 */
export function convertPlaceholderUrls<T extends Record<string, unknown>>(
  items: T[],
  imageFields: string[] = ['images', 'image', 'avatar', 'thumbnail']
): T[] {
  return items.map((item) => {
    const updatedItem = JSON.parse(JSON.stringify(item)) as T;

    imageFields.forEach((field) => {
      const fieldValue = (updatedItem as Record<string, unknown>)[field];
      if (fieldValue) {
        if (Array.isArray(fieldValue)) {
          (updatedItem as Record<string, unknown>)[field] = fieldValue.map(
            (url: unknown) =>
              typeof url === 'string' ? convertPlaceholderUrl(url) : url
          );
        } else if (typeof fieldValue === 'string') {
          (updatedItem as Record<string, unknown>)[field] =
            convertPlaceholderUrl(fieldValue);
        }
      }
    });

    return updatedItem;
  });
}

/**
 * Default CSS styles for image fallback
 */
export const imageFallbackStyles = `
  .image-fallback {
    filter: opacity(0.8);
    background-color: #f9fafb;
    border: 1px solid #e5e7eb;
  }
  
  .image-fallback:hover {
    filter: opacity(1);
  }
`;
