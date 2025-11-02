/**
 * ================================================
 * AUTO-MODERATION API
 * ================================================
 * API functions for auto-moderation rules and configuration
 *
 * Sprint: Sprint 3 - Day 3 (Moderator Dashboard Enhancement)
 * Features: Keyword blacklist, pattern detection, auto-actions
 * Backend: /api/v1/blog/admin/auto-moderation
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
 * Auto-moderation rule type
 */
export enum RuleType {
  KEYWORD = 'KEYWORD',
  PATTERN = 'PATTERN',
  LINK = 'LINK',
  SPAM_SCORE = 'SPAM_SCORE',
  LENGTH = 'LENGTH',
  REPETITION = 'REPETITION',
}

/**
 * Auto-moderation action
 */
export enum AutoModerationAction {
  FLAG = 'FLAG',
  HOLD_FOR_REVIEW = 'HOLD_FOR_REVIEW',
  AUTO_REJECT = 'AUTO_REJECT',
  AUTO_SPAM = 'AUTO_SPAM',
  ESCALATE = 'ESCALATE',
}

/**
 * Rule severity level
 */
export enum RuleSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

/**
 * Auto-moderation rule interface
 */
export interface AutoModerationRule {
  id: string;
  name: string;
  description: string;
  type: RuleType;
  severity: RuleSeverity;
  enabled: boolean;
  action: AutoModerationAction;

  // Rule conditions
  keywords?: string[];
  patterns?: string[];
  minLength?: number;
  maxLength?: number;
  spamScoreThreshold?: number;
  repetitionThreshold?: number;

  // Metadata
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastTriggered?: string;
  triggerCount: number;

  // Options
  caseSensitive?: boolean;
  wholeWordOnly?: boolean;
  notifyModerator?: boolean;
}

/**
 * Create/Update rule request
 */
export interface AutoModerationRuleRequest {
  name: string;
  description: string;
  type: RuleType;
  severity: RuleSeverity;
  enabled: boolean;
  action: AutoModerationAction;

  keywords?: string[];
  patterns?: string[];
  minLength?: number;
  maxLength?: number;
  spamScoreThreshold?: number;
  repetitionThreshold?: number;

  caseSensitive?: boolean;
  wholeWordOnly?: boolean;
  notifyModerator?: boolean;
}

/**
 * Rule trigger log entry
 */
export interface RuleTriggerLog {
  id: string;
  ruleId: string;
  ruleName: string;
  commentId: string;
  commentContent: string;
  authorId: string;
  authorName: string;
  actionTaken: AutoModerationAction;
  matchedTerm?: string;
  triggeredAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  overridden: boolean;
}

/**
 * Auto-moderation statistics
 */
export interface AutoModerationStats {
  totalRules: number;
  enabledRules: number;
  disabledRules: number;
  totalTriggersToday: number;
  totalTriggersWeek: number;
  totalTriggersMonth: number;

  actionBreakdown: Record<AutoModerationAction, number>;
  severityBreakdown: Record<RuleSeverity, number>;
  topTriggeredRules: Array<{
    ruleId: string;
    ruleName: string;
    triggerCount: number;
  }>;

  accuracyRate: number;
  falsePositiveRate: number;
}

/**
 * Rule filters
 */
export interface RuleFilters {
  type?: RuleType;
  severity?: RuleSeverity;
  enabled?: boolean;
  search?: string;
}

// ================================================
// HELPER FUNCTIONS
// ================================================

/**
 * Get rule type label in Turkish
 */
export function getRuleTypeLabel(type: RuleType): string {
  const labels: Record<RuleType, string> = {
    [RuleType.KEYWORD]: 'Anahtar Kelime',
    [RuleType.PATTERN]: 'Desen Eşleşmesi',
    [RuleType.LINK]: 'Bağlantı Kontrolü',
    [RuleType.SPAM_SCORE]: 'Spam Skoru',
    [RuleType.LENGTH]: 'Uzunluk Kontrolü',
    [RuleType.REPETITION]: 'Tekrar Kontrolü',
  };
  return labels[type];
}

/**
 * Get action label in Turkish
 */
export function getActionLabel(action: AutoModerationAction): string {
  const labels: Record<AutoModerationAction, string> = {
    [AutoModerationAction.FLAG]: 'Bayrak Ekle',
    [AutoModerationAction.HOLD_FOR_REVIEW]: 'İnceleme İçin Beklet',
    [AutoModerationAction.AUTO_REJECT]: 'Otomatik Reddet',
    [AutoModerationAction.AUTO_SPAM]: 'Spam Olarak İşaretle',
    [AutoModerationAction.ESCALATE]: 'Yöneticilere İlet',
  };
  return labels[action];
}

