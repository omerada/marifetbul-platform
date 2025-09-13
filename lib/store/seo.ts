import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { SEOMetaTags, SEOPageData, SEOConfig } from '@/types/seo';

interface SEOStore {
  // State
  metaTags: SEOMetaTags | null;
  isLoading: boolean;
  error: string | null;
  config: SEOConfig;
  currentPageData: SEOPageData | null;

  // Actions
  fetchMetaTags: (url: string) => Promise<void>;
  updateMetaTags: (tags: Partial<SEOMetaTags>) => void;
  setPageData: (pageData: SEOPageData) => void;
  generateMetaTags: (pageData: SEOPageData) => SEOMetaTags;
  clearError: () => void;
  updateConfig: (config: Partial<SEOConfig>) => void;
}

const defaultConfig: SEOConfig = {
  defaultTitle: 'Marifet Bul | Freelancer ve İş Platformu',
  titleTemplate: '%s | Marifet Bul',
  defaultDescription:
    "Türkiye'nin en büyük freelancer platformunda kaliteli hizmet sağlayıcıları bulun ve projelerinizi hayata geçirin.",
  defaultKeywords: [
    'freelancer',
    'iş',
    'proje',
    'hizmet',
    'uzaktan çalışma',
    'türkiye',
  ],
  defaultOGImage: '/images/og-default.jpg',
  siteUrl: 'https://marifetbul.com',
  siteName: 'Marifet Bul',
  twitterHandle: '@marifetbul',
};

export const useSEOStore = create<SEOStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      metaTags: null,
      isLoading: false,
      error: null,
      config: defaultConfig,
      currentPageData: null,

      // Actions
      fetchMetaTags: async (url: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fetch(
            `/api/v1/seo/meta?url=${encodeURIComponent(url)}`
          );
          if (!response.ok) throw new Error('Failed to fetch meta tags');

          const data = await response.json();
          set({ metaTags: data.data, isLoading: false });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      updateMetaTags: (tags: Partial<SEOMetaTags>) => {
        const currentTags = get().metaTags;
        if (currentTags) {
          set({ metaTags: { ...currentTags, ...tags } });
        }
      },

      setPageData: (pageData: SEOPageData) => {
        const metaTags = get().generateMetaTags(pageData);
        set({ currentPageData: pageData, metaTags });
      },

      generateMetaTags: (pageData: SEOPageData): SEOMetaTags => {
        const { config } = get();

        const title = pageData.title
          ? config.titleTemplate.replace('%s', pageData.title)
          : config.defaultTitle;

        const description = pageData.description || config.defaultDescription;
        const keywords = pageData.keywords || config.defaultKeywords;
        const ogImage = pageData.ogImage || config.defaultOGImage;
        const canonical = pageData.canonical || '';

        return {
          title,
          description,
          keywords,
          canonical,
          robots: pageData.robots || 'index,follow',
          openGraph: {
            title,
            description,
            image: ogImage.startsWith('http')
              ? ogImage
              : `${config.siteUrl}${ogImage}`,
            url: canonical || config.siteUrl,
            type: 'website',
            siteName: config.siteName,
          },
          twitterCard: {
            card: 'summary_large_image',
            title,
            description,
            image: ogImage.startsWith('http')
              ? ogImage
              : `${config.siteUrl}${ogImage}`,
            site: config.twitterHandle,
          },
          structuredData: pageData.structuredData || {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: config.siteName,
            url: config.siteUrl,
          },
        };
      },

      clearError: () => set({ error: null }),

      updateConfig: (newConfig: Partial<SEOConfig>) => {
        set({ config: { ...get().config, ...newConfig } });
      },
    }),
    {
      name: 'seo-store',
    }
  )
);
