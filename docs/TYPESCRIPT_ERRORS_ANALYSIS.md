# TypeScript Errors Analysis

**Generated**: 2025-11-04  
**Branch**: feature/sprint1-day1-dashboard-cleanup  
**Total Errors**: 37

## Error Categories

### 🔴 CATEGORY 1: dashboardAdapters.ts Icon Type Errors (22 errors)

**Priority**: HIGH - Blocks dashboard functionality  
**Effort**: MEDIUM (1-2 hours)  
**File**: `components/domains/dashboard/utils/dashboardAdapters.ts`

**Problem**: QuickAction icons defined as strings instead of LucideIcon components

**Error Pattern**:

```
Type 'string' is not assignable to type 'LucideIcon'
```

**Affected Lines**:

- Line 124: `icon: 'Plus'`
- Line 132: `icon: 'ShoppingBag'`
- Line 141: `icon: 'MessageSquare'`
- Line 150: `icon: 'Wallet'`
- Line 438: `icon: 'Plus'`
- Line 445: `icon: 'Package'`
- Line 455: `icon: 'FileText'`
- Line 465: `icon: 'Briefcase'`
- Line 480: `icon: 'Plus'`
- Line 770: `icon: 'Plus'`
- Line 780: `icon: 'Package'`
- Line 789: `icon: 'FileText'`
- Line 796: `icon: 'UserPlus'`
- Line 802: `icon: 'TrendingUp'`
- Line 1038: `icon: 'Plus'`
- Line 1046: `icon: 'FileText'`
- Line 1057: `icon: 'Users'`
- Line 1064: `icon: 'MessageSquare'`
- Line 1072: `icon: 'TrendingUp'`

**Plus 3+ more locations**

**Solution Strategy**:

1. Import required icons from lucide-react
2. Replace string references with component references
3. Create icon mapping helper if needed

**Icon Mapping Needed**:

```typescript
import {
  Plus,
  ShoppingBag,
  MessageSquare,
  Wallet,
  Package,
  FileText,
  Briefcase,
  UserPlus,
  TrendingUp,
  Users,
} from 'lucide-react';

// Replace:
icon: 'Plus'
// With:
icon: Plus
```

---

### 🟡 CATEGORY 2: ModeratorDashboard Chart Properties (1 error)

**Priority**: MEDIUM - Partially fixed but incomplete  
**Effort**: LOW (15 minutes)  
**File**: `components/domains/dashboard/utils/dashboardAdapters.ts`

**Problem**: Missing chart properties in ModeratorDashboard adapter

**Error**:

```
Line 1122: Type is missing properties: moderationVolume, responseTime
```

**Solution**: Add missing chart data in transformModeratorData function

```typescript
charts: {
  actionsToday: { ... },
  categoryBreakdown: { ... },
  moderationVolume: {
    id: 'moderation-volume',
    title: 'Moderasyon Hacmi',
    series: [{ name: 'Hacim', data: [] }],
    config: { type: 'line' as const, height: 300 }
  },
  responseTime: {
    id: 'response-time',
    title: 'Yanıt Süresi',
    series: [{ name: 'Süre (dk)', data: [] }],
    config: { type: 'area' as const, height: 300 }
  }
}
```

---

### 🟠 CATEGORY 3: Dispute Status Type Mismatches (5 errors)

**Priority**: LOW - Pre-existing, doesn't block sprint  
**Effort**: MEDIUM (30 minutes)  
**File**: `app/dashboard/disputes/page.tsx`

**Problem**: DisputeStatus enum mismatch between types

**Errors**:

```
Line 131: 'DisputeStatus' and '"ESCALATED"' have no overlap
Line 141: '"OPEN"' is not assignable to type 'FilterStatus'
Line 142: '"UNDER_REVIEW"' is not assignable to type 'FilterStatus'
Line 143: '"ESCALATED"' is not assignable to type 'FilterStatus'
Line 144: '"RESOLVED"' is not assignable to type 'FilterStatus'
```

**Root Cause**: FilterStatus type doesn't include all DisputeStatus values

**Solution**: Align FilterStatus with backend DisputeStatus enum

```typescript
type FilterStatus = 'ALL' | DisputeStatus;
```

---

### 🟢 CATEGORY 4: Missing Module Declarations (3 errors)

