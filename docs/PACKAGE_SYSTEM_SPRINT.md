# 📦 Package (Service Package) System - Complete Frontend Implementation Sprint

**Sprint No:** 23  
**Sprint Date:** October 26, 2025  
**Status:** 🔄 Planning Phase  
**Priority:** 🔴 High (Core Business Feature)  
**Estimated Duration:** 8-10 days (~64-80 hours)

---

## 📋 Executive Summary

Package (Service Package) System backend is **100% production-ready** with 35 REST endpoints across 3 controllers, comprehensive business logic, and complete data models. However, the frontend is only **~15% complete** with placeholder pages. This sprint will deliver a fully functional package management system for freelancers to create, edit, and manage service packages with tier-based pricing (Basic, Standard, Premium).

### System Overview

**Backend Status:** ✅ 100% Complete

- **3 Controllers:** Public, Seller, Admin
- **35 REST Endpoints:** Full CRUD + Advanced Features
- **Tier System:** 3-tier pricing (Basic, Standard, Premium)
- **Analytics Integration:** View tracking, click tracking
- **Statistics:** Seller stats, platform stats
- **Search:** Simple + Advanced search
- **Discovery:** Featured, Verified, Popular, Trending

**Frontend Status:** ⚠️ ~15% Complete (Placeholders)

- Create page: Placeholder form (no tier support)
- Edit page: Missing completely
- List page: Basic display (no tier visualization)
- Detail page: Incomplete tier selection
- Seller dashboard: Missing package management

### Sprint Goals

1. ✅ **Complete Package Creation Flow** (Days 1-3)
   - Multi-step form with validation
   - Tier-based pricing (Basic/Standard/Premium)
   - Image upload integration
   - Category & subcategory selection
   - Real-time preview

2. ✅ **Package Management Dashboard** (Days 4-5)
   - Seller package list with filters
   - Status management (Draft, Active, Paused)
   - Quick actions (Edit, Pause, Activate, Delete)
   - Package statistics cards

3. ✅ **Package Editing System** (Days 6-7)
   - Edit existing packages
   - Tier management
   - Image gallery management
   - Publishing workflow

4. ✅ **Enhanced Package Display** (Days 8-9)
   - Tier comparison UI
   - Package detail enhancements
   - Responsive tier selector
   - Add-ons visualization

5. ✅ **Testing & Documentation** (Day 10)
   - E2E testing
   - User guide
   - API integration testing

---

## 🏗️ Backend Architecture (100% Complete)

### Controller Structure

```
PackageController (Public) - 15 endpoints
├── GET    /api/v1/packages (Browse all active)
├── GET    /api/v1/packages/{id} (Get by ID)
├── GET    /api/v1/packages/slug/{slug} (Get by slug)
├── GET    /api/v1/packages/search (Simple search)
├── GET    /api/v1/packages/advanced-search (Advanced search)
├── GET    /api/v1/packages/category/{id} (By category)
├── GET    /api/v1/packages/featured (Featured packages)
├── GET    /api/v1/packages/verified (Verified packages)
├── GET    /api/v1/packages/popular (Popular packages)
├── GET    /api/v1/packages/top-rated (Top rated)
├── GET    /api/v1/packages/trending (Trending)
├── GET    /api/v1/packages/newest (Newest)
└── GET    /api/v1/packages/stats/platform (Platform stats)

PackageSellerController (Freelancer) - 11 endpoints
├── POST   /api/v1/seller/packages (Create package)
├── PUT    /api/v1/seller/packages/{id} (Update package)
├── DELETE /api/v1/seller/packages/{id} (Delete package)
├── GET    /api/v1/seller/packages (Get my packages)
├── GET    /api/v1/seller/packages/{id} (Get my package)
├── GET    /api/v1/seller/packages/status/{status} (By status)
├── POST   /api/v1/seller/packages/{id}/activate (Activate)
├── POST   /api/v1/seller/packages/{id}/pause (Pause)
├── GET    /api/v1/seller/packages/stats (My statistics)
└── GET    /api/v1/seller/packages/top (My top packages)

PackageAdminController (Admin) - 9 endpoints
├── GET    /api/v1/admin/packages (All packages)
├── GET    /api/v1/admin/packages/{id} (Get by ID)
├── GET    /api/v1/admin/packages/status/{status} (By status)
├── POST   /api/v1/admin/packages/{id}/feature (Feature)
├── POST   /api/v1/admin/packages/{id}/verify (Verify)
├── POST   /api/v1/admin/packages/{id}/archive (Archive)
├── POST   /api/v1/admin/packages/{id}/restore (Restore)
└── GET    /api/v1/admin/packages/stats/platform (Platform stats)
```

