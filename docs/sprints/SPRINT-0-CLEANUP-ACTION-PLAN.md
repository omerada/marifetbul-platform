# 🚀 Sprint 0: Code Cleanup & Refactoring - Action Plan

**Sprint Süresi:** 2-3 gün  
**Başlangıç Tarihi:** 28 Ekim 2025  
**Sprint Hedefi:** Temiz, maintainable kod tabanı oluşturmak

---

## 📋 SPRINT BACKLOG

### Story 1: Duplicate Page Cleanup ⚡ PRIORITY: HIGH

**Süre:** 4-5 saat

#### Task 1.1: Admin Review Moderation Pages Analysis

**Detay:** 3 farklı version var, karar verilmeli

```bash
# Dosyalar:
app/admin/moderation/reviews/page.tsx       # v1.0.0 - 662 satır
app/admin/moderation/reviews/page-v2.tsx    # v2.0.0 - 486 satır
app/admin/moderation/reviews/page-v3.tsx    # Sprint 2 - newest
```

**Yapılacaklar:**

- [ ] Her üç dosyayı karşılaştır
- [ ] En güncel ve feature-complete olanı belirle (muhtemelen page-v3.tsx)
- [ ] Karar: Hangisi production'da kalacak?
- [ ] Decision rationale dokümante et

**Komutlar:**

```powershell
# File comparison
code --diff app/admin/moderation/reviews/page.tsx app/admin/moderation/reviews/page-v3.tsx

# Git history check
git log --follow -- app/admin/moderation/reviews/page-v3.tsx
```

**Expected Outcome:**

- Tek bir `page.tsx` dosyası kalmalı
- Diğerleri silinmeli
- `docs/decisions/admin-review-page-consolidation.md` oluşturulmalı

---

#### Task 1.2: Remove Deprecated Message Page

**Detay:** `page-old.tsx` dosyası hala duruyor

```bash
# Dosya:
app/messages/[id]/page-old.tsx    # 58 satır - DEPRECATED
```

**Yapılacaklar:**

- [ ] `page.tsx` ile karşılaştır
- [ ] Kullanılmadığını doğrula (import search)
- [ ] Git history'de backup olduğunu teyit et
- [ ] Dosyayı sil

**Komutlar:**

```powershell
# Search for imports
grep -r "page-old" app/ components/ hooks/

# Git history verification
git log --follow -- app/messages/[id]/page-old.tsx

# Safe deletion (after verification)
git rm app/messages/[id]/page-old.tsx
git commit -m "chore: remove deprecated message page (page-old.tsx)"
```

**Expected Outcome:**

- `page-old.tsx` silinmeli
- Git commit: "chore: remove deprecated message page"

---

#### Task 1.3: Document Cleanup Decisions

**Detay:** Neden bu kararları aldığımızı dokümante et

**Yapılacaklar:**

- [ ] `docs/decisions/` klasörü oluştur
- [ ] `duplicate-page-cleanup.md` oluştur
- [ ] Her karar için rationale yaz
- [ ] Before/after structure dokümante et

**Template:**

```markdown
# Duplicate Page Cleanup Decision Log

## Date: 28 Ekim 2025

### Admin Review Moderation Pages

**Problem:** 3 different versions existed

**Decision:** Keep page-v3.tsx, rename to page.tsx

**Rationale:**

- page-v3.tsx is the newest (Sprint 2)
- Uses modern components (PendingReviewsList, ModerationStats)
- Better organized code structure
- More features (tabs, filters, bulk actions)

**Action Taken:**

- Renamed page-v3.tsx → page.tsx
- Deleted page-v2.tsx
- Deleted original page.tsx
- Updated imports (if any)

**Verification:**

- npm run build ✓
- npm run lint ✓
- Manual testing ✓
```

---

### Story 2: Pagination Component Consolidation ⚡ PRIORITY: HIGH

**Süre:** 6-8 saat

