/**
 * Core Type Exports
 * @module types/core
 * @description Exports all core types used throughout the application
 */

// Base types (User, Freelancer, Employer, LocationData, etc.)
export * from './base';

// API response types - using explicit exports to avoid conflicts
export type { ApiError, ValidationError } from './api';

// Common types
export * from './common';

// Dashboard types (moved from Sprint 1)
export * from './dashboard';
