# 🚀 SPRINT 2: Dashboard Consolidation & Role-Based Routing

**Sprint Duration:** 10 gün (26 Ekim - 8 Kasım 2025)  
**Priority:** HIGH 🟡  
**Complexity:** Medium-High  
**Risk Level:** Medium

---

## 📊 Sprint Overview

### Hedefler

1. **Terminology Standardization**: `customer` → `employer` migration
2. **Role-Based Auto-Redirect**: `/dashboard` otomatik yönlendirme
3. **Route Cleanup**: `/dashboard/customer/orders` → `/dashboard/employer/orders`
4. **Settings Consolidation**: Shared settings component architecture
5. **Component Reusability**: OrdersPage generic hale getirme

### Tespit Edilen Sorunlar

#### 🔴 CRITICAL: Inconsistent Terminology

**Backend:** `EMPLOYER` (UserRole.EMPLOYER)  
**Frontend Inconsistency:**

- ✅ `types/shared/unified.ts`: `UserType = 'employer'`
- ✅ `components/domains/dashboard/DashboardSidebar.tsx`: `user.role === 'employer'`
- ❌ `/dashboard/customer/orders`: **WRONG TERMINOLOGY**
- ✅ `/dashboard/employer/*`: Correct structure

**Problem:**

```
/dashboard/customer/orders  ← ❌ "customer" is not a valid role
/dashboard/employer/orders  ← ✅ Correct role-based route
```

Backend'de "customer" role'ü yok! Sadece: `FREELANCER`, `EMPLOYER`, `ADMIN`, `MODERATOR`

#### 🟡 Dashboard Root Redirect

**Current State:**

```typescript
// app/dashboard/page.tsx
export default function DashboardPage() {
  // For now, redirect to freelancer dashboard by default
  redirect('/dashboard/freelancer');
}
```

**Problem:**

- Hard-coded freelancer redirect
- Employer users see wrong dashboard briefly
- Not using auth context

#### 🟢 Settings Pages Structure

**Current:**

```
/dashboard/settings
  /general
  /notifications
  /payment
  /privacy
  /security
  /templates
```

**Analysis:** Settings are role-agnostic (shared) ✅

---

## 📋 Sprint 2 Task Breakdown

### **Story 2.1: Customer → Employer Terminology Migration**

**Priority:** CRITICAL 🔴  
**Estimation:** 2 gün  
**Assignee:** Frontend Lead

#### Subtasks

##### 2.1.1: Delete `/dashboard/customer/orders` Route

**Time:** 30 min

**Actions:**

```bash
# 1. Backup önce (git commit)
git add -A
git commit -m "Pre-Sprint2: Backup before customer route deletion"

# 2. Route'u sil
Remove-Item -Recurse -Force app/dashboard/customer/

# 3. Verify no references
grep -r "dashboard/customer" app/ components/ lib/
```

**Verification:**

- [ ] Folder deleted
- [ ] No broken imports
- [ ] No broken links

##### 2.1.2: Audit "customer" References in Codebase

**Time:** 1 saat

**Search Patterns:**

```bash
# Find all "customer" usages
grep -r "customer" app/ components/ lib/ types/ --include="*.ts" --include="*.tsx"

# Check for:
- Variable names: customerOrders, customerData
- Type names: CustomerType, CustomerProfile
- API routes: /api/customer/*
- Comments: "customer dashboard"
```

**Action Plan:**

- If "customer" means "buyer" (employer) → rename to `employer`
- If "customer" means "client" (generic user) → rename to `buyer` or `client`
- Backend terminology: `EMPLOYER` is the buyer role

##### 2.1.3: Update Type Definitions

**Time:** 1 saat

**Files to Check:**

```typescript
// types/shared/unified.ts
export type UserType = 'freelancer' | 'employer' | 'admin'; // ✅ Already correct

// types/business/features/marketplace.ts
- Check for "customer" references
- Ensure alignment with backend DTOs

// types/backend-aligned.ts
- Verify enum consistency
```

**Acceptance Criteria:**

- [ ] No `UserType = 'customer'` anywhere
- [ ] All role checks use `'employer'`
- [ ] TypeScript compilation passes

##### 2.1.4: Update API Layer

**Time:** 1.5 saat

