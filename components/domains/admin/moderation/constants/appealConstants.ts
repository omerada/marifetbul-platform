/**
 * Appeal System Constants
 *
 * Centralized constants for filters, options, and configurations.
 */

import type {
  AppealStatus,
  AppealPriority,
  AppealReason,
} from '../types/appeal';

export const APPEAL_STATUS_OPTIONS: Array<{
  value: AppealStatus | 'all';
  label: string;
}> = [
  { value: 'all', label: 'Tümü' },
  { value: 'pending', label: 'Bekleyen' },
  { value: 'under_review', label: 'İnceleniyor' },
  { value: 'approved', label: 'Onaylandı' },
  { value: 'rejected', label: 'Reddedildi' },
  { value: 'escalated', label: 'Yüksel tildi' },
];

export const APPEAL_PRIORITY_OPTIONS: Array<{
  value: AppealPriority | 'all';
  label: string;
}> = [
  { value: 'all', label: 'Tümü' },
  { value: 'urgent', label: 'Acil' },
  { value: 'high', label: 'Yüksek' },
  { value: 'medium', label: 'Orta' },
  { value: 'low', label: 'Düşük' },
];

export const APPEAL_REASON_OPTIONS: Array<{
  value: AppealReason | 'all';
  label: string;
}> = [
  { value: 'all', label: 'Tümü' },
  { value: 'incorrect_decision', label: 'Yanlış Karar' },
  { value: 'content_misunderstood', label: 'İçerik Yanlış Anlaşıldı' },
  { value: 'policy_misapplied', label: 'Politika Yanlış Uygulandı' },
  { value: 'technical_error', label: 'Teknik Hata' },
  { value: 'other', label: 'Diğer' },
];

export const DEFAULT_FILTERS = {
  status: 'all',
  priority: 'all',
  reason: 'all',
  search: '',
};

export const API_ENDPOINTS = {
  appeals: '/api/content-appeals',
  stats: '/api/content-appeals/stats',
  action: (id: string) => `/api/content-appeals/${id}/action`,
} as const;

export const REFRESH_INTERVAL = 30000; // 30 seconds
export const ITEMS_PER_PAGE = 20;
export const MAX_SEARCH_LENGTH = 100;
