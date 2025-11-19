/**
 * ================================================
 * UNIFIED DATA TABLE - BARREL EXPORT
 * ================================================
 * Sprint 2 - Unified Table Component System
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-19
 */

// Main component
export { UnifiedDataTable, default } from './UnifiedDataTable';

// Types
export type {
  Column,
  ColumnAlign,
  CellFormatter,
  SortConfig,
  SortDirection,
  SortingOptions,
  FilterType,
  FilterOption,
  FilterConfig,
  FilterValues,
  FilteringOptions,
  PaginationOptions,
  SelectionOptions,
  BulkAction,
  RowAction,
  VirtualizationOptions,
  ExportOptions,
  ExportFormat,
  UnifiedDataTableProps,
  UseTableSortReturn,
  UseTableFilterReturn,
  UseTablePaginationReturn,
  UseTableSelectionReturn,
} from './types';

// Hooks (for advanced usage)
export {
  useTableSort,
  useTableFilter,
  useTablePagination,
  useTableSelection,
} from './hooks';
