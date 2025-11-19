/**
 * UserTable Components Barrel Export
 *
 * Centralized exports for userTable components
 * Updated for Sprint 2: Removed deprecated components (now using UnifiedDataTable)
 */

// Only TableFilters remains - all other components deprecated
export { TableFilters } from './TableFilters';

// ============================================================================
// DEPRECATED - Removed in Sprint 2 (UnifiedDataTable Migration)
// ============================================================================
// - BulkActions → Use UnifiedDataTable's bulkActions prop
// - TableHeader → Use UnifiedDataTable's built-in header
// - TablePagination → Use UnifiedDataTable's pagination prop
// - UserRow → Use UnifiedDataTable's columns + rowActions
// - ActionMenu → Use UnifiedDataTable's rowActions
// - EmptyState → Use UnifiedDataTable's emptyMessage/emptyState
// - LoadingState → Use UnifiedDataTable's isLoading prop
// - ErrorState → Use SimpleErrorDisplay from @/components/ui
