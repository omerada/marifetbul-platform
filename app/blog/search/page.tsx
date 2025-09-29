import Link from 'next/link';

async function searchPosts(query: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/blog?search=${encodeURIComponent(query)}`,
    { cache: 'no-store' }
  );
  if (!res.ok) return { posts: [] };
  return res.json();
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
        {posts.map((post: any) => (
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
