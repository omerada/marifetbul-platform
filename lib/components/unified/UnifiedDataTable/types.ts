/**
 * ================================================
 * UNIFIED DATA TABLE - TYPE DEFINITIONS
 * ================================================
 * Sprint 2 - Story 1.1: Core Component Types
 *
 * Generic, type-safe table component for all data types
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 * @since 2025-11-19
 */

import type { ReactNode } from 'react';

// ============================================================================
// COLUMN CONFIGURATION
// ============================================================================

/**
 * Built-in formatters for common data types
 */
export type CellFormatter =
  | 'currency'
  | 'date'
  | 'datetime'
  | 'time'
  | 'percentage'
  | 'number'
  | 'text';

/**
 * Column alignment options
 */
export type ColumnAlign = 'left' | 'center' | 'right';

/**
 * Column definition for table
 * Generic T represents the data type
 */
export interface Column<T = any> {
  /** Unique column identifier */
  id: string;

  /** Column header text */
  header: string;

  /** Property accessor (keyof T) */
  accessor?: keyof T;

  /** Custom render function for cell content */
  render?: (value: any, row: T, index: number) => ReactNode;

  /** Built-in formatter to apply */
  formatter?: CellFormatter;

  /** Enable sorting for this column */
  sortable?: boolean;

  /** Enable filtering for this column */
  filterable?: boolean;

  /** Column alignment */
  align?: ColumnAlign;

  /** Fixed column width (CSS value) */
  width?: string | number;

  /** Minimum column width (CSS value) */
  minWidth?: string | number;

  /** Maximum column width (CSS value) */
  maxWidth?: string | number;

  /** Additional CSS classes for header cell */
  headerClassName?: string;

  /** Additional CSS classes for body cells */
  cellClassName?: string;

  /** Hide column on mobile/tablet */
  hideOnMobile?: boolean;

  /** Custom sort function */
  sortFn?: (a: T, b: T, direction: SortDirection) => number;
}

// ============================================================================
// SORTING
// ============================================================================

/**
 * Sort direction
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Sort configuration
 */
export interface SortConfig {
  /** Column ID to sort by */
  column: string;

  /** Sort direction */
  direction: SortDirection;
}

/**
 * Sorting options
 */
export interface SortingOptions {
  /** Enable sorting */
  enabled?: boolean;

  /** Default sort configuration */
  defaultSort?: SortConfig;

  /** Use server-side sorting */
  serverSide?: boolean;

  /** Callback when sort changes (server-side) */
  onSortChange?: (sort: SortConfig | null) => void;
}

// ============================================================================
// FILTERING
// ============================================================================

/**
 * Filter type
 */
export type FilterType =
  | 'text'
  | 'select'
  | 'date-range'
  | 'number-range'
  | 'multi-select';

/**
 * Filter option for select/multi-select
 */
export interface FilterOption {
  label: string;
  value: string | number;
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  /** Filter identifier (matches column id) */
  id: string;

  /** Filter label */
  label: string;

  /** Filter type */
  type: FilterType;

  /** Options for select/multi-select */
  options?: FilterOption[];

  /** Placeholder text */
  placeholder?: string;
}

/**
 * Filter values (Record of filter id to value)
 */
export type FilterValues = Record<string, any>;

/**
 * Filtering options
 */
export interface FilteringOptions {
  /** Enable filtering */
  enabled?: boolean;

  /** Filter configurations */
  filters?: FilterConfig[];

  /** Default filter values */
  defaultFilters?: FilterValues;

  /** Use server-side filtering */
  serverSide?: boolean;

  /** Callback when filters change (server-side) */
  onFilterChange?: (filters: FilterValues) => void;
}

// ============================================================================
// PAGINATION
// ============================================================================

/**
 * Pagination configuration
 */
export interface PaginationOptions {
  /** Enable pagination */
  enabled?: boolean;

  /** Current page (0-indexed) */
  currentPage?: number;

  /** Items per page */
  pageSize?: number;

  /** Total number of items */
  totalItems?: number;

  /** Use server-side pagination */
  serverSide?: boolean;

  /** Callback when page changes */
  onPageChange?: (page: number) => void;

  /** Show page size selector */
  showPageSizeSelector?: boolean;

  /** Available page sizes */
  pageSizeOptions?: number[];
}

// ============================================================================
// SELECTION
// ============================================================================

/**
 * Selection options
 */
export interface SelectionOptions<T = any> {
  /** Enable row selection */
  enabled?: boolean;

  /** Selected row IDs */
  selectedIds?: string[];

  /** Callback when selection changes */
  onSelectionChange?: (selectedIds: string[], selectedRows: T[]) => void;

  /** Row ID accessor */
  rowIdAccessor?: keyof T | ((row: T) => string);

  /** Disable selection for specific rows */
  isRowDisabled?: (row: T) => boolean;
}

// ============================================================================
// BULK ACTIONS
// ============================================================================

/**
 * Bulk action definition
 */
export interface BulkAction<T = any> {
  /** Unique action ID */
  id?: string;

  /** Action label */
  label: string;

  /** Action icon component */
  icon?: React.ComponentType<{ className?: string }>;

  /** Action handler */
  onClick: (selectedIds: string[], selectedRows: T[]) => void | Promise<void>;

  /** Action variant (color scheme) */
  variant?: 'default' | 'danger' | 'warning' | 'success';

