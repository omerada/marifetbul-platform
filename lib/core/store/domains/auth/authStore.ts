/**
 * ============================================================================
 * AUTH STORE - LEGACY COMPATIBILITY SHIM
 * ============================================================================
 *
 * ⚠️ DEPRECATED: This file is for backward compatibility only.
 *
 * Migration Path:
 * - Old: import { useAuthStore } from '@/lib/core/store/domains/auth/authStore';
 * - New: import { useAuthStore } from '@/lib/core/store/domains/auth/unifiedAuthStore';
 *
 * This shim re-exports from unifiedAuthStore to prevent breaking changes.
 * All new code should import directly from unifiedAuthStore.
 *
 * @deprecated Use unifiedAuthStore instead
 * @version 3.0.0
 * @created 2025-11-13
 */

// Re-export everything from unified store
export {
  useUnifiedAuthStore as useAuthStore,
  authSelectors,
} from './unifiedAuthStore';

// Export default for backward compatibility
export { useUnifiedAuthStore as default } from './unifiedAuthStore';
