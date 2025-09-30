// Blog API - GET: tüm postlar, POST: yeni post ekle
import { NextRequest, NextResponse } from 'next/server';
import { BlogPost } from '@/types/blog';

// Mock veri - gerçek projede veritabanı ile değiştirilmeli
const posts: BlogPost[] = [
  {
    id: '1',
    slug: 'freelancer-olarak-ilk-adimlariniz',
    title: 'Freelancer Olarak İlk Adımlarınız',
    excerpt:
      'Freelance kariyerinize başlarken dikkat etmeniz gereken önemli noktalar.',
    content: `
      <h2>Freelance Kariyerine Başlamak</h2>
      <p>Freelance çalışma hayatı, birçok avantaj sunan fakat aynı zamanda dikkatli planlama gerektiren bir kariyer yoludur.</p>
      
      <h3>1. Kendinizi Tanıyın</h3>
      <p>Hangi alanlarda güçlü olduğunuzu, hangi hizmetleri sunabileceğinizi belirleyin.</p>
      
      <h3>2. Portföy Hazırlayın</h3>
      <p>Geçmiş çalışmalarınızı sergileyen profesyonel bir portföy oluşturun.</p>
      
      <h3>3. Fiyatlandırma Yapın</h3>
      <p>Piyasa araştırması yaparak rekabetçi fiyatlar belirleyin.</p>
      
      <h3>4. İletişim Kurun</h3>
      <p>Müşterilerle etkili iletişim kurarak uzun vadeli ilişkiler geliştirin.</p>
    `,
    category: { id: '1', name: 'Kariyer', slug: 'kariyer' },
    author: { id: '1', name: 'MarifetBul Editörü' },
    publishedAt: '2025-09-12T10:00:00Z',
    tags: ['freelance', 'kariyer', 'başlangıç'],
    views: 120,
    featured: true,
  },
  {
    id: '2',
    slug: '2025-web-tasarim-trendleri',
    title: '2025 Web Tasarım Trendleri',
    excerpt: 'Bu yıl öne çıkan web tasarım trendleri ve uygulama örnekleri.',
    content: `
      <h2>2025'te Web Tasarım</h2>
      <p>Web tasarım dünyası sürekli evrim geçiriyor. İşte bu yıl dikkat çeken trendler:</p>
      
      <h3>1. Minimalist Tasarım</h3>
      <p>Sade ve temiz arayüzler popülerliğini koruyor.</p>
      
      <h3>2. Dark Mode</h3>
      <p>Koyu tema tercihleri artıyor.</p>
      
      <h3>3. Mikro Animasyonlar</h3>
      <p>Kullanıcı deneyimini geliştiren küçük animasyonlar.</p>
    `,
    category: { id: '2', name: 'Tasarım', slug: 'tasarim' },
    author: { id: '2', name: 'Tasarım Uzmanı' },
    publishedAt: '2025-09-10T09:00:00Z',
    tags: ['tasarım', 'trend', 'web'],
    views: 80,
    featured: false,
  },
  {
    id: '3',
    slug: 'uzaktan-calisma-ipuclari',
    title: 'Uzaktan Çalışma İpuçları',
    excerpt: 'Evden çalışırken verimliliğinizi artıracak pratik öneriler.',
    content: `
      <h2>Uzaktan Çalışma Rehberi</h2>
      <p>Evden çalışma artık yeni normal. İşte başarılı olmanın yolları:</p>
      
      <h3>1. Çalışma Alanı Düzenleyin</h3>
      <p>Özel bir çalışma köşesi oluşturun.</p>
      
      <h3>2. Zaman Yönetimi</h3>
      <p>Günlük rutinler ve molalar planlayın.</p>
      
      <h3>3. İletişimde Kalın</h3>
      <p>Takım üyeleriyle düzenli iletişim kurun.</p>
    `,
    category: { id: '3', name: 'Productivity', slug: 'productivity' },
    author: { id: '3', name: 'Productivity Uzmanı' },
    publishedAt: '2025-09-08T08:00:00Z',
    tags: ['uzaktan çalışma', 'verimlilik', 'home office'],
    views: 65,
    featured: false,
  },
];

export async function GET(req: NextRequest) {
  try {
    // Query: ?category=slug&search=...&page=1
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = 10;

    let filtered = posts;

    if (category) {
      filtered = filtered.filter((p) =>
        typeof p.category === 'object'
          ? p.category.slug === category
          : p.category === category
      );
    }

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(search.toLowerCase()) ||
          p.excerpt.toLowerCase().includes(search.toLowerCase()) ||
          p.content.toLowerCase().includes(search.toLowerCase()) ||
          (p.tags &&
            p.tags.some((tag) =>
              tag.toLowerCase().includes(search.toLowerCase())
            ))
      );
    }

    const total = filtered.length;
    const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

    return NextResponse.json({
      posts: paged,
      total,
      page,
      pageSize,
      hasMore: page * pageSize < total,
    });
  } catch (error) {
    console.error('Blog API error:', error);
    return NextResponse.json(
      { error: 'Blog yazıları yüklenirken hata oluştu.', posts: [], total: 0 },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
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
      slug:
        data.slug ||
        data.title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim(),
      publishedAt: new Date().toISOString(),
      views: 0,
    };

    posts.unshift(newPost);

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error('Blog POST error:', error);
    return NextResponse.json(
      { error: 'Blog yazısı oluşturulurken hata oluştu.' },
      { status: 500 }
    );
  }
}