### Entity Structure

```typescript
Package Entity (Backend)
├── id: UUID
├── title: String (200 chars)
├── slug: String (unique)
├── description: TEXT
├── category: Category (ManyToOne)
├── seller: User (ManyToOne)
│
├── basicTier: PackageTierInfo (Embedded)
│   ├── price: BigDecimal
│   ├── deliveryDays: Integer
│   ├── revisionCount: Integer
│   ├── features: JSON List<String>
│   └── isActive: Boolean
│
├── standardTier: PackageTierInfo (Embedded, Optional)
│   └── (same structure as basicTier)
│
├── premiumTier: PackageTierInfo (Embedded, Optional)
│   └── (same structure as basicTier)
│
├── highlights: JSON List<String>
├── deliverables: JSON List<String>
├── requirements: JSON List<String>
│
├── status: ENUM (DRAFT, ACTIVE, PAUSED, INACTIVE)
├── isFeatured: Boolean
├── isVerified: Boolean
│
├── views: Long
├── orders: Long
├── rating: BigDecimal (0-5)
├── reviewCount: Long
│
├── metaDescription: String
├── keywords: JSON List<String>
│
├── createdAt: Timestamp
└── updatedAt: Timestamp
```

### Business Logic Services

```
PackageFacadeService (Orchestrator)
├── PackageCrudService (CRUD operations)
│   ├── createPackage() - Create with slug generation
│   ├── updatePackage() - Update with cache invalidation
│   ├── deletePackage() - Soft delete (INACTIVE)
│   ├── getPackageById() - Get with caching
│   └── getPackageBySlug() - Get with caching
│
├── PackageSearchService (Search & Discovery)
│   ├── searchPackages() - Simple keyword search
│   ├── advancedSearch() - Multi-filter search
│   ├── getPackagesByCategory()
│   ├── getFeaturedPackages()
│   ├── getVerifiedPackages()
│   ├── getMostPopularPackages()
│   ├── getTopRatedPackages()
│   ├── getTrendingPackages()
│   └── getNewestPackages()
│
├── PackageUtilityService (Utilities & Validation)
│   ├── generateUniqueSlug() - Slug creation
│   ├── validateTierPricing() - Validate tier hierarchy
│   ├── canBeEdited() - Check if editable
│   ├── canBeDeleted() - Check if deletable
│   ├── incrementViewCount()
│   ├── incrementOrderCount()
│   ├── updateRating()
│   ├── getPlatformStats()
│   ├── getSellerPackageStats()
│   └── setFeatured/setVerified()
│
└── PackageAnalyticsService (Analytics Integration)
    ├── trackView() - Track package views
    ├── trackClick() - Track package clicks
    └── trackSearchImpression() - Track search impressions
```

---

## 🎯 Frontend Implementation Plan

### Day 1-2: Package Creation Form - Part 1 (Basic Info & Validation)

#### Components to Create

**1. PackageCreatePage** (`app/dashboard/freelancer/packages/create/page.tsx`)

```typescript
// Multi-step form with validation
Steps:
1. Basic Information (Title, Description, Category)
2. Tier Pricing (Basic, Standard, Premium)
3. Features & Deliverables
4. Media & Gallery
5. Review & Publish
```

**2. PackageBasicInfoStep** (`components/packages/create/PackageBasicInfoStep.tsx`)

```typescript
interface Props {
  data: BasicInfoData;
  onChange: (data: BasicInfoData) => void;
  onNext: () => void;
  errors: ValidationErrors;
}

Fields:
- Title (10-200 chars, required)
- Description (50-5000 chars, rich text)
- Category (dropdown, required)
- Subcategory (dropdown, required)
- Tags/Keywords (comma separated)
```

**3. PackageTierPricingStep** (`components/packages/create/PackageTierPricingStep.tsx`)

```typescript
interface TierData {
  name: 'basic' | 'standard' | 'premium';
  price: number;
  deliveryDays: number;
  revisionCount: number;
  features: string[];
  isActive: boolean;
}

Features:
- Tier toggle (Basic always required)
- Standard/Premium optional toggles
- Price validation (Basic < Standard < Premium)
- Delivery days (1-90)
- Revision count (0-unlimited)
- Feature list builder
```

**API Integration:**

