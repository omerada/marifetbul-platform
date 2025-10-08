# AllCategoriesCard Component

## 📝 Açıklama

`AllCategoriesCard`, `/marketplace/categories` sayfasında "Tüm Hizmet Kategorileri" bölümünde kullanılan modern, soft ve kullanıcı deneyimi odaklı bir card component'idir.

## ✨ Özellikler

### 1. **Modern ve Soft Tasarım**

- Minimalist yapı ile karmaşıklıktan uzak
- Soft gradient hover efektleri (düşük opacity)
- Smooth animasyonlar (Framer Motion)
- Responsive grid layout
- Projemizin tema yapısına uyumlu renkler

### 2. **İşlevsel Bilgi Gösterimi**

- **Icon + Başlık + Açıklama**: Kategoriyi net bir şekilde tanımlar
- **İstatistikler**: Hizmet sayısı ve ortalama fiyat
- **Popüler Hizmetler**: En çok aranan 3 hizmet + toplam sayı
- **Alt Kategoriler**: Alt kategori sayısı
- **Temiz görünüm**: Badge yok, rengarenk olmayan soft palet

### 3. **Gelişmiş Hover Efektleri**

- Card yukarı hareket (-translate-y-1)
- Soft gradient overlay (düşük opacity)
- Icon scale (minimal, 105%)
- Arrow animasyonu
- Border ve shadow değişimleri

### 4. **Production-Ready**

- TypeScript type safety
- Error handling
- Performance optimized
- Accessibility (a11y) compliant
- SEO friendly (proper link structure)
- Tüm linkler çalışır durumda

## 🎨 Tasarım Özellikleri

### Renkler

- Her kategori için dinamik renk sistemi (iconColor)
- Soft gradient overlays (05-02 opacity)
- Soft backgrounds (08-10 opacity)
- Gray scale (50-900) tema uyumlu
- Hover state'leri yumuşak geçişler

### Animasyonlar

- Entry animation: fade-in + slide-up (400ms)
- Hover animations: scale (105%), translate, opacity
- Duration: 300ms (smooth transitions)
- Easing: easeOut

### Typography

- Başlık: text-base font-semibold (line-clamp-1)
- Açıklama: text-xs (line-clamp-2)
- Stats: text-lg font-semibold
- Tags: text-xs font-medium

## 🔧 Kullanım

```tsx
import { AllCategoriesCard } from '@/components/domains/marketplace';

<AllCategoriesCard category={category} />;
```

### Props

| Prop      | Tip      | Zorunlu | Varsayılan | Açıklama           |
| --------- | -------- | ------- | ---------- | ------------------ |
| category  | Category | ✅      | -          | Kategori bilgileri |
| className | string   | ❌      | ''         | Ek CSS sınıfları   |

## 📊 Kategori Bilgileri

Component aşağıdaki kategori bilgilerini kullanır:

```typescript
{
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  slug: string;
  icon: string;
  iconColor: string;
  serviceCount: number;
  averagePrice: number;
  popularServices: string[];
  subcategories?: SubCategory[];
}
```

## 🎯 CategoryCard ile Farklar

### AllCategoriesCard (YENİ - v2.0)

- ✅ Soft ve modern tasarım
- ✅ Tema uyumlu renkler
- ✅ Alt kategori sayısı gösterimi
- ✅ Yumuşak hover efektleri
- ✅ Sayısal formatlamalar (1.5k gibi)
- ✅ Soft gradient overlays
- ✅ Badge yok (clean look)
- ❌ Alt kategori detayları yok (ayrı sayfada)
- ❌ Expand/collapse özelliği yok

### CategoryCard (MEVCUT)

- ✅ Detaylı bilgi gösterimi
- ✅ Alt kategori listesi
- ✅ Expand/collapse
- ✅ Popüler beceriler
- ✅ Birden fazla variant
- ❌ Daha karmaşık yapı
- ❌ Daha fazla alan kaplama

## 🚀 Performans

- **Lazy Loading**: Link ile tıklandığında sayfa yüklenir
- **Optimized Animations**: GPU accelerated transforms
- **Small Bundle**: Minimal dependencies
- **Memoization Ready**: React.memo ile optimize edilebilir

## 🔄 Güncelleme Notları

### Versiyon 2.0.0 (2025-10-08)

- ✅ Badge'ler kaldırıldı (Trend, Öne Çıkan)
- ✅ Daha soft ve modern görünüm
- ✅ Tema yapısına uyumlu renkler
- ✅ Düşük opacity gradient'ler
- ✅ Tüm linkler production-ready
- ✅ Icon boyutları optimize edildi
- ✅ Padding ve spacing ayarları

### Versiyon 1.0.0 (2025-10-08)

- ✅ İlk release
- ✅ Production-ready
- ✅ Tüm responsive breakpoints test edildi