#### Task 2.1: Pagination Components Audit

**Mevcut Dosyalar:**

```typescript
1. components/ui/Pagination.tsx (372 satır) - MOST COMPLETE
2. components/blog/CommentPagination.tsx (257 satır)
3. components/domains/marketplace/marketplace/MarketplacePagination.tsx (118 satır)
4. components/domains/admin/users/userTable/components/TablePagination.tsx
5. components/domains/admin/moderation/moderation/components/ModerationPagination.tsx
```

**Yapılacaklar:**

- [ ] Her component'i analiz et:
  - Props interface
  - Features (quick jumper, size changer, etc.)
  - Styling approach
  - Usage locations
- [ ] Feature matrix oluştur
- [ ] Consolidation strategy belirle

**Feature Matrix Tablosu:**

```
| Feature              | UI/Pagination | CommentPag | MarketplacePag | TablePag | ModerationPag |
|---------------------|--------------|------------|----------------|----------|---------------|
| Page numbers        | ✓            | ✓          | ✓              | ✓        | ✓             |
| Prev/Next buttons   | ✓            | ✓          | ✓              | ✓        | ✓             |
| First/Last buttons  | ✗            | ✓          | ✗              | ?        | ?             |
| Quick jumper        | ✓            | ✗          | ✗              | ?        | ?             |
| Size changer        | ✓            | ✓          | ✗              | ?        | ?             |
| Show total          | ✓            | ✓          | ✗              | ?        | ?             |
| Ellipsis (...)      | ✓            | ✓          | ✓              | ?        | ?             |
| Mobile responsive   | ✓            | ?          | ?              | ?        | ?             |
| Disabled state      | ✓            | ✓          | ✓              | ?        | ?             |
```

---

#### Task 2.2: Create UnifiedPagination Component

**Hedef:** Single, configurable pagination component

**Dosya Yapısı:**

```typescript
components/ui/pagination/
  ├── index.ts                      // Exports
  ├── UnifiedPagination.tsx         // Main component
  ├── PaginationButton.tsx          // Reusable button
  ├── PaginationEllipsis.tsx        // ... indicator
  ├── PaginationSizeChanger.tsx     // Items per page
  ├── PaginationQuickJumper.tsx     // Jump to page
  └── types.ts                      // Shared types
```

**UnifiedPagination Props:**

```typescript
export interface UnifiedPaginationProps {
  // Core
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;

  // Optional features
  pageSize?: number;
  total?: number;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];

  // UI Variants
  variant?: 'default' | 'simple' | 'compact' | 'mobile';
  size?: 'sm' | 'md' | 'lg';

  // Feature toggles
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean;
  showFirstLast?: boolean;

  // State
  disabled?: boolean;
  loading?: boolean;

  // Styling
  className?: string;
}
```

**Implementation Checklist:**

- [ ] Create component structure
- [ ] Implement core pagination logic
- [ ] Add variant support
- [ ] Add feature toggles
- [ ] Responsive design (mobile breakpoint)
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Storybook stories
- [ ] Unit tests
- [ ] Documentation

---

#### Task 2.3: Create Domain-Specific Wrappers

**Wrapper Components:**

```typescript
// 1. Blog Pagination Wrapper
// components/blog/pagination/BlogPagination.tsx
import { UnifiedPagination } from '@/components/ui/pagination';

export function BlogPagination(props: BlogPaginationProps) {
  return (
    <UnifiedPagination
      variant="default"
      showSizeChanger
      showTotal
      pageSizeOptions={[10, 25, 50, 100]}
      {...props}
    />
  );
}

// 2. Marketplace Pagination Wrapper
// components/domains/marketplace/pagination/MarketplacePagination.tsx
export function MarketplacePagination(props: MarketplacePaginationProps) {
  return (
    <UnifiedPagination
      variant="simple"
      showFirstLast={false}
      showSizeChanger={false}
      {...props}
    />
  );
}

// 3. Admin Table Pagination Wrapper
// components/domains/admin/pagination/AdminTablePagination.tsx
export function AdminTablePagination(props: AdminTablePaginationProps) {
  return (
    <UnifiedPagination
      variant="default"
      showQuickJumper
      showSizeChanger
      showTotal
      size="sm"
      {...props}
    />
  );
}
```