```typescript
// lib/api/packages.ts
export const packageApi = {
  // Seller endpoints
  createPackage: async (data: CreatePackageData) => {
    return await api.post('/seller/packages', data);
  },

  updatePackage: async (id: string, data: UpdatePackageData) => {
    return await api.put(`/seller/packages/${id}`, data);
  },

  deletePackage: async (id: string) => {
    return await api.delete(`/seller/packages/${id}`);
  },

  getMyPackages: async (params: PaginationParams) => {
    return await api.get('/seller/packages', { params });
  },

  getMyPackage: async (id: string) => {
    return await api.get(`/seller/packages/${id}`);
  },

  activatePackage: async (id: string) => {
    return await api.post(`/seller/packages/${id}/activate`);
  },

  pausePackage: async (id: string) => {
    return await api.post(`/seller/packages/${id}/pause`);
  },

  getMyStats: async () => {
    return await api.get('/seller/packages/stats');
  },

  // Public endpoints
  getPackages: async (params: SearchParams) => {
    return await api.get('/packages', { params });
  },

  getPackageById: async (id: string) => {
    return await api.get(`/packages/${id}`);
  },

  getPackageBySlug: async (slug: string) => {
    return await api.get(`/packages/slug/${slug}`);
  },

  searchPackages: async (keyword: string, params: PaginationParams) => {
    return await api.get('/packages/search', { params: { keyword, ...params } });
  },

  advancedSearch: async (filters: AdvancedSearchFilters) => {
    return await api.get('/packages/advanced-search', { params: filters });
  },

  getFeaturedPackages: async (params: PaginationParams) => {
    return await api.get('/packages/featured', { params });
  },

  getPopularPackages: async (params: PaginationParams) => {
    return await api.get('/packages/popular', { params });
  },

  getTrendingPackages: async (params: PaginationParams) => {
    return await api.get('/packages/trending', { params });
  }
};
```

**Validation Schema (Zod):**

```typescript
// lib/validation/package.ts
import { z } from 'zod';

export const packageBasicInfoSchema = z.object({
  title: z.string()
    .min(10, 'Başlık en az 10 karakter olmalı')
    .max(200, 'Başlık en fazla 200 karakter olabilir'),
  description: z.string()
    .min(50, 'Açıklama en az 50 karakter olmalı')
    .max(5000, 'Açıklama en fazla 5000 karakter olabilir'),
  categoryId: z.string().uuid('Geçersiz kategori'),
  keywords: z.array(z.string()).min(1, 'En az 1 keyword gerekli').max(10),
});

export const packageTierSchema = z.object({
  price: z.number()
    .min(50, 'Minimum fiyat 50 TL')
    .max(50000, 'Maximum fiyat 50.000 TL'),
  deliveryDays: z.number()
    .min(1, 'Minimum 1 gün')
    .max(90, 'Maximum 90 gün'),
  revisionCount: z.number()
    .min(0, 'Minimum 0')
    .max(20, 'Maximum 20 revizyon'),
  features: z.array(z.string()).min(1, 'En az 1 özellik gerekli'),
  isActive: z.boolean(),
});

export const packageTiersSchema = z.object({
  basicTier: packageTierSchema,
  standardTier: packageTierSchema.optional(),
  premiumTier: packageTierSchema.optional(),
}).refine((data) => {
  // Validate price hierarchy: Basic < Standard < Premium
  if (data.standardTier && data.basicTier.price >= data.standardTier.price) {
    return false;
  }
  if (data.premiumTier && data.standardTier &&
      data.standardTier.price >= data.premiumTier.price) {
    return false;
  }
  if (data.premiumTier && !data.standardTier &&
      data.basicTier.price >= data.premiumTier.price) {
    return false;
  }
  return true;
}, {
  message: 'Tier fiyatları: Basic < Standard < Premium olmalı',
});

export const createPackageSchema = z.object({
  ...packageBasicInfoSchema.shape,
  ...packageTiersSchema.shape,
  highlights: z.array(z.string()).max(5),
  deliverables: z.array(z.string()).max(10),
  requirements: z.array(z.string()).max(10),
});
```

---

### Day 3-4: Package Creation Form - Part 2 (Features, Media, Review)

#### Components to Create

**4. PackageFeaturesStep** (`components/packages/create/PackageFeaturesStep.tsx`)

```typescript
Features:
- Highlights input (max 5 items, bullet points)
- Deliverables list (max 10 items)
- Requirements from buyer (max 10 items)
- Drag & drop reordering
```

**5. PackageMediaStep** (`components/packages/create/PackageMediaStep.tsx`)

```typescript
Features:
- Image upload (min 1, max 8 images)
- Drag & drop image reordering
- Image preview with zoom
- Set cover image
- Image cropping tool
- Video URL (YouTube/Vimeo embed, optional)

Integration:
- Cloudinary upload
- Progress indicators
- Error handling
```

