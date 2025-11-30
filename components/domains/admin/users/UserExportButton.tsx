'use client';

/**
 * ================================================
 * USER EXPORT BUTTON COMPONENT
 * ================================================
 * Export user data to CSV format with column selection
 *
 * Features:
 * - CSV export with UTF-8 BOM support
 * - Export all or selected users
 * - Column selection modal
 * - Respects current filters
 * - Progress indication
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Sprint 2.3
 */

'use client';

import { useState } from 'react';
import { Download, FileText, Check } from 'lucide-react';
import { UnifiedButton as Button } from '@/components/ui/UnifiedButton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { Checkbox } from '@/components/ui/Checkbox';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/hooks';
import logger from '@/lib/infrastructure/monitoring/logger';
import type { AdminUserData } from './userTable/types/userTableTypes';

interface UserExportButtonProps {
  users: AdminUserData[];
  selectedUsers?: AdminUserData[];
  filters?: Record<string, unknown>;
  className?: string;
}

interface ExportColumn {
  key: string;
  label: string;
  required?: boolean;
}

const EXPORT_COLUMNS: ExportColumn[] = [
  { key: 'id', label: 'Kullanýcý ID', required: true },
  { key: 'name', label: 'Ad Soyad', required: true },
  { key: 'email', label: 'E-posta', required: true },
  { key: 'userType', label: 'Rol' },
  { key: 'accountStatus', label: 'Durum' },
  { key: 'verificationStatus', label: 'Doðrulama Durumu' },
  { key: 'createdAt', label: 'Kayýt Tarihi' },
  { key: 'lastActiveAt', label: 'Son Aktivite' },
];