**Files:**

```typescript
// lib/api/orders.ts
export async function getBuyerOrders() {
  // Already uses "buyer" terminology ✅
}

// Check for:
- API endpoint paths with "customer"
- Query parameters with "customer"
- Response type mappings
```

**Backend Alignment Check:**

```java
// Backend uses:
Order.buyer (User)      // The employer who purchased
Order.seller (User)     // The freelancer providing service

// Frontend should match:
order.buyerId    → employer's ID
order.sellerId   → freelancer's ID
```

##### 2.1.5: Update Components

**Time:** 2 saat

**Affected Components:**

```typescript
// Search pattern
grep -r "customer" components/ --include="*.tsx"

// Likely candidates:
- components/domains/orders/OrderCard.tsx
- components/domains/dashboard/DashboardStats.tsx
- components/dashboard/DashboardClient.tsx
```

**Rename Strategy:**

```typescript
// Before:
const isCustomer = user.role === 'customer'; // ❌

// After:
const isEmployer = user.role === 'employer'; // ✅
```

##### 2.1.6: Update Documentation & Comments

**Time:** 30 min

**Files:**

```
README.md
CONTRIBUTING.md (if exists)
Component docstrings
Code comments
```

**Search & Replace:**

```
"customer dashboard" → "employer dashboard"
"customer role" → "employer role"
"customer orders" → "buyer orders" (context-dependent)
```

---

### **Story 2.2: Role-Based Dashboard Auto-Redirect**

**Priority:** HIGH 🟡  
**Estimation:** 1.5 gün  
**Assignee:** Frontend Dev

#### Subtasks

##### 2.2.1: Update Dashboard Root Page

**Time:** 1 saat

**Implementation:**

```typescript
// app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { Loading } from '@/components/ui';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading && user) {
      // Role-based redirect
      switch (user.role) {
        case 'freelancer':
          router.replace('/dashboard/freelancer');
          break;
        case 'employer':
          router.replace('/dashboard/employer');
          break;
        case 'admin':
          router.replace('/admin');
          break;
        default:
          // Fallback for unknown roles
          router.replace('/');
      }
    } else if (!isLoading && !user) {
      // Not authenticated
      router.replace('/login');
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Loading size="lg" text="Yönlendiriliyor..." />
    </div>
  );
}
```

**Acceptance Criteria:**

- [ ] Freelancers → `/dashboard/freelancer`
- [ ] Employers → `/dashboard/employer`
- [ ] Admins → `/admin`
- [ ] Unauthenticated → `/login`
- [ ] No flash of wrong content

##### 2.2.2: Add Middleware Protection

**Time:** 2 saat

**File:** `middleware.ts`

