# Sprint 13: Premium Üyelik Sistemi & Advanced Features - 2 hafta

## 🎯 Sprint Hedefleri

- Premium üyelik sistemi (subscription-based)
- Freelancer premium özellikleri
- Employer premium özellikleri
- Subscription billing ve yönetimi
- Premium analytics ve insights
- Öncelikli support sistemi
- Premium badge ve görünürlük

## 📱 Geliştirilecek Ekranlar

### Premium Subscription Management

**Rol**: Both  
**Özellikler**:

- Subscription plan seçimi (Basic, Pro, Enterprise)
- Pricing comparison table
- Subscription checkout flow
- Billing cycle management (monthly/yearly)
- Payment method management
- Subscription history ve invoices
- Plan upgrade/downgrade workflow
- Cancellation flow

### Freelancer Premium Features

**Rol**: Freelancer
**Özellikler**:

- Enhanced profile visibility (featured listing)
- Advanced portfolio gallery (unlimited projects)
- Priority search ranking
- Advanced analytics dashboard
- Custom portfolio URL
- Unlimited package creation
- Priority customer support
- Skill verification badges

### Employer Premium Features

**Rol**: Employer
**Özellikler**:

- Unlimited job postings
- Featured job listings
- Advanced candidate filtering
- Priority support
- Bulk messaging to freelancers
- Team collaboration features
- Advanced project management tools
- Custom branding options

### Premium Analytics Dashboard

**Rol**: Both
**Özellikler**:

- Advanced performance metrics
- Conversion funnel analysis
- ROI tracking ve insights
- Custom reporting
- Data export capabilities
- Predictive analytics
- Competitor insights
- Market trend analysis

## 🎨 UI/UX Tasarım Gereksinimleri

### Component'lar

- **Yeni Component'lar**:
  - `PricingTable` - Subscription plans comparison
  - `SubscriptionCard` - Current plan display
  - `BillingHistory` - Payment history
  - `PremiumBadge` - Premium user indicator
  - `FeatureComparison` - Feature comparison table
  - `UpgradePrompt` - Upgrade suggestions
  - `PremiumAnalytics` - Advanced analytics
  - `TeamManagement` - Team collaboration
  - `CustomBranding` - Brand customization
- **Güncellenecek Component'lar**:
  - `ProfileCard` - Premium indicators
  - `JobCard` - Featured highlighting
  - `SearchResults` - Priority ranking
  - `Dashboard` - Premium features
- **UI Library Integration**:
  - `Tabs`, `Progress`, `Badge`, `Alert` (Shadcn/ui)

### User Flow

- **Subscription Flow**: Plan Selection → Payment → Feature Activation → Dashboard
- **Upgrade Flow**: Current Plan → Comparison → Upgrade → Billing

### States & Interactions

- **Subscription States**: Active, expired, cancelled, trial
- **Payment States**: Processing, success, failed, pending
- **Feature States**: Available, restricted, trial mode
- **Billing States**: Current, overdue, refunded

### Accessibility

- Pricing table keyboard navigation
- Screen reader support for premium features
- High contrast premium indicators
- Focus management in subscription flows

## ⚙️ Fonksiyonel Özellikler

### Subscription Management System

**Açıklama**: Comprehensive subscription ve billing management
**Employer Perspective**: Unlimited job postings, featured listings, team features
**Freelancer Perspective**: Enhanced visibility, unlimited packages, priority support
**Acceptance Criteria**:

- [ ] Multiple subscription tiers (Basic, Pro, Enterprise)
- [ ] Monthly/yearly billing cycles
- [ ] Automatic renewal ve cancellation
- [ ] Pro-rated upgrades/downgrades
- [ ] Trial period management
- [ ] Payment failure handling
- [ ] Subscription analytics tracking

### Premium Freelancer Features

**Açıklama**: Enhanced features for premium freelancer subscribers
**Freelancer Perspective**: Better visibility, advanced tools, priority support
**Acceptance Criteria**:

- [ ] Featured profile listings
- [ ] Priority search ranking algorithm
- [ ] Unlimited portfolio projects
- [ ] Advanced analytics dashboard
- [ ] Custom portfolio URL
- [ ] Skill verification system
- [ ] Priority customer support queue

