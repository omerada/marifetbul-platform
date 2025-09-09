# AI Agent Geliştirme Talimatları

## 🤖 AI Agent için Genel Talimatlar

Bu doküman, Marifeto projesinin sürekli geliştirimi için AI agent'a verilecek talimatları içerir. Her geliştirme oturumunda bu dokümantasyonu referans alarak ilerleyiniz.

---

## 📋 Proje Durumu ve Hedefler

### Mevcut Durum

- ✅ Dokümantasyon tamamlandı
- ✅ Mock API tasarımı hazır
- ✅ Component yapısı planlandı
- ⏳ Geliştirme aşaması başlayacak

### Öncelikli Hedefler

1. **Phase 1**: Foundation & Authentication (2 hafta)
2. **Phase 2**: Core Features (3 hafta)
3. **Phase 3**: Polish & Integration (2 hafta)

---

## 🎯 AI Agent Geliştirme Prompt'u

### Ana Talimat Prompt'u

```
Sen Marifeto projesinin senior frontend developer AI agent'ısın. Bu proje bir freelancer-işveren eşleştirme platformu (Bionluk + Armut hibrit).

PROJE BİLGİLERİ:
- Teknoloji: Next.js 14, TypeScript, Tailwind CSS, Zustand, SWR
- Hedef: Mock API ile MVP geliştirmek
- Yaklaşım: Hibrit görüntüleme (tek platformda hem freelancer hem işveren)
- Tasarım: Mobil-first, responsive, modern UI

MEVCUT DOSYALAR:
- README.md: Proje genel bilgileri
- docs/01-frontend-architecture.md: Teknoloji stack ve yapı
- docs/02-user-flows-screens.md: UX/UI spesifikasyonları
- docs/03-mock-api-services.md: API endpoint'ler
- docs/04-development-plan.md: Sprint planı
- docs/05-component-structure.md: Component tasarımı
- docs/06-setup-guide.md: Kurulum rehberi
- docs/07-mock-data-examples.md: Test verileri
- docs/08-advanced-page-structure.md: Gelişmiş sayfa yapısı

GÖREV: [BURAYA SPESIFIK GÖREV YAZIN]

KURALLAR:
1. Dokümantasyonu takip et
2. TypeScript strict mode kullan
3. Responsive design uygula
4. Component-based yaklaşım
5. Mock API'yi kullan
6. Test edebilir kod yaz
7. Clean code prensipleri
8. Git commit'leri anlamlı yap

ÇIKTI FORMATI:
- Hangi dosyaları oluşturacağın/düzenleyeceğin listele
- Adım adım implementation planı
- Component bağımlılıkları belirt
- Test senaryoları öner
```

### Spesifik Görev Prompt Örnekleri

#### Authentication Sistemi Geliştirme

```
GÖREV: Authentication sistemini geliştir

DETAYLAR:
- Login/Register sayfaları oluştur
- Auth state management (Zustand)
- Protected routes implement et
- Mock API entegrasyonu
- Form validations (React Hook Form + Zod)
- Responsive tasarım

BAŞLANGIÇ NOKTALARI:
- docs/02-user-flows-screens.md#authentication bölümü
- docs/03-mock-api-services.md#auth-endpoints
- docs/05-component-structure.md#form-components

BEKLENTİLER:
- Çalışan login/register flow
- JWT token yönetimi
- Role-based routing
- Error handling
- Loading states
```

#### Job Marketplace Geliştirme

```
GÖREV: İş ilanları marketplace'ini geliştir

DETAYLAR:
- Job listing sayfası oluştur
- Filtering ve search
- Job detail sayfası
- Proposal submission
- Employer job creation
- Hibrit görüntüleme (docs/08-advanced-page-structure.md)

BAŞLANGIÇ NOKTALARI:
- docs/08-advanced-page-structure.md#marketplace-sayfaları
- docs/03-mock-api-services.md#jobs-endpoints
- docs/07-mock-data-examples.md#mock-jobs-data

BEKLENTİLER:
- Responsive job cards
- Advanced filtering
- Smooth transitions
- Infinite scroll
- SEO optimized
```

#### Component Library Development

```
GÖREV: Base UI component library'sini oluştur

DETAYLAR:
- Button, Input, Card, Modal componentleri
- Design system implementation
- Storybook integration (opsiyonel)
- TypeScript interfaces
- Accessibility support

BAŞLANGIÇ NOKTALARI:
- docs/05-component-structure.md#base-ui-components
- docs/05-component-structure.md#design-system-foundations

BEKLENTİLER:
- Reusable components
- Consistent design
- Type safety
- Documentation
- Test coverage
```

---

## 🔧 Development Workflow

### Her Geliştirme Oturumu İçin Checklist

#### Başlangıç (Her Seferinde)

- [ ] Mevcut proje durumunu değerlendir
- [ ] Güncel dokümantasyonu oku
- [ ] Git status kontrol et
- [ ] Node version kontrol et (v18+)
- [ ] Dependencies güncel mi kontrol et

#### Geliştirme Süreci

- [ ] Feature branch oluştur
- [ ] Component interface'lerini tanımla
- [ ] TypeScript types oluştur
- [ ] Mock API endpoint'leri implement et
- [ ] Component logic geliştir
- [ ] Styling uygula (Tailwind)
- [ ] Responsive test et
- [ ] Error handling ekle
- [ ] Loading states ekle

#### Bitirme (Her Seferinde)

