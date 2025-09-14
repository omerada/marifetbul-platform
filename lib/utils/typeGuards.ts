import { JobBudget } from '@/types';

// Type guards for production-ready type safety
export const isJobBudgetObject = (
  budget: number | JobBudget
): budget is JobBudget => {
  return typeof budget === 'object' && budget !== null && 'type' in budget;
};

export const formatJobBudget = (budget: number | JobBudget): string => {
  if (isJobBudgetObject(budget)) {
    const maxAmount = budget.maxAmount
      ? ` - ₺${budget.maxAmount.toLocaleString('tr-TR')}`
      : '';
    const suffix = budget.type === 'hourly' ? '/saat' : '';
    return `₺${budget.amount.toLocaleString('tr-TR')}${maxAmount}${suffix}`;
  }
  return `₺${budget.toLocaleString('tr-TR')}`;
};

export const getBudgetType = (
  budget: number | JobBudget
): 'fixed' | 'hourly' => {
  return isJobBudgetObject(budget) ? budget.type : 'fixed';
};

export const getBudgetAmount = (budget: number | JobBudget): number => {
  return isJobBudgetObject(budget) ? budget.amount : budget;
};
