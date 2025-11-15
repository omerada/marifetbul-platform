# 🚀 Sprint 1: Milestone Payment System - Frontend Implementation

**Sprint Dönemi:** 18 Kasım - 1 Aralık 2025 (2 hafta)  
**Sprint Hedefi:** Milestone-based ödeme sisteminin frontend entegrasyonunu tamamlamak  
**Team Capacity:** 80 story points (2 developer × 2 hafta)

---

## 📊 Sprint Özeti

| Metrik           | Değer                 |
| ---------------- | --------------------- |
| Toplam Story     | 13                    |
| Story Points     | 78                    |
| Critical Tasks   | 5                     |
| High Priority    | 6                     |
| Medium Priority  | 2                     |
| Backend Hazırlık | ✅ %100               |
| Design Mockups   | ⚠️ %60 (eksikler var) |

---

## 🎯 Sprint Backlog

### Epic: Milestone Payment Frontend

#### Story 1.1: Milestone List Component ⭐⭐⭐⭐⭐

**Priority:** Critical  
**Story Points:** 8  
**Assignee:** [Developer A]  
**Estimated Time:** 3 gün

**User Story:**

```
As a user (buyer/seller)
I want to see milestone list in order details
So that I can track project progress and payments
```

**Acceptance Criteria:**

- [ ] `MilestoneList.tsx` component created
- [ ] Displays all milestones for an order
- [ ] Shows status badges (PENDING, IN_PROGRESS, DELIVERED, ACCEPTED)
- [ ] Progress bar shows completed/total milestones
- [ ] Progress bar shows amount completed/total amount
- [ ] Responsive design (mobile + desktop)
- [ ] Loading skeleton on fetch
- [ ] Empty state when no milestones
- [ ] Unit tests (>80% coverage)
- [ ] Storybook story

**Technical Tasks:**

```bash
# Files to create:
components/domains/milestones/
├── MilestoneList.tsx              # Main list component
├── MilestoneCard.tsx              # Individual milestone card
├── MilestoneProgressBar.tsx       # Progress indicator
├── MilestoneStatusBadge.tsx       # Status badge component
└── index.ts                       # Exports

# Files to update:
app/dashboard/orders/[id]/page.tsx # Add milestone section
lib/api/milestones.ts              # API client functions
types/business/features/milestone.ts # Type imports

# Tests:
__tests__/components/domains/milestones/
└── MilestoneList.test.tsx
```

**API Integration:**

```typescript
// GET /api/v1/orders/{orderId}/milestones
interface OrderMilestone {
  id: string;
  sequence: number;
  title: string;
  amount: number;
  status: MilestoneStatus;
  dueDate: string;
  deliveredAt?: string;
  acceptedAt?: string;
}
```

**Dependencies:**

- None (can start immediately)

**Definition of Done:**

- [ ] Code review approved
- [ ] Tests passing
- [ ] Design review approved
- [ ] Deployed to staging
- [ ] QA tested

---

#### Story 1.2: Milestone API Client ⭐⭐⭐⭐⭐

**Priority:** Critical  
**Story Points:** 5  
**Assignee:** [Developer A]  
**Estimated Time:** 2 gün

**User Story:**

```
As a frontend developer
I need a type-safe API client for milestones
So that components can fetch/mutate milestone data
```

**Acceptance Criteria:**

- [ ] `lib/api/milestones.ts` created
- [ ] All CRUD operations implemented
- [ ] TypeScript types from backend aligned
- [ ] Error handling with ApiError
- [ ] Loading states managed
- [ ] Response transformation (DTO -> UI model)
- [ ] Unit tests for all functions
- [ ] JSDoc documentation

**API Functions to Implement:**

```typescript
// lib/api/milestones.ts

export async function getOrderMilestones(orderId: string): Promise<OrderMilestone[]>
export async function getMilestone(milestoneId: string): Promise<OrderMilestone>
export async function createMilestone(orderId: string, data: CreateMilestoneRequest): Promise<OrderMilestone>
export async function updateMilestone(milestoneId: string, data: UpdateMilestoneRequest): Promise<OrderMilestone>
export async function deleteMilestone(milestoneId: string): Promise<void>
export async function startMilestone(milestoneId: string): Promise<OrderMilestone>
export async function deliverMilestone(milestoneId: string, data: DeliverMilestoneRequest): Promise<OrderMilestone>
export async function acceptMilestone(milestoneId: string): Promise<OrderMilestone>
export async function rejectMilestone(milestoneId: string, reason: string): Promise<OrderMilestone>
```

