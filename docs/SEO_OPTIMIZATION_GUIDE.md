# SEO Optimization Guide - MarifetBul

## 🎯 SEO Sistem Özeti

Bu rehber, MarifetBul platformu için yeni URL yapısına uygun olarak geliştirilmiş kapsamlı SEO optimizasyon sistemini açıklamaktadır.

## 📁 Yeni URL Yapısı

### Route Hiyerarşisi

```
/ (Ana sayfa)
├── /marketplace (İş ve Hizmet Pazarı)
│   ├── /categories (Kategoriler)
│   ├── /jobs/[id] (İş Detayları)
│   ├── /jobs/create (İş Oluştur)
│   ├── /packages/[id] (Paket Detayları)
│   └── /packages/create (Paket Oluştur)
├── /blog (Blog)
│   ├── /[slug] (Makale Detayları)
│   ├── /categories (Blog Kategorileri)
│   └── /search (Blog Arama)
├── /info (Bilgi Sayfaları)
│   ├── /contact (İletişim)
│   ├── /faq (SSS)
│   └── /how-it-works (Nasıl Çalışır)
├── /legal (Yasal Sayfalar)
│   ├── /privacy (Gizlilik)
│   ├── /terms (Kullanım Şartları)
│   ├── /cookies (Çerez Politikası)
│   └── /safety (Güvenlik)
└── /support (Destek)
    ├── /help (Yardım)
    ├── /create (Destek Talebi)
    └── /tickets (Destek Biletleri)
```

## 🗺️ Sitemap Sistemi

### 1. Ana Sitemap (`/sitemap.xml`)

- Statik sayfalar için temel sitemap
- Yüksek öncelikli sayfalar (marketplace, blog, info)
- Güncellenme sıklıkları optimize edildi

### 2. Blog Sitemap (`/blog/sitemap.xml`)

- Dinamik blog içerikleri
- Makale bazında SEO optimizasyonu
- Otomatik güncelleme sistemi

### 3. Marketplace Sitemap (`/marketplace/sitemap.xml`)

- İş ilanları ve hizmet paketleri
- Kategori sayfaları
- Dinamik içerik güncellemeleri