**Priority**: LOW - Development dependencies  
**Effort**: LOW (10 minutes)  
**Files**: `app/dashboard/wallet/escrow/actions.ts`, `app/dashboard/wallet/escrow/page.tsx`

**Problem**: Missing type declarations for custom modules

**Errors**:

```
Line 4: Cannot find module 'next-auth'
Line 5: Cannot find module '@/lib/auth/auth-options'
Line 6: Cannot find module '@/lib/config/api-config'
Line 37: Cannot find module '@/lib/infrastructure/logging/logger'
```

**Solution**: Either install types or create declaration files

```bash
npm install --save-dev @types/next-auth
# OR create types/modules.d.ts
```

---

### 🔵 CATEGORY 5: Notification Type Conflicts (3 errors)

**Priority**: LOW - UI cosmetic issue  
**Effort**: MEDIUM (30 minutes)  
**Files**: `components/layout/header/NotificationDropdown.tsx`, `components/shared/NotificationsBell.tsx`

**Problem**: InAppNotification vs Notification type mismatch

**Errors**:

```
Line 127: 'InAppNotification' is not assignable to 'Notification'
Line 132: 'job_application' is not assignable to 'NotificationType'
Line 146: Property 'content' does not exist on 'InAppNotification'
```

**Root Cause**: Two different notification type systems in use

**Solution**: Unify notification types or add type adapters

---

### 🟣 CATEGORY 6: Dashboard Data Type Union Issues (3 errors)

**Priority**: LOW - Type system refinement  
**Effort**: MEDIUM (45 minutes)  
**File**: `components/domains/dashboard/hooks/useDashboard.ts`

**Problem**: UnifiedDashboardData union type not assignable to legacy DashboardData

**Errors**:

```
Line 264: 'UnifiedDashboardData' not assignable to 'DashboardData'
Line 292: 'UnifiedDashboardData' not assignable to 'DashboardData'
Line 405: 'UnifiedDashboardData | null' not assignable to 'DashboardData | null'
```

**Root Cause**: Legacy DashboardData type expects EmployerDashboard shape

**Solution**: Update type definitions to use UnifiedDashboardData everywhere

---

### 🟤 CATEGORY 7: Miscellaneous Type Errors (3 errors)

#### 7.1 ModeratorPerformanceCharts Props (1 error)

**File**: `app/moderator/performance/page.tsx`

```
Line 15: Property 'days' does not exist on type 'ModeratorPerformanceChartsProps'
```

**Solution**: Add `days` prop to interface or remove from usage

#### 7.2 Dispute Evidence File Upload (2 errors)

**Files**:

- `hooks/business/disputes/useCreateDispute.ts`
- `hooks/business/disputes/useDisputeEvidence.ts`

```
Line 31/52: Argument of type 'File[]' not assignable to evidence type
```

**Solution**: Transform File[] to expected format before passing

---

## Recommended Action Plan

### Phase 1: Critical Fixes (Sprint Priority)

1. ✅ **dashboardAdapters.ts icons** (22 errors) - DEFERRED to dedicated task
   - Large file (1188 lines)
   - Needs careful testing
   - Create separate PR

2. ⚡ **ModeratorDashboard charts** (1 error) - FIX NOW
   - Quick fix
   - Blocks moderator dashboard

### Phase 2: Type System Cleanup (Post-Sprint)

3. **DisputeStatus alignment** (5 errors)
4. **Notification type unification** (3 errors)
5. **Dashboard type migration** (3 errors)

### Phase 3: Infrastructure (Backlog)

6. **Module declarations** (3 errors)
7. **Miscellaneous fixes** (3 errors)

---

## Success Metrics

**Current**: 37 TypeScript errors  
**After Phase 1**: ~14 errors (23 fixed)  
**After Phase 2**: ~3 errors (34 fixed)  
**Target**: 0 errors (100% type-safe)

**Sprint Impact**:

- GÜN 1-5: Fixed 6+ errors
- Remaining: 37 errors categorized and prioritized
- Clean architecture maintained

---

## Notes

- All dashboard-related duplicate code eliminated ✅
- Navigation centralized ✅
- Test routes secured ✅
- Export conflicts resolved ✅
- Type system becoming more consistent

**Next Steps**: Fix ModeratorDashboard chart properties, then tackle dashboardAdapters icons in dedicated sprint task.