**Dependencies:**

- Backend endpoints (already available ✅)
- Type definitions (already in types/business/features/milestone.ts ✅)

---

#### Story 1.3: useMilestones Hook ⭐⭐⭐⭐

**Priority:** High  
**Story Points:** 5  
**Assignee:** [Developer A]  
**Estimated Time:** 2 gün

**User Story:**

```
As a frontend developer
I need a React hook for milestone state management
So that components can easily work with milestone data
```

**Acceptance Criteria:**

- [ ] `hooks/business/useMilestones.ts` created
- [ ] SWR integration for caching
- [ ] Optimistic updates on mutations
- [ ] Loading/error states
- [ ] Automatic revalidation
- [ ] WebSocket real-time updates
- [ ] Pagination support
- [ ] Unit tests

**Hook Interface:**

```typescript
interface UseMilestonesReturn {
  milestones: OrderMilestone[];
  isLoading: boolean;
  error: Error | null;

  // Actions
  startMilestone: (id: string) => Promise<void>;
  deliverMilestone: (id: string, data: DeliverMilestoneRequest) => Promise<void>;
  acceptMilestone: (id: string) => Promise<void>;
  rejectMilestone: (id: string, reason: string) => Promise<void>;

  // Utils
  getNextMilestone: () => OrderMilestone | null;
  calculateProgress: () => MilestoneProgress;
  canStartMilestone: (id: string) => boolean;
  canDeliverMilestone: (id: string) => boolean;
  canAcceptMilestone: (id: string) => boolean;
}
```

---

#### Story 1.4: Freelancer Milestone Actions ⭐⭐⭐⭐⭐

**Priority:** Critical  
**Story Points:** 13  
**Assignee:** [Developer B]  
**Estimated Time:** 4 gün

**User Story:**

```
As a freelancer (seller)
I want to start working on milestones and deliver them
So that I can get paid incrementally as I complete work
```

**Acceptance Criteria:**

- [ ] "Start Working" button shows when milestone is PENDING
- [ ] Status changes to IN_PROGRESS on click
- [ ] "Deliver Milestone" button shows when IN_PROGRESS
- [ ] Delivery modal opens with file upload
- [ ] Can add delivery notes (max 1000 chars)
- [ ] Can upload deliverables (images, PDFs, ZIPs)
- [ ] File validation (max 10MB per file, 5 files max)
- [ ] Status changes to DELIVERED on submit
- [ ] Buyer gets notification (email + in-app)
- [ ] Success toast message
- [ ] Error handling (network errors, validation)
- [ ] Loading states during actions
- [ ] Disabled state when processing

**Components to Create:**

```bash
components/domains/milestones/
├── FreelancerMilestoneActions.tsx     # Action buttons
├── DeliverMilestoneModal.tsx          # Delivery form modal
├── MilestoneFileUpload.tsx            # File upload component
└── MilestoneDeliveryForm.tsx          # Delivery notes form
```

**Dependencies:**

- File upload service (Cloudinary already integrated ✅)
- Notification system (already available ✅)

---

#### Story 1.5: Employer Milestone Acceptance ⭐⭐⭐⭐⭐

**Priority:** Critical  
**Story Points:** 13  
**Assignee:** [Developer B]  
**Estimated Time:** 4 gün

**User Story:**

```
As an employer (buyer)
I want to review and accept delivered milestones
So that freelancer gets paid and I confirm work quality
```

**Acceptance Criteria:**

- [ ] "Review Milestone" button shows when DELIVERED
- [ ] Review modal shows deliverables (preview if possible)
- [ ] Shows delivery notes from freelancer
- [ ] "Accept & Release Payment" button
- [ ] Escrow release confirmation dialog
- [ ] Shows payment amount to be released
- [ ] "Request Revision" button
- [ ] Revision reason form (required)
- [ ] Status changes to ACCEPTED on accept
- [ ] Status changes to REVISION_REQUESTED on reject
- [ ] Wallet balance updates in real-time
- [ ] Transaction appears in wallet history
- [ ] Freelancer gets notification
- [ ] Success/error feedback
- [ ] Auto-acceptance warning (72 hours countdown)

**Components to Create:**

```bash
components/domains/milestones/
├── EmployerMilestoneActions.tsx       # Action buttons
├── AcceptMilestoneModal.tsx           # Acceptance modal
├── RequestRevisionModal.tsx           # Revision request form
├── MilestoneDeliverablePreview.tsx    # File preview
└── AutoAcceptanceCountdown.tsx        # 72h timer
```

