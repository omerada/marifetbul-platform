/**
 * Core Common Types
 * @module types/core/common
 * @description Common types used across the application
 */

/**
 * Supported currencies in the platform
 */
export type Currency = 'TRY' | 'USD' | 'EUR';

/**
 * Generic status type
 */
export type Status = 'active' | 'inactive' | 'pending' | 'suspended';

/**
 * Generic priority level
 */
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Visibility settings
 */
export type Visibility = 'public' | 'private' | 'unlisted';

/**
 * Generic ID type
 */
export type ID = string | number;

/**
 * Timestamp type (ISO 8601 string or Date)
 */
export type Timestamp = string | Date;
