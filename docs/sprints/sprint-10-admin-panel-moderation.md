# Sprint 10: Admin Panel, Content Management & Platform Moderation - 2 hafta

## 🎯 Sprint Hedefleri

- Comprehensive admin panel development
- User management ve moderation tools
- Content moderation (reviews, jobs, profiles)
- Platform analytics ve reporting
- System configuration management
- Dispute resolution workflow
- Security monitoring ve abuse detection

## 📱 Geliştirilecek Ekranlar

### Admin Dashboard

**Rol**: Admin  
**Özellikler**:

- Overview dashboard (kullanıcı stats, gelir, aktivite)
- Real-time platform metrikleri
- Quick actions (user suspend, content remove)
- System health monitoring
- Revenue ve growth charts
- Top users, jobs, services listeleri
- Alert ve notification center

### User Management

**Rol**: Admin
**Özellikler**:

- Kullanıcı listesi ve arama
- User profile detailed view
- Account status management (active, suspended, banned)
- Verification badge management
- User activity history
- Bulk actions (email, suspend, verify)
- User communication tools

### Content Moderation

**Rol**: Admin
**Özellikler**:

- Review moderation queue
- Job/service content approval
- Reported content management
- Automated flagging system
- Content categories ve tagging
- Moderation action history
- Appeal process management

### Platform Configuration

**Rol**: Admin
**Özellikler**:

- Site settings (fees, limits, rules)
- Email template management
- Category ve skill management
- Geographic settings
- Payment gateway configuration
- Feature flags ve A/B testing
- System maintenance mode

## 🎨 UI/UX Tasarım Gereksinimleri

### Component'lar

- **Yeni Component'lar**:
  - `AdminLayout` - Admin panel layout
  - `AdminSidebar` - Admin navigation
  - `AdminDashboard` - Overview dashboard
  - `UserTable` - User management table
  - `ContentModerationQueue` - Moderation queue
  - `PlatformStats` - Platform statistics
  - `AdminCharts` - Analytics charts
  - `ModerationActions` - Action buttons
  - `SystemSettings` - Configuration forms
  - `BulkActions` - Bulk operation tools
- **Güncellenecek Component'lar**:
  - `Table`, `DataTable` (admin varyantları)
  - `Form`, `Input` (admin forms)
  - `Modal`, `Dialog` (moderation modals)
- **UI Library Integration**:
  - `DataTable`, `Pagination`, `Tabs`, `Badge` (Shadcn/ui)

### User Flow

- **Admin Flow**: Login → Dashboard → User Management → Content Moderation → Settings
- **Moderation Flow**: Queue → Review Content → Take Action → Log Decision

### States & Interactions

- **Loading States**: Dashboard data, user lists, moderation queue
- **Action States**: User suspend, content approve/reject
- **Bulk States**: Multi-select, bulk actions
- **System States**: Maintenance mode, system alerts
- **Filter States**: User filters, content filters

### Accessibility

- Admin tables keyboard navigation
- Screen reader support for charts
- High contrast admin theme
- Focus management in modals

## ⚙️ Fonksiyonel Özellikler

### Admin Dashboard & Analytics

**Açıklama**: Platform overview ve key metrics monitoring
**Admin Perspective**: Real-time platform health, revenue tracking
**Acceptance Criteria**:

- [ ] Dashboard real-time metrics gösteriyor
- [ ] Revenue, user growth charts accurate
- [ ] System alerts ve notifications working
- [ ] Quick actions functioning
- [ ] Export functionality for reports

### User Management System

**Açıklama**: Comprehensive user administration ve moderation
**Admin Perspective**: User lifecycle management, verification, suspension
**Acceptance Criteria**:

- [ ] User search ve filtering working
- [ ] Account status changes logged
- [ ] Verification badge management
- [ ] Bulk actions functioning
- [ ] User communication tools working

### Content Moderation Workflow

**Açıklama**: Automated ve manual content moderation system
**Admin Perspective**: Review queue, flagged content, appeals process
**Acceptance Criteria**:

- [ ] Moderation queue prioritized correctly
- [ ] Automated flagging working
- [ ] Manual review workflow smooth
- [ ] Appeal process functional
- [ ] Moderation history tracked

### Platform Configuration

**Açıklama**: System settings ve configuration management
**Admin Perspective**: Site settings, payment config, feature flags
**Acceptance Criteria**:

- [ ] Settings changes applied immediately
- [ ] Email templates customizable
- [ ] Feature flags working
- [ ] Payment settings configurable
- [ ] Maintenance mode functional

## 🔌 Mock API Servisleri

### Endpoint Pattern: `/api/v1/admin/*`

#### GET /api/v1/admin/dashboard