**6. PackageReviewStep** (`components/packages/create/PackageReviewStep.tsx`)

```typescript
Features:
- Complete package preview
- All tiers side-by-side comparison
- Edit buttons for each section
- Publish vs Save as Draft buttons
- SEO preview (title, description, slug)
```

**7. PackageCreationWizard** (`components/packages/create/PackageCreationWizard.tsx`)

```typescript
// Main wizard controller
Features:
- Step progress indicator
- Step validation
- Previous/Next navigation
- Draft autosave (every 30 seconds)
- Exit confirmation dialog
- Success/Error handling
```

---

### Day 5-6: Package Management Dashboard

#### Components to Create

**8. PackageListPage** (`app/dashboard/freelancer/packages/page.tsx`)

```typescript
Features:
- Package cards grid/list view
- Status filter tabs (All, Draft, Active, Paused, Inactive)
- Search bar (real-time)
- Sort options (newest, oldest, most orders, highest rated)
- Quick actions menu (Edit, Activate, Pause, Delete)
- Empty state for no packages
- Pagination
```

**9. PackageCard** (`components/packages/PackageCard.tsx`)

```typescript
interface Props {
  package: PackageSummary;
  variant: 'grid' | 'list';
  onEdit: (id: string) => void;
  onActivate: (id: string) => void;
  onPause: (id: string) => void;
  onDelete: (id: string) => void;
}

Display:
- Cover image
- Title & description (truncated)
- Status badge (Draft/Active/Paused/Inactive)
- Tier prices (Basic: X TL, Standard: Y TL, Premium: Z TL)
- Statistics (Views, Orders, Rating)
- Quick actions dropdown
- Edit button
```

**10. PackageStatsCards** (`components/packages/PackageStatsCards.tsx`)

```typescript
interface SellerStats {
  totalPackages: number;
  activePackages: number;
  draftPackages: number;
  pausedPackages: number;
  totalViews: number;
  totalOrders: number;
  averageRating: number;
  totalRevenue: number;
}

Display:
- 4 cards in grid layout
- Icon, value, label, change percentage
- Color-coded (green for positive, red for negative)
```

**11. PackageFilters** (`components/packages/PackageFilters.tsx`)

```typescript
Filters:
- Status (All, Draft, Active, Paused, Inactive)
- Sort by (Newest, Oldest, Most Orders, Highest Rated)
- View mode (Grid, List)
- Search input
- Clear filters button
```

---

### Day 7-8: Package Editing System

#### Components to Create

**12. PackageEditPage** (`app/dashboard/freelancer/packages/[id]/edit/page.tsx`)

```typescript
Features:
- Load existing package data
- Same wizard as create (reuse components)
- Pre-fill all fields
- Show "Editing: [Package Title]" header
- Unsaved changes warning
- Compare with original data
- Update API call
```

**13. PackageTierEditor** (`components/packages/edit/PackageTierEditor.tsx`)

```typescript
Features:
- Edit existing tier
- Add new tier (Standard/Premium)
- Remove tier (if no orders)
- Toggle tier active status
- Feature list editor with add/remove
- Price/delivery/revision inputs
- Validation feedback
```

**14. PackageImageGallery** (`components/packages/edit/PackageImageGallery.tsx`)

```typescript
Features:
- Display existing images
- Add new images
- Delete images
- Reorder images (drag & drop)
- Set cover image
- Lightbox preview
```

**15. PackageStatusManager** (`components/packages/PackageStatusManager.tsx`)

```typescript
States:
- Draft → Activate (if all fields complete)
- Active → Pause
- Paused → Activate
- Any → Delete (soft delete)

UI:
- Current status badge
- Available actions dropdown
- Confirmation dialogs
- Status change animation
```

---

### Day 9: Enhanced Package Display & Public Pages

#### Components to Update/Create

**16. PackageDetailPage** (`app/marketplace/packages/[id]/page.tsx`)

- Enhance existing page
- Add tier comparison table
- Add tier selector with real-time price update
- Add "Order Now" button per tier
- Show seller info card
- Show related packages
- Show reviews & ratings
- Add to favorites button

**17. PackageTierComparison** (`components/packages/PackageTierComparison.tsx`)

```typescript
// Side-by-side tier comparison
Features:
- 3-column layout (Basic, Standard, Premium)
- Feature checklist with checkmarks
- Price display
- Delivery time display
- Revision count display
- "Select Tier" button
- Highlight recommended tier
- Mobile: Swipeable carousel
```

**18. PackageTierSelector** (`components/packages/PackageTierSelector.tsx`)

