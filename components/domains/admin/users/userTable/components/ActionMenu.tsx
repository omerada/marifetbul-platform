/**
 * ActionMenu Component
 *
 * Dropdown menu with user-specific actions
 */

'use client';

import React from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { MessageButton } from '@/components/domains/messaging';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import {
  MoreHorizontal,
  Eye,
  Mail,
  UserCheck,
  UserX,
  Shield,
  Ban,
  Trash2,
  Activity,
} from 'lucide-react';
import { ActionMenuProps } from '../types/userTableTypes';
import { isUserActive, formatUserName } from '../utils/userTableHelpers';

export function ActionMenu({ user, onAction }: ActionMenuProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Message Button - Standalone for better UX */}
      <MessageButton
        recipientId={user.id}
        recipientName={formatUserName(user)}
        variant="ghost"
        size="sm"
        className="h-8 w-8 rounded-full p-0"
      >
        <Mail className="h-4 w-4" />
      </MessageButton>

      {/* Actions Dropdown Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
            <span className="sr-only">İşlemler menüsünü aç</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {/* View Details */}
          <DropdownMenuItem
            onClick={() => onAction('view')}
            className="cursor-pointer"
          >
            <Eye className="mr-2 h-4 w-4" />
            Detayları Gör
          </DropdownMenuItem>

          {/* Activity Timeline */}
          <DropdownMenuItem
            onClick={() => onAction('activity')}
            className="cursor-pointer"
          >
            <Activity className="mr-2 h-4 w-4" />
            Aktivite Geçmişi
          </DropdownMenuItem>

          {/* Send Email */}
          <DropdownMenuItem
            onClick={() => onAction('email')}
            className="cursor-pointer"
          >
            <Mail className="mr-2 h-4 w-4" />
            E-posta Gönder
          </DropdownMenuItem>

          {/* Activate/Suspend Toggle */}
          {isUserActive(user) ? (
            <DropdownMenuItem
              onClick={() => onAction('suspend')}
              className="cursor-pointer text-orange-600 focus:text-orange-700"
            >
              <UserX className="mr-2 h-4 w-4" />
              Askıya Al
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => onAction('activate')}
              className="cursor-pointer text-green-600 focus:text-green-700"
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Aktifleştir
            </DropdownMenuItem>
          )}

          {/* Verify (if not verified) */}
          {user.verificationStatus !== 'verified' && (
            <DropdownMenuItem
              onClick={() => onAction('verify')}
              className="cursor-pointer text-blue-600 focus:text-blue-700"
            >
              <Shield className="mr-2 h-4 w-4" />
              Doğrula
            </DropdownMenuItem>
          )}

          {/* Ban */}
          <DropdownMenuItem
            onClick={() => onAction('ban')}
            className="cursor-pointer text-red-600 focus:text-red-700"
          >
            <Ban className="mr-2 h-4 w-4" />
            Kullanıcıyı Yasakla
          </DropdownMenuItem>

          {/* Delete */}
          <DropdownMenuItem
            onClick={() => onAction('delete')}
            className="cursor-pointer text-red-600 focus:text-red-700"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Sil
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
