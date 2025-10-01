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
    content: `
      <h2>Freelance Kariyerine Başlamak</h2>
      <p>Freelance çalışma hayatı, birçok avantaj sunan fakat aynı zamanda dikkatli planlama gerektiren bir kariyer yoludur.</p>
      
      <h3>1. Kendinizi Tanıyın</h3>
      <p>Hangi alanlarda güçlü olduğunuzu, hangi hizmetleri sunabileceğinizi belirleyin. Bu, başarılı bir freelance kariyerinin temelini oluşturur.</p>
      
      <h3>2. Portföy Hazırlayın</h3>
      <p>Geçmiş çalışmalarınızı sergileyen profesyonel bir portföy oluşturun. Portföyünüz, potansiyel müşterilerinize yeteneklerinizi göstermenin en etkili yoludur.</p>
      
      <h3>3. Fiyatlandırma Yapın</h3>
      <p>Piyasa araştırması yaparak rekabetçi fiyatlar belirleyin. Çok düşük fiyat vermek kalitenizi sorgulatabilir, çok yüksek fiyat ise müşteri kaybetmenize neden olabilir.</p>
      
      <h3>4. İletişim Kurun</h3>
      <p>Müşterilerle etkili iletişim kurarak uzun vadeli ilişkiler geliştirin. İyi iletişim, başarılı projelerin anahtarıdır.</p>
      
      <h3>Sonuç</h3>
      <p>Freelance hayatı özgürlük sunar ancak disiplin gerektirir. Doğru adımlarla başarılı bir kariyer kurabilirsiniz.</p>
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
      <p>Sade ve temiz arayüzler popülerliğini koruyor. Az renkli paletler, bol beyaz alan kullanımı ve basit navigasyon öne çıkıyor.</p>
      
      <h3>2. Dark Mode</h3>
      <p>Koyu tema tercihleri artıyor. Özellikle gece kullanımında gözleri yormayan tasarımlar tercih ediliyor.</p>
      
      <h3>3. Mikro Animasyonlar</h3>
      <p>Kullanıcı deneyimini geliştiren küçük animasyonlar. Button hover efektleri, loading animasyonları ve geçiş efektleri.</p>
      
      <h3>4. Responsive Tasarım</h3>
      <p>Mobil öncelikli tasarım yaklaşımı artık standart. Tüm cihazlarda mükemmel görünüm şart.</p>
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
      <p>Özel bir çalışma köşesi oluşturun. Ergonomik sandalye, uygun aydınlatma ve düzenli masa önemli.</p>
      
      <h3>2. Zaman Yönetimi</h3>
      <p>Günlük rutinler ve molalar planlayın. Pomodoro tekniği gibi zaman yönetimi metodları kullanın.</p>
      
      <h3>3. İletişimde Kalın</h3>
      <p>Takım üyeleriyle düzenli iletişim kurun. Video konferanslar ve mesajlaşma araçlarını etkin kullanın.</p>
      
      <h3>4. Sağlıklı Yaşam</h3>
      <p>Düzenli egzersiz yapın, beslenmenize dikkat edin ve yeterli uyku alın.</p>
    `,
    category: { id: '3', name: 'Productivity', slug: 'productivity' },
    author: { id: '3', name: 'Productivity Uzmanı' },
    publishedAt: '2025-09-08T08:00:00Z',
    tags: ['uzaktan çalışma', 'verimlilik', 'home office'],
    views: 65,
    featured: false,
  },
];

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const post = posts.find((p) => p.slug === params.slug);

    if (!post) {
      return NextResponse.json(
        { error: 'Blog yazısı bulunamadı.' },
        { status: 404 }
      );
    }

    // View sayısını artır (gerçek projede veritabanında yapılmalı)
    post.views = (post.views || 0) + 1;

    return NextResponse.json(post);
  } catch (error) {
    console.error('Blog post API error:', error);
    return NextResponse.json(
      { error: 'Blog yazısı yüklenirken hata oluştu.' },
      { status: 500 }
    );
  }
}
