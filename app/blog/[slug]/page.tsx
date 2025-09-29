import { notFound } from 'next/navigation';
import { BlogPost } from '@/types/blog';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { createApiUrl } from '@/lib/api-utils';

// Dynamic rendering işaretleme
export const dynamicParams = true;
export const revalidate = 0;

const BlogComments = dynamic(() => import('./comments'), { ssr: false });

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const res = await fetch(createApiUrl(`/blog/${slug}`), {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      console.error('Blog post API error:', res.status, res.statusText);
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('Blog post fetch error:', error);
    return null;
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  if (!post) return notFound();

  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <article>
        <h1 className="mb-4 text-4xl font-bold">{post.title}</h1>
        <div className="mb-2 text-sm text-gray-500">
          <span>
            {post.category && typeof post.category === 'object'
              ? post.category.name
              : post.category}
          </span>
          {' • '}
          <span>{new Date(post.publishedAt).toLocaleDateString('tr-TR')}</span>
        </div>
        {post.coverImage && (
          <Image
            src={post.coverImage}
            alt={post.title}
            width={800}
            height={400}
            className="mb-6 w-full rounded-lg object-cover"
          />
        )}
        <div
          className="prose mb-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        <div className="mb-8 text-xs text-gray-600">
          Yazar:{' '}
          {typeof post.author === 'object' ? post.author.name : post.author}
        </div>
        <BlogComments postId={post.id} />
      </article>
    </main>
  );
}
