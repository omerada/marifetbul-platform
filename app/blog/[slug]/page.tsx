import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { AppLayout } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  ChevronRight,
  Calendar,
  User,
  Eye,
  Share2,
  ArrowLeft,
  Clock,
  Tag,
  Heart,
} from 'lucide-react';
import { type BlogPost } from '@/lib/api/blog';

// Dynamic rendering
export const dynamicParams = true;
export const revalidate = 60;

const BlogComments = dynamic(() => import('./comments'), { ssr: false });

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/blog/posts/${slug}`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.data as BlogPost;
  } catch {
    return null;
  }
}

async function getRelatedPosts(currentPost: BlogPost): Promise<BlogPost[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/blog/posts?categoryId=${currentPost.category?.id}&limit=3`,
      {
        next: { revalidate: 300 },
      }
    );

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return (data.data?.content || [])
      .filter((post: BlogPost) => post.id !== currentPost.id)
      .slice(0, 3);
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: 'Blog Yazısı Bulunamadı',
      description: 'Aradığınız blog yazısı bulunamadı.',
    };
  }

  return {
    title: `${post.title} - MarifetBul Blog`,
    description: post.excerpt,
    keywords: post.tags?.map((tag) => tag.name).join(', '),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.fullName],
      images: post.coverImageUrl ? [post.coverImageUrl] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.coverImageUrl ? [post.coverImageUrl] : [],
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  if (!post) return notFound();

  const relatedPosts = await getRelatedPosts(post);

  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-blue-50 to-white">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 pt-6">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="transition-colors hover:text-blue-600">
              Ana Sayfa
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href="/blog"
              className="transition-colors hover:text-blue-600"
            >
              Blog
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-gray-900">{post.title}</span>
          </nav>
        </div>

        {/* Hero Section */}
        <div className="container mx-auto px-4 py-8">
          <div className="mx-auto max-w-4xl">
            {/* Back Button */}
            <Link
              href="/blog"
              className="group mb-6 inline-flex items-center gap-2 text-blue-600 transition-colors hover:text-blue-700"
            >
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              Blog&apos;a Dön
            </Link>

            {/* Category Badge */}
            {post.category && (
              <div className="mb-4">
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  <Tag className="mr-1 h-3 w-3" />
                  {post.category.name}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="mb-6 text-4xl leading-tight font-bold text-gray-900 md:text-5xl">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="mb-8 flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                {post.author.avatarUrl ? (
                  <Image
                    src={post.author.avatarUrl}
                    alt={post.author.fullName}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <span className="font-medium">{post.author.fullName}</span>
              </div>

              {post.publishedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{post.readingTime} dk okuma</span>
              </div>

              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>
                  {post.viewCount.toLocaleString('tr-TR')} görüntüleme
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mb-8 flex items-center gap-4">
              <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 transition-colors hover:bg-gray-50">
                <Heart className="h-4 w-4" />
                Beğen
              </button>
              <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 transition-colors hover:bg-gray-50">
                <Share2 className="h-4 w-4" />
                Paylaş
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
              {/* Article Content */}
              <article className="lg:col-span-3">
                <Card className="p-0">
                  {/* Cover Image */}
                  {post.coverImageUrl && (
                    <div className="relative h-64 overflow-hidden rounded-t-lg md:h-80">
                      <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                      />
                    </div>
                  )}

                  {/* Article Body */}
                  <CardContent className="p-8">
                    <div
                      className="prose prose-lg prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700 max-w-none"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="mt-8 border-t border-gray-200 pt-8">
                        <h3 className="mb-3 text-sm font-medium text-gray-900">
                          Etiketler
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="cursor-pointer rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-200"
                            >
                              #{tag.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Author Info */}
                    <div className="mt-8 border-t border-gray-200 pt-8">
                      <div className="flex items-start gap-4">
                        {post.author.avatarUrl ? (
                          <Image
                            src={post.author.avatarUrl}
                            alt={post.author.fullName}
                            width={64}
                            height={64}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-300">
                            <User className="h-8 w-8 text-gray-600" />
                          </div>
                        )}
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {post.author.fullName}
                          </h3>
                          <p className="mt-1 text-gray-600">
                            @{post.author.username}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comments */}
                <div className="mt-8">
                  <BlogComments postId={post.id.toString()} />
                </div>
              </article>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Share */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Paylaş</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <button className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50">
                          <div className="h-5 w-5 rounded bg-blue-600"></div>
                          <span className="text-sm font-medium">
                            Twitter&apos;da Paylaş
                          </span>
                        </button>
                        <button className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50">
                          <div className="h-5 w-5 rounded bg-blue-800"></div>
                          <span className="text-sm font-medium">
                            Facebook&apos;ta Paylaş
                          </span>
                        </button>
                        <button className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50">
                          <div className="h-5 w-5 rounded bg-blue-700"></div>
                          <span className="text-sm font-medium">
                            LinkedIn&apos;de Paylaş
                          </span>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <div className="bg-gray-50 py-12">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-8 text-2xl font-bold text-gray-900">
                İlgili Yazılar
              </h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {relatedPosts.map((relatedPost) => (
                  <Card
                    key={relatedPost.id}
                    className="transition-shadow hover:shadow-lg"
                  >
                    <CardContent className="p-6">
                      {relatedPost.category && (
                        <div className="mb-3">
                          <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600">
                            {relatedPost.category.name}
                          </span>
                        </div>
                      )}
                      <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900">
                        <Link
                          href={`/blog/${relatedPost.slug}`}
                          className="transition-colors hover:text-blue-600"
                        >
                          {relatedPost.title}
                        </Link>
                      </h3>
                      <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        {relatedPost.publishedAt && (
                          <span>
                            {new Date(
                              relatedPost.publishedAt
                            ).toLocaleDateString('tr-TR')}
                          </span>
                        )}
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{relatedPost.viewCount}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
