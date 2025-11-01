// Blog veri modeli ve tipleri

// ================================================
// BULK COMMENT ACTIONS (Sprint 1 - EPIC 2)
// ================================================

export interface BulkCommentActionRequest {
  commentIds: number[];
  reason?: string; // For reject/spam actions
}

export interface BulkCommentActionResponse {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  successfulIds: number[];
  failures: FailedCommentAction[];
  action: 'APPROVE' | 'REJECT' | 'SPAM';
}

export interface FailedCommentAction {
  commentId: number;
  errorMessage: string;
  errorCode: string;
}

// ================================================
// COMMENT MODERATION (Sprint 2.2)
// ================================================

export interface CommentModerationFilters {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM' | 'FLAGGED';
  dateFrom?: string;
  dateTo?: string;
  userId?: string;
  postId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface CommentModerationResponse {
  comments: BlogComment[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ModerateCommentRequest {
  action: 'APPROVE' | 'REJECT' | 'SPAM';
  reason?: string;
}

export interface BanUserRequest {
  userId: string;
  reason: string;
  duration?: number; // days, undefined = permanent
}

// ================================================
// CORE BLOG TYPES
// ================================================

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface BlogAuthor {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  social?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

export interface BlogComment {
  id: string;
  postId: string;
  author: string | BlogAuthor;
  content: string;
  createdAt: string;
  parentId?: string;
  approved?: boolean;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SPAM';
  flagged?: boolean;
  flagReason?: string;
  moderatedBy?: string;
  moderatedAt?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: BlogCategory | string;
  author: BlogAuthor | string;
  tags?: string[];
  publishedAt: string;
  updatedAt?: string;
  views?: number;
  readTime?: number; // Dakika cinsinden okuma süresi
  featured?: boolean;
  comments?: BlogComment[];
  seoTitle?: string;
  seoDescription?: string;
}