### Premium Employer Features

**Açıklama**: Advanced tools for premium employer subscribers
**Employer Perspective**: Better hiring tools, team management, analytics
**Acceptance Criteria**:

- [ ] Unlimited job postings
- [ ] Featured job highlighting
- [ ] Advanced filtering options
- [ ] Team collaboration workspace
- [ ] Bulk messaging capabilities
- [ ] Custom company branding
- [ ] Advanced project management tools

### Advanced Analytics & Insights

**Açıklama**: Premium analytics ve business intelligence
**Both Perspective**: Deep insights, predictive analytics, custom reports
**Acceptance Criteria**:

- [ ] Advanced performance metrics
- [ ] Custom reporting dashboard
- [ ] Data export functionality
- [ ] Predictive analytics algorithms
- [ ] Market trend analysis
- [ ] Competitor insights
- [ ] ROI tracking ve recommendations

## 🔌 Mock API Servisleri

### Endpoint Pattern: `/api/v1/subscriptions`, `/api/v1/premium`

#### GET /api/v1/subscriptions/plans

```typescript
interface SubscriptionPlansResponse {
  data: Array<{
    id: string;
    name: string;
    price: {
      monthly: number;
      yearly: number;
    };
    features: string[];
    limits: {
      jobPostings?: number;
      packages?: number;
      supportLevel: 'basic' | 'priority' | 'dedicated';
    };
    popular?: boolean;
  }>;
}

const mockSubscriptionPlans = [
  {
    id: 'basic',
    name: 'Basic',
    price: { monthly: 0, yearly: 0 },
    features: [
      '5 job postings per month',
      '3 packages',
      'Basic support',
      'Standard profile',
    ],
    limits: { jobPostings: 5, packages: 3, supportLevel: 'basic' },
  },
  {
    id: 'pro',
    name: 'Pro',
    price: { monthly: 29, yearly: 290 },
    features: [
      'Unlimited job postings',
      'Unlimited packages',
      'Featured listings',
      'Priority support',
      'Advanced analytics',
    ],
    limits: { supportLevel: 'priority' },
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: { monthly: 99, yearly: 990 },
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Custom branding',
      'Dedicated support',
      'API access',
    ],
    limits: { supportLevel: 'dedicated' },
  },
];
```

#### POST /api/v1/subscriptions/subscribe

```typescript
interface SubscribeRequest {
  planId: string;
  billingCycle: 'monthly' | 'yearly';
  paymentMethodId: string;
}

interface SubscribeResponse {
  success: boolean;
  subscriptionId?: string;
  clientSecret?: string; // Stripe payment intent
  trialEnd?: string;
  error?: string;
}

const mockSubscribeResponse = {
  success: true,
  subscriptionId: 'sub_1234567890',
  trialEnd: '2025-10-11T10:00:00Z',
};
```

#### GET /api/v1/subscriptions/current

```typescript
interface CurrentSubscriptionResponse {
  data: {
    id: string;
    planId: string;
    status: 'active' | 'trialing' | 'past_due' | 'canceled';
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    trialEnd?: string;
    billingCycle: 'monthly' | 'yearly';
    usage: {
      jobPostings: number;
      packages: number;
    };
    limits: {
      jobPostings?: number;
      packages?: number;
    };
  };
}

const mockCurrentSubscription = {
  id: 'sub_1234567890',
  planId: 'pro',
  status: 'active',
  currentPeriodEnd: '2025-10-11T10:00:00Z',
  cancelAtPeriodEnd: false,
  billingCycle: 'monthly',
  usage: { jobPostings: 12, packages: 8 },
  limits: {},
};
```

#### GET /api/v1/premium/analytics