## 🤖 Robots.txt

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/employer/*
Disallow: /dashboard/freelancer/*
Disallow: /messages/*
Disallow: /support/tickets/*

Sitemap: https://marifetbul.com/sitemap.xml
Sitemap: https://marifetbul.com/blog/sitemap.xml
Sitemap: https://marifetbul.com/marketplace/sitemap.xml
```

## 📊 Metadata Yönetimi

### Centralized SEO Config

```typescript
export const seoConfig: SEOConfig = {
  defaultTitle: 'MarifetBul - Freelancer ve İş Buluşma Platformu',
  titleTemplate: '%s | MarifetBul',
  defaultDescription: 'Türkiye\'nin en büyük freelancer platformu...',
  defaultKeywords: ['freelancer', 'freelance', 'iş ilanları', ...],
  siteUrl: 'https://marifetbul.com',
  siteName: 'MarifetBul',
  twitterHandle: '@marifetbul',
};
```

### Sayfa Tiplerine Göre Metadata

#### 1. Homepage Metadata

- Optimized title ve description
- WebSite schema markup
- SearchAction structured data

#### 2. Marketplace Metadata

- İş ve hizmet odaklı keywords
- JobPosting schema markup
- Service schema markup

#### 3. Blog Metadata

- Article schema markup
- Author ve publisher bilgileri
- ReadingTime hesaplaması

#### 4. Legal Pages Metadata

- Appropriate robots directives
- Trust signals
- Compliance indicators

## 🏗️ Structured Data (JSON-LD)

### Organizasyon Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "MarifetBul",
  "url": "https://marifetbul.com",
  "logo": "https://marifetbul.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+90-XXX-XXX-XXXX",
    "contactType": "customer service"
  }
}
```

### İş İlanı Schema

```json
{
  "@context": "https://schema.org",
  "@type": "JobPosting",
  "title": "İş Başlığı",
  "description": "İş Açıklaması",
  "hiringOrganization": {
    "@type": "Organization",
    "name": "Şirket Adı"
  }
}
```

### Hizmet Schema

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Hizmet Adı",
  "description": "Hizmet Açıklaması",
  "provider": {
    "@type": "Organization",
    "name": "MarifetBul"
  }
}
```

## 📈 Analytics ve Tracking

### 1. SEO Tracking Hook

```typescript
const { trackEvent, trackConversion } = useSEOTracking();

// Sayfa görüntüleme tracking
// Otomatik: pathname değişiminde

// Event tracking
trackEvent('job_application', { job_id: 'xxx' });

// Conversion tracking
trackConversion('job_completed', 1000);
```

### 2. Search Tracking

```typescript
const { trackSearch, trackSearchResultClick } = useSearchTracking();

trackSearch('web tasarım', 25); // arama ve sonuç sayısı
trackSearchResultClick('web tasarım', 3, '/job/123'); // arama, pozisyon, URL
```

### 3. Link Tracking

```typescript
const { trackExternalLink, trackInternalLink } = useLinkTracking();

trackExternalLink('https://external-site.com', 'External Link');
trackInternalLink('/marketplace', 'Marketplace Link');
```

## 🛠️ SEO Utilities

### 1. Slug Oluşturma

```typescript
generateSlug('Web Tasarım Uzmanı'); // -> 'web-tasarim-uzmani'
```

### 2. Meta Description Oluşturma

```typescript
generateMetaDescription(content, 160); // 160 karakter sınırı
```

### 3. Anahtar Kelime Çıkarma

```typescript
extractKeywords(content, 10); // En çok kullanılan 10 anahtar kelime
```

### 4. SEO Analizi

```typescript
const analysis = analyzeSEO({
  title: 'Başlık',
  description: 'Açıklama',
  content: 'İçerik',
  keywords: ['kelime1', 'kelime2']
});

console.log(analysis.score); // SEO skorı
console.log(analysis.issues); // Sorunlar
console.log(analysis.suggestions); // Öneriler
```

## 🔧 Implementation Checklist

### ✅ Tamamlanan

1. **URL Yapısı**
   - ✅ Route hierarchy optimization
   - ✅ SEO-friendly URL structure
   - ✅ Breadcrumb navigation

2. **Sitemap System**
   - ✅ Main sitemap (`/sitemap.xml`)
   - ✅ Dynamic blog sitemap (`/blog/sitemap.xml`)
   - ✅ Dynamic marketplace sitemap (`/marketplace/sitemap.xml`)
   - ✅ Robots.txt configuration

3. **Metadata Management**
   - ✅ Centralized SEO configuration
   - ✅ Page-specific metadata generators
   - ✅ Dynamic content metadata
   - ✅ Open Graph optimization
   - ✅ Twitter Card optimization

4. **Structured Data**
   - ✅ Organization schema
   - ✅ WebSite schema with SearchAction
   - ✅ JobPosting schema
   - ✅ Service schema
   - ✅ Article schema
   - ✅ Breadcrumb schema

5. **Analytics & Tracking**
   - ✅ SEO tracking hooks
   - ✅ Event tracking system
   - ✅ Conversion tracking
   - ✅ Search analytics

6. **SEO Tools**
   - ✅ URL slug generator
   - ✅ Meta description generator
   - ✅ Keyword extraction
   - ✅ SEO analysis tool

### 🚧 Production Setup Gerekli

1. **Analytics Integration**
   - [ ] Google Analytics 4 setup
   - [ ] Google Search Console verification
   - [ ] Yandex Metrica setup (Turkey market)

2. **Environment Variables**

   ```env
   NEXT_PUBLIC_BASE_URL=https://marifetbul.com
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   NEXT_PUBLIC_YM_ID=XXXXXXXX
   NEXT_PUBLIC_ANALYTICS_ENDPOINT=/api/analytics
   ```

3. **Database Integration**
   - [ ] Blog posts için dynamic sitemap
   - [ ] Job listings için dynamic sitemap
   - [ ] User profiles için dynamic sitemap
   - [ ] Categories için dynamic sitemap

4. **Performance Optimization**
   - [ ] Image optimization with next/image
   - [ ] Critical CSS inlining
   - [ ] Preload key resources
   - [ ] Service Worker for caching

## 📊 SEO Metrics to Track

### Core Web Vitals

- **LCP** (Largest Contentful Paint) < 2.5s
- **FID** (First Input Delay) < 100ms
- **CLS** (Cumulative Layout Shift) < 0.1

### SEO KPIs

- Organic traffic growth
- Click-through rate (CTR)
- Average position in SERPs
- Page indexing status
- Mobile usability score

### Content Performance

- Page views per content type
- Time on page
- Bounce rate
- Search query performance
- Featured snippets captured

## 🎯 Future Enhancements

1. **Advanced SEO Features**
   - Schema markup for Reviews & Ratings
   - FAQ schema implementation
   - HowTo schema for guides
   - Local Business schema for service providers

2. **International SEO**
   - Hreflang implementation
   - Multi-language content
   - Regional targeting

3. **Technical SEO**
   - Advanced Core Web Vitals optimization
   - Critical CSS extraction
   - Preloading strategies
   - Progressive Web App features

4. **Content SEO**
   - AI-powered content optimization
   - Automated meta tag generation
   - Content gap analysis
   - Competitor analysis tools

---

Bu SEO sistemi, MarifetBul platformunun arama motorlarında daha iyi performans göstermesini ve organik trafiğini artırmasını sağlayacaktır. Sistem modüler yapıda tasarlandığı için gelecekteki geliştirmeler kolayca entegre edilebilir.