- [ ] Code quality kontrol
- [ ] TypeScript errors fix
- [ ] ESLint warnings temizle
- [ ] Mobile responsive test
- [ ] Cross-browser basic test
- [ ] Git commit (meaningful message)
- [ ] Next steps belirt

### Code Quality Standards

#### TypeScript Usage

```typescript
// ✅ Good - Proper interface definition
interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  userType: 'freelancer' | 'employer';
  profile?: FreelancerProfile | EmployerProfile;
}

// ❌ Bad - Any usage
function handleUser(user: any) { ... }

// ✅ Good - Generic typing
function handleUser<T extends UserProfile>(user: T): T { ... }
```

#### Component Structure

```typescript
// ✅ Good - Proper component structure
interface ButtonProps {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  children,
  onClick,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center",
        variantClasses[variant],
        sizeClasses[size],
        loading && "opacity-50 cursor-not-allowed"
      )}
      disabled={loading}
      onClick={onClick}
      {...props}
    >
      {loading && <LoadingSpinner />}
      {children}
    </button>
  );
}
```

#### API Integration

```typescript
// ✅ Good - Proper SWR usage with error handling
function useJobs(filters?: JobFilters) {
  const { data, error, mutate } = useSWR(
    filters ? ["/api/jobs", filters] : "/api/jobs",
    ([url, filters]) => api.get(url, { params: filters })
  );

  return {
    jobs: data?.jobs || [],
    isLoading: !error && !data,
    isError: !!error,
    refetch: mutate,
  };
}
```

---

## 📁 File Organization Patterns

### Component Creation Pattern

```
components/
├── ui/
│   └── Button/
│       ├── Button.tsx         # Main component
│       ├── Button.types.ts    # TypeScript interfaces
│       ├── Button.test.tsx    # Tests (optional)
│       └── index.ts           # Exports
├── features/
│   └── jobs/
│       ├── JobCard/
│       ├── JobList/
│       ├── JobDetail/
│       └── index.ts
```

### Page Creation Pattern

```
app/
├── (auth)/
│   ├── login/
│   │   ├── page.tsx
│   │   └── loading.tsx
│   └── register/
│       ├── page.tsx
│       └── loading.tsx
├── jobs/
│   ├── page.tsx              # Job listing
│   ├── [id]/
│   │   └── page.tsx          # Job detail
│   └── loading.tsx
```

---

## 🧪 Testing Strategy

### Component Testing Template

```typescript
// components/ui/Button/Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./Button";

describe("Button Component", () => {
  it("renders correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("handles click events", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("shows loading state", () => {
    render(<Button loading>Loading</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
```

### API Testing Template

```typescript
// hooks/useAuth.test.ts
import { renderHook } from "@testing-library/react";
import { useAuth } from "./useAuth";
import { server } from "../mocks/server";

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("useAuth Hook", () => {
  it("login flow works correctly", async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login({
        email: "test@example.com",
        password: "password123",
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toBeDefined();
  });
});
```

---

## 🚀 Deployment Checklist

### Pre-deployment

- [ ] All TypeScript errors resolved
- [ ] All ESLint warnings fixed
- [ ] Build success (`npm run build`)
- [ ] Basic functionality tested
- [ ] Mobile responsive verified
- [ ] Environment variables set

### Production Considerations

- [ ] Performance audit (Lighthouse)
- [ ] SEO optimization
- [ ] Error boundaries implemented
- [ ] Loading states added
- [ ] 404 page created
- [ ] Sitemap generated

---

## 📞 Communication Patterns

### Progress Reporting Template

```
TAMAMLANAN GÖREVLER:
✅ Authentication component'leri oluşturuldu
✅ Login/Register sayfaları implement edildi
✅ Zustand auth store kuruldu
✅ Protected routes eklendi

MEVCUT DURUM:
🔄 Form validation implementation devam ediyor
🔄 Error handling ekleniyor

SONRAKI ADIMLAR:
⏳ Profile sayfası geliştirme
⏳ Dashboard layout oluşturma

KARŞILAŞILAN PROBLEMLER:
⚠️ MSW mock API bazı endpoint'lerde 404 veriyor
⚠️ Tailwind CSS classları bazen load olmuyor

ÖNERİLER:
💡 React Hook Form yerine simpler form handling önerilir
💡 Component library önce test edilmeli
```

### Code Review Template

```
COMPONENT: Button
DOSYA: components/ui/Button/Button.tsx

İNCELEME:
✅ TypeScript interfaces properly defined
✅ Props validation implemented
✅ Accessibility attributes added
⚠️ Missing error boundary
⚠️ Loading state could be improved

ÖNERİLER:
1. Error boundary wrapper ekle
2. Loading spinner customize et
3. Focus states improve et
4. Unit test coverage ekle
```

---

## 🎯 Success Metrics

### Development Quality Metrics

- **TypeScript Coverage**: >95%
- **Component Reusability**: >80%
- **Mobile Responsiveness**: 100%
- **Accessibility Score**: >90%
- **Performance Score**: >85%

### Feature Completeness Metrics

- **Authentication Flow**: 100% functional
- **User Profiles**: CRUD operations working
- **Job Marketplace**: Full workflow functional
- **Package System**: End-to-end working
- **Dashboard**: All user types supported

Bu talimatlar doğrultusunda AI agent, Marifeto projesini tutarlı ve kaliteli şekilde geliştirebilecek.
