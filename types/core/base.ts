// Core base types for the entire application
import type { Coordinates } from '../shared/location';

// Re-export Coordinates for convenience
export type { Coordinates };

export interface User {
  id: string;
  userId?: string; // Optional for ConversationParticipant compatibility
  email: string;
  username?: string; // User's unique username
  firstName?: string; // Made optional for admin compatibility
  lastName?: string; // Made optional for admin compatibility
  fullName?: string; // Full name (computed on backend)
  name?: string; // Computed field from firstName + lastName or custom name
  avatar?: string;
  avatarUrl?: string; // Backend uses avatarUrl
  profilePictureUrl?: string; // Alias for compatibility
  title?: string; // User's professional title
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
  createdAt?: string; // Made optional for MSW compatibility
  updatedAt?: string; // Made optional for MSW compatibility
  // Additional compatibility fields
  accountStatus?: 'active' | 'suspended' | 'banned';
  verificationStatus?: 'verified' | 'pending' | 'unverified';
  verificationBadges?: string[]; // For admin compatibility
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
  // Follow statistics (added for follow feature)
  followerCount?: number;
  followingCount?: number;
  isFollowedByCurrentUser?: boolean;
}

/**
 * Follow status response from backend
 */
export interface FollowStatusResponse {
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
  isMutualFollow: boolean;
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
  // MSW compatibility fields
  createdAt?: string;
  updatedAt?: string;
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
  viewCount?: number; // Analytics: view tracking
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

// Location types - Use shared location types
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
  filename?: string; // MSW compatibility - alternative field name
  mimetype?: string; // MSW compatibility - alternative field name
  thumbnailUrl?: string; // For image/video attachments
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
