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
import { blogApi, type BlogPost } from '@/lib/api/blog';

// Dynamic rendering işaretleme
export const dynamicParams = true;
export const revalidate = 0;

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
    keywords: post.tags?.join(', '),
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [
        typeof post.author === 'object' ? post.author.name : post.author,
      ],
      images: post.coverImage ? [post.coverImage] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

const BlogComments = dynamic(() => import('./comments'), { ssr: false });

// TODO: Replace with real backend API call
// Suggested endpoint: GET /api/v1/blog/posts/{slug}
// Backend should return BlogPost with content, metadata, author info
// Mock blog data - REMOVE THIS AFTER BACKEND INTEGRATION
const mockBlogPosts = [
  {
    id: '1',
    slug: 'freelancer-olarak-ilk-adimlariniz',
    title: 'Freelancer Olarak İlk Adımlarınız',
    excerpt:
      'Freelance kariyerinize başlarken dikkat etmeniz gereken önemli noktalar.',
    content: `
      <div class="prose max-w-none">
        <h2>Freelance Kariyerine Başlamak</h2>
        <p>Freelance çalışma hayatı, birçok avantaj sunan fakat aynı zamanda dikkatli planlama gerektiren bir kariyer yoludur. Bu rehberde, başarılı bir freelancer olmak için atmanız gereken ilk adımları detaylı olarak inceleyeceğiz.</p>
        
        <h3>1. Kendinizi Tanıyın ve Becerilerinizi Değerlendirin</h3>
        <p>Freelance kariyerinize başlamadan önce, hangi alanlarda güçlü olduğunuzu ve hangi hizmetleri sunabileceğinizi objektif bir şekilde değerlendirmelisiniz. Bu süreçte aşağıdaki sorulara yanıt arayın:</p>
        <ul>
          <li>Hangi teknik becerileriniz var ve bunlar ne kadar güçlü?</li>
          <li>Hangi projelerde başarılı oldunuz?</li>
          <li>Müşterilerle iletişim konusunda ne kadar rahat hissediyorsunuz?</li>
          <li>Zaman yönetimi ve proje planlama becerileriniz nasıl?</li>
        </ul>
        
        <h3>2. Profesyonel Bir Portföy Hazırlayın</h3>
        <p>Portföyünüz, potansiel müşterilere yeteneklerinizi gösterdiğiniz en önemli araçtır. Etkili bir portföy oluşturmak için:</p>
        <ul>
          <li>En iyi çalışmalarınızı seçin ve her proje için detaylı açıklama yapın</li>
          <li>Kullandığınız teknolojileri ve süreçleri belirtin</li>
          <li>Projelerin sonuçlarını ve müşteri geri bildirimlerini paylaşın</li>
          <li>Düzenli olarak portföyünüzü güncelleyin</li>
        </ul>
        
        <h3>3. Rekabetçi Fiyatlandırma Stratejisi Belirleyin</h3>
        <p>Fiyatlandırma, freelancer olarak karşılaştığınız en zor konulardan biridir. Başlangıç için:</p>
        <ul>
          <li>Piyasa araştırması yaparak benzer hizmetlerin fiyatlarını inceleyin</li>
          <li>Saatlik ücret, proje bazlı fiyat veya paket fiyatlama modellerini değerlendirin</li>
          <li>İlk müşterileriniz için biraz daha uygun fiyatlar sunabilirsiniz</li>
          <li>Tecrübe kazandıkça fiyatlarınızı artırmayı planlayın</li>
        </ul>
        
        <h3>4. Etkili İletişim ve Müşteri İlişkileri</h3>
        <p>Başarılı bir freelancer olmak sadece teknik beceriler gerektirmez, aynı zamanda güçlü iletişim becerileri de çok önemlidir:</p>
        <ul>
          <li>Her zaman profesyonel ve saygılı bir dil kullanın</li>
          <li>Proje süreçleri hakkında düzenli güncellemeler paylaşın</li>
          <li>Sorunlar çıktığında hemen iletişim kurun</li>
          <li>Müşteri geri bildirimlerini ciddiye alın ve sürekli gelişim için kullanın</li>
        </ul>
        
        <h3>5. Yasal ve Mali Konulara Dikkat Edin</h3>
        <p>Freelance çalışırken yasal ve mali yükümlülüklerinizi unutmayın:</p>
        <ul>
          <li>Vergi mükellefi olun ve düzenli beyannamelerinizi verin</li>
          <li>Müşterilerinizle yapacağınız sözleşmelerde net şartlar belirleyin</li>
          <li>Gelir-gider takibinizi düzenli yapın</li>
          <li>Gerekirse bir muhasebeci ile çalışın</li>
        </ul>
        
        <h3>Sonuç</h3>
        <p>Freelance kariyer, doğru planlama ve tutarlı çalışma ile büyük fırsatlar sunabilir. Sabırlı olun, sürekli kendinizi geliştirin ve müşteri memnuniyetini her zaman ön planda tutun. Unutmayın ki, başarılı bir freelancer olmak bir gecede gerçekleşmez, ancak doğru adımlarla hedefinize ulaşabilirsiniz.</p>
      </div>
    `,
    category: { id: '1', name: 'Kariyer', slug: 'kariyer' },
    author: {
      id: '1',
      name: 'MarifetBul Editörü',
      avatar: '/avatars/editor.jpg',
    },
    publishedAt: '2025-09-12T10:00:00Z',
    updatedAt: '2025-09-15T14:30:00Z',
    tags: ['freelance', 'kariyer', 'başlangıç', 'rehber'],
    views: 1547,
    readTime: 8,
    featured: true,
    coverImage: '/blog/freelancer-cover.jpg',
  },
  {
    id: '2',
    slug: '2025-web-tasarim-trendleri',
    title: '2025 Web Tasarım Trendleri',
    excerpt: 'Bu yıl öne çıkan web tasarım trendleri ve uygulama örnekleri.',
    content: `
      <div class="prose max-w-none">
        <h2>2025'te Web Tasarım Dünyası</h2>
        <p>Web tasarım dünyası sürekli evrim geçiriyor ve 2025 yılı da birçok yenilikle dolu. Bu yazıda, bu yıl dikkat çeken trendleri ve bunları projelerinizde nasıl uygulayabileceğinizi ele alacağız.</p>
        <p>Tasarım trendleri hakkında detaylı bilgi...</p>
      </div>
    `,
    category: { id: '2', name: 'Tasarım', slug: 'tasarim' },
    author: {
      id: '2',
      name: 'Tasarım Uzmanı',
      avatar: '/avatars/designer.jpg',
    },
    publishedAt: '2025-09-10T09:00:00Z',
    tags: ['tasarım', 'trend', 'web'],
    views: 980,
    readTime: 6,
    featured: false,
  },
  {
    id: '3',
    slug: 'uzaktan-calisma-ipuclari',
    title: 'Uzaktan Çalışma İpuçları',
    excerpt: 'Evden çalışırken verimliliğinizi artıracak pratik öneriler.',
    content: `
      <div class="prose max-w-none">
        <h2>Uzaktan Çalışma Rehberi</h2>
        <p>Evden çalışma artık yeni normal. İşte başarılı olmanın yolları...</p>
      </div>
    `,
    category: { id: '3', name: 'Productivity', slug: 'productivity' },
    author: {
      id: '3',
      name: 'Productivity Uzmanı',
      avatar: '/avatars/productivity.jpg',
    },
    publishedAt: '2025-09-08T08:00:00Z',
    tags: ['uzaktan çalışma', 'verimlilik', 'home office'],
    views: 756,
    readTime: 5,
    featured: false,
  },
];