  /** Disable action conditionally */
  disabled?: (selectedIds: string[], selectedRows: T[]) => boolean;

  /** Confirm before executing */
  confirm?: {
    title: string;
    message: string;
  };
}

// ============================================================================
// TABLE ACTIONS (ROW LEVEL)
// ============================================================================

/**
 * Row-level action
 */
export interface RowAction<T = any> {
  /** Unique action ID */
  id?: string;

  /** Action label */
  label: string;

  /** Action icon */
  icon?: React.ComponentType<{ className?: string }>;

  /** Action handler */
  onClick: (row: T) => void | Promise<void>;

  /** Action variant (color scheme) */
  variant?: 'default' | 'danger' | 'warning' | 'success';

  /** Show action conditionally */
  show?: (row: T) => boolean;

  /** Disable action conditionally */
  disabled?: (row: T) => boolean;
}

// ============================================================================
// VIRTUALIZATION
// ============================================================================

/**
 * Virtualization options for large datasets
 */
export interface VirtualizationOptions {
  /** Enable virtualization */
  enabled?: boolean;

  /** Row height in pixels */
  rowHeight?: number;

  /** Overscan count (rows to render outside viewport) */
  overscan?: number;
}

// ============================================================================
// EXPORT
// ============================================================================

/**
 * Export format
 */
export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

/**
 * Export options
 */
export interface ExportOptions<T = any> {
  /** Enable export */
  enabled?: boolean;

  /** Available export formats */
  formats?: ExportFormat[];

  /** Default filename (without extension) */
  fileName?: string;

  /** Export handler */
  onExport?: (format: ExportFormat, data: T[]) => void | Promise<void>;

  /** Export all data or only visible */
  exportAll?: boolean;
}

// ============================================================================
// MAIN COMPONENT PROPS
// ============================================================================

/**
 * UnifiedDataTable component props
 */
export interface UnifiedDataTableProps<T = any> {
  // ============================================================================
  // DATA
  // ============================================================================

  /** Table data array */
  data: T[];

  /** Column definitions */
  columns: Column<T>[];

  // ============================================================================
  // FEATURES
  // ============================================================================

  /** Sorting configuration */
  sorting?: SortingOptions;

  /** Filtering configuration */
  filtering?: FilteringOptions;

  /** Pagination configuration */
  pagination?: PaginationOptions;

  /** Selection configuration */
  selection?: SelectionOptions<T>;

  /** Bulk actions (requires selection) */
  bulkActions?: BulkAction<T>[];

  /** Row actions (dropdown menu) */
  rowActions?: RowAction<T>[];

  /** Virtualization for large datasets */
  virtualization?: VirtualizationOptions;

  /** Export functionality */
  export?: ExportOptions<T>;

  // ============================================================================
  // UI/UX
  // ============================================================================

  /** Show loading skeleton */
  isLoading?: boolean;

  /** Error message */
  error?: string | null;

  /** Empty state message */
  emptyMessage?: string;

  /** Custom empty state component */
  emptyState?: ReactNode;

  /** Table caption */
  caption?: string;

  /** Show table header */
  showHeader?: boolean;

  /** Sticky header on scroll */
  stickyHeader?: boolean;

  /** Enable row hover effect */
  hoverable?: boolean;

  /** Enable striped rows */
  striped?: boolean;

  /** Compact table (smaller padding) */
  compact?: boolean;

  /** Border style */
  bordered?: boolean;

  // ============================================================================
  // CALLBACKS
  // ============================================================================

  /** Callback when row is clicked */
  onRowClick?: (row: T, index: number) => void;

  /** Callback when row is double-clicked */
  onRowDoubleClick?: (row: T, index: number) => void;

  /** Custom row className */
  getRowClassName?: (row: T, index: number) => string;

  /** Custom row ID */
  getRowId?: (row: T, index: number) => string;

  // ============================================================================
  // STYLING
  // ============================================================================

  /** Additional CSS classes */
  className?: string;

  /** Additional CSS classes for table element */
  tableClassName?: string;

  /** Additional CSS classes for container */
  containerClassName?: string;
}

// ============================================================================
// HOOK RETURN TYPES
// ============================================================================

/**
 * Return type for useTableSort hook
 */
export interface UseTableSortReturn<T> {
  sortedData: T[];
  sortConfig: SortConfig | null;
  handleSort: (columnId: string) => void;
  clearSort: () => void;
}

/**
 * Return type for useTableFilter hook
 */
export interface UseTableFilterReturn<T> {
  filteredData: T[];
  filters: FilterValues;
  setFilter: (filterId: string, value: any) => void;
  clearFilter: (filterId: string) => void;
  clearAllFilters: () => void;
}

/**
 * Return type for useTablePagination hook
 */
export interface UseTablePaginationReturn<T> {
  paginatedData: T[];
  currentPage: number;
  totalPages: number;
  pageSize: number;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  setPageSize: (size: number) => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

/**
 * Return type for useTableSelection hook
 */
export interface UseTableSelectionReturn<T> {
  selectedIds: string[];
  selectedRows: T[];
  isRowSelected: (rowId: string) => boolean;
  toggleRow: (rowId: string) => void;
  toggleAll: () => void;
  clearSelection: () => void;
  isAllSelected: boolean;
  isSomeSelected: boolean;
}
