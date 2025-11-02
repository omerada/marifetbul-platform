/**
 * ================================================
 * AUTHENTICATION GUARDS - UNIFIED
 * ================================================
 * 
 * Centralized authentication and authorization guards.
 * Combines API route protection and component protection in one place.
 * 
 * Features:
 * - ✅ API Route Guards (Server-side, Permission-based)
 * - ✅ Component Guards/HOCs (Client-side, Role-based)
 * - ✅ Role-based access control (RBAC)
 * - ✅ Permission-based access control
 * - ✅ Type-safe user context
 * - ✅ Comprehensive logging
 * 
 * @author MarifetBul Development Team
 * @version 2.0.0 - Sprint Day 2: Unified Guards
 * @refactored Merged auth-guards.ts + auth-guards.tsx
 */

// Re-export everything from submodules
export * from './api-guards';
export * from './component-guards.js'; // .js extension for .tsx files in TS import

// Re-export types and utilities
export type { UserRole, UserContext } from '../auth-utils';
export { getUserFromRequest, hasRole, isAuthenticated } from '../auth-utils';
export type { Permission } from '../permissions';

/**
 * Default export with all guards
 */
import * as apiGuards from './api-guards';
import * as componentGuards from './component-guards.js'; // .js extension for .tsx files

const guards = {
  ...apiGuards,
  ...componentGuards,
};

export default guards;
