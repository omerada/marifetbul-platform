import Link from 'next/link';
import type { BlogCategory } from '@/types/blog';
import { createApiUrl } from '@/lib/api-utils';

// Dynamic rendering işaretleme
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getCategories(): Promise<BlogCategory[]> {
  try {
    const res = await fetch(createApiUrl('/blog/categories'), {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return [];
    }

    return await res.json();
  } catch {
    return [];
  }
}

export default async function BlogCategoriesPage() {
  const categories = await getCategories();
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Blog Kategorileri</h1>
      <ul className="space-y-4">
        {categories.map((cat: BlogCategory) => (
          <li key={cat.id}>
            <Link
              href={`/blog?category=${cat.slug}`}
              className="text-lg text-blue-600 hover:underline"
            >
              {cat.name}
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
