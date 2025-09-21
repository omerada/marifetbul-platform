import { Metadata } from 'next';
import { AppLayout } from '@/components/layout';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Blog - MarifetBul',
  description:
    'Freelance dünyası, teknoloji ve iş hayatı hakkında güncel yazılar.',
};

export default function BlogPage() {
  const blogPosts = [
    {
      title: 'Freelancer Olarak İlk Adımlarınız',
      excerpt:
        'Freelance kariyerinize başlarken dikkat etmeniz gereken önemli noktalar.',
      date: '12 Eylül 2025',
      category: 'Kariyer',
    },
    {
      title: '2025 Web Tasarım Trendleri',
      excerpt: 'Bu yıl öne çıkan web tasarım trendleri ve uygulama örnekleri.',
      date: '10 Eylül 2025',
      category: 'Tasarım',
    },
    {
      title: 'Uzaktan Çalışma İpuçları',
      excerpt: 'Evden çalışırken verimliliğinizi artıracak pratik öneriler.',
      date: '8 Eylül 2025',
      category: 'Productivity',
    },
  ];

  return (
    <AppLayout>
      <div className="bg-gradient-to-b from-blue-50 to-white py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
              Blog
            </h1>
            <p className="mb-12 text-xl text-gray-600">
              Freelance dünyası, teknoloji ve iş hayatı hakkında güncel yazılar.
            </p>
          </div>
        </div>
      </div>

      <div className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl space-y-8">
            {blogPosts.map((post, index) => (
              <Card key={index} className="p-8">
                <div className="mb-2 text-sm text-blue-600">
                  {post.category}
                </div>
                <h2 className="mb-3 text-2xl font-bold text-gray-900">
                  {post.title}
                </h2>
                <p className="mb-4 text-gray-600">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{post.date}</span>
                  <button className="text-blue-600 hover:text-blue-700">
                    Devamını Oku →
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">Yakında daha fazla içerik...</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
