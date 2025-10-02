// ================================================
// USER REPOSITORY
// ================================================
// Repository for user-related API operations

import {
  BaseRepository,
  PaginatedResult,
  SearchOptions,
} from './BaseRepository';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isVerified: boolean;
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  rating: number;
  reviewCount: number;
  joinedAt: string;
  lastActive: string;
  profile?: UserProfile;
  settings?: UserSettings;
}

export interface UserProfile {
  bio?: string;
  skills: string[];
  portfolio: string[];
  location?: string;
  timezone?: string;
  languages: string[];
  hourlyRate?: number;
  availability: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
}

export interface UserSettings {
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  preferences: UserPreferences;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
}

export interface PrivacySettings {
  profileVisible: boolean;
  showEmail: boolean;
  showLocation: boolean;
  allowMessages: boolean;
}

export interface UserPreferences {
  language: string;
  timezone: string;
}

export interface CreateUserData {
  email: string;
  password: string;
  username: string;
  firstName: string;
  lastName: string;
  role?: 'USER' | 'ADMIN' | 'MODERATOR';
}

export interface UpdateUserData {
  email?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  profile?: Partial<UserProfile>;
  settings?: Partial<UserSettings>;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  verifiedUsers: number;
  topRatedUsers: User[];
}

class UserRepository extends BaseRepository<
  User,
  CreateUserData,
  UpdateUserData
