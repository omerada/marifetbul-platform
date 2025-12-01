// Job related types
import { Employer, PaginationMeta } from './base';
import type {
  ProposalResponse,
  JobResponse,
  ProposalStatus as BackendProposalStatus,
} from '../backend-aligned';

// Re-export Proposal as Proposal for backward compatibility
export type Proposal = ProposalResponse;

// Re-export JobResponse as Job for backward compatibility
export type Job = JobResponse;

// Re-export ProposalStatus for backward compatibility
export type ProposalStatus = BackendProposalStatus;

export interface JobAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

/**
 * @deprecated Use Job (JobResponse) instead
 * Legacy Job interface - kept for backward compatibility
 */
export interface LegacyJob {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  budget: {
    type: 'fixed' | 'hourly';
    amount: number;
    maxAmount?: number;
  };
  timeline: string;
  duration?: string;
  skills: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  location?: string;
  isRemote: boolean;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  employerId: string;
  employer: Employer;
  proposalsCount: number;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  attachments?: string[];
}

export interface JobDetail extends Omit<Job, 'attachments'> {
  requirements: string[];
  attachments: JobAttachment[];
  tags: string[];
  urgency: 'low' | 'medium' | 'high';
  expiresAt: string;
}

export interface JobFilters {
  category?: string;
  subcategory?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetType?: 'fixed' | 'hourly';
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  location?: string[];
  isRemote?: boolean;
  skills?: string[];
  search?: string;
  deadline?: 'urgent' | 'week' | 'month' | 'flexible';
  sort?: 'newest' | 'budget' | 'proposals' | 'rating';
}

export interface JobFormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  budget: {
    type: 'fixed' | 'hourly';
    amount: number;
    maxAmount?: number;
  };
  timeline: string;
  skills: string[];
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  location?: string;
  isRemote: boolean;
  deadline?: string;
}

export interface JobsResponse {
  success: boolean;
  data?: {
    jobs: Job[];
    pagination: PaginationMeta;
  };
  error?: string;
}
