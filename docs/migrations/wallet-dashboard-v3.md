# WalletDashboard Component Migration Guide (v3.0.0)

## Overview

The `WalletDashboard` component has been consolidated from two separate implementations into a single, unified component located at `components/domains/wallet/WalletDashboard.tsx`.

**Migration Date:** November 4, 2025
**Sprint:** Sprint 1 - Epic 1.1 - Component Consolidation
**Breaking Changes:** None (backwards compatible)

---

## What Changed?

### Deprecated Location

```typescript
// ❌ DEPRECATED (will be removed in v4.0.0)
import { WalletDashboard } from '@/components/wallet/WalletDashboard';
```

### New Location

```typescript
// ✅ RECOMMENDED
import { WalletDashboard } from '@/components/domains/wallet/WalletDashboard';

// Or use the canonical export from components/index
import { WalletDashboard } from '@/components';
```

---

## New Features in v3.0.0

### 1. Hybrid Props API (Controlled + Uncontrolled)

The unified component now supports both controlled and uncontrolled modes:

#### Uncontrolled Mode (Default - Uses Internal Hooks)

```tsx
<WalletDashboard showAnalytics={true} enableWebSocket={true} />
```

#### Controlled Mode (External Data)

```tsx
<WalletDashboard
  balance={{
    availableBalance: 1000,
    pendingBalance: 200,
    totalEarnings: 5000,
  }}
  transactions={myTransactions}
  isLoading={loading}
  error={error}
  onRefresh={handleRefresh}
/>
```

### 2. Quick Actions Section

New dedicated section for common wallet operations:

- Para Çek (Withdraw)
- İşlem Geçmişi (Transaction History)
- Çekim Geçmişi (Payout History)
- Dışa Aktar (Export)

### 3. Enhanced Stats Display

Now includes 4 key metrics:

- Aktif Siparişler (Active Orders)
- Bekleyen Escrow (Pending Escrow)
- Toplam Kazanç (Total Earnings)
- Real-time balance updates via WebSocket

### 4. Custom Callbacks

New optional callbacks for better integration:

```tsx
<WalletDashboard
  onRequestPayout={() => {
    // Custom payout request handler
  }}
  onViewTransactions={() => {
    // Custom transaction view handler
  }}
  onViewPayouts={() => {
    // Custom payouts view handler
  }}
  onRefresh={() => {
    // Custom refresh handler
  }}
/>
```

---

## Migration Steps

### Step 1: Update Imports

**Before:**

```typescript
import { WalletDashboard } from '@/components/wallet/WalletDashboard';
```

**After:**

```typescript
import { WalletDashboard } from '@/components/domains/wallet/WalletDashboard';
// or
import { WalletDashboard } from '@/components';
```

### Step 2: Update Props (If Needed)

The new component is **backwards compatible**. All old props are supported.

**Old Version Props:**

```typescript
interface WalletDashboardProps {
  balance?: WalletBalance;
  transactions?: Transaction[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onRequestPayout?: () => void;
  onViewTransactions?: () => void;
  onViewPayouts?: () => void;
  className?: string;
}
```

**New Version Props (Extended):**

```typescript
interface WalletDashboardProps {
  // Old props (still supported)
  balance?: {
    /* ... */
  };
  transactions?: Transaction[];
  isLoading?: boolean;
  error?: Error | string | null;
  onRefresh?: () => void;
  onRequestPayout?: () => void;
  onViewTransactions?: () => void;
  onViewPayouts?: () => void;
  className?: string;

  // New props
  defaultView?: 'overview' | 'transactions' | 'escrow' | 'payouts';
  showAnalytics?: boolean;
  enableWebSocket?: boolean;
  userId?: string;
}
```

### Step 3: Test Your Integration

```bash
# Run component tests
npm test -- WalletDashboard

# Run E2E tests
npm run test:e2e -- wallet
```

---

## Examples

### Example 1: Simple Usage (Uncontrolled)

```tsx
export default function WalletPage() {
  return (
    <div>
      <h1>My Wallet</h1>
      <WalletDashboard showAnalytics={true} enableWebSocket={true} />
    </div>
  );
}
```

### Example 2: Controlled with External State

```tsx
export default function WalletPage() {
  const { balance, transactions, loading, error } = useMyWalletLogic();

  return (
    <WalletDashboard
      balance={balance}
      transactions={transactions}
      isLoading={loading}
      error={error}
      onRefresh={() => refetch()}
    />
  );
}
```

### Example 3: Custom Actions

```tsx
export default function WalletPage() {
  const router = useRouter();

  return (
    <WalletDashboard
      onRequestPayout={() => {
        router.push('/wallet/new-payout');
      }}
      onViewTransactions={() => {
        router.push('/wallet/transactions');
      }}
    />
  );
}
```

---

## Breaking Changes

### None! 🎉

This migration is **fully backwards compatible**. The old API is still supported, and you can migrate gradually.

---

## Deprecation Timeline

- **v3.0.0** (Current): Old component deprecated, new component available
- **v3.1.0 - v3.9.0**: Both versions available, deprecation warnings
- **v4.0.0** (Future): Old component will be removed

---

## Benefits of Migration

### Performance

- ✅ Reduced bundle size (consolidated code)
- ✅ Better code splitting
- ✅ Optimized re-renders

### Developer Experience

- ✅ Single source of truth
- ✅ Better TypeScript support
- ✅ Improved documentation
- ✅ Easier to maintain

### Features

- ✅ Quick Actions section
- ✅ Enhanced stats display
- ✅ WebSocket support
- ✅ Export functionality
- ✅ Analytics integration

---

## Troubleshooting

### Issue: Import Error

**Error:**

```
Module not found: Can't resolve '@/components/domains/wallet/WalletDashboard'
```

**Solution:**
Check your tsconfig.json paths are correct:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Issue: Type Mismatch

**Error:**

```
Type 'string' is not assignable to type 'Error | string | null'
```

**Solution:**
The new component accepts both `string` and `Error` for the error prop. Update your type:

```typescript
const [error, setError] = useState<Error | string | null>(null);
```

### Issue: Missing WebSocket Connection

**Problem:**
Real-time updates not working

**Solution:**
Enable WebSocket explicitly:

```tsx
<WalletDashboard enableWebSocket={true} userId={currentUserId} />
```

---

## Support

For questions or issues:

- 📧 Email: dev@marifetbul.com
- 💬 Slack: #wallet-migration
- 📚 Docs: /docs/components/wallet-dashboard

---

## Checklist

Use this checklist to track your migration:

- [ ] Updated imports to new location
- [ ] Tested component renders correctly
- [ ] Verified all props work as expected
- [ ] Tested custom callbacks (if used)
- [ ] Updated tests (if any)
- [ ] Removed old imports
- [ ] Verified no console warnings
- [ ] Tested on staging environment
- [ ] Updated documentation (if applicable)

---

**Last Updated:** November 4, 2025
**Version:** 3.0.0
**Status:** ✅ Stable
