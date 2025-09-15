/**
 * Repository Layer Index - SIMPLIFIED
 * Exports clean, modern repositories and removes legacy complexity
 */

// Base repository functionality
export {
  default as BaseRepository,
  type Repository,
  type PaginatedResult,
  type SearchOptions,
} from './BaseRepository';

// Unified API client
export {
  unifiedApiClient,
  type ApiResponse,
  type RequestConfig,
} from '../api/UnifiedApiClient';

// Domain Repositories - New Unified Repositories
export {
  default as userRepository,
  type User,
  type CreateUserData,
  type UpdateUserData,
} from './UserRepository';
export {
  default as jobRepository,
  type Job,
  type CreateJobData,
  type UpdateJobData,
} from './JobRepository';
export {
  default as packageRepository,
  type Package,
  type CreatePackageData,
  type UpdatePackageData,
} from './PackageRepository';

// Import repositories
import userRepository from './UserRepository';
import jobRepository from './JobRepository';
import packageRepository from './PackageRepository';

// Unified repository collection - SIMPLIFIED
export const repositories = {
  user: userRepository,
  job: jobRepository,
  package: packageRepository,
} as const;

export default repositories;
