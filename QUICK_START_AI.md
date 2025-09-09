# Marifeto - AI Agent Development Quick Start

## 🎯 Proje Özeti

"Marifeto" - Freelancer ve İşveren eşleştirme platformu (Hibrit Bionluk + Armut model)

**Teknoloji Stack:** Next.js 14, TypeScript, Tailwind CSS, Zustand, SWR, Mock API
**Yaklaşım:** AI Agent ile dokümantasyon-driven development

---

## 🚀 AI Agent ile Geliştirme

### Ana Komut

```
Dosya: AI_AGENT_MASTER_PROMPT.md

Bu prompt'u kopyalayıp AI agent'a vererek geliştirme başlatabilirsiniz.
Her görev için spesifik talimat ekleyerek iterative development yapın.
```

### İlk Görev Başlatma

```
[AI_AGENT_MASTER_PROMPT.md içeriğini kopyala]

GÖREV: Proje foundation'ını kur
Phase 1.1'i tamamla - docs/04-ai-optimized-development-plan.md referans al
```

---

## 📁 Proje Kurulumu (Manuel)

```bash
# 1. Proje oluştur
npx create-next-app@latest marifeto --typescript --tailwind --eslint --app
cd marifeto

# 2. Bağımlılıkları yükle
npm install zustand swr react-hook-form zod @headlessui/react lucide-react date-fns clsx tailwind-merge
npm install -D msw @types/node prettier prettier-plugin-tailwindcss

# 3. MSW init
npx msw init public/ --save

# 4. Projeyi başlat
npm run dev
```

---

## 🎯 AI Agent Geliştirme Aşamaları

### ✅ Phase 1: Foundation & Auth (2 hafta)

- [ ] **Görev 1.1**: Project foundation setup
- [ ] **Görev 1.2**: Authentication system
- [ ] Beklenen: Login/Register, protected routes, base components

### 🚧 Phase 2: Core Marketplace (3 hafta)

- [ ] **Görev 2.1**: Hibrit marketplace system
- [ ] **Görev 2.2**: Detail pages & interactions
- [ ] **Görev 2.3**: User profiles & management
- [ ] Beklenen: Services/Jobs browsing, proposals, profiles

### 📋 Phase 3: Dashboard & Polish (2 hafta)

- [ ] **Görev 3.1**: Smart dashboard system
- [ ] **Görev 3.2**: Mobile optimization & polish
- [ ] Beklenen: Role-based dashboards, mobile experience

---

## 📚 Dokümantasyon Hiyerarşisi

### 🏗️ Mimari & Setup

1. **README.md** - Genel proje bilgileri
2. **docs/01-frontend-architecture.md** - Teknoloji stack
3. **docs/06-setup-guide.md** - Detaylı kurulum

### 🎨 Tasarım & UX

4. **docs/02-user-flows-screens.md** - UX/UI spesifikasyonları
5. **docs/08-advanced-page-structure.md** - Hibrit sayfa yapısı
6. **docs/05-component-structure.md** - Component library

### 🔗 API & Veri

7. **docs/03-mock-api-services.md** - Endpoint tanımları
8. **docs/07-mock-data-examples.md** - Test verileri

### 🤖 AI Development

9. **docs/09-ai-agent-instructions.md** - AI talimatları
10. **docs/04-ai-optimized-development-plan.md** - Sprint planı
11. **AI_AGENT_MASTER_PROMPT.md** - Ana geliştirme prompt'u

---

## 🛠️ Development Commands

```bash
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint check
npm run type-check   # TypeScript check
npm run format       # Prettier format
```

---

## 🎯 Özellik Özeti

### Hibrit Platform Yaklaşımı

- **Tek Uygulama**: Hem freelancer hem employer content
- **Smart Toggle**: Services ⟷ Jobs geçiş
- **Role-based UI**: Kullanıcı tipine göre özelleştirilmiş deneyim
- **Mobile-first**: Touch-optimized design

### Core Features

- **Authentication**: JWT-based, role selection
- **Marketplace**: Services ve jobs browsing
- **Profiles**: Freelancer/employer profilleri
- **Proposals**: Teklif verme sistemi
- **Dashboard**: Role-based dashboard'lar
- **Mobile**: Native-like mobile experience

### Technical Features

- **TypeScript Strict**: %95+ type coverage
- **Component-driven**: Reusable UI library
- **Performance**: Code splitting, lazy loading
- **Accessibility**: WCAG guidelines
- **Testing**: Mock API ile isolated testing

---

## 🚀 AI Agent Usage Examples

### Foundation Setup

```
GÖREV: Proje foundation'ını kur

Adımlar:
1. Next.js 14 projesi oluştur
2. Base UI components (Button, Input, Card)
3. Layout structure
4. MSW mock API setup
5. TypeScript konfigürasyonu

Referans: docs/06-setup-guide.md
```

### Authentication Development

```
GÖREV: Authentication sistemini geliştir

Features:
- Login/Register sayfaları
- Form validation (React Hook Form + Zod)
- Zustand auth store
- Protected routes
- User type selection

Referans: docs/02-user-flows-screens.md#authentication
```

### Marketplace Development

```
GÖREV: Hibrit marketplace'i geliştir

Features:
- /marketplace ana sayfası
- Services ⟷ Jobs toggle
- Filtering & search
- Responsive card layouts
- Infinite scroll

Referans: docs/08-advanced-page-structure.md#marketplace
```

---

## 📊 Success Metrics

### Development Quality

- ✅ TypeScript strict mode (0 errors)
- ✅ Mobile responsive (100%)
- ✅ Performance score (>85)
- ✅ Accessibility (>90)
- ✅ Clean code standards

### Feature Completeness

- ✅ End-to-end user flows working
- ✅ Error handling implemented
- ✅ Loading states added
- ✅ Cross-browser compatibility
- ✅ Documentation updated

---

## 🔄 Iterative Development

### Workflow Pattern

1. **Dokümantasyon okuma**
2. **Feature development**
3. **Quality check**
4. **Progress report**
5. **Next iteration planning**

### Continuous Integration

- Her major feature sonrası code review
- Responsive breakpoint testing
- Performance audit
- Accessibility check

Bu quick start ile AI agent'ı kullanarak Marifeto projesini verimli şekilde geliştirebilirsiniz! 🚀
