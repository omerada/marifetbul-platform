// Base types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  userType: 'freelancer' | 'employer';
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Freelancer extends User {
  userType: 'freelancer';
  title?: string;
  skills: string[];
  hourlyRate?: number;
  experience: 'beginner' | 'intermediate' | 'expert';
  rating: number;
  totalReviews: number;
  totalEarnings: number;
  completedJobs: number;
  responseTime: string; // e.g., "2 hours"
  availability: 'available' | 'busy' | 'not_available';
  portfolio: PortfolioItem[];
}

export interface Employer extends User {
  userType: 'employer';
  companyName?: string;
  companySize?: string;
  industry?: string;
  totalSpent: number;
  activeJobs: number;
  completedJobs: number;
  rating: number;
  totalReviews: number;
  reviewsCount: number;
  totalJobs: number;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  url?: string;
  skills: string[];
  completedAt: string;
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
    maxAmount?: number; // For hourly jobs
  };
  timeline: string;
  duration?: string; // Project duration estimate
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

export interface ServicePackage {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  deliveryTime: number; // in days
  revisions: number;
  features: string[];
  images: string[];
  freelancerId: string;
  freelancer: Freelancer;
  orders: number;
  rating: number;
  reviews: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  jobId: string;
  freelancerId: string;
  freelancer: Freelancer;
  coverLetter: string;
  proposedBudget: number;
  proposedTimeline: string;
  attachments?: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewer: User;
  reviewee: User;
  jobId?: string;
  packageId?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type:
    | 'proposal_received'
    | 'proposal_accepted'
    | 'job_completed'
    | 'review_received'
    | 'message_received';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  content: string;
  attachments?: FileAttachment[];
  isRead: boolean;
  createdAt: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: string; // MIME type
  size: number; // File size in bytes
  uploadedAt: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  jobId?: string;
  packageId?: string;
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'freelancer' | 'employer';
  agreeToTerms: boolean;
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

export interface PackageFormData {
  title: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  deliveryTime: number;
  revisions: number;
  features: string[];
  images: string[];
}

// Filter types
export interface JobFilters {
  category?: string;
  subcategory?: string;
  budgetMin?: number;
  budgetMax?: number;
  budgetType?: 'fixed' | 'hourly';
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  location?: string;
  isRemote?: boolean;
  skills?: string[];
  search?: string;
}

export interface PackageFilters {
  category?: string;
  subcategory?: string;
  priceMin?: number;
  priceMax?: number;
  deliveryTime?: number;
  rating?: number;
  search?: string;
}

// Categories
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
}

// Dashboard stats
export interface FreelancerStats {
  totalEarnings: number;
  activeProposals: number;
  completedJobs: number;
  profileViews: number;
  rating: number;
  responseRate: number;
}

export interface EmployerStats {
  totalSpent: number;
  activeJobs: number;
  completedJobs: number;
  totalProposals: number;
  averageRating: number;
  savedFreelancers: number;
}