```typescript
interface PremiumAnalyticsResponse {
  data: {
    performance: {
      profileViews: Array<{ date: string; views: number }>;
      conversionRate: number;
      avgResponseTime: number;
      clientRetention: number;
    };
    insights: {
      topPerformingSkills: string[];
      marketTrends: Array<{ skill: string; demand: number; growth: number }>;
      competitorAnalysis: {
        averageRates: { [skill: string]: number };
        marketPosition: 'top' | 'mid' | 'entry';
      };
    };
    predictions: {
      nextMonthEarnings: number;
      demandForecast: Array<{ skill: string; forecast: number }>;
      recommendations: string[];
    };
  };
}

const mockPremiumAnalytics = {
  performance: {
    profileViews: [
      { date: '2025-09-01', views: 45 },
      { date: '2025-09-02', views: 52 },
      // ...
    ],
    conversionRate: 0.18,
    avgResponseTime: 2.5, // hours
    clientRetention: 0.75,
  },
  insights: {
    topPerformingSkills: ['React', 'Node.js', 'TypeScript'],
    marketTrends: [
      { skill: 'AI Development', demand: 95, growth: 25 },
      { skill: 'Web3', demand: 78, growth: 45 },
    ],
    competitorAnalysis: {
      averageRates: { 'React Development': 45, 'UI/UX Design': 35 },
      marketPosition: 'top',
    },
  },
  predictions: {
    nextMonthEarnings: 5600,
    demandForecast: [
      { skill: 'React', forecast: 85 },
      { skill: 'Vue.js', forecast: 65 },
    ],
    recommendations: [
      'Consider raising rates for React development',
      'Add AI development to your skills',
    ],
  },
};
```

#### POST /api/v1/subscriptions/:id/cancel

```typescript
interface CancelSubscriptionRequest {
  reason?: string;
  feedback?: string;
  cancelImmediately?: boolean;
}

interface CancelSubscriptionResponse {
  success: boolean;
  cancelAtPeriodEnd: boolean;
  periodEnd: string;
  message: string;
}
```

### MSW Handler Implementation

```typescript
// lib/msw/handlers/premium.ts
export const premiumHandlers = [
  http.get('/api/v1/subscriptions/plans', () => {
    return HttpResponse.json({ data: mockSubscriptionPlans });
  }),
  http.post('/api/v1/subscriptions/subscribe', ({ request }) => {
    return HttpResponse.json(mockSubscribeResponse);
  }),
  http.get('/api/v1/subscriptions/current', () => {
    return HttpResponse.json({ data: mockCurrentSubscription });
  }),
  http.get('/api/v1/premium/analytics', () => {
    return HttpResponse.json({ data: mockPremiumAnalytics });
  }),
  http.post('/api/v1/subscriptions/:id/cancel', () => {
    return HttpResponse.json({
      success: true,
      cancelAtPeriodEnd: true,
      periodEnd: '2025-10-11T10:00:00Z',
      message: 'Subscription will cancel at the end of current period',
    });
  }),
];
```

## 💻 Teknik Implementation

### State Management (Zustand)

```typescript
interface SubscriptionStore {
  currentSubscription: Subscription | null;
  availablePlans: SubscriptionPlan[];
  billingHistory: BillingRecord[];
  isLoading: boolean;
  error: string | null;
  fetchCurrentSubscription: () => Promise<void>;
  fetchPlans: () => Promise<void>;
  subscribe: (request: SubscribeRequest) => Promise<void>;
  cancelSubscription: (id: string, reason?: string) => Promise<void>;
  updatePaymentMethod: (paymentMethodId: string) => Promise<void>;
  clearError: () => void;
}

interface PremiumStore {
  analytics: PremiumAnalytics | null;
  features: PremiumFeatures;
  isLoading: boolean;
  fetchAnalytics: () => Promise<void>;
  checkFeatureAccess: (feature: string) => boolean;
  trackFeatureUsage: (feature: string) => void;
}
```

### Custom Hooks

```typescript
// hooks/useSubscription.ts
export function useSubscription() {
  // Subscription management, billing, cancellation
}

// hooks/usePremiumFeatures.ts
export function usePremiumFeatures() {
  // Feature access, usage tracking, limits
}

// hooks/usePremiumAnalytics.ts
export function usePremiumAnalytics() {
  // Advanced analytics, insights, predictions
}

// hooks/useFeatureGating.ts
export function useFeatureGating(feature: string) {
  // Feature access control, upgrade prompts
}
```

