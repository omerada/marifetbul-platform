'use client';

import React from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import {
  Users,
  UserCheck,
  UserX,
  Ban,
  Mail,
  Trash2,
  ChevronDown,
  X,
} from 'lucide-react';

interface BulkActionsProps {
  selectedCount: number;
  onAction: (action: string) => void;
  onClear: () => void;
}

function BulkActions({ selectedCount, onAction, onClear }: BulkActionsProps) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="px-3 py-1">
              {selectedCount} selected
            </Badge>
            <span className="text-sm text-gray-600">
              Bulk actions for selected users:
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quick Actions */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction('activate')}
              className="text-green-600 hover:text-green-700"
            >
              <UserCheck className="mr-1 h-4 w-4" />
              Activate
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction('suspend')}
              className="text-yellow-600 hover:text-yellow-700"
            >
              <UserX className="mr-1 h-4 w-4" />
              Suspend
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onAction('send_email')}
              className="text-blue-600 hover:text-blue-700"
            >
              <Mail className="mr-1 h-4 w-4" />
              Email
            </Button>

            {/* More Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  More
                  <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => onAction('verify')}
                  className="text-blue-600"
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  Verify Users
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAction('ban')}
                  className="text-red-600"
                >
                  <Ban className="mr-2 h-4 w-4" />
                  Ban Users
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAction('export')}
                  className="text-gray-600"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Export Selected
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onAction('delete')}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Users
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Selection */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BulkActions;
