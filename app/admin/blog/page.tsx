import Link from 'next/link';

export default function AdminBlogPage() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Blog Yönetimi</h1>
      <div className="mb-6">
        <Link
          href="/admin/blog/new"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Yeni Yazı Ekle
        </Link>
      </div>
      {/* Burada blog yazıları listelenecek ve düzenleme/silme butonları olacak */}
      <div className="text-gray-500">
        Yönetim paneli geliştirmesi için API ve component entegrasyonu
        yapılmalı.
      </div>
    </main>
  );
}
