# Kurulum ve Başlangıç Rehberi

## Proje Kurulumu

### 1. Sistem Gereksinimleri

#### Minimum Gereksinimler

- **Node.js**: v18.17.0 veya üzeri
- **npm**: v9.0.0 veya üzeri (veya yarn v1.22.0+)
- **Git**: v2.0.0 veya üzeri

#### Önerilen IDE Eklentileri

- **VS Code Extensions**:
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - TypeScript Importer
  - Prettier - Code formatter
  - ESLint
  - Auto Rename Tag
  - Bracket Pair Colorizer
  - GitLens

### 2. Proje Başlatma

#### Yeni Proje Oluşturma

```bash
# Next.js projesi oluştur
npx create-next-app@latest marifeto --typescript --tailwind --eslint --app

# Proje klasörüne geç
cd marifeto

# Ek bağımlılıkları yükle
npm install zustand swr react-hook-form zod @headlessui/react lucide-react date-fns

# Development bağımlılıkları
npm install -D msw @types/node @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier prettier-plugin-tailwindcss

# Proje başlat
npm run dev
```

#### package.json Konfigürasyonu

```json
{
  "name": "marifeto",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "type-check": "tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "zustand": "^4.4.0",
    "swr": "^2.2.0",
    "react-hook-form": "^7.45.0",
    "zod": "^3.22.0",
    "@headlessui/react": "^1.7.0",
    "lucide-react": "^0.263.1",
    "date-fns": "^2.30.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^1.14.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "eslint": "^8.0.0",
    "eslint-config-next": "^14.0.0",
    "msw": "^1.3.0",
    "prettier": "^3.0.0",
    "prettier-plugin-tailwindcss": "^0.5.0"
  }
}
```

### 3. Konfigürasyon Dosyaları

#### TypeScript Konfigürasyonu (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"],
      "@/components/*": ["./components/*"],
      "@/lib/*": ["./lib/*"],
      "@/types/*": ["./types/*"],
      "@/hooks/*": ["./hooks/*"],
      "@/utils/*": ["./utils/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### Tailwind CSS Konfigürasyonu (tailwind.config.js)

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        secondary: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "bounce-slow": "bounce 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
```

#### ESLint Konfigürasyonu (.eslintrc.json)

```json
{
  "extends": ["next/core-web-vitals", "@typescript-eslint/recommended"],
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

#### Prettier Konfigürasyonu (.prettierrc)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### 4. Proje Yapısı Oluşturma

#### Klasör Yapısı

```bash
mkdir -p app/{(auth)/login,(auth)/register,(dashboard)/freelancer,(dashboard)/employer,jobs,packages,profile}
mkdir -p components/{ui,layout,features,forms,mobile,providers,loading,error,animations}
mkdir -p lib/{api,store,utils,validations}
mkdir -p types
mkdir -p hooks
mkdir -p public/{images,icons,avatars}
mkdir -p mocks
mkdir -p docs
mkdir -p tests
```

#### Temel Dosya Oluşturma

```bash
# Global styles
touch app/globals.css

# Layout dosyası
touch app/layout.tsx

# Ana sayfa
touch app/page.tsx

# Utility dosyaları
touch lib/utils.ts
touch lib/cn.ts
touch lib/api/client.ts

# Type definitions
touch types/index.ts
touch types/api.ts
touch types/auth.ts

# Store dosyaları
touch lib/store/index.ts
touch lib/store/auth-slice.ts
touch lib/store/ui-slice.ts
```

### 5. Mock Service Worker (MSW) Kurulumu

#### MSW Konfigürasyonu

```typescript
// mocks/handlers.ts
import { rest } from "msw";

export const handlers = [
  // Auth endpoints
  rest.post("/api/auth/login", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        user: {
          id: "user_123",
          email: "user@example.com",
          firstName: "John",
          lastName: "Doe",
          userType: "freelancer",
        },
        token: "mock_jwt_token",
      })
    );
  }),

  rest.post("/api/auth/register", (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        success: true,
        user: {
          id: "user_456",
          email: "newuser@example.com",
        },
      })
    );
  }),

  // Jobs endpoints
  rest.get("/api/jobs", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        jobs: mockJobs,
        pagination: {
          page: 1,
          limit: 20,
          total: 100,
        },
      })
    );
  }),
];
```

```typescript
// mocks/browser.ts
import { setupWorker } from "msw";
import { handlers } from "./handlers";

export const worker = setupWorker(...handlers);
```

```typescript
// mocks/server.ts
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
```

#### MSW Browser Setup

```typescript
// app/layout.tsx
if (process.env.NODE_ENV === "development") {
  if (typeof window === "undefined") {
    // Server-side
    const { server } = await import("../mocks/server");
    server.listen();
  } else {
    // Client-side
    const { worker } = await import("../mocks/browser");
    worker.start();
  }
}
```

### 6. Temel Component'ler Oluşturma

#### Utility Functions

```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = "TRY") {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
  }).format(amount);
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}
```

#### Button Component

```typescript
// components/ui/Button.tsx
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses =
    "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

  const variantClasses = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 focus-visible:ring-primary-500",
    secondary:
      "bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus-visible:ring-secondary-500",
    outline:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    danger: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500",
  };

  const sizeClasses = {
    sm: "h-9 rounded-md px-3 text-sm",
    md: "h-10 rounded-md px-4 text-sm",
    lg: "h-11 rounded-md px-8 text-base",
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {leftIcon && !loading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
}
```

#### Layout Component

```typescript
// components/layout/AppLayout.tsx
import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
```

### 7. Environment Variables

#### .env.local Dosyası

```bash
# .env.local
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Mock API anahtarları (geliştirme için)
NEXT_PUBLIC_MOCK_API=true

# Üçüncü parti servisler (sonradan eklenecek)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
# NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
```

#### .env.example Dosyası

```bash
# .env.example
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_MOCK_API=true
```

### 8. Git Konfigürasyonu

#### .gitignore Güncelleme

```bash
# .gitignore
# Dependencies
node_modules/
.pnp
.pnp.js

# Production build
.next/
out/
build/

# Environment variables
.env*.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Testing
.nyc_output
```

### 9. Development Scripts

#### Geliştirme Komutları

```bash
# Development server başlat
npm run dev

# Production build
npm run build

# Production server
npm start

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check

# Formatting
npm run format
npm run format:check

# Testing (kurulacak)
npm run test
npm run test:watch
npm run test:coverage
```

### 10. IDE Konfigürasyonu

#### VS Code Settings (.vscode/settings.json)

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "emmet.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "tailwindCSS.includeLanguages": {
    "typescript": "html",
    "typescriptreact": "html"
  },
  "files.associations": {
    "*.css": "tailwindcss"
  }
}
```

#### VS Code Extensions (.vscode/extensions.json)

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "ms-vscode.vscode-json"
  ]
}
```