```typescript
// Tier selection widget
Features:
- Radio buttons for tier selection
- Show selected tier price
- Show selected tier delivery
- Show selected tier features
- Calculate total with add-ons
- "Proceed to Order" button
```

**19. MarketplacePage Enhancement**

- Update existing marketplace to show tier prices
- Add tier filter (Basic only, All tiers available)
- Show "Starting from" lowest tier price
- Add tier badge on cards

---

### Day 10: Testing, Documentation & Polish

#### Testing

**E2E Test Scenarios:**

```typescript
// tests/e2e/package-creation.spec.ts
describe('Package Creation Flow', () => {
  it('should create a basic package with one tier', () => {
    // 1. Navigate to create page
    // 2. Fill basic info
    // 3. Set basic tier pricing
    // 4. Add highlights
    // 5. Upload images
    // 6. Review and save as draft
    // 7. Verify package appears in dashboard
  });

  it('should create a premium package with all tiers', () => {
    // Test all 3 tiers
  });

  it('should validate tier price hierarchy', () => {
    // Test validation: Basic < Standard < Premium
  });

  it('should upload and reorder images', () => {
    // Test image gallery functionality
  });
});

// tests/e2e/package-management.spec.ts
describe('Package Management', () => {
  it('should activate a draft package', () => {
    // Test status change
  });

  it('should pause an active package', () => {
    // Test pause functionality
  });

  it('should edit an existing package', () => {
    // Test edit flow
  });

  it('should delete a package', () => {
    // Test soft delete
  });
});

// tests/e2e/package-discovery.spec.ts
describe('Package Discovery', () => {
  it('should search packages by keyword', () => {
    // Test search
  });

  it('should filter packages by category', () => {
    // Test category filter
  });

  it('should sort packages by popularity', () => {
    // Test sorting
  });

  it('should display tier comparison', () => {
    // Test tier comparison UI
  });
});
```

**Integration Tests:**

```typescript
// tests/integration/package-api.test.ts
describe('Package API Integration', () => {
  it('POST /seller/packages - should create package', async () => {
    // Test create endpoint
  });

  it('PUT /seller/packages/:id - should update package', async () => {
    // Test update endpoint
  });

  it('GET /seller/packages - should get seller packages', async () => {
    // Test list endpoint
  });

  it('POST /seller/packages/:id/activate - should activate', async () => {
    // Test activate endpoint
  });
});
```

#### Documentation

**User Guides to Create:**

1. **PACKAGE_CREATION_GUIDE.md**
   - Step-by-step package creation
   - Best practices for tier pricing
   - Image guidelines
   - SEO tips

2. **PACKAGE_MANAGEMENT_GUIDE.md**
   - Dashboard navigation
   - Status management
   - Editing packages
   - Statistics interpretation

3. **PACKAGE_SELLER_FAQ.md**
   - Common questions
   - Troubleshooting
   - Policy guidelines

---

## 📊 Data Models & Types

### TypeScript Interfaces

```typescript
// types/package.ts

export interface PackageTierInfo {
  price: number;
  deliveryDays: number;
  revisionCount: number;
  features: string[];
  isActive: boolean;
}

export interface Package {
  id: string;
  title: string;
  slug: string;
  description: string;

  // Relations
  categoryId: string;
  category?: Category;
  sellerId: string;
  seller?: SellerProfile;

  // Tiers
  basicTier: PackageTierInfo;
  standardTier?: PackageTierInfo;
  premiumTier?: PackageTierInfo;

  // Features
  highlights: string[];
  deliverables: string[];
  requirements: string[];

  // Media
  images: string[];
  videoUrl?: string;

  // Status & Flags
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'INACTIVE';
  isFeatured: boolean;
  isVerified: boolean;

  // Statistics
  views: number;
  orders: number;
  rating?: number;
  reviewCount: number;

  // SEO
  metaDescription?: string;
  keywords: string[];

  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface PackageSummary {
  id: string;
  title: string;
  slug: string;
  description: string; // Truncated
  categoryName: string;
  sellerName: string;
  sellerAvatar?: string;

  // Pricing (from tiers)
  basicPrice: number;
  standardPrice?: number;
  premiumPrice?: number;

  coverImage: string;
  status: PackageStatus;

  // Statistics
  views: number;
  orders: number;
  rating?: number;
  reviewCount: number;

  // Flags
  isFeatured: boolean;
  isVerified: boolean;

  createdAt: string;
}

export interface CreatePackageData {
  title: string;
  description: string;
  categoryId: string;

  basicTier: Omit<PackageTierInfo, 'isActive'>;
  standardTier?: Omit<PackageTierInfo, 'isActive'>;
  premiumTier?: Omit<PackageTierInfo, 'isActive'>;

  highlights: string[];
  deliverables: string[];
  requirements: string[];

  images: string[];
  videoUrl?: string;

  metaDescription?: string;
  keywords: string[];
}

export interface UpdatePackageData extends Partial<CreatePackageData> {
  status?: PackageStatus;
}

export interface SellerPackageStats {
  totalPackages: number;
  activePackages: number;
  draftPackages: number;
  pausedPackages: number;
  inactivePackages: number;

  totalViews: number;
  totalOrders: number;
  averageRating: number;
  totalReviews: number;

  topPackages: PackageSummary[];
  recentOrders: number; // Last 30 days
}

export interface PlatformPackageStats {
  totalPackages: number;
  activePackages: number;
  featuredPackages: number;
  verifiedPackages: number;

  totalOrders: number;
  totalRevenue: number;
  averagePackagePrice: number;

  topCategories: Array<{
    categoryId: string;
    categoryName: string;
    packageCount: number;
  }>;

  topSellers: Array<{
    sellerId: string;
    sellerName: string;
    packageCount: number;
    totalOrders: number;
  }>;
}

export interface AdvancedSearchFilters {
  keyword?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  maxDeliveryDays?: number;

  page?: number;
  size?: number;
  sortBy?: 'createdAt' | 'orderCount' | 'rating' | 'views';
  sortDir?: 'ASC' | 'DESC';
}
```