export function UserExportButton({
  users,
  selectedUsers = [],
  filters,
  className,
}: UserExportButtonProps) {
  const { success: showSuccess, error: showError } = useToast();
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    EXPORT_COLUMNS.map((col) => col.key)
  );
  const [isExporting, setIsExporting] = useState(false);

  const hasSelection = selectedUsers.length > 0;
  const exportCount = hasSelection ? selectedUsers.length : users.length;

  // Toggle column selection
  const toggleColumn = (columnKey: string) => {
    const column = EXPORT_COLUMNS.find((col) => col.key === columnKey);
    if (column?.required) return; // Can't deselect required columns

    setSelectedColumns((prev) =>
      prev.includes(columnKey)
        ? prev.filter((key) => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  // Format user name
  const formatUserName = (user: AdminUserData): string => {
    if (user.name) return user.name;
    if (user.firstName || user.lastName) {
      return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    }
    return user.email.split('@')[0];
  };

  // Format date
  const formatDate = (date?: string | Date): string => {
    if (!date) return '-';
    try {
      return new Date(date).toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  // Format status
  const formatStatus = (status: string): string => {
    const statusMap: Record<string, string> = {
      active: 'Aktif',
      inactive: 'Pasif',
      suspended: 'Askýya Alýnmýþ',
      banned: 'Yasaklanmýþ',
      pending_verification: 'Doðrulama Bekliyor',
    };
    return statusMap[status] || status;
  };

  // Format role
  const formatRole = (role: string): string => {
    const roleMap: Record<string, string> = {
      admin: 'Admin',
      moderator: 'Moderatör',
      employer: 'Ýþveren',
      freelancer: 'Freelancer',
    };
    return roleMap[role] || role;
  };

  // Format verification status
  const formatVerificationStatus = (status?: string): string => {
    if (!status) return '-';
    const statusMap: Record<string, string> = {
      pending: 'Bekliyor',
      verified: 'Doðrulanmýþ',
      rejected: 'Reddedilmiþ',
    };
    return statusMap[status] || status;
  };

  // Get cell value
  const getCellValue = (user: AdminUserData, columnKey: string): string => {
    switch (columnKey) {
      case 'id':
        return user.id;
      case 'name':
        return formatUserName(user);
      case 'email':
        return user.email;
      case 'userType':
        return formatRole(user.userType);
      case 'accountStatus':
        return formatStatus(user.accountStatus);
      case 'verificationStatus':
        return formatVerificationStatus(user.verificationStatus);
      case 'createdAt':
        return formatDate(user.createdAt);
      case 'lastActiveAt':
        return formatDate(user.lastActiveAt);
      default:
        return '-';
    }
  };

  // Export to CSV
  const handleExport = async () => {
    try {
      setIsExporting(true);

      const dataToExport = hasSelection ? selectedUsers : users;

      if (dataToExport.length === 0) {
        showError(
          'Dýþa Aktarma Hatasý',
          'Dýþa aktarýlacak kullanýcý bulunamadý'
        );
        return;
      }

      // Get selected columns
      const columns = EXPORT_COLUMNS.filter((col) =>
        selectedColumns.includes(col.key)
      );

      // Prepare data
      const exportData = dataToExport.map((user) => {
        const row: Record<string, string> = {};
        columns.forEach((col) => {
          row[col.label] = getCellValue(user, col.key);
        });
        return row;
      });

      // Convert to CSV
      const headers = columns.map((col) => col.label);
      const csvContent = [
        headers.join(','),
        ...exportData.map((row) =>
          headers
            .map((header) => {
              const value = String(row[header] || '');
              // Escape commas, quotes, and newlines
              if (
                value.includes(',') ||
                value.includes('"') ||
                value.includes('\n')
              ) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value;
            })
            .join(',')
        ),
      ].join('\n');

      // Add BOM for Excel UTF-8 support
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], {
        type: 'text/csv;charset=utf-8;',
      });

      // Create download link
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      // Generate filename with timestamp and filter info
      const timestamp = new Date().toISOString().split('T')[0];
      const filterInfo =
        filters && Object.keys(filters).length > 0 ? 'filtered' : 'all';
      const selectionInfo = hasSelection
        ? `selected_${selectedUsers.length}`
        : 'all';
      const fileName = `users_${filterInfo}_${selectionInfo}_${timestamp}.csv`;

      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showSuccess(
        'Baþarýlý',
        `${dataToExport.length} kullanýcý CSV dosyasýna aktarýldý`
      );

      logger.info('Users exported to CSV:', {
        count: dataToExport.length,
        columns: columns.map((c) => c.key),
        hasSelection,
        fileName,
      });

      setShowColumnSelector(false);
    } catch (error) {
      logger.error(
        'Export failed:',
        error instanceof Error ? error : new Error(String(error))
      );
      showError('Hata', 'Dosya oluþturulurken bir hata oluþtu');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowColumnSelector(true)}
        disabled={exportCount === 0}
        className={className}
      >
        <Download className="mr-2 h-4 w-4" />
        Dýþa Aktar
        {hasSelection && (
          <Badge variant="secondary" className="ml-2">
            {selectedUsers.length}
          </Badge>
        )}
      </Button>

      {/* Column Selection Dialog */}
      <Dialog open={showColumnSelector} onOpenChange={setShowColumnSelector}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Kullanýcýlarý Dýþa Aktar
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Export Info */}
            <div className="bg-muted space-y-1 rounded-md p-3">
              <p className="text-sm">
                <span className="font-medium">Dýþa aktarýlacak:</span>{' '}
                {hasSelection ? (
                  <>
                    <span className="text-primary font-semibold">
                      {selectedUsers.length}
                    </span>{' '}
                    seçili kullanýcý
                  </>
                ) : (
                  <>
                    <span className="text-primary font-semibold">
                      {users.length}
                    </span>{' '}
                    kullanýcý
                    {filters &&
                      Object.keys(filters).length > 0 &&
                      ' (filtrelenmiþ)'}
                  </>
                )}
              </p>
              <p className="text-muted-foreground text-sm">
                Format: CSV (Excel uyumlu)
              </p>
            </div>

            {/* Column Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sütunlarý Seçin</label>
              <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-3">
                {EXPORT_COLUMNS.map((column) => (
                  <div key={column.key} className="flex items-center space-x-2">
                    <Checkbox
                      checked={selectedColumns.includes(column.key)}
                      onChange={() => toggleColumn(column.key)}
                      disabled={column.required}
                    />
                    <label
                      className={`flex-1 cursor-pointer text-sm ${
                        column.required
                          ? 'text-foreground font-medium'
                          : 'text-muted-foreground'
                      }`}
                      onClick={() =>
                        !column.required && toggleColumn(column.key)
                      }
                    >
                      {column.label}
                      {column.required && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Zorunlu
                        </Badge>
                      )}
                    </label>
                    {selectedColumns.includes(column.key) && (
                      <Check className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground text-xs">
                {selectedColumns.length} sütun seçildi
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowColumnSelector(false)}
              disabled={isExporting}
            >
              Ýptal
            </Button>
            <Button
              onClick={handleExport}
              disabled={isExporting || selectedColumns.length === 0}
            >
              {isExporting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                  Aktarýlýyor...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  CSV Ýndir
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
