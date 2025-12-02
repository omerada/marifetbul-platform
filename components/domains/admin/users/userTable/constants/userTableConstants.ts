/**
 * UserTable Constants
 *
 * Configuration constants for filters, actions, colors, and table settings.
 */

import { UserCheck, UserX, Shield, Ban, Briefcase, Users } from 'lucide-react';
import { FilterOption, UserStatus, UserRole } from '../types/userTableTypes';

// ============================================================================
// Filter Options
// ============================================================================

export const STATUS_OPTIONS: FilterOption[] = [
  {
    value: 'all',
    label: 'Tüm Durumlar',
    color: 'bg-gray-100 text-gray-800',
  },
  {
    value: 'active',
    label: 'Aktif',
    color: 'bg-green-100 text-green-800',
  },
  {
    value: 'pending_verification',
    label: 'Doğrulama Bekliyor',
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    value: 'suspended',
    label: 'Askıya Alınmış',
    color: 'bg-orange-100 text-orange-800',
  },
  {
    value: 'banned',
    label: 'Yasaklanmış',
    color: 'bg-red-100 text-red-800',
  },
];

export const ROLE_OPTIONS: FilterOption[] = [
  {
    value: 'all',
    label: 'Tüm Roller',
    color: 'bg-gray-100 text-gray-800',
  },
  {
    value: 'employer',
    label: 'İşveren',
    color: 'bg-indigo-100 text-indigo-800',
  },
  {
    value: 'freelancer',
    label: 'Serbest Çalışan',
    color: 'bg-emerald-100 text-emerald-800',
  },
  {
    value: 'admin',
    label: 'Admin',
    color: 'bg-purple-100 text-purple-800',
  },
  {
    value: 'moderator',
    label: 'Moderatör',
    color: 'bg-blue-100 text-blue-800',
  },
];

// ============================================================================
// Color Mappings
// ============================================================================

export const STATUS_COLORS: Record<UserStatus, string> = {
  active: 'bg-green-100 text-green-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-yellow-100 text-yellow-800',
  banned: 'bg-red-100 text-red-800',
  pending_verification: 'bg-orange-100 text-orange-800',
};

export const STATUS_DOT_COLORS: Record<UserStatus, string> = {
  active: 'bg-green-400 animate-pulse',
  inactive: 'bg-gray-400',
  suspended: 'bg-orange-400',
  banned: 'bg-red-400',
  pending_verification: 'bg-yellow-400',
};

export const ROLE_COLORS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'bg-purple-100 text-purple-800',
  [UserRole.MODERATOR]: 'bg-blue-100 text-blue-800',
  [UserRole.EMPLOYER]: 'bg-indigo-100 text-indigo-800',
  [UserRole.FREELANCER]: 'bg-emerald-100 text-emerald-800',
};

// ============================================================================
// Table Configuration
// ============================================================================

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_BUTTONS = 5;
export const EXPORT_FORMATS = ['csv', 'xlsx'] as const;

// ============================================================================
// Icon Mappings
// ============================================================================

export const ROLE_ICONS = {
  employer: Briefcase,
  freelancer: UserCheck,
  admin: Shield,
  moderator: Shield,
};

export const STATUS_FILTER_ICONS = {
  all: Users,
  active: UserCheck,
  suspended: UserX,
  banned: Ban,
  pending_verification: Shield,
};