**Yapılacaklar:**

- [ ] 3 wrapper component oluştur
- [ ] Props type definitions
- [ ] Default configurations set
- [ ] Export from domain index files

---

#### Task 2.4: Migration & Cleanup

**Migration Plan:**

```typescript
// Phase 1: Create new components (parallel work)
// Phase 2: Update imports one by one
// Phase 3: Test each migration
// Phase 4: Delete old components

// Example migration (CommentPagination):

// OLD:
import { CommentPagination } from '@/components/blog/CommentPagination';

<CommentPagination
  currentPage={page}
  totalPages={totalPages}
  totalItems={total}
  itemsPerPage={size}
  onPageChange={setPage}
  onItemsPerPageChange={setSize}
/>

// NEW:
import { BlogPagination } from '@/components/blog/pagination';

<BlogPagination
  currentPage={page}
  totalPages={totalPages}
  total={total}
  pageSize={size}
  onPageChange={setPage}
  onPageSizeChange={setSize}
/>
```

**Yapılacaklar:**

- [ ] Search for all pagination usage:
  ```powershell
  grep -r "CommentPagination" app/ components/
  grep -r "MarketplacePagination" app/ components/
  grep -r "TablePagination" app/ components/
  ```
- [ ] Create migration checklist
- [ ] Update imports file by file
- [ ] Test after each migration
- [ ] Delete old component files
- [ ] Update exports in index.ts files

**Test Checklist Per Migration:**

- [ ] Page navigation works
- [ ] Size changer works (if applicable)
- [ ] Quick jumper works (if applicable)
- [ ] First/Last buttons work (if applicable)
- [ ] Mobile responsive
- [ ] No console errors
- [ ] Build passes

---

### Story 3: WebSocket Hook Cleanup ⚡ PRIORITY: CRITICAL

**Süre:** 2-3 saat

#### Task 3.1: Audit WebSocket Hook Usage

**Files:**

```typescript
1. hooks/infrastructure/websocket/useWebSocket.ts      // 538 lines - PRODUCTION
2. hooks/infrastructure/integrations/useWebSocket.ts   // 48 lines - DEPRECATED (re-export)
```

**Yapılacaklar:**

- [ ] Find all imports:
  ```powershell
  grep -r "from '@/hooks/infrastructure/integrations/useWebSocket'" app/ components/ hooks/
  grep -r "from './integrations/useWebSocket'" hooks/
  ```
- [ ] List files using deprecated import
- [ ] Create migration checklist

---

#### Task 3.2: Migrate Imports

**Migration:**

```typescript
// OLD (deprecated):
import { useWebSocket } from '@/hooks/infrastructure/integrations/useWebSocket';

// NEW (correct):
import { useWebSocket } from '@/hooks/infrastructure/websocket/useWebSocket';
// or
import { useWebSocket } from '@/hooks/infrastructure/websocket';
```

**Yapılacaklar:**

- [ ] Update imports in all files
- [ ] Run TypeScript compiler: `npm run type-check`
- [ ] Fix any type errors
- [ ] Test messaging functionality

---

#### Task 3.3: Delete Deprecated File

**Yapılacaklar:**

- [ ] Verify no imports remain
- [ ] Delete file:
  ```powershell
  git rm hooks/infrastructure/integrations/useWebSocket.ts
  ```
- [ ] Update `hooks/index.ts` exports
- [ ] Commit:
  ```powershell
  git commit -m "chore: remove deprecated WebSocket hook"
  ```

---

