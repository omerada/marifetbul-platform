import { User } from '../../core/base';

// Support Types
export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  user: Pick<User, 'id' | 'firstName' | 'lastName' | 'email' | 'avatar'>;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  subject: string;
  description: string;
  attachments?: SupportAttachment[];
  assignedTo?: string;
  assignee?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  messages: SupportMessage[];
  tags: string[];
  satisfaction?: TicketSatisfaction;
  resolutionTime?: number; // in hours
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
}

export type TicketCategory =
  | 'account'
  | 'billing'
  | 'payment'
  | 'technical'
  | 'dispute'
  | 'feature_request'
  | 'bug_report'
  | 'general'
  | 'abuse'
  | 'refund'
  | 'report_user';

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export type TicketStatus =
  | 'open'
  | 'pending'
  | 'in_progress'
  | 'waiting_for_customer'
  | 'resolved'
  | 'closed'
  | 'escalated';

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  sender: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'>;
  content: string;
  isInternal: boolean;
  attachments?: SupportAttachment[];
  createdAt: string;
}

export interface SupportAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TicketSatisfaction {
  rating: number; // 1-5
  feedback?: string;
  submittedAt: string;
}

export interface SupportStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  averageResolutionTime: number; // in hours
  satisfactionRating: number;
  ticketsByCategory: Record<TicketCategory, number>;
  ticketsByPriority: Record<TicketPriority, number>;
  ticketsByStatus: Record<TicketStatus, number>;
}
