/**
 * ================================================
 * COMMENT FLAGGING API
 * ================================================
 * API functions for flagging and reporting blog comments
 *
 * Sprint: Sprint 3 - Day 3 (Moderator Dashboard Enhancement)
 * Features: Content flagging, flag management, flag statistics
 * Backend: /api/v1/blog/comments/{id}/flag
 *
 * @version 1.0.0
 * @author MarifetBul Development Team
 * @created November 2, 2025
 */

import { apiClient } from '@/lib/infrastructure/api/client';
import type { PaginatedResponse } from '@/types';

// ================================================
// TYPES & INTERFACES
// ================================================

/**
 * Flag category enum
 * Defines different types of flags that can be raised
 */
export enum FlagCategory {
  SPAM = 'SPAM',
  OFFENSIVE = 'OFFENSIVE',
  INAPPROPRIATE = 'INAPPROPRIATE',
  MISINFORMATION = 'MISINFORMATION',
  HARASSMENT = 'HARASSMENT',
  OFF_TOPIC = 'OFF_TOPIC',
  COPYRIGHT = 'COPYRIGHT',
  OTHER = 'OTHER',
}

/**
 * Flag reason interface
 * Pre-defined reasons for each category
 */
export interface FlagReason {
  id: string;
  category: FlagCategory;
  label: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  autoAction?: 'review' | 'hide' | 'escalate';
}

/**
 * Comment flag interface
 * Represents a flag raised against a comment
 */
export interface CommentFlag {
  id: string;
  commentId: string;
  reporterId: string;
  reporterName: string;
  category: FlagCategory;
  reason: string;
  customReason?: string;
  status: FlagStatus;
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNote?: string;
  moderatorAction?: ModerationAction;
}

/**
 * Flag status enum
 */
