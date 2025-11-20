/**
 * ================================================
 * USER PROFILE CARD COMPONENT
 * ================================================
 * Displays user profile information with avatar, status, and verification badges
 * Part of Story 4: User Management Completion
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 1 Story 4.1
 */

'use client';

import { Card, Badge, Avatar } from '@/components/ui';
import {
  Mail,
  Calendar,
  Clock,
  Shield,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { AdminUserResponse } from '@/lib/api/admin-users';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface UserProfileCardProps {
  user: AdminUserResponse;
  className?: string;
}

/**
 * Status Badge Component
 */
const StatusBadge = ({ status }: { status: AdminUserResponse['status'] }) => {
  const statusConfig = {
    ACTIVE: { label: 'Aktif', variant: 'success' as const },
    SUSPENDED: { label: 'Askıya Alındı', variant: 'warning' as const },
    BANNED: { label: 'Yasaklandı', variant: 'destructive' as const },
    PENDING_VERIFICATION: {
      label: 'Doğrulama Bekliyor',
      variant: 'secondary' as const,
    },
  };

  const config = statusConfig[status] || statusConfig.ACTIVE;

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

/**
 * Role Badge Component
 */
const RoleBadge = ({ role }: { role: string }) => {
  const roleConfig: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'outline' }
  > = {
    ADMIN: { label: 'Admin', variant: 'default' },
    MODERATOR: { label: 'Moderatör', variant: 'secondary' },
    FREELANCER: { label: 'Freelancer', variant: 'outline' },
    CLIENT: { label: 'Müşteri', variant: 'outline' },
  };

  const config = roleConfig[role] || {
    label: role,
    variant: 'outline' as const,
  };

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Shield className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

/**
 * Verification Badge Component
 */
const VerificationBadge = ({
  verified,
  label,
}: {
  verified: boolean;
  label: string;
}) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      {verified ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-muted-foreground">{label} Doğrulandı</span>
        </>
      ) : (
        <>
          <XCircle className="h-4 w-4 text-gray-400" />
          <span className="text-muted-foreground">{label} Doğrulanmadı</span>
        </>
      )}
    </div>
  );
};

/**
 * User Profile Card Component
 */
export function UserProfileCard({
  user,
  className = '',
}: UserProfileCardProps) {
  // Generate avatar initials
  const getInitials = () => {
    const first = user.firstName?.charAt(0) || '';
    const last = user.lastName?.charAt(0) || '';
    return first + last || user.username.charAt(0).toUpperCase();
  };

  // Full name
  const fullName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username;

  return (
    <Card className={`p-6 ${className}`}>
      {/* Header Section */}
      <div className="mb-6 flex items-start gap-4">
        {/* Avatar */}
        <Avatar className="h-20 w-20 text-lg font-semibold">
          {getInitials()}
        </Avatar>

        {/* User Info */}
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <h2 className="truncate text-2xl font-bold">{fullName}</h2>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>
            <StatusBadge status={user.status} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <RoleBadge role={user.role} />
            {user.profileComplete && (
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Profil Tamamlandı
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Contact & Verification Section */}
      <div className="mb-6 space-y-3 border-b pb-6">
        {/* Email */}
        <div className="flex items-center gap-3">
          <Mail className="text-muted-foreground h-4 w-4 flex-shrink-0" />
          <span className="flex-1 truncate text-sm">{user.email}</span>
          {user.emailVerified && (
            <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
          )}
        </div>

        {/* Verification Badges */}
        <div className="space-y-2 pl-7">
          <VerificationBadge verified={user.emailVerified} label="E-posta" />
          <VerificationBadge verified={user.phoneVerified} label="Telefon" />
        </div>
      </div>

      {/* Timestamps Section */}
      <div className="space-y-3 text-sm">
        {/* Created At */}
        <div className="text-muted-foreground flex items-center gap-3">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>
            Kayıt:{' '}
            <span className="text-foreground font-medium">
              {formatDistanceToNow(new Date(user.createdAt), {
                addSuffix: true,
                locale: tr,
              })}
            </span>
          </span>
        </div>

        {/* Last Login */}
        {user.lastLoginAt && (
          <div className="text-muted-foreground flex items-center gap-3">
            <Clock className="h-4 w-4 flex-shrink-0" />
            <span>
              Son giriş:{' '}
              <span className="text-foreground font-medium">
                {formatDistanceToNow(new Date(user.lastLoginAt), {
                  addSuffix: true,
                  locale: tr,
                })}
              </span>
            </span>
          </div>
        )}

        {/* Updated At */}
        <div className="text-muted-foreground flex items-center gap-3">
          <Clock className="h-4 w-4 flex-shrink-0" />
          <span>
            Güncelleme:{' '}
            <span className="text-foreground font-medium">
              {formatDistanceToNow(new Date(user.updatedAt), {
                addSuffix: true,
                locale: tr,
              })}
            </span>
          </span>
        </div>
      </div>

      {/* User ID (for debugging/support) */}
      <div className="mt-4 border-t pt-4">
        <p className="text-muted-foreground font-mono text-xs">ID: {user.id}</p>
      </div>
    </Card>
  );
}

export default UserProfileCard;
