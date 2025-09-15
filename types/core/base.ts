// Core base types for the entire application
export interface User {
  id: string;
  userId?: string; // Alias for id for compatibility
  email: string;
  firstName: string;
  lastName: string;
  name?: string; // Computed field from firstName + lastName or custom name
  avatar?: string;
  userType: 'freelancer' | 'employer' | 'admin';
  role?:
    | 'user'
    | 'admin'
    | 'moderator'
    | 'super_admin'
    | 'freelancer'
    | 'employer';
  phone?: string;
  location?: string;
  bio?: string;
  website?: string;
  socialLinks?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
  };
  permissions?: string[];
  lastLoginAt?: string;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
  // Additional compatibility fields
  accountStatus?: 'active' | 'suspended' | 'banned';
  verificationStatus?: 'verified' | 'pending' | 'unverified';
  // Messaging handler compatibility
  isTyping?: boolean;
  isOnline?: boolean;
  joinedAt?: string;
  lastReadAt?: string;
  // Additional user properties that may be accessed
  user?: {
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

export interface Freelancer extends User {
  userType: 'freelancer';
  title?: string;
  skills: string[];
  hourlyRate?: number;
  experience?: 'beginner' | 'intermediate' | 'expert';
  rating: number;
  totalReviews: number;
  totalEarnings: number;
  completedJobs: number;
  responseTime?: string;
  availability?: 'available' | 'busy' | 'not_available' | boolean; // compatibility with boolean
  portfolio?: PortfolioItem[];
  languages?: string[];
  // Additional compatibility fields
  reviewCount?: number; // Alias for totalReviews
  completedProjects?: number; // Alias for completedJobs
}

export interface Employer extends User {
  userType: 'employer';
  companyName?: string;
  companySize?:
    | string
    | 'startup'
    | 'small'
    | 'medium'
    | 'large'
    | 'enterprise';
  industry?: string;
  totalSpent: number;
  activeJobs: number;
  completedJobs: number;
  totalJobs?: number; // For API compatibility
  rating: number;
  totalReviews: number;
  // Additional compatibility fields
  reviewCount?: number; // Alias for totalReviews
  reviewsCount?: number; // Additional alias
  postedJobs?: number; // Alias for activeJobs + completedJobs
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  images: string[];
  url?: string;
  skills: string[];
  completedAt: string;
  // Additional compatibility fields
  imageUrl?: string; // Alias for first image
  image?: string; // Alias for first image
  projectUrl?: string; // Alias for url
  tags?: string[]; // Alias for skills
  category?: string;
  client?: string;
  createdAt?: string;
  techStack?: string[];
  isPrivate?: boolean;
  isArchived?: boolean;
}

// Location types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface LocationData {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  coordinates: Coordinates;
  type: 'city' | 'district' | 'neighborhood' | 'custom';
  parentLocation?: string;
  lat: number;
  lng: number;
}

// Common API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// File types
export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  type: string; // MIME type
  size: number; // File size in bytes
  uploadedAt: string;
}

// Notification base types
export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}
