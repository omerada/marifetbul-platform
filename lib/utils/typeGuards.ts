/**
 * Type guard utilities for job budget handling
 */

import type { JobBudget } from '@/types';

/**
 * Type guard to check if budget is a JobBudget object
 */
export function isJobBudgetObject(
  budget: number | JobBudget
): budget is JobBudget {
  return typeof budget === 'object' && budget !== null && 'amount' in budget;
}

/**
 * Format job budget for display
 */
export function formatJobBudget(budget: number | JobBudget): string {
  if (isJobBudgetObject(budget)) {
    const formatted = budget.amount.toLocaleString('tr-TR');
    if (budget.maxAmount) {
      return `₺${formatted} - ₺${budget.maxAmount.toLocaleString('tr-TR')}`;
    }
    return `₺${formatted}`;
  }

  return `₺${budget.toLocaleString('tr-TR')}`;
}

/**
 * Get budget type for display
 */
export function getBudgetType(budget: number | JobBudget): string {
  if (isJobBudgetObject(budget)) {
    switch (budget.type) {
      case 'fixed':
        return 'Sabit Fiyat';
      case 'hourly':
        return 'Saatlik';
      default:
        return 'Belirtilmemiş';
    }
  }

  return 'Sabit Fiyat';
}

/**
 * Get minimum budget amount
 */
export function getMinBudget(budget: number | JobBudget): number {
  if (isJobBudgetObject(budget)) {
    return budget.amount;
  }

  return budget;
}

/**
 * Get maximum budget amount
 */
export function getMaxBudget(budget: number | JobBudget): number {
  if (isJobBudgetObject(budget)) {
    return budget.maxAmount || budget.amount;
  }

  return budget;
}

/**
 * Check if budget is hourly
 */
export function isBudgetHourly(budget: number | JobBudget): boolean {
  return isJobBudgetObject(budget) && budget.type === 'hourly';
}

/**
 * Check if budget is fixed
 */
export function isBudgetFixed(budget: number | JobBudget): boolean {
  return (
    (isJobBudgetObject(budget) && budget.type === 'fixed') ||
    typeof budget === 'number'
  );
}

/**
 * Check if budget is a range
 */
export function isBudgetRange(budget: number | JobBudget): boolean {
  return isJobBudgetObject(budget) && !!budget.maxAmount;
}
