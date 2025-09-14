// ================================================
// CORE ENTITY TYPES
// ================================================
// Base entity definitions for the application

// ================================================
// USER TYPES
// ================================================

export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
  isVerified: boolean;
  isActive: boolean;
  role: 'freelancer' | 'client' | 'admin';
  skills: string[];
  portfolio?: Portfolio[];
  rating: number;
  totalJobs: number;
  totalEarnings: number;
  languages: string[];
  timezone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Portfolio {
  id: string;
  title: string;
  description: string;
  images: string[];
  url?: string;
  technologies: string[];
}

// ================================================
// JOB TYPES
// ================================================

export interface Job {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  duration: string;
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  skills: string[];
  clientId: string;
  client: User;
  status: 'draft' | 'active' | 'in_progress' | 'completed' | 'cancelled';
  applications: JobApplication[];
  tags: string[];
  isUrgent: boolean;
  attachments: string[];
  location?: string;
  isRemote: boolean;
  views: number;
  applicationsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobId: string;
  freelancerId: string;
  freelancer: User;
  coverLetter: string;
  proposedBudget: number;
  estimatedDuration: string;
  portfolio: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
  createdAt: string;
}

// ================================================
// PACKAGE TYPES
// ================================================

export interface Package {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  sellerId: string;
  seller: User;
  pricing: PackagePricing[];
  features: string[];
  gallery: string[];
  tags: string[];
  rating: number;
  reviewsCount: number;
  ordersCount: number;
  deliveryTime: number; // in days
  revisions: number;
  isActive: boolean;
  isFeatured: boolean;
  requirements: string[];
  faq: PackageFAQ[];
  createdAt: string;
  updatedAt: string;
}

export interface PackagePricing {
  id: string;
  type: 'basic' | 'standard' | 'premium';
  price: number;
  currency: string;
  features: string[];
  deliveryTime: number;
  revisions: number;
}

export interface PackageFAQ {
  id: string;
  question: string;
  answer: string;
}

export interface PackageOrder {
  id: string;
  packageId: string;
  package: Package;
  buyerId: string;
  buyer: User;
  pricingType: 'basic' | 'standard' | 'premium';
  amount: number;
  currency: string;
  status:
    | 'pending'
    | 'in_progress'
    | 'delivered'
    | 'completed'
    | 'cancelled'
    | 'refunded';
  requirements: Record<string, string>;
  deliverables: string[];
  messages: OrderMessage[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface OrderMessage {
  id: string;
  orderId: string;
  senderId: string;
  sender: User;
  content: string;
  attachments: string[];
  createdAt: string;
}

// ================================================
// SEARCH & FILTER TYPES
// ================================================

export interface SearchFilters {
  query?: string;
  category?: string;
  subcategory?: string;
  minBudget?: number;
  maxBudget?: number;
  experienceLevel?: string[];
  skills?: string[];
  location?: string;
  isRemote?: boolean;
  sortBy?: 'relevance' | 'newest' | 'budget_low' | 'budget_high' | 'rating';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationParams {
  page: number;
  limit: number;
}

// ================================================
// MESSAGE TYPES
// ================================================

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  sender: User;
  receiverId: string;
  receiver: User;
  content: string;
  attachments: string[];
  isRead: boolean;
  createdAt: string;
  editedAt?: string;
}

export interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ================================================
// NOTIFICATION TYPES
// ================================================

export interface Notification {
  id: string;
  userId: string;
  title: string;
  content: string;
  type:
    | 'info'
    | 'success'
    | 'warning'
    | 'error'
    | 'job'
    | 'package'
    | 'message'
    | 'payment';
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ================================================
// REVIEW TYPES
// ================================================

export interface Review {
  id: string;
  reviewerId: string;
  reviewer: User;
  revieweeId: string;
  reviewee: User;
  entityType: 'job' | 'package';
  entityId: string;
  rating: number;
  comment: string;
  response?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// ================================================
// PAYMENT TYPES
// ================================================

export interface Payment {
  id: string;
  userId: string;
  user: User;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'fee';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  method: 'credit_card' | 'paypal' | 'bank_transfer' | 'crypto';
  entityType?: 'job' | 'package';
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  processedAt?: string;
}

// ================================================
// CATEGORY TYPES
// ================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  parentId?: string;
  children?: Category[];
  isActive: boolean;
  sortOrder: number;
}

// ================================================
// LOCATION TYPES
// ================================================

export interface Location {
  country: string;
  countryCode: string;
  city?: string;
  state?: string;
  timezone: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// ================================================
// FILE TYPES
// ================================================

export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedBy: string;
  createdAt: string;
}

// ================================================
// ANALYTICS TYPES
// ================================================

export interface AnalyticsData {
  views: number;
  clicks: number;
  conversions: number;
  revenue: number;
  period: string;
  breakdown?: Record<string, number>;
}

export interface UserAnalytics {
  userId: string;
  profileViews: number;
  jobApplications: number;
  packageViews: number;
  packageOrders: number;
  earnings: number;
  rating: number;
  period: string;
}

// ================================================
// ADMIN TYPES
// ================================================

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalJobs: number;
  activeJobs: number;
  totalPackages: number;
  activePackages: number;
  totalOrders: number;
  revenue: number;
  growthRate: number;
  period: string;
}

export interface AdminAction {
  id: string;
  adminId: string;
  admin: User;
  action: string;
  entityType: string;
  entityId: string;
  reason: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// ================================================
// API RESPONSE TYPES
// ================================================

export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  errors?: ApiError[];
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
  version: string;
  pagination?: PaginationMeta;
  cache?: CacheMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CacheMeta {
  cached: boolean;
  cacheKey: string;
  expiresAt: string;
}
