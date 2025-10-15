/**
 * UserRow Component
 *
 * Single user row in the table with all user information and action menu
 */

'use client';

import React from 'react';
import { TableRow, TableCell } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Checkbox } from '@/components/ui/Checkbox';
import { UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRowProps } from '../types/userTableTypes';
import {
  formatUserName,
  getUserInitial,
  formatDate,
  formatRelativeTime,
  getStatusColor,
  getStatusDotColor,
  getRoleColor,
} from '../utils/userTableHelpers';
import { ActionMenu } from './ActionMenu';

export function UserRow({
  user,
  isSelected,
  onSelect,
  onAction,
}: UserRowProps) {
  return (
    <TableRow
      className={cn(
        'border-b border-gray-100 transition-colors',
        isSelected && 'bg-blue-50/50'
      )}
    >
      {/* Checkbox Cell */}
      <TableCell className="py-4">
        <Checkbox
          checked={isSelected}
          onChange={onSelect}
          className="rounded-md"
        />
      </TableCell>

      {/* User Info Cell */}
      <TableCell className="py-4">
        <div className="flex items-center space-x-4">
          {/* Avatar */}
          <div className="relative">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              {getUserInitial(user)}
            </div>
            {/* Verification Badge */}
            {user.verificationStatus === 'verified' && (
              <div className="absolute -right-1 -bottom-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-green-500">
                <UserCheck className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </div>

          {/* Name and Email */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <p className="truncate text-sm font-semibold text-gray-900">
                {formatUserName(user)}
              </p>
            </div>
            <p className="truncate text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      </TableCell>

      {/* Role Cell */}
      <TableCell className="py-4">
        <Badge
          className={`${getRoleColor(user.userType)} px-3 py-1 font-medium`}
        >
          {user.userType}
        </Badge>
      </TableCell>

      {/* Status Cell */}
      <TableCell className="py-4">
        <div className="flex items-center space-x-2">
          <div
            className={`h-2 w-2 rounded-full ${getStatusDotColor(user.accountStatus)}`}
          ></div>
          <Badge
            className={`${getStatusColor(user.accountStatus)} px-3 py-1 font-medium`}
          >
            {user.accountStatus}
          </Badge>
        </div>
      </TableCell>

      {/* Join Date Cell */}
      <TableCell className="py-4">
        <div className="text-sm text-gray-900">
          {formatDate(user.createdAt)}
        </div>
      </TableCell>

      {/* Last Activity Cell */}
      <TableCell className="py-4">
        <div className="text-sm text-gray-600">
          {formatRelativeTime(user.lastActiveAt)}
        </div>
      </TableCell>

      {/* Actions Cell */}
      <TableCell className="py-4 text-right">
        <ActionMenu user={user} onAction={onAction} />
      </TableCell>
    </TableRow>
  );
}