/**
 * Get severity label in Turkish
 */
export function getSeverityLabel(severity: RuleSeverity): string {
  const labels: Record<RuleSeverity, string> = {
    [RuleSeverity.LOW]: 'Düşük',
    [RuleSeverity.MEDIUM]: 'Orta',
    [RuleSeverity.HIGH]: 'Yüksek',
    [RuleSeverity.CRITICAL]: 'Kritik',
  };
  return labels[severity];
}

/**
 * Get severity color class
 */
export function getSeverityColor(severity: RuleSeverity): string {
  const colors: Record<RuleSeverity, string> = {
    [RuleSeverity.LOW]: 'text-gray-600 bg-gray-100',
    [RuleSeverity.MEDIUM]: 'text-yellow-600 bg-yellow-100',
    [RuleSeverity.HIGH]: 'text-orange-600 bg-orange-100',
    [RuleSeverity.CRITICAL]: 'text-red-600 bg-red-100',
  };
  return colors[severity];
}

/**
 * Get action color class
 */
export function getActionColor(action: AutoModerationAction): string {
  const colors: Record<AutoModerationAction, string> = {
    [AutoModerationAction.FLAG]: 'text-blue-600 bg-blue-100',
    [AutoModerationAction.HOLD_FOR_REVIEW]: 'text-yellow-600 bg-yellow-100',
    [AutoModerationAction.AUTO_REJECT]: 'text-red-600 bg-red-100',
    [AutoModerationAction.AUTO_SPAM]: 'text-orange-600 bg-orange-100',
    [AutoModerationAction.ESCALATE]: 'text-purple-600 bg-purple-100',
  };
  return colors[action];
}

// ================================================
// API FUNCTIONS
// ================================================

/**
 * Get all auto-moderation rules
 * Admin/Moderator: List all rules with filters
 * Backend: GET /api/v1/blog/admin/auto-moderation/rules
 */
export async function getAutoModerationRules(
  filters?: RuleFilters,
  page = 0,
  size = 50
): Promise<PaginatedResponse<AutoModerationRule>> {
  const params: Record<string, string> = {
    page: page.toString(),
    size: size.toString(),
  };

  if (filters) {
    if (filters.type) params.type = filters.type;
    if (filters.severity) params.severity = filters.severity;
    if (filters.enabled !== undefined)
      params.enabled = filters.enabled.toString();
    if (filters.search) params.search = filters.search;
  }

  return apiClient.get<PaginatedResponse<AutoModerationRule>>(
    '/api/v1/blog/admin/auto-moderation/rules',
    params
  );
}

/**
 * Get rule by ID
 * Admin/Moderator: Get specific rule details
 * Backend: GET /api/v1/blog/admin/auto-moderation/rules/{id}
 */
export async function getAutoModerationRule(
  ruleId: string
): Promise<AutoModerationRule> {
  return apiClient.get<AutoModerationRule>(
    `/api/v1/blog/admin/auto-moderation/rules/${ruleId}`
  );
}

/**
 * Create auto-moderation rule
 * Admin: Create new rule
 * Backend: POST /api/v1/blog/admin/auto-moderation/rules
 */
export async function createAutoModerationRule(
  request: AutoModerationRuleRequest
): Promise<AutoModerationRule> {
  return apiClient.post<AutoModerationRule>(
    '/api/v1/blog/admin/auto-moderation/rules',
    request
  );
}

/**
 * Update auto-moderation rule
 * Admin: Update existing rule
 * Backend: PUT /api/v1/blog/admin/auto-moderation/rules/{id}
 */
export async function updateAutoModerationRule(
  ruleId: string,
  request: AutoModerationRuleRequest
): Promise<AutoModerationRule> {
  return apiClient.put<AutoModerationRule>(
    `/api/v1/blog/admin/auto-moderation/rules/${ruleId}`,
    request
  );
}

/**
 * Delete auto-moderation rule
 * Admin: Delete rule
 * Backend: DELETE /api/v1/blog/admin/auto-moderation/rules/{id}
 */
export async function deleteAutoModerationRule(ruleId: string): Promise<void> {
  return apiClient.delete<void>(
    `/api/v1/blog/admin/auto-moderation/rules/${ruleId}`
  );
}

