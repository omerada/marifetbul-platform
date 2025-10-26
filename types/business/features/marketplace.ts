import { User, Employer, PortfolioItem } from '../../core/base';

// Job Types
export interface Job {
  id: string;
  title: string;
  description: string;
  budget: number | JobBudget; // API route compatibility - could be number or object
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  categoryId?: string; // API route compatibility - can be optional
  skillIds?: string[]; // API route compatibility - can be optional
  employerId: string;
  freelancerId?: string;
  createdAt: string;
  updatedAt: string;
  deadline?: string;
  // API compatibility properties
  skills?: string[]; // For backward compatibility with API routes
  category?: string; // For backward compatibility
  subcategory?: string; // For API route compatibility
  isRemote?: boolean; // For location filtering
  location?: string; // For location-based searches
  proposalsCount?: number; // For job analytics
  timeline?: string; // MSW handler compatibility - keeping as string for display
  duration?: string; // API route compatibility
  experienceLevel?: 'beginner' | 'intermediate' | 'expert'; // API route compatibility
  employer?: Employer; // API route compatibility
}

// Job budget can be either a simple number or detailed object
export interface JobBudget {
  type: 'fixed' | 'hourly';
  amount: number;
  maxAmount?: number;
}

export interface JobDetail extends Omit<Job, 'employer'> {
  employer: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'> & {
    companyName?: string;
    rating?: number;
    totalJobs?: number;
    location?: string;
    createdAt?: string;
  };
  proposals: Proposal[];
  attachments: FileAttachment[];
  requirements: string[];
  tags?: string[];
  urgency?: 'low' | 'medium' | 'high';
  expiresAt?: string;
}

export interface Proposal {
  id: string;
  jobId: string;
  freelancerId: string;
  coverLetter: string;
  proposedRate: number;
  deliveryTime: number;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  updatedAt?: string; // Added for core/jobs compatibility
  // Additional fields for compatibility
  freelancer?: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    rating?: number;
    reviewCount?: number;
    title?: string;
    skills?: string[];
  };
  proposedBudget?: number; // Alternative to proposedRate
  proposedTimeline?: string; // Delivery timeline
  attachments?: File[]; // Proposal attachments
}

export interface FileAttachment {
  id: string;
  filename: string;
  name: string; // For MSW compatibility
  url: string;
  size: number;
  type: string;
  mimetype?: string; // For MSW compatibility
  uploadedAt?: string; // For MSW compatibility
}

// Enhanced Service Package Type (consolidating both versions)
export interface ServicePackage {
  id: string;
  slug?: string; // SEO-friendly URL slug
  title: string;
  description: string;
  shortDescription?: string;
  price: number; // Simplified price
  deliveryTime: number;
  categoryId?: string;
  skillIds?: string[];
  freelancerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Extended marketplace properties
  category: string;
  subcategory?: string;
  pricing?: PackagePricing; // Optional detailed pricing
  delivery?: PackageDelivery;
  features: string[];
  requirements?: string[];
  tags?: string[]; // Made optional for MSW compatibility
  images: string[] | { id: string; name: string; url: string; type: string }[];
  video?: string;
  seller?: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar'> & {
    rating: number;
    completedJobs: number;
  };
  statistics?: PackageStatistics;
  reviews?: PackageReview[] | number; // Can be array or count
  addOns?: PackageAddOn[];
  variants?: PackageVariant[];
  status?: 'active' | 'paused' | 'draft' | 'rejected';
  // API compatibility properties
  views?: number; // View count
  orders?: number; // Order count
  revisions?: number; // Number of revisions allowed (made optional for MSW compatibility)
  freelancer?: {
    // For API route compatibility
    id: string;
    name?: string;
    avatar?: string;
    skills?: string[];
    firstName?: string;
    lastName?: string;
    email?: string;
    userType?: string;
    title?: string;
    hourlyRate?: number;
    experience?: string;
    rating?: number;
    reviewCount?: number;
    totalReviews?: number;
    completedJobs?: number;
    completedProjects?: number;
    responseTime?: string;
    portfolio?: PortfolioItem[];
    languages?: string[];
    isOnline?: boolean;
    createdAt?: string; // For API route compatibility
    updatedAt?: string; // For API route compatibility
  };
  rating?: number; // Package rating
}

export interface PackagePricing {
  basic: PackageTier;
  standard?: PackageTier;
  premium?: PackageTier;
}

export interface PackageTier {
  name?: string; // Made optional for MSW compatibility
  title: string; // For MSW compatibility
  price: number;
  description: string;
  deliveryTime: number; // in days
  revisions: number;
  features: string[];
}

export interface PackageDelivery {
  estimatedDays: number;
  expressAvailable: boolean;
  expressPrice?: number;
  digitalDelivery: boolean;
  formats?: string[];
}

export interface PackageStatistics {
  views: number;
  orders: number;
  rating: number;
  reviewCount: number;
  completionRate: number;
  responseTime: number;
  repeatCustomers: number;
}

export interface PackageReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  images?: string[];
  helpful: number;
  createdAt: string;
}

export interface PackageAddOn {
  id: string;
  name?: string; // Made optional for MSW compatibility
  title: string; // For MSW compatibility
  description: string;
  price: number;
  deliveryTime: number;
  isRequired?: boolean; // Made optional for MSW compatibility
}

export interface PackageVariant {
  id: string;
  name: string;
  options: VariantOption[];
  required: boolean;
}

export interface VariantOption {
  id: string;
  name: string;
  priceModifier: number;
  deliveryModifier: number;
}

export interface PackageFilters {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  deliveryTime?: number;
  rating?: number;
  location?: string;
  language?: string;
  sortBy?:
    | 'relevance'
    | 'price_low'
    | 'price_high'
    | 'rating'
    | 'newest'
    | 'popular';
  search?: string;
}

export interface PackageDetail extends ServicePackage {
  similarPackages: ServicePackage[];
  frequentlyBoughtWith: ServicePackage[];
  sellerOtherPackages: ServicePackage[];
  // Component compatibility fields
  overview?: string;
  whatIncluded?: string[];
  faq?: Array<{
    question: string;
    answer: string;
  }>;
}

// Job Filters
export interface JobFilters {
  category?: string;
  subcategory?: string;
  minBudget?: number;
  maxBudget?: number;
  location?: string;
  skills?: string[];
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  isRemote?: boolean;
  sortBy?: 'newest' | 'oldest' | 'budget_high' | 'budget_low' | 'relevance';
  search?: string;
}

// Help Center Types
export interface HelpCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  articleCount: number;
  isPopular: boolean;
  order: number;
  parentId?: string;
  children?: HelpCategory[];
}

export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  categoryId: string;
  category: HelpCategory;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  views: number;
  helpful: number;
  notHelpful: number;
  lastUpdated: string;
  createdAt: string;
  author: Pick<User, 'id' | 'firstName' | 'lastName'>;
  relatedArticles?: HelpArticle[];
}

export interface ArticleRatingFormData {
  articleId: string;
  isHelpful: boolean;
  feedback?: string;
  category?: 'content' | 'clarity' | 'completeness' | 'accuracy';
}

// Review System
export interface Review {
  id: string;
  rating: number;
  comment: string;
  reviewerId: string;
  revieweeId: string;
  jobId?: string;
  packageId?: string;
  createdAt: string;
}

// Freelancer Profile
export interface FreelancerProfile {
  userId: string;
  bio: string;
  skills: string[];
  hourlyRate: number;
  portfolio: PortfolioItem[];
  certifications: string[];
  languages: string[];
  availability: boolean;
}