async function getPost(slug: string): Promise<BlogPost | null> {
  try {
    // Mock data'dan slug'a göre post bul
    const post = mockBlogPosts.find((p) => p.slug === slug);
    return post || null;
  } catch (error) {
    console.error('Blog post fetch error:', error);
    return null;
  }
}

// Related posts fonksiyonu
function getRelatedPosts(currentPost: BlogPost): BlogPost[] {
  return mockBlogPosts
    .filter(
      (post) =>
        post.id !== currentPost.id &&
        (post.tags?.some((tag) => currentPost.tags?.includes(tag)) ||
          (typeof post.category === 'object' &&
            typeof currentPost.category === 'object' &&
            post.category.slug === currentPost.category.slug))
    )
    .slice(0, 3);
}

export default async function BlogDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  if (!post) return notFound();

  const relatedPosts = getRelatedPosts(post);
  const categoryName =
    typeof post.category === 'object' ? post.category.name : post.category;
  const authorName =
    typeof post.author === 'object' ? post.author.name : post.author;
  const authorAvatar =
    typeof post.author === 'object' ? post.author.avatar : undefined;

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
            <div className="mb-4">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                <Tag className="mr-1 h-3 w-3" />
                {categoryName}
              </span>
            </div>

            {/* Title */}
            <h1 className="mb-6 text-4xl leading-tight font-bold text-gray-900 md:text-5xl">
              {post.title}
            </h1>

            {/* Meta Information */}
            <div className="mb-8 flex flex-wrap items-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                {authorAvatar ? (
                  <Image
                    src={authorAvatar}
                    alt={authorName}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-300">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <span className="font-medium">{authorName}</span>
              </div>

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

              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{post.readTime || 5} dk okuma</span>
              </div>

              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{post.views?.toLocaleString('tr-TR')} görüntüleme</span>
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
                  {post.coverImage && (
                    <div className="relative h-64 overflow-hidden rounded-t-lg md:h-80">
                      <Image
                        src={post.coverImage}
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
                              key={tag}
                              className="cursor-pointer rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700 transition-colors hover:bg-gray-200"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Author Info */}
                    <div className="mt-8 border-t border-gray-200 pt-8">
                      <div className="flex items-start gap-4">
                        {authorAvatar ? (
                          <Image
                            src={authorAvatar}
                            alt={authorName}
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
                            {authorName}
                          </h3>
                          <p className="mt-1 text-gray-600">
                            MarifetBul editör ekibinde yer alan uzman yazar.
                            Freelance dünyası ve teknoloji trendleri hakkında
                            yazılar kaleme alıyor.
                          </p>
                          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
                            <span>MarifetBul&apos;da editör</span>
                            <span>•</span>
                            <span>50+ yazı</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Comments */}
                <div className="mt-8">
                  <BlogComments postId={post.id} />
                </div>
              </article>

              {/* Sidebar */}
              <aside className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                  {/* Table of Contents */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">İçindekiler</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <nav className="space-y-2 text-sm">
                        <a
                          href="#"
                          className="block text-blue-600 transition-colors hover:text-blue-700"
                        >
                          1. Kendinizi Tanıyın
                        </a>
                        <a
                          href="#"
                          className="block text-gray-600 transition-colors hover:text-blue-600"
                        >
                          2. Portföy Hazırlayın
                        </a>
                        <a
                          href="#"
                          className="block text-gray-600 transition-colors hover:text-blue-600"
                        >
                          3. Fiyatlandırma Yapın
                        </a>
                        <a
                          href="#"
                          className="block text-gray-600 transition-colors hover:text-blue-600"
                        >
                          4. İletişim Kurun
                        </a>
                        <a
                          href="#"
                          className="block text-gray-600 transition-colors hover:text-blue-600"
                        >
                          5. Yasal Konular
                        </a>
                      </nav>
                    </CardContent>
                  </Card>

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
                      <div className="mb-3">
                        <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-600">
                          {typeof relatedPost.category === 'object'
                            ? relatedPost.category.name
                            : relatedPost.category}
                        </span>
                      </div>
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
                        <span>
                          {new Date(relatedPost.publishedAt).toLocaleDateString(
                            'tr-TR'
                          )}
                        </span>
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{relatedPost.views}</span>
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
