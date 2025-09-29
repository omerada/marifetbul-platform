// Blog API - GET: tüm postlar, POST: yeni post ekle
import { NextRequest, NextResponse } from 'next/server';
import { BlogPost } from '@/types/blog';

// Mock veri - gerçek projede veritabanı ile değiştirilmeli
let posts: BlogPost[] = [
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

export async function GET(req: NextRequest) {
  // Query: ?category=slug&search=...&page=1
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = 10;

  let filtered = posts;
  if (category)
    filtered = filtered.filter((p) =>
      typeof p.category === 'object'
        ? p.category.slug === category
        : p.category === category
    );
  if (search)
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase())
    );

  const total = filtered.length;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  return NextResponse.json({ posts: paged, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  // Basit validasyon
  if (!data.title || !data.content) {
    return NextResponse.json(
      { error: 'Başlık ve içerik zorunlu.' },
      { status: 400 }
    );
  }
  const newPost: BlogPost = {
    ...data,
    id: (posts.length + 1).toString(),
    slug: data.slug || data.title.toLowerCase().replace(/ /g, '-'),
    publishedAt: new Date().toISOString(),
  };
  posts.unshift(newPost);
  return NextResponse.json(newPost, { status: 201 });
}
