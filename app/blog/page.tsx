import { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import { UnifiedErrorBoundary as BlogErrorBoundary } from '@/components/ui';
import { blogApi, type BlogPostSummary } from '@/lib/api/blog';

// Dynamic rendering işaretleme
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Blog - MarifetBul',
  description:
    'Freelance dünyası, teknoloji ve iş hayatı hakkında güncel yazılar.',
};

async function getPosts() {
  try {
    // Gerçek API'ye bağlan
    const response = await blogApi.getPublishedPosts({
      page: 0,
      size: 10,
      sort: 'publishedAt,desc',
    });

    console.log('Blog posts loaded:', response.content.length);
    return {
      posts: response.content,
      total: response.totalElements,
      page: response.number,
      pageSize: response.size,
    };
  } catch (error) {
    console.error('Blog fetch error:', error);
    // Return empty result on error
    return { posts: [], total: 0, page: 0, pageSize: 10 };
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
            posts.map((post: BlogPostSummary) => (
              <Card key={post.id} className="p-8">
                <div className="mb-2 text-sm text-blue-600">
                  {post.category?.name || 'Genel'}
                </div>
                <h2 className="mb-3 text-2xl font-bold text-gray-900">
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                <p className="mb-4 text-gray-600">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString('tr-TR')
                      : new Date(post.createdAt).toLocaleDateString('tr-TR')}
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
