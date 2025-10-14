import Link from 'next/link';
import type { BlogPost } from '@/types/blog';
import { createApiUrl } from '@/lib/api-utils';

// Dynamic rendering işaretleme
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function searchPosts(
  query: string
): Promise<{ posts: BlogPost[]; total: number }> {
  try {
    const res = await fetch(
      createApiUrl(`/blog?search=${encodeURIComponent(query)}`),
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!res.ok) {
      return { posts: [], total: 0 };
    }

    return await res.json();
  } catch (error) {
    return { posts: [], total: 0 };
  }
}

export default async function BlogSearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const q = searchParams.q || '';
  const { posts } = q ? await searchPosts(q) : { posts: [] };
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Blog Arama</h1>
      <form method="get" className="mb-8 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Yazı ara..."
          className="w-full rounded border px-3 py-2"
        />
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Ara
        </button>
      </form>
      {q && posts.length === 0 && (
        <div className="text-gray-500">Sonuç bulunamadı.</div>
      )}
      <ul className="space-y-6">
        {posts.map((post: BlogPost) => (
          <li key={post.id}>
            <Link
              href={`/blog/${post.slug}`}
              className="text-lg font-semibold text-blue-700 hover:underline"
            >
              {post.title}
            </Link>
            <div className="text-sm text-gray-500">{post.excerpt}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