### 11. İlk Commit

```bash
# Git repository başlat (eğer henüz başlatılmadıysa)
git init

# Dosyaları stage'e ekle
git add .

# İlk commit
git commit -m "Initial project setup with Next.js, TypeScript, Tailwind CSS, and MSW"

# Remote repository ekle (GitHub/GitLab)
git remote add origin https://github.com/username/marifeto.git

# Push
git push -u origin main
```

### 12. Sonraki Adımlar

#### Hemen Yapılacaklar

1. **Mock API handlers** - Tüm endpoint'leri implement et
2. **Type definitions** - API response type'larını tanımla
3. **Temel components** - Button, Input, Card gibi temel UI bileşenleri
4. **Authentication** - Login/register sayfaları ve auth logic

#### Orta Vadeli Hedefler

1. **Data fetching** - SWR integration ve custom hooks
2. **Form handling** - React Hook Form integration
3. **State management** - Zustand store'ları
4. **Responsive design** - Mobile-first approach

#### Uzun Vadeli Hedefler

1. **Testing setup** - Jest ve React Testing Library
2. **Performance optimization** - Bundle analysis ve optimization
3. **Accessibility** - WCAG compliance
4. **Documentation** - Storybook integration

### 13. Troubleshooting

#### Yaygın Sorunlar ve Çözümleri

**Node.js versiyonu uyumsuzluğu:**

```bash
# Node version manager kullan
nvm install 18
nvm use 18
```

**Port çakışması:**

```bash
# Farklı port kullan
npm run dev -- -p 3001
```

**Type errors:**

```bash
# TypeScript cache temizle
rm -rf .next
npm run build
```

**MSW çalışmıyor:**

```bash
# Public klasöründe mockServiceWorker.js var mı kontrol et
npx msw init public/ --save
```

Bu kurulum rehberi ile Marifeto projesinin temel altyapısı hazır hale gelecek ve ekip direkt olarak feature development'a başlayabilecek.
