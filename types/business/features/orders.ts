// Consolidated order types
import { User } from '../../core/base';

// Platform only supports TRY (Turkish Lira)
export type Currency = 'TRY';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'failed'
  | 'refunded'
  | 'disputed';

export interface Order {
  id: string;
  orderNumber: string;
  buyerId: string;
  sellerId: string;
  buyer: User;
  seller: User;
  packageId?: string;
  jobId?: string;
  customOrderDetails?: CustomOrderDetails;
  packageDetails?: {
    packageTitle: string;
    tier?: 'basic' | 'standard' | 'premium';
    deliveryDays?: number;
  };
  status: OrderStatus;
  amount: number;
  currency: Currency;
  paymentStatus: PaymentStatus;
  financials?: {
    total: number;
    currency: Currency;
    platformFee?: number;
    sellerEarnings?: number;
  };
  deliveryDate: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
  requirements: OrderRequirement[];
  deliverables: OrderDeliverable[];
  milestones: OrderMilestone[];
  communications: OrderCommunication[];
  disputes?: OrderDispute[];
  // Additional computed/convenience fields
  packageTitle?: string; // Convenience field for direct access
  customDescription?: string; // For custom orders
  totalAmount?: number; // Alternative to financials.total
  sellerName?: string; // Convenience field
  buyerName?: string; // Convenience field
  // Additional capabilities
  canCancel?: boolean;
  canSubmitDelivery?: boolean;
  canApproveDelivery?: boolean;
  canRequestRevision?: boolean;
  delivery?: {
    submittedAt?: string;
    notes?: string;
    files?: string[];
  };
  revisions?: {
    revisionsRemaining: number;
    maxRevisions: number;
    revisionLimit?: number; // Total allowed
    history?: Array<{
      requestedAt: string;
      notes: string;
    }>;
  };
}

export type OrderStatus =
  | 'pending'
  | 'active'
  | 'in_progress'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'disputed'
  | 'refunded';

export interface CustomOrderDetails {
  title: string;
  description: string;
  requirements: string[];
  deliveryTime: number; // days
  revisions: number;
  features: string[];
}

export interface OrderRequirement {
  id: string;
  title: string;
  description: string;
  type: 'text' | 'file' | 'url' | 'multiple_choice';
  isRequired: boolean;
  response?: OrderRequirementResponse;
  options?: string[]; // for multiple choice
}

export interface OrderRequirementResponse {
  value: string | string[];
  files?: string[];
  submittedAt: string;
}

export interface OrderDeliverable {
  id: string;
  title: string;
  description: string;
  files?: string[];
  deliveredAt: string;
  isAccepted: boolean;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
  revisionRequested?: boolean;
  revisionNotes?: string;
}

export interface OrderMilestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  completedAt?: string;
  paymentReleased: boolean;
  paymentReleasedAt?: string;
}

export interface OrderCommunication {
  id: string;
  type:
    | 'message'
    | 'revision_request'
    | 'delivery'
    | 'acceptance'
    | 'cancellation';
  from: 'buyer' | 'seller' | 'system';
  message: string;
  attachments?: string[];
  timestamp: string;
  isRead: boolean;
}

export interface OrderDispute {
  id: string;
  initiatedBy: 'buyer' | 'seller';
  reason: DisputeReason;
  description: string;
  evidence?: DisputeEvidence[];
  status: DisputeStatus;
  resolution?: DisputeResolution;
  createdAt: string;
  resolvedAt?: string;
}

export type DisputeReason =
  | 'not_delivered'
  | 'poor_quality'
  | 'not_as_described'
  | 'payment_issue'
  | 'communication_issue'
  | 'other';

export type DisputeStatus =
  | 'open'
  | 'under_review'
  | 'resolved'
  | 'escalated'
  | 'closed';

export interface DisputeEvidence {
  type: 'text' | 'image' | 'document' | 'video';
  content: string;
  description?: string;
  uploadedAt: string;
}

export interface DisputeResolution {
  decision:
    | 'buyer_favor'
    | 'seller_favor'
    | 'partial_refund'
    | 'order_continuation';
  refundAmount?: number;
  explanation: string;
  resolvedBy: string;
}

export interface OrderStats {
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  disputedOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  completionRate: number;
  disputeRate: number;
  averageDeliveryTime: number;
}

export interface OrderFilter {
  status?: OrderStatus[];
  paymentStatus?: PaymentStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  amountRange?: {
    min: number;
    max: number;
  };
  buyerId?: string;
  sellerId?: string;
  packageId?: string;
  jobId?: string;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  title: string;
  status: OrderStatus;
  amount: number;
  currency: Currency;
  buyerName: string;
  sellerName: string;
  deliveryDate: string;
  createdAt: string;
}