> {
  protected readonly baseEndpoint = '/users';

  constructor() {
    super('user');
  }

  // ================================================
  // USER-SPECIFIC METHODS
  // ================================================

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await this.customQuery<User>(
        `by-email/${encodeURIComponent(email)}`
      );
    } catch {
      return null;
    }
  }

  async findByUsername(username: string): Promise<User | null> {
    try {
      return await this.customQuery<User>(
        `by-username/${encodeURIComponent(username)}`
      );
    } catch {
      return null;
    }
  }

  async getCurrentUser(): Promise<User> {
    return this.customQuery<User>('me');
  }

  async updateCurrentUser(data: UpdateUserData): Promise<User> {
    return this.customQuery<User>('me', 'PUT', data);
  }

  async deleteCurrentUser(): Promise<void> {
    await this.customQuery<void>('me', 'DELETE');
  }

  // ================================================
  // PROFILE MANAGEMENT
  // ================================================

  async updateProfile(
    userId: string,
    profile: Partial<UserProfile>
  ): Promise<User> {
    return this.customQuery<User>(`${userId}/profile`, 'PUT', profile);
  }

  async updateSettings(
    userId: string,
    settings: Partial<UserSettings>
  ): Promise<User> {
    return this.customQuery<User>(`${userId}/settings`, 'PUT', settings);
  }

  async uploadAvatar(userId: string, file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.customQuery<User>(`${userId}/avatar`, 'POST', formData, {
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  // ================================================
  // USER VERIFICATION
  // ================================================

  async verifyUser(userId: string): Promise<User> {
    return this.customQuery<User>(`${userId}/verify`, 'POST');
  }

  async unverifyUser(userId: string): Promise<User> {
    return this.customQuery<User>(`${userId}/unverify`, 'POST');
  }

  async requestVerification(): Promise<void> {
    await this.customQuery<void>('me/request-verification', 'POST');
  }

  // ================================================
  // USER SEARCH & FILTERING
  // ================================================

  async searchUsers(
    options: SearchOptions & {
      skills?: string[];
      location?: string;
      minRating?: number;
      availability?: string;
      hourlyRateMin?: number;
      hourlyRateMax?: number;
    }
  ): Promise<User[]> {
    return this.search(options);
  }

  async searchUsersPaginated(
    options: SearchOptions & {
      skills?: string[];
      location?: string;
      minRating?: number;
      availability?: string;
      hourlyRateMin?: number;
      hourlyRateMax?: number;
    }
  ): Promise<PaginatedResult<User>> {
    return this.searchPaginated(options);
  }

  async getTopRatedUsers(limit: number = 10): Promise<User[]> {
    return this.customQuery<User[]>(`top-rated?limit=${limit}`);
  }

  async getRecentlyJoined(limit: number = 10): Promise<User[]> {
    return this.customQuery<User[]>(`recently-joined?limit=${limit}`);
  }

  // ================================================
  // USER STATISTICS
  // ================================================

  async getUserStats(): Promise<UserStats> {
    return this.customQuery<UserStats>('stats');
  }

  async getUserActivity(
    userId: string,
    days: number = 30
  ): Promise<Record<string, number>> {
    return this.customQuery<Record<string, number>>(
      `${userId}/activity?days=${days}`
    );
  }

  // ================================================
  // USER RELATIONSHIPS
  // ================================================

  async followUser(userId: string): Promise<void> {
    await this.customQuery<void>(`${userId}/follow`, 'POST');
  }

  async unfollowUser(userId: string): Promise<void> {
    await this.customQuery<void>(`${userId}/unfollow`, 'POST');
  }

  async getFollowers(userId: string): Promise<User[]> {
    return this.customQuery<User[]>(`${userId}/followers`);
  }

  async getFollowing(userId: string): Promise<User[]> {
    return this.customQuery<User[]>(`${userId}/following`);
  }

  async blockUser(userId: string): Promise<void> {
    await this.customQuery<void>(`${userId}/block`, 'POST');
  }

  async unblockUser(userId: string): Promise<void> {
    await this.customQuery<void>(`${userId}/unblock`, 'POST');
  }

  async getBlockedUsers(): Promise<User[]> {
    return this.customQuery<User[]>('me/blocked');
  }

  // ================================================
  // USER SKILLS & EXPERTISE
  // ================================================

  async addSkill(userId: string, skill: string): Promise<User> {
    return this.customQuery<User>(`${userId}/skills`, 'POST', { skill });
  }

  async removeSkill(userId: string, skill: string): Promise<User> {
    return this.customQuery<User>(
      `${userId}/skills/${encodeURIComponent(skill)}`,
      'DELETE'
    );
  }

  async getSkillSuggestions(query: string): Promise<string[]> {
    return this.customQuery<string[]>(
      `skills/suggestions?q=${encodeURIComponent(query)}`
    );
  }

  // ================================================
  // USER RATINGS & REVIEWS
  // ================================================

  async rateUser(
    userId: string,
    rating: number,
    comment?: string
  ): Promise<void> {
    await this.customQuery<void>(`${userId}/rate`, 'POST', { rating, comment });
  }

  async getUserRatings(userId: string): Promise<
    PaginatedResult<{
      id: string;
      rating: number;
      comment?: string;
      reviewer: User;
      createdAt: string;
    }>
  > {
    return this.customQuery<
      PaginatedResult<{
        id: string;
        rating: number;
        comment?: string;
        reviewer: User;
        createdAt: string;
      }>
    >(`${userId}/ratings`);
  }

  // ================================================
  // ADMIN OPERATIONS
  // ================================================

  async suspendUser(
    userId: string,
    reason: string,
    duration?: number
  ): Promise<User> {
    return this.customQuery<User>(`${userId}/suspend`, 'POST', {
      reason,
      duration,
    });
  }

  async unsuspendUser(userId: string): Promise<User> {
    return this.customQuery<User>(`${userId}/unsuspend`, 'POST');
  }

  async changeUserRole(
    userId: string,
    role: 'USER' | 'ADMIN' | 'MODERATOR'
  ): Promise<User> {
    return this.customQuery<User>(`${userId}/role`, 'PUT', { role });
  }

  async getModerationQueue(): Promise<User[]> {
    return this.customQuery<User[]>('moderation-queue');
  }
}

// Export singleton instance
export const userRepository = new UserRepository();
export default userRepository;
