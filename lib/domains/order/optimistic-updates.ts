/**
 * ================================================
 * OPTIMISTIC UPDATES UTILITY
 * ================================================
 * Utilities for optimistic UI updates with rollback
 * Provides type-safe optimistic updates for orders
 *
 * @author MarifetBul Development Team
 * @version 1.0.0 - Story 10: Validation & Error Handling
 */

import type {
  OrderResponse as Order,
  OrderStatus,
} from '@/types/backend-aligned';
import { toast } from 'sonner';

// ================================================
// TYPES
// ================================================

export interface OptimisticUpdate<T> {
  /** Previous state before update */
  previousState: T;
  /** New optimistic state */
  optimisticState: T;
  /** Update timestamp */
  timestamp: number;
  /** Update ID for tracking */
  id: string;
}

export interface OptimisticUpdateOptions {
  /** Success message */
  successMessage?: string;
  /** Error message */
  errorMessage?: string;
  /** Show toast notification */
  showNotification?: boolean;
  /** Rollback on error */
  rollbackOnError?: boolean;
}

// ================================================
// OPTIMISTIC UPDATE MANAGER
// ================================================

/**
 * Manager for optimistic updates with automatic rollback
 */
export class OptimisticUpdateManager<T> {
  private updates: Map<string, OptimisticUpdate<T>> = new Map();
  private rollbackTimeouts: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Apply an optimistic update
   */
  apply(
    updateId: string,
    previousState: T,
    optimisticState: T,
    options: OptimisticUpdateOptions = {}
  ): void {
    const update: OptimisticUpdate<T> = {
      previousState,
      optimisticState,
      timestamp: Date.now(),
      id: updateId,
    };

    this.updates.set(updateId, update);

    // Set auto-rollback timeout (30 seconds)
    const timeout = setTimeout(() => {
      this.rollback(updateId, 'İşlem zaman aşımına uğradı');
    }, 30000);

    this.rollbackTimeouts.set(updateId, timeout);

    if (options.showNotification) {
      toast.loading('İşlem yapılıyor...', { id: updateId });
    }
  }

  /**
   * Confirm an optimistic update (remove rollback)
   */
  confirm(updateId: string, options: OptimisticUpdateOptions = {}): void {
    // Clear timeout
    const timeout = this.rollbackTimeouts.get(updateId);
    if (timeout) {
      clearTimeout(timeout);
      this.rollbackTimeouts.delete(updateId);
    }

    // Remove update
    this.updates.delete(updateId);

    // Show success notification
    if (options.showNotification) {
      toast.success(options.successMessage || 'İşlem başarılı', {
        id: updateId,
      });
    }
  }

  /**
   * Rollback an optimistic update
   */
  rollback(
    updateId: string,
    errorMessage?: string,
    options: OptimisticUpdateOptions = {}
  ): T | null {
    const update = this.updates.get(updateId);
    if (!update) return null;

    // Clear timeout
    const timeout = this.rollbackTimeouts.get(updateId);
    if (timeout) {
      clearTimeout(timeout);
      this.rollbackTimeouts.delete(updateId);
    }

    // Remove update
    this.updates.delete(updateId);

    // Show error notification
    if (options.showNotification) {
      toast.error(errorMessage || options.errorMessage || 'İşlem başarısız', {
        id: updateId,
      });
    }

    return update.previousState;
  }

  /**
   * Get all pending updates
   */
  getPending(): OptimisticUpdate<T>[] {
    return Array.from(this.updates.values());
  }

  /**
   * Clear all updates
   */
  clear(): void {
    // Clear all timeouts
    this.rollbackTimeouts.forEach((timeout) => clearTimeout(timeout));
    this.rollbackTimeouts.clear();
    this.updates.clear();
  }
}

// ================================================
// ORDER-SPECIFIC HELPERS
// ================================================

/**
 * Create optimistic order status update
 */
export function createOptimisticStatusUpdate(
  order: Order,
  newStatus: OrderStatus
): Order {
  return {
    ...order,
    status: newStatus,
    updatedAt: new Date().toISOString(),
  };
}

// ================================================
// GLOBAL INSTANCE
// ================================================

/**
 * Global order optimistic update manager
 */
export const orderUpdateManager = new OptimisticUpdateManager<Order>();
