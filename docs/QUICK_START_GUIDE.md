# 🚀 Quick Start Guide - Sprint Execution

**Hedef Audience:** Development Team  
**Amaç:** Sprint 1'e hızlı başlangıç  
**Süre:** 2 hafta

---

## 📋 Checklist: Sprint 1 Başlamadan Önce

### Backend Hazırlık ✅

- [x] Milestone API endpoints hazır
- [x] Escrow payment logic implement edilmiş
- [x] Email notification templates var
- [x] Database migrations tamamlanmış
- [x] Swagger documentation güncel

### Frontend Hazırlık ⚠️

- [ ] Figma mockups eksik (Story 1.1, 1.4, 1.5 için)
- [x] Type definitions hazır (`types/business/features/milestone.ts`)
- [x] API client base structure var
- [ ] Component structure tasarımı yapılmalı
- [ ] Test infrastructure kurulu

### DevOps Hazırlık ✅

- [x] Staging environment çalışıyor
- [x] CI/CD pipeline kurulu (GitHub Actions)
- [x] Sentry error tracking aktif
- [x] Monitoring dashboards (Grafana)
- [ ] Feature flag sistemi (yapılacak)

---

## 🎯 İlk Gün: Setup & Planning

### Morning Session (09:00-12:00)

#### 1. Sprint Kickoff Meeting (09:00-10:00)

**Katılımcılar:** Full team  
**Agenda:**

- [ ] Sprint goal review
- [ ] Backlog walkthrough
- [ ] Story point estimation confirm
- [ ] Developer assignment
- [ ] Questions & clarifications

**Deliverables:**

- Herkes görevini biliyor
- Dependencies belirlendi
- Risk'ler tespit edildi

---

#### 2. Development Environment Setup (10:00-12:00)

**Her Developer Yapacak:**

```bash
# 1. Latest code pull
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/milestone-frontend

# 3. Install dependencies
npm install

# 4. Run dev server
npm run dev

# 5. Verify backend connection
curl http://localhost:8080/api/v1/health
```

**Verify Checklist:**

- [ ] Frontend runs on localhost:3000
- [ ] Backend runs on localhost:8080
- [ ] Database connected (PostgreSQL)
- [ ] Redis connected
- [ ] Cloudinary credentials configured

---

### Afternoon Session (13:00-18:00)

#### 3. Component Structure Planning (13:00-14:30)

**Task:** Create folder structure

```bash
# Create milestone component structure
mkdir -p components/domains/milestones
cd components/domains/milestones

# Create component files
touch MilestoneList.tsx
touch MilestoneCard.tsx
touch MilestoneProgressBar.tsx
touch MilestoneStatusBadge.tsx
touch FreelancerMilestoneActions.tsx
touch EmployerMilestoneActions.tsx
touch DeliverMilestoneModal.tsx
touch AcceptMilestoneModal.tsx
touch RequestRevisionModal.tsx
touch MilestoneCreationWizard.tsx
touch AutoAcceptanceTimer.tsx
touch index.ts

# Create API client
mkdir -p lib/api
touch lib/api/milestones.ts

# Create hook
mkdir -p hooks/business
touch hooks/business/useMilestones.ts

# Create tests
mkdir -p __tests__/components/domains/milestones
touch __tests__/components/domains/milestones/MilestoneList.test.tsx
```

---

#### 4. API Client Skeleton (14:30-16:00)

**Developer A Task:** Create API function signatures

```typescript
// lib/api/milestones.ts

import { apiClient } from '@/lib/infrastructure/api/client';
import type {
  OrderMilestone,
  CreateMilestoneRequest,
  DeliverMilestoneRequest
} from '@/types/business/features/milestone';

const BASE_URL = '/api/v1';

export const milestonesApi = {
  // List milestones
  getOrderMilestones: async (orderId: string): Promise<OrderMilestone[]> => {
    const response = await apiClient.get<{ data: OrderMilestone[] }>(
      `${BASE_URL}/orders/${orderId}/milestones`
    );
    return response.data;
  },

  // Get single milestone
  getMilestone: async (milestoneId: string): Promise<OrderMilestone> => {
    const response = await apiClient.get<{ data: OrderMilestone }>(
      `${BASE_URL}/milestones/${milestoneId}`
    );
    return response.data;
  },

  // TODO: Implement remaining CRUD operations
  // createMilestone: async (orderId: string, data: CreateMilestoneRequest) => {},
  // updateMilestone: async (milestoneId: string, data: UpdateMilestoneRequest) => {},
  // deleteMilestone: async (milestoneId: string) => {},

  // TODO: Implement workflow actions
  // startMilestone: async (milestoneId: string) => {},
  // deliverMilestone: async (milestoneId: string, data: DeliverMilestoneRequest) => {},
  // acceptMilestone: async (milestoneId: string) => {},
  // rejectMilestone: async (milestoneId: string, reason: string) => {},
};

export default milestonesApi;
```