export enum FlagStatus {
  PENDING = 'PENDING',
  INVESTIGATING = 'INVESTIGATING',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

/**
 * Moderation action taken on a flag
 */
export enum ModerationAction {
  APPROVED = 'APPROVED',
  REMOVED = 'REMOVED',
  EDITED = 'EDITED',
  WARNING_SENT = 'WARNING_SENT',
  USER_BANNED = 'USER_BANNED',
  NO_ACTION = 'NO_ACTION',
}

/**
 * Flag comment request
 */
export interface FlagCommentRequest {
  category: FlagCategory;
  reason: string;
  customReason?: string;
}

/**
 * Resolve flag request
 */
export interface ResolveFlagRequest {
  action: ModerationAction;
  resolutionNote?: string;
  banUser?: boolean;
  banDurationDays?: number;
}

/**
 * Flag statistics interface
 */
export interface FlagStatistics {
  totalFlags: number;
  pendingFlags: number;
  resolvedFlags: number;
  dismissedFlags: number;
  flagsByCategory: Record<FlagCategory, number>;
  flagsBySeverity: Record<'low' | 'medium' | 'high', number>;
  averageResolutionTimeMinutes: number;
  topFlaggedComments: Array<{
    commentId: string;
    content: string;
    flagCount: number;
    categories: FlagCategory[];
  }>;
  recentFlags: CommentFlag[];
}

/**
 * Flag filters for querying
 */
export interface FlagFilters {
  status?: FlagStatus;
  category?: FlagCategory;
  startDate?: string;
  endDate?: string;
  commentId?: string;
  reporterId?: string;
}

// ================================================
// PRE-DEFINED FLAG REASONS
// ================================================

export const FLAG_REASONS: FlagReason[] = [
  // SPAM
  {
    id: 'spam-commercial',
    category: FlagCategory.SPAM,
    label: 'Ticari Spam',
    description: 'Ürün veya hizmet reklamı içeriyor',
    severity: 'medium',
    autoAction: 'hide',
  },
  {
    id: 'spam-repetitive',
    category: FlagCategory.SPAM,
    label: 'Tekrarlayan İçerik',
    description: 'Aynı mesajı tekrar tekrar gönderiyor',
    severity: 'low',
    autoAction: 'review',
  },
  {
    id: 'spam-links',
    category: FlagCategory.SPAM,
    label: 'Şüpheli Bağlantılar',
    description: 'Güvenilmeyen veya alakasız bağlantılar içeriyor',
    severity: 'high',
    autoAction: 'escalate',
  },

  // OFFENSIVE
  {
    id: 'offensive-profanity',
    category: FlagCategory.OFFENSIVE,
    label: 'Küfür/Hakaret',
    description: 'Küfür veya hakaret içeren dil kullanıyor',
    severity: 'high',
    autoAction: 'hide',
  },
  {
    id: 'offensive-hate-speech',
    category: FlagCategory.OFFENSIVE,
    label: 'Nefret Söylemi',
    description: 'Ayrımcı veya nefret söylemi içeriyor',
    severity: 'high',
    autoAction: 'escalate',
  },
  {
    id: 'offensive-threats',
    category: FlagCategory.OFFENSIVE,
    label: 'Tehdit',
    description: 'Tehdit veya şiddet içeren ifadeler kullanıyor',
    severity: 'high',
    autoAction: 'escalate',
  },

  // INAPPROPRIATE
  {
    id: 'inappropriate-sexual',
    category: FlagCategory.INAPPROPRIATE,
    label: 'Cinsel İçerik',
    description: 'Uygunsuz cinsel içerik veya ifadeler içeriyor',
    severity: 'high',
    autoAction: 'hide',
  },
  {
    id: 'inappropriate-graphic',
    category: FlagCategory.INAPPROPRIATE,
    label: 'Rahatsız Edici İçerik',
    description: 'Şok edici veya rahatsız edici içerik',
    severity: 'medium',
    autoAction: 'review',
  },

  // MISINFORMATION
  {
    id: 'misinfo-false',
    category: FlagCategory.MISINFORMATION,
    label: 'Yanlış Bilgi',
    description: 'Kasıtlı olarak yanlış bilgi yayıyor',
    severity: 'medium',
    autoAction: 'review',
  },
  {
    id: 'misinfo-misleading',
    category: FlagCategory.MISINFORMATION,
    label: 'Yanıltıcı İçerik',
    description: 'Yanıltıcı veya aldatıcı bilgi içeriyor',
    severity: 'medium',
    autoAction: 'review',
  },

  // HARASSMENT
  {
    id: 'harassment-personal',
    category: FlagCategory.HARASSMENT,
    label: 'Kişisel Saldırı',
    description: 'Belirli bir kişiye yönelik saldırı',
    severity: 'high',
    autoAction: 'escalate',
  },
  {
    id: 'harassment-bullying',
    category: FlagCategory.HARASSMENT,
    label: 'Zorbalık',
    description: 'Sürekli taciz veya zorbalık davranışı',
    severity: 'high',
    autoAction: 'escalate',
  },
  {
    id: 'harassment-doxxing',
    category: FlagCategory.HARASSMENT,
    label: 'Kişisel Bilgi İfşası',
    description: 'Başkasının özel bilgilerini paylaşıyor',
    severity: 'high',
    autoAction: 'escalate',
  },

  // OFF_TOPIC
  {
    id: 'offtopic-unrelated',
    category: FlagCategory.OFF_TOPIC,
    label: 'Konu Dışı',
    description: 'Blog gönderisiyle ilgisiz içerik',
    severity: 'low',
    autoAction: 'review',
  },
  {
    id: 'offtopic-trolling',
    category: FlagCategory.OFF_TOPIC,
    label: 'Trollük',
    description: 'Kasıtlı olarak tartışmayı bozuyor',
    severity: 'medium',
    autoAction: 'hide',
  },

  // COPYRIGHT
  {
    id: 'copyright-plagiarism',
    category: FlagCategory.COPYRIGHT,
    label: 'İntihal',
    description: 'Başkasının içeriğini izinsiz kopyalıyor',
    severity: 'medium',
    autoAction: 'review',
  },
  {
    id: 'copyright-violation',
    category: FlagCategory.COPYRIGHT,
    label: 'Telif Hakkı İhlali',
    description: 'Telif hakkı korumalı içerik paylaşıyor',
    severity: 'high',
    autoAction: 'hide',
  },

  // OTHER
  {
    id: 'other-custom',
    category: FlagCategory.OTHER,
    label: 'Diğer',
    description: 'Yukarıdakilerden farklı bir sebep',
    severity: 'low',
    autoAction: 'review',
  },
];

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Get flag reasons by category
 */
export function getFlagReasonsByCategory(category: FlagCategory): FlagReason[] {
  return FLAG_REASONS.filter((reason) => reason.category === category);
}

/**
 * Get flag reason by ID
 */
export function getFlagReasonById(id: string): FlagReason | undefined {
  return FLAG_REASONS.find((reason) => reason.id === id);
}

/**
 * Get category label in Turkish
 */
export function getCategoryLabel(category: FlagCategory): string {
  const labels: Record<FlagCategory, string> = {
    [FlagCategory.SPAM]: 'Spam',
    [FlagCategory.OFFENSIVE]: 'Saldırgan İçerik',
    [FlagCategory.INAPPROPRIATE]: 'Uygunsuz İçerik',
    [FlagCategory.MISINFORMATION]: 'Yanlış Bilgi',
    [FlagCategory.HARASSMENT]: 'Taciz',
    [FlagCategory.OFF_TOPIC]: 'Konu Dışı',
    [FlagCategory.COPYRIGHT]: 'Telif Hakkı',
    [FlagCategory.OTHER]: 'Diğer',
  };
  return labels[category];
}

/**
 * Get flag status label in Turkish
 */
export function getFlagStatusLabel(status: FlagStatus): string {
  const labels: Record<FlagStatus, string> = {
    [FlagStatus.PENDING]: 'Beklemede',
    [FlagStatus.INVESTIGATING]: 'İnceleniyor',
    [FlagStatus.RESOLVED]: 'Çözüldü',
    [FlagStatus.DISMISSED]: 'Reddedildi',
  };
  return labels[status];
}

/**
 * Get moderation action label in Turkish
 */
export function getModerationActionLabel(action: ModerationAction): string {
  const labels: Record<ModerationAction, string> = {
    [ModerationAction.APPROVED]: 'Onaylandı',
    [ModerationAction.REMOVED]: 'Kaldırıldı',
    [ModerationAction.EDITED]: 'Düzenlendi',
    [ModerationAction.WARNING_SENT]: 'Uyarı Gönderildi',
    [ModerationAction.USER_BANNED]: 'Kullanıcı Engellendi',
    [ModerationAction.NO_ACTION]: 'İşlem Yapılmadı',
  };
  return labels[action];
}

// ================================================
// API FUNCTIONS
// ================================================

/**
 * Flag a comment
 * User reports a comment for review
 * Backend: POST /api/v1/blog/comments/{id}/flag
 */
export async function flagComment(
  commentId: string,
  request: FlagCommentRequest
): Promise<CommentFlag> {
  return apiClient.post<CommentFlag>(
    `/api/v1/blog/comments/${commentId}/flag`,
    request
  );
}

/**
 * Get flags for a comment
 * Admin/Moderator: View all flags on a comment
 * Backend: GET /api/v1/blog/comments/{id}/flags
 */
export async function getCommentFlags(
  commentId: string
): Promise<CommentFlag[]> {
  return apiClient.get<CommentFlag[]>(
    `/api/v1/blog/comments/${commentId}/flags`
  );
}

/**
 * Get all flagged comments
 * Admin/Moderator: Get list of flagged comments
 * Backend: GET /api/v1/blog/admin/flagged-comments
 */
export async function getFlaggedComments(
  filters?: FlagFilters,
  page = 0,
  size = 20
): Promise<PaginatedResponse<CommentFlag>> {
  return apiClient.get<PaginatedResponse<CommentFlag>>(
    '/api/v1/blog/admin/flagged-comments',
    {
      ...filters,
      page: page.toString(),
      size: size.toString(),
    }
  );
}

/**
 * Resolve a flag
 * Admin/Moderator: Resolve a flag with action
 * Backend: POST /api/v1/blog/admin/flags/{id}/resolve
 */
export async function resolveFlag(
  flagId: string,
  request: ResolveFlagRequest
): Promise<CommentFlag> {
  return apiClient.post<CommentFlag>(
    `/api/v1/blog/admin/flags/${flagId}/resolve`,
    request
  );
}

/**
 * Dismiss a flag
 * Admin/Moderator: Dismiss a flag as invalid
 * Backend: POST /api/v1/blog/admin/flags/{id}/dismiss
 */
export async function dismissFlag(
  flagId: string,
  reason?: string
): Promise<CommentFlag> {
  return apiClient.post<CommentFlag>(
    `/api/v1/blog/admin/flags/${flagId}/dismiss`,
    { reason }
  );
}

/**
 * Get flag statistics
 * Admin/Moderator: Get flagging statistics
 * Backend: GET /api/v1/blog/admin/flags/statistics
 */
export async function getFlagStatistics(): Promise<FlagStatistics> {
  return apiClient.get<FlagStatistics>('/api/v1/blog/admin/flags/statistics');
}

/**
 * Bulk resolve flags
 * Admin/Moderator: Resolve multiple flags at once
 * Backend: POST /api/v1/blog/admin/flags/bulk/resolve
 */
export async function bulkResolveFlags(
  flagIds: string[],
  request: ResolveFlagRequest
): Promise<{ successCount: number; failureCount: number }> {
  return apiClient.post<{ successCount: number; failureCount: number }>(
    '/api/v1/blog/admin/flags/bulk/resolve',
    {
      flagIds,
      ...request,
    }
  );
}

/**
 * Bulk dismiss flags
 * Admin/Moderator: Dismiss multiple flags at once
 * Backend: POST /api/v1/blog/admin/flags/bulk/dismiss
 */
export async function bulkDismissFlags(
  flagIds: string[],
  reason?: string
): Promise<{ successCount: number; failureCount: number }> {
  return apiClient.post<{ successCount: number; failureCount: number }>(
    '/api/v1/blog/admin/flags/bulk/dismiss',
    {
      flagIds,
      reason,
    }
  );
}

/**
 * Get my flags (for logged-in user)
 * User: Get their own flag history
 * Backend: GET /api/v1/blog/comments/my-flags
 */
export async function getMyFlags(
  page = 0,
  size = 20
): Promise<PaginatedResponse<CommentFlag>> {
  return apiClient.get<PaginatedResponse<CommentFlag>>(
    '/api/v1/blog/comments/my-flags',
    {
      page: page.toString(),
      size: size.toString(),
    }
  );
}
