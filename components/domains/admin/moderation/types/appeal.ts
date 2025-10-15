/**
 * Content Appeal Type Definitions
 *
 * Centralized type definitions for the content appeal system.
 * Extracted from ContentAppealSystem.tsx for reusability.
 */

export type AppealStatus =
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'escalated';
export type AppealPriority = 'low' | 'medium' | 'high' | 'urgent';
export type AppealReason =
  | 'incorrect_decision'
  | 'content_misunderstood'
  | 'policy_misapplied'
  | 'technical_error'
  | 'other';

export type ContentType = 'job' | 'service' | 'review' | 'message' | 'profile';
export type ModerationAction = 'removed' | 'hidden' | 'flagged' | 'suspended';
export type UserType = 'freelancer' | 'employer';

export type ReviewAction = 'assigned' | 'reviewed' | 'escalated' | 'resolved';
export type ResolutionDecision = 'upheld' | 'overturned' | 'partially_upheld';
export type ResolutionAction =
  | 'restore_content'
  | 'maintain_action'
  | 'modify_action'
  | 'escalate_further';

export type EvidenceType = 'document' | 'image' | 'link' | 'text';

export interface UserInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  userType: UserType;
}

export interface OriginalContent {
  id: string;
  type: ContentType;
  title: string;
  description: string;
  url?: string;
  moderatedAt: string;
  moderationReason: string;
  moderatorId: string;
  moderatorName: string;
  action: ModerationAction;
}

export interface SupportingEvidence {
  id: string;
  type: EvidenceType;
  description?: string;
  url?: string;
  content?: string;
  uploadedAt: string;
}

export interface AssignedReviewer {
  id: string;
  name: string;
  role: string;
}

export interface ReviewHistoryItem {
  id: string;
  reviewerId: string;
  reviewerName: string;
  action: ReviewAction;
  status: AppealStatus;
  notes?: string;
  timestamp: string;
  reviewedAt: string;
}

export interface AppealResolution {
  decision: ResolutionDecision;
  reason: string;
  action: ResolutionAction;
  reviewerId: string;
  reviewerName: string;
  resolvedAt: string;
  compensationOffered?: boolean;
  compensationDetails?: string;
}

export interface InternalNote {
  id: string;
  authorId: string;
  authorName: string;
  note: string;
  isConfidential: boolean;
  createdAt: string;
}

export interface ContentAppeal {
  id: string;
  appealNumber: string;
  userId: string;
  userInfo: UserInfo;
  moderationItemId: string;
  originalContent: OriginalContent;
  appealReason: AppealReason;
  appealDescription: string;
  userJustification?: string;
  supportingEvidence?: SupportingEvidence[];
  status: AppealStatus;
  priority: AppealPriority;
  assignedTo?: AssignedReviewer;
  reviewHistory: ReviewHistoryItem[];
  resolution?: AppealResolution;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  tags: string[];
  internalNotes: InternalNote[];
}

export interface AppealStatusData {
  status: string;
  count: number;
  percentage: number;
}

export interface AppealReasonData {
  reason: string;
  count: number;
  successRate: number;
}

export interface ResolutionTrend {
  date: string;
  approved: number;
  rejected: number;
  escalated: number;
}

export interface ReviewerPerformanceData {
  reviewerId: string;
  reviewerName: string;
  reviewedAppeals: number;
  averageTime: number;
  successRate: number;
}

export interface AppealStats {
  totalAppeals: number;
  pendingAppeals: number;
  underReview: number;
  resolvedToday: number;
  averageResolutionTime: number; // hours
  appealsByStatus: AppealStatusData[];
  appealsByReason: AppealReasonData[];
  resolutionTrends: ResolutionTrend[];
  reviewerPerformance: ReviewerPerformanceData[];
}

export interface AppealFilters {
  status: string;
  priority: string;
  reason: string;
  search: string;
}

export type AppealAction = {
  action: 'approve' | 'reject' | 'escalate' | 'assign' | 'add_note';
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  assigneeId?: string;
};

export interface AppealActionPayload {
  action: 'approve' | 'reject' | 'escalate' | 'assign' | 'add_note';
  notes?: string;
  assigneeId?: string;
}