### Story 4: Code Quality Improvements ⚡ PRIORITY: MEDIUM

**Süre:** 3-4 saat

#### Task 4.1: ESLint Cleanup

**Yapılacaklar:**

- [ ] Run ESLint:
  ```powershell
  npm run lint
  ```
- [ ] Fix errors:
  ```powershell
  npm run lint:fix
  ```
- [ ] Review remaining warnings
- [ ] Fix critical warnings manually
- [ ] Update ESLint rules if needed

**Target:** 0 errors, < 10 warnings

---

#### Task 4.2: Remove Console Logs

**Yapılacaklar:**

- [ ] Search for console.log:
  ```powershell
  grep -r "console\.log" app/ components/ --exclude-dir=node_modules
  ```
- [ ] Replace with proper logging:

  ```typescript
  // BAD:
  console.log('User logged in:', user);

  // GOOD:
  import { logger } from '@/lib/shared/utils/logger';
  logger.info('User logged in', { userId: user.id });
  ```

- [ ] Keep only development debug logs (with conditions)
- [ ] Commit:
  ```powershell
  git commit -m "chore: replace console.log with proper logging"
  ```

---

#### Task 4.3: TODO/FIXME Review

**Yapılacaklar:**

- [ ] Find all TODOs:
  ```powershell
  grep -r "TODO\|FIXME\|HACK\|XXX" app/ components/ hooks/ lib/ --exclude-dir=node_modules > todos.txt
  ```
- [ ] Review each TODO
- [ ] Create GitHub issues for actionable items
- [ ] Add issue numbers to comments:

  ```typescript
  // Before:
  // TODO: Implement file upload

  // After:
  // TODO(#123): Implement file upload - see issue for details
  ```

- [ ] Remove obsolete TODOs
- [ ] Document non-actionable TODOs

---

#### Task 4.4: Example Files Cleanup

**Yapılacaklar:**

- [ ] Find example files:
  ```powershell
  find . -name "*.example.*" -o -name "*.template.*"
  ```
- [ ] Move to docs:
  ```powershell
  mkdir -p docs/examples
  mv components/domains/messaging/ModernConversationPage.example.tsx docs/examples/
  ```
- [ ] Update references in documentation
- [ ] Create `docs/examples/README.md`:

  ```markdown
  # Code Examples

  This folder contains example code snippets and templates.

  ## Available Examples

  - ModernConversationPage.example.tsx - Real-time chat interface
  ```

---

#### Task 4.5: TypeScript Strict Mode

**Yapılacaklar:**

- [ ] Enable strict mode in `tsconfig.json`:
  ```json
  {
    "compilerOptions": {
      "strict": true,
      "strictNullChecks": true,
      "strictFunctionTypes": true,
      "strictBindCallApply": true,
      "strictPropertyInitialization": true,
      "noImplicitThis": true,
      "alwaysStrict": true
    }
  }
  ```
- [ ] Run type check:
  ```powershell
  npm run type-check
  ```
- [ ] Fix type errors incrementally
- [ ] Prioritize critical files first

**Note:** Bu task diğerlerine göre daha uzun sürebilir. Eğer çok fazla error varsa, "Sprint 0.5" olarak ayırabilirsin.

---

### Story 5: Documentation Updates ⚡ PRIORITY: LOW

**Süre:** 1-2 saat

#### Task 5.1: Update README

**Yapılacaklar:**

- [ ] Update project structure in README
- [ ] Remove references to deleted files
- [ ] Add new component documentation
- [ ] Update setup instructions if needed

---

#### Task 5.2: Create Migration Guide

**File:** `docs/migrations/sprint-0-cleanup.md`

**Content:**