```typescript
interface AdminDashboardResponse {
  data: {
    stats: {
      totalUsers: number;
      activeUsers: number;
      totalRevenue: number;
      monthlyRevenue: number;
      totalJobs: number;
      activeJobs: number;
      totalOrders: number;
      completedOrders: number;
    };
    charts: {
      userGrowth: Array<{ date: string; users: number }>;
      revenue: Array<{ date: string; amount: number }>;
      activity: Array<{ date: string; jobs: number; orders: number }>;
    };
    alerts: Array<{
      id: string;
      type: 'warning' | 'error' | 'info';
      message: string;
      createdAt: string;
    }>;
  };
}

const mockAdminDashboard = {
  stats: {
    totalUsers: 15420,
    activeUsers: 2341,
    totalRevenue: 1250000,
    monthlyRevenue: 185000,
    totalJobs: 3254,
    activeJobs: 567,
    totalOrders: 8901,
    completedOrders: 7823,
  },
  charts: {
    userGrowth: [
      { date: '2025-01', users: 1200 },
      { date: '2025-02', users: 1450 },
      // ...
    ],
    revenue: [
      { date: '2025-01', amount: 120000 },
      { date: '2025-02', amount: 145000 },
      // ...
    ],
  },
  alerts: [
    {
      id: 'alert-1',
      type: 'warning',
      message: 'Yüksek sayıda spam raporu',
      createdAt: '2025-09-11T10:00:00Z',
    },
  ],
};
```

#### GET /api/v1/admin/users

```typescript
interface AdminUsersResponse {
  data: {
    users: Array<{
      id: string;
      email: string;
      name: string;
      role: 'freelancer' | 'employer';
      status: 'active' | 'suspended' | 'banned';
      verified: boolean;
      joinDate: string;
      lastActive: string;
      totalOrders: number;
      totalEarnings: number;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

const mockAdminUsers = {
  users: [
    {
      id: 'user-1',
      email: 'ali.veli@example.com',
      name: 'Ali Veli',
      role: 'freelancer',
      status: 'active',
      verified: true,
      joinDate: '2025-01-15T10:00:00Z',
      lastActive: '2025-09-11T09:30:00Z',
      totalOrders: 45,
      totalEarnings: 125000,
    },
    // ...
  ],
  pagination: {
    page: 1,
    limit: 50,
    total: 15420,
    pages: 309,
  },
};
```

#### GET /api/v1/admin/moderation/queue

```typescript
interface ModerationQueueResponse {
  data: {
    items: Array<{
      id: string;
      type: 'review' | 'job' | 'profile' | 'message';
      contentId: string;
      reportedBy: string;
      reason: string;
      content: any;
      priority: 'low' | 'medium' | 'high';
      createdAt: string;
      status: 'pending' | 'approved' | 'rejected';
    }>;
  };
}

const mockModerationQueue = [
  {
    id: 'mod-1',
    type: 'review',
    contentId: 'review-123',
    reportedBy: 'user-2',
    reason: 'Spam content',
    content: {
      rating: 1,
      comment: 'Çok kötü hizmet, para iadesi istiyorum!',
    },
    priority: 'high',
    createdAt: '2025-09-11T08:00:00Z',
    status: 'pending',
  },
  // ...
];
```

#### POST /api/v1/admin/users/:id/action

```typescript
interface UserActionRequest {
  action: 'suspend' | 'unsuspend' | 'ban' | 'verify' | 'unverify';
  reason?: string;
  duration?: number; // days
}

interface UserActionResponse {
  success: boolean;
  message: string;
}

const mockUserActionResponse = {
  success: true,
  message: 'Kullanıcı başarıyla askıya alındı',
};
```

#### POST /api/v1/admin/moderation/:id/action

```typescript
interface ModerationActionRequest {
  action: 'approve' | 'reject' | 'flag';
  reason?: string;
  notes?: string;
}

interface ModerationActionResponse {
  success: boolean;
  message: string;
}
```

### MSW Handler Implementation

```typescript
// lib/msw/handlers/admin.ts
export const adminHandlers = [
  http.get('/api/v1/admin/dashboard', () => {
    return HttpResponse.json({ data: mockAdminDashboard });
  }),
  http.get('/api/v1/admin/users', ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page')) || 1;
    return HttpResponse.json({ data: mockAdminUsers });
  }),
  http.get('/api/v1/admin/moderation/queue', () => {
    return HttpResponse.json({ data: { items: mockModerationQueue } });
  }),
  http.post('/api/v1/admin/users/:id/action', () => {
    return HttpResponse.json(mockUserActionResponse);
  }),
  http.post('/api/v1/admin/moderation/:id/action', () => {
    return HttpResponse.json({ success: true, message: 'Action completed' });
  }),
];
```

## 💻 Teknik Implementation

### State Management (Zustand)

