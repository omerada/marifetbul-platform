// Job related types
import { Employer, PaginationMeta } from './base';

export interface JobAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
}

export interface Job {
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

// Proposal types
export interface Proposal {
  id: string;
  jobId: string;
  freelancerId: string;
  freelancer: Pick<
    import('./base').User,
    'id' | 'firstName' | 'lastName' | 'avatar' | 'userType'
  > & {
    userType: 'freelancer';
    skills: string[];
    hourlyRate?: number;
    rating: number;
    reviewCount?: number;
  };
  coverLetter: string;
  proposedBudget: number;
  proposedTimeline: string;
  attachments?: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
  updatedAt: string;
  milestones?: {
    title: string;
    description: string;
    amount: number;
    dueDate: string;
  }[];
  questions?: {
    question: string;
    answer: string;
  }[];
}

export interface JobsResponse {
  success: boolean;
  data?: {
    jobs: Job[];
    pagination: PaginationMeta;
  };
  error?: string;
}