## 📱 Responsive Breakpoints

```css
/* Mobile First */
sm: grid-cols-2  /* 640px+ */
lg: grid-cols-3  /* 1024px+ */
xl: grid-cols-4  /* 1280px+ */
```

## 🎨 Tailwind Classes

Card yapısında kullanılan önemli Tailwind classes:

```css
/* Container */
.group.relative.h-full.overflow-hidden
.border.border-gray-200/60.bg-white.shadow-sm
.transition-all.duration-300
.hover:-translate-y-1.hover:border-gray-300/80.hover:shadow-lg

/* Icon Container */
.h-12.w-12.rounded-lg
.group-hover:scale-105

/* Stats */
.grid.grid-cols-2.gap-3
.rounded-lg.bg-gray-50/80

/* Tags */
.flex.flex-wrap.gap-1.5
.rounded-md.px-2.py-1
```

## 💡 İpuçları

1. **Performans**: Çok fazla kategori varsa sanal listeleme (virtual scrolling) eklenebilir
2. **SEO**: Link yapısı SEO-friendly, kategori slug'ları kullanılıyor
3. **Accessibility**: Tüm interactive elementler keyboard accessible
4. **Analytics**: Category tıklamalarını track etmek için onClick handler eklenebilir

## 🔗 İlgili Dosyalar

- Component: `components/domains/marketplace/AllCategoriesCard.tsx`
- Page: `components/domains/marketplace/CategoriesPageClient.tsx`
- Types: `types/business/features/marketplace-categories.ts`
- Store: `lib/domains/marketplace/categories-store.ts`
- Data: `lib/domains/marketplace/categories-data.ts`

## 🎨 Renk Sistemi

Projemizin tema yapısına uygun soft renkler:

```tsx
// Gradient overlay - çok düşük opacity
background: `linear-gradient(135deg, ${category.iconColor}05 0%, ${category.iconColor}02 100%)`;

// Icon background - soft
backgroundColor: `${category.iconColor}10`;

// Tag background - soft
backgroundColor: `${category.iconColor}08`;

// Arrow background - biraz daha belirgin
backgroundColor: `${category.iconColor}12`;
```

## 👨‍💻 Geliştirici Notları

### Tema Uyumluluğu

Projedeki tüm componentler gray-scale (50-900) ve primary color (blue) kullanıyor. Bu component de aynı sistemi takip eder:

- `gray-50/80`, `gray-100`, `gray-200/60`, `gray-500`, `gray-600`, `gray-700`, `gray-900`
- Kategori özel renkleri düşük opacity ile kullanılır

### Yeni Özellik Eklemek

```tsx
// Örnek: Click tracking
const handleClick = () => {
  // Analytics tracking
  trackEvent('category_click', {
    categoryId: category.id,
    categoryName: category.title,
  });
};

<AllCategoriesCard category={category} onClick={handleClick} />;
```

### Stil Değişiklikleri

Tüm renkler dinamik olarak kategori `iconColor` prop'undan gelir:

```tsx
style={{
  backgroundColor: `${category.iconColor}10`,
  color: category.iconColor,
}}
```

### Animasyon Değişiklikleri

Framer Motion variants'ı değiştirerek animasyonları customize edebilirsiniz:

```tsx
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};
```

## 🎓 Kullanım Örnekleri

### Temel Kullanım

```tsx
{
  categories.map((category) => (
    <AllCategoriesCard key={category.id} category={category} />
  ));
}
```

### Grid Layout ile

```tsx
<div className="grid auto-rows-fr gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {categories.map((category) => (
    <AllCategoriesCard key={category.id} category={category} />
  ))}
</div>
```

### Custom className ile

```tsx
<AllCategoriesCard category={category} className="shadow-lg hover:shadow-2xl" />
```

## 📋 Değişiklik Özeti (v2.0)

### Kaldırılanlar

- ❌ Trend badge (yeşil)
- ❌ Öne Çıkan badge (kategori renginde)
- ❌ TrendingUp icon import
- ❌ Yüksek opacity gradient'ler
- ❌ Büyük icon scale (110% → 105%)

### Eklenenler / İyileştirmeler

- ✅ Soft gradient overlays (05-02 opacity)
- ✅ Tema uyumlu gray scale
- ✅ Daha kompakt padding (p-6 → p-5)
- ✅ Daha küçük icon (h-14 → h-12)
- ✅ Yumuşak hover efektleri
- ✅ Clean, modern görünüm

---

**Not**: Bu component v2.0'da güncellenmiş olup, badge'ler kaldırılmış ve daha soft, modern bir görünüm kazandırılmıştır. Mevcut `CategoryCard` component'ine dokunulmamıştır. "En Çok Tercih Edilen Hizmet Kategorileri" bölümü eskiden beri `CategoryCard` ile çalışmaya devam etmektedir.