**Add Dashboard Route Protection:**

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Dashboard role-based protection
  if (pathname.startsWith('/dashboard/freelancer')) {
    const userRole = request.cookies.get('user_role')?.value;
    if (userRole !== 'freelancer' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (pathname.startsWith('/dashboard/employer')) {
    const userRole = request.cookies.get('user_role')?.value;
    if (userRole !== 'employer' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

**Note:** This requires setting `user_role` cookie on login.

##### 2.2.3: Update Auth Store to Set Role Cookie

**Time:** 1 saat

**File:** `lib/core/store/domains/auth/authStore.ts`

```typescript
// In login success handler
const setUserRoleCookie = (role: string) => {
  document.cookie = `user_role=${role}; path=/; max-age=86400; SameSite=Strict`;
};

// Call after successful login
setUserRoleCookie(user.role);
```

##### 2.2.4: Navigation Link Updates

**Time:** 1.5 saat

**Problem:** Some navigation links use `/dashboard` directly

**Files to Update:**

```typescript
// components/layout/Header.tsx
// components/layout/MobileMenu.tsx
// components/layout/Footer.tsx (if has dashboard link)
// components/shared/UserMenu.tsx (if exists)
```

**Strategy:**

```typescript
// Before:
<Link href="/dashboard">Dashboard</Link>

// After:
const dashboardLink = useMemo(() => {
  if (!user) return '/login';
  switch (user.role) {
    case 'freelancer': return '/dashboard/freelancer';
    case 'employer': return '/dashboard/employer';
    case 'admin': return '/admin';
    default: return '/dashboard';
  }
}, [user]);

<Link href={dashboardLink}>Dashboard</Link>
```

**Or use utility function:**

```typescript
// lib/utils/navigation.ts
export function getDashboardRoute(userRole?: string): string {
  switch (userRole) {
    case 'freelancer': return '/dashboard/freelancer';
    case 'employer': return '/dashboard/employer';
    case 'admin': return '/admin';
    default: return '/dashboard';
  }
}
```

##### 2.2.5: Add Dashboard Navigation to lib/config/navigation.ts

**Time:** 1 saat

**Extend existing navigation config:**

```typescript
// lib/config/navigation.ts

export interface DashboardNavigation {
  freelancer: NavigationItem[];
  employer: NavigationItem[];
  shared: NavigationItem[];
}

export const dashboardNavigation: DashboardNavigation = {
  freelancer: [
    { label: 'Genel Bakış', href: '/dashboard/freelancer', icon: 'LayoutDashboard' },
    { label: 'Paketlerim', href: '/dashboard/freelancer/packages', icon: 'Package' },
    { label: 'Siparişler', href: '/dashboard/freelancer/orders', icon: 'Briefcase' },
    // ... rest
  ],
  employer: [
    { label: 'Genel Bakış', href: '/dashboard/employer', icon: 'LayoutDashboard' },
    { label: 'İş İlanları', href: '/dashboard/employer/jobs', icon: 'Briefcase' },
    { label: 'Siparişler', href: '/dashboard/employer/orders', icon: 'Package' },
    // ... rest
  ],
  shared: [
    { label: 'Mesajlar', href: '/messages', icon: 'MessageSquare' },
    { label: 'Ayarlar', href: '/dashboard/settings', icon: 'Settings' },
  ],
};

export function getDashboardNavigation(role: 'freelancer' | 'employer') {
  return [...dashboardNavigation[role], ...dashboardNavigation.shared];
}
```

---

### **Story 2.3: Settings Pages Consolidation**

**Priority:** MEDIUM 🟡  
**Estimation:** 1.5 gün  
**Assignee:** Frontend Dev

#### Analysis

**Current Structure:** ✅ Already well-organized

```
/dashboard/settings (layout + main page)
  /general (name, bio, avatar)
  /notifications (email, push preferences)
  /payment (payment methods, billing)
  /privacy (profile visibility)
  /security (password, 2FA)
  /templates (message templates - FREELANCER ONLY)
```

#### Subtasks

##### 2.3.1: Add Settings Navigation Component

**Time:** 2 saat

**Create:** `components/domains/settings/SettingsNav.tsx`

```typescript
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import {
  User,
  Bell,
  CreditCard,
  Shield,
  Lock,
  FileText,
} from 'lucide-react';

interface SettingsNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: ('freelancer' | 'employer' | 'admin')[];
}

export function SettingsNav() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const navItems: SettingsNavItem[] = [
    {
      label: 'Genel',
      href: '/dashboard/settings/general',
      icon: <User className="h-5 w-5" />,
    },
    {
      label: 'Bildirimler',
      href: '/dashboard/settings/notifications',
      icon: <Bell className="h-5 w-5" />,
    },
    {
      label: 'Ödeme',
      href: '/dashboard/settings/payment',
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      label: 'Gizlilik',
      href: '/dashboard/settings/privacy',
      icon: <Shield className="h-5 w-5" />,
    },
    {
      label: 'Güvenlik',
      href: '/dashboard/settings/security',
      icon: <Lock className="h-5 w-5" />,
    },
    {
      label: 'Mesaj Şablonları',
      href: '/dashboard/settings/templates',
      icon: <FileText className="h-5 w-5" />,
      roles: ['freelancer'], // Only for freelancers
    },
  ];

  // Filter items by role
  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user?.role as any)
  );

  return (
    <nav className="space-y-1">
      {visibleItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
```

##### 2.3.2: Create Settings Layout

**Time:** 1 saat

**Update:** `app/dashboard/settings/layout.tsx`

```typescript
import { SettingsNav } from '@/components/domains/settings';

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
        <p className="mt-2 text-gray-600">
          Hesap ve tercih ayarlarınızı yönetin
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Settings Navigation - Left Sidebar */}
        <aside className="lg:col-span-1">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <SettingsNav />
          </div>
        </aside>

        {/* Settings Content - Main Area */}
        <main className="lg:col-span-3">{children}</main>
      </div>
    </div>
  );
}
```

##### 2.3.3: Role-Specific Settings Logic

**Time:** 1.5 saat

**Implementation:** Hide/show features based on role

**Example:** Payment Settings

```typescript
// app/dashboard/settings/payment/page.tsx
'use client';

import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';

export default function PaymentSettingsPage() {
  const { user } = useAuthStore();
  const isFreelancer = user?.role === 'freelancer';

  return (
    <div className="space-y-6">
      <h2>Ödeme Ayarları</h2>

      {/* Payment Methods - COMMON */}
      <PaymentMethodsSection />

      {/* Bank Account - FREELANCER ONLY */}
      {isFreelancer && <BankAccountSection />}

      {/* Billing Address - EMPLOYER ONLY */}
      {!isFreelancer && <BillingAddressSection />}
    </div>
  );
}
```

##### 2.3.4: Templates Page Freelancer-Only Protection

**Time:** 30 min

**Add Route Protection:**

```typescript
// app/dashboard/settings/templates/page.tsx
'use client';

import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function TemplatesPage() {
  const { user } = useAuthStore();

  useEffect(() => {
    if (user && user.role !== 'freelancer') {
      redirect('/dashboard/settings');
    }
  }, [user]);

  // ... rest of component
}
```

---

### **Story 2.4: Component Deduplication - Orders Pages**

**Priority:** MEDIUM 🟡  
**Estimation:** 2 gün  
**Assignee:** Frontend Dev

#### Problem Analysis

**Current State:**

- `/dashboard/employer/orders/page.tsx`: 389 lines
- `/dashboard/customer/orders/page.tsx`: ~250 lines (to be deleted)
- `/dashboard/freelancer/orders/page.tsx`: Similar structure

**Duplication:**

- Same UI layout (filters, list, pagination)
- Same status badges
- Same date formatting
- Different API calls: `getBuyerOrders` vs `getSellerOrders`

#### Subtasks

##### 2.4.1: Create Generic OrdersList Component

**Time:** 3 saat

**Create:** `components/domains/orders/OrdersList.tsx`

```typescript
'use client';

import React from 'react';
import type { Order, OrderStatus } from '@/types/backend-aligned';

interface OrdersListProps {
  /**
   * Role perspective: buyer (employer) or seller (freelancer)
   */
  perspective: 'buyer' | 'seller';

  /**
   * Fetch function to load orders
   */
  fetchOrders: (params: {
    status?: OrderStatus;
    page: number;
    size: number;
  }) => Promise<OrdersResponse>;

  /**
   * Optional custom actions per order
   */
  renderActions?: (order: Order) => React.ReactNode;
}

export function OrdersList({
  perspective,
  fetchOrders,
  renderActions,
}: OrdersListProps) {
  // Shared logic:
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(0);

  // Load orders
  const loadOrders = useCallback(async () => {
    // ... shared loading logic
  }, [fetchOrders, statusFilter, currentPage]);

  // Perspective-specific labels
  const otherPartyLabel = perspective === 'buyer' ? 'Satıcı' : 'Alıcı';
  const getOtherPartyName = (order: Order) =>
    perspective === 'buyer' ? order.sellerName : order.buyerName;

  return (
    <div>
      {/* Filters */}
      <OrderFilters
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* Orders List */}
      <div className="space-y-4">
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            otherPartyLabel={otherPartyLabel}
            otherPartyName={getOtherPartyName(order)}
            actions={renderActions?.(order)}
          />
        ))}
      </div>

      {/* Pagination */}
      <Pagination {...paginationProps} />
    </div>
  );
}
```

##### 2.4.2: Update Freelancer Orders Page

**Time:** 1 saat

```typescript
// app/dashboard/freelancer/orders/page.tsx
import { OrdersList } from '@/components/domains/orders/OrdersList';
import { orderApi } from '@/lib/api/orders';

export default function FreelancerOrdersPage() {
  return (
    <OrdersList
      perspective="seller"
      fetchOrders={orderApi.getSellerOrders}
      renderActions={(order) => (
        <>
          <DeliveryButton order={order} />
          <MessageButton order={order} />
        </>
      )}
    />
  );
}
```

##### 2.4.3: Update Employer Orders Page

**Time:** 1 saat

```typescript
// app/dashboard/employer/orders/page.tsx
import { OrdersList } from '@/components/domains/orders/OrdersList';
import { orderApi } from '@/lib/api/orders';

export default function EmployerOrdersPage() {
  return (
    <OrdersList
      perspective="buyer"
      fetchOrders={orderApi.getBuyerOrders}
      renderActions={(order) => (
        <>
          <ApproveButton order={order} />
          <RevisionButton order={order} />
          <MessageButton order={order} />
        </>
      )}
    />
  );
}
```

**Impact:**

- ✅ Reduced code from ~600 lines to ~200 lines
- ✅ Single source of truth for orders UI
- ✅ Easier to maintain and test
- ✅ Consistent UX across roles

##### 2.4.4: Extract OrderFilters Component

**Time:** 1 saat

**Create:** `components/domains/orders/OrderFilters.tsx`

```typescript
interface OrderFiltersProps {
  statusFilter: OrderStatus | 'ALL';
  onStatusChange: (status: OrderStatus | 'ALL') => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export function OrderFilters({ ... }: OrderFiltersProps) {
  // Shared filter UI
}
```

##### 2.4.5: Extract OrderCard Component

**Time:** 1.5 saat

**Create:** `components/domains/orders/OrderCard.tsx`

```typescript
interface OrderCardProps {
  order: Order;
  otherPartyLabel: string;
  otherPartyName: string;
  actions?: React.ReactNode;
}

export function OrderCard({ ... }: OrderCardProps) {
  // Shared order card UI
}
```

---

### **Story 2.5: Update Dashboard Navigation**

**Priority:** LOW 🟢  
**Estimation:** 1 gün  
**Assignee:** Frontend Dev

#### Subtasks

##### 2.5.1: Update DashboardSidebar to Use Navigation Config

**Time:** 2 saat

**Current:** DashboardSidebar has hardcoded nav items  
**Goal:** Use `lib/config/navigation.ts` (from Sprint 1)

```typescript
// components/domains/dashboard/DashboardSidebar.tsx
import { dashboardNavigation, getDashboardNavigation } from '@/lib/config/navigation';

export function DashboardSidebar() {
  const { user } = useAuthStore();
  const navItems = getDashboardNavigation(user?.role as 'freelancer' | 'employer');

  // ... rest remains same
}
```

##### 2.5.2: Add Breadcrumbs Component

**Time:** 2 saat

**Create:** `components/shared/Breadcrumbs.tsx`

```typescript
export function Breadcrumbs() {
  const pathname = usePathname();

  // Generate breadcrumb items from pathname
  const items = generateBreadcrumbs(pathname);

  return (
    <nav className="flex items-center space-x-2 text-sm">
      {items.map((item, index) => (
        <React.Fragment key={item.href}>
          {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400" />}
          <Link
            href={item.href}
            className={index === items.length - 1 ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'}
          >
            {item.label}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
}
```

##### 2.5.3: Add to Dashboard Header

**Time:** 30 min

```typescript
// components/domains/dashboard/DashboardHeader.tsx
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';

export function DashboardHeader() {
  return (
    <header>
      {/* Existing header content */}
      <Breadcrumbs />
    </header>
  );
}
```

---

## 🧪 Testing Checklist

### Unit Tests

- [ ] `getDashboardRoute()` utility function
- [ ] Role-based navigation filter
- [ ] OrdersList component with different perspectives
- [ ] OrderFilters component state management

### Integration Tests

- [ ] Dashboard auto-redirect for freelancer
- [ ] Dashboard auto-redirect for employer
- [ ] Dashboard auto-redirect for unauthenticated
- [ ] Settings page role-based visibility
- [ ] Freelancer orders page loads
- [ ] Employer orders page loads

### E2E Tests (Playwright)

```typescript
// tests/e2e/dashboard-routing.spec.ts
test('freelancer redirects to correct dashboard', async ({ page }) => {
  await loginAsFreelancer(page);
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/dashboard/freelancer');
});

test('employer redirects to correct dashboard', async ({ page }) => {
  await loginAsEmployer(page);
  await page.goto('/dashboard');
  await expect(page).toHaveURL('/dashboard/employer');
});

test('customer route no longer exists', async ({ page }) => {
  await loginAsEmployer(page);
  const response = await page.goto('/dashboard/customer/orders');
  expect(response?.status()).toBe(404);
});
```

### Manual Testing

- [ ] Navigate to `/dashboard` as freelancer → redirects correctly
- [ ] Navigate to `/dashboard` as employer → redirects correctly
- [ ] Navigate to `/dashboard/freelancer` as employer → blocked/redirected
- [ ] Navigate to `/dashboard/employer` as freelancer → blocked/redirected
- [ ] Settings → Templates only visible for freelancers
- [ ] All dashboard links work correctly
- [ ] No "customer" references in UI

---

## 📊 Sprint Metrics

**Estimated Effort:**

- Story 2.1 (Terminology): 2 gün (16 saat)
- Story 2.2 (Auto-redirect): 1.5 gün (12 saat)
- Story 2.3 (Settings): 1.5 gün (12 saat)
- Story 2.4 (Component Dedup): 2 gün (16 saat)
- Story 2.5 (Navigation): 1 gün (8 saat)
- **Buffer**: 2 gün
- **Total**: 10 gün

**Impact:**

- ✅ Eliminated terminology confusion
- ✅ Improved UX with role-based routing
- ✅ Reduced code by ~400 lines
- ✅ Better maintainability
- ✅ Consistent navigation

**Risk Mitigation:**

- Daily standup to track progress
- Code review after each story
- Incremental deployment (story by story)
- Rollback plan for each change

---

## 🚀 Deployment Plan

### Phase 1: Terminology Migration (Day 1-2)

- Delete `/dashboard/customer` route
- Update all "customer" references
- Deploy to staging
- Run E2E tests

### Phase 2: Auto-Redirect (Day 3-4)

- Implement role-based redirect
- Add middleware protection
- Deploy to staging
- Manual QA testing

### Phase 3: Settings & Components (Day 5-8)

- Settings consolidation
- Orders component deduplication
- Navigation updates
- Deploy to staging
- Full regression testing

### Phase 4: Production (Day 9-10)

- Production deployment
- Monitor error logs
- Check analytics
- User feedback collection

---

## 📚 Documentation Updates

**Files to Update:**

1. **README.md**
   - Update dashboard routing section
   - Add role-based routing explanation

2. **ARCHITECTURE.md** (create if not exists)

   ```markdown
   ## Dashboard Architecture

   ### Role-Based Routing

   - `/dashboard` → Auto-redirects based on user role
   - `/dashboard/freelancer/*` → Freelancer-specific pages
   - `/dashboard/employer/*` → Employer-specific pages
   - `/dashboard/settings/*` → Shared settings pages

   ### Terminology

   - **Employer**: Service buyer (previously "customer")
   - **Freelancer**: Service provider
   - Backend alignment: UserRole.EMPLOYER, UserRole.FREELANCER
   ```

3. **API_DOCS.md**
   - Document role-based endpoints
   - Clarify buyer vs seller terminology

---

## 🎯 Success Criteria

### Quantitative

- [ ] 0 references to `/dashboard/customer`
- [ ] 0 hardcoded dashboard redirects
- [ ] ~400 lines of code removed
- [ ] 100% role-based tests passing
- [ ] < 2s dashboard load time

### Qualitative

- [ ] Clear role-based navigation
- [ ] No user confusion about routes
- [ ] Consistent terminology across app
- [ ] Developer velocity improved
- [ ] Easier onboarding for new devs

---

## 🔄 Sprint 2 → Sprint 3 Transition

**Sprint 2 Deliverables:**

- ✅ Clean role-based routing structure
- ✅ Consistent terminology (employer, freelancer)
- ✅ Reusable dashboard components
- ✅ Comprehensive test coverage

**Sprint 3 Preparation:**

- API Layer Unification
- Centralized error handling
- Unified caching strategy
- OpenAPI type generation

---

**End of Sprint 2 Task List**

_Last Updated: 26 Ekim 2025_
_Status: Ready for Implementation_
