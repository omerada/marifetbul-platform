/**
 * ================================================
 * AMOUNT DISTRIBUTION CALCULATOR
 * ================================================
 * Sprint 1 - Story 1.9
 * Helps distribute order amount evenly across milestones
 *
 * @author MarifetBul Development Team
 * @version 1.0.0
 */

// ================================================
// TYPES
// ================================================

export interface DistributionOptions {
  totalAmount: number;
  milestoneCount: number;
  roundTo?: number; // Default: 2 decimal places
}

export interface DistributionResult {
  amounts: number[];
  remainder: number;
  isExact: boolean;
}

// ================================================
// CALCULATOR FUNCTIONS
// ================================================

/**
 * Distribute amount evenly across milestones
 * Handles remainder by adding it to the last milestone
 */
export function distributeEvenly(
  options: DistributionOptions
): DistributionResult {
  const { totalAmount, milestoneCount, roundTo = 2 } = options;

  if (milestoneCount <= 0) {
    return { amounts: [], remainder: totalAmount, isExact: false };
  }

  // Calculate base amount per milestone
  const baseAmount = totalAmount / milestoneCount;
  const roundedBase = Number(baseAmount.toFixed(roundTo));

  // Create array of rounded amounts
  const amounts = Array(milestoneCount).fill(roundedBase);

  // Calculate remainder
  const calculatedTotal = roundedBase * milestoneCount;
  const remainder = Number((totalAmount - calculatedTotal).toFixed(roundTo));

  // Add remainder to last milestone if not zero
  if (Math.abs(remainder) > 0) {
    amounts[amounts.length - 1] = Number(
      (amounts[amounts.length - 1] + remainder).toFixed(roundTo)
    );
  }

  // Verify total matches
  const finalTotal = amounts.reduce((sum, amt) => sum + amt, 0);
  const isExact = Math.abs(finalTotal - totalAmount) < 0.01;

  return {
    amounts,
    remainder,
    isExact,
  };
}

/**
 * Distribute using percentage weights
 * e.g., [30, 40, 30] for 30%-40%-30% distribution
 */
export function distributeByPercentage(
  totalAmount: number,
  percentages: number[],
  roundTo: number = 2
): DistributionResult {
  const totalPercentage = percentages.reduce((sum, p) => sum + p, 0);

  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error('Percentages must sum to 100');
  }

  const amounts = percentages.map((percentage) => {
    const amount = (totalAmount * percentage) / 100;
    return Number(amount.toFixed(roundTo));
  });

  // Calculate and adjust for rounding errors
  const calculatedTotal = amounts.reduce((sum, amt) => sum + amt, 0);
  const remainder = Number((totalAmount - calculatedTotal).toFixed(roundTo));

  if (Math.abs(remainder) > 0) {
    amounts[amounts.length - 1] = Number(
      (amounts[amounts.length - 1] + remainder).toFixed(roundTo)
    );
  }

  const finalTotal = amounts.reduce((sum, amt) => sum + amt, 0);
  const isExact = Math.abs(finalTotal - totalAmount) < 0.01;

  return {
    amounts,
    remainder,
    isExact,
  };
}

/**
 * Common distribution presets
 */
export const DISTRIBUTION_PRESETS = {
  /** Equal distribution */
  EQUAL: 'equal',
  /** Front-loaded (30-25-20-15-10) */
  FRONT_LOADED: 'frontLoaded',
  /** Back-loaded (10-15-20-25-30) */
  BACK_LOADED: 'backLoaded',
  /** Bell curve (15-20-30-20-15) */
  BELL_CURVE: 'bellCurve',
} as const;

export type DistributionPreset =
  (typeof DISTRIBUTION_PRESETS)[keyof typeof DISTRIBUTION_PRESETS];

/**
 * Get predefined percentage distributions
 */
export function getPresetDistribution(
  preset: DistributionPreset,
  milestoneCount: number
): number[] {
  switch (preset) {
    case DISTRIBUTION_PRESETS.EQUAL:
      return Array(milestoneCount).fill(100 / milestoneCount);

    case DISTRIBUTION_PRESETS.FRONT_LOADED:
      if (milestoneCount === 2) return [60, 40];
      if (milestoneCount === 3) return [40, 35, 25];
      if (milestoneCount === 4) return [35, 30, 20, 15];
      if (milestoneCount === 5) return [30, 25, 20, 15, 10];
      // Default: decreasing by 10%
      return generateDecreasingPercentages(milestoneCount, 10);

    case DISTRIBUTION_PRESETS.BACK_LOADED:
      if (milestoneCount === 2) return [40, 60];
      if (milestoneCount === 3) return [25, 35, 40];
      if (milestoneCount === 4) return [15, 20, 30, 35];
      if (milestoneCount === 5) return [10, 15, 20, 25, 30];
      // Default: increasing by 10%
      return generateIncreasingPercentages(milestoneCount, 10);

    case DISTRIBUTION_PRESETS.BELL_CURVE:
      if (milestoneCount === 3) return [30, 40, 30];
      if (milestoneCount === 4) return [20, 30, 30, 20];
      if (milestoneCount === 5) return [15, 20, 30, 20, 15];
      // Default: equal
      return Array(milestoneCount).fill(100 / milestoneCount);

    default:
      return Array(milestoneCount).fill(100 / milestoneCount);
  }
}

/**
 * Generate decreasing percentages
 */
function generateDecreasingPercentages(count: number, step: number): number[] {
  const base = 100 / count;
  const adjustment = step / 2;

  return Array.from({ length: count }, (_, i) => {
    return base + adjustment - (step * i) / (count - 1);
  });
}

/**
 * Generate increasing percentages
 */
function generateIncreasingPercentages(count: number, step: number): number[] {
  const base = 100 / count;
  const adjustment = step / 2;

  return Array.from({ length: count }, (_, i) => {
    return base - adjustment + (step * i) / (count - 1);
  });
}

/**
 * Validate milestone amounts match order total
 */
export function validateTotalAmount(
  amounts: number[],
  expectedTotal: number,
  tolerance: number = 0.01
): { isValid: boolean; difference: number } {
  const actualTotal = amounts.reduce((sum, amount) => sum + amount, 0);
  const difference = Math.abs(actualTotal - expectedTotal);

  return {
    isValid: difference < tolerance,
    difference: Number(difference.toFixed(2)),
  };
}

/**
 * Auto-distribute amounts to milestone rows
 */
export function applyDistributionToMilestones(
  milestoneCount: number,
  totalAmount: number,
  preset: DistributionPreset = DISTRIBUTION_PRESETS.EQUAL
): number[] {
  const percentages = getPresetDistribution(preset, milestoneCount);
  const result = distributeByPercentage(totalAmount, percentages);

  if (!result.isExact && result.remainder > 0.01) {
    // Only warn for significant remainders
    if (
      typeof window !== 'undefined' &&
      process.env.NODE_ENV === 'development'
    ) {
      // eslint-disable-next-line no-console
      console.warn('[MilestoneDistribution] Distribution not exact', {
        remainder: result.remainder,
        totalAmount,
        milestoneCount,
      });
    }
  }

  return result.amounts;
}

const milestoneDistributionUtils = {
  distributeEvenly,
  distributeByPercentage,
  getPresetDistribution,
  validateTotalAmount,
  applyDistributionToMilestones,
  DISTRIBUTION_PRESETS,
};

export default milestoneDistributionUtils;
