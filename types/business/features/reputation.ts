// Reputation & Security Types
export interface ReputationScore {
  userId: string;
  overallScore: number;
  components: {
    completionRate: number;
    responseTime: number;
    clientSatisfaction: number;
    reliability: number;
    communication: number;
    expertise: number;
  };
  level: ReputationLevel;
  badges: ReputationBadge[];
  lastUpdated: string;
  history: ReputationHistory[];
}

export type ReputationLevel =
  | 'newcomer'
  | 'rising'
  | 'established'
  | 'expert'
  | 'master'
  | 'legend';

export interface ReputationBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  earnedAt: string;
  isRare: boolean;
  level?: number;
}

export type BadgeCategory =
  | 'completion'
  | 'quality'
  | 'speed'
  | 'communication'
  | 'loyalty'
  | 'achievement'
  | 'milestone';

export interface ReputationHistory {
  id: string;
  change: number;
  reason: string;
  category:
    | 'job_completion'
    | 'review'
    | 'dispute'
    | 'verification'
    | 'penalty';
  orderId?: string;
  reviewId?: string;
  timestamp: string;
}

export interface SecurityStatus {
  userId: string;
  isVerified: boolean;
  verificationLevel: VerificationLevel;
  verifications: SecurityVerification[];
  alerts: SecurityAlert[];
  riskScore: number;
  lastSecurityCheck: string;
  trustIndicators: TrustIndicators;
}

export type VerificationLevel = 'basic' | 'standard' | 'premium' | 'enterprise';

export interface SecurityVerification {
  type: VerificationType;
  status: 'pending' | 'verified' | 'failed' | 'expired';
  verifiedAt?: string;
  expiresAt?: string;
  data?: Record<string, unknown>;
}

export type VerificationType =
  | 'email'
  | 'phone'
  | 'identity'
  | 'address'
  | 'payment'
  | 'background_check'
  | 'skill_test'
  | 'portfolio';

export interface SecurityAlert {
  id: string;
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  actionRequired: boolean;
  actionUrl?: string;
  dismissible: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export type AlertType =
  | 'suspicious_login'
  | 'password_breach'
  | 'unusual_activity'
  | 'verification_expired'
  | 'payment_failed'
  | 'account_locked'
  | 'data_breach'
  | 'policy_violation';

export interface TrustIndicators {
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerified: boolean;
  paymentVerified: boolean;
  profileComplete: boolean;
  hasPortfolio: boolean;
  hasReviews: boolean;
  memberSince: string;
  responseRate: number;
  onTimeDelivery: number;
}

export interface GetReputationResponse {
  reputation: ReputationScore;
  security: SecurityStatus;
}

export interface GetSecurityAlertsResponse {
  alerts: SecurityAlert[];
  unreadCount: number;
}
