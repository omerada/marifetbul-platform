# Blog Sistemi - MarifetBul

Bu dizin MarifetBul platformunun blog sistemini içerir.

## Yapı

```
/blog
├── page.tsx              # Ana blog listesi
├── [slug]/
│   ├── page.tsx          # Blog post detay sayfası
│   └── comments.tsx      # Yorumlar componenti
├── categories/
│   └── page.tsx          # Kategori listesi
├── search/
│   └── page.tsx          # Arama sayfası
├── layout.tsx            # Blog için özel layout
└── not-found.tsx         # 404 sayfası

/api/blog
├── route.ts              # Blog CRUD API
├── [slug]/
│   └── route.ts          # Tekil blog API
└── categories/
    └── route.ts          # Kategoriler API
```

## Özellikler

### ✅ Mevcut

- Blog post listesi (pagination desteği)
- Blog post detay sayfası (slug-based)
- Kategori filtreleme
- Arama fonksiyonu
- Yorumlar (mock data)
- SEO optimizasyonu
- Error handling & boundaries
- Loading states
- Production-ready API endpoints
- TypeScript tip güvenliği

### 🔄 Geliştirme Aşamasında

- Veritabanı entegrasyonu (şu an mock data)
- Admin paneli (CRUD işlemleri)
- Gerçek yorum sistemi
- Görsel yükleme
- Sosyal medya paylaşım
- RSS feed
- İçerik editörü
- Yazar profilleri

## API Endpoints

- `GET /api/blog` - Blog listesi (query: category, search, page)
- `POST /api/blog` - Yeni blog oluştur
- `GET /api/blog/[slug]` - Tekil blog getir
- `GET /api/blog/categories` - Kategoriler

## Kullanım

### Blog Listesi

```javascript
// Tüm blog postları
fetch('/api/blog');

// Kategori ile filtreli
fetch('/api/blog?category=kariyer');

// Arama ile
fetch('/api/blog?search=freelance');

// Sayfalama
fetch('/api/blog?page=2');
```

### Yeni Blog Ekleme

```javascript
fetch('/api/blog', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Blog Başlığı',
    content: 'Blog içeriği...',
    excerpt: 'Kısa özet',
    category: 'kariyer',
    tags: ['freelance', 'kariyer'],
  }),
});
```

## Production Deployment

Bu blog sistemi Vercel'de production-ready olarak deploy edilebilir:

1. Environment variables ayarlayın (.env.example'a bakın)
2. Build çalıştırın: `npm run build`
3. Deploy edin: `vercel deploy`

### Performans

- Server Components kullanımı
- Dynamic rendering
- Error boundaries
- Loading states
- SEO optimizasyonu

## Sonraki Adımlar

1. **Veritabanı Entegrasyonu**: Prisma + PostgreSQL
2. **Admin Paneli**: Blog CRUD işlemleri
3. **Rich Text Editor**: Markdown veya WYSIWYG
4. **Media Upload**: Cloudinary entegrasyonu
5. **Comment System**: Gerçek yorum sistemi
6. **RSS Feed**: Otomatik RSS generation
