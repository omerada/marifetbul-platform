// Tekil blog postu getiren endpoint
import { NextRequest, NextResponse } from 'next/server';
import { BlogPost } from '@/types/blog';
// Not: Gerçek projede veritabanı ile değiştirilmeli
const posts: BlogPost[] = [
  {
    id: '1',
    slug: 'freelancer-olarak-ilk-adimlariniz',
    title: 'Freelancer Olarak İlk Adımlarınız',
    excerpt:
      'Freelance kariyerinize başlarken dikkat etmeniz gereken önemli noktalar.',
    content: 'Burada detaylı içerik olacak...',
    category: { id: '1', name: 'Kariyer', slug: 'kariyer' },
    author: { id: '1', name: 'Admin' },
    publishedAt: '2025-09-12T10:00:00Z',
    tags: ['freelance', 'kariyer'],
    views: 120,
    featured: true,
  },
  {
    id: '2',
    slug: '2025-web-tasarim-trendleri',
    title: '2025 Web Tasarım Trendleri',
    excerpt: 'Bu yıl öne çıkan web tasarım trendleri ve uygulama örnekleri.',
    content: 'Burada detaylı içerik olacak...',
    category: { id: '2', name: 'Tasarım', slug: 'tasarim' },
    author: { id: '2', name: 'Editor' },
    publishedAt: '2025-09-10T09:00:00Z',
    tags: ['tasarım', 'trend'],
    views: 80,
    featured: false,
  },
];

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const post = posts.find((p) => p.slug === params.slug);
  if (!post)
    return NextResponse.json({ error: 'Yazı bulunamadı.' }, { status: 404 });
  return NextResponse.json(post);
}
