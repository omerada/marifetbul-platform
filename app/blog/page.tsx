import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import type { BlogPost } from '@/types/blog';
import { UnifiedErrorBoundary as BlogErrorBoundary } from '@/components/ui';

// Dynamic rendering işaretleme
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Blog - MarifetBul',
  description:
    'Freelance dünyası, teknoloji ve iş hayatı hakkında güncel yazılar.',
};

// TODO: Replace with real backend API call
// Suggested endpoint: GET /api/v1/blog/posts?page=1&limit=10
// Backend should return paginated BlogPost list with categories and authors
// Mock blog data - REMOVE THIS AFTER BACKEND INTEGRATION
const mockBlogPosts = [
  {
    id: '1',
    slug: 'freelancer-olarak-ilk-adimlariniz',
    title: 'Freelancer Olarak İlk Adımlarınız',
    excerpt:
      'Freelance kariyerinize başlarken dikkat etmeniz gereken önemli noktalar.',
    content: 'Blog içeriği...',
    category: { id: '1', name: 'Kariyer', slug: 'kariyer' },
    author: { id: '1', name: 'MarifetBul Editörü' },
    publishedAt: '2025-09-12T10:00:00Z',
    tags: ['freelance', 'kariyer', 'başlangıç'],
    views: 120,
    featured: true,
  },
  {
    id: '2',
    slug: '2025-web-tasarim-trendleri',
    title: '2025 Web Tasarım Trendleri',
    excerpt: 'Bu yıl öne çıkan web tasarım trendleri ve uygulama örnekleri.',
    content: 'Blog içeriği...',
    category: { id: '2', name: 'Tasarım', slug: 'tasarim' },
    author: { id: '2', name: 'Tasarım Uzmanı' },
    publishedAt: '2025-09-10T09:00:00Z',
    tags: ['tasarım', 'trend', 'web'],
    views: 80,
    featured: false,
  },
  {
    id: '3',
    slug: 'uzaktan-calisma-ipuclari',
    title: 'Uzaktan Çalışma İpuçları',
    excerpt: 'Evden çalışırken verimliliğinizi artıracak pratik öneriler.',
    content: 'Blog içeriği...',
    category: { id: '3', name: 'Productivity', slug: 'productivity' },
    author: { id: '3', name: 'Productivity Uzmanı' },
    publishedAt: '2025-09-08T08:00:00Z',
    tags: ['uzaktan çalışma', 'verimlilik', 'home office'],
    views: 65,
    featured: false,
  },
];

async function getPosts() {
  try {
    // Geliştirme aşamasında mock data kullan
    // Production'da bu kısım gerçek API çağrısı ile değiştirilecek
    await new Promise((resolve) => setTimeout(resolve, 100)); // Simulated loading

    console.log('Blog posts loaded:', mockBlogPosts.length);
    return {
      posts: mockBlogPosts,
      total: mockBlogPosts.length,
      page: 1,
      pageSize: 10,
    };
  } catch (error) {
    console.error('Blog fetch error:', error);
    return { posts: [], total: 0, page: 1, pageSize: 10 };
  }
}

function BlogLoading() {
  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl space-y-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse p-8">
              <div className="mb-2 h-4 w-20 rounded bg-gray-200"></div>
              <div className="mb-3 h-6 rounded bg-gray-200"></div>
              <div className="mb-4 h-4 rounded bg-gray-200"></div>
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 rounded bg-gray-200"></div>
                <div className="h-4 w-32 rounded bg-gray-200"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

async function BlogContent() {
  const { posts, total } = await getPosts();

  return (
    <div className="py-16">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl space-y-8">
          {posts && posts.length > 0 ? (
            posts.map((post: BlogPost) => (
              <Card key={post.id} className="p-8">
                <div className="mb-2 text-sm text-blue-600">
                  {typeof post.category === 'object'
                    ? post.category.name
                    : post.category}
                </div>
                <h2 className="mb-3 text-2xl font-bold text-gray-900">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="mb-4 text-gray-600">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {new Date(post.publishedAt).toLocaleDateString('tr-TR')}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Devamını Oku →
                  </Link>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center text-gray-500">
              Henüz blog yazısı yok.
            </div>
          )}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">Toplam içerik: {total}</p>
        </div>
      </div>
    </div>
  );
}

export default function BlogPage() {
  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Blog
            </h1>
            <p className="mb-12 text-xl text-gray-600">
              Freelance dünyası, teknoloji ve iş hayatı hakkında güncel yazılar.
            </p>
          </div>
        </div>
      </div>

      <BlogErrorBoundary>
        <Suspense fallback={<BlogLoading />}>
          <BlogContent />
        </Suspense>
      </BlogErrorBoundary>
    </AppLayout>
  );
}
