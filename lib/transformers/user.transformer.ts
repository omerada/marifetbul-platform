/**
 * ================================================
 * USER TYPE TRANSFORMERS
 * ================================================
 * Transforms backend UserResponse to frontend User type
 */

import type { User } from '@/types/core/base';
import type { UserRole } from '@/types/backend-aligned';

// Backend user can have various shapes, so we use Record
type BackendUser = Record<string, unknown>;

/**
 * Transform backend UserResponse to frontend User type
 */
export function transformUserResponse(backendUser: BackendUser): User {
  // Handle both backend formats (with accountType or role)
  const userType = getUserType(backendUser);

  return {
    id: String(backendUser.id || ''),
    userId: String(backendUser.id || ''),
    email: String(backendUser.email || ''),
    username: backendUser.username as string | undefined,
    firstName: backendUser.firstName as string | undefined,
    lastName: backendUser.lastName as string | undefined,
    fullName:
      (backendUser.fullName as string) ||
      `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim(),
    name:
      (backendUser.fullName as string) ||
      `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim(),
    avatar:
      (backendUser.avatar as string | undefined) ||
      (backendUser.profilePictureUrl as string | undefined),
    avatarUrl:
      (backendUser.avatar as string | undefined) ||
      (backendUser.profilePictureUrl as string | undefined),
    profilePictureUrl:
      (backendUser.profilePictureUrl as string | undefined) ||
      (backendUser.avatar as string | undefined),
    userType, // Frontend uses userType
    role: mapAccountTypeToRole(
      (backendUser.accountType || backendUser.role) as string | undefined
    ) as UserRole,
    phone:
      (backendUser.phoneNumber as string | undefined) ||
      (backendUser.phone as string | undefined),
    location: backendUser.location as string | undefined,
    bio: backendUser.bio as string | undefined,
    website: backendUser.website as string | undefined,
    title: backendUser.title as string | undefined,
    createdAt: backendUser.createdAt as string | undefined,
    updatedAt: backendUser.updatedAt as string | undefined,
    accountStatus: mapVerificationStatus(
      backendUser.verified as boolean | undefined
    ),
    verificationStatus: backendUser.isEmailVerified ? 'verified' : 'unverified',
    lastLoginAt: backendUser.lastLoginAt as string | undefined,
    lastActiveAt: backendUser.lastActiveAt as string | undefined,
    // Stats
    followerCount: backendUser.followerCount as number | undefined,
    followingCount: backendUser.followingCount as number | undefined,
    isFollowedByCurrentUser: backendUser.isFollowedByCurrentUser as
      | boolean
      | undefined,
  };
}

/**
 * Get userType from backend user
 */
function getUserType(
  backendUser: BackendUser
): 'freelancer' | 'employer' | 'admin' {
  // Check accountType first (new backend format)
  const accountType = backendUser.accountType as string | undefined;
  if (accountType) {
    if (accountType === 'FREELANCER') return 'freelancer';
    if (accountType === 'EMPLOYER') return 'employer';
    if (accountType === 'BOTH') return 'freelancer'; // Default to freelancer for BOTH
  }

  // Check role (old backend format)
  const role = backendUser.role as string | undefined;
  if (role) {
    const normalized = role.toUpperCase();
    if (normalized === 'FREELANCER') return 'freelancer';
    if (normalized === 'EMPLOYER') return 'employer';
    if (normalized === 'ADMIN') return 'admin';
  }

  // Default fallback
  return 'freelancer';
}

/**
 * Map backend accountType/role to frontend role
 */
function mapAccountTypeToRole(
  accountType?: string
): 'FREELANCER' | 'EMPLOYER' | 'ADMIN' | 'MODERATOR' | undefined {
  if (!accountType) return undefined;

  const normalized = accountType.toUpperCase();

  if (normalized === 'FREELANCER') return 'FREELANCER';
  if (normalized === 'EMPLOYER') return 'EMPLOYER';
  if (normalized === 'ADMIN') return 'ADMIN';
  if (normalized === 'MODERATOR') return 'MODERATOR';
  if (normalized === 'BOTH') return 'FREELANCER';

  return undefined; // Unknown role
}

/**
 * Map verification status
 */
function mapVerificationStatus(
  verified?: boolean
): 'active' | 'suspended' | 'banned' {
  return verified ? 'active' : 'active'; // Default to active for now
}

/**
 * Transform array of backend users
 */
export function transformUserResponses(backendUsers: BackendUser[]): User[] {
  return backendUsers.map(transformUserResponse);
}

/**
 * Transform backend user to Freelancer type
 */
export function transformToFreelancer(backendUser: BackendUser) {
  const baseUser = transformUserResponse(backendUser);

  return {
    ...baseUser,
    userType: 'freelancer' as const,
    skills: (backendUser.skills as string[]) || [],
    hourlyRate: backendUser.hourlyRate as number | undefined,
    experience:
      (backendUser.experience as 'beginner' | 'intermediate' | 'expert') ||
      'beginner',
    rating: (backendUser.rating as number) || 0,
    totalReviews: (backendUser.reviewCount as number) || 0,
    reviewCount: (backendUser.reviewCount as number) || 0,
    totalEarnings: (backendUser.totalEarnings as number) || 0,
    completedJobs: (backendUser.completedOrders as number) || 0,
    completedProjects: (backendUser.completedOrders as number) || 0,
    responseTime: backendUser.responseTime as string | undefined,
    availability:
      (backendUser.availability as
        | 'available'
        | 'busy'
        | 'not_available'
        | boolean) || 'available',
  };
}

/**
 * Transform backend user to Employer type
 */
export function transformToEmployer(backendUser: BackendUser) {
  const baseUser = transformUserResponse(backendUser);

  const activeOrders = (backendUser.activeOrders as number) || 0;
  const completedOrders = (backendUser.completedOrders as number) || 0;

  return {
    ...baseUser,
    userType: 'employer' as const,
    companyName: backendUser.companyName as string | undefined,
    companySize: (backendUser.companySize as string) || 'startup',
    industry: backendUser.industry as string | undefined,
    totalSpent: (backendUser.totalSpent as number) || 0,
    activeJobs: activeOrders,
    completedJobs: completedOrders,
    totalJobs: activeOrders + completedOrders,
    rating: (backendUser.rating as number) || 0,
    totalReviews: (backendUser.reviewCount as number) || 0,
    reviewCount: (backendUser.reviewCount as number) || 0,
    reviewsCount: (backendUser.reviewCount as number) || 0,
    postedJobs: activeOrders + completedOrders,
  };
}
