// LEGACY AUTH HOOK - DEPRECATED
// Use useUnifiedAuthStore from @/lib/core/store/domains/auth/unifiedAuthStore instead
import { useCallback } from 'react';
import { authSelectors } from '@/lib/core/store/domains/auth/unifiedAuthStore';

type User = ReturnType<typeof authSelectors.useUser>;

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  userType: 'freelancer' | 'employer';
  role: 'freelancer' | 'employer' | 'admin';
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'freelancer' | 'employer';
  username?: string;
}

function convertToLegacyUser(user: User): AuthUser | null {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    avatar: user.avatar || undefined,
    isVerified: user.verificationStatus === 'verified',
    userType: user.userType as 'freelancer' | 'employer',
    role: user.role as 'freelancer' | 'employer' | 'admin',
  };
}

export function useAuthState(): AuthState & {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
} {
  const storeUser = authSelectors.useUser();
  const isAuthenticated = authSelectors.useIsAuthenticated();
  const isLoading = authSelectors.useIsLoading();
  const error = authSelectors.useError();
  const {
    login: storeLogin,
    register: storeRegister,
    logout: storeLogout,
    updateProfile: storeUpdateProfile,
  } = authSelectors.useActions();

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      await storeLogin(credentials);
    },
    [storeLogin]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      const username = data.username || data.email.split('@')[0];
      await storeRegister({ ...data, username });
    },
    [storeRegister]
  );

  const logout = useCallback(async () => {
    await storeLogout();
  }, [storeLogout]);

  const updateUser = useCallback(
    (userData: Partial<AuthUser>) => {
      const profileData = {
        firstName: userData.name?.split(' ')[0],
        lastName: userData.name?.split(' ').slice(1).join(' '),
        avatar: userData.avatar,
      };
      storeUpdateProfile(profileData).catch((err) => {
        console.error('[useAuth] Failed to update profile:', err);
      });
    },
    [storeUpdateProfile]
  );

  const legacyUser = convertToLegacyUser(storeUser);

  return {
    user: legacyUser,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
  };
}

export const useAuth = useAuthState;