**Escrow Flow:**

```typescript
// When buyer accepts milestone:
1. Call acceptMilestone(milestoneId)
2. Backend releases payment from escrow
3. Wallet balance updates (WebSocket event)
4. Transaction created (type: MILESTONE_PAYMENT)
5. Notification sent to both parties
```

---

#### Story 1.6: Milestone Creation Wizard ⭐⭐⭐⭐

**Priority:** High  
**Story Points:** 8  
**Assignee:** [Developer B]  
**Estimated Time:** 3 gün

**User Story:**

```
As a seller accepting a custom order
I want to define payment milestones
So that payment is split into manageable chunks
```

**Acceptance Criteria:**

- [ ] Wizard accessible from order acceptance flow
- [ ] Step 1: Define number of milestones (2-10)
- [ ] Step 2: Configure each milestone:
  - [ ] Title (required, max 100 chars)
  - [ ] Description (required, max 500 chars)
  - [ ] Amount (required, min ₺50)
  - [ ] Due date (optional)
- [ ] Step 3: Review summary
- [ ] Validation: Total amount = Order amount
- [ ] Validation: Each milestone > ₺50
- [ ] "Add Milestone" button
- [ ] "Remove Milestone" button
- [ ] Auto-calculate remaining amount
- [ ] Suggest equal distribution
- [ ] Save draft (localStorage)
- [ ] Submit creates all milestones
- [ ] Success redirect to order detail

**Components:**

```bash
components/domains/milestones/
├── MilestoneCreationWizard.tsx        # Main wizard
├── MilestoneFormStep.tsx              # Single milestone form
├── MilestoneAmountDistributor.tsx     # Amount calculator
└── MilestoneReviewStep.tsx            # Summary step
```

---

#### Story 1.7: Milestone-Wallet Integration ⭐⭐⭐⭐

**Priority:** High  
**Story Points:** 8  
**Assignee:** [Developer A]  
**Estimated Time:** 3 gün

**User Story:**

```
As a user
I want to see milestone payments in my wallet
So that I can track incremental earnings/spendings
```

**Acceptance Criteria:**

- [ ] Wallet transaction list shows milestone payments
- [ ] Transaction type badge: "Milestone Payment"
- [ ] Description format: "Milestone 2/5: Logo Design - Order #123"
- [ ] Click opens milestone detail modal
- [ ] Escrow balance breakdown includes milestones
- [ ] Shows locked amount per order
- [ ] Shows milestone count (e.g., "3 of 5 completed")
- [ ] Payout request validates escrow amount
- [ ] Warning: "₺500 locked in milestones"
- [ ] Real-time balance update on acceptance

**Updates Required:**

```bash
# Files to update:
components/domains/wallet/
├── TransactionList.tsx                # Add milestone badge
├── TransactionDetailModal.tsx         # Show milestone info
├── BalanceCard.tsx                    # Add escrow breakdown
└── EscrowBalanceCard.tsx              # NEW: Escrow details

lib/services/
└── milestonePaymentService.ts         # NEW: Payment logic
```

---

#### Story 1.8: WebSocket Milestone Events ⭐⭐⭐

**Priority:** High  
**Story Points:** 5  
**Assignee:** [Developer A]  
**Estimated Time:** 2 gün

**User Story:**

```
As a user
I want to see real-time milestone status updates
So that I don't need to refresh the page
```

**Acceptance Criteria:**

- [ ] WebSocket connection for `/topic/milestones`
- [ ] Event: `MILESTONE_STATUS_CHANGED`
- [ ] Event: `MILESTONE_DELIVERED`
- [ ] Event: `MILESTONE_ACCEPTED`
- [ ] Event: `MILESTONE_REVISION_REQUESTED`
- [ ] UI updates in real-time
- [ ] Toast notification on events
- [ ] Audio notification (optional, user setting)
- [ ] Badge count update
- [ ] Handle connection loss gracefully

**Event Handlers:**

```typescript
interface MilestoneWebSocketEvent {
  type: 'MILESTONE_STATUS_CHANGED' | 'MILESTONE_DELIVERED' | 'MILESTONE_ACCEPTED';
  payload: {
    milestoneId: string;
    orderId: string;
    newStatus: MilestoneStatus;
    actor: { id: string; name: string };
    timestamp: string;
  };
}
```

---

