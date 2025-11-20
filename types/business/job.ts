/**
 * ================================================
 * JOB BUSINESS TYPES
 * ================================================
 * Form types and business logic types for job management
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1: Job System Implementation
 */

import type {
  JobResponse,
  JobStatus,
  JobBudgetType,
  JobExperienceLevel,
} from '../backend-aligned';

// ================================================
// FORM TYPES
// ================================================

/**
 * Job creation form data
 */
export interface JobCreateFormData {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  budgetType: JobBudgetType;
  budgetMin?: number;
  budgetMax?: number;
  hourlyRate?: number;
  requiredSkills: string[];
  experienceLevel: JobExperienceLevel;
  duration?: string;
  location?: string;
  isRemote: boolean;
  deadline?: string;
}

/**
 * Job edit form data
 */
export interface JobEditFormData extends Partial<JobCreateFormData> {
  status?: JobStatus;
}

/**
 * Job filter form data
 */
export interface JobFilterFormData {
  categoryId?: string;
  subcategoryId?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetType?: JobBudgetType;
  experienceLevel?: JobExperienceLevel[];
  isRemote?: boolean;
  skills?: string[];
  location?: string;
  sortBy?:
    | 'latest'
    | 'oldest'
    | 'budget_high'
    | 'budget_low'
    | 'deadline'
    | 'proposals';
}

// ================================================
// PROPOSAL FORM TYPES
// ================================================

/**
 * Proposal creation form data
 */
export interface ProposalCreateFormData {
  jobId: string;
  coverLetter: string;
  bidAmount: number;
  deliveryTime: number;
  milestones?: ProposalMilestone[];
  attachments?: File[];
}

/**
 * Proposal edit form data
 */
export interface ProposalEditFormData {
  coverLetter?: string;
  bidAmount?: number;
  deliveryTime?: number;
  milestones?: ProposalMilestone[];
  attachments?: File[];
}

/**
 * Proposal milestone
 */
export interface ProposalMilestone {
  title: string;
  description: string;
  amount: number;
  dueDate?: string;
}

/**
 * Proposal reject form data
 */
export interface ProposalRejectFormData {
  reason: ProposalRejectReason;
  customReason?: string;
  message?: string;
}

/**
 * Proposal accept form data
 */
export interface ProposalAcceptFormData {
  message?: string;
}

// ================================================
// ENUMS & CONSTANTS
// ================================================

/**
 * Reject reason enum
 */
export enum ProposalRejectReason {
  BUDGET_TOO_HIGH = 'BUDGET_TOO_HIGH',
  TIMELINE_TOO_LONG = 'TIMELINE_TOO_LONG',
  EXPERIENCE_MISMATCH = 'EXPERIENCE_MISMATCH',
  BETTER_OFFER = 'BETTER_OFFER',
  REQUIREMENTS_NOT_MET = 'REQUIREMENTS_NOT_MET',
  OTHER = 'OTHER',
}

/**
 * Reject reason labels (Turkish)
 */
export const PROPOSAL_REJECT_REASON_LABELS: Record<
  ProposalRejectReason,
  string
> = {
  [ProposalRejectReason.BUDGET_TOO_HIGH]: 'Bütçe çok yüksek',
  [ProposalRejectReason.TIMELINE_TOO_LONG]: 'Süre çok uzun',
  [ProposalRejectReason.EXPERIENCE_MISMATCH]: 'Deneyim uygun değil',
  [ProposalRejectReason.BETTER_OFFER]: 'Daha iyi teklif aldım',
  [ProposalRejectReason.REQUIREMENTS_NOT_MET]: 'Gereksinimler karşılanmıyor',
  [ProposalRejectReason.OTHER]: 'Diğer',
};

/**
 * Sort options with icons
 * Sprint: Marketplace Advanced Filters - Task 1.4
 */
export const JOB_SORT_OPTIONS = [
  { value: 'latest', label: 'En Yeni', icon: 'ArrowDown' },
  { value: 'oldest', label: 'En Eski', icon: 'ArrowUp' },
  {
    value: 'budget_high',
    label: 'Bütçe (Yüksek → Düşük)',
    icon: 'TrendingDown',
  },
  { value: 'budget_low', label: 'Bütçe (Düşük → Yüksek)', icon: 'TrendingUp' },
  { value: 'deadline', label: 'Son Tarih', icon: 'Calendar' },
  { value: 'proposals', label: 'Teklif Sayısı', icon: 'Users' },
] as const;