/**
 * Toggle rule enabled status
 * Admin/Moderator: Enable or disable rule
 * Backend: PATCH /api/v1/blog/admin/auto-moderation/rules/{id}/toggle
 */
export async function toggleAutoModerationRule(
  ruleId: string,
  enabled: boolean
): Promise<AutoModerationRule> {
  return apiClient.patch<AutoModerationRule>(
    `/api/v1/blog/admin/auto-moderation/rules/${ruleId}/toggle`,
    { enabled }
  );
}

/**
 * Get rule trigger logs
 * Admin/Moderator: View rule trigger history
 * Backend: GET /api/v1/blog/admin/auto-moderation/rules/{id}/triggers
 */
export async function getRuleTriggerLogs(
  ruleId: string,
  page = 0,
  size = 20
): Promise<PaginatedResponse<RuleTriggerLog>> {
  return apiClient.get<PaginatedResponse<RuleTriggerLog>>(
    `/api/v1/blog/admin/auto-moderation/rules/${ruleId}/triggers`,
    {
      page: page.toString(),
      size: size.toString(),
    }
  );
}

/**
 * Get all trigger logs
 * Admin/Moderator: View all trigger history
 * Backend: GET /api/v1/blog/admin/auto-moderation/triggers
 */
export async function getAllTriggerLogs(
  page = 0,
  size = 20
): Promise<PaginatedResponse<RuleTriggerLog>> {
  return apiClient.get<PaginatedResponse<RuleTriggerLog>>(
    '/api/v1/blog/admin/auto-moderation/triggers',
    {
      page: page.toString(),
      size: size.toString(),
    }
  );
}

/**
 * Get auto-moderation statistics
 * Admin/Moderator: View statistics
 * Backend: GET /api/v1/blog/admin/auto-moderation/statistics
 */
export async function getAutoModerationStats(): Promise<AutoModerationStats> {
  return apiClient.get<AutoModerationStats>(
    '/api/v1/blog/admin/auto-moderation/statistics'
  );
}

/**
 * Test rule against text
 * Admin: Test rule before saving
 * Backend: POST /api/v1/blog/admin/auto-moderation/test
 */
export async function testAutoModerationRule(
  rule: AutoModerationRuleRequest,
  testText: string
): Promise<{
  matched: boolean;
  matchedTerms: string[];
  confidence: number;
  suggestedAction: AutoModerationAction;
}> {
  return apiClient.post<{
    matched: boolean;
    matchedTerms: string[];
    confidence: number;
    suggestedAction: AutoModerationAction;
  }>('/api/v1/blog/admin/auto-moderation/test', {
    rule,
    testText,
  });
}

/**
 * Bulk enable/disable rules
 * Admin: Enable or disable multiple rules
 * Backend: POST /api/v1/blog/admin/auto-moderation/bulk/toggle
 */
export async function bulkToggleRules(
  ruleIds: string[],
  enabled: boolean
): Promise<{ successCount: number; failureCount: number }> {
  return apiClient.post<{ successCount: number; failureCount: number }>(
    '/api/v1/blog/admin/auto-moderation/bulk/toggle',
    {
      ruleIds,
      enabled,
    }
  );
}

/**
 * Bulk delete rules
 * Admin: Delete multiple rules
 * Backend: POST /api/v1/blog/admin/auto-moderation/bulk/delete
 */
export async function bulkDeleteRules(
  ruleIds: string[]
): Promise<{ successCount: number; failureCount: number }> {
  return apiClient.post<{ successCount: number; failureCount: number }>(
    '/api/v1/blog/admin/auto-moderation/bulk/delete',
    {
      ruleIds,
    }
  );
}

/**
 * Export rules configuration
 * Admin: Export rules as JSON
 * Backend: GET /api/v1/blog/admin/auto-moderation/export
 */
export async function exportRules(): Promise<Blob> {
  return apiClient.get<Blob>('/api/v1/blog/admin/auto-moderation/export', {
    responseType: 'blob',
  });
}

/**
 * Import rules configuration
 * Admin: Import rules from JSON
 * Backend: POST /api/v1/blog/admin/auto-moderation/import
 */
export async function importRules(
  file: File
): Promise<{ successCount: number; failureCount: number; errors: string[] }> {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post<{
    successCount: number;
    failureCount: number;
    errors: string[];
  }>('/api/v1/blog/admin/auto-moderation/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}
