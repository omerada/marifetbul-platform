/**
 * ================================================
 * UNIFIED DATA TABLE - MAIN COMPONENT
 * ================================================
 * Sprint 2 - Story 1.1: Core Component
 *
 * Generic, production-ready table component
 * Replaces 14+ duplicate table implementations
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-19
 */

'use client';

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { TableSkeleton } from '@/components/ui/loading/TableSkeleton';
import { Checkbox } from '@/components/ui/Checkbox';
import { ArrowUpDown, ArrowUp, ArrowDown, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/DropdownMenu';
import type { UnifiedDataTableProps, Column } from './types';
import {
  useTableSort,
  useTableFilter,
  useTablePagination,
  useTableSelection,
} from './hooks';
import {
  formatCurrency,
  formatTableDate,
  formatPercentage,
  formatNumber,
} from '@/lib/utils/table-formatters';
import { cn } from '@/lib/utils';

/**
 * UnifiedDataTable Component
 *
 * Generic table component with sorting, filtering, pagination, and selection
 *
 * @example
 * ```tsx
 * <UnifiedDataTable<User>
 *   data={users}
 *   columns={[
 *     { id: 'name', header: 'Name', accessor: 'name', sortable: true },
 *     { id: 'email', header: 'Email', accessor: 'email' },
 *     { id: 'balance', header: 'Balance', accessor: 'balance', formatter: 'currency' },
 *   ]}
 *   pagination={{ enabled: true, pageSize: 20 }}
 *   sorting={{ enabled: true }}
 * />
 * ```
 */
export function UnifiedDataTable<T>({
  // Data
  data,
  columns,

  // Features
  sorting,
  filtering,
  pagination,
  selection,
  bulkActions,
  rowActions,

  // UI/UX
  isLoading = false,
  error = null,
  emptyMessage = 'Veri bulunamadı',
  emptyState,
  caption,
  showHeader = true,
  stickyHeader = false,
  hoverable = true,
  striped = false,
  compact = false,

  // Callbacks
  onRowClick,
  onRowDoubleClick,
  getRowClassName,
  getRowId,

  // Styling
  className,
  tableClassName,
  containerClassName,
}: UnifiedDataTableProps<T>) {
  // ============================================================================
  // HOOKS
  // ============================================================================

  // Sorting
  const { sortedData, sortConfig, handleSort } = useTableSort({
    data,
    columns,
    options: sorting,
  });

  // Filtering
  const { filteredData } = useTableFilter({
    data: sortedData,
    columns,
    options: filtering,
  });

  // Pagination
  const {
    paginatedData,
    currentPage,
    totalPages,
    goToPage,
    canGoNext,
    canGoPrev,
  } = useTablePagination({
    data: filteredData,
    options: pagination,
  });

  // Selection
  const {
    selectedIds,
    selectedRows,
    isRowSelected,
    toggleRow,
    toggleAll,
    isAllSelected,
  } = useTableSelection({
    data: paginatedData,
    options: selection,
  });

  // ============================================================================
  // COMPUTED
  // ============================================================================

  const finalData = paginatedData;
  const hasSelection = selection?.enabled ?? false;
  const hasRowActions = (rowActions?.length ?? 0) > 0;
  const hasBulkActions = (bulkActions?.length ?? 0) > 0 && hasSelection;

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Format cell value based on column formatter
   */
  const formatCellValue = (
    column: Column<T>,
    value: unknown
  ): React.ReactNode => {
    if (value === null || value === undefined) return '-';

    switch (column.formatter) {
      case 'currency':
        return formatCurrency(value as number);
      case 'date':
        return formatTableDate(value as Date | string, 'short');
      case 'datetime':
        return formatTableDate(value as Date | string, 'datetime');
      case 'time':
        return formatTableDate(value as Date | string, 'time');
      case 'percentage':
        return formatPercentage(value as number);
      case 'number':
        return formatNumber(value as number);
      default:
        return String(value);
    }
  };

  /**
   * Render cell content
   */
  const renderCell = (
    column: Column<T>,
    row: T,
    index: number
  ): React.ReactNode => {
    // Custom render function
    if (column.render) {
      const value = column.accessor ? row[column.accessor] : undefined;
      return column.render(value, row, index);
    }

    // Default: format by accessor
    if (column.accessor) {
      const value = row[column.accessor];
      return formatCellValue(column, value);
    }

    return '-';
  };

  /**
   * Get sort icon for column
   */
  const getSortIcon = (columnId: string) => {
    if (!sortConfig || sortConfig.column !== columnId) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }

    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  /**
   * Get row ID
   */
  const getRowIdFn = (row: T, index: number): string => {
    if (getRowId) return getRowId(row, index);
    if (selection?.rowIdAccessor) {
      if (typeof selection.rowIdAccessor === 'function') {
        return selection.rowIdAccessor(row);
      }
      return String(row[selection.rowIdAccessor]);
    }
    return String(index);
  };

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (isLoading) {
    return (
      <div className={cn('rounded-lg border', containerClassName)}>
        <TableSkeleton
          rows={pagination?.pageSize ?? 10}
          columns={
            columns.length + (hasSelection ? 1 : 0) + (hasRowActions ? 1 : 0)
          }
        />
      </div>
    );
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (error) {
    return (
      <div
        className={cn('rounded-lg border p-12 text-center', containerClassName)}
      >
        <p className="text-destructive text-sm">{error}</p>
      </div>
    );
  }

  // ============================================================================
  // EMPTY STATE
  // ============================================================================

  if (finalData.length === 0) {
    if (emptyState) {
      return <div className={containerClassName}>{emptyState}</div>;
    }

    return (
      <div
        className={cn('rounded-lg border p-12 text-center', containerClassName)}
      >
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      </div>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className={cn('space-y-4', className)}>
      {/* Bulk Actions Toolbar */}
      {hasBulkActions && selectedIds.length > 0 && (
        <div className="bg-muted/50 flex items-center gap-2 rounded-lg border p-4">
          <span className="text-sm font-medium">
            {selectedIds.length} öğe seçildi
          </span>
          {bulkActions?.map((action, index) => {
            const variant = action.variant || 'default';
            return (
              <button
                key={index}
                onClick={() => action.onClick(selectedIds, selectedRows)}
                disabled={action.disabled?.(selectedIds, selectedRows)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  variant === 'danger'
                    ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90',
                  'disabled:pointer-events-none disabled:opacity-50'
                )}
              >
                {action.icon && <action.icon className="mr-2 inline h-4 w-4" />}
                {action.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Table */}
      <div
        className={cn('overflow-hidden rounded-lg border', containerClassName)}
      >
        <div className="overflow-x-auto">
          <Table className={tableClassName}>
            {caption && (
              <caption className="text-muted-foreground mt-4 text-sm">
                {caption}
              </caption>
            )}

            {/* Header */}
            {showHeader && (
              <TableHeader
                className={cn(
                  stickyHeader && 'bg-background sticky top-0 z-10'
                )}
              >
                <TableRow>
                  {/* Selection Column */}
                  {hasSelection && (
                    <TableHead className="w-12">
                      <Checkbox checked={isAllSelected} onChange={toggleAll} />
                    </TableHead>
                  )}

                  {/* Data Columns */}
                  {columns.map((column) => (
                    <TableHead
                      key={column.id}
                      className={cn(
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right',
                        column.sortable && 'cursor-pointer select-none',
                        column.headerClassName
                      )}
                      style={{
                        width: column.width,
                        minWidth: column.minWidth,
                        maxWidth: column.maxWidth,
                      }}
                      onClick={() => column.sortable && handleSort(column.id)}
                    >
                      <div className="flex items-center">
                        {column.header}
                        {column.sortable && getSortIcon(column.id)}
                      </div>
                    </TableHead>
                  ))}

                  {/* Actions Column */}
                  {hasRowActions && (
                    <TableHead className="w-20 text-right">İşlemler</TableHead>
                  )}
                </TableRow>
              </TableHeader>
            )}

            {/* Body */}
            <TableBody>
              {finalData.map((row, index) => {
                const rowId = getRowIdFn(row, index);
                const isSelected = hasSelection && isRowSelected(rowId);

                return (
                  <TableRow
                    key={rowId}
                    className={cn(
                      hoverable && 'hover:bg-muted/50 cursor-pointer',
                      striped && index % 2 === 1 && 'bg-muted/20',
                      isSelected && 'bg-primary/10',
                      getRowClassName?.(row, index)
                    )}
                    onClick={() => onRowClick?.(row, index)}
                    onDoubleClick={() => onRowDoubleClick?.(row, index)}
                  >
                    {/* Selection Cell */}
                    {hasSelection && (
                      <TableCell className={cn(compact && 'py-2')}>
                        <Checkbox
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleRow(rowId);
                          }}
                        />
                      </TableCell>
                    )}

                    {/* Data Cells */}
                    {columns.map((column) => (
                      <TableCell
                        key={column.id}
                        className={cn(
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          compact && 'py-2',
                          column.cellClassName
                        )}
                      >
                        {renderCell(column, row, index)}
                      </TableCell>
                    ))}

                    {/* Actions Cell */}
                    {hasRowActions && (
                      <TableCell
                        className={cn('text-right', compact && 'py-2')}
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="border-input bg-background hover:bg-accent hover:text-accent-foreground focus:ring-ring inline-flex h-8 w-8 items-center justify-center rounded-md border focus:ring-2 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                              aria-label="Row actions"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {rowActions
                              ?.filter((action) => {
                                // Check 'show' condition (if provided)
                                if (action.show && !action.show(row)) {
                                  return false;
                                }
                                return true;
                              })
                              .map((action, actionIndex) => {
                                const isDisabled = action.disabled?.(row);
                                const variant = action.variant || 'default';
                                const Icon = action.icon;

                                // Check if separator needed (before danger actions)
                                const isDanger = variant === 'danger';
                                const prevAction = rowActions[actionIndex - 1];
                                const prevIsDanger =
                                  prevAction?.variant === 'danger';
                                const showSeparator =
                                  isDanger && !prevIsDanger && actionIndex > 0;

                                return (
                                  <React.Fragment
                                    key={action.id || action.label}
                                  >
                                    {showSeparator && <DropdownMenuSeparator />}
                                    <DropdownMenuItem
                                      onClick={() => {
                                        if (!isDisabled) {
                                          action.onClick(row);
                                        }
                                      }}
                                      className={cn(
                                        isDisabled &&
                                          'cursor-not-allowed opacity-50',
                                        variant === 'danger' &&
                                          'text-red-600 focus:bg-red-50',
                                        variant === 'warning' &&
                                          'text-yellow-600 focus:bg-yellow-50',
                                        variant === 'success' &&
                                          'text-green-600 focus:bg-green-50'
                                      )}
                                    >
                                      {Icon && (
                                        <Icon className="mr-2 h-4 w-4" />
                                      )}
                                      {action.label}
                                    </DropdownMenuItem>
                                  </React.Fragment>
                                );
                              })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination?.enabled && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-muted-foreground text-sm">
            Sayfa {currentPage + 1} / {totalPages}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={!canGoPrev}
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            >
              Önceki
            </button>
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={!canGoNext}
              className="rounded-md border px-3 py-1 text-sm disabled:opacity-50"
            >
              Sonraki
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UnifiedDataTable;
