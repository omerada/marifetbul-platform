# Component Yapısı ve Tasarım Sistemi

## Design System Foundations

### Color Palette

```css
/* Primary Colors */
--primary-50: #eff6ff;
--primary-100: #dbeafe;
--primary-500: #3b82f6;
--primary-600: #2563eb;
--primary-700: #1d4ed8;

/* Secondary Colors */
--secondary-50: #f8fafc;
--secondary-100: #f1f5f9;
--secondary-500: #64748b;
--secondary-600: #475569;
--secondary-700: #334155;

/* Success, Warning, Error */
--success-500: #10b981;
--warning-500: #f59e0b;
--error-500: #ef4444;

/* Neutral Colors */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-200: #e5e7eb;
--gray-300: #d1d5db;
--gray-400: #9ca3af;
--gray-500: #6b7280;
--gray-600: #4b5563;
--gray-700: #374151;
--gray-800: #1f2937;
--gray-900: #111827;
```

### Typography Scale

```css
/* Font Sizes */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Spacing System

```css
/* Spacing Scale (4px base) */
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-5: 1.25rem; /* 20px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-10: 2.5rem; /* 40px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
```

---

## Base UI Components

### 1. Button Component

```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
}

// Usage Examples:
<Button variant="primary" size="lg">Teklif Ver</Button>
<Button variant="outline" leftIcon={<PlusIcon />}>Yeni İlan</Button>
<Button variant="danger" loading>Siliniyor...</Button>
```

#### Button Variants

- **Primary**: Ana aksiyonlar (CTA buttons)
- **Secondary**: İkincil aksiyonlar
- **Outline**: Düşük öncelikli aksiyonlar
- **Ghost**: Minimal style aksiyonlar
- **Danger**: Destructive aksiyonlar

### 2. Input Components

```typescript
// components/ui/Input.tsx
interface InputProps {
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  type?: "text" | "email" | "password" | "number" | "tel";
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  value?: string;
  onChange?: (value: string) => void;
}

// components/ui/TextArea.tsx
interface TextAreaProps extends Omit<InputProps, "type"> {
  rows?: number;
  maxLength?: number;
  showCount?: boolean;
}

// components/ui/Select.tsx
interface SelectProps {
  label?: string;
  placeholder?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
  value?: string;
  onChange?: (value: string) => void;
  multiple?: boolean;
  searchable?: boolean;
}
```

### 3. Card Component

```typescript
// components/ui/Card.tsx
interface CardProps {
  variant?: "default" | "outlined" | "elevated";
  padding?: "sm" | "md" | "lg";
  hover?: boolean;
  clickable?: boolean;
  children: React.ReactNode;
  className?: string;
}

// Usage:
<Card variant="elevated" hover>
  <CardHeader>
    <CardTitle>İş İlanı Başlığı</CardTitle>
    <CardMeta>2 saat önce</CardMeta>
  </CardHeader>
  <CardContent>İş açıklaması...</CardContent>
  <CardFooter>
    <Button>Detayları Gör</Button>
  </CardFooter>
</Card>;
```

### 4. Modal Component

```typescript
// components/ui/Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  closeOnOverlayClick?: boolean;
  children: React.ReactNode;
}

// Usage:
<Modal isOpen={isOpen} onClose={handleClose} title="Teklif Ver">
  <ProposalForm onSubmit={handleSubmit} />
</Modal>;
```

### 5. Toast Notification

```typescript
// components/ui/Toast.tsx
interface ToastProps {
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

// Usage:
toast.success("Profil başarıyla güncellendi!");
toast.error("Bir hata oluştu", "Lütfen tekrar deneyin");
```

---

## Layout Components

### 1. App Layout

```typescript
// components/layout/AppLayout.tsx
interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  sidebarContent?: React.ReactNode;
}

// Layout Structure:
<AppLayout>
  <Header />
  <main className="min-h-screen">
    {showSidebar && <Sidebar />}
    <div className="flex-1">{children}</div>
  </main>
  <Footer />
</AppLayout>;
```

### 2. Header Component

```typescript
// components/layout/Header.tsx
interface HeaderProps {
  user?: User;
  notifications?: Notification[];
}

// Header Sections:
<Header>
  <HeaderLeft>
    <Logo />
    <Navigation />
  </HeaderLeft>
  <HeaderCenter>
    <SearchBar />
  </HeaderCenter>
  <HeaderRight>
    <NotificationBell />
    <UserMenu />
  </HeaderRight>
</Header>;
```

### 3. Sidebar Component

```typescript
// components/layout/Sidebar.tsx
interface SidebarProps {
  userType: "freelancer" | "employer";
  currentPath: string;
}

// Sidebar Navigation Items:
const freelancerNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { label: "İş İlanları", href: "/jobs", icon: BriefcaseIcon },
  { label: "Tekliflerim", href: "/proposals", icon: DocumentIcon },
  { label: "Paketlerim", href: "/packages", icon: PackageIcon },
  { label: "Mesajlar", href: "/messages", icon: ChatIcon },
  { label: "Profil", href: "/profile", icon: UserIcon },
];

const employerNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { label: "İlanlarım", href: "/my-jobs", icon: BriefcaseIcon },
  { label: "Freelancerlar", href: "/freelancers", icon: UsersIcon },
  { label: "Projelerim", href: "/projects", icon: FolderIcon },
  { label: "Mesajlar", href: "/messages", icon: ChatIcon },
  { label: "Profil", href: "/profile", icon: UserIcon },
];
```

---

## Feature-Specific Components

### 1. Job Components

```typescript
// components/jobs/JobCard.tsx
interface JobCardProps {
  job: Job;
  variant?: "list" | "grid";
  showProposalCount?: boolean;
  actionButton?: React.ReactNode;
}

// components/jobs/JobDetail.tsx
interface JobDetailProps {
  job: Job;
  canApply?: boolean;
  onApply?: () => void;
}

// components/jobs/JobForm.tsx
interface JobFormProps {
  initialData?: Partial<Job>;
  onSubmit: (data: JobFormData) => void;
  isLoading?: boolean;
}
```

### 2. Package Components

```typescript
// components/packages/PackageCard.tsx
interface PackageCardProps {
  package: Package;
  variant?: "list" | "grid";
  showFreelancer?: boolean;
}

// components/packages/PackageDetail.tsx
interface PackageDetailProps {
  package: Package;
  onOrder?: (tier: PackageTier) => void;
}

// components/packages/PackagePricing.tsx
interface PackagePricingProps {
  pricing: PackagePricing;
  selectedTier?: PackageTier;
  onTierSelect: (tier: PackageTier) => void;
}
```

### 3. Profile Components

```typescript
// components/profile/ProfileCard.tsx
interface ProfileCardProps {
  user: User;
  variant?: "compact" | "detailed";
  showContact?: boolean;
}

// components/profile/ProfileEdit.tsx
interface ProfileEditProps {
  user: User;
  userType: "freelancer" | "employer";
  onSave: (data: ProfileData) => void;
}

// components/profile/SkillsSelector.tsx
interface SkillsSelectorProps {
  selectedSkills: string[];
  onSkillsChange: (skills: string[]) => void;
  maxSkills?: number;
}
```

### 4. Dashboard Components

```typescript
// components/dashboard/StatsCard.tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: "increase" | "decrease";
  };
  icon?: React.ReactNode;
}

// components/dashboard/ActivityFeed.tsx
interface ActivityFeedProps {
  activities: Activity[];
  showAll?: boolean;
}

// components/dashboard/QuickActions.tsx
interface QuickActionsProps {
  userType: "freelancer" | "employer";
  actions: QuickAction[];
}
```

### 5. Form Components

```typescript
// components/forms/ProposalForm.tsx
interface ProposalFormProps {
  job: Job;
  onSubmit: (data: ProposalData) => void;
  isLoading?: boolean;
}

// components/forms/SearchForm.tsx
interface SearchFormProps {
  initialQuery?: string;
  filters?: SearchFilters;
  onSearch: (query: string, filters: SearchFilters) => void;
}

// components/forms/FileUpload.tsx
interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  maxFiles?: number;
  onFilesChange: (files: File[]) => void;
}
```

---

## Mobile-Specific Components

### 1. Mobile Navigation

```typescript
// components/mobile/MobileNav.tsx
interface MobileNavProps {
  userType: "freelancer" | "employer";
  currentPath: string;
}

// Bottom Tab Navigation:
const mobileNavItems = [
  { label: "Ana Sayfa", href: "/dashboard", icon: HomeIcon },
  { label: "Arama", href: "/search", icon: SearchIcon },
  { label: "Mesajlar", href: "/messages", icon: ChatIcon },
  { label: "Profil", href: "/profile", icon: UserIcon },
];
```

### 2. Mobile Modals

```typescript
// components/mobile/BottomSheet.tsx
interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  height?: "auto" | "half" | "full";
  children: React.ReactNode;
}

// Usage for mobile filters:
<BottomSheet isOpen={showFilters} onClose={() => setShowFilters(false)}>
  <FilterPanel onApply={handleFilterApply} />
</BottomSheet>;
```

### 3. Swipe Components

```typescript
// components/mobile/SwipeableCard.tsx
interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: React.ReactNode;
    color: string;
    label: string;
  };
  rightAction?: {
    icon: React.ReactNode;
    color: string;
    label: string;
  };
}
```

---

## State Management Components

### 1. Data Providers

```typescript
// components/providers/AuthProvider.tsx
interface AuthProviderProps {
  children: React.ReactNode;
}

// components/providers/ThemeProvider.tsx
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: "light" | "dark" | "system";
}

// components/providers/ToastProvider.tsx
interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToastPosition;
}
```

### 2. Data Hooks

```typescript
// hooks/useAuth.ts
export function useAuth() {
  return {
    user,
    isAuthenticated,
    login,
    logout,
    register,
    updateProfile,
  };
}

// hooks/useJobs.ts
export function useJobs(filters?: JobFilters) {
  return {
    jobs,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
    refetch,
  };
}

// hooks/usePackages.ts
export function usePackages(filters?: PackageFilters) {
  return {
    packages,
    isLoading,
    error,
    hasNextPage,
    fetchNextPage,
  };
}
```

---

## Animation & Transition Components

### 1. Page Transitions

```typescript
// components/animations/PageTransition.tsx
interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

// Usage:
<PageTransition>
  <JobListPage />
</PageTransition>;
```

### 2. Loading States

```typescript
// components/loading/LoadingSkeleton.tsx
interface LoadingSkeletonProps {
  variant: "card" | "list" | "profile" | "text";
  count?: number;
}

// components/loading/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  text?: string;
}
```

### 3. Error Boundaries

```typescript
// components/error/ErrorBoundary.tsx
interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error }>;
}

// components/error/ErrorFallback.tsx
interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}
```

---

## Component Organization Strategy

### Folder Structure

```
components/
├── ui/                    # Base design system components
│   ├── Button/
│   ├── Input/
│   ├── Card/
│   └── Modal/
├── layout/                # Layout-related components
│   ├── Header/
│   ├── Footer/
│   ├── Sidebar/
│   └── AppLayout/
├── features/              # Feature-specific components
│   ├── jobs/
│   ├── packages/
│   ├── profile/
│   └── dashboard/
├── forms/                 # Form components
│   ├── JobForm/
│   ├── ProposalForm/
│   └── ProfileForm/
├── mobile/                # Mobile-specific components
│   ├── MobileNav/
│   ├── BottomSheet/
│   └── SwipeableCard/
├── providers/             # Context providers
├── loading/               # Loading states
├── error/                 # Error handling
└── animations/            # Animation components
```

### Component Naming Conventions

- **PascalCase** for component names
- **camelCase** for props and functions
- **kebab-case** for CSS classes
- **UPPERCASE** for constants

### Component Export Strategy

```typescript
// components/ui/Button/index.ts
export { Button } from "./Button";
export type { ButtonProps } from "./Button";

// components/ui/index.ts
export * from "./Button";
export * from "./Input";
export * from "./Card";
```

### Component Documentation

- Each component has TypeScript interfaces
- Props documentation with JSDoc
- Usage examples in Storybook
- Responsive behavior notes
