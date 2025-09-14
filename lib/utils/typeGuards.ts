import { JobBudget } from '@/lib/types';

export function isJobBudgetObject(value: unknown): value is JobBudget {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as JobBudget).amount === 'number' &&
    typeof (value as JobBudget).type === 'string'
  );
}

export function formatJobBudget(budget: number | JobBudget): string {
  if (typeof budget === 'number') {
    return `₺${budget.toLocaleString('tr-TR')}`;
  }

  if (isJobBudgetObject(budget)) {
    const baseAmount = `₺${budget.amount.toLocaleString('tr-TR')}`;
    const maxPart = budget.maxAmount
      ? ` - ₺${budget.maxAmount.toLocaleString('tr-TR')}`
      : '';
    const typePart = budget.type === 'hourly' ? '/saat' : '';
    return baseAmount + maxPart + typePart;
  }

  return '₺0';
}

export function getBudgetType(budget: number | JobBudget): string {
  if (typeof budget === 'number') {
    return 'fixed';
  }

  if (isJobBudgetObject(budget)) {
    return budget.type;
  }

  return 'fixed';
}