/**
 * Popular skills for job filtering
 * Sprint: Marketplace Advanced Filters - Task 1.1
 */
export const POPULAR_SKILLS = [
  'JavaScript',
  'TypeScript',
  'React',
  'Next.js',
  'Node.js',
  'Python',
  'Java',
  'Spring Boot',
  'PHP',
  'Laravel',
  'Vue.js',
  'Angular',
  'SQL',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'AWS',
  'Docker',
  'Kubernetes',
  'Git',
  'REST API',
  'GraphQL',
  'Microservices',
  'UI/UX Design',
  'Figma',
  'Adobe XD',
  'Photoshop',
  'Illustrator',
  'HTML',
  'CSS',
  'Tailwind CSS',
  'Bootstrap',
  'SEO',
  'Google Analytics',
  'Digital Marketing',
  'Content Writing',
  'Copywriting',
  'Video Editing',
  'Motion Graphics',
  '3D Modeling',
  'Unity',
  'Unreal Engine',
  'Mobile Development',
  'iOS',
  'Android',
  'React Native',
  'Flutter',
  'Dart',
  'Swift',
  'Kotlin',
  'C++',
  'C#',
  '.NET',
  'DevOps',
  'CI/CD',
  'Linux',
  'Networking',
  'Cybersecurity',
  'Blockchain',
  'Solidity',
  'Data Science',
  'Machine Learning',
  'TensorFlow',
  'PyTorch',
  'Data Analysis',
  'Excel',
  'Power BI',
  'Tableau',
  'Business Analysis',
  'Project Management',
  'Agile/Scrum',
  'Product Management',
  'Sales',
  'Customer Support',
  'Translation',
  'English',
  'German',
  'French',
  'Spanish',
] as const;

/**
 * Experience level options
 */
export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: 'ENTRY', label: 'Başlangıç' },
  { value: 'INTERMEDIATE', label: 'Orta' },
  { value: 'EXPERT', label: 'Uzman' },
] as const;

/**
 * Budget type options
 */
export const BUDGET_TYPE_OPTIONS = [
  { value: 'FIXED', label: 'Sabit Fiyat' },
  { value: 'HOURLY', label: 'Saatlik' },
] as const;

// ================================================
// VIEW MODELS
// ================================================

/**
 * Job card view model (for lists)
 */
export interface JobCardViewModel {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryName: string;
  employerName: string;
  status: JobStatus;
  budgetDisplay: string;
  experienceLevel: JobExperienceLevel;
  experienceLevelLabel: string;
  location?: string;
  isRemote: boolean;
  requiredSkills: string[];
  proposalCount: number;
  postedAt: string;
  deadline?: string;
  deadlineDays?: number;
  isDeadlineApproaching: boolean;
  isDeadlinePassed: boolean;
}

/**
 * Job detail view model
 */
export interface JobDetailViewModel extends JobCardViewModel {
  employerId: string;
  fullDescription: string;
  duration?: string;
  viewCount: number;
  canEdit: boolean;
  canDelete: boolean;
  canClose: boolean;
  canReopen: boolean;
  acceptsProposals: boolean;
}

/**
 * My job view model
 */
export interface MyJobViewModel extends JobDetailViewModel {
  proposalsSummary: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
    shortlisted: number;
  };
}

// ================================================
// UTILITY TYPES
// ================================================

/**
 * Job list item (simplified for lists)
 */
export type JobListItem = Pick<
  JobResponse,
  | 'id'
  | 'title'
  | 'slug'
  | 'description'
  | 'status'
  | 'budgetType'
  | 'budgetMin'
  | 'budgetMax'
  | 'hourlyRate'
  | 'currency'
  | 'experienceLevel'
  | 'location'
  | 'isRemote'
  | 'requiredSkills'
  | 'proposalCount'
  | 'postedAt'
  | 'deadline'
> & {
  categoryName: string;
  employerName: string;
};

/**
 * Job search result
 */
export interface JobSearchResult {
  jobs: JobListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Job creation result
 */
export interface JobCreationResult {
  success: boolean;
  jobId?: string;
  slug?: string;
  error?: string;
}

/**
 * Job action result
 */
export interface JobActionResult {
  success: boolean;
  message: string;
  error?: string;
}