```typescript
interface AdminStore {
  dashboard: AdminDashboardData | null;
  users: User[];
  moderationQueue: ModerationItem[];
  isLoading: boolean;
  error: string | null;
  fetchDashboard: () => Promise<void>;
  fetchUsers: (filters?: UserFilters) => Promise<void>;
  fetchModerationQueue: () => Promise<void>;
  performUserAction: (
    userId: string,
    action: UserActionRequest
  ) => Promise<void>;
  performModerationAction: (
    itemId: string,
    action: ModerationActionRequest
  ) => Promise<void>;
  clearError: () => void;
}

interface AdminSettingsStore {
  settings: PlatformSettings | null;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<PlatformSettings>) => Promise<void>;
}
```

### Custom Hooks

```typescript
// hooks/useAdminDashboard.ts
export function useAdminDashboard() {
  // Dashboard data, charts, alerts
}

// hooks/useUserManagement.ts
export function useUserManagement() {
  // User CRUD, filtering, bulk actions
}

// hooks/useContentModeration.ts
export function useContentModeration() {
  // Moderation queue, actions, approval workflow
}

// hooks/usePlatformSettings.ts
export function usePlatformSettings() {
  // Settings management, configuration
}
```

### Form Validation (Zod)

```typescript
// lib/validations/admin.ts
export const userActionSchema = z.object({
  action: z.enum(['suspend', 'unsuspend', 'ban', 'verify', 'unverify']),
  reason: z.string().optional(),
  duration: z.number().positive().optional(),
});

export const moderationActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'flag']),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export const platformSettingsSchema = z.object({
  platformFee: z.number().min(0).max(1),
  maxFileSize: z.number().positive(),
  allowedFileTypes: z.array(z.string()),
  maintenanceMode: z.boolean(),
});
```

### Component Structure

```typescript
// components/admin/AdminLayout.tsx
interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  // Admin layout with sidebar, header
}

// components/admin/UserTable.tsx
interface UserTableProps {
  users: User[];
  onUserAction: (userId: string, action: UserActionRequest) => void;
}

export function UserTable({ users, onUserAction }: UserTableProps) {
  // User management table with actions
}
```

## 🚀 Sprint Deliverables

### Functional Deliverables

- [ ] Admin dashboard with real-time metrics
- [ ] User management system with bulk actions
- [ ] Content moderation workflow
- [ ] Platform settings configuration
- [ ] Dispute resolution workflow
- [ ] System alerts ve monitoring
- [ ] Audit logging system

### Technical Deliverables

- [ ] AdminStore, AdminSettingsStore
- [ ] useAdminDashboard, useUserManagement hooks
- [ ] Admin-specific components
- [ ] Admin API endpoints with MSW
- [ ] Admin authentication ve authorization
- [ ] Comprehensive admin testing

### Quality Deliverables

- [ ] Admin panel accessibility
- [ ] Performance optimized (large datasets)
- [ ] Security audit for admin functions
- [ ] Admin documentation
- [ ] Monitoring ve alerting setup

## ✅ Test Scenarios

### Admin User Journey Tests

- **Dashboard Journey**:
  1. Admin login → Dashboard overview → Drill-down metrics
  2. Real-time updates → Alert notifications

- **User Management Journey**:
  1. User search → Profile view → Account action
  2. Bulk user selection → Bulk action → Confirmation

- **Moderation Journey**:
  1. Moderation queue → Content review → Decision
  2. Appeal process → Investigation → Resolution

### Edge Cases

- **Large datasets**: Pagination, performance under load
- **Concurrent admin actions**: Conflict resolution
- **System maintenance**: Graceful degradation
- **Permission issues**: Unauthorized access attempts

### Security Tests

- Admin authentication bypass attempts
- CSRF protection on admin actions
- SQL injection on admin queries
- XSS prevention in admin interface

## 🔍 Kabul Kriterleri

### Functional Acceptance

- [ ] Admin dashboard shows accurate real-time data
- [ ] User management actions working correctly
- [ ] Content moderation workflow smooth
- [ ] Platform settings applied immediately
- [ ] Audit logs comprehensive ve accurate

### Design Acceptance

- [ ] Admin interface intuitive ve efficient
- [ ] Data tables responsive ve performant
- [ ] Action confirmations clear
- [ ] Error handling user-friendly

### Technical Acceptance

- [ ] Admin API endpoints secure
- [ ] Performance targets met (large datasets)
- [ ] Security audit passed
- [ ] Audit logging comprehensive
- [ ] Error monitoring active

## 📊 Definition of Done

- [ ] Tüm admin features implemented
- [ ] Security testing completed
- [ ] Performance testing with large datasets
- [ ] Admin documentation written
- [ ] Monitoring ve alerting configured
- [ ] User acceptance testing passed