```markdown
# Sprint 0 Cleanup Migration Guide

## Pagination Components

### Before

\`\`\`typescript
import { CommentPagination } from '@/components/blog/CommentPagination';
import { MarketplacePagination } from '@/components/domains/marketplace/marketplace/MarketplacePagination';
\`\`\`

### After

\`\`\`typescript
import { BlogPagination } from '@/components/blog/pagination';
import { MarketplacePagination } from '@/components/domains/marketplace/pagination';
\`\`\`

## WebSocket Hook

### Before

\`\`\`typescript
import { useWebSocket } from '@/hooks/infrastructure/integrations/useWebSocket';
\`\`\`

### After

\`\`\`typescript
import { useWebSocket } from '@/hooks/infrastructure/websocket';
\`\`\`
```

---

## ✅ SPRINT DEFINITION OF DONE

### Code Quality

- [ ] Zero duplicate pages in codebase
- [ ] Single Pagination component (with variants)
- [ ] Single WebSocket hook (no deprecated versions)
- [ ] ESLint: 0 errors, < 10 warnings
- [ ] TypeScript: Build passes without errors
- [ ] Console.log statements removed (production code)

### Testing

- [ ] All existing tests still passing
- [ ] Manual testing of:
  - [ ] Admin review moderation pages
  - [ ] Messaging pages
  - [ ] Pagination in all locations
  - [ ] WebSocket connections

### Documentation

- [ ] Decision log created
- [ ] Migration guide created
- [ ] README updated
- [ ] Examples moved to docs/

### Git

- [ ] All changes committed with meaningful messages
- [ ] No merge conflicts
- [ ] Clean git history (squash if needed)
- [ ] Tagged as `v1.0.1-cleanup` or similar

---

## 📊 SPRINT TRACKING

### Daily Standup Questions

1. What did I complete yesterday?
2. What will I work on today?
3. Any blockers?

### Progress Tracking

```
Day 1:
  ☐ Story 1 (Duplicate Pages)
  ☐ Story 2 (Pagination - başlangıç)

Day 2:
  ☐ Story 2 (Pagination - devam)
  ☐ Story 3 (WebSocket Hook)

Day 3:
  ☐ Story 4 (Code Quality)
  ☐ Story 5 (Documentation)
  ☐ Final review & testing
```

---

## 🚨 RISK MITIGATION

### Potential Risks

1. **Breaking Changes**
   - Mitigation: Test each migration thoroughly
   - Backup: Create git branch before major changes
   - Rollback plan: Keep old files temporarily

2. **Unexpected Dependencies**
   - Mitigation: Search imports thoroughly before deletion
   - Tool: Use IDE "Find Usages" feature
   - Verification: Build + test after each deletion

3. **Time Overrun**
   - Mitigation: Prioritize critical tasks (Story 1-3)
   - Buffer: Story 4-5 are "nice to have"
   - Adjustment: Move low-priority tasks to next sprint if needed

---

## 🎯 POST-SPRINT ACTIONS

### Sprint Retrospective

- [ ] What went well?
- [ ] What could be improved?
- [ ] Action items for next sprint

### Code Review

- [ ] Self-review all changes
- [ ] Peer review (if team available)
- [ ] Address feedback

### Deployment

- [ ] Merge to main branch
- [ ] Deploy to staging environment
- [ ] Smoke testing
- [ ] Deploy to production (if stable)

---

## 📞 HELP & RESOURCES

### Commands Reference

```powershell
# ESLint
npm run lint
npm run lint:fix

# TypeScript
npm run type-check

# Build
npm run build

# Tests
npm run test
npm run test:e2e

# Search
grep -r "pattern" path/
find . -name "pattern"

# Git
git status
git diff
git add .
git commit -m "message"
git push origin branch-name
```

### Useful Tools

- VS Code: Find & Replace (Ctrl+Shift+F)
- Git Lens extension
- ESLint extension
- Prettier extension

---

**Sprint Start Date:** 28 Ekim 2025  
**Expected End Date:** 30-31 Ekim 2025  
**Sprint Lead:** Development Team

**Good luck! 🚀**
