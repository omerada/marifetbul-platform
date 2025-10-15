/**
 * TableFilters Component
 *
 * Search and filter controls for user table
 */

'use client';

import React from 'react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import { Input } from '@/components/ui/Input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import {
  Search,
  Filter,
  Shield,
  ChevronRight,
  Briefcase,
  UserCheck,
  Users,
} from 'lucide-react';
import { TableFiltersProps } from '../types/userTableTypes';
import { STATUS_OPTIONS, ROLE_OPTIONS } from '../constants/userTableConstants';

export function TableFilters({
  filters,
  onFilterChange,
  onSearch,
}: TableFiltersProps) {
  const currentStatusLabel =
    STATUS_OPTIONS.find((opt) => opt.value === filters.status?.[0])?.label ||
    'Tümü';

  const currentRoleLabel =
    ROLE_OPTIONS.find((opt) => opt.value === filters.userType)?.label || 'Tümü';

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
      {/* Search Input */}
      <div className="relative lg:col-span-2">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
        <Input
          placeholder="İsim, e-posta veya ID ile kullanıcı arayın..."
          value={filters.search || ''}
          onChange={(e) => onSearch(e.target.value)}
          className="h-12 border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {/* Status Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-12 w-full justify-between border-gray-300"
          >
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Durum: {currentStatusLabel}</span>
            </div>
            <ChevronRight className="h-4 w-4 rotate-90" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem
            onClick={() => onFilterChange({ status: undefined })}
          >
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-gray-400"></div>
              <span>Tüm Durumlar</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onFilterChange({ status: ['active'] })}
          >
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              <span>Aktif</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onFilterChange({ status: ['pending_verification'] })}
          >
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-yellow-400"></div>
              <span>Doğrulama Bekliyor</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onFilterChange({ status: ['suspended'] })}
          >
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-orange-400"></div>
              <span>Askıya Alınmış</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onFilterChange({ status: ['banned'] })}
          >
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-red-400"></div>
              <span>Yasaklanmış</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Role Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-12 w-full justify-between border-gray-300"
          >
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Rol: {currentRoleLabel}</span>
            </div>
            <ChevronRight className="h-4 w-4 rotate-90" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuItem
            onClick={() => onFilterChange({ userType: undefined })}
          >
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span>Tüm Roller</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onFilterChange({ userType: 'employer' })}
          >
            <div className="flex items-center space-x-2">
              <Briefcase className="h-4 w-4 text-indigo-600" />
              <span>İşveren</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onFilterChange({ userType: 'freelancer' })}
          >
            <div className="flex items-center space-x-2">
              <UserCheck className="h-4 w-4 text-emerald-600" />
              <span>Serbest Çalışan</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