### Form Validation (Zod)

```typescript
// lib/validations/subscription.ts
export const subscribeSchema = z.object({
  planId: z.string().min(1, 'Plan seçimi gereklidir'),
  billingCycle: z.enum(['monthly', 'yearly']),
  paymentMethodId: z.string().min(1, 'Ödeme yöntemi gereklidir'),
});

export const cancelSubscriptionSchema = z.object({
  reason: z.string().optional(),
  feedback: z.string().max(1000, 'Feedback çok uzun').optional(),
  cancelImmediately: z.boolean().optional(),
});

export type SubscribeFormData = z.infer<typeof subscribeSchema>;
export type CancelSubscriptionFormData = z.infer<
  typeof cancelSubscriptionSchema
>;
```

### Component Structure

```typescript
// components/premium/PricingTable.tsx
interface PricingTableProps {
  plans: SubscriptionPlan[];
  currentPlan?: string;
  onSelectPlan: (planId: string, billingCycle: string) => void;
}

export function PricingTable({
  plans,
  currentPlan,
  onSelectPlan,
}: PricingTableProps) {
  // Implementation
}

// components/premium/PremiumBadge.tsx
interface PremiumBadgeProps {
  plan: 'pro' | 'enterprise';
  size?: 'sm' | 'md' | 'lg';
}

export function PremiumBadge({ plan, size = 'md' }: PremiumBadgeProps) {
  // Implementation
}
```

## 🚀 Sprint Deliverables

### Functional Deliverables

- [ ] Subscription management system complete
- [ ] Premium freelancer features implemented
- [ ] Premium employer features implemented
- [ ] Advanced analytics dashboard
- [ ] Billing ve payment management
- [ ] Feature gating system
- [ ] Trial period management
- [ ] Cancellation workflow

### Technical Deliverables

- [ ] SubscriptionStore, PremiumStore Zustand stores
- [ ] useSubscription, usePremiumFeatures hooks
- [ ] Premium-specific components
- [ ] Subscription API with MSW
- [ ] Feature gating middleware
- [ ] Billing integration tests

### Quality Deliverables

- [ ] Subscription flow accessibility
- [ ] Payment security compliance
- [ ] Performance with premium features
- [ ] Comprehensive subscription testing
- [ ] Premium feature documentation

## ✅ Test Scenarios

### Subscription Journey Tests

- **Trial Journey**:
  1. Free user → Trial start → Feature access → Trial expiry → Subscription prompt
  2. Trial to paid conversion flow

- **Billing Journey**:
  1. Plan selection → Payment → Subscription active → Billing cycle
  2. Payment failure → Retry → Account suspension → Reactivation

- **Feature Access Journey**:
  1. Premium feature access → Usage tracking → Limit enforcement
  2. Downgrade → Feature restriction → Upgrade prompt

### Edge Cases

- **Payment failures**: Retry logic, account suspension
- **Subscription changes**: Mid-cycle upgrades, pro-rating
- **Feature limits**: Usage tracking, soft/hard limits
- **Cancellation**: Immediate vs end-of-period

### Performance Tests

- Premium analytics load time <2s
- Feature access check <50ms
- Subscription status check <100ms
- Payment processing <5s

## 🔍 Kabul Kriterleri

### Functional Acceptance

- [ ] Subscription plans clearly differentiated
- [ ] Payment processing secure ve reliable
- [ ] Premium features properly gated
- [ ] Analytics insights valuable ve accurate
- [ ] Cancellation flow user-friendly

### Design Acceptance

- [ ] Pricing table compelling ve clear
- [ ] Premium indicators visible but not intrusive
- [ ] Upgrade prompts contextual
- [ ] Billing interface professional

### Technical Acceptance

- [ ] Payment security PCI compliant
- [ ] Subscription state reliable
- [ ] Feature gating performant
- [ ] Analytics data accurate
- [ ] Billing integration working

## 📊 Definition of Done

- [ ] All subscription features implemented
- [ ] Payment security audited
- [ ] Premium feature access tested
- [ ] Analytics accuracy verified
- [ ] Billing cycle testing completed
- [ ] Documentation updated
