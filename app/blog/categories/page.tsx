import Link from 'next/link';

async function getCategories() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/blog/categories`,
    { cache: 'no-store' }
  );
  if (!res.ok) return [];
  return res.json();
}

export default async function BlogCategoriesPage() {
  const categories = await getCategories();
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Blog Kategorileri</h1>
      <ul className="space-y-4">
        {categories.map((cat: any) => (
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
