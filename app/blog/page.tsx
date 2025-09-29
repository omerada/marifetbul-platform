import { Metadata } from 'next';
import Link from 'next/link';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/Card';
import type { BlogPost } from '@/types/blog';

export const metadata: Metadata = {
  title: 'Blog - MarifetBul',
  description:
    'Freelance dünyası, teknoloji ve iş hayatı hakkında güncel yazılar.',
};

async function getPosts() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/blog`,
    { cache: 'no-store' }
  );
  if (!res.ok) return { posts: [], total: 0 };
  return res.json();
}

export default async function BlogPage() {
  const { posts, total } = await getPosts();

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
    </AppLayout>
  );
}
