/**
 * Profile Completion Types
 * Sprint 1 - Story 1.1: Profile Completion System
 *
 * Type definitions for profile completion system
 *
 * @version 1.0.0
 * @since 2025-11-25
 */

export enum ProfileStrength {
  WEAK = 'WEAK',
  MEDIUM = 'MEDIUM',
  STRONG = 'STRONG',
}

export interface ProfileCompletionData {
  /** Completion percentage (0-100) */
  completionPercentage: number;

  /** Whether all mandatory fields are complete */
  mandatoryFieldsComplete: boolean;

  /** List of missing field names */
  missingFields: string[];

  /** List of completed field names */
  completedFields: string[];

  /** Next recommended field to complete */
  nextRecommendedField: string | null;

  /** Total number of fields */
  totalFields: number;

  /** Number of completed fields */
  completedFieldsCount: number;

  /** Profile strength indicator */
  strength: ProfileStrength;

  /** Role-specific suggestions */
  suggestions: string[];
}

/**
 * Field info for completion display
 */
export interface ProfileFieldInfo {
  field: string;
  label: string;
  icon?: string;
  route?: string;
  weight: number;
  isMandatory: boolean;
}