**Verify:**

```bash
# Test API connection
curl http://localhost:8080/api/v1/orders/TEST-UUID/milestones
```

---

#### 5. First Component: MilestoneList (16:00-18:00)

**Developer A Task:** Create basic list component

```tsx
// components/domains/milestones/MilestoneList.tsx

'use client';

import { useState, useEffect } from 'react';
import { milestonesApi } from '@/lib/api/milestones';
import type { OrderMilestone } from '@/types/business/features/milestone';

interface MilestoneListProps {
  orderId: string;
}

export function MilestoneList({ orderId }: MilestoneListProps) {
  const [milestones, setMilestones] = useState<OrderMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchMilestones() {
      try {
        setIsLoading(true);
        const data = await milestonesApi.getOrderMilestones(orderId);
        setMilestones(data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMilestones();
  }, [orderId]);

  if (isLoading) {
    return <div>Loading milestones...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (milestones.length === 0) {
    return <div>No milestones defined for this order.</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Project Milestones</h3>
      <ul className="divide-y">
        {milestones.map((milestone) => (
          <li key={milestone.id} className="py-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">{milestone.title}</p>
                <p className="text-sm text-gray-500">{milestone.description}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold">₺{milestone.amount}</p>
                <span className="text-xs px-2 py-1 rounded bg-gray-100">
                  {milestone.status}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Verify:**

- Component renders without errors
- Shows loading state
- Displays milestone list
- Handles empty state

---

## 📅 Daily Standup Template

### Daily Schedule: 09:30-09:45 (15 min)

**Format:**

1. **Yesterday:** What did I complete?
2. **Today:** What will I work on?
3. **Blockers:** Any impediments?

**Example:**

```
Developer A:
✅ Yesterday: Created API client skeleton, started MilestoneList
📋 Today: Complete MilestoneList, start MilestoneCard
🚫 Blockers: None

Developer B:
✅ Yesterday: Environment setup, reviewed designs
📋 Today: Start FreelancerMilestoneActions component
🚫 Blockers: Waiting for Figma mockup for delivery modal
```

---

## 🧪 Testing Workflow

### Daily Testing Routine

#### 1. Unit Tests (After Each Component)

```bash
# Run tests for specific file
npm test MilestoneList.test.tsx

# Watch mode during development
npm test -- --watch MilestoneList
```

**Minimum Coverage:**

- Component: >80%
- Hooks: >80%
- API functions: >90%

---

#### 2. Integration Tests (Weekly)

```bash
# Run integration tests
npm run test:integration

# Specific test suite
npm test -- --testPathPattern=milestones
```

---

#### 3. E2E Tests (Before Merge)

```bash
# Run Playwright tests
npm run test:e2e

# Headed mode (see browser)
npm run test:e2e:headed

# Specific test
npx playwright test milestone-flow
```

---

## 🔄 Git Workflow

### Feature Branch Strategy

```bash
# Create feature branch
git checkout -b feature/milestone-list

# Commit convention
git commit -m "feat(milestones): add MilestoneList component"
git commit -m "test(milestones): add MilestoneList tests"
git commit -m "fix(milestones): handle empty state"

# Push to remote
git push origin feature/milestone-list

# Create Pull Request
# Title: [SPRINT-1] Story 1.1: Milestone List Component
# Description:
# - Implements MilestoneList component
# - Adds unit tests (85% coverage)
# - Updates types for OrderMilestone
#
# Closes #JIRA-123
```

### Commit Message Convention

```
type(scope): subject

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- test: Tests
- refactor: Code refactoring
- style: Formatting
- chore: Maintenance

Examples:
feat(milestones): add delivery modal
fix(milestones): escrow release calculation
test(milestones): add acceptance flow test
docs(milestones): update API documentation
```

---

## 🚢 Deployment Process

### Daily Staging Deployment

```bash
# Automatic on merge to develop
git checkout develop
git merge feature/milestone-list
git push origin develop

# CI/CD pipeline runs:
1. ✅ Lint check
2. ✅ Type check
3. ✅ Unit tests
4. ✅ Build
5. ✅ Deploy to staging