---

## 🎨 UI/UX Design Guidelines

### Color Scheme

```css
/* Tier Colors */
--tier-basic: #3b82f6; /* Blue */
--tier-standard: #8b5cf6; /* Purple */
--tier-premium: #f59e0b; /* Amber/Gold */

/* Status Colors */
--status-draft: #6b7280; /* Gray */
--status-active: #10b981; /* Green */
--status-paused: #f59e0b; /* Amber */
--status-inactive: #ef4444; /* Red */

/* Badge Colors */
--featured: #f59e0b; /* Gold */
--verified: #3b82f6; /* Blue */
```

### Typography

```css
/* Package Titles */
.package-title {
  font-size: 1.5rem; /* 24px */
  font-weight: 700;
  line-height: 1.2;
}

/* Tier Names */
.tier-name {
  font-size: 1.125rem; /* 18px */
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Prices */
.tier-price {
  font-size: 2rem; /* 32px */
  font-weight: 800;
  line-height: 1;
}

/* Feature Lists */
.tier-feature {
  font-size: 0.875rem; /* 14px */
  line-height: 1.5;
}
```

### Component Patterns

**Tier Comparison Table:**

```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│              │    BASIC     │   STANDARD   │   PREMIUM    │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ Price        │   500 TL     │   1,000 TL   │   2,000 TL   │
│ Delivery     │   7 days     │   5 days     │   3 days     │
│ Revisions    │   2          │   5          │   Unlimited  │
├──────────────┼──────────────┼──────────────┼──────────────┤
│ Features:    │              │              │              │
│ - Feature 1  │      ✓       │      ✓       │      ✓       │
│ - Feature 2  │      ✗       │      ✓       │      ✓       │
│ - Feature 3  │      ✗       │      ✗       │      ✓       │
├──────────────┼──────────────┼──────────────┼──────────────┤
│              │ [Select]     │ [Select] ⭐  │ [Select]     │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Package Card (Grid View):**

```
┌────────────────────────────────────┐
│  [Cover Image]                     │
│                          [Featured]│
│                          [Verified]│
├────────────────────────────────────┤
│  Package Title Here                │
│  ⭐ 4.8 (127 reviews)              │
├────────────────────────────────────┤
│  Basic: 500 TL | Standard: 1K TL  │
│  👁 1,234 views | 🛒 45 orders     │
├────────────────────────────────────┤
│  [Edit] [Activate] [⋮ More]       │
└────────────────────────────────────┘
```

**Creation Wizard Progress:**

```
1. Basic Info ━━━●━━━━━━━━━━━━━━━━━━
2. Tier Pricing
3. Features
4. Media
5. Review
```

---

## 📱 Responsive Design

### Breakpoints

```typescript
const breakpoints = {
  mobile: '< 640px',
  tablet: '640px - 1023px',
  desktop: '≥ 1024px'
};
```

### Mobile Optimizations

**Creation Wizard:**

- One step per screen
- Bottom navigation (Previous/Next)
- Collapsible sections
- Simplified tier cards (swipeable)

**Package List:**

- Stack view (no grid)
- Compact cards
- Swipe actions (Edit, Delete)
- Bottom sheet for filters

**Tier Comparison:**

- Horizontal scroll
- Snap to tier
- Tap to expand details
- Sticky "Select" button

---

## ⚡ Performance Optimizations

### Image Handling

```typescript
// Cloudinary transformations
const packageImageUrl = (publicId: string, options: {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'limit';
  quality?: 'auto' | number;
}) => {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/`
    + `w_${options.width || 800},h_${options.height || 600},`
    + `c_${options.crop || 'fill'},q_${options.quality || 'auto'}/${publicId}`;
};

// Usage
<Image
  src={packageImageUrl(package.coverImage, { width: 400, height: 300 })}
  alt={package.title}
  width={400}
  height={300}
  loading="lazy"
/>
```

### Data Caching

```typescript
// React Query configuration
const packageQueryConfig = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
};

// Usage
const { data: packages } = useQuery(
  ['seller-packages', filters],
  () => packageApi.getMyPackages(filters),
  packageQueryConfig
);
```

### Pagination

```typescript
// Infinite scroll for package list
const useInfinitePackages = (filters: PackageFilters) => {
  return useInfiniteQuery(
    ['packages', filters],
    ({ pageParam = 0 }) => packageApi.getPackages({ ...filters, page: pageParam }),
    {
      getNextPageParam: (lastPage) =>
        lastPage.last ? undefined : lastPage.number + 1,
    }
  );
};
```

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// components/__tests__/PackageTierComparison.test.tsx
describe('PackageTierComparison', () => {
  it('should render all active tiers', () => {
    // Test tier rendering
  });

  it('should show correct price hierarchy', () => {
    // Test price display
  });

  it('should highlight recommended tier', () => {
    // Test recommended badge
  });

  it('should handle tier selection', () => {
    // Test selection callback
  });
});

// hooks/__tests__/usePackageCreation.test.ts
describe('usePackageCreation', () => {
  it('should validate tier pricing hierarchy', () => {
    // Test validation logic
  });

  it('should save draft automatically', () => {
    // Test autosave
  });

  it('should handle API errors gracefully', () => {
    // Test error handling
  });
});
```

### Integration Tests

```typescript
// tests/integration/package-flow.test.tsx
describe('Package Creation Flow', () => {
  it('should complete full creation workflow', async () => {
    // 1. Render creation wizard
    // 2. Fill all steps
    // 3. Submit package
    // 4. Verify API call
    // 5. Verify redirect to dashboard
  });

  it('should save and resume draft', async () => {
    // Test draft persistence
  });
});
```

### E2E Tests

```typescript
// cypress/e2e/package-management.cy.ts
describe('Package Management E2E', () => {
  beforeEach(() => {
    cy.login('freelancer');
  });

  it('creates and publishes a new package', () => {
    cy.visit('/dashboard/freelancer/packages/create');

    // Fill basic info
    cy.get('[data-cy=package-title]').type('Professional Logo Design');
    cy.get('[data-cy=package-description]').type('High-quality logos...');
    cy.get('[data-cy=category-select]').select('Graphic Design');

    // Set tier pricing
    cy.get('[data-cy=basic-price]').type('500');
    cy.get('[data-cy=basic-delivery]').type('7');
    cy.get('[data-cy=basic-revisions]').type('2');

    // Add features
    cy.get('[data-cy=add-feature]').click();
    cy.get('[data-cy=feature-input-0]').type('Logo concepts');

    // Upload image
    cy.get('[data-cy=image-upload]').attachFile('logo-sample.jpg');

    // Review and publish
    cy.get('[data-cy=publish-button]').click();

    // Verify success
    cy.url().should('include', '/dashboard/freelancer/packages');
    cy.contains('Professional Logo Design').should('exist');
  });

  it('edits an existing package', () => {
    cy.visit('/dashboard/freelancer/packages');
    cy.get('[data-cy=package-card]').first().click();
    cy.get('[data-cy=edit-button]').click();

    // Make changes
    cy.get('[data-cy=basic-price]').clear().type('600');

    // Save
    cy.get('[data-cy=save-button]').click();

    // Verify update
    cy.contains('600 TL').should('exist');
  });

  it('activates a draft package', () => {
    cy.visit('/dashboard/freelancer/packages');
    cy.contains('TASLAK').parent().find('[data-cy=activate-button]').click();
    cy.get('[data-cy=confirm-activate]').click();
    cy.contains('AKTİF').should('exist');
  });
});
```

---

## 📝 Documentation Deliverables

### Sprint Documents

1. **PACKAGE_SYSTEM_SPRINT.md** (This file)
   - Sprint plan
   - Technical specifications
   - API documentation
   - Component catalog

2. **PACKAGE_CREATION_GUIDE.md**
   - User guide for creating packages
   - Best practices
   - Screenshot tutorials

3. **PACKAGE_SELLER_GUIDE.md**
   - Dashboard navigation
   - Package management
   - Statistics interpretation
   - FAQ

4. **PACKAGE_API_REFERENCE.md**
   - Complete API documentation
   - Request/response examples
   - Error codes
   - Authentication

5. **PACKAGE_COMPONENT_LIBRARY.md**
   - Component catalog
   - Props documentation
   - Usage examples
   - Storybook stories

---

## 🎯 Success Criteria

### Must-Have Features ✅

- [x] Backend 100% complete (35 endpoints)
- [ ] Package creation wizard (5 steps)
- [ ] Tier-based pricing (Basic, Standard, Premium)
- [ ] Image upload & gallery
- [ ] Package list dashboard
- [ ] Package editing
- [ ] Status management (Draft, Active, Paused)
- [ ] Tier comparison UI
- [ ] Search & filters
- [ ] Statistics dashboard

### Nice-to-Have Features 🎁

- [ ] Draft autosave
- [ ] Package templates
- [ ] Bulk operations
- [ ] Advanced analytics
- [ ] A/B testing for tiers
- [ ] Package duplication
- [ ] Export package data

### Quality Metrics 📊

- TypeScript: 100% coverage
- ESLint: 0 errors
- Unit tests: >80% coverage
- E2E tests: Critical flows covered
- Responsive: Mobile, tablet, desktop
- Performance: < 3s initial load
- Accessibility: WCAG 2.1 AA compliant

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All TypeScript errors resolved
- [ ] ESLint passing
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Manual QA complete
- [ ] API endpoints verified
- [ ] Image upload tested
- [ ] Responsive design verified

### Environment Variables

```env
NEXT_PUBLIC_API_URL=https://api.marifetbul.com
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Build Verification

```bash
# TypeScript check
npm run type-check

# Lint check
npm run lint

# Test
npm run test

# Build
npm run build
```

---

## 📈 Sprint Timeline

```
Day 1-2: Package Creation - Basic Info & Tier Pricing
├── Hour 1-4: API integration (packageApi)
├── Hour 5-8: PackageBasicInfoStep component
├── Hour 9-12: PackageTierPricingStep component
└── Hour 13-16: Validation & error handling

Day 3-4: Package Creation - Features & Media
├── Hour 1-4: PackageFeaturesStep component
├── Hour 5-8: PackageMediaStep component
├── Hour 9-12: Cloudinary integration
└── Hour 13-16: PackageReviewStep & wizard controller

Day 5-6: Package Management Dashboard
├── Hour 1-4: PackageListPage & filters
├── Hour 5-8: PackageCard component
├── Hour 9-12: Status management
└── Hour 13-16: Statistics dashboard

Day 7-8: Package Editing System
├── Hour 1-4: PackageEditPage
├── Hour 5-8: PackageTierEditor
├── Hour 9-12: PackageImageGallery
└── Hour 13-16: Edit workflow testing

Day 9: Enhanced Package Display
├── Hour 1-4: PackageTierComparison
├── Hour 5-8: PackageTierSelector
└── Hour 9-12: Public page enhancements

Day 10: Testing & Documentation
├── Hour 1-4: E2E test suite
├── Hour 5-8: User documentation
└── Hour 9-12: Sprint summary & demo
```

---

## 🎉 Expected Outcomes

### For Freelancers

- ✅ Easy-to-use package creation wizard
- ✅ Flexible tier-based pricing
- ✅ Professional package presentation
- ✅ Comprehensive dashboard for management
- ✅ Real-time statistics

### For Buyers

- ✅ Clear tier comparison
- ✅ Easy tier selection
- ✅ Transparent pricing
- ✅ Feature-rich packages
- ✅ Verified & featured badges

### For Platform

- ✅ Increased package creation rate
- ✅ Higher conversion on tiered packages
- ✅ Better user engagement
- ✅ Scalable package system
- ✅ Analytics-driven insights

---

## 🏁 Conclusion

Package System frontend implementation will complete a critical business feature with **35 backend endpoints** already production-ready. The sprint will deliver a professional, tier-based package management system that enables freelancers to create and manage service packages effectively, while providing buyers with clear, comparative pricing options.

**Estimated Effort:** 64-80 hours (8-10 days)  
**Team Size:** 1-2 developers  
**Priority:** 🔴 High (Core Revenue Feature)  
**Status:** Ready to Start 🚀

---

_Sprint Document Version: 1.0_  
_Last Updated: October 26, 2025_  
_Next Review: Sprint Start Date_
