'use client';

import { useState } from 'react';
import type { BlogComment } from '@/types/blog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { MessageCircle, Clock, Send, ThumbsUp } from 'lucide-react';

// Mock yorumlar - gerçek projede API'den çekilmeli
const comments: BlogComment[] = [
  {
    id: 'c1',
    postId: '1',
    author: 'Ahmet Yılmaz',
    content:
      'Çok faydalı bir yazı olmuş, özellikle fiyatlandırma konusundaki öneriler çok değerli. Teşekkürler!',
    createdAt: '2025-09-13T12:00:00Z',
    approved: true,
  },
  {
    id: 'c2',
    postId: '1',
    author: 'Zeynep Kaya',
    content:
      'Freelance olarak yeni başladım ve bu yazı tam zamanında geldi. Portföy hazırlama kısmını çok beğendim.',
    createdAt: '2025-09-14T08:30:00Z',
    approved: true,
  },
  {
    id: 'c3',
    postId: '1',
    author: 'Mehmet Demir',
    content:
      'Yasal konulara değinmeniz çok iyi olmuş. Bu konuda daha detaylı bir yazı gelirse harika olur.',
    createdAt: '2025-09-15T16:45:00Z',
    approved: true,
  },
];

export default function BlogComments({ postId }: { postId: string }) {
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const postComments = comments.filter(
    (c) => c.postId === postId && c.approved
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !authorName.trim()) return;

    setIsSubmitting(true);

    // Mock submission - gerçek projede API'ye gönderilmeli
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setNewComment('');
    setAuthorName('');
    setIsSubmitting(false);

    // Başarılı mesajı göster
    alert(
      'Yorumunuz başarıyla gönderildi! İncelendikten sonra yayınlanacaktır.'
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-blue-600" />
          Yorumlar ({postComments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Existing Comments */}
        {postComments.length === 0 ? (
          <div className="py-8 text-center">
            <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="mb-2 text-gray-500">Henüz yorum yapılmamış.</p>
            <p className="text-sm text-gray-400">İlk yorumu sen yap!</p>
          </div>
        ) : (
          <div className="mb-8 space-y-6">
            {postComments.map((comment) => (
              <div key={comment.id} className="border-l-4 border-blue-100 pl-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 font-semibold text-white">
                    {typeof comment.author === 'object'
                      ? comment.author.name.charAt(0).toUpperCase()
                      : comment.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h4 className="font-semibold text-gray-900">
                        {typeof comment.author === 'object'
                          ? comment.author.name
                          : comment.author}
                      </h4>
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(comment.createdAt).toLocaleDateString(
                          'tr-TR',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          }
                        )}
                      </span>
                    </div>
                    <p className="leading-relaxed text-gray-700">
                      {comment.content}
                    </p>
                    <div className="mt-3 flex items-center gap-4">
                      <button className="flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-blue-600">
                        <ThumbsUp className="h-4 w-4" />
                        Beğen
                      </button>
                      <button className="text-sm text-gray-500 transition-colors hover:text-blue-600">
                        Yanıtla
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comment Form */}
        <div className="border-t pt-8">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">
            Yorum Yap
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label
                  htmlFor="authorName"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Adınız *
                </label>
                <input
                  type="text"
                  id="authorName"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="Adınızı girin..."
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  E-posta (isteğe bağlı)
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                  placeholder="E-posta adresiniz..."
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="comment"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Yorumunuz *
              </label>
              <textarea
                id="comment"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Düşüncelerinizi paylaşın..."
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Yorumunuz incelendikten sonra yayınlanacaktır.
              </p>
              <button
                type="submit"
                disabled={
                  isSubmitting || !newComment.trim() || !authorName.trim()
                }
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {isSubmitting ? 'Gönderiliyor...' : 'Yorum Yap'}
              </button>
            </div>
          </form>
        </div>

        {/* Comment Guidelines */}
        <div className="mt-6 rounded-lg bg-blue-50 p-4">
          <h4 className="mb-2 text-sm font-semibold text-blue-900">
            Yorum Kuralları
          </h4>
          <ul className="space-y-1 text-xs text-blue-800">
            <li>• Saygılı ve yapıcı yorumlar yazın</li>
            <li>
              • Kişisel saldırılar ve hakaret içeren yorumlar onaylanmayacaktır
            </li>
            <li>• Reklam ve spam içerikler yayınlanmayacaktır</li>
            <li>• Konuyla ilgili yorumlar yapmaya özen gösterin</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