# Verify deployment
open https://staging.marifetbul.com
```

---

### Production Deployment (Sprint End)

**Date:** 1 Aralık 2025, Cuma 23:00

```bash
# Pre-deployment checklist
- [ ] All stories completed
- [ ] All tests passing
- [ ] QA approval
- [ ] Stakeholder demo completed
- [ ] Rollback plan ready

# Deployment steps
1. Merge develop -> main
2. Tag release: v1.1.0-milestone-payments
3. Deploy backend first
4. Deploy frontend
5. Enable feature flag: MILESTONE_PAYMENTS_ENABLED
6. Monitor error rates (Sentry)
7. Monitor performance (Grafana)

# Rollback if needed
1. Disable feature flag
2. Revert deployment
3. Investigate issue
```

---

## 📊 Progress Tracking

### Story Status Board

| Story                   | Status         | Progress | Assignee | Notes             |
| ----------------------- | -------------- | -------- | -------- | ----------------- |
| 1.1 Milestone List      | 🟡 In Progress | 60%      | Dev A    | API client done   |
| 1.2 API Client          | ✅ Done        | 100%     | Dev A    | Merged to develop |
| 1.3 useMilestones Hook  | ⚪ Not Started | 0%       | Dev A    | Waiting for 1.1   |
| 1.4 Freelancer Actions  | 🟡 In Progress | 30%      | Dev B    | UI design pending |
| 1.5 Employer Acceptance | ⚪ Not Started | 0%       | Dev B    | -                 |

**Legend:**

- ⚪ Not Started
- 🟡 In Progress
- ✅ Done
- 🔴 Blocked

---

## 🆘 Common Issues & Solutions

### Issue 1: API Connection Failed

**Symptom:** `ERR_CONNECTION_REFUSED`

**Solution:**

```bash
# Check backend is running
curl http://localhost:8080/actuator/health

# Verify .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# Restart services
npm run dev
```

---

### Issue 2: TypeScript Errors

**Symptom:** Type mismatch errors

**Solution:**

```bash
# Regenerate types
npm run type-check

# Check backend DTO vs frontend type alignment
# Compare:
# - Backend: OrderMilestoneDTO.java
# - Frontend: types/business/features/milestone.ts
```

---

### Issue 3: Tests Failing

**Symptom:** Jest tests fail after component update

**Solution:**

```bash
# Clear cache
npm test -- --clearCache

# Update snapshots
npm test -- -u

# Run specific test
npm test MilestoneList
```

---

### Issue 4: Build Errors

**Symptom:** `next build` fails

**Solution:**

```bash
# Check TypeScript errors
npm run type-check

# Check ESLint
npm run lint

# Clean build cache
rm -rf .next
npm run build
```

---

## 📞 Team Communication

### Slack Channels

- `#sprint-1-milestones` - Daily updates
- `#dev-frontend` - Technical discussions
- `#dev-backend` - Backend coordination
- `#qa-testing` - Bug reports

### Meeting Schedule

- **Daily Standup:** 09:30 (15 min)
- **Code Review:** 14:00 (30 min, as needed)
- **Sprint Review:** Fridays 16:00 (1 hour)
- **Retrospective:** Last Friday 17:00 (1 hour)

---

## 🎯 Success Criteria Reminder

**Sprint 1 is successful when:**

- [ ] All 13 stories completed
- [ ] Code coverage >80%
- [ ] Zero critical bugs
- [ ] Stakeholder demo approved
- [ ] Feature flag ready for production
- [ ] Documentation updated

**Feature is production-ready when:**

- [ ] Milestone creation works
- [ ] Freelancer can deliver
- [ ] Employer can accept/reject
- [ ] Payments release from escrow
- [ ] Real-time updates working
- [ ] Mobile responsive
- [ ] Accessibility checked
- [ ] Performance targets hit

---

## 📚 Useful Resources

### Documentation

- [Sprint 1 Backlog](./SPRINT_1_BACKLOG.md)
- [Technical Debt Tracker](./TECHNICAL_DEBT_TRACKER.md)
- [API Documentation](../marifetbul-backend/docs/API.md)
- [Component Library](https://storybook.marifetbul.com)

### Design

- [Figma Mockups](https://figma.com/...) _(to be added)_
- [Design System](./DESIGN_SYSTEM.md)

### Backend

- [Swagger API Docs](http://localhost:8080/swagger-ui.html)
- [Database Schema](../marifetbul-backend/docs/DATABASE_SCHEMA.md)

---

**Created:** 15 Kasım 2025  
**Updated:** Daily during sprint  
**Owner:** Scrum Master

🚀 **Happy Coding!**
