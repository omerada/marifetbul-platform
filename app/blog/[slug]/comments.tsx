import type { BlogComment } from '@/types/blog';

// Mock yorumlar - gerçek projede API'den çekilmeli
const comments: BlogComment[] = [
  {
    id: 'c1',
    postId: '1',
    author: 'Ziyaretçi',
    content: 'Çok faydalı bir yazı, teşekkürler!',
    createdAt: '2025-09-13T12:00:00Z',
    approved: true,
  },
];

export default function BlogComments({ postId }: { postId: string }) {
  const postComments = comments.filter(
    (c) => c.postId === postId && c.approved
  );
  return (
    <section className="mt-12">
      <h3 className="mb-4 text-xl font-semibold">Yorumlar</h3>
      {postComments.length === 0 ? (
        <div className="text-gray-500">Henüz yorum yok.</div>
      ) : (
        <ul className="space-y-4">
          {postComments.map((c) => (
            <li key={c.id} className="rounded border p-4">
              <div className="font-bold text-blue-700">
                {typeof c.author === 'object' ? c.author.name : c.author}
              </div>
              <div className="mt-1 text-gray-700">{c.content}</div>
              <div className="mt-2 text-xs text-gray-400">
                {new Date(c.createdAt).toLocaleString('tr-TR')}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