#### Story 1.9: Milestone Progress Tracking ⭐⭐⭐

**Priority:** Medium  
**Story Points:** 5  
**Assignee:** [Developer B]  
**Estimated Time:** 2 gün

**User Story:**

```
As a user
I want to see milestone completion progress
So that I know how much of the project is done
```

**Acceptance Criteria:**

- [ ] Progress bar on order card (list view)
- [ ] Progress percentage (e.g., "3/5 milestones - 60%")
- [ ] Amount completed (e.g., "₺1,500 / ₺2,500")
- [ ] Color-coded progress:
  - [ ] Red: <30% complete
  - [ ] Orange: 30-70% complete
  - [ ] Green: >70% complete
- [ ] Tooltip shows next milestone
- [ ] Estimated completion date
- [ ] Overdue milestones highlighted

**Components:**

```bash
components/domains/milestones/
├── MilestoneProgressIndicator.tsx     # Progress bar
└── MilestoneProgressStats.tsx         # Stats display
```

---

#### Story 1.10: Auto-Acceptance Timer ⭐⭐⭐

**Priority:** Medium  
**Story Points:** 3  
**Assignee:** [Developer A]  
**Estimated Time:** 1 gün

**User Story:**

```
As a buyer
I want to know how long until milestone auto-accepts
So that I remember to review before deadline
```

**Acceptance Criteria:**

- [ ] Countdown timer shows on DELIVERED milestones
- [ ] Format: "Auto-accepts in 2 days 5 hours"
- [ ] Warning at <24 hours (yellow)
- [ ] Critical warning at <6 hours (red)
- [ ] Notification at 24h, 6h, 1h remaining
- [ ] Timer updates in real-time
- [ ] Disappears after acceptance

**Component:**

```bash
components/domains/milestones/
└── AutoAcceptanceTimer.tsx
```

---

#### Story 1.11: Milestone Email Templates ⭐⭐

**Priority:** Low  
**Story Points:** 2  
**Assignee:** Backend Team  
**Estimated Time:** 1 gün

**User Story:**

```
As a user
I want to receive clear email notifications
So that I stay informed about milestone events
```

**Email Templates Needed:**

- [ ] Milestone delivered (buyer)
- [ ] Milestone accepted (seller)
- [ ] Milestone revision requested (seller)
- [ ] Auto-acceptance approaching (buyer)
- [ ] Payment released (seller)

**Backend Task:**

- Update email templates
- Add milestone variables
- Test email delivery

---

#### Story 1.12: Milestone Analytics (Admin) ⭐⭐

**Priority:** Low  
**Story Points:** 5  
**Assignee:** [Developer B]  
**Estimated Time:** 2 gün

**User Story:**

```
As an admin
I want to see milestone usage statistics
So that I can understand adoption and issues
```

**Acceptance Criteria:**

- [ ] Admin dashboard widget: "Milestone Stats"
- [ ] Total orders with milestones
- [ ] Average milestones per order
- [ ] Acceptance rate
- [ ] Auto-acceptance rate
- [ ] Average delivery time per milestone
- [ ] Dispute rate (milestone orders vs normal)
- [ ] Chart: Milestone usage over time
- [ ] Export CSV

**Component:**

```bash
components/admin/analytics/
└── MilestoneAnalytics.tsx
```

---

#### Story 1.13: User Guide & Tooltips ⭐

**Priority:** Low  
**Story Points:** 3  
**Assignee:** Content Team + Developer A  
**Estimated Time:** 1 gün

**User Story:**

```
As a new user
I want to understand how milestones work
So that I can use the feature confidently
```

**Acceptance Criteria:**

- [ ] "What are Milestones?" info page
- [ ] Contextual tooltips on buttons
- [ ] First-time user tutorial (optional)
- [ ] Help center article
- [ ] Video tutorial (optional)
- [ ] FAQ section

**Content Needed:**

- Help article text
- Tooltip texts
- Tutorial steps

---

## 📅 Sprint Timeline

### Week 1 (18-22 Kasım)

**Monday-Tuesday:**

- Story 1.1: Milestone List Component (Dev A)
- Story 1.2: API Client (Dev A)

**Wednesday-Thursday:**

- Story 1.3: useMilestones Hook (Dev A)
- Story 1.4: Freelancer Actions - START (Dev B)

**Friday:**

- Story 1.4: Freelancer Actions - CONTINUE (Dev B)
- Code review & testing
- Sprint checkpoint

---

### Week 2 (25-29 Kasım)

**Monday-Tuesday:**

- Story 1.4: Freelancer Actions - COMPLETE (Dev B)
- Story 1.5: Employer Acceptance - START (Dev B)
- Story 1.7: Wallet Integration - START (Dev A)

**Wednesday-Thursday:**

- Story 1.5: Employer Acceptance - COMPLETE (Dev B)
- Story 1.7: Wallet Integration - COMPLETE (Dev A)
- Story 1.6: Creation Wizard (Dev B)
- Story 1.8: WebSocket Events (Dev A)

**Friday:**

- Story 1.9: Progress Tracking (Dev B)
- Story 1.10: Auto-accept Timer (Dev A)
- Final testing
- Sprint review & demo

---

## 🧪 Testing Strategy

### Unit Tests (Required for DoD)

- [ ] All components >80% coverage
- [ ] All hooks >80% coverage
- [ ] All API functions tested
- [ ] Edge cases covered

### Integration Tests

- [ ] Create milestone flow
- [ ] Deliver milestone flow
- [ ] Accept milestone flow
- [ ] Revision request flow
- [ ] Auto-acceptance flow

### E2E Tests

- [ ] Full milestone lifecycle (Playwright)
- [ ] Freelancer journey
- [ ] Employer journey
- [ ] Error scenarios

### Manual Testing Checklist

- [ ] Mobile responsiveness
- [ ] Browser compatibility (Chrome, Safari, Firefox)
- [ ] Accessibility (keyboard navigation, screen reader)
- [ ] Performance (Lighthouse >90)

---

## 🚀 Deployment Plan

### Staging Deployment (Daily)

- Auto-deploy on merge to `develop` branch
- Smoke tests after deployment
- QA testing in staging

### Production Deployment (Sprint End)

- **Date:** 1 Aralık 2025 (Cuma) 23:00
- Feature flag: `MILESTONE_PAYMENTS_ENABLED`
- Gradual rollout: 10% → 50% → 100%
- Monitor error rates
- Rollback plan ready

---

## 📊 Sprint Success Metrics

**Code Quality:**

- [ ] Zero critical bugs in production
- [ ] Code coverage >80%
- [ ] All PR reviews completed
- [ ] TypeScript strict mode passing

**Functionality:**

- [ ] All acceptance criteria met
- [ ] All user flows working
- [ ] Performance targets hit (FCP <1.5s)
- [ ] Accessibility score >90

**Business Metrics:**

- [ ] Milestone feature adoption >20% (first week)
- [ ] User satisfaction >4.5/5
- [ ] Support ticket volume <5/day
- [ ] Payment success rate >99%

---

## 🔒 Risk Management

| Risk                      | Probability | Impact   | Mitigation                               |
| ------------------------- | ----------- | -------- | ---------------------------------------- |
| File upload failures      | Medium      | High     | Cloudinary fallback, retry logic         |
| WebSocket connection loss | High        | Medium   | Polling fallback, reconnection           |
| Escrow release bugs       | Low         | Critical | Thorough testing, manual approval option |
| User confusion            | Medium      | Medium   | Clear UI, tooltips, help docs            |
| Performance issues        | Low         | Medium   | Lazy loading, code splitting             |

---

## 📝 Notes & Decisions

**Decision Log:**

- ✅ Use SWR for data fetching (caching + revalidation)
- ✅ Cloudinary for file uploads (already integrated)
- ✅ Zustand for global state (milestone store)
- ✅ WebSocket for real-time updates (STOMP protocol)
- ✅ 72-hour auto-acceptance period (configurable)
- ✅ Minimum milestone amount: ₺50
- ✅ Maximum milestones per order: 10

**Questions:**

- [ ] Should we allow milestone editing after creation? → NO (delete & recreate only)
- [ ] Can freelancer cancel delivered milestone? → NO (only buyer can request revision)
- [ ] What happens if buyer never accepts? → Auto-accept after 72h

---

## 🎯 Sprint Retrospective (End of Sprint)

**What Went Well:**

- (To be filled)

**What Didn't Go Well:**

- (To be filled)

**Action Items:**

- (To be filled)

**Team Velocity:**

- Planned: 78 points
- Completed: \_\_ points
- Next sprint capacity: \_\_

---

**Sprint Owner:** [Product Owner Name]  
**Scrum Master:** [Scrum Master Name]  
**Team:** [Developer A], [Developer B]  
**Start Date:** 18 Kasım 2025  
**End Date:** 1 Aralık 2025
